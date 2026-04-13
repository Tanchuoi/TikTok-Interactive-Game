// ─── Live Feed ─── Scrolling event feed ───
import { useRef, useEffect } from 'react';
import type { MoveEvent } from '../types/index.js';

interface LiveFeedProps {
  events: MoveEvent[];
}

export function LiveFeed({ events }: LiveFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top on new event
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [events.length]);

  if (events.length === 0) {
    return (
      <div className="cyber-card cyber-chamfer-sm p-4">
        <h3
          className="text-xs uppercase tracking-widest mb-2"
          style={{ fontFamily: 'var(--font-label)', color: 'var(--accent)' }}
        >
          {'>'} Live Feed
        </h3>
        <p className="text-xs" style={{ color: 'var(--muted-fg)' }}>
          Waiting for gifts...
          <span className="blink-cursor" />
        </p>
      </div>
    );
  }

  return (
    <div className="cyber-card cyber-chamfer-sm p-4 flex flex-col min-h-0 h-full">
      <h3
        className="text-xs uppercase tracking-widest mb-2"
        style={{ fontFamily: 'var(--font-label)', color: 'var(--accent)' }}
      >
        {'>'} Live Feed
      </h3>
      <div
        ref={containerRef}
        className="flex flex-col gap-1 flex-1 min-h-0 overflow-hidden"
        style={{ scrollbarWidth: 'thin' }}
      >
        {events.map((event, i) => (
          <div
            key={`${event.teamId}-${i}`}
            className="flex items-center gap-2 py-1 px-2 text-xs slide-in-up"
            style={{
              background: i === 0 ? 'rgba(0, 255, 136, 0.05)' : 'transparent',
              borderLeft: `2px solid ${event.teamColor}`,
            }}
          >
            {event.giftData.userAvatar ? (
              <img src={event.giftData.userAvatar} alt="" className="w-5 h-5 rounded-full object-cover shrink-0 border border-[var(--border)]" />
            ) : (
              <span className="shrink-0">{event.teamFlag}</span>
            )}
            <span className="truncate flex-1 flex items-center flex-wrap gap-x-1" style={{ color: 'var(--muted-fg)' }}>
              <span style={{ color: 'var(--fg)', fontWeight: 'bold' }}>{event.giftData.userName}</span>
              {event.giftData.giftImageUrl ? (
                <img src={event.giftData.giftImageUrl} alt={event.giftData.giftName} className="w-4 h-4 object-contain" />
              ) : (
                <span className="text-sm">{event.giftData.giftEmoji || '🎁'}</span>
              )}
              {event.giftData.steps > 1 && (
                <span style={{ color: 'var(--accent)', fontWeight: 'bold', marginRight: '2px' }}>x{event.giftData.steps}</span>
              )}
              <span className="text-[10px]">→ {event.teamFlag} <span style={{ color: event.teamColor }}>{event.teamName}</span></span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
