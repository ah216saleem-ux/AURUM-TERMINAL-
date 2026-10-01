import * as THREE from 'three';
import { StorySection } from './types';

// Pre-defined color palettes for high-performance instantiation
export const GOLD_COLORS = [
  new THREE.Color('#F59E0B'),
  new THREE.Color('#D4AF37'),
  new THREE.Color('#FDE047'),
  new THREE.Color('#FBBF24'),
  new THREE.Color('#FFFBEB'),
  new THREE.Color('#B45309')
];

export const NEURAL_COLORS = [
  new THREE.Color('#F59E0B'),
  new THREE.Color('#38BDF8'),
  new THREE.Color('#0EA5E9'),
  new THREE.Color('#7DD3FC'),
  new THREE.Color('#FBBF24'),
  new THREE.Color('#FFFFFF')
];

export const GRID_COLORS = [
  new THREE.Color('#D4AF37'),
  new THREE.Color('#F59E0B'),
  new THREE.Color('#FBBF24'),
  new THREE.Color('#FEF08A')
];

export const MARKET_COLORS = [
  new THREE.Color('#10B981'), // Bullish Emerald
  new THREE.Color('#34D399'), // Light mint
  new THREE.Color('#D4AF37'), // Gold
  new THREE.Color('#F59E0B'), // Amber
  new THREE.Color('#38BDF8')  // Blue volume accent
];

export const SHIELD_COLORS = [
  new THREE.Color('#F43F5E'), // Subtle Rose-red
  new THREE.Color('#FB7185'), // Soft Rose
  new THREE.Color('#FDA4AF'), // Light Rose highlight
  new THREE.Color('#F59E0B'), // Amber Gold
  new THREE.Color('#D4AF37'), // Metallic Gold
  new THREE.Color('#FFFBEB')  // Radiant gold core
];

export const FINAL_GLOBE_COLORS = [
  new THREE.Color('#FFFBEB'),
  new THREE.Color('#FDE047'),
  new THREE.Color('#FBBF24'),
  new THREE.Color('#F59E0B'),
  new THREE.Color('#D4AF37')
];

export interface ShapeData {
  positions: Float32Array;
  colors: Float32Array;
}

/**
 * 1. HERO: Gold Particle Globe with Orbital Ring
 */
export function generateGlobePositions(count: number, isFinal: boolean = false): ShapeData {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const baseRadius = isFinal ? 2.5 : 2.4;
  const palette = isFinal ? FINAL_GLOBE_COLORS : GOLD_COLORS;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const isRing = i > count * (isFinal ? 0.75 : 0.82);

    let x = 0, y = 0, z = 0;

    if (isRing) {
      const angle = Math.random() * Math.PI * 2;
      const ringRadius = baseRadius * (isFinal ? 1.4 : 1.35) + (Math.random() - 0.5) * 0.5;
      const ringTilt = isFinal ? (i % 2 === 0 ? 0.35 : -0.35) : 0.28;
      
      x = ringRadius * Math.cos(angle);
      y = (Math.random() - 0.5) * 0.2 + Math.sin(angle) * ringTilt;
      z = ringRadius * Math.sin(angle);
    } else {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = baseRadius + (Math.random() - 0.5) * 0.35;

      x = r * Math.sin(phi) * Math.cos(theta);
      y = r * Math.sin(phi) * Math.sin(theta);
      z = r * Math.cos(phi);
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i3] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  return { positions, colors };
}

/**
 * 2. INSTITUTIONAL AI INTELLIGENCE: Neural Network / Brain-Like Cloud
 */
export function generateNeuralPositions(count: number): ShapeData {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    let x = 0, y = 0, z = 0;

    const isAxonBranch = i > count * 0.85;
    const isBridge = !isAxonBranch && i > count * 0.70;

    if (isBridge) {
      // Central corpus callosum / synaptic bridge between hemispheres
      const t = (Math.random() - 0.5) * 1.6;
      x = t;
      y = (Math.random() - 0.5) * 0.8 + Math.sin(t * 3) * 0.2;
      z = (Math.random() - 0.5) * 0.9;
    } else if (isAxonBranch) {
      // Radiant axon nerve projections stretching into periphery
      const angle = Math.random() * Math.PI * 2;
      const r = 2.4 + Math.random() * 1.5;
      x = r * Math.cos(angle);
      y = (Math.random() - 0.5) * 2.2;
      z = r * Math.sin(angle) * 0.6;
    } else {
      // Dual cerebral lobes (Left: x < 0, Right: x > 0)
      const hemisphere = i % 2 === 0 ? 1 : -1;
      const centerX = hemisphere * 1.05;

      const u = Math.random() * Math.PI * 2;
      const v = Math.acos(Math.random() * 2 - 1);
      
      // Brain lobe dimensions with cortical folds
      const foldNoise = Math.sin(u * 6) * 0.18 + Math.cos(v * 4) * 0.14;
      const rx = 1.1 + foldNoise;
      const ry = 1.3 + foldNoise;
      const rz = 1.0 + foldNoise;

      x = centerX + rx * Math.sin(v) * Math.cos(u);
      y = ry * Math.sin(v) * Math.sin(u) * 0.85;
      z = rz * Math.cos(v);
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    // Colors: Golden core with sky-blue and cyan synaptic pulses
    const isSynapse = Math.random() < 0.35;
    const c = isSynapse
      ? NEURAL_COLORS[Math.floor(1 + Math.random() * 4)] // Sky-blue / cyan / white
      : NEURAL_COLORS[0]; // Gold core

    colors[i3] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  return { positions, colors };
}

/**
 * 3. WHY AURUM (TRUST): Architectural Coordinate Grid Matrix
 */
export function generateGridPositions(count: number): ShapeData {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  // Planar grid dimensions
  const gridSpan = 5.6;
  const steps = Math.floor(Math.sqrt(count * 0.7));

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    let x = 0, y = 0, z = 0;

    const isFilament = i > count * 0.75;

    if (isFilament) {
      // Vertical data coordinate columns rising from grid intersections
      const colX = ((i % 16) / 15 - 0.5) * gridSpan;
      const colZ = ((Math.floor(i / 16) % 16) / 15 - 0.5) * (gridSpan * 0.75);
      const height = (Math.random() - 0.5) * 2.8;

      x = colX + (Math.random() - 0.5) * 0.1;
      y = height;
      z = colZ + (Math.random() - 0.5) * 0.1;
    } else {
      // Geometric planar lattice
      const col = i % steps;
      const row = Math.floor(i / steps);
      const u = (col / steps - 0.5) * gridSpan;
      const v = (row / (count / steps) - 0.5) * (gridSpan * 0.8);

      x = u;
      y = -0.65 + Math.sin(u * 2 + v * 2) * 0.12;
      z = v;
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    const c = GRID_COLORS[Math.floor(Math.random() * GRID_COLORS.length)];
    colors[i3] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  return { positions, colors };
}

/**
 * 4. LIVE MARKETS: Dynamic Candlestick Trend Wave & Flow
 */
export function generateMarketPositions(count: number): ShapeData {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const waveSpan = 6.4;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // Continuous financial price trend line with volume flow ribbon
    const progress = (i / count);
    const x = (progress - 0.5) * waveSpan;
    
    // Wave function combining macro uptrend with micro-oscillations
    const macroTrend = Math.sin(progress * Math.PI * 1.5) * 0.8 + progress * 0.9 - 0.5;
    const microJitter = (Math.random() - 0.5) * 0.35;
    const y = macroTrend + microJitter;
    
    // Volumetric ribbon depth
    const z = (Math.random() - 0.5) * 1.6;

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    // Green on upward wave inflection, gold on consolidation
    const isBullish = macroTrend > 0;
    const c = isBullish 
      ? MARKET_COLORS[0] // Emerald Green
      : MARKET_COLORS[2]; // Gold

    colors[i3] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  return { positions, colors };
}

/**
 * 5. RISK INTELLIGENCE: Concentric Protective Aegis Shield with Rose-Red Tint
 */
export function generateShieldPositions(count: number): ShapeData {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    let x = 0, y = 0, z = 0;

    const ringCategory = i % 4;
    const angle = Math.random() * Math.PI * 2;

    if (ringCategory === 0) {
      // Outer guardian rim
      const r = 2.45 + (Math.random() - 0.5) * 0.15;
      x = r * Math.cos(angle);
      y = r * Math.sin(angle);
      z = (Math.random() - 0.5) * 0.2;
    } else if (ringCategory === 1) {
      // Middle protective ring
      const r = 1.75 + (Math.random() - 0.5) * 0.2;
      x = r * Math.cos(angle);
      y = r * Math.sin(angle);
      z = 0.25 + (Math.random() - 0.5) * 0.2;
    } else if (ringCategory === 2) {
      // Inner central core buckler
      const r = 1.05 + (Math.random() - 0.5) * 0.25;
      x = r * Math.cos(angle);
      y = r * Math.sin(angle);
      z = 0.45 + (Math.random() - 0.5) * 0.2;
    } else {
      // Diagonal defense vector filaments
      const r = Math.random() * 2.5;
      const curvature = Math.cos(r / 2.5 * (Math.PI / 2)) * 0.5;
      x = r * Math.cos(angle);
      y = r * Math.sin(angle);
      z = curvature + (Math.random() - 0.5) * 0.15;
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    // Rose-red alert tint blended with guardian gold
    const isRoseRed = Math.random() < 0.45;
    const c = isRoseRed
      ? SHIELD_COLORS[Math.floor(Math.random() * 3)] // Rose-red / Crimson
      : SHIELD_COLORS[Math.floor(3 + Math.random() * 3)]; // Gold / Amber

    colors[i3] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  return { positions, colors };
}

/**
 * Master generator for any target section
 */
export function getSectionShape(section: StorySection, count: number): ShapeData {
  switch (section) {
    case 'HERO':
      return generateGlobePositions(count, false);
    case 'AI_INTELLIGENCE':
      return generateNeuralPositions(count);
    case 'WHY_AURUM':
      return generateGridPositions(count);
    case 'LIVE_MARKETS':
      return generateMarketPositions(count);
    case 'RISK_INTELLIGENCE':
      return generateShieldPositions(count);
    case 'FINAL_ACCESS':
      return generateGlobePositions(count, true);
    default:
      return generateGlobePositions(count, false);
  }
}
