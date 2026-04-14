// ─── Game Store ─── Zustand state for game data ───
import { create } from 'zustand';
import type { Team, GameStatus, WinRecord, ToastEvent, MoveEvent, WinnerEvent, TikTokUserEvent, Liker } from '../types/index.js';

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
  topLikers: Liker[];

  // Actions
  setFullState: (state: {
    status: GameStatus;
    teams: Team[];
    trackLength: number;
    winner: Team | null;
    winHistory: WinRecord[];
  }) => void;
  moveTeam: (event: MoveEvent) => void;
  processLike: (event: TikTokUserEvent) => void;
  setWinner: (event: WinnerEvent) => void;
  addToast: (toast: ToastEvent) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  reset: () => void;
  clearInteractiveData: () => void;
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
  topLikers: [],

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

      if (event.giftData.giftName !== 'Comment') {
        // Track donors locally
        const donors = [...t.donors];
        const existing = donors.find(d => d.userName === event.giftData.userName);
        if (existing) {
          existing.giftCount += event.giftData.steps;
          if (event.giftData.userAvatar) {
             existing.userAvatar = event.giftData.userAvatar;
          }
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
      }

      return updated;
    });

    // Keep last 30 recent gifts for the live feed
    const recentGifts = [event, ...get().recentGifts].slice(0, 30);

    set({ teams: updatedTeams, recentGifts });
  },

  processLike: (event) => {
    const likers = get().topLikers.map(l => ({ ...l }));
    const existing = likers.find(l => l.userId === event.userId || l.userName === event.userName);
    const count = Number(event.likeCount) || 1;
    if (existing) {
      // TikTok connector sometimes sends total likes by user so far, sometimes increments.
      // Let's add them up, but if someone spams, it might inflate if it's total.
      // Usually, it's an increment per batch.
      existing.likeCount += count;
      if (event.userAvatar) {
         existing.userAvatar = event.userAvatar;
      }
    } else {
      likers.push({
        userId: event.userId,
        userName: event.userName,
        userAvatar: event.userAvatar,
        likeCount: count,
      });
    }
    likers.sort((a, b) => b.likeCount - a.likeCount);
    set({ topLikers: likers.slice(0, 10) });
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

  clearInteractiveData: () => set({
    topLikers: [],
    recentGifts: [], // Also optionally clear recent gifts when interactive data clears
  }),
}));
