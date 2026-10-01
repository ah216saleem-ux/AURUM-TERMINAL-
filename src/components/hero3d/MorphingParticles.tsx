import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { StorySection } from './types';
import { getSectionShape, ShapeData } from './shapeGenerators';
import { getParticleTexture } from './particleTexture';

interface MorphingParticlesProps {
  particleCount: number;
  currentSection: StorySection;
  targetSection: StorySection;
  morphProgress: number; // 0 to 1, driven by GSAP easing
  mouseNormalized: { x: number; y: number };
  isMobile: boolean;
  adaptiveScale?: number; // 0.6 to 1.0 for adaptive FPS degradation
}

export const MorphingParticles: React.FC<MorphingParticlesProps> = ({
  particleCount,
  currentSection,
  targetSection,
  morphProgress,
  mouseNormalized,
  isMobile,
  adaptiveScale = 1.0
}) => {
  const pointsRef = useRef<THREE.Points | null>(null);

  // Effective active particle count based on adaptive quality
  const activeCount = Math.floor(particleCount * Math.max(0.5, adaptiveScale));

  // Cache shape geometries for smooth morph transitions
  const shapesCache = useMemo(() => {
    const cache: Record<StorySection, ShapeData> = {
      HERO: getSectionShape('HERO', particleCount),
      AI_INTELLIGENCE: getSectionShape('AI_INTELLIGENCE', particleCount),
      WHY_AURUM: getSectionShape('WHY_AURUM', particleCount),
      LIVE_MARKETS: getSectionShape('LIVE_MARKETS', particleCount),
      RISK_INTELLIGENCE: getSectionShape('RISK_INTELLIGENCE', particleCount),
      FINAL_ACCESS: getSectionShape('FINAL_ACCESS', particleCount)
    };
    return cache;
  }, [particleCount]);

  // Live TypedArrays for vertex buffers
  const { currentPositions, currentColors, geometry, material } = useMemo(() => {
    const initial = shapesCache[currentSection];
    const pos = new Float32Array(initial.positions);
    const col = new Float32Array(initial.colors);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: isMobile ? 0.085 : 0.070,
      vertexColors: true,
      map: getParticleTexture(),
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    return {
      currentPositions: pos,
      currentColors: col,
      geometry: geo,
      material: mat
    };
  }, [shapesCache, currentSection, isMobile]);

  // Clean disposal on unmount
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  // Frame animation: Position & color morphing + continuous rotation & cursor interaction
  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    // Slow ambient rotation
    pointsRef.current.rotation.y += delta * 0.05;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.03;

    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const colAttr = geometry.attributes.color as THREE.BufferAttribute;

    const sourceShape = shapesCache[currentSection];
    const targetShape = shapesCache[targetSection];

    const isTransitioning = morphProgress < 0.999 && currentSection !== targetSection;

    if (isTransitioning) {
      const srcPos = sourceShape.positions;
      const tgtPos = targetShape.positions;
      const srcCol = sourceShape.colors;
      const tgtCol = targetShape.colors;

      const p = morphProgress;

      for (let i = 0; i < activeCount * 3; i++) {
        currentPositions[i] = srcPos[i] + (tgtPos[i] - srcPos[i]) * p;
        currentColors[i] = srcCol[i] + (tgtCol[i] - srcCol[i]) * p;
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    } else if (morphProgress >= 0.999 && !isMobile) {
      // Gentle cursor repulsion when idle at target shape
      const isCursorActive = Math.abs(mouseNormalized.x) > 0.01 || Math.abs(mouseNormalized.y) > 0.01;
      
      if (isCursorActive) {
        const rotY = pointsRef.current.rotation.y;
        const cursorX = mouseNormalized.x * 3.2;
        const cursorY = mouseNormalized.y * 2.6;

        const cosY = Math.cos(-rotY);
        const sinY = Math.sin(-rotY);
        const localCursorX = cursorX * cosY;
        const localCursorZ = cursorX * sinY;
        const localCursorY = cursorY;

        const repelRadiusSq = 1.8 * 1.8;
        const targetPos = targetShape.positions;
        let changed = false;

        for (let i = 0; i < activeCount; i++) {
          const i3 = i * 3;
          const ox = targetPos[i3];
          const oy = targetPos[i3 + 1];
          const oz = targetPos[i3 + 2];

          const cx = currentPositions[i3];
          const cy = currentPositions[i3 + 1];
          const cz = currentPositions[i3 + 2];

          const dx = cx - localCursorX;
          const dy = cy - localCursorY;
          const dz = cz - localCursorZ;
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < repelRadiusSq && distSq > 0.0001) {
            const dist = Math.sqrt(distSq);
            const factor = (1 - dist / 1.8) * 0.35;
            currentPositions[i3] += (dx / dist) * factor * 0.12;
            currentPositions[i3 + 1] += (dy / dist) * factor * 0.12;
            currentPositions[i3 + 2] += (dz / dist) * factor * 0.12;
            changed = true;
          } else {
            const diffX = ox - cx;
            const diffY = oy - cy;
            const diffZ = oz - cz;
            if (Math.abs(diffX) > 0.001 || Math.abs(diffY) > 0.001 || Math.abs(diffZ) > 0.001) {
              currentPositions[i3] += diffX * 0.08;
              currentPositions[i3 + 1] += diffY * 0.08;
              currentPositions[i3 + 2] += diffZ * 0.08;
              changed = true;
            }
          }
        }

        if (changed) {
          posAttr.needsUpdate = true;
        }
      }
    }
  });

  return (
    <primitive object={new THREE.Points(geometry, material)} ref={pointsRef} />
  );
};
