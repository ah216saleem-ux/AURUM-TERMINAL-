export type StorySection = 
  | 'HERO'                 // Gold particle globe
  | 'AI_INTELLIGENCE'     // Neural network / brain-like cloud
  | 'WHY_AURUM'           // Gold cubes assemble into an institutional grid
  | 'LIVE_MARKETS'        // Cubes become rising and falling candlestick bars
  | 'RISK_INTELLIGENCE'   // Protective shield / ring with subtle rose-red tint
  | 'FINAL_ACCESS';       // Globe reforms with a warm gold glow

export interface PerformanceTier {
  isMobile: boolean;
  isLowEnd: boolean;
  particleCount: number;
  enableBloom: boolean;
  maxDpr: number;
}

export function detectPerformanceTier(): PerformanceTier {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isLowEnd: false,
      particleCount: 5000,
      enableBloom: true,
      maxDpr: 2
    };
  }

  const isMobile = 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768;

  // Check hardware concurrency and device memory if available
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as any).deviceMemory || 4;
  const isLowEnd = isMobile || cores < 4 || memory < 4;

  const particleCount = isMobile ? 1200 : isLowEnd ? 2500 : 5000;
  const enableBloom = !isMobile && !isLowEnd;
  const maxDpr = isMobile ? 1.5 : 2.0;

  return {
    isMobile,
    isLowEnd,
    particleCount,
    enableBloom,
    maxDpr
  };
}

export function isWebGLSupported(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
