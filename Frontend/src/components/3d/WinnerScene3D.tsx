import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { Team } from '../../types/index.js';

// ─── Medal ───
function Medal({ position, color, materialParams, scale = 1 }: { position: [number, number, number], color: string, materialParams: any, scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const startY = position[1];

  useFrame((_state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = _state.clock.elapsedTime * 1.5;
      groupRef.current.position.y = startY + Math.sin(_state.clock.elapsedTime * 3 + position[0]) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 0.06, 32]} />
          <meshStandardMaterial color={color} {...materialParams} />
        </mesh>
        <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.25, 32]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.3} {...materialParams} />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <octahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={0.5} metalness={1} roughness={0} />
        </mesh>
      </group>
    </group>
  );
}

function Medals() {
  const heights = [2.0, 1.4, 1.0];
  const xPositions = [0, -1.5, 1.5];
  // 1: Gold, 2: Silver, 3: Bronze
  const medalsData = [
    { color: '#ffd700', metalness: 1, roughness: 0.1 },
    { color: '#c0c0c0', metalness: 1, roughness: 0.2 },
    { color: '#cd7f32', metalness: 0.8, roughness: 0.3 },
  ];

  return (
    <group>
      {medalsData.map((data, i) => (
        <Medal
          key={i}
          position={[xPositions[i], -1.5 + heights[i] + 0.6, 0]}
          color={data.color}
          materialParams={{ metalness: data.metalness, roughness: data.roughness, envMapIntensity: 2 }}
          scale={i === 0 ? 1.2 : 0.9}
        />
      ))}
    </group>
  );
}

// ─── Confetti Particles ───
function Confetti() {
  const ref = useRef<THREE.Points>(null);
  const count = 200;

  const { positions, colors, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities: number[] = [];
    const palette = [
      [1, 0.84, 0], [1, 0, 0.5], [0, 1, 0.53], [0, 0.5, 1], [1, 0.5, 0], [0.5, 0, 1],
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = Math.random() * 10 + 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      velocities.push(Math.random() * 0.5 + 0.3); // fall speed

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color[0];
      colors[i * 3 + 1] = color[1];
      colors[i * 3 + 2] = color[2];
    }
    return { positions, colors, velocities };
  }, []);

  useFrame((_state, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= velocities[i] * delta * 2;
      pos[i * 3] += Math.sin(_state.clock.elapsedTime * 2 + i) * delta * 0.3;
      // Reset when below ground
      if (pos[i * 3 + 1] < -1) {
        pos[i * 3 + 1] = Math.random() * 5 + 5;
        pos[i * 3] = (Math.random() - 0.5) * 8;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ─── Podium ───
function Podium({ teams }: { teams: Team[] }) {
  const top3 = teams.slice(0, 3);
  const heights = [2.0, 1.4, 1.0]; // gold, silver, bronze
  const xPositions = [0, -1.5, 1.5]; // center, left, right
  const colors = ['#ffd700', '#c0c0c0', '#cd7f32'];

  return (
    <group position={[0, -1.5, 0]}>
      {top3.map((team, i) => (
        <group key={team.id} position={[xPositions[i], heights[i] / 2, 0]}>
          {/* Podium block */}
          <mesh>
            <boxGeometry args={[1.2, heights[i], 0.8]} />
            <meshStandardMaterial
              color={colors[i]}
              metalness={0.6}
              roughness={0.3}
              envMapIntensity={1.5}
            />
          </mesh>

          {/* Rank number */}
          <Text
            position={[0, 0, 0.41]}
            fontSize={0.4}
            color="#111111"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {`${i + 1}`}
          </Text>

          {/* Country name on top */}
          <Text
            position={[0, heights[i] / 2 + 0.2, 0]}
            fontSize={0.18}
            color={team.color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.008}
            outlineColor="#000000"
          >
            {team.name.toUpperCase()}
          </Text>
        </group>
      ))}
    </group>
  );
}

// ─── Fluttering Background Flags ───
function FlutteringFlag({ url, position, scale, isWinner }: { url: string, position: [number, number, number], scale: number, isWinner: boolean }) {
  const texture = useTexture(url);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime * (isWinner ? 4 : 3);
      const positions = meshRef.current.geometry.attributes.position;
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const waveX = x + 0.5; // range 0 to 1
        
        // Compute wave z
        const z = Math.sin(x * 6 - time) * 0.15 * waveX + Math.sin(y * 4 - time * 0.8) * 0.05 * waveX;
        positions.setZ(i, z);
      }
      positions.needsUpdate = true;
      meshRef.current.geometry.computeVertexNormals();
    }
  });

  return (
    <mesh position={position} scale={[scale * 1.5, scale, 1]} castShadow receiveShadow>
      <planeGeometry args={[1, 1, 32, 32]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} transparent roughness={0.5} />
    </mesh>
  );
}

function FlagsBackground({ teams }: { teams: Team[] }) {
  const top3 = teams.slice(0, 3);
  const positions: [number, number, number][] = [
    [0, 2.5, -3],       // Winner: high center back
    [-3.0, 1.5, -3.5],  // 2nd: middle left back
    [3.0, 1.3, -3.5],   // 3rd: lower right back
  ];
  const scales = [1.8, 1.2, 1.0];

  return (
    <group>
      {top3.map((team, i) => (
        <FlutteringFlag 
          key={team.id}
          url={team.flagImage}
          position={positions[i]}
          scale={scales[i]}
          isWinner={i === 0}
        />
      ))}
    </group>
  );
}

// ─── Main Component ───
interface WinnerScene3DProps {
  standings: Team[];
}

export function WinnerScene3D({ standings }: WinnerScene3DProps) {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0a1e' }}>
      <Canvas
        camera={{
          position: [0, 3, 7],
          fov: 45,
        }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0.5, 0);
        }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#0a0a1e']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={2} />
          <pointLight position={[-3, 5, 3]} color="#ffd700" intensity={1.5} />
          <pointLight position={[3, 5, -3]} color="#ff00ff" intensity={0.8} />
          <spotLight
            position={[0, 8, 2]}
            angle={0.4}
            penumbra={0.5}
            intensity={3}
            color="#ffffff"
          />

          <Medals />
          <FlagsBackground teams={standings} />
          <Confetti />
          <Podium teams={standings} />
        </Suspense>
      </Canvas>
    </div>
  );
}

