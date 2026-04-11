// ─── API Client ─── Typed fetch wrappers for backend ───
import type { GameState, TeamConfig } from '../types/index.js';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return res.json() as Promise<T>;
}

// ─── TikTok Connection ───
export function connectTikTok(username: string) {
  return request<{ success: boolean; roomId?: string; error?: string }>(
    '/connect',
    { method: 'POST', body: JSON.stringify({ username }) }
  );
}

export function disconnectTikTok() {
  return request<{ success: boolean }>('/disconnect', { method: 'POST' });
}

export function getStatus() {
  return request<{
    tiktok: { connected: boolean; username: string };
    game: { status: string };
    mock: { running: boolean };
  }>('/status');
}

export function fetchTikTokGifts() {
  return request<{
    success: boolean;
    gifts: Array<{ id: number; name: string; diamondCount: number; imageUrl: string }>;
  }>('/tiktok/gifts');
}

// ─── Game Management ───
export function setupGame(teams: TeamConfig[], trackLength: number) {
  return request<{ success: boolean; state?: GameState; error?: string }>(
    '/game/setup',
    { method: 'POST', body: JSON.stringify({ teams, trackLength }) }
  );
}

export function startGame() {
  return request<{ success: boolean; state?: GameState; error?: string }>(
    '/game/start',
    { method: 'POST' }
  );
}

export function resetGame() {
  return request<{ success: boolean; state?: GameState; error?: string }>(
    '/game/reset',
    { method: 'POST' }
  );
}

export function fullResetGame() {
  return request<{ success: boolean }>('/game/full-reset', { method: 'POST' });
}

export function getGameState() {
  return request<GameState>('/game/state');
}

export function getLeaderboard() {
  return request<{ winHistory: GameState['winHistory'] }>('/game/leaderboard');
}

export function clearLeaderboard() {
  return request<{ success: boolean }>('/game/leaderboard', { method: 'DELETE' });
}

export function clearInteractiveData() {
  return request<{ success: boolean; state?: GameState; error?: string }>(
    '/game/clear-interactive-data',
    { method: 'POST' }
  );
}

// ─── Manual Gift (Hotkey Donation) ───
export function sendManualGift(teamId: string) {
  return request<{ success: boolean; userName?: string; steps?: number; error?: string }>(
    '/game/manual-gift',
    { method: 'POST', body: JSON.stringify({ teamId }) }
  );
}

// ─── Mock Mode ───
export function startMockGifts(intervalMs = 600) {
  return request<{ success: boolean; error?: string }>(
    '/mock/start-gifts',
    { method: 'POST', body: JSON.stringify({ intervalMs }) }
  );
}

export function stopMockGifts() {
  return request<{ success: boolean }>('/mock/stop-gifts', { method: 'POST' });
}
