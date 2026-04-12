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

// ─── Manual Gift (Hotkey Donation) ───
const MANUAL_FAKE_NAMES = [
  // Vietnamese names
  'Nguyễn Văn An', 'Trần Thị Mai', 'Lê Hoàng Nam', 'Phạm Minh Anh',
  'Hoàng Thị Lan', 'Vũ Đức Huy', 'Đặng Quốc Bảo', 'Bùi Thu Hà',
  'Đỗ Thanh Tùng', 'Ngô Thị Hương', 'Dương Văn Long', 'Lý Thị Ngọc',
  'Nguyễn Thị Hạnh', 'Trần Đức Minh', 'Lê Thùy Dung', 'Phạm Tuấn Kiệt',
  'Hoàng Quốc Việt', 'Vũ Ngọc Ánh', 'Đặng Thị Thảo', 'Bùi Hữu Phước',
  'Đỗ Văn Dũng', 'Ngô Minh Tâm', 'Dương Thị Yến', 'Lý Quang Hải',
  'Trương Công Thành', 'Hồ Thị Bích', 'Phan Văn Tài', 'Võ Thị Linh',
  'Châu Gia Bảo', 'Mai Thanh Sơn', 'Tô Ngọc Phúc', 'Đinh Thị Trang',
  'Nguyễn Hữu Lộc', 'Trần Quang Vinh', 'Lê Thị Mỹ Linh', 'Phạm Đức Trí',
  'Hoàng Anh Tuấn', 'Vũ Thị Kim Chi', 'Bùi Minh Quân', 'Đỗ Thị Nga',
  // Thai-style usernames
  'bangkok_boy99', 'som_tam_lover', 'thai_smile_22', 'bkk_night_owl',
  'tuk_tuk_rider', 'pad_thai_king', 'chiang_mai_vibe', 'phuket_sun77',
  'nong_mai_55', 'krung_thep_fan', 'isaan_boy_88', 'thai_boxing_vip',
  // Japanese-style usernames
  'sakura_fan88', 'tokyo_drift_99', 'ramen_sensei', 'otaku_world_jp',
  'ninja_shadow_x', 'kawaii_neko_33', 'samurai_blade88', 'fuji_dream_11',
  'matcha_vibes', 'anime_hero_jp', 'sushi_gang_44', 'harajuku_style',
  // Korean-style usernames
  'kim_jisoo_lover', 'seoul_dreamer', 'kpop_fan_army', 'bibimbap_king',
  'hallyu_wave_kr', 'oppa_gang_99', 'hangul_master', 'kimchi_warrior',
  'gangnam_style88', 'busan_boy_77', 'kdrama_addict', 'soju_night_kr',
  // Filipino-style usernames
  'manila_queen', 'pinoy_pride_ph', 'jollibee_fan99', 'cebu_sunset_22',
  'adobo_master', 'bahay_kubo_ph', 'tita_moments', 'mahal_kita_88',
  'jeepney_king', 'boracay_vibes', 'halo_halo_fan', 'lechon_lover_ph',
  // Malaysian-style usernames
  'kuala_star', 'nasi_lemak_my', 'mamak_session', 'kl_tower_fan',
  'durian_king_my', 'teh_tarik_99', 'petronas_vip', 'borneo_wild_88',
  'roti_canai_my', 'langkawi_sun', 'satay_master', 'merdeka_my_55',
  // Indonesian-style usernames
  'CoffeeAddict_ID', 'bali_vibes_id', 'nasi_goreng_88', 'jakarta_hustle',
  'batik_lover_id', 'rendang_king', 'indo_pride_22', 'wayang_fan_id',
  'komodo_hero', 'bandung_cool', 'gado_gado_id', 'raja_ampat_99',
  // Cambodian-style
  'phnom_penh_vip', 'angkor_wat_fan', 'khmer_pride_kh', 'CoolGuy_KH',
  'cambodia_sun', 'mekong_fish_kh',
  // Myanmar-style
  'yangon_hero', 'NeonLight_MM', 'golden_pagoda', 'mandalay_mm_88',
  'myanmar_star_22', 'bagan_dreamer',
  // Singapore-style
  'sg_lion_88', 'BubbleTea_SG', 'merlion_fan_sg', 'hawker_king_sg',
  'orchard_rd_vip', 'singlish_pro',
  // Generic TikTok-style usernames
  'xXDragonSlayerXx', 'TikTok_Addict', 'LiveStream_Fan',
  'GiftKing_2024', 'DiamondHunter', 'ProGamer_VN', 'NightOwl_TH',
  'KPopStan_KR', 'AnimeWeeb_JP', 'RiceBowl_PH', 'GoldenDragon88',
  'SuperStar_MY', 'ThunderBolt99', 'PixelArt_BR', 'EagleFly_US',
  'ChezMoi_FR', 'BerlinBeat_DE', 'LondonVibes_GB', 'SpicyMasala_IN',
  'PandaLover_CN', 'SushiMaster_JP', 'KimchiKing_KR',
  'shadow_wolf_x', 'vibes_only_99', 'star_catcher_0', 'moonlight_22',
  'fire_phoenix_x', 'ice_queen_007', 'sunny_day_fan', 'dark_knight_01',
  'cosmic_rider', 'lucky_charm_88', 'swift_runner_v', 'ocean_wave_55',
  'blazing_star', 'crystal_clear', 'neon_spark_33', 'zen_master_00',
  'turbo_boost_x', 'pixel_ninja_7', 'royal_flush_99', 'echo_storm_44',
  'nova_light_vip', 'galaxy_surfer', 'dream_chaser_x', 'alpha_strike',
  'cyber_punk_88', 'retro_wave_77', 'glitch_mode_on', 'venom_bite_01',
];

router.post('/game/manual-gift', (req: Request, res: Response) => {
  const { teamId } = req.body;
  if (!teamId) {
    res.status(400).json({ success: false, error: 'teamId is required' });
    return;
  }

  const state = gameManager.getState();
  const team = state.teams.find(t => t.id === teamId);
  if (!team) {
    res.status(400).json({ success: false, error: 'Team not found' });
    return;
  }

  if (state.status !== 'racing') {
    res.status(400).json({ success: false, error: 'Game is not racing' });
    return;
  }

  // Generate fake user
  const fakeName = MANUAL_FAKE_NAMES[Math.floor(Math.random() * MANUAL_FAKE_NAMES.length)];
  const fakeId = `manual_${fakeName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
  const repeatCount = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 2 : 1;

  gameManager.processGift({
    giftId: team.giftId,
    giftName: team.giftName,
    giftPictureUrl: team.giftImageUrl,
    repeatCount,
    userId: fakeId,
    userName: fakeName,
    userAvatar: '/default-avatar.webp',
  });

  res.json({ success: true, userName: fakeName, steps: repeatCount });
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
