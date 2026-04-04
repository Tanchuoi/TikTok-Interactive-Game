// ─── Settings Screen ─── Game configuration + TikTok connection ───
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlitchText } from '../components/GlitchText.js';
import { useSocketStore } from '../stores/useSocketStore.js';
import { useGameStore } from '../stores/useGameStore.js';
import { COUNTRIES, DEFAULT_SELECTED_IDS } from '../lib/countries.js';
import { TIKTOK_GIFTS } from '../lib/gifts.js';
import * as api from '../lib/api.js';
import type { TeamConfig } from '../types/index.js';

export function SettingsScreen() {
  const navigate = useNavigate();
  const tiktokConnected = useSocketStore(s => s.tiktokConnected);
  const winHistory = useGameStore(s => s.winHistory);

  // ─── Local State ───
  const [username, setUsername] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>(DEFAULT_SELECTED_IDS);
  const [giftMapping, setGiftMapping] = useState<Record<string, number>>({});
  const [trackLength, setTrackLength] = useState(50);
  const [isStarting, setIsStarting] = useState(false);

  // ─── Initialize default gift mapping ───
  useEffect(() => {
    const mapping: Record<string, number> = {};
    DEFAULT_SELECTED_IDS.forEach((id, i) => {
      if (TIKTOK_GIFTS[i]) {
        mapping[id] = TIKTOK_GIFTS[i].giftId;
      }
    });
    setGiftMapping(mapping);
  }, []);

  // ─── Handlers ───
  const handleConnect = async () => {
    if (!username.trim()) return;
    setConnecting(true);
    setConnectionError('');
    try {
      const result = await api.connectTikTok(username.trim());
      if (!result.success) {
        setConnectionError(result.error || 'Connection failed');
      }
    } catch {
      setConnectionError('Network error');
    }
    setConnecting(false);
  };

  const handleDisconnect = async () => {
    await api.disconnectTikTok();
  };

  const toggleCountry = useCallback((id: string) => {
    setSelectedCountries(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 2) return prev; // minimum 2
        const next = prev.filter(c => c !== id);
        // Remove from gift mapping
        setGiftMapping(m => {
          const copy = { ...m };
          delete copy[id];
          return copy;
        });
        return next;
      }
      if (prev.length >= 12) return prev; // maximum 12
      // Auto-assign a gift
      const usedGifts = Object.values(giftMapping);
      const available = TIKTOK_GIFTS.find(g => !usedGifts.includes(g.giftId));
      if (available) {
        setGiftMapping(m => ({ ...m, [id]: available.giftId }));
      }
      return [...prev, id];
    });
  }, [giftMapping]);

  const handleGiftChange = useCallback((countryId: string, giftId: number) => {
    setGiftMapping(prev => ({ ...prev, [countryId]: giftId }));
  }, []);

  const handleStartMock = async () => {
    // Setup + start + mock in sequence
    await setupAndStart(true);
  };

  const handleStartRace = async () => {
    await setupAndStart(false);
  };

  const setupAndStart = async (mockMode: boolean) => {
    if (selectedCountries.length < 2) return;
    setIsStarting(true);

    try {
      // Build team configs
      const teams: TeamConfig[] = selectedCountries.map(id => {
        const country = COUNTRIES.find(c => c.id === id)!;
        const giftId = giftMapping[id] || TIKTOK_GIFTS[0].giftId;
        const gift = TIKTOK_GIFTS.find(g => g.giftId === giftId);
        return {
          id: country.id,
          name: country.name,
          flag: country.flag,
          flagImage: country.flagImage,
          color: country.color,
          giftId,
          giftName: gift?.name || 'Gift',
        };
      });

      // Setup game
      const setupResult = await api.setupGame(teams, trackLength);
      if (!setupResult.success) {
        console.error('Setup failed:', setupResult.error);
        setIsStarting(false);
        return;
      }

      // Start game
      const startResult = await api.startGame();
      if (!startResult.success) {
        console.error('Start failed:', startResult.error);
        setIsStarting(false);
        return;
      }

      // Start mock if needed
      if (mockMode) {
        await api.startMockGifts(600);
      }

      // Navigate to race screen
      navigate('/race');
    } catch (err) {
      console.error('Error starting game:', err);
    }
    setIsStarting(false);
  };

  const handleClearLeaderboard = async () => {
    await api.clearLeaderboard();
    // Refetch state
    const state = await api.getGameState();
    useGameStore.getState().setFullState(state);
  };

  // ─── Win history aggregation ───
  const winCounts: Record<string, { name: string; flag: string; wins: number }> = {};
  winHistory.forEach(w => {
    if (!winCounts[w.teamId]) {
      winCounts[w.teamId] = { name: w.teamName, flag: w.flag, wins: 0 };
    }
    winCounts[w.teamId].wins++;
  });
  const sortedWins = Object.entries(winCounts)
    .sort(([, a], [, b]) => b.wins - a.wins);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      {/* ─── Title ─── */}
      <div className="text-center mb-8">
        <GlitchText text="TIKTOK NATION RACE" as="h1" className="text-4xl md:text-6xl lg:text-7xl mb-2">
          <span style={{ color: 'var(--accent)' }}>TIKTOK</span>{' '}
          <span style={{ color: 'var(--accent-secondary)' }}>NATION</span>{' '}
          <span style={{ color: 'var(--accent-tertiary)' }}>RACE</span>
        </GlitchText>
        <p
          className="text-sm uppercase tracking-widest mt-3"
          style={{ fontFamily: 'var(--font-label)', color: 'var(--muted-fg)' }}
        >
          {'>'} Real-time interactive game for TikTok Live
          <span className="blink-cursor" />
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Left Column: Connection + Config ─── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* CONNECTION TERMINAL */}
          <div className="cyber-card-terminal cyber-chamfer p-4 pt-10">
            <h2
              className="text-sm uppercase tracking-widest mb-4"
              style={{ fontFamily: 'var(--font-label)', color: 'var(--accent)' }}
            >
              {'>'} Connection Terminal
            </h2>

            <div className="flex gap-3 mb-3">
              <div className="cyber-input-wrapper flex-1">
                <input
                  className="cyber-input cyber-chamfer-sm"
                  type="text"
                  placeholder="enter_tiktok_username..."
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleConnect()}
                  disabled={tiktokConnected}
                />
              </div>
              {!tiktokConnected ? (
                <button
                  className="cyber-btn cyber-chamfer-sm"
                  onClick={handleConnect}
                  disabled={connecting || !username.trim()}
                  style={{ opacity: connecting || !username.trim() ? 0.5 : 1 }}
                >
                  {connecting ? 'Connecting...' : 'Connect'}
                </button>
              ) : (
                <button
                  className="cyber-btn cyber-btn-destructive cyber-chamfer-sm"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </button>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 text-xs" style={{ fontFamily: 'var(--font-label)' }}>
              <span className={`status-dot ${tiktokConnected ? 'status-dot-online' : 'status-dot-offline'}`} />
              <span style={{ color: tiktokConnected ? 'var(--accent)' : 'var(--muted-fg)' }}>
                {tiktokConnected ? `Connected to @${username}` : 'Disconnected'}
              </span>
            </div>

            {connectionError && (
              <p className="text-xs mt-2" style={{ color: 'var(--destructive)' }}>
                Error: {connectionError}
              </p>
            )}
          </div>

          {/* RACE CONFIGURATION */}
          <div className="cyber-card cyber-chamfer p-4">
            <h2
              className="text-sm uppercase tracking-widest mb-4"
              style={{ fontFamily: 'var(--font-label)', color: 'var(--accent)' }}
            >
              {'>'} Race Configuration
            </h2>

            {/* Track Length */}
            <div className="mb-6">
              <label
                className="block text-xs uppercase tracking-widest mb-2"
                style={{ fontFamily: 'var(--font-label)', color: 'var(--muted-fg)' }}
              >
                Track Length: <span style={{ color: 'var(--accent)' }}>{trackLength}</span> steps
              </label>
              <input
                type="range"
                className="cyber-range"
                min={10}
                max={200}
                step={5}
                value={trackLength}
                onChange={e => setTrackLength(Number(e.target.value))}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--muted-fg)', fontFamily: 'var(--font-label)' }}>
                <span>10</span>
                <span>200</span>
              </div>
            </div>

            {/* Country Selection */}
            <div className="mb-6">
              <label
                className="block text-xs uppercase tracking-widest mb-3"
                style={{ fontFamily: 'var(--font-label)', color: 'var(--muted-fg)' }}
              >
                Select Nations ({selectedCountries.length}/12):
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                {COUNTRIES.map(country => {
                  const isSelected = selectedCountries.includes(country.id);
                  return (
                    <button
                      key={country.id}
                      onClick={() => toggleCountry(country.id)}
                      className="cyber-chamfer-sm p-2 text-center transition-all duration-150 cursor-pointer"
                      style={{
                        background: isSelected ? `${country.color}20` : 'var(--card)',
                        border: `1px solid ${isSelected ? country.color : 'var(--border)'}`,
                        boxShadow: isSelected ? `0 0 8px ${country.color}30` : 'none',
                      }}
                    >
                      <img src={country.flagImage} alt={country.name} className="w-8 h-5 object-cover mx-auto mb-0.5 rounded-sm" crossOrigin="anonymous" />
                      <div
                        className="text-[10px] uppercase tracking-wider font-bold"
                        style={{
                          fontFamily: 'var(--font-label)',
                          color: isSelected ? country.color : 'var(--muted-fg)',
                        }}
                      >
                        {country.name.slice(0, 6)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gift Mapping */}
            <div>
              <label
                className="block text-xs uppercase tracking-widest mb-3"
                style={{ fontFamily: 'var(--font-label)', color: 'var(--muted-fg)' }}
              >
                Gift → Nation Mapping:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedCountries.map(id => {
                  const country = COUNTRIES.find(c => c.id === id);
                  if (!country) return null;
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-2 p-2 cyber-chamfer-sm"
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <img src={country.flagImage} alt={country.name} className="w-6 h-4 object-cover rounded-sm" crossOrigin="anonymous" />
                      <span
                        className="text-xs font-bold uppercase flex-1"
                        style={{ fontFamily: 'var(--font-heading)', color: country.color }}
                      >
                        {country.name}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--muted-fg)' }}>←</span>
                      <select
                        className="cyber-select cyber-chamfer-sm text-xs"
                        value={giftMapping[id] || ''}
                        onChange={e => handleGiftChange(id, Number(e.target.value))}
                      >
                        {TIKTOK_GIFTS.map(gift => (
                          <option key={gift.giftId} value={gift.giftId}>
                            {gift.emoji} {gift.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* START BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="cyber-btn-glitch cyber-chamfer flex-1 text-lg"
              onClick={handleStartRace}
              disabled={isStarting || selectedCountries.length < 2}
              style={{
                opacity: isStarting || selectedCountries.length < 2 ? 0.5 : 1,
                fontFamily: 'var(--font-heading)',
              }}
            >
              {isStarting ? '⏳ Starting...' : '⚡ START RACE ⚡'}
            </button>
            <button
              className="cyber-btn cyber-btn-secondary cyber-chamfer-sm"
              onClick={handleStartMock}
              disabled={isStarting}
              style={{ opacity: isStarting ? 0.5 : 1 }}
            >
              🤖 Mock Mode
            </button>
          </div>
        </div>

        {/* ─── Right Column: Leaderboard ─── */}
        <div className="flex flex-col gap-4">
          <div className="cyber-card-holographic cyber-chamfer p-4">
            <h2
              className="text-sm uppercase tracking-widest mb-4"
              style={{ fontFamily: 'var(--font-label)', color: 'var(--accent)' }}
            >
              🏆 Nation Wins
            </h2>

            {sortedWins.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--muted-fg)' }}>
                No races completed yet
                <span className="blink-cursor" />
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {sortedWins.map(([teamId, data], i) => (
                  <div
                    key={teamId}
                    className="flex items-center gap-2 p-2 cyber-chamfer-sm"
                    style={{
                      background: i === 0 ? 'rgba(255, 215, 0, 0.08)' : 'var(--bg)',
                      border: `1px solid ${i === 0 ? 'var(--gold)' : 'var(--border)'}`,
                    }}
                  >
                    <span className="text-xs font-bold w-5 text-center" style={{ color: 'var(--muted-fg)' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                    </span>
                    <span className="text-lg">{data.flag}</span>
                    <span className="text-xs font-bold flex-1 uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
                      {data.name}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}
                    >
                      {data.wins}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {sortedWins.length > 0 && (
              <button
                className="cyber-btn cyber-btn-destructive cyber-chamfer-sm w-full mt-4 text-xs"
                onClick={handleClearLeaderboard}
              >
                Reset Leaderboard
              </button>
            )}
          </div>

          {/* Connection info panel */}
          <div className="cyber-card cyber-chamfer-sm p-3">
            <h3
              className="text-xs uppercase tracking-widest mb-2"
              style={{ fontFamily: 'var(--font-label)', color: 'var(--accent-tertiary)' }}
            >
              {'>'} System Info
            </h3>
            <div className="flex flex-col gap-1 text-xs" style={{ fontFamily: 'var(--font-label)', color: 'var(--muted-fg)' }}>
              <div>Nations: <span style={{ color: 'var(--fg)' }}>{selectedCountries.length}</span></div>
              <div>Track: <span style={{ color: 'var(--fg)' }}>{trackLength} steps</span></div>
              <div>TikTok: <span style={{ color: tiktokConnected ? 'var(--accent)' : 'var(--destructive)' }}>
                {tiktokConnected ? 'Online' : 'Offline'}
              </span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
