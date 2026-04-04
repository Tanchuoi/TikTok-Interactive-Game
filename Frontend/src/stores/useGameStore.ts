// ─── Game Store ─── Zustand state for game data ───
import { create } from 'zustand';
import type { Team, GameStatus, WinRecord, ToastEvent, MoveEvent, WinnerEvent } from '../types/index.js';

interface GameStore {
  // State
  status: GameStatus;
  teams: Team[];
  trackLength: number;
  winner: Team | null;
  standings: Team[];
  winHistory: WinRecord[];
  toasts: ToastEvent[];
  recentGifts: MoveEvent[];

  // Actions
  setFullState: (state: {
    status: GameStatus;
    teams: Team[];
    trackLength: number;
    winner: Team | null;
    winHistory: WinRecord[];
  }) => void;
  moveTeam: (event: MoveEvent) => void;
  setWinner: (event: WinnerEvent) => void;
  addToast: (toast: ToastEvent) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  status: 'idle',
  teams: [],
  trackLength: 50,
  winner: null,
  standings: [],
  winHistory: [],
  toasts: [],
  recentGifts: [],

  setFullState: (state) => {
    set({
      status: state.status,
      teams: state.teams,
      trackLength: state.trackLength,
      winner: state.winner,
      winHistory: state.winHistory,
    });
  },

  moveTeam: (event) => {
    const { teams } = get();
    const updatedTeams = teams.map(t => {
      if (t.id !== event.teamId) return t;

      // Update position
      const updated = { ...t, position: event.newPosition };

      // Track donors locally
      const donors = [...t.donors];
      const existing = donors.find(d => d.userName === event.giftData.userName);
      if (existing) {
        existing.giftCount += event.giftData.steps;
      } else {
        donors.push({
          userId: event.giftData.userName,
          userName: event.giftData.userName,
          userAvatar: event.giftData.userAvatar,
          giftCount: event.giftData.steps,
        });
      }
      // Sort by gift count descending
      donors.sort((a, b) => b.giftCount - a.giftCount);
      updated.donors = donors;

      return updated;
    });

    // Keep last 30 recent gifts for the live feed
    const recentGifts = [event, ...get().recentGifts].slice(0, 30);

    set({ teams: updatedTeams, recentGifts });
  },

  setWinner: (event) => {
    set({
      status: 'finished',
      winner: event.winner,
      standings: event.standings,
      winHistory: [...get().winHistory, {
        teamId: event.winner.id,
        teamName: event.winner.name,
        flag: event.winner.flag,
        color: event.winner.color,
        timestamp: Date.now(),
      }],
    });
  },

  addToast: (toast) => {
    const toasts = [toast, ...get().toasts].slice(0, 8);
    set({ toasts });

    // Auto-remove after 4 seconds
    setTimeout(() => {
      get().removeToast(toast.id);
    }, 4000);
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter(t => t.id !== id) });
  },

  clearToasts: () => set({ toasts: [] }),

  reset: () => set({
    status: 'idle',
    teams: [],
    trackLength: 50,
    winner: null,
    standings: [],
    toasts: [],
    recentGifts: [],
  }),
}));
