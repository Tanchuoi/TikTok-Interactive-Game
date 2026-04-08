import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NeonShatterParticlesProps {
  position: [number, number, number];
  color: string;
  onComplete: () => void;
}

export function NeonShatterParticles({ position, color, onComplete }: NeonShatterParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particleCount = 20;
  
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map(() => ({
      position: new THREE.Vector3(0, 0, 0),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 5,
        Math.random() * 5 + 3,
        (Math.random() - 0.5) * 5
      ),
      rotation: new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ),
      scale: Math.random() * 0.15 + 0.05,
    }));
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const startTime = useRef(Date.now());
  const duration = 0.8; // 800ms duration

  useFrame(() => {
    if (!meshRef.current) return;
    const elapsed = (Date.now() - startTime.current) / 1000;
    const t = Math.min(elapsed / duration, 1);

    if (t >= 1) {
      onComplete();
      return;
    }

    particles.forEach((p, i) => {
      // Apply gravity
      p.velocity.y -= 12 * 0.016;
      p.position.addScaledVector(p.velocity, 0.016);
      
      p.rotation.x += 0.2;
      p.rotation.y += 0.2;

      dummy.position.copy(p.position);
      dummy.rotation.copy(p.rotation);
      
      const s = p.scale * (1 - Math.pow(t, 2)); // Ease out quad
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    (meshRef.current.material as THREE.Material).opacity = 1 - t;
  });

  return (
    <group position={position}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
        <tetrahedronGeometry args={[1, 0]} />
        <meshBasicMaterial 
          color={new THREE.Color(color).multiplyScalar(2)} // Make it neon
          transparent 
          opacity={1} 
          blending={THREE.AdditiveBlending} 
          depthWrite={false}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}
