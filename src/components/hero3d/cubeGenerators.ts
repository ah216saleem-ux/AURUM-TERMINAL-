import { StorySection } from './types';

export interface CubeState {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  emissive: string;
  isCandlestick?: boolean;
}

export const CUBE_COUNT = 28;

/**
 * Generate 28 cube transforms per section
 */
export function getCubeTransformsForSection(section: StorySection): CubeState[] {
  const list: CubeState[] = [];

  for (let i = 0; i < CUBE_COUNT; i++) {
    switch (section) {
      case 'HERO': {
        // Loose orbital data blocks around the globe
        const angle = (i / CUBE_COUNT) * Math.PI * 2 + (i * 0.35);
        const radius = 2.8 + (i % 5) * 0.25;
        const y = ((i % 7) - 3) * 0.45;
        const isEmerald = i % 3 === 0;

        list.push({
          position: [
            radius * Math.cos(angle),
            y,
            radius * Math.sin(angle)
          ],
          rotation: [i * 0.4, i * 0.6, i * 0.2],
          scale: [0.12, 0.18, 0.12],
          color: isEmerald ? '#10B981' : '#D4AF37',
          emissive: isEmerald ? '#059669' : '#B45309'
        });
        break;
      }

      case 'AI_INTELLIGENCE': {
        // Synaptic cluster hubs around the dual brain lobes
        const hemisphere = i % 2 === 0 ? 1 : -1;
        const angle = (i / CUBE_COUNT) * Math.PI * 2;
        const r = 1.6 + (i % 3) * 0.3;
        const x = hemisphere * (1.1 + Math.cos(angle) * 0.5);
        const y = Math.sin(angle) * 1.0;
        const z = ((i % 4) - 2) * 0.4;
        const isCyan = i % 2 === 0;

        list.push({
          position: [x, y, z],
          rotation: [0, i * 0.5, 0],
          scale: [0.10, 0.10, 0.10],
          color: isCyan ? '#38BDF8' : '#F59E0B',
          emissive: isCyan ? '#0284C7' : '#D97706'
        });
        break;
      }

      case 'WHY_AURUM': {
        // Assembled 7 x 4 Institutional Grid Matrix
        const cols = 7;
        const rows = 4;
        const col = i % cols;
        const row = Math.floor(i / cols);

        const spacingX = 0.75;
        const spacingY = 0.55;
        const x = (col - (cols - 1) / 2) * spacingX;
        const y = (row - (rows - 1) / 2) * spacingY;
        const z = -0.2 + (col % 2 === 0 ? 0.1 : -0.1);

        list.push({
          position: [x, y, z],
          rotation: [0.1, 0.15, 0],
          scale: [0.22, 0.22, 0.08], // Sleek institutional square tiles
          color: '#D4AF37',
          emissive: '#B45309'
        });
        break;
      }

      case 'LIVE_MARKETS': {
        // Candlestick Bars! Rising and falling price action sequence
        const spanX = 5.2;
        const x = (i / (CUBE_COUNT - 1) - 0.5) * spanX;
        
        // Pseudo price trend sequence with alternating green/gold candles
        const prices = [
          0.2, 0.4, 0.3, 0.6, 0.8, 0.5, 0.9, 1.2, 1.0, 1.4,
          1.6, 1.3, 1.7, 2.0, 1.8, 2.2, 2.5, 2.1, 2.6, 2.9,
          2.7, 3.1, 3.4, 3.2, 3.6, 4.0, 3.8, 4.2
        ];
        const prevPrice = i > 0 ? prices[i - 1] : 0.0;
        const currPrice = prices[i] || 0.5;
        const isBullish = currPrice >= prevPrice;

        const bodyHeight = 0.22 + Math.abs(currPrice - prevPrice) * 0.45;
        const y = (currPrice * 0.35) - 0.8;
        const z = (Math.sin(i * 0.8) * 0.2);

        list.push({
          position: [x, y, z],
          rotation: [0, 0, 0],
          scale: [0.12, bodyHeight, 0.12], // Elongated candlestick body
          color: isBullish ? '#10B981' : '#D4AF37',
          emissive: isBullish ? '#059669' : '#B45309',
          isCandlestick: true
        });
        break;
      }

      case 'RISK_INTELLIGENCE': {
        // Defensive perimeter bastion nodes stationed around outer shield
        const angle = (i / CUBE_COUNT) * Math.PI * 2;
        const r = 2.65;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        const z = (i % 2 === 0 ? 0.2 : -0.2);
        const isRose = i % 2 === 0;

        list.push({
          position: [x, y, z],
          rotation: [0, 0, angle],
          scale: [0.14, 0.20, 0.10],
          color: isRose ? '#FB7185' : '#D4AF37',
          emissive: isRose ? '#E11D48' : '#B45309'
        });
        break;
      }

      case 'FINAL_ACCESS': {
        // Tight harmonic orbital satellites around triumphant golden globe
        const angle = (i / CUBE_COUNT) * Math.PI * 2;
        const r = 2.75 + (i % 3) * 0.3;
        const tilt = i % 2 === 0 ? 0.4 : -0.4;
        const x = r * Math.cos(angle);
        const y = Math.sin(angle) * tilt * r;
        const z = r * Math.sin(angle);

        list.push({
          position: [x, y, z],
          rotation: [i * 0.3, i * 0.3, 0],
          scale: [0.14, 0.14, 0.14],
          color: '#FBBF24',
          emissive: '#D97706'
        });
        break;
      }
    }
  }

  return list;
}
