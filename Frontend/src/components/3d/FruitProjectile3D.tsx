import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Billboard, useTexture } from '@react-three/drei';

interface FruitProjectile3DProps {
  id: string;
  fruitImage: string;
  startPosition: [number, number, number];
  targetPosition: [number, number, number];
  onHit: (id: string, teamId: string, finalPosition: number) => void;
  teamId: string;
  targetPositionValue: number;
}

export function FruitProjectile3D({
  id,
  fruitImage,
  startPosition,
  targetPosition,
  onHit,
  teamId,
  targetPositionValue
}: FruitProjectile3DProps) {
  const meshRef = useRef<THREE.Group>(null);
  const texture = useTexture(fruitImage);
  const startTime = useRef(Date.now());
  const duration = 1.3; // Duration in seconds

  useFrame(() => {
    if (!meshRef.current) return;

    const elapsed = (Date.now() - startTime.current) / 1000;
    const t = Math.min(elapsed / duration, 1);

    // Quadratic easing for a nice "throw" effect
    const easeT = t * (2 - t);

    // Interpolate positions
    meshRef.current.position.x = THREE.MathUtils.lerp(startPosition[0], targetPosition[0], easeT);
    meshRef.current.position.y = THREE.MathUtils.lerp(startPosition[1], targetPosition[1], easeT) + Math.sin(t * Math.PI) * 1.5;
    meshRef.current.position.z = THREE.MathUtils.lerp(startPosition[2], targetPosition[2], easeT);

    // Spin it
    meshRef.current.rotation.z += 0.2;

    if (t >= 1) {
      onHit(id, teamId, targetPositionValue);
    }
  });

  return (
    <group ref={meshRef}>
      <Billboard>
        <mesh>
          <planeGeometry args={[0.6, 0.6]} />
          <meshBasicMaterial map={texture} transparent={true} />
        </mesh>
      </Billboard>
    </group>
  );
}
