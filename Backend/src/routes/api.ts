// ─── API Routes ─── REST endpoints for game control ───
import { Router, type Request, type Response } from 'express';
import { gameManager } from '../GameManager.js';
import { tiktokService } from '../TikTokService.js';
import { mockService } from '../MockService.js';

const router = Router();

// ═══════════════════════════════════════════
// TikTok Connection
// ═══════════════════════════════════════════

router.post('/connect', async (req: Request, res: Response) => {
  const { username } = req.body;
  if (!username) {
    res.status(400).json({ success: false, error: 'Username is required' });
    return;
  }
  const result = await tiktokService.connect(username);
  res.json(result);
});

router.post('/disconnect', async (_req: Request, res: Response) => {
  await tiktokService.disconnect();
  res.json({ success: true });
});

router.get('/status', (_req: Request, res: Response) => {
  res.json({
    tiktok: tiktokService.getStatus(),
    game: { status: gameManager.getStatus() },
    mock: mockService.getStatus(),
  });
});

router.get('/tiktok/gifts', (_req: Request, res: Response) => {
  const gifts = tiktokService.getAvailableGifts();
  res.json({ success: true, gifts });
});

// ═══════════════════════════════════════════
// Game Management
// ═══════════════════════════════════════════

router.post('/game/setup', (req: Request, res: Response) => {
  const { teams, trackLength } = req.body;
  if (!teams || !Array.isArray(teams) || teams.length < 2) {
    res.status(400).json({ success: false, error: 'At least 2 teams are required' });
    return;
  }
  if (!trackLength || trackLength < 10) {
    res.status(400).json({ success: false, error: 'Track length must be at least 10' });
    return;
  }
  gameManager.setupGame({ teams, trackLength });
  res.json({ success: true, state: gameManager.getState() });
});

router.post('/game/start', (_req: Request, res: Response) => {
  const result = gameManager.startGame();
  if (!result.success) {
    res.status(400).json(result);
    return;
  }
  res.json({ success: true, state: gameManager.getState() });
});

router.post('/game/reset', (_req: Request, res: Response) => {
  mockService.stopMocking();
  const result = gameManager.resetGame();
  if (!result.success) {
    res.status(400).json(result);
    return;
  }
  res.json({ success: true, state: gameManager.getState() });
});

router.post('/game/full-reset', (_req: Request, res: Response) => {
  mockService.stopMocking();
  gameManager.fullReset();
  res.json({ success: true });
});

router.get('/game/state', (_req: Request, res: Response) => {
  res.json(gameManager.getState());
});

router.get('/game/leaderboard', (_req: Request, res: Response) => {
  const state = gameManager.getState();
  res.json({ winHistory: state.winHistory });
});

router.delete('/game/leaderboard', (_req: Request, res: Response) => {
  gameManager.clearWinHistory();
  res.json({ success: true });
});

router.post('/game/clear-interactive-data', (_req: Request, res: Response) => {
  gameManager.clearDonors();
  res.json({ success: true, state: gameManager.getState() });
});

// ═══════════════════════════════════════════
// Mock Mode
// ═══════════════════════════════════════════

router.post('/mock/start-gifts', (req: Request, res: Response) => {
  const intervalMs = req.body?.intervalMs || 600;
  const result = mockService.startMocking(intervalMs);
  if (!result.success) {
    res.status(400).json(result);
    return;
  }
  res.json({ success: true });
});

router.post('/mock/stop-gifts', (_req: Request, res: Response) => {
  mockService.stopMocking();
  res.json({ success: true });
});

export default router;
