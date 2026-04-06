// ─── RaceScene3D ─── Main Three.js Canvas for the race ───
import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo } from 'react';
import { RaceGround } from './RaceGround';
import { FlagRunner3D } from './FlagRunner3D';
import { FinishLine3D } from './FinishLine3D';
import { StartLine3D } from './StartLine3D';
import type { Team } from '../../types/index';

interface RaceScene3DProps {
  teams: Team[];
  trackLength: number;
  winnerId?: string;
}

export function RaceScene3D({ teams, trackLength, winnerId }: RaceScene3DProps) {
  const laneCount = teams.length;
  const laneWidth = 1.4;
  const totalWidth = laneCount * laneWidth;
  const trackWorldLength = 16;

  // Sort by position to identify leader
  const maxPos = Math.max(...teams.map(t => t.position), 0);

  // Camera adjusted for good isometric view
  const cameraPosition = useMemo<[number, number, number]>(() => {
    return [0, 12, 10];
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#0a0a1e' }}>
      <Canvas
        camera={{
          position: cameraPosition,
          fov: 45,
          near: 0.1,
          far: 200,
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ camera }) => {
          camera.lookAt(0, -1, -1);
        }}
      >
        <Suspense fallback={null}>
          {/* Strong lighting to ensure visibility */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[8, 15, 10]}
            intensity={1.8}
            castShadow
          />
          <directionalLight
            position={[-5, 10, -5]}
            intensity={0.5}
            color="#4488ff"
          />
          <pointLight position={[-6, 6, -8]} intensity={0.4} color="#00ff88" />
          <pointLight position={[6, 6, 8]} intensity={0.4} color="#ff00ff" />

          {/* Fog for depth */}
          <fog attach="fog" args={['#0a0a1e', 15, 35]} />

          {/* Background color */}
          <color attach="background" args={['#0a0a1e']} />

          <group position={[0, 0, -2.5]}>
            {/* Race Ground */}
            <RaceGround
              laneCount={laneCount}
              laneWidth={laneWidth}
              trackLength={trackWorldLength}
            />

            {/* Start Line */}
            <StartLine3D
              position={[0, 0.02, trackWorldLength / 2 - 0.5]}
              width={totalWidth}
            />

            {/* Finish Line */}
            <FinishLine3D
              position={[0, 0.02, -(trackWorldLength / 2)]}
              width={totalWidth}
            />

            {/* Flag Runners */}
            {teams.map((team, index) => {
              const laneX = (index - (laneCount - 1) / 2) * laneWidth;
              const progress = Math.min(team.position / trackLength, 1);
              const zPos = (trackWorldLength / 2 - 0.5) - progress * (trackWorldLength - 1);

              return (
                <FlagRunner3D
                  key={team.id}
                  team={team}
                  position={[laneX, 0.5, zPos]}
                  isLeading={team.position > 0 && team.position >= maxPos}
                  isWinner={winnerId === team.id}
                  progress={progress}
                />
              );
            })}
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
}
