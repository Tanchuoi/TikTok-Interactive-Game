// ─── TikTokService.ts ─── TikTok Live stream connector (TS Rewrite API) ───
import { EventEmitter } from 'events';

// Dynamic import for tiktok-live-connector (CJS module)
let TikTokLiveConnection: any;
let WebcastEvent: any;

async function loadConnector() {
  try {
    const mod = await import('tiktok-live-connector');
    TikTokLiveConnection = mod.TikTokLiveConnection || mod.default?.TikTokLiveConnection;
    WebcastEvent = mod.WebcastEvent || mod.default?.WebcastEvent;

    if (!TikTokLiveConnection) {
      const defaultMod = mod.default || mod;
      TikTokLiveConnection = defaultMod.TikTokLiveConnection || defaultMod.WebcastPushConnection;
    }
  } catch (err) {
    console.error('[TikTokService] Failed to load tiktok-live-connector:', err);
  }
}

// Load on module init
loadConnector();

export interface TikTokGift {
  id: number;
  name: string;
  diamondCount: number;
  imageUrl: string;
}

class TikTokService extends EventEmitter {
  private connection: any = null;
  private username: string = '';
  private isConnected: boolean = false;
  private availableGifts: TikTokGift[] = [];

  async connect(username: string): Promise<{ success: boolean; roomId?: string; error?: string }> {
    if (this.isConnected) {
      await this.disconnect();
    }

    if (!TikTokLiveConnection) {
      await loadConnector();
      if (!TikTokLiveConnection) {
        return { success: false, error: 'tiktok-live-connector not available' };
      }
    }

    this.username = username;

    try {
      this.connection = new TikTokLiveConnection(username, {
        processInitialData: true,
        enableExtendedGiftInfo: true,
      });

      const state = await this.connection.connect();
      this.isConnected = true;

      console.log(`[TikTok] Connected to ${username} | Room: ${state.roomId}`);

      // Fetch available gifts from TikTok
      try {
        const giftList = await this.connection.fetchAvailableGifts();
        if (Array.isArray(giftList)) {
          this.availableGifts = giftList.map((g: any) => ({
            id: g.id || g.giftId,
            name: g.name || g.giftName || `Gift_${g.id}`,
            diamondCount: g.diamond_count || g.diamondCount || 0,
            imageUrl: g.image?.url_list?.[0] || g.icon?.url_list?.[0] || '',
          }));
          console.log(`[TikTok] Loaded ${this.availableGifts.length} available gifts`);
        }
      } catch (giftErr) {
        console.warn('[TikTok] Could not fetch gift list:', giftErr);
      }

      // ─── GIFT event (TS Rewrite API) ───
      const giftEventName = WebcastEvent?.GIFT || 'gift';
      this.connection.on(giftEventName, (data: any) => {
        // giftType 1 = streakable: only process when streak ends
        const giftType = data.giftDetails?.giftType ?? data.giftType;
        if (giftType === 1 && !data.repeatEnd) return;

        const giftId = data.giftId ?? data.giftDetails?.giftId ?? data.gift?.gift_id;
        const giftName = data.giftDetails?.giftName || data.giftName || data.gift?.name || `Gift_${giftId}`;
        const diamondCount = data.giftDetails?.diamondCount ?? data.diamondCount ?? data.gift?.diamond_count ?? 0;
        
        let giftPictureUrl = data.giftDetails?.giftPictureUrl || data.gift?.icon?.urlList?.[0] || data.gift?.image?.urlList?.[0] || data.gift?.image?.url_list?.[0] || data.giftPictureUrl || '';
        if (!giftPictureUrl) {
          const knownGift = this.availableGifts.find(g => g.id === giftId || g.id === data.gift?.gift_id);
          if (knownGift) giftPictureUrl = knownGift.imageUrl;
        }

        // User info from TS rewrite uses data.user.*
        const user = data.user || {};
        const userId = user.uniqueId || user.userId || data.uniqueId || data.userId || 'unknown';
        const userName = user.nickname || user.uniqueId || data.nickname || data.uniqueId || 'Unknown';
        const userAvatar = user.profilePicture?.url?.[0] || user.profilePicture?.urlList?.[0] || user.profilePictureUrl || data.profilePictureUrl || '';

        this.emit('gift', {
          giftId,
          giftName,
          diamondCount,
          giftPictureUrl,
          repeatCount: data.repeatCount || 1,
          userId,
          userName,
          userAvatar,
        });
      });

      // ─── FOLLOW event ───
      const followEventName = WebcastEvent?.FOLLOW || 'follow';
      this.connection.on(followEventName, (data: any) => {
        const user = data.user || {};
        const userAvatar = user.profilePicture?.url?.[0] || user.profilePicture?.urlList?.[0] || user.profilePictureUrl || data.profilePictureUrl || '';
        this.emit('follow', {
          userId: user.uniqueId || data.uniqueId || 'unknown',
          userName: user.nickname || user.uniqueId || data.nickname || 'Unknown',
          userAvatar,
        });
      });

      // ─── SHARE event ───
      const shareEventName = WebcastEvent?.SHARE || 'share';
      this.connection.on(shareEventName, (data: any) => {
        const user = data.user || {};
        const userAvatar = user.profilePicture?.url?.[0] || user.profilePicture?.urlList?.[0] || user.profilePictureUrl || data.profilePictureUrl || '';
        this.emit('share', {
          userId: user.uniqueId || data.uniqueId || 'unknown',
          userName: user.nickname || user.uniqueId || data.nickname || 'Unknown',
          userAvatar,
        });
      });

      // ─── LIKE event ───
      const likeEventName = WebcastEvent?.LIKE || 'like';
      this.connection.on(likeEventName, (data: any) => {
        const user = data.user || {};
        const userAvatar = user.profilePicture?.url?.[0] || user.profilePicture?.urlList?.[0] || user.profilePictureUrl || data.profilePictureUrl || '';
        this.emit('like', {
          userId: user.uniqueId || data.uniqueId || 'unknown',
          userName: user.nickname || user.uniqueId || data.nickname || 'Unknown',
          userAvatar,
          likeCount: data.likeCount || 1,
        });
      });

      // ─── MEMBER event (join) ───
      const memberEventName = WebcastEvent?.MEMBER || 'member';
      this.connection.on(memberEventName, (data: any) => {
        const user = data.user || {};
        const userAvatar = user.profilePicture?.url?.[0] || user.profilePicture?.urlList?.[0] || user.profilePictureUrl || data.profilePictureUrl || '';
        this.emit('member', {
          userId: user.uniqueId || 'unknown',
          userName: user.nickname || user.uniqueId || 'Unknown',
          userAvatar,
          memberCount: data.memberCount,
        });
      });

      // ─── ROOM USER event (viewers) ───
      const roomUserEventName = WebcastEvent?.ROOM_USER || 'roomUser';
      this.connection.on(roomUserEventName, (data: any) => {
        if (data.viewerCount !== undefined) {
          this.emit('viewers', { viewerCount: data.viewerCount });
        }
      });

      // ─── CHAT event ───
      const chatEventName = WebcastEvent?.CHAT || 'chat';
      this.connection.on(chatEventName, (data: any) => {
        const user = data.user || {};
        const userAvatar = user.profilePicture?.url?.[0] || user.profilePicture?.urlList?.[0] || user.profilePictureUrl || data.profilePictureUrl || '';
        this.emit('chat', {
          userId: user.uniqueId || 'unknown',
          userName: user.nickname || user.uniqueId || 'Unknown',
          userAvatar,
          comment: data.comment || '',
        });
      });

      // ─── Disconnection ───
      this.connection.on('disconnected', () => {
        console.log(`[TikTok] Disconnected from ${username}`);
        this.isConnected = false;
        this.emit('disconnected');
      });

      this.connection.on('error', (err: any) => {
        console.error(`[TikTok] Error:`, err);
        this.emit('error', err);
      });

      return { success: true, roomId: state.roomId?.toString() };
    } catch (err: any) {
      console.error(`[TikTok] Connection failed:`, err.message);
      this.isConnected = false;
      return { success: false, error: err.message || 'Connection failed' };
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        this.connection.disconnect();
      } catch {
        // ignore
      }
      this.connection = null;
      this.isConnected = false;
      this.availableGifts = [];
      console.log(`[TikTok] Disconnected`);
    }
  }

  getAvailableGifts(): TikTokGift[] {
    return this.availableGifts;
  }

  getStatus(): { connected: boolean; username: string } {
    return {
      connected: this.isConnected,
      username: this.username,
    };
  }
}

export const tiktokService = new TikTokService();
