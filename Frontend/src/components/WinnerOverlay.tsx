// ─── Winner Overlay ─── Full-screen winner celebration ───
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import { GlitchText } from './GlitchText.js';
import type { Team } from '../types/index.js';

interface WinnerOverlayProps {
  winner: Team;
  onClose?: () => void;
}

export function WinnerOverlay({ winner, onClose }: WinnerOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!overlayRef.current || !contentRef.current) return;

    const tl = gsap.timeline();

    // Overlay fade in
    tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });

    // Content scale + bounce
    tl.fromTo(
      contentRef.current,
      { scale: 0, rotation: -5 },
      { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.7)' },
      '-=0.1'
    );

    // After 3.5 seconds, navigate to leaderboard
    const timer = setTimeout(() => {
      if (onClose) onClose();
      navigate('/leaderboard');
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigate, onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9998] flex items-center justify-center"
      style={{
        background: 'rgba(10, 10, 15, 0.92)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div ref={contentRef} className="text-center">
        {/* Winner flag */}
        <div
          className="text-8xl mb-4"
          style={{
            filter: `drop-shadow(0 0 30px ${winner.color}80)`,
          }}
        >
          {winner.flag}
        </div>

        {/* Winner text */}
        <GlitchText text="🏆 WINNER!" as="h1" className="text-5xl md:text-7xl mb-4" >
          <span style={{ color: winner.color }}>🏆 WINNER!</span>
        </GlitchText>

        {/* Country name */}
        <h2
          className="text-3xl md:text-5xl font-bold uppercase tracking-widest mb-6"
          style={{
            fontFamily: 'var(--font-heading)',
            color: winner.color,
            textShadow: `0 0 20px ${winner.color}60, 0 0 40px ${winner.color}30`,
          }}
        >
          {winner.name}
        </h2>

        {/* Decorative sparks */}
        <div className="flex justify-center gap-4 text-2xl animate-pulse">
          <span>⚡</span>
          <span>✨</span>
          <span>⚡</span>
          <span>✨</span>
          <span>⚡</span>
        </div>

        <p
          className="mt-6 text-sm uppercase tracking-widest"
          style={{
            fontFamily: 'var(--font-label)',
            color: 'var(--muted-fg)',
          }}
        >
          Redirecting to leaderboard...
        </p>
      </div>
    </div>
  );
}
