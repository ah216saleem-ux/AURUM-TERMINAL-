import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { StorySection } from './types';
import { getCubeTransformsForSection, CUBE_COUNT } from './cubeGenerators';

interface MorphingCubesProps {
  currentSection: StorySection;
  targetSection: StorySection;
  morphProgress: number; // 0 to 1, driven by GSAP easing
  isMobile: boolean;
}

export const MorphingCubes: React.FC<MorphingCubesProps> = ({
  currentSection,
  targetSection,
  morphProgress,
  isMobile
}) => {
  const instancedMeshRef = useRef<THREE.InstancedMesh | null>(null);

  // Pre-generate transforms for all sections
  const sectionTransforms = useMemo(() => {
    return {
      HERO: getCubeTransformsForSection('HERO'),
      AI_INTELLIGENCE: getCubeTransformsForSection('AI_INTELLIGENCE'),
      WHY_AURUM: getCubeTransformsForSection('WHY_AURUM'),
      LIVE_MARKETS: getCubeTransformsForSection('LIVE_MARKETS'),
      RISK_INTELLIGENCE: getCubeTransformsForSection('RISK_INTELLIGENCE'),
      FINAL_ACCESS: getCubeTransformsForSection('FINAL_ACCESS')
    };
  }, []);

  // Shared reusable helper objects to prevent garbage collection spikes in useFrame
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempPosition = useMemo(() => new THREE.Vector3(), []);
  const tempEuler = useMemo(() => new THREE.Euler(), []);
  const tempQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const tempScale = useMemo(() => new THREE.Vector3(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  const tempSrcColor = useMemo(() => new THREE.Color(), []);
  const tempTgtColor = useMemo(() => new THREE.Color(), []);

  // Shared geometry and material
  const cubeGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const cubeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      roughness: 0.25,
      metalness: 0.85,
      transparent: true,
      opacity: 0.88
    });
  }, []);

  // Clean disposal on unmount
  useEffect(() => {
    return () => {
      cubeGeometry.dispose();
      cubeMaterial.dispose();
    };
  }, [cubeGeometry, cubeMaterial]);

  // Frame update: update instanced matrices & colors in a single draw call
  useFrame((state) => {
    if (!instancedMeshRef.current) return;

    const mesh = instancedMeshRef.current;
    const srcList = sectionTransforms[currentSection];
    const tgtList = sectionTransforms[targetSection];
    const p = morphProgress;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < CUBE_COUNT; i++) {
      const src = srcList[i];
      const tgt = tgtList[i];

      // Interpolate position
      const px = src.position[0] + (tgt.position[0] - src.position[0]) * p;
      let py = src.position[1] + (tgt.position[1] - src.position[1]) * p;
      const pz = src.position[2] + (tgt.position[2] - src.position[2]) * p;

      // Candlestick idle tick breathing in LIVE_MARKETS
      if (tgt.isCandlestick && p > 0.8) {
        py += Math.sin(t * 2.5 + i * 0.4) * 0.035;
      }
      tempPosition.set(px, py, pz);

      // Interpolate rotation
      const rx = src.rotation[0] + (tgt.rotation[0] - src.rotation[0]) * p;
      const ry = src.rotation[1] + (tgt.rotation[1] - src.rotation[1]) * p;
      const rz = src.rotation[2] + (tgt.rotation[2] - src.rotation[2]) * p;
      tempEuler.set(rx, ry, rz);
      tempQuaternion.setFromEuler(tempEuler);

      // Interpolate scale
      const sx = src.scale[0] + (tgt.scale[0] - src.scale[0]) * p;
      const sy = src.scale[1] + (tgt.scale[1] - src.scale[1]) * p;
      const sz = src.scale[2] + (tgt.scale[2] - src.scale[2]) * p;
      tempScale.set(sx, sy, sz);

      // Compose into transform matrix
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      mesh.setMatrixAt(i, tempMatrix);

      // Interpolate instance color
      tempSrcColor.set(src.color);
      tempTgtColor.set(tgt.color);
      tempColor.copy(tempSrcColor).lerp(tempTgtColor, p);
      mesh.setColorAt(i, tempColor);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[cubeGeometry, cubeMaterial, CUBE_COUNT]}
      frustumCulled={false}
    />
  );
};
