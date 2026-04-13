# TikTok Nation Race — Project Overview

> **Last updated:** 2026-04-12
> **Purpose:** Context file for AI assistants. Link this in new conversations to quickly understand the project.

## What Is This?

A real-time interactive **TikTok Live game** where viewers donate gifts to move their nation's flag along a 3D race track. The first nation to reach the finish line wins. Built with a cyberpunk/neon aesthetic.

---

## Architecture

```
┌─────────────────────┐     WebSocket      ┌───────────────────────┐
│   TikTok Live API   │ ─────────────────► │    Backend (3001)     │
│ (tiktok-live-conn)  │                    │  Express + Socket.IO  │
└─────────────────────┘                    └──────────┬────────────┘
                                                      │
                                            Socket.IO │ REST API
                                                      │
                                           ┌──────────▼────────────┐
                                           │   Frontend (5173)     │
                                           │  React + Vite + R3F   │
                                           └───────────────────────┘
```

### Backend (`/Backend` — Port 3001)

| File | Role |
|------|------|
| `src/index.ts` | Express + Socket.IO bootstrap; bridges events between services |
| `src/TikTokService.ts` | Connects to TikTok Live via `tiktok-live-connector`. Emits: `gift`, `follow`, `share`, `like`, `chat`, `member`, `viewers`, `disconnected` |
| `src/GameManager.ts` | Core game logic singleton. Manages teams, positions, donors, win history. Emits: `move`, `winner`, `stateChange`, `clearInteractiveData` |
| `src/MockService.ts` | Generates fake gifts at intervals for testing without TikTok |
| `src/routes/api.ts` | REST endpoints (see API table below) |

**Key dependencies:** `express@5`, `socket.io@4`, `tiktok-live-connector@2.1.1-beta1`

### Frontend (`/Frontend` — Port 5173)

| Path | Role |
|------|------|
| `src/App.tsx` | Root with `BrowserRouter`, socket init, socket listener |
| `src/screens/SettingsScreen.tsx` | Route `/` — TikTok connection, nation selection, gift mapping, track config |
| `src/screens/RaceScreen.tsx` | Route `/race` — 3D race view, progress overlay, sidebar (donors/likes/wins/livefeed), hotkey donations |
| `src/screens/LeaderboardScreen.tsx` | Route `/leaderboard` — Win history |
| `src/stores/useGameStore.ts` | Zustand store: game state, teams, toasts, recentGifts, topLikers |
| `src/stores/useSocketStore.ts` | Zustand store: socket connection, TikTok status, viewerCount |
| `src/hooks/useSocketListener.ts` | Bridges Socket.IO events → Zustand stores |
| `src/lib/api.ts` | REST client (typed fetch wrappers) |
| `src/lib/gifts.ts` | _(Legacy)_ Hardcoded gift data — **not used**. Gifts are fetched live from TikTok API after connecting |
| `src/lib/countries.ts` | 17 nations with flag images from `flag-icons` |
| `src/lib/tts.ts` | Text-to-Speech for chat comments (google-tts-api, franc-min for language detection) |
| `src/types/index.ts` | Shared TypeScript interfaces |
| `src/components/3d/` | 8 React Three Fiber components (RaceScene3D, FlagRunner3D, FinishLine3D, etc.) |
| `src/components/` | LiveFeed, GiftPopup, RaceTrack, WinnerOverlay, GlitchText, ScanlineOverlay |

**Key dependencies:** `react@19`, `vite@8`, `three` + `@react-three/fiber` + `@react-three/drei`, `zustand@5`, `framer-motion`, `gsap`, `tailwindcss@4`, `socket.io-client`, `react-router-dom@7`

---

## REST API (`/api/*`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/connect` | Connect to TikTok Live (body: `{username}`) |
| POST | `/disconnect` | Disconnect from TikTok |
| GET | `/status` | Get TikTok, game, and mock status |
| GET | `/tiktok/gifts` | Get available gifts from connected stream |
| POST | `/game/setup` | Configure teams + trackLength |
| POST | `/game/start` | Start the race |
| POST | `/game/reset` | Reset positions (keep config) |
| POST | `/game/full-reset` | Clear everything |
| GET | `/game/state` | Current game state |
| GET | `/game/leaderboard` | Win history |
| DELETE | `/game/leaderboard` | Clear win history |
| POST | `/game/manual-gift` | Simulate a donation (body: `{teamId}`) — used by hotkey system |
| POST | `/game/clear-interactive-data` | Clear donors & likes |
| POST | `/mock/start-gifts` | Start auto-generating fake gifts |
| POST | `/mock/stop-gifts` | Stop mock mode |

---

## Socket.IO Events (Server → Client)

| Event | Payload | When |
|-------|---------|------|
| `init` | `GameState` | Client connects |
| `game:stateChange` | `GameState` | Setup, start, reset |
| `game:move` | `MoveEvent` | Team position updated by gift |
| `game:winner` | `WinnerEvent` | A team reaches finish line |
| `game:clearInteractiveData` | — | Donors/likes cleared |
| `tiktok:status` | `{connected, username}` | TikTok connect/disconnect |
| `tiktok:follow` | `TikTokUserEvent` | Viewer follows |
| `tiktok:share` | `TikTokUserEvent` | Viewer shares |
| `tiktok:like` | `TikTokUserEvent` | Viewer likes |
| `tiktok:chat` | `TikTokUserEvent` | Chat message |
| `tiktok:viewers` | `{viewerCount}` | Viewer count update |

---

## Key Data Types

```typescript
// Team setup config (sent from frontend to backend)
interface TeamConfig {
  id: string;          // country code (e.g. 'vn')
  name: string;        // 'Vietnam'
  flag: string;        // '🇻🇳'
  flagImage: string;   // SVG from flag-icons
  color: string;       // hex color
  giftId: number;      // TikTok gift ID mapped to this team
  giftName: string;    // 'Rose'
  giftImageUrl?: string; // CDN image URL
  giftEmoji?: string;  // '🌹' (fallback display)
}

// Game state machine
type GameStatus = 'idle' | 'configuring' | 'racing' | 'finished';

// Move event (emitted when a gift is processed)
interface MoveEvent {
  teamId: string; teamName: string; teamFlag: string; teamColor: string;
  newPosition: number; trackLength: number; percentage: number;
  giftData: { giftName, userName, userAvatar, steps, giftImageUrl?, giftEmoji? };
}
```

---

## Game Flow

1. **Idle** → User opens Settings (`/`)
2. **Configuring** → User connects TikTok (optional), selects nations, maps gifts, sets track length → clicks "Start Race" or "Mock Mode"
3. **Racing** → Gifts from TikTok Live (or mock/hotkey) call `processGift()` → team positions update → 3D flags move → live feed shows events
4. **Finished** → First team to reach `trackLength` wins → winner overlay + celebration → user can reset

## Hotkey System

Number keys `1-0` map to nations in order. Pressing a key sends a manual fake donation to that nation's team (via `POST /api/game/manual-gift`). Has 300ms debounce.

## Mock Mode

Backend generates random fake gifts every 600ms for testing without TikTok.

---

## File Structure

```
Backend/
  src/
    index.ts              # Server entry + event bridge
    TikTokService.ts      # TikTok Live connector
    GameManager.ts        # Game state machine
    MockService.ts        # Fake gift generator
    routes/api.ts         # REST API

Frontend/
  src/
    App.tsx               # Root + routing
    main.tsx              # Vite entry
    index.css             # Global CSS (cyberpunk theme)
    screens/
      SettingsScreen.tsx   # Config (/)
      RaceScreen.tsx       # Race (/race)
      LeaderboardScreen.tsx # History (/leaderboard)
    components/
      LiveFeed.tsx          GiftPopup.tsx
      RaceTrack.tsx         WinnerOverlay.tsx
      GlitchText.tsx        ScanlineOverlay.tsx
      3d/
        RaceScene3D.tsx     FlagRunner3D.tsx
        FinishLine3D.tsx    StartLine3D.tsx
        RaceGround.tsx      FruitProjectile3D.tsx
        NeonShatterParticles.tsx  WinnerScene3D.tsx
    stores/
      useGameStore.ts      # Zustand: game data
      useSocketStore.ts    # Zustand: socket + TikTok status
    hooks/
      useSocketListener.ts # Socket events → stores
    lib/
      api.ts               # REST fetch client
      countries.ts         # 17 nations
      gifts.ts             # 20 fallback TikTok gifts
      tts.ts               # Text-to-Speech
    types/
      index.ts             # Shared TS interfaces
```

---

## Design

- **Theme:** Cyberpunk / neon with scanline CRT overlay
- **CSS Variables:** `--accent` (green), `--accent-secondary` (cyan), `--accent-tertiary` (pink), `--destructive` (red), `--gold`
- **Fonts:** `var(--font-heading)`, `var(--font-label)` (monospace-style)
- **3D:** React Three Fiber with custom shaders, GSAP animations, neon glow effects
