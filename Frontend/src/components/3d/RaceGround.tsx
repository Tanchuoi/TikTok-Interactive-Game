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

  // Dashed lines texture
  const dashTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    
    // Transparent background
    ctx.fillStyle = 'rgba(255,255,255,0)';
    ctx.fillRect(0, 0, 64, 128);
    // Draw the dash taking roughly half the height
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 32, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 16);
    return texture;
  }, []);

  // Lane divider lines
  const laneLines = useMemo(() => {
    const solidLines: React.ReactNode[] = [];
    const dashedLines: React.ReactNode[] = [];
    
    for (let i = 0; i <= laneCount; i++) {
      const x = (i - laneCount / 2) * laneWidth;
      const isEdge = i === 0 || i === laneCount;

      // Solid edge lines, dashed inner lines
      if (isEdge) {
        solidLines.push(
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
        // Shared dashed line texture
        dashedLines.push(
          <mesh
            key={`lane-${i}-dash`}
            position={[x, 0.015, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.03, trackLength]} />
            <meshBasicMaterial map={dashTexture} transparent opacity={0.2} color="#ffffff" />
          </mesh>
        );
      }
    }
    return { solidLines, dashedLines };
  }, [laneCount, laneWidth, trackLength, dashTexture]);

  // Grid glow effect on ground edges and scrolling backwards
  const glowPulse = useRef(0);
  const SCROLL_SPEED = 3.5;

  useFrame((_state, delta) => {
    glowPulse.current += delta;
    if (gridRef.current) {
      const mat = gridRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.02 + Math.sin(glowPulse.current * 2) * 0.01;
      
      if (mat.map) {
        // Scroll the texture backwards (negative Y in uv = positive Z in world)
        mat.map.offset.y -= delta * (SCROLL_SPEED * 0.2); 
      }
    }

    // Scroll dashed lines texture backwards
    dashTexture.offset.y -= delta * (SCROLL_SPEED / (trackLength / 16));
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
      {laneLines.solidLines}
      {laneLines.dashedLines}

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
