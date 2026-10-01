import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { GlobeParticles } from './GlobeParticles';
import { FloatingDataBlocks } from './FloatingDataBlocks';
import { PerformanceTier } from './types';

interface Hero3DSceneProps {
  performanceTier: PerformanceTier;
  targetTilt: { x: number; y: number };
  mouseNormalized: { x: number; y: number };
}

export const Hero3DScene: React.FC<Hero3DSceneProps> = ({
  performanceTier,
  targetTilt,
  mouseNormalized
}) => {
  const sceneGroupRef = useRef<THREE.Group | null>(null);
  const currentTilt = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    if (!sceneGroupRef.current) return;

    // Smooth inertia interpolation for mouse/gyro/touch parallax
    const lerpFactor = Math.min(1, delta * 3.5);
    currentTilt.current.x += (targetTilt.x - currentTilt.current.x) * lerpFactor;
    currentTilt.current.y += (targetTilt.y - currentTilt.current.y) * lerpFactor;

    // Apply parallax tilt to entire 3D group
    sceneGroupRef.current.rotation.x = currentTilt.current.x * 0.35;
    sceneGroupRef.current.rotation.y = currentTilt.current.y * 0.45;
  });

  return (
    <>
      {/* Lighting Configuration */}
      <ambientLight intensity={0.4} />
      
      {/* Central Volumetric Golden Light */}
      <pointLight position={[0, 0, 0]} color="#F59E0B" intensity={3.5} distance={10} />
      
      {/* Secondary Rim Lights */}
      <pointLight position={[4, 2, 3]} color="#10B981" intensity={1.8} distance={8} />
      <pointLight position={[-4, -2, -3]} color="#38BDF8" intensity={1.5} distance={8} />
      <directionalLight position={[0, 5, 5]} color="#FFFBEB" intensity={0.6} />

      {/* Main Interactive 3D Assembly */}
      <group ref={sceneGroupRef} position={[0, 0, 0]}>
        <GlobeParticles
          particleCount={performanceTier.particleCount}
          mouseNormalized={mouseNormalized}
        />
        <FloatingDataBlocks />
      </group>

      {/* Postprocessing Bloom Glow (Active on Desktop/High-End tiers) */}
      {performanceTier.enableBloom && (
        <EffectComposer multisampling={0}>
          <Bloom
            luminanceThreshold={0.18}
            luminanceSmoothing={0.7}
            intensity={1.15}
            mipmapBlur
          />
        </EffectComposer>
      )}
    </>
  );
};
