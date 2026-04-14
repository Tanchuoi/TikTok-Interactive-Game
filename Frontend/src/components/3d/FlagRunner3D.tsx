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
  const wheelGroups = useRef<THREE.Group[]>([]);
  const targetZ = useRef(position[2]);
  const currentVelocity = useRef(0);
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

    // Smooth velocity-based vehicle position transition
    const currentZ = groupRef.current.position.z;
    const diffZ = targetZ.current - currentZ;
    
    const maxSpeed = 3.0; // Max units / sec
    let targetVelocity = diffZ * 4.0; 
    targetVelocity = THREE.MathUtils.clamp(targetVelocity, -maxSpeed, maxSpeed);

    // Accelerate smoothly
    currentVelocity.current = THREE.MathUtils.lerp(currentVelocity.current, targetVelocity, delta * 12);

    let newZ = currentZ + currentVelocity.current * delta;

    // Snap to target if very close or overshooting
    if (Math.abs(diffZ) < 0.005 || (diffZ > 0 && newZ > targetZ.current) || (diffZ < 0 && newZ < targetZ.current)) {
      newZ = targetZ.current;
      currentVelocity.current = 0;
    }

    speed.current = Math.abs(currentVelocity.current);
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
        // x goes from -0.3 to +0.3. Pole is at left edge x = -0.3.
        posAttr.setZ(i, wave * (x + 0.3));
      }
      posAttr.needsUpdate = true;
    }

    // Winner bounce animation
    if (isWinner && groupRef.current) {
      groupRef.current.position.y = 0.5 + Math.abs(Math.sin(state.clock.elapsedTime * 4)) * 0.3;
    }

    // Wheel spin animation
    const wheelSpinSpeed = speed.current * 2 + 10; // Base spin from moving ground + actual movement
    wheelGroups.current.forEach(wheel => {
      if (wheel) wheel.rotation.x -= delta * wheelSpinSpeed;
    });
  });

  return (
    <group ref={groupRef} position={position}>

      {/* TRUCK CHASSIS */}
      <mesh position={[0, -0.2, 0]} castShadow>
        <boxGeometry args={[0.5, 0.2, 1.0]} />
        <meshStandardMaterial color={teamColor} metalness={0.4} roughness={0.6} />
      </mesh>

      {/* TRUCK CABIN - Built to look like a small pickup truck */}
      <mesh position={[0, 0.05, -0.1]} castShadow>
        <boxGeometry args={[0.48, 0.3, 0.4]} />
        <meshStandardMaterial color={teamColor} metalness={0.4} roughness={0.6} />
      </mesh>

      {/* WINDSHIELD */}
      <mesh position={[0, 0.06, -0.31]} rotation={[Math.PI * 0.1, 0, 0]}>
        <planeGeometry args={[0.4, 0.2]} />
        <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* SIDE WINDOWS */}
      <mesh position={[-0.25, 0.05, -0.1]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.3, 0.2]} />
        <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.25, 0.05, -0.1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.3, 0.2]} />
        <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* HEADLIGHTS */}
      <mesh position={[-0.15, -0.2, -0.51]}>
        <planeGeometry args={[0.08, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0.15, -0.2, -0.51]}>
        <planeGeometry args={[0.08, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.5} />
      </mesh>

      {/* TAILLIGHTS */}
      <mesh position={[-0.15, -0.2, 0.51]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.08, 0.05]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.15, -0.2, 0.51]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.08, 0.05]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
      </mesh>

      {/* CHUNKY WHEELS */}
      {[
        [-0.3, -0.3, -0.3], // Front Left
        [0.3, -0.3, -0.3],  // Front Right
        [-0.3, -0.3, 0.3],  // Back Left
        [0.3, -0.3, 0.3],   // Back Right
      ].map((pos, i) => (
        <group 
          key={`wheel-${i}`} 
          position={pos as [number, number, number]}
          ref={(el) => {
            if (el) wheelGroups.current[i] = el;
          }}
        >
          {/* Tire */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.14, 16]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
          {/* Rim */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
             <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
             <meshStandardMaterial color="#dddddd" metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* FLAG POLE (Mounted on the back bed) */}
      <mesh position={[0, 0.2, 0.4]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* POLE TOP CAP */}
      <mesh position={[0, 0.5, 0.4]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial
          color={isLeading ? '#ffdd00' : '#cccccc'}
          metalness={0.9}
          roughness={0.1}
          emissive={isLeading ? '#ffdd00' : '#000000'}
          emissiveIntensity={isLeading ? 0.5 : 0}
        />
      </mesh>

      {/* FLAG MESH */}
      <mesh ref={flagRef} position={[0.3, 0.3, 0.4]}>
        <planeGeometry args={[0.6, 0.4, 16, 8]} />
        <meshStandardMaterial
          map={flagTexture}
          side={THREE.DoubleSide}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Country name label below truck instead of below pole */}
      <Billboard position={[0, -0.6, 0]}>
        <Text
          fontSize={0.16}
          color={team.color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.012}
          outlineColor="#000000"
        >
          {team.name.toUpperCase()}
        </Text>
      </Billboard>

      {/* Glow sphere for leading team */}
      {isLeading && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshBasicMaterial
            color={teamColor}
            transparent
            opacity={0.15}
          />
        </mesh>
      )}

      {/* Ground marker ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
        <ringGeometry args={[0.5, 0.65, 24]} />
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
