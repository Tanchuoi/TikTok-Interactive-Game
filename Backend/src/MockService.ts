// ─── MockService.ts ─── Fake gift generator for testing ───
import { gameManager, type GiftData } from './GameManager.js';

const FAKE_USERS = [
  { userId: 'mock_alice', userName: 'Alice_Gamer', userAvatar: '' },
  { userId: 'mock_bob', userName: 'Bob_Pro99', userAvatar: '' },
  { userId: 'mock_charlie', userName: 'Charlie_TTV', userAvatar: '' },
  { userId: 'mock_diana', userName: 'Diana_Star', userAvatar: '' },
  { userId: 'mock_eric', userName: 'Eric_Legend', userAvatar: '' },
  { userId: 'mock_fiona', userName: 'Fiona_VIP', userAvatar: '' },
  { userId: 'mock_george', userName: 'GG_George', userAvatar: '' },
  { userId: 'mock_hannah', userName: 'Hannah_Live', userAvatar: '' },
  { userId: 'mock_ivan', userName: 'Ivan_Plays', userAvatar: '' },
  { userId: 'mock_julia', userName: 'Julia_Fan', userAvatar: '' },
  { userId: 'mock_kevin', userName: 'Kevin_Hype', userAvatar: '' },
  { userId: 'mock_luna', userName: 'Luna_Moon', userAvatar: '' },
];

class MockService {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isRunning: boolean = false;

  startMocking(intervalMs: number = 600): { success: boolean; error?: string } {
    if (this.isRunning) {
      return { success: false, error: 'Mock mode already running' };
    }

    const teams = gameManager.getTeams();
    if (teams.length === 0) {
      return { success: false, error: 'No teams configured' };
    }

    if (gameManager.getStatus() !== 'racing') {
      return { success: false, error: 'Game is not in racing state' };
    }

    this.isRunning = true;

    this.intervalId = setInterval(() => {
      // Stop if game is no longer racing
      if (gameManager.getStatus() !== 'racing') {
        this.stopMocking();
        return;
      }

      // Pick a random team
      const currentTeams = gameManager.getTeams();
      const randomTeam = currentTeams[Math.floor(Math.random() * currentTeams.length)];
      
      // Pick a random user
      const randomUser = FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)];
      
      // Random repeat count (1-3 for variety)
      const repeatCount = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 2 : 1;

      const fakeGift: GiftData = {
        giftId: randomTeam.giftId,
        giftName: randomTeam.giftName,
        repeatCount,
        userId: randomUser.userId,
        userName: randomUser.userName,
        userAvatar: randomUser.userAvatar,
      };

      gameManager.processGift(fakeGift);
    }, intervalMs);

    console.log(`[Mock] Started generating fake gifts every ${intervalMs}ms`);
    return { success: true };
  }

  stopMocking(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('[Mock] Stopped generating fake gifts');
  }

  getStatus(): { running: boolean } {
    return { running: this.isRunning };
  }
}

export const mockService = new MockService();
