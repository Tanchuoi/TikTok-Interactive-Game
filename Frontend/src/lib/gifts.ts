// ─── Gift Data ─── Common TikTok gifts (fallback when not connected) ───
// Real gift IDs sourced from tiktok-live-connector enableExtendedGiftInfo
// imageUrl sourced from TikTok CDN (p19-webcast.tiktokcdn.com)
import type { Gift } from '../types/index.js';

export const TIKTOK_GIFTS: Gift[] = [
  { giftId: 5655, name: 'Rose',         emoji: '🌹', diamondCount: 1,     imageUrl: 'https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/eba3a9bb85c33e017f3648eaf88d7189~tplv-obj.webp' },
  { giftId: 5658, name: 'TikTok',       emoji: '🎵', diamondCount: 1,     imageUrl: 'https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/c9bfbf15478d26c60a0b781cf9db4e27~tplv-obj.webp' },
  { giftId: 5659, name: 'Finger Heart', emoji: '🫰', diamondCount: 5,     imageUrl: 'https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/37a67abb4332a6039b425da184a1e18a~tplv-obj.webp' },
  { giftId: 5660, name: 'GG',           emoji: '🎮', diamondCount: 1,     imageUrl: 'https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/c7ca5a8dec29c26e70fda012973e64a0~tplv-obj.webp' },
  { giftId: 5885, name: 'Confetti',     emoji: '🎊', diamondCount: 100,   imageUrl: 'https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/4fc9899b96e2aeb4d382cca01e4cde53~tplv-obj.webp' },
  { giftId: 5879, name: 'Heart Me',     emoji: '❤️', diamondCount: 5,     imageUrl: 'https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/15195eacc2e93ed5e2b1c5827e0a5c95~tplv-obj.webp' },
  { giftId: 5956, name: 'Star',         emoji: '⭐', diamondCount: 99,    imageUrl: 'https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/d56c0115a2df10231f498cbda56acfca~tplv-obj.webp' },
  { giftId: 5600, name: 'Ice Cream',    emoji: '🍦', diamondCount: 1,     imageUrl: 'https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/b1f01011387740f705db7accb19c4507~tplv-obj.webp' },
  { giftId: 5269, name: 'Crown',        emoji: '👑', diamondCount: 999,   imageUrl: 'https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/4e18e61a5009d013fbb0ebce1e74be73~tplv-obj.webp' },
  { giftId: 5827, name: 'Diamond',      emoji: '💎', diamondCount: 100,   imageUrl: 'https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/24aa3f96eddf2c32bbdd531cb3a89467~tplv-obj.webp' },
  { giftId: 5900, name: 'Fire',         emoji: '🔥', diamondCount: 1000,  imageUrl: 'https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/9cdab43a66e0fc547a8b2c3172cf7aab~tplv-obj.webp' },
  { giftId: 6090, name: 'Rocket',       emoji: '🚀', diamondCount: 20000, imageUrl: 'https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/0fccfc3e84a5ec7b6c1a5d53f8e9cdea~tplv-obj.webp' },
  { giftId: 5487, name: 'Doughnut',     emoji: '🍩', diamondCount: 30,    imageUrl: 'https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/89c5a43b66530b2dbb7a35297a80e750~tplv-obj.webp' },
  { giftId: 5500, name: 'Rainbow Puke', emoji: '🌈', diamondCount: 1,     imageUrl: 'https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/3ea060437c1d58db8b3e040a9b0fc6b7~tplv-obj.webp' },
  { giftId: 6064, name: 'Lightning',    emoji: '⚡', diamondCount: 199,   imageUrl: 'https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/29f5e7ac5a3f4f84113b1a641e1ba1cf~tplv-obj.webp' },
  { giftId: 6071, name: 'Corgi',        emoji: '🐕', diamondCount: 10,    imageUrl: 'https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/0e24e55907b395613a2ffb5aded60e9e~tplv-obj.webp' },
  { giftId: 6265, name: 'Small Flower', emoji: '🌸', diamondCount: 10,    imageUrl: 'https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/fbaf0b76f6abea79eec756fa13dbb498~tplv-obj.webp' },
  { giftId: 5741, name: 'Drumstick',    emoji: '🍗', diamondCount: 1,     imageUrl: 'https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/f04e5f74b3c4e2abd34130c547cf82fb~tplv-obj.webp' },
  { giftId: 6432, name: 'Cheer You Up', emoji: '🎉', diamondCount: 1,     imageUrl: 'https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/09bed0af02c04c4ea14b1a3a3d08c8b6~tplv-obj.webp' },
  { giftId: 5438, name: 'Money Gun',    emoji: '💰', diamondCount: 500,   imageUrl: 'https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/8eae13de3b7d204d72d06b1e4a1c0b1c~tplv-obj.webp' },
];
