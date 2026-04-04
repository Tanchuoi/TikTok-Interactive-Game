// ─── App.tsx ─── Root component with routing + socket init ───
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ScanlineOverlay } from './components/ScanlineOverlay.js';
import { useSocketStore } from './stores/useSocketStore.js';
import { useSocketListener } from './hooks/useSocketListener.js';
import { SettingsScreen } from './screens/SettingsScreen.js';
import { RaceScreen } from './screens/RaceScreen.js';
import { LeaderboardScreen } from './screens/LeaderboardScreen.js';

function AppInner() {
  const connect = useSocketStore(s => s.connect);

  // Connect socket on mount
  useEffect(() => {
    connect();
  }, [connect]);

  // Listen to socket events
  useSocketListener();

  return (
    <>
      <ScanlineOverlay />
      <Routes>
        <Route path="/" element={<SettingsScreen />} />
        <Route path="/race" element={<RaceScreen />} />
        <Route path="/leaderboard" element={<LeaderboardScreen />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
