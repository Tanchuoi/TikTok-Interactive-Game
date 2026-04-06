// ─── StartLine3D ─── Starting line marker ───
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StartLine3DProps {
  position: [number, number, number];
  width: number;
}

export function StartLine3D({ position, width }: StartLine3DProps) {
  const glowRef = useRef<THREE.Mesh>(null);

  // Pulsing glow
  useFrame((_state) => {
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.2 + Math.sin(_state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Start strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[width + 0.5, 0.4]} />
        <meshStandardMaterial
          color="#111111"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* White start line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0.1]}>
        <planeGeometry args={[width + 0.5, 0.08]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Glow line beneath */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <planeGeometry args={[width + 1, 0.8]} />
        <meshBasicMaterial
          color="#00ff88"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Start posts on each side */}
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
              color="#00ff88"
              emissive="#00ff88"
              emissiveIntensity={2}
            />
          </mesh>
          <pointLight
            position={[side * (width / 2 + 0.4), 1.3, 0]}
            color="#00ff88"
            intensity={0.5}
            distance={3}
          />
        </group>
      ))}
    </group>
  );
}
