// ─── FinishLine3D ─── Checkered finish line ───
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FinishLine3DProps {
  position: [number, number, number];
  width: number;
}

export function FinishLine3D({ position, width }: FinishLine3DProps) {
  const glowRef = useRef<THREE.Mesh>(null);

  // Checkered texture
  const checkerTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    const squareSize = 16;
    for (let x = 0; x < 256; x += squareSize) {
      for (let y = 0; y < 64; y += squareSize) {
        const isWhite = ((x / squareSize) + (y / squareSize)) % 2 === 0;
        ctx.fillStyle = isWhite ? '#ffffff' : '#111111';
        ctx.fillRect(x, y, squareSize, squareSize);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    const repeats = Math.ceil(width / 0.5);
    texture.repeat.set(repeats, 1);
    return texture;
  }, [width]);

  // Pulsing glow
  useFrame((_state) => {
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.1 + Math.sin(_state.clock.elapsedTime * 3) * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* Checkered strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[width + 0.5, 0.3]} />
        <meshStandardMaterial
          map={checkerTexture}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Glow line beneath */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <planeGeometry args={[width + 1, 0.6]} />
        <meshBasicMaterial
          color="#ffdd00"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Finish posts on each side */}
      {[-1, 1].map((side, i) => (
        <group key={i} position={[side * (width / 2 + 0.4), 0, 0]}>
          {/* Post */}
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
            <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Top light */}
          <mesh position={[0, 1.25, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color="#ffdd00"
              emissive="#ffdd00"
              emissiveIntensity={2}
            />
          </mesh>
          <pointLight
            position={[side * (width / 2 + 0.4), 1.3, 0]}
            color="#ffdd00"
            intensity={0.5}
            distance={3}
          />
        </group>
      ))}
    </group>
  );
}
