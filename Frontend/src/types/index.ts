// ─── Shared TypeScript Types ───

export interface TeamConfig {
  id: string;
  name: string;
  flag: string;
  flagImage: string;
  color: string;
  giftId: number;
  giftName: string;
}

export interface Donor {
  userId: string;
  userName: string;
  userAvatar: string;
  giftCount: number;
}

export interface Team extends TeamConfig {
  position: number;
  donors: Donor[];
}

export interface GiftMoveData {
  giftName: string;
  userName: string;
  userAvatar: string;
  steps: number;
}

export interface MoveEvent {
  teamId: string;
  teamName: string;
  teamFlag: string;
  teamColor: string;
  newPosition: number;
  trackLength: number;
  percentage: number;
  giftData: GiftMoveData;
}

export interface WinnerEvent {
  winner: Team;
  standings: Team[];
  trackLength: number;
}

export interface WinRecord {
  teamId: string;
  teamName: string;
  flag: string;
  color: string;
  timestamp: number;
}

export type GameStatus = 'idle' | 'configuring' | 'racing' | 'finished';

export interface GameState {
  status: GameStatus;
  teams: Team[];
  trackLength: number;
  winner: Team | null;
  winHistory: WinRecord[];
}

export interface TikTokUserEvent {
  userId: string;
  userName: string;
  userAvatar: string;
  likeCount?: number;
}

export interface ToastEvent {
  id: string;
  type: 'gift' | 'follow' | 'share' | 'like';
  userName: string;
  userAvatar: string;
  message: string;
  teamFlag?: string;
  timestamp: number;
}

export interface Country {
  id: string;
  name: string;
  flag: string;
  flagImage: string;
  color: string;
}

export interface Gift {
  giftId: number;
  name: string;
  emoji: string;
  diamondCount?: number;
  imageUrl?: string;
}
