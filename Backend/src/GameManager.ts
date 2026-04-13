// ─── GameManager.ts ─── The brain of TikTok Nation Race ───
import { EventEmitter } from 'events';

// ─── Types ───
export interface TeamConfig {
  id: string;
  name: string;
  flag: string;
  flagImage: string;
  color: string;
  giftId: number;
  giftName: string;
  giftImageUrl?: string;
  giftEmoji?: string;
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

export interface GiftData {
  giftId: number;
  giftName: string;
  giftPictureUrl?: string;
  repeatCount: number;
  userId: string;
  userName: string;
  userAvatar: string;
}

export interface WinRecord {
  teamId: string;
  teamName: string;
  flag: string;
  flagImage?: string;
  color: string;
  timestamp: number;
}

export interface GameSetupConfig {
  teams: TeamConfig[];
  trackLength: number;
}

export type GameStatus = 'idle' | 'configuring' | 'racing' | 'finished';

export interface GameState {
  status: GameStatus;
  teams: Team[];
  trackLength: number;
  winner: Team | null;
  winHistory: WinRecord[];
}

// ─── GameManager Singleton ───
class GameManager extends EventEmitter {
  private status: GameStatus = 'idle';
  private teams: Map<string, Team> = new Map();
  private giftToTeam: Map<number, string> = new Map();
  private trackLength: number = 50;
  private winner: Team | null = null;
  private winHistory: WinRecord[] = [];

  constructor() {
    super();
  }

  setupGame(config: GameSetupConfig): void {
    const existingTeams = new Map(this.teams);
    this.teams.clear();
    this.giftToTeam.clear();
    this.winner = null;
    this.trackLength = config.trackLength;

    for (const tc of config.teams) {
      const existing = existingTeams.get(tc.id);
      this.teams.set(tc.id, {
        ...tc,
        position: 0,
        donors: existing ? existing.donors : [],
      });
      this.giftToTeam.set(tc.giftId, tc.id);
    }

    this.status = 'configuring';
    this.emitStateChange();
  }

  startGame(): { success: boolean; error?: string } {
    if (this.teams.size < 2) {
      return { success: false, error: 'Need at least 2 teams to start' };
    }

    // Reset positions for a new race
    for (const team of this.teams.values()) {
      team.position = 0;
    }
    this.winner = null;
    this.status = 'racing';
    this.emitStateChange();
    return { success: true };
  }

  processGift(giftData: GiftData): void {
    if (this.status !== 'racing') return;

    const teamId = this.giftToTeam.get(giftData.giftId);
    if (!teamId) return;

    const team = this.teams.get(teamId);
    if (!team) return;

    // Update position
    const steps = giftData.repeatCount || 1;
    team.position = Math.min(team.position + steps, this.trackLength);

    // Update donors
    const existingDonor = team.donors.find(d => d.userId === giftData.userId);
    if (existingDonor) {
      existingDonor.giftCount += steps;
    } else {
      team.donors.push({
        userId: giftData.userId,
        userName: giftData.userName,
        userAvatar: giftData.userAvatar,
        giftCount: steps,
      });
    }

    // Sort donors by gift count descending
    team.donors.sort((a, b) => b.giftCount - a.giftCount);

    // Emit move event
    this.emit('move', {
      teamId: team.id,
      teamName: team.name,
      teamFlag: team.flag,
      teamColor: team.color,
      newPosition: team.position,
      trackLength: this.trackLength,
      percentage: Math.round((team.position / this.trackLength) * 100),
      giftData: {
        giftName: giftData.giftName,
        userName: giftData.userName,
        userAvatar: giftData.userAvatar,
        steps,
        giftImageUrl: giftData.giftPictureUrl || team.giftImageUrl || '',
        giftEmoji: team.giftEmoji || '',
      },
    });

    // Check for winner
    if (team.position >= this.trackLength) {
      this.winner = { ...team };
      this.status = 'finished';

      // Record win
      this.winHistory.push({
        teamId: team.id,
        teamName: team.name,
        flag: team.flag,
        flagImage: team.flagImage,
        color: team.color,
        timestamp: Date.now(),
      });

      // Build final standings
      const standings = Array.from(this.teams.values())
        .sort((a, b) => b.position - a.position)
        .map(t => ({ ...t }));

      this.emit('winner', {
        winner: { ...team },
        standings,
        trackLength: this.trackLength,
      });
    }
  }

  resetGame(): { success: boolean; error?: string } {
    if (this.teams.size === 0) {
      return { success: false, error: 'No game configured' };
    }

    for (const team of this.teams.values()) {
      team.position = 0;
    }
    this.winner = null;
    this.status = 'configuring';
    this.emitStateChange();
    return { success: true };
  }

  fullReset(): void {
    this.teams.clear();
    this.giftToTeam.clear();
    this.winner = null;
    this.trackLength = 50;
    this.status = 'idle';
    this.emitStateChange();
  }

  clearWinHistory(): void {
    this.winHistory = [];
    this.emitStateChange();
  }

  clearDonors(): void {
    for (const team of this.teams.values()) {
      team.donors = [];
    }
    this.emit('clearInteractiveData');
    this.emitStateChange();
  }

  getState(): GameState {
    return {
      status: this.status,
      teams: Array.from(this.teams.values()).map(t => ({ ...t })),
      trackLength: this.trackLength,
      winner: this.winner ? { ...this.winner } : null,
      winHistory: this.winHistory.map(w => ({...w})),
    };
  }

  getTeams(): Team[] {
    return Array.from(this.teams.values());
  }

  getStatus(): GameStatus {
    return this.status;
  }

  private emitStateChange(): void {
    this.emit('stateChange', this.getState());
  }
}


// Export singleton
export const gameManager = new GameManager();
