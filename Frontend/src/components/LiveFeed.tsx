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
      <div className="cyber-card cyber-chamfer-sm p-3">
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
    <div className="cyber-card cyber-chamfer-sm p-3">
      <h3
        className="text-xs uppercase tracking-widest mb-2"
        style={{ fontFamily: 'var(--font-label)', color: 'var(--accent)' }}
      >
        {'>'} Live Feed
      </h3>
      <div
        ref={containerRef}
        className="flex flex-col gap-1 max-h-[240px] overflow-y-auto"
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
            <span className="shrink-0">{event.teamFlag}</span>
            <span className="truncate" style={{ color: 'var(--muted-fg)' }}>
              <span style={{ color: 'var(--fg)' }}>{event.giftData.userName}</span>
              {' → '}
              <span style={{ color: event.teamColor }}>{event.teamName}</span>
              {event.giftData.steps > 1 && (
                <span style={{ color: 'var(--accent)' }}> x{event.giftData.steps}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
