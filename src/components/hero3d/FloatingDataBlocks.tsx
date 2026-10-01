import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface DataBlock {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  emissive: string;
  speed: number;
  driftRadius: number;
  initialAngle: number;
  yOffset: number;
  bobPhase: number;
}

export const FloatingDataBlocks: React.FC = () => {
  const groupRef = useRef<THREE.Group | null>(null);

  // Generate 26 small floating candlestick / data block cubes
  const blocks = useMemo<DataBlock[]>(() => {
    const list: DataBlock[] = [];
    const count = 26;

    for (let i = 0; i < count; i++) {
      const isEmerald = Math.random() < 0.35; // 35% emerald, 65% gold
      const radius = 2.8 + Math.random() * 1.5;
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const y = (Math.random() - 0.5) * 2.6;

      // Candlestick bar proportions: slightly elongated vertically
      const width = 0.08 + Math.random() * 0.08;
      const height = 0.12 + Math.random() * 0.22;
      const depth = width;

      list.push({
        position: [
          radius * Math.cos(angle),
          y,
          radius * Math.sin(angle)
        ],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ],
        scale: [width, height, depth],
        color: isEmerald ? '#10B981' : '#D4AF37',
        emissive: isEmerald ? '#059669' : '#B45309',
        speed: 0.25 + Math.random() * 0.4,
        driftRadius: radius,
        initialAngle: angle,
        yOffset: y,
        bobPhase: Math.random() * Math.PI * 2
      });
    }

    return list;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Gentle global slow orbit
    groupRef.current.rotation.y += delta * 0.04;

    const t = state.clock.elapsedTime;
    const children = groupRef.current.children;

    for (let i = 0; i < children.length && i < blocks.length; i++) {
      const mesh = children[i] as THREE.Mesh;
      const b = blocks[i];

      // Subtle vertical bobbing & local rotation
      mesh.position.y = b.yOffset + Math.sin(t * b.speed + b.bobPhase) * 0.18;
      mesh.rotation.x += delta * 0.3;
      mesh.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={groupRef}>
      {blocks.map((b, i) => (
        <mesh key={i} position={b.position} rotation={b.rotation} scale={b.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={b.color}
            emissive={b.emissive}
            emissiveIntensity={0.65}
            roughness={0.25}
            metalness={0.85}
            transparent
            opacity={0.82}
          />
        </mesh>
      ))}
    </group>
  );
};
