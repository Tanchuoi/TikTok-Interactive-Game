// ─── Gift Popup / Toast Overlay ─── Floating notifications ───
import { useGameStore } from '../stores/useGameStore.js';

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
              <img src={toast.userAvatar} alt="" className="w-6 h-6 rounded-full object-cover border border-[var(--border)] shrink-0" crossOrigin="anonymous" />
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
                <img src={toast.giftImageUrl} alt="gift" className="w-5 h-5 object-contain" crossOrigin="anonymous" />
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
