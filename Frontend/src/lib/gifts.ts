// ─── Gift Data ─── Common TikTok gifts (fallback when not connected) ───
// Real gift IDs sourced from tiktok-live-connector enableExtendedGiftInfo
import type { Gift } from '../types/index.js';

export const TIKTOK_GIFTS: Gift[] = [
  { giftId: 5655, name: 'Rose', emoji: '🌹', diamondCount: 1 },
  { giftId: 5658, name: 'TikTok', emoji: '🎵', diamondCount: 1 },
  { giftId: 5659, name: 'Finger Heart', emoji: '🫰', diamondCount: 5 },
  { giftId: 5660, name: 'GG', emoji: '🎮', diamondCount: 1 },
  { giftId: 5885, name: 'Confetti', emoji: '🎊', diamondCount: 100 },
  { giftId: 5879, name: 'Heart Me', emoji: '❤️', diamondCount: 5 },
  { giftId: 5956, name: 'Star', emoji: '⭐', diamondCount: 99 },
  { giftId: 5600, name: 'Ice Cream', emoji: '🍦', diamondCount: 1 },
  { giftId: 5269, name: 'Crown', emoji: '👑', diamondCount: 999 },
  { giftId: 5827, name: 'Diamond', emoji: '💎', diamondCount: 100 },
  { giftId: 5900, name: 'Fire', emoji: '🔥', diamondCount: 1000 },
  { giftId: 6090, name: 'Rocket', emoji: '🚀', diamondCount: 20000 },
  { giftId: 5487, name: 'Doughnut', emoji: '🍩', diamondCount: 30 },
  { giftId: 5500, name: 'Rainbow Puke', emoji: '🌈', diamondCount: 1 },
  { giftId: 6064, name: 'Lightning', emoji: '⚡', diamondCount: 199 },
  { giftId: 6071, name: 'Corgi', emoji: '🐕', diamondCount: 10 },
  { giftId: 6265, name: 'Small Flower', emoji: '🌸', diamondCount: 10 },
  { giftId: 5741, name: 'Drumstick', emoji: '🍗', diamondCount: 1 },
  { giftId: 6432, name: 'Cheer You Up', emoji: '🎉', diamondCount: 1 },
  { giftId: 5438, name: 'Money Gun', emoji: '💰', diamondCount: 500 },
];
