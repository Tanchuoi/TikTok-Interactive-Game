// ─── Race Track Lane ─── Individual team track with GSAP animation ───
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import type { Team } from '../types/index.js';

interface RaceTrackProps {
  team: Team;
  trackLength: number;
  rank: number;
  isWinner: boolean;
}

export function RaceTrack({ team, trackLength, rank, isWinner }: RaceTrackProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const laneRef = useRef<HTMLDivElement>(null);

  const percentage = Math.min(Math.round((team.position / trackLength) * 100), 100);

  // Animate bar width with GSAP
  useEffect(() => {
    if (barRef.current) {
      gsap.to(barRef.current, {
        width: `${percentage}%`,
        duration: 0.4,
        ease: 'power2.out',
      });
    }
  }, [percentage]);

  // Winner explosion effect
  useEffect(() => {
    if (isWinner && laneRef.current) {
      gsap.timeline()
        .to(laneRef.current, {
          scale: 1.02,
          duration: 0.15,
          ease: 'power2.out',
        })
        .to(laneRef.current, {
          scale: 1,
          duration: 0.3,
          ease: 'elastic.out(1, 0.5)',
        });
    }
  }, [isWinner]);

  return (
    <div
      ref={laneRef}
      className="race-lane cyber-chamfer-sm"
      style={{
        borderColor: isWinner ? team.color : undefined,
        boxShadow: isWinner ? `0 0 15px ${team.color}60, 0 0 30px ${team.color}30` : undefined,
      }}
    >
      {/* Progress bar */}
      <div
        ref={barRef}
        className="race-lane-bar"
        style={{
          background: `linear-gradient(90deg, ${team.color}40, ${team.color}80)`,
          width: '0%',
          boxShadow: `inset 0 0 20px ${team.color}30`,
        }}
      />

      {/* Finish line */}
      <div className="race-lane-finish" />

      {/* Content overlay */}
      <div className="flex items-center justify-between px-3 h-full relative z-10">
        {/* Left: Rank + Flag + Name */}
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold w-5 text-center"
            style={{
              fontFamily: 'var(--font-label)',
              color: 'var(--muted-fg)',
            }}
          >
            {rank}
          </span>
          <span className="text-xl">{team.flag}</span>
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{
              fontFamily: 'var(--font-heading)',
              color: team.color,
              textShadow: `0 0 8px ${team.color}50`,
            }}
          >
            {team.name}
          </span>
        </div>

        {/* Right: Position + Percentage */}
        <div className="flex items-center gap-3">
          <span
            className="text-xs"
            style={{
              fontFamily: 'var(--font-label)',
              color: 'var(--muted-fg)',
            }}
          >
            {team.position}/{trackLength}
          </span>
          <span
            ref={percentRef}
            className="text-sm font-bold min-w-[3rem] text-right"
            style={{
              fontFamily: 'var(--font-heading)',
              color: percentage >= 80 ? team.color : 'var(--fg)',
              textShadow: percentage >= 80 ? `0 0 10px ${team.color}60` : 'none',
            }}
          >
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
}
