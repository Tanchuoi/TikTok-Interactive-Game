// ─── RaceScene3D ─── Main Three.js Canvas for the race ───
import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo, useState, useEffect, useRef } from 'react';
import { RaceGround } from './RaceGround';
import { FlagRunner3D } from './FlagRunner3D';
import { FinishLine3D } from './FinishLine3D';
import { StartLine3D } from './StartLine3D';
import { FruitProjectile3D } from './FruitProjectile3D';
import { useGameStore } from '../../stores/useGameStore';
import type { Team, MoveEvent } from '../../types/index';

// Import fruits
import apple from '../../assets/img/fruits/apple.webp';
import banana from '../../assets/img/fruits/banana.webp';
import grapes from '../../assets/img/fruits/grapes.webp';
import kiwi from '../../assets/img/fruits/kiwi.webp';
import lime from '../../assets/img/fruits/lime.webp';
import mango from '../../assets/img/fruits/mango.webp';
import orange from '../../assets/img/fruits/orange.webp';
import pear from '../../assets/img/fruits/pear.webp';
import pineapple from '../../assets/img/fruits/pineapple.webp';
import strawberry from '../../assets/img/fruits/strawberry.webp';
import tomato from '../../assets/img/fruits/tomato.webp';
import watermelon from '../../assets/img/fruits/watermelon.webp';

// Sound effect
import dingSound from '../../assets/sound/ding-sound-effect.mp3';

const FRUITS = [apple, banana, grapes, kiwi, lime, mango, orange, pear, pineapple, strawberry, tomato, watermelon];

import { useTexture } from '@react-three/drei';
// Preload textures to avoid black screen flash on map update
FRUITS.forEach(fruit => useTexture.preload(fruit));

interface RaceScene3DProps {
  teams: Team[];
  trackLength: number;
  winnerId?: string;
}

interface ActiveFruit {
  id: string;
  fruitImage: string;
  startPosition: [number, number, number];
  targetPosition: [number, number, number];
  teamId: string;
  steps: number;
}

export function RaceScene3D({ teams, trackLength, winnerId }: RaceScene3DProps) {
  const recentGifts = useGameStore(s => s.recentGifts);
  const laneCount = teams.length;
  const laneWidth = 1.4;
  const totalWidth = laneCount * laneWidth;
  const trackWorldLength = 16;
  const startZ = trackWorldLength / 2 - 0.5;
  const finishZ = -(trackWorldLength / 2);

  // Visual positions (mapping teamId to position value)
  const [visualPositions, setVisualPositions] = useState<Record<string, number>>({});
  const [activeFruits, setActiveFruits] = useState<ActiveFruit[]>([]);
  const processedGifts = useRef<Set<MoveEvent>>(new Set());
  const dingAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    dingAudio.current = new Audio(dingSound);
  }, []);

  // Initialize visual positions for all teams
  useEffect(() => {
    setVisualPositions(prev => {
      const next = { ...prev };
      let changed = false;
      teams.forEach(t => {
        if (next[t.id] === undefined) {
          next[t.id] = t.position;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [teams]);

  // Handle new gifts
  useEffect(() => {
    if (recentGifts.length === 0) return;

    // Process all recent gifts that haven't been handled yet
    [...recentGifts].reverse().forEach(gift => {
      if (processedGifts.current.has(gift)) return;
      processedGifts.current.add(gift);

      const teamIndex = teams.findIndex(t => t.id === gift.teamId);
      if (teamIndex === -1) return;

      const laneX = (teamIndex - (laneCount - 1) / 2) * laneWidth;
      const fruitImage = FRUITS[Math.floor(Math.random() * FRUITS.length)];

      // Use visual position at the moment of spawning - ensure we don't use 0 if not initialized
      const currentPos = visualPositions[gift.teamId] ?? teams.find(t => t.id === gift.teamId)?.position ?? 0;
      const progress = Math.min(currentPos / trackLength, 1);
      const targetZ = startZ - progress * (trackWorldLength - 1);

      const newFruit: ActiveFruit = {
        id: Math.random().toString(36).substr(2, 9),
        fruitImage,
        startPosition: [laneX, 0.5, finishZ],
        targetPosition: [laneX, 0.5, targetZ],
        teamId: gift.teamId,
        steps: gift.giftData.steps
      };

      setActiveFruits(prev => [...prev, newFruit]);
    });

    if (processedGifts.current.size > 100) {
      const recentSet = new Set(recentGifts);
      processedGifts.current.forEach(g => {
        if (!recentSet.has(g)) processedGifts.current.delete(g);
      });
    }
  }, [recentGifts, teams, visualPositions, laneCount, laneWidth, startZ, finishZ, trackLength, trackWorldLength]);

  const handleFruitHit = (fruitId: string, teamId: string, steps: number) => {
    if (dingAudio.current) {
      dingAudio.current.currentTime = 0;
      dingAudio.current.play().catch(e => console.error("Sound play failed", e));
    }

    setVisualPositions(prev => {
      const team = teams.find(t => t.id === teamId);
      if (!team) return prev;

      const currentPos = prev[teamId] ?? team.position;
      const storePos = team.position;

      // We increment by steps, but cap at storePos to stay in sync
      const nextPos = Math.min(currentPos + steps, storePos);
      return { ...prev, [teamId]: nextPos };
    });

    setActiveFruits(prev => prev.filter(f => f.id !== fruitId));
  };

  // Sort by position to identify leader
  const currentPositions = teams.map(t => visualPositions[t.id] ?? t.position);
  const maxPos = Math.max(...currentPositions, 0);

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

          <fog attach="fog" args={['#0a0a1e', 15, 35]} />
          <color attach="background" args={['#0a0a1e']} />

          <group position={[1.4, 0, -2.5]}>
            <RaceGround
              laneCount={laneCount}
              laneWidth={laneWidth}
              trackLength={trackWorldLength}
            />

            <StartLine3D
              position={[0, 0.02, startZ]}
              width={totalWidth}
            />

            <FinishLine3D
              position={[0, 0.02, finishZ]}
              width={totalWidth}
            />

            {/* Fruits in the air */}
            {activeFruits.map(fruit => (
              <FruitProjectile3D
                key={fruit.id}
                id={fruit.id}
                fruitImage={fruit.fruitImage}
                startPosition={fruit.startPosition}
                targetPosition={fruit.targetPosition}
                onHit={() => handleFruitHit(fruit.id, fruit.teamId, fruit.steps)}
                teamId={fruit.teamId}
                targetPositionValue={fruit.steps}
              />
            ))}

            {/* Flag Runners */}
            {teams.map((team, index) => {
              const laneX = (index - (laneCount - 1) / 2) * laneWidth;
              const visualPos = visualPositions[team.id] ?? team.position;
              const progress = Math.min(visualPos / trackLength, 1);
              const zPos = startZ - progress * (trackWorldLength - 1);

              return (
                <FlagRunner3D
                  key={team.id}
                  team={team}
                  position={[laneX, 0.5, zPos]}
                  isLeading={visualPos > 0 && visualPos >= maxPos}
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
