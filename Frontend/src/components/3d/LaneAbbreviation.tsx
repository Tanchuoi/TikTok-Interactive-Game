import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface LaneAbbreviationProps {
  id: string;
  position: [number, number, number];
  color: string;
}

export function LaneAbbreviation({ id, position, color }: LaneAbbreviationProps) {
  const textRef = useRef<THREE.Mesh>(null);
  const randomOffset = useRef(Math.random() * 100).current;

  useFrame((state) => {
    if (textRef.current) {
      // Gentle floating/moving animation, keeping it safely above ground to prevent flickering
      textRef.current.position.y = position[1] + 0.05 + Math.sin(state.clock.elapsedTime * 1.5 + randomOffset) * 0.015;
      textRef.current.position.z = position[2] + Math.sin(state.clock.elapsedTime * 0.5 + randomOffset) * 0.05;
    }
  });

  return (
    <Text
      ref={textRef}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      fontSize={0.65}
      color={color}
      anchorX="center"
      anchorY="middle"
      fillOpacity={0.25}
      outlineWidth={0.02}
      outlineColor="#ffffff"
      outlineOpacity={0.4}
      depthWrite={false}
      renderOrder={1}
    >
      {id.toUpperCase()}
    </Text>
  );
}
