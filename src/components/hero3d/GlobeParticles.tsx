import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getParticleTexture } from './particleTexture';

interface GlobeParticlesProps {
  particleCount: number;
  mouseNormalized: { x: number; y: number };
}

export const GlobeParticles: React.FC<GlobeParticlesProps> = ({
  particleCount,
  mouseNormalized
}) => {
  const pointsRef = useRef<THREE.Points | null>(null);

  // Pre-generate base sphere + orbital ring particles
  const { positions, originalPositions, colors, scales } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const origPos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const sca = new Float32Array(particleCount);

    const goldColors = [
      new THREE.Color('#F59E0B'), // Amber gold
      new THREE.Color('#D4AF37'), // Metallic gold
      new THREE.Color('#FDE047'), // Bright gold
      new THREE.Color('#FBBF24'), // Warm gold
      new THREE.Color('#FFFBEB'), // Gold sheen
      new THREE.Color('#B45309')  // Deep bronze gold
    ];

    const emeraldColors = [
      new THREE.Color('#10B981'), // Emerald green
      new THREE.Color('#34D399'), // Mint emerald
      new THREE.Color('#059669')  // Deep forest emerald
    ];

    const skyBlueColors = [
      new THREE.Color('#38BDF8'), // Sky blue
      new THREE.Color('#0EA5E9'), // Vivid blue
      new THREE.Color('#7DD3FC')  // Light cyan
    ];

    const baseRadius = 2.4;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const isOrbitalRing = i > particleCount * 0.82; // 18% form an equatorial data ring

      let x: number, y: number, z: number;

      if (isOrbitalRing) {
        // Equatorial orbital data ring
        const ringAngle = Math.random() * Math.PI * 2;
        const ringRadius = baseRadius * 1.35 + (Math.random() - 0.5) * 0.6;
        const ringY = (Math.random() - 0.5) * 0.25;

        // Tilted ring
        const tilt = 0.28;
        x = ringRadius * Math.cos(ringAngle);
        y = ringY + Math.sin(ringAngle) * tilt;
        z = ringRadius * Math.sin(ringAngle);
      } else {
        // Spherical shell with organic depth
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const radialNoise = (Math.random() - 0.5) * 0.35;
        const r = baseRadius + radialNoise;

        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
      }

      pos[i3] = x;
      pos[i3 + 1] = y;
      pos[i3 + 2] = z;

      origPos[i3] = x;
      origPos[i3 + 1] = y;
      origPos[i3 + 2] = z;

      // Color distribution: ~80% gold, ~10% emerald, ~10% sky blue
      const rand = Math.random();
      let chosenColor: THREE.Color;
      if (rand < 0.80) {
        chosenColor = goldColors[Math.floor(Math.random() * goldColors.length)];
      } else if (rand < 0.90) {
        chosenColor = emeraldColors[Math.floor(Math.random() * emeraldColors.length)];
      } else {
        chosenColor = skyBlueColors[Math.floor(Math.random() * skyBlueColors.length)];
      }

      col[i3] = chosenColor.r;
      col[i3 + 1] = chosenColor.g;
      col[i3 + 2] = chosenColor.b;

      sca[i] = Math.random() * 0.6 + 0.4;
    }

    return {
      positions: pos,
      originalPositions: origPos,
      colors: col,
      scales: sca
    };
  }, [particleCount]);

  const particleTexture = useMemo(() => getParticleTexture(), []);

  // Frame animation: Slow auto-rotation + gentle cursor repulsion in 3D
  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    // Slow auto-rotation
    pointsRef.current.rotation.y += delta * 0.07;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.04;

    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const currentPositions = posAttr.array as Float32Array;

    const rotY = pointsRef.current.rotation.y;
    const rotX = pointsRef.current.rotation.x;

    const isCursorActive = Math.abs(mouseNormalized.x) > 0.01 || Math.abs(mouseNormalized.y) > 0.01;
    const cursorX = mouseNormalized.x * 3.4;
    const cursorY = mouseNormalized.y * 2.8;

    // Transform world cursor coordinates to local rotating space
    const cosY = Math.cos(-rotY);
    const sinY = Math.sin(-rotY);
    const localCursorX = cursorX * cosY;
    const localCursorZ = cursorX * sinY;
    const localCursorY = cursorY;

    const repelRadiusSq = 1.9 * 1.9;
    const repelForce = 0.45;
    const returnSpeed = 0.075;

    let hasChange = false;

    // Repulsion pass for all particles
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const ox = originalPositions[i3];
      const oy = originalPositions[i3 + 1];
      const oz = originalPositions[i3 + 2];

      const cx = currentPositions[i3];
      const cy = currentPositions[i3 + 1];
      const cz = currentPositions[i3 + 2];

      if (isCursorActive) {
        const dx = cx - localCursorX;
        const dy = cy - localCursorY;
        const dz = cz - localCursorZ;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < repelRadiusSq && distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const normX = dx / dist;
          const normY = dy / dist;
          const normZ = dz / dist;
          const factor = (1 - dist / 1.9) * repelForce;

          currentPositions[i3] += normX * factor * 0.12;
          currentPositions[i3 + 1] += normY * factor * 0.12;
          currentPositions[i3 + 2] += normZ * factor * 0.12;
          hasChange = true;
          continue;
        }
      }

      // Smoothly spring back to original base sphere coordinates
      const diffX = ox - cx;
      const diffY = oy - cy;
      const diffZ = oz - cz;
      if (Math.abs(diffX) > 0.001 || Math.abs(diffY) > 0.001 || Math.abs(diffZ) > 0.001) {
        currentPositions[i3] += diffX * returnSpeed;
        currentPositions[i3 + 1] += diffY * returnSpeed;
        currentPositions[i3 + 2] += diffZ * returnSpeed;
        hasChange = true;
      }
    }

    if (hasChange) {
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        vertexColors
        map={particleTexture}
        transparent
        opacity={0.88}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
