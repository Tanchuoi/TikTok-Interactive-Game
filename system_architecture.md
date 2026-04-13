# 🏗️ System Architecture — TikTok Nation Race

## 1. Tổng quan hệ thống (High-Level Overview)

```mermaid
graph TB
    subgraph External["☁️ External Services"]
        TikTokAPI["🎵 TikTok Live API<br/>(tiktok-live-connector)"]
        GoogleTTS["🔊 Google TTS API"]
    end

    subgraph Backend["⚙️ Backend (Node.js + Express)"]
        Server["🖥️ HTTP Server<br/>Express + Socket.IO<br/>Port 3001"]
        TikTokSvc["📡 TikTokService<br/>(EventEmitter)"]
        GameMgr["🧠 GameManager<br/>(EventEmitter)"]
        MockSvc["🎭 MockService"]
        APIRoutes["🛣️ REST API Routes<br/>/api/*"]
    end

    subgraph Frontend["🎨 Frontend (React + Vite)"]
        ReactApp["⚛️ React App<br/>Port 5173"]
        SocketStore["🔌 useSocketStore<br/>(Zustand)"]
        GameStore["🎮 useGameStore<br/>(Zustand)"]
        SocketHook["🎣 useSocketListener<br/>(Hook)"]
        Screens["📱 Screens"]
        Components["🧩 Components"]
        ThreeJS["🎲 3D Engine<br/>(React Three Fiber)"]
    end

    TikTokAPI -->|"WebSocket<br/>Live Events"| TikTokSvc
    TikTokSvc -->|"gift, follow, share<br/>like, chat, member"| Server
    Server -->|"Socket.IO<br/>WebSocket"| SocketStore
    ReactApp -->|"REST API<br/>HTTP Fetch"| APIRoutes
    GameMgr -->|"move, winner<br/>stateChange"| Server
    MockSvc -->|"processGift()"| GameMgr
    GoogleTTS -.->|"Audio URL"| ReactApp

    style External fill:#1a1a2e,stroke:#e94560,color:#fff
    style Backend fill:#16213e,stroke:#0f3460,color:#fff
    style Frontend fill:#1a1a2e,stroke:#533483,color:#fff
```

---

## 2. Backend Architecture

```mermaid
graph LR
    subgraph EntryPoint["📦 index.ts (Bootstrap)"]
        Express["Express App"]
        HTTP["HTTP Server"]
        IO["Socket.IO Server"]
    end

    subgraph Services["🔧 Core Services"]
        TS["TikTokService<br/>━━━━━━━━━━━━<br/>• connect(username)<br/>• disconnect()<br/>• getAvailableGifts()<br/>• getStatus()"]
        GM["GameManager<br/>━━━━━━━━━━━━<br/>• setupGame(config)<br/>• startGame()<br/>• processGift(data)<br/>• resetGame()<br/>• fullReset()<br/>• clearDonors()<br/>• clearWinHistory()"]
        MS["MockService<br/>━━━━━━━━━━━━<br/>• startMocking(interval)<br/>• stopMocking()<br/>• getStatus()"]
    end

    subgraph Routes["🛣️ routes/api.ts"]
        R1["POST /api/connect"]
        R2["POST /api/disconnect"]
        R3["GET  /api/status"]
        R4["GET  /api/tiktok/gifts"]
        R5["POST /api/game/setup"]
        R6["POST /api/game/start"]
        R7["POST /api/game/reset"]
        R8["POST /api/game/full-reset"]
        R9["GET  /api/game/state"]
        R10["GET  /api/game/leaderboard"]
        R11["DEL  /api/game/leaderboard"]
        R12["POST /api/game/manual-gift"]
        R13["POST /api/mock/start-gifts"]
        R14["POST /api/mock/stop-gifts"]
        R15["POST /api/game/clear-interactive-data"]
    end

    Express --> Routes
    HTTP --> IO
    TS --> GM
    MS --> GM

    style EntryPoint fill:#0f3460,stroke:#e94560,color:#fff
    style Services fill:#16213e,stroke:#0f3460,color:#fff
    style Routes fill:#1a1a2e,stroke:#533483,color:#fff
```

### Backend Event Flow (EventEmitter Pattern)

```mermaid
sequenceDiagram
    participant TikTok as 🎵 TikTok Live
    participant TS as 📡 TikTokService
    participant GM as 🧠 GameManager
    participant IO as 🔌 Socket.IO
    participant FE as 🎨 Frontend

    Note over TikTok,FE: Gift Donation Flow
    TikTok->>TS: WebcastEvent.GIFT
    TS->>TS: Parse gift data<br/>(giftId, user, diamonds)
    TS-->>IO: emit('gift', giftData)
    IO->>GM: processGift(giftData)
    GM->>GM: Update team position<br/>Update donors list
    GM-->>IO: emit('move', moveEvent)
    IO->>FE: socket.emit('game:move')

    Note over TikTok,FE: Winner Detection
    GM->>GM: position >= trackLength?
    GM-->>IO: emit('winner', winnerEvent)
    IO->>FE: socket.emit('game:winner')

    Note over TikTok,FE: Social Events (follow, share, like, chat)
    TikTok->>TS: WebcastEvent.FOLLOW/SHARE/LIKE/CHAT
    TS-->>IO: emit('follow'/'share'/'like'/'chat')
    IO->>FE: socket.emit('tiktok:*')
```

---

## 3. Frontend Architecture

```mermaid
graph TB
    subgraph App["⚛️ App.tsx (Root)"]
        BR["BrowserRouter"]
        SL["useSocketListener()"]
        SO["ScanlineOverlay"]
    end

    subgraph Screens["📱 Screens"]
        SS["SettingsScreen<br/>━━━━━━━━━━━━<br/>• TikTok connection<br/>• Team config (nations)<br/>• Gift mapping<br/>• Track length<br/>• Hotkey config<br/>Route: /"]
        RS["RaceScreen<br/>━━━━━━━━━━━━<br/>• 3D race track<br/>• Live feed<br/>• Leaderboard<br/>• Gift popups<br/>• Hotkey listener<br/>Route: /race"]
        LS["LeaderboardScreen<br/>━━━━━━━━━━━━<br/>• Win history<br/>• Nation rankings<br/>Route: /leaderboard"]
    end

    subgraph Components["🧩 UI Components"]
        LF["LiveFeed"]
        GP["GiftPopup"]
        RT["RaceTrack"]
        WO["WinnerOverlay"]
        GT["GlitchText"]
    end

    subgraph ThreeD["🎲 3D Components (R3F)"]
        RS3D["RaceScene3D"]
        FR["FlagRunner3D"]
        FL["FinishLine3D"]
        SL3D["StartLine3D"]
        RG["RaceGround"]
        FP["FruitProjectile3D"]
        NSP["NeonShatterParticles"]
        WS3D["WinnerScene3D"]
    end

    subgraph State["📊 State Management (Zustand)"]
        GSt["useGameStore<br/>━━━━━━━━━━━━<br/>• status, teams<br/>• trackLength, winner<br/>• standings, winHistory<br/>• toasts, recentGifts<br/>• topLikers"]
        SSt["useSocketStore<br/>━━━━━━━━━━━━<br/>• socket instance<br/>• isConnected<br/>• tiktokConnected<br/>• tiktokUsername<br/>• viewerCount"]
    end

    subgraph Lib["📚 Libraries"]
        API["lib/api.ts<br/>(REST client)"]
        Countries["lib/countries.ts"]
        Gifts["lib/gifts.ts"]
        TTS["lib/tts.ts"]
    end

    BR --> SS
    BR --> RS
    BR --> LS
    RS --> Components
    RS --> ThreeD
    SL --> State
    Screens --> State
    Screens --> Lib

    style App fill:#533483,stroke:#e94560,color:#fff
    style Screens fill:#16213e,stroke:#0f3460,color:#fff
    style Components fill:#1a1a2e,stroke:#533483,color:#fff
    style ThreeD fill:#0f3460,stroke:#e94560,color:#fff
    style State fill:#1a1a2e,stroke:#e94560,color:#fff
    style Lib fill:#16213e,stroke:#533483,color:#fff
```

---

## 4. Giao tiếp giữa Frontend & Backend

### 4.1 REST API (HTTP)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `POST` | `/api/connect` | Kết nối TikTok Live stream |
| `POST` | `/api/disconnect` | Ngắt kết nối TikTok |
| `GET` | `/api/status` | Lấy trạng thái TikTok, Game, Mock |
| `GET` | `/api/tiktok/gifts` | Lấy danh sách gift có sẵn |
| `POST` | `/api/game/setup` | Cấu hình game (teams, trackLength) |
| `POST` | `/api/game/start` | Bắt đầu cuộc đua |
| `POST` | `/api/game/reset` | Reset vị trí, trở lại configuring |
| `POST` | `/api/game/full-reset` | Reset toàn bộ trò chơi |
| `GET` | `/api/game/state` | Lấy trạng thái game hiện tại |
| `GET` | `/api/game/leaderboard` | Lấy lịch sử chiến thắng |
| `DELETE` | `/api/game/leaderboard` | Xóa lịch sử chiến thắng |
| `POST` | `/api/game/manual-gift` | Gửi gift thủ công (hotkey) |
| `POST` | `/api/game/clear-interactive-data` | Xóa donors & likes |
| `POST` | `/api/mock/start-gifts` | Bật chế độ mock |
| `POST` | `/api/mock/stop-gifts` | Tắt chế độ mock |

### 4.2 WebSocket Events (Socket.IO)

```mermaid
graph LR
    subgraph ServerToClient["📤 Server → Client"]
        E1["init"]
        E2["game:stateChange"]
        E3["game:move"]
        E4["game:winner"]
        E5["game:clearInteractiveData"]
        E6["tiktok:status"]
        E7["tiktok:follow"]
        E8["tiktok:share"]
        E9["tiktok:like"]
        E10["tiktok:chat"]
        E11["tiktok:viewers"]
        E12["tiktok:member"]
    end

    style ServerToClient fill:#16213e,stroke:#0f3460,color:#fff
```

| Event | Hướng | Payload | Mô tả |
|-------|-------|---------|--------|
| `init` | Server→Client | `GameState` | Gửi trạng thái game khi client kết nối |
| `game:stateChange` | Server→Client | `GameState` | Game state thay đổi (setup, start, reset) |
| `game:move` | Server→Client | `MoveEvent` | Đội di chuyển do nhận gift |
| `game:winner` | Server→Client | `WinnerEvent` | Có đội chiến thắng |
| `game:clearInteractiveData` | Server→Client | - | Xóa dữ liệu tương tác |
| `tiktok:status` | Server→Client | `{connected, username}` | Trạng thái kết nối TikTok |
| `tiktok:follow` | Server→Client | `TikTokUserEvent` | Có người follow |
| `tiktok:share` | Server→Client | `TikTokUserEvent` | Có người share |
| `tiktok:like` | Server→Client | `TikTokUserEvent` | Có người like |
| `tiktok:chat` | Server→Client | `TikTokUserEvent` | Tin nhắn chat |
| `tiktok:viewers` | Server→Client | `{viewerCount}` | Cập nhật số viewers |

---

## 5. Data Flow — Luồng xử lý chính

```mermaid
flowchart TD
    A["🎵 Viewer gửi Gift<br/>trên TikTok Live"] --> B["📡 TikTokService<br/>nhận gift event"]
    B --> C{"Gift thuộc<br/>team nào?"}
    C -->|"Khớp giftId"| D["🧠 GameManager<br/>processGift()"]
    C -->|"Không khớp"| X["❌ Bỏ qua"]
    D --> E["📊 Cập nhật position<br/>+= repeatCount"]
    D --> F["👤 Cập nhật donors<br/>list cho team"]
    E --> G{"position ≥<br/>trackLength?"}
    G -->|"Chưa"| H["📤 emit('move')"]
    G -->|"Rồi!"| I["🏆 emit('winner')"]
    H --> J["🔌 Socket.IO<br/>gửi đến Frontend"]
    I --> J
    J --> K["🎨 React cập nhật<br/>Zustand Store"]
    K --> L["🎲 3D Scene render<br/>vị trí mới"]
    K --> M["📢 Toast notification<br/>hiển thị"]

    style A fill:#e94560,stroke:#1a1a2e,color:#fff
    style D fill:#0f3460,stroke:#e94560,color:#fff
    style I fill:#ffd700,stroke:#1a1a2e,color:#000
    style L fill:#533483,stroke:#e94560,color:#fff
```

---

## 6. Game State Machine

```mermaid
stateDiagram-v2
    [*] --> idle: App khởi động

    idle --> configuring: setupGame()<br/>Cấu hình teams & gifts

    configuring --> racing: startGame()<br/>Bắt đầu cuộc đua

    racing --> finished: Team position ≥ trackLength<br/>🏆 Có đội chiến thắng!

    finished --> configuring: resetGame()<br/>Giữ config, reset vị trí

    configuring --> idle: fullReset()<br/>Xóa toàn bộ

    finished --> idle: fullReset()

    racing --> configuring: resetGame()<br/>(Hủy giữa chừng)
```

---

## 7. Tech Stack Summary

| Layer | Công nghệ | Phiên bản |
|-------|-----------|-----------|
| **Runtime** | Node.js | - |
| **Backend Framework** | Express | 5.1.0 |
| **Realtime** | Socket.IO | 4.8.x |
| **TikTok Integration** | tiktok-live-connector | 2.1.1-beta1 |
| **Frontend Framework** | React | 19.2.x |
| **Build Tool** | Vite | 8.0.x |
| **Styling** | TailwindCSS | 4.2.x |
| **State Management** | Zustand | 5.0.x |
| **3D Rendering** | Three.js + React Three Fiber | 0.183.x |
| **Animation** | Framer Motion + GSAP | 12.x / 3.14.x |
| **Routing** | React Router DOM | 7.14.x |
| **Language** | TypeScript | 5.9.x |
| **Icons** | Lucide React + flag-icons | - |
| **TTS** | google-tts-api | 2.0.2 |
| **Language Detection** | franc-min | 6.2.0 |
| **Notifications** | Sonner | 2.0.7 |

---

## 8. Cấu trúc thư mục

```
TikTok-Interactive-Game/
├── Backend/
│   ├── src/
│   │   ├── index.ts              # Server bootstrap (Express + Socket.IO)
│   │   ├── TikTokService.ts      # TikTok Live stream connector
│   │   ├── GameManager.ts        # Game logic & state machine
│   │   ├── MockService.ts        # Fake gift generator for testing
│   │   └── routes/
│   │       └── api.ts            # REST API endpoints
│   ├── package.json
│   └── tsconfig.json
│
└── Frontend/
    ├── src/
    │   ├── main.tsx              # Vite entry point
    │   ├── App.tsx               # Root component + routing
    │   ├── index.css             # Global styles (cyberpunk theme)
    │   ├── screens/
    │   │   ├── SettingsScreen.tsx # Config UI (TikTok, teams, gifts)
    │   │   ├── RaceScreen.tsx    # Main race view + 3D
    │   │   └── LeaderboardScreen.tsx # Win history
    │   ├── components/
    │   │   ├── LiveFeed.tsx      # Real-time event feed
    │   │   ├── GiftPopup.tsx     # Gift notification popup
    │   │   ├── RaceTrack.tsx     # 2D race progress bars
    │   │   ├── WinnerOverlay.tsx # Winner celebration overlay
    │   │   ├── GlitchText.tsx   # Cyberpunk text effect
    │   │   ├── ScanlineOverlay.tsx # CRT scanline effect
    │   │   └── 3d/
    │   │       ├── RaceScene3D.tsx       # Main 3D scene
    │   │       ├── FlagRunner3D.tsx      # Animated flag runners
    │   │       ├── FinishLine3D.tsx      # 3D finish line
    │   │       ├── StartLine3D.tsx       # 3D start line
    │   │       ├── RaceGround.tsx        # 3D ground/track
    │   │       ├── FruitProjectile3D.tsx # Gift → flag animation
    │   │       ├── NeonShatterParticles.tsx # Impact particles
    │   │       └── WinnerScene3D.tsx     # 3D winner celebration
    │   ├── stores/
    │   │   ├── useGameStore.ts   # Zustand: game state
    │   │   └── useSocketStore.ts # Zustand: socket connection
    │   ├── hooks/
    │   │   └── useSocketListener.ts # Socket event → store bridge
    │   ├── lib/
    │   │   ├── api.ts            # REST API client (fetch)
    │   │   ├── countries.ts      # Country/nation definitions
    │   │   ├── gifts.ts          # Gift presets
    │   │   └── tts.ts            # Text-to-Speech utility
    │   ├── types/
    │   │   └── index.ts          # Shared TypeScript interfaces
    │   └── assets/               # Static assets
    ├── public/                   # Public static files
    ├── package.json
    └── vite.config.ts
```
