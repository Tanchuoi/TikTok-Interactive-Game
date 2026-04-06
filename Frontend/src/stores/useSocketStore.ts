// ─── Socket Store ─── Zustand state for Socket.IO connection ───
import { create } from 'zustand';
import { io, type Socket } from 'socket.io-client';

interface SocketStore {
  socket: Socket | null;
  isConnected: boolean;
  tiktokConnected: boolean;
  tiktokUsername: string;
  viewerCount: number;

  connect: () => void;
  disconnect: () => void;
  setTikTokStatus: (connected: boolean, username: string) => void;
  setViewerCount: (count: number) => void;
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  isConnected: false,
  tiktokConnected: false,
  tiktokUsername: '',
  viewerCount: 0,

  connect: () => {
    const existing = get().socket;
    if (existing?.connected) return;

    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      set({ isConnected: false });
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  setTikTokStatus: (connected, username) => {
    set({ tiktokConnected: connected, tiktokUsername: username, viewerCount: connected ? get().viewerCount : 0 });
  },

  setViewerCount: (count) => {
    set({ viewerCount: count });
  },
}));
