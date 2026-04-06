// ─── FlagRunner3D ─── 3D animated flag as a racer on the track ───
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Billboard, Text, useTexture } from '@react-three/drei';
import type { Team } from '../../types/index';

interface FlagRunner3DProps {
  team: Team;
  position: [number, number, number];
  isLeading: boolean;
  isWinner: boolean;
  progress: number;
}

export function FlagRunner3D({ team, position, isLeading, isWinner, progress: _progress }: FlagRunner3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const flagRef = useRef<THREE.Mesh>(null);
  const targetZ = useRef(position[2]);
  const speed = useRef(0);

  // Load flag texture
  const flagTexture = useTexture(team.flagImage);
  flagTexture.colorSpace = THREE.SRGBColorSpace;

  // Color from team
  const teamColor = useMemo(() => new THREE.Color(team.color), [team.color]);

  // Update target position smoothly
  targetZ.current = position[2];

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth position lerp
    const currentZ = groupRef.current.position.z;
    const newZ = THREE.MathUtils.lerp(currentZ, targetZ.current, delta * 3);
    speed.current = Math.abs(newZ - currentZ) / Math.max(delta, 0.001);
    groupRef.current.position.z = newZ;
    groupRef.current.position.x = position[0];

    // Flag wave animation
    if (flagRef.current) {
      const geo = flagRef.current.geometry;
      const posAttr = geo.attributes.position;
      const time = state.clock.elapsedTime;

      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const wave = Math.sin(x * 4 + time * 3) * 0.04 + Math.sin(x * 8 + time * 5) * 0.02;
        posAttr.setZ(i, wave * (x + 0.4));
      }
      posAttr.needsUpdate = true;
    }

    // Winner bounce animation
    if (isWinner && groupRef.current) {
      groupRef.current.position.y = 0.5 + Math.abs(Math.sin(state.clock.elapsedTime * 4)) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Flag pole */}
      <mesh position={[-0.4, 0.25, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Pole top cap */}
      <mesh position={[-0.4, 0.7, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial
          color={isLeading ? '#ffdd00' : '#cccccc'}
          metalness={0.9}
          roughness={0.1}
          emissive={isLeading ? '#ffdd00' : '#000000'}
          emissiveIntensity={isLeading ? 0.5 : 0}
        />
      </mesh>

      {/* Flag mesh — map flag texture */}
      <mesh ref={flagRef} position={[0, 0.45, 0]}>
        <planeGeometry args={[0.8, 0.5, 16, 8]} />
        <meshStandardMaterial
          map={flagTexture}
          side={THREE.DoubleSide}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Country name label below */}
      <Billboard position={[0, -0.1, 0]}>
        <Text
          fontSize={0.12}
          color={team.color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.008}
          outlineColor="#000000"
        >
          {team.name.toUpperCase()}
        </Text>
      </Billboard>

      {/* Glow sphere for leading team */}
      {isLeading && (
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial
            color={teamColor}
            transparent
            opacity={0.08}
          />
        </mesh>
      )}

      {/* Ground marker ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
        <ringGeometry args={[0.3, 0.4, 24]} />
        <meshBasicMaterial
          color={teamColor}
          transparent
          opacity={isLeading ? 0.5 : 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
