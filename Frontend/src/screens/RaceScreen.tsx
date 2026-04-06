// ─── Race Screen ─── Live race with 3D animated tracks ───
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RaceScene3D } from '../components/3d/RaceScene3D.js';
import { LiveFeed } from '../components/LiveFeed.js';
import { GiftPopup } from '../components/GiftPopup.js';
import { WinnerOverlay } from '../components/WinnerOverlay.js';
import { useGameStore } from '../stores/useGameStore.js';
import { useSocketStore } from '../stores/useSocketStore.js';
import * as api from '../lib/api.js';

export function RaceScreen() {
  const navigate = useNavigate();
  const status = useGameStore(s => s.status);
  const teams = useGameStore(s => s.teams);
  const trackLength = useGameStore(s => s.trackLength);
  const winner = useGameStore(s => s.winner);
  const winHistory = useGameStore(s => s.winHistory);
  const recentGifts = useGameStore(s => s.recentGifts);
  const topLikers = useGameStore(s => s.topLikers);
  const [showWinner, setShowWinner] = useState(false);
  const viewerCount = useSocketStore(s => s.viewerCount);

  // Redirect if no game
  useEffect(() => {
    if (status === 'idle') {
      navigate('/');
    }
  }, [status, navigate]);

  // Show winner overlay
  useEffect(() => {
    if (status === 'finished' && winner) {
      setShowWinner(true);
    }
  }, [status, winner]);

  // Sort teams by position (descending) for ranking
  const sortedTeams = [...teams].sort((a, b) => b.position - a.position);

  // Win counts for sidebar
  const winCounts: Record<string, { name: string; flag: string; wins: number }> = {};
  winHistory.forEach(w => {
    if (!winCounts[w.teamId]) {
      winCounts[w.teamId] = { name: w.teamName, flag: w.flag, wins: 0 };
    }
    winCounts[w.teamId].wins++;
  });
  const sortedWins = Object.entries(winCounts).sort(([, a], [, b]) => b.wins - a.wins);

  // Top donors across all teams
  const allDonors = teams
    .flatMap(t => t.donors.map(d => ({ ...d, teamName: t.name, teamFlag: t.flag })))
    .sort((a, b) => b.giftCount - a.giftCount)
    .slice(0, 5);

  const handleReset = async () => {
    await api.resetGame();
    navigate('/');
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <h1
            className="text-lg md:text-2xl font-bold uppercase tracking-wider"
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--accent)',
              textShadow: '0 0 10px rgba(0, 255, 136, 0.3)',
            }}
          >
            ⚡ Nation Race
          </h1>
          <div
            className="text-xs uppercase tracking-wider px-3 py-1 cyber-chamfer-sm"
            style={{
              fontFamily: 'var(--font-label)',
              border: '1px solid var(--border)',
              color: status === 'racing' ? 'var(--accent)' : 'var(--warning)',
              background: status === 'racing' ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255, 170, 0, 0.05)',
            }}
          >
            {status === 'racing' ? '● LIVE' : status === 'finished' ? '● FINISHED' : '● WAITING'}
          </div>
          <span
            className="text-xs"
            style={{ fontFamily: 'var(--font-label)', color: 'var(--muted-fg)' }}
          >
            Track: {trackLength} steps
          </span>
          <div className="h-4 w-[1px] bg-[var(--border)] mx-1" />
          <span
            className="text-xs flex items-center gap-1.5"
            style={{ fontFamily: 'var(--font-label)', color: 'var(--accent)' }}
          >
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            {viewerCount.toLocaleString()} Viewers
          </span>
        </div>
        <button
          className="cyber-btn cyber-btn-ghost cyber-chamfer-sm text-xs"
          onClick={handleReset}
        >
          ← Settings
        </button>
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex flex-1 overflow-hidden">
        {/* 3D Race Scene — takes most of the space */}
        <div className="flex-1 relative">
          <RaceScene3D
            teams={sortedTeams}
            trackLength={trackLength}
            winnerId={winner?.id}
          />

          {/* Floating progress bars overlay */}
          <div
            className="absolute left-4 top-4 flex flex-col gap-2.5 z-10"
            style={{
              background: 'rgba(10, 10, 30, 0.85)',
              borderRadius: '8px',
              padding: '20px 24px',
              border: '1px solid var(--border)',
              backdropFilter: 'blur(8px)',
              minWidth: '280px',
            }}
          >
            <div className="text-sm uppercase tracking-widest mb-3" style={{ fontFamily: 'var(--font-label)', color: 'var(--accent-tertiary)' }}>
              Race Progress
            </div>
            {sortedTeams.map((team, i) => {
              const pct = Math.round((team.position / trackLength) * 100);
              return (
                <div key={team.id} className="flex items-center gap-2.5">
                  <span className="text-sm w-4 text-center font-bold" style={{ color: 'var(--muted-fg)' }}>
                    {i + 1}
                  </span>
                  <img
                    src={team.flagImage}
                    alt={team.name}
                    className="w-8 h-6 object-cover rounded-[2px]"
                    crossOrigin="anonymous"
                  />
                  {team.giftImageUrl ? (
                    <img src={team.giftImageUrl} alt={team.giftName} className="w-8 h-8 object-contain shrink-0" crossOrigin="anonymous" title={team.giftName} />
                  ) : (
                    <span className="text-base shrink-0" title={team.giftName}>🎁</span>
                  )}
                  <div className="flex-1 h-3.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: team.color,
                        boxShadow: `0 0 6px ${team.color}80`,
                      }}
                    />
                  </div>
                  <span
                    className="text-sm font-bold w-10 text-right"
                    style={{ fontFamily: 'var(--font-label)', color: team.color }}
                  >
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Right Sidebar ─── */}
        <div
          className="w-80 flex-shrink-0 flex flex-col gap-4 p-4 overflow-y-auto"
          style={{ borderLeft: '1px solid var(--border)', background: 'rgba(10, 10, 30, 0.5)' }}
        >
          {/* Nation Wins */}
          <div className="cyber-card-holographic cyber-chamfer-sm" style={{ padding: '16px' }}>
            <h3
              className="text-[10px] uppercase tracking-widest mb-2"
              style={{ fontFamily: 'var(--font-label)', color: 'var(--gold)' }}
            >
              🏆 Nation Wins
            </h3>
            {sortedWins.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--muted-fg)' }}>First race!</p>
            ) : (
              <div className="flex flex-col gap-1">
                {sortedWins.slice(0, 6).map(([teamId, data], i) => (
                  <div key={teamId} className="flex items-center gap-1.5 text-[10px]">
                    <span className="w-3 text-center">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                    </span>
                    <span>{data.flag}</span>
                    <span className="flex-1 uppercase font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                      {data.name}
                    </span>
                    <span className="font-bold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>
                      {data.wins}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Donors */}
          <div className="cyber-card cyber-chamfer-sm" style={{ padding: '16px' }}>
            <h3
              className="text-[10px] uppercase tracking-widest mb-3"
              style={{ fontFamily: 'var(--font-label)', color: 'var(--accent-secondary)' }}
            >
              💎 Top Donors
            </h3>
            {allDonors.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--muted-fg)' }}>No donors yet<span className="blink-cursor" /></p>
            ) : (
              <div className="flex flex-col gap-1">
                {allDonors.map((donor, i) => (
                  <div
                    key={donor.userId}
                    className="flex items-center gap-2 text-xs"
                    style={{
                      borderLeft: i < 3 ? `3px solid var(--accent-secondary)` : '3px solid transparent',
                      paddingLeft: '8px',
                      paddingTop: '2px',
                      paddingBottom: '2px',
                    }}
                  >
                    <span className="font-bold w-4 text-center" style={{ color: 'var(--muted-fg)' }}>
                      {i + 1}
                    </span>
                    <span>{donor.teamFlag}</span>
                    {donor.userAvatar && (
                      <img
                        src={donor.userAvatar}
                        alt="Avatar"
                        className="w-5 h-5 rounded-full object-cover shrink-0"
                        crossOrigin="anonymous"
                      />
                    )}
                    <span className="flex-1 truncate" style={{ color: 'var(--fg)' }}>
                      {donor.userName}
                    </span>
                    <span
                      className="font-bold"
                      style={{ color: 'var(--accent-secondary)', fontFamily: 'var(--font-heading)' }}
                    >
                      {donor.giftCount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Likes */}
          <div className="cyber-card cyber-chamfer-sm" style={{ padding: '16px' }}>
            <h3
              className="text-[10px] uppercase tracking-widest mb-3"
              style={{ fontFamily: 'var(--font-label)', color: 'var(--accent)' }}
            >
              ❤️ Top Likes
            </h3>
            {topLikers.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--muted-fg)' }}>No likes yet<span className="blink-cursor" /></p>
            ) : (
              <div className="flex flex-col gap-1">
                {topLikers.slice(0, 5).map((liker, i) => (
                  <div
                    key={liker.userId}
                    className="flex items-center gap-2 text-xs"
                    style={{
                      borderLeft: i < 3 ? `3px solid var(--accent)` : '3px solid transparent',
                      paddingLeft: '8px',
                      paddingTop: '2px',
                      paddingBottom: '2px',
                    }}
                  >
                    <span className="font-bold w-4 text-center" style={{ color: 'var(--muted-fg)' }}>
                      {i + 1}
                    </span>
                    {liker.userAvatar && (
                      <img
                        src={liker.userAvatar}
                        alt="Avatar"
                        className="w-5 h-5 rounded-full object-cover shrink-0"
                        crossOrigin="anonymous"
                      />
                    )}
                    <span className="flex-1 truncate" style={{ color: 'var(--fg)' }}>
                      {liker.userName}
                    </span>
                    <span
                      className="font-bold"
                      style={{ color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}
                    >
                      {liker.likeCount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Feed */}
          <div className="flex-1 min-h-0">
            <LiveFeed events={recentGifts} />
          </div>
        </div>
      </div>

      {/* ─── Toast Notifications ─── */}
      <GiftPopup />

      {/* ─── Winner Overlay ─── */}
      {showWinner && winner && (
        <WinnerOverlay
          winner={winner}
          onClose={() => setShowWinner(false)}
        />
      )}
    </div>
  );
}
