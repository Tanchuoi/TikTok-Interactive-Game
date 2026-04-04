// ─── Socket Listener Hook ─── Root-level event handler ───
import { useEffect } from 'react';
import { useSocketStore } from '../stores/useSocketStore.js';
import { useGameStore } from '../stores/useGameStore.js';
import type { GameState, MoveEvent, WinnerEvent, TikTokUserEvent, ToastEvent } from '../types/index.js';

let toastCounter = 0;
function makeToastId(): string {
  return `toast_${Date.now()}_${toastCounter++}`;
}

export function useSocketListener() {
  const socket = useSocketStore(s => s.socket);
  const setTikTokStatus = useSocketStore(s => s.setTikTokStatus);
  const setFullState = useGameStore(s => s.setFullState);
  const moveTeam = useGameStore(s => s.moveTeam);
  const setWinner = useGameStore(s => s.setWinner);
  const addToast = useGameStore(s => s.addToast);

  useEffect(() => {
    if (!socket) return;

    // ─── Game State Init ───
    const handleInit = (state: GameState) => {
      console.log('[Socket] Received init state:', state.status);
      setFullState(state);
    };

    // ─── Game State Change ───
    const handleStateChange = (state: GameState) => {
      setFullState(state);
    };

    // ─── Team Move ───
    const handleMove = (event: MoveEvent) => {
      moveTeam(event);

      // Add gift toast
      const toast: ToastEvent = {
        id: makeToastId(),
        type: 'gift',
        userName: event.giftData.userName,
        userAvatar: event.giftData.userAvatar,
        message: `gifted ${event.giftData.giftName} ${event.giftData.steps > 1 ? `x${event.giftData.steps}` : ''} → ${event.teamFlag} ${event.teamName}`,
        teamFlag: event.teamFlag,
        timestamp: Date.now(),
      };
      addToast(toast);
    };

    // ─── Winner ───
    const handleWinner = (event: WinnerEvent) => {
      setWinner(event);
    };

    // ─── TikTok Status ───
    const handleTikTokStatus = (data: { connected: boolean; username: string }) => {
      setTikTokStatus(data.connected, data.username);
    };

    // ─── TikTok Social Events ───
    const handleFollow = (data: TikTokUserEvent) => {
      addToast({
        id: makeToastId(),
        type: 'follow',
        userName: data.userName,
        userAvatar: data.userAvatar,
        message: 'just followed!',
        timestamp: Date.now(),
      });
    };

    const handleShare = (data: TikTokUserEvent) => {
      addToast({
        id: makeToastId(),
        type: 'share',
        userName: data.userName,
        userAvatar: data.userAvatar,
        message: 'shared the stream!',
        timestamp: Date.now(),
      });
    };

    const handleLike = (data: TikTokUserEvent) => {
      addToast({
        id: makeToastId(),
        type: 'like',
        userName: data.userName,
        userAvatar: data.userAvatar,
        message: `liked ${data.likeCount ? `x${data.likeCount}` : ''}!`,
        timestamp: Date.now(),
      });
    };

    // ─── Attach listeners ───
    socket.on('init', handleInit);
    socket.on('game:stateChange', handleStateChange);
    socket.on('game:move', handleMove);
    socket.on('game:winner', handleWinner);
    socket.on('tiktok:status', handleTikTokStatus);
    socket.on('tiktok:follow', handleFollow);
    socket.on('tiktok:share', handleShare);
    socket.on('tiktok:like', handleLike);

    return () => {
      socket.off('init', handleInit);
      socket.off('game:stateChange', handleStateChange);
      socket.off('game:move', handleMove);
      socket.off('game:winner', handleWinner);
      socket.off('tiktok:status', handleTikTokStatus);
      socket.off('tiktok:follow', handleFollow);
      socket.off('tiktok:share', handleShare);
      socket.off('tiktok:like', handleLike);
    };
  }, [socket, setFullState, moveTeam, setWinner, addToast, setTikTokStatus]);
}
