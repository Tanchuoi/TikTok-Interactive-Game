import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/useGameStore.js';
import followSound from '../assets/sound/donate.mp3';

const TYPE_ICONS: Record<string, string> = {
  gift: '🎁',
  follow: '👤',
  share: '🔗',
  like: '❤️',
};

const TYPE_COLORS: Record<string, string> = {
  gift: 'var(--accent)',
  follow: 'var(--accent-tertiary)',
  share: 'var(--accent-secondary)',
  like: 'var(--destructive)',
};

export function GiftPopup() {
  const toasts = useGameStore(s => s.toasts);
  const processedToasts = useRef<Set<string>>(new Set());
  const soundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    soundRef.current = new Audio(followSound);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;

    // Check for new follow toasts
    const latest = toasts[0];
    if (latest.type === 'follow' && !processedToasts.current.has(latest.id)) {
      processedToasts.current.add(latest.id);
      
      // Play follow sound
      if (soundRef.current) {
        soundRef.current.currentTime = 0;
        soundRef.current.play().catch(e => console.error("Follow sound failed", e));
      }
    }

    // Optional: cleanup the set if it grows too large
    if (processedToasts.current.size > 50) {
      const activeIds = new Set(toasts.map(t => t.id));
      processedToasts.current.forEach(id => {
        if (!activeIds.has(id)) processedToasts.current.delete(id);
      });
    }
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast-item cyber-chamfer-sm"
          style={{
            borderColor: TYPE_COLORS[toast.type] || 'var(--border)',
            borderLeftWidth: '3px',
          }}
        >
          <div className="flex items-center gap-2">
            {toast.userAvatar ? (
              <img src={toast.userAvatar} alt="" className="w-6 h-6 rounded-full object-cover border border-[var(--border)] shrink-0" />
            ) : (
              <span className="text-sm shrink-0">{TYPE_ICONS[toast.type]}</span>
            )}
            <div className="flex-1 min-w-0 flex items-center flex-wrap gap-x-1">
              <span
                className="font-bold text-xs"
                style={{ color: TYPE_COLORS[toast.type] }}
              >
                {toast.userName}
              </span>
              <span
                className="text-xs"
                style={{ color: 'var(--muted-fg)' }}
              >
                {toast.message}
              </span>
              {toast.giftImageUrl && (
                <img src={toast.giftImageUrl} alt="gift" className="w-5 h-5 object-contain" />
              )}
            </div>
            {toast.teamFlag && (
              <span className="text-sm shrink-0">{toast.teamFlag}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
