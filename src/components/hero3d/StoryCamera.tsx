import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { StorySection } from './types';

interface StoryCameraProps {
  currentSection: StorySection;
  targetSection: StorySection;
  morphProgress: number; // 0 to 1
  targetTilt: { x: number; y: number };
  isMobile: boolean;
}

const CAMERA_POSITIONS: Record<StorySection, [number, number, number]> = {
  HERO: [0, 0, 6.2],
  AI_INTELLIGENCE: [0.7, 0.3, 5.8],
  WHY_AURUM: [0, 0.9, 5.9],
  LIVE_MARKETS: [-0.5, -0.2, 5.5],
  RISK_INTELLIGENCE: [0, 0, 5.7],
  FINAL_ACCESS: [0, 0.2, 6.4]
};

const CAMERA_LOOK_ATS: Record<StorySection, [number, number, number]> = {
  HERO: [0, 0, 0],
  AI_INTELLIGENCE: [0.3, 0.1, 0],
  WHY_AURUM: [0, 0.2, 0],
  LIVE_MARKETS: [0, -0.1, 0],
  RISK_INTELLIGENCE: [0, 0, 0],
  FINAL_ACCESS: [0, 0, 0]
};

export const StoryCamera: React.FC<StoryCameraProps> = ({
  currentSection,
  targetSection,
  morphProgress,
  targetTilt,
  isMobile
}) => {
  const { camera } = useThree();
  const currentTilt = useRef({ x: 0, y: 0 });
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    // 1. Smooth mouse/touch tilt inertia
    const lerpFactor = Math.min(1, delta * 3.5);
    currentTilt.current.x += (targetTilt.x - currentTilt.current.x) * lerpFactor;
    currentTilt.current.y += (targetTilt.y - currentTilt.current.y) * lerpFactor;

    // 2. Interpolate base camera position between sections
    const srcPos = CAMERA_POSITIONS[currentSection];
    const tgtPos = CAMERA_POSITIONS[targetSection];
    const p = morphProgress;

    const zOffset = isMobile ? 1.4 : 0;
    const baseX = srcPos[0] + (tgtPos[0] - srcPos[0]) * p;
    const baseY = srcPos[1] + (tgtPos[1] - srcPos[1]) * p;
    const baseZ = srcPos[2] + (tgtPos[2] - srcPos[2]) * p + zOffset;

    // Apply gentle parallax displacement
    camera.position.x = baseX + currentTilt.current.y * 0.45;
    camera.position.y = baseY - currentTilt.current.x * 0.35;
    camera.position.z = baseZ;

    // 3. Interpolate LookAt target
    const srcLook = CAMERA_LOOK_ATS[currentSection];
    const tgtLook = CAMERA_LOOK_ATS[targetSection];

    const lx = srcLook[0] + (tgtLook[0] - srcLook[0]) * p;
    const ly = srcLook[1] + (tgtLook[1] - srcLook[1]) * p;
    const lz = srcLook[2] + (tgtLook[2] - srcLook[2]) * p;

    lookAtTarget.current.set(lx, ly, lz);
    camera.lookAt(lookAtTarget.current);
  });

  return null;
};
