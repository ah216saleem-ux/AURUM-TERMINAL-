import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { StorySection, PerformanceTier } from './types';
import { StoryCamera } from './StoryCamera';
import { MorphingParticles } from './MorphingParticles';
import { MorphingCubes } from './MorphingCubes';

interface StorySceneProps {
  performanceTier: PerformanceTier;
  currentSection: StorySection;
  targetSection: StorySection;
  morphProgress: number;
  targetTilt: { x: number; y: number };
  mouseNormalized: { x: number; y: number };
  onFpsUpdate?: (fps: number, isDegraded: boolean) => void;
}

export const StoryScene: React.FC<StorySceneProps> = ({
  performanceTier,
  currentSection,
  targetSection,
  morphProgress,
  targetTilt,
  mouseNormalized,
  onFpsUpdate
}) => {
  const [isQualityDegraded, setIsQualityDegraded] = useState(false);

  // Rolling FPS performance monitor
  const frameDeltas = useRef<number[]>([]);
  const lastSampleTime = useRef(performance.now());
  const lowFpsCounter = useRef(0);

  useFrame((_, delta) => {
    // Record delta time
    frameDeltas.current.push(delta);
    if (frameDeltas.current.length > 60) {
      frameDeltas.current.shift();
    }

    const now = performance.now();
    if (now - lastSampleTime.current > 1000) {
      const avgDelta = frameDeltas.current.reduce((a, b) => a + b, 0) / frameDeltas.current.length;
      const currentFps = Math.round(1 / Math.max(0.001, avgDelta));

      if (currentFps < 40) {
        lowFpsCounter.current += 1;
        if (lowFpsCounter.current >= 2 && !isQualityDegraded) {
          setIsQualityDegraded(true);
          if (onFpsUpdate) onFpsUpdate(currentFps, true);
        }
      } else {
        lowFpsCounter.current = 0;
        if (onFpsUpdate) onFpsUpdate(currentFps, isQualityDegraded);
      }

      lastSampleTime.current = now;
    }
  });

  const isRiskSection = targetSection === 'RISK_INTELLIGENCE';
  const isAiSection = targetSection === 'AI_INTELLIGENCE';
  const isMarketSection = targetSection === 'LIVE_MARKETS';

  // Dynamic central light color based on active story context
  const primaryLightColor = isRiskSection 
    ? '#FB7185' // Rose-red tint for Risk Shield
    : isAiSection 
    ? '#38BDF8' // Sky-blue / Cyan for AI Neural Brain
    : isMarketSection 
    ? '#10B981' // Emerald for Markets
    : '#F59E0B'; // Amber Gold for Hero, Why Aurum, Final Access

  const enableBloom = performanceTier.enableBloom && !isQualityDegraded;

  return (
    <>
      {/* 1. Camera Controller */}
      <StoryCamera
        currentSection={currentSection}
        targetSection={targetSection}
        morphProgress={morphProgress}
        targetTilt={targetTilt}
        isMobile={performanceTier.isMobile}
      />

      {/* 2. Scene Lighting */}
      <ambientLight intensity={0.45} />
      
      {/* Dynamic Central Reactor Light */}
      <pointLight 
        position={[0, 0, 0]} 
        color={primaryLightColor} 
        intensity={isRiskSection ? 4.2 : 3.8} 
        distance={11} 
      />

      {/* Rim Accent Lights */}
      <pointLight position={[4, 2, 3]} color="#10B981" intensity={1.5} distance={8} />
      <pointLight position={[-4, -2, -3]} color="#38BDF8" intensity={1.5} distance={8} />
      <directionalLight position={[0, 6, 6]} color="#FFFBEB" intensity={0.65} />

      {/* 3. Main 3D Particle Cloud with Adaptive Scale */}
      <MorphingParticles
        particleCount={performanceTier.particleCount}
        currentSection={currentSection}
        targetSection={targetSection}
        morphProgress={morphProgress}
        mouseNormalized={mouseNormalized}
        isMobile={performanceTier.isMobile}
        adaptiveScale={isQualityDegraded ? 0.65 : 1.0}
      />

      {/* 4. Morphing Candlestick / Data Cubes (Instanced Mesh) */}
      <MorphingCubes
        currentSection={currentSection}
        targetSection={targetSection}
        morphProgress={morphProgress}
        isMobile={performanceTier.isMobile}
      />

      {/* 5. Post-Processing Bloom (Active on Desktop/High-End tiers if FPS >= 40) */}
      {enableBloom && (
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
