// ─── RaceGround ─── Textured 3D road surface with lane markings ───
import React from 'react';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RaceGroundProps {
  laneCount: number;
  laneWidth: number;
  trackLength: number;
}

export function RaceGround({ laneCount, laneWidth, trackLength }: RaceGroundProps) {
  const totalWidth = laneCount * laneWidth;
  const gridRef = useRef<THREE.Mesh>(null);

  // Create the asphalt texture procedurally
  const groundTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Dark asphalt base
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle noise
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const alpha = Math.random() * 0.08;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(x, y, 1, 1);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 8);
    return texture;
  }, []);

  // Lane divider lines
  const laneLines = useMemo(() => {
    const lines: React.ReactNode[] = [];
    for (let i = 0; i <= laneCount; i++) {
      const x = (i - laneCount / 2) * laneWidth;
      const isEdge = i === 0 || i === laneCount;

      // Solid edge lines, dashed inner lines
      if (isEdge) {
        lines.push(
          <mesh
            key={`lane-${i}`}
            position={[x, 0.015, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.04, trackLength]} />
            <meshBasicMaterial color="#00ff88" transparent opacity={0.6} />
          </mesh>
        );
      } else {
        // Dashed center lines
        const dashCount = 16;
        const dashLength = trackLength / (dashCount * 2);
        for (let d = 0; d < dashCount; d++) {
          const zPos = -(trackLength / 2) + d * (dashLength * 2) + dashLength / 2;
          lines.push(
            <mesh
              key={`lane-${i}-dash-${d}`}
              position={[x, 0.015, zPos]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.03, dashLength * 0.8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
            </mesh>
          );
        }
      }
    }
    return lines;
  }, [laneCount, laneWidth, trackLength]);

  // Grid glow effect on ground edges
  const glowPulse = useRef(0);
  useFrame((_state, delta) => {
    glowPulse.current += delta;
    if (gridRef.current) {
      const mat = gridRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.02 + Math.sin(glowPulse.current * 2) * 0.01;
    }
  });

  // Start line
  const startLine = (
    <mesh
      position={[0, 0.016, trackLength / 2]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[totalWidth, 0.08]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
    </mesh>
  );

  return (
    <group>
      {/* Main ground plane */}
      <mesh
        ref={gridRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[totalWidth + 2, trackLength + 2]} />
        <meshStandardMaterial
          map={groundTexture}
          color="#16213e"
          roughness={0.9}
          metalness={0.1}
          emissive="#00ff88"
          emissiveIntensity={0.02}
        />
      </mesh>

      {/* Lane lines */}
      {laneLines}

      {/* Start line */}
      {startLine}

      {/* Side glow strips */}
      <mesh
        position={[-(totalWidth / 2 + 0.3), 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.15, trackLength]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={0.15} />
      </mesh>
      <mesh
        position={[(totalWidth / 2 + 0.3), 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.15, trackLength]} />
        <meshBasicMaterial color="#ff00ff" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}
