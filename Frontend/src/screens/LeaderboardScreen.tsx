// ─── Leaderboard Screen ─── Post-race results with 3D trophy + auto-restart ───
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { GlitchText } from '../components/GlitchText.js';
import { WinnerScene3D } from '../components/3d/WinnerScene3D.js';
import { useGameStore } from '../stores/useGameStore.js';

const AUTO_RESTART_SECONDS = 15;

export function LeaderboardScreen() {
  const navigate = useNavigate();
  const winner = useGameStore(s => s.winner);
  const standings = useGameStore(s => s.standings);
  const trackLength = useGameStore(s => s.trackLength);
  const [countdown, setCountdown] = useState(AUTO_RESTART_SECONDS);

  const standingsRef = useRef<HTMLDivElement>(null);

  // ─── Countdown timer ───
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  // ─── GSAP entrance animation ───
  useEffect(() => {
    if (!standingsRef.current) return;

    const standingItems = standingsRef.current.querySelectorAll('.standing-item');
    gsap.fromTo(
      standingItems,
      { x: -30, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.5,
      }
    );
  }, [standings]);

  // Guard: redirect if no data
  useEffect(() => {
    if (!winner && standings.length === 0) {
      navigate('/');
    }
  }, [winner, standings, navigate]);

  if (!winner || standings.length === 0) return null;

  const rest = standings.slice(3);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* ─── Title ─── */}
      <div className="text-center py-3 flex-shrink-0">
        <GlitchText text="RACE RESULTS" as="h1" className="text-3xl md:text-5xl mb-1">
          <span style={{ color: 'var(--accent)' }}>RACE</span>{' '}
          <span style={{ color: 'var(--accent-tertiary)' }}>RESULTS</span>
        </GlitchText>
      </div>

      {/* ─── Main Content: 3D Scene + Standings ─── */}
      <div className="flex flex-1 overflow-hidden">
        {/* 3D Trophy + Podium Scene */}
        <div className="flex-1 relative">
          <WinnerScene3D standings={standings} />

          {/* Winner name overlay */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center z-10"
            style={{
              background: 'rgba(10, 10, 30, 0.85)',
              borderRadius: '12px',
              padding: '8px 24px',
              border: '1px solid var(--gold)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <p
              className="text-xs uppercase tracking-widest mb-0.5"
              style={{ fontFamily: 'var(--font-label)', color: 'var(--gold)' }}
            >
              🏆 Champion
            </p>
            <p
              className="text-xl font-bold uppercase tracking-wider"
              style={{
                fontFamily: 'var(--font-heading)',
                color: winner.color,
                textShadow: `0 0 15px ${winner.color}60`,
              }}
            >
              {winner.flag} {winner.name}
            </p>
          </div>
        </div>

        {/* ─── Right Panel: Standings + Actions ─── */}
        <div
          className="w-80 flex-shrink-0 flex flex-col p-4 overflow-y-auto"
          style={{ borderLeft: '1px solid var(--border)', background: 'rgba(10, 10, 30, 0.5)' }}
        >
          {/* Top 3 Cards */}
          <div className="flex flex-col gap-2 mb-4">
            {standings.slice(0, 3).map((team, i) => {
              const pct = Math.round((team.position / trackLength) * 100);
              const medals = ['🥇', '🥈', '🥉'];
              const colors = ['var(--gold)', 'var(--silver)', 'var(--bronze)'];
              const topDonors = team.donors.slice(0, 2);

              return (
                <div
                  key={team.id}
                  className="cyber-card cyber-chamfer-sm p-3"
                  style={{
                    borderLeftWidth: '3px',
                    borderLeftStyle: 'solid',
                    borderLeftColor: colors[i],
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{medals[i]}</span>
                    <img
                      src={team.flagImage}
                      alt={team.name}
                      className="w-8 h-5 object-cover rounded-sm"
                    />
                    <span
                      className="flex-1 text-sm font-bold uppercase"
                      style={{ fontFamily: 'var(--font-heading)', color: colors[i] }}
                    >
                      {team.name}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ fontFamily: 'var(--font-heading)', color: 'var(--fg)' }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <p
                    className="text-[10px] mb-1"
                    style={{ fontFamily: 'var(--font-label)', color: 'var(--muted-fg)' }}
                  >
                    {team.position}/{trackLength} steps
                  </p>
                  {topDonors.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {topDonors.map(d => (
                        <span key={d.userId} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg)', color: 'var(--accent)' }}>
                          {d.userName} ({d.giftCount})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Remaining standings */}
          {rest.length > 0 && (
            <div ref={standingsRef} className="cyber-card cyber-chamfer-sm p-3 mb-4">
              <h3
                className="text-[10px] uppercase tracking-widest mb-2"
                style={{ fontFamily: 'var(--font-label)', color: 'var(--accent-tertiary)' }}
              >
                {'>'} Full Standings
              </h3>
              <div className="flex flex-col gap-1">
                {rest.map((team, i) => {
                  const pct = Math.round((team.position / trackLength) * 100);
                  return (
                    <div
                      key={team.id}
                      className="standing-item flex items-center gap-2 text-xs"
                    >
                      <span className="w-4 text-center font-bold" style={{ color: 'var(--muted-fg)' }}>
                        {i + 4}
                      </span>
                      <img
                        src={team.flagImage}
                        alt={team.name}
                        className="w-5 h-3 object-cover rounded-[2px]"
                      />
                      <span className="flex-1 font-bold uppercase" style={{ fontFamily: 'var(--font-heading)', color: team.color }}>
                        {team.name}
                      </span>
                      <span style={{ fontFamily: 'var(--font-label)', color: 'var(--muted-fg)' }}>
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Countdown + Buttons */}
          <div className="mt-auto text-center">
            <p
              className="text-xs uppercase tracking-widest mb-3"
              style={{ fontFamily: 'var(--font-label)', color: 'var(--muted-fg)' }}
            >
              Next race in:{' '}
              <span
                className="text-xl font-bold"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: countdown <= 5 ? 'var(--destructive)' : 'var(--accent)',
                  textShadow: countdown <= 5 ? '0 0 10px rgba(255, 51, 102, 0.5)' : '0 0 10px rgba(0, 255, 136, 0.3)',
                }}
              >
                {countdown}
              </span>
              {' '}seconds
            </p>

            <div className="flex gap-3 justify-center">
              <button
                className="cyber-btn-glitch cyber-chamfer text-sm"
                onClick={() => navigate('/')}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                ⚡ Play Again
              </button>
              <button
                className="cyber-btn cyber-chamfer-sm text-xs"
                onClick={() => navigate('/')}
              >
                ← Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
