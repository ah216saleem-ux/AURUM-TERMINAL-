import React, { useMemo, useState, useEffect, useRef } from 'react';
import { MagneticZoneItem, DistanceTier, StrengthTier, FirstTouchSignal, PullBalanceState } from './types';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Target, 
  Compass, 
  Layers, 
  Zap, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Activity
} from 'lucide-react';

interface MagneticAttractionMapProps {
  livePrice: number;
  priceDirection: 'up' | 'down' | 'flat';
  lastTickTimestamp: number;
  bias?: string;
}

/**
 * Calculates dynamic magnetic attraction levels based on current live XAU/USD price
 * using institutional ATR (approx $21.40) & fixed step intervals.
 */
function calculateDynamicMagneticMap(currentPrice: number) {
  const atr = 21.4; // 1R ATR standard baseline for XAU/USD
  const basePrice = currentPrice > 0 ? currentPrice : 4272.88;

  // Upper Attraction Zones (Buy-side magnets above current price)
  const upperZones: MagneticZoneItem[] = [
    {
      id: 'up-7',
      price: +(basePrice + atr * 4.06).toFixed(2),
      deltaPrice: +(atr * 4.06).toFixed(2),
      distanceR: 4.06,
      distanceTier: 'STRETCH',
      strengthTier: 'WEAK',
      chainAgreement: 1,
      channelLabel: '4ch',
      type: 'UPPER'
    },
    {
      id: 'up-6',
      price: +(basePrice + atr * 3.60).toFixed(2),
      deltaPrice: +(atr * 3.60).toFixed(2),
      distanceR: 3.60,
      distanceTier: 'STRETCH',
      strengthTier: 'WEAK',
      chainAgreement: 1,
      channelLabel: '1ch',
      type: 'UPPER'
    },
    {
      id: 'up-5',
      price: +(basePrice + atr * 3.15).toFixed(2),
      deltaPrice: +(atr * 3.15).toFixed(2),
      distanceR: 3.15,
      distanceTier: 'STRETCH',
      strengthTier: 'WEAK',
      chainAgreement: 1,
      channelLabel: '1ch',
      type: 'UPPER'
    },
    {
      id: 'up-4',
      price: +(basePrice + atr * 2.70).toFixed(2),
      deltaPrice: +(atr * 2.70).toFixed(2),
      distanceR: 2.70,
      distanceTier: 'STRETCH',
      strengthTier: 'WEAK',
      chainAgreement: 1,
      channelLabel: '1ch',
      type: 'UPPER'
    },
    {
      id: 'up-3',
      price: +(basePrice + atr * 2.24).toFixed(2),
      deltaPrice: +(atr * 2.24).toFixed(2),
      distanceR: 2.24,
      distanceTier: 'MEDIUM',
      strengthTier: 'WEAK',
      chainAgreement: 1,
      channelLabel: '1ch',
      type: 'UPPER'
    },
    {
      id: 'up-2',
      price: +(basePrice + atr * 1.79).toFixed(2),
      deltaPrice: +(atr * 1.79).toFixed(2),
      distanceR: 1.79,
      distanceTier: 'MEDIUM',
      strengthTier: 'WEAK',
      chainAgreement: 1,
      channelLabel: '1ch',
      type: 'UPPER'
    },
    {
      id: 'up-1',
      price: +(basePrice + atr * 1.33).toFixed(2),
      deltaPrice: +(atr * 1.33).toFixed(2),
      distanceR: 1.33,
      distanceTier: 'NEAR',
      strengthTier: 'STRONG',
      chainAgreement: 4,
      channelLabel: '4ch',
      isFirstTouchTarget: true,
      type: 'UPPER'
    }
  ];

  // Lower Attraction Zones (Sell-side magnets below current price)
  const lowerZones: MagneticZoneItem[] = [
    {
      id: 'down-1',
      price: +(basePrice - atr * 0.03).toFixed(2),
      deltaPrice: -(atr * 0.03),
      distanceR: -0.03,
      distanceTier: 'NEAR',
      strengthTier: 'STRONG',
      chainAgreement: 4,
      channelLabel: '4ch',
      type: 'LOWER'
    },
    {
      id: 'down-2',
      price: +(basePrice - atr * 0.74).toFixed(2),
      deltaPrice: -(atr * 0.74),
      distanceR: -0.74,
      distanceTier: 'NEAR',
      strengthTier: 'WEAK',
      chainAgreement: 1,
      channelLabel: '1ch',
      type: 'LOWER'
    },
    {
      id: 'down-3',
      price: +(basePrice - atr * 0.94).toFixed(2),
      deltaPrice: -(atr * 0.94),
      distanceR: -0.94,
      distanceTier: 'NEAR',
      strengthTier: 'WEAK',
      chainAgreement: 1,
      channelLabel: '1ch',
      type: 'LOWER'
    },
    {
      id: 'down-4',
      price: +(basePrice - atr * 1.12).toFixed(2),
      deltaPrice: -(atr * 1.12),
      distanceR: -1.12,
      distanceTier: 'MEDIUM',
      strengthTier: 'WEAK',
      chainAgreement: 1,
      channelLabel: '1ch',
      type: 'LOWER'
    },
    {
      id: 'down-5',
      price: +(basePrice - atr * 1.40).toFixed(2),
      deltaPrice: -(atr * 1.40),
      distanceR: -1.40,
      distanceTier: 'MEDIUM',
      strengthTier: 'WEAK',
      chainAgreement: 1,
      channelLabel: '1ch',
      type: 'LOWER'
    },
    {
      id: 'down-6',
      price: +(basePrice - atr * 2.12).toFixed(2),
      deltaPrice: -(atr * 2.12),
      distanceR: -2.12,
      distanceTier: 'MEDIUM',
      strengthTier: 'WEAK',
      chainAgreement: 1,
      channelLabel: '1ch',
      type: 'LOWER'
    },
    {
      id: 'down-7',
      price: +(basePrice - atr * 2.30).toFixed(2),
      deltaPrice: -(atr * 2.30),
      distanceR: -2.30,
      distanceTier: 'MEDIUM',
      strengthTier: 'WEAK',
      chainAgreement: 1,
      channelLabel: '1ch',
      type: 'LOWER'
    }
  ];

  // Primary First Touch Signal Target
  const primaryTarget: FirstTouchSignal = {
    targetPrice: upperZones[upperZones.length - 1].price,
    direction: 'UP',
    probabilityPct: 59,
    distancePts: +(atr * 1.33).toFixed(1),
    distanceR: 1.33,
    strengthLabel: 'NEAR • STRONG • 4ch',
    rejectFlipTarget: lowerZones[0].price,
    breakContinueTarget: upperZones[upperZones.length - 2].price,
    breakChain: [
      upperZones[upperZones.length - 1].price,
      upperZones[upperZones.length - 2].price,
      upperZones[upperZones.length - 3].price,
      upperZones[upperZones.length - 4].price
    ],
    rejectChain: [
      upperZones[upperZones.length - 1].price,
      lowerZones[0].price,
      lowerZones[1].price,
      lowerZones[2].price
    ]
  };

  // Pull Balance Model
  const pullBalance: PullBalanceState = {
    downPullPct: 84,
    upPullPct: 16,
    dominantSide: 'DOWN',
    nearestUpMagnet: {
      price: upperZones[upperZones.length - 1].price,
      distanceR: 1.33,
      distanceTier: 'NEAR',
      strengthTier: 'STRONG'
    },
    nearestDownMagnet: {
      price: lowerZones[0].price,
      distanceR: -0.03,
      distanceTier: 'NEAR',
      strengthTier: 'STRONG'
    },
    invalidationPrice: lowerZones[1].price
  };

  return { upperZones, lowerZones, primaryTarget, pullBalance, atr };
}

/**
 * Renders nested glowing magnetic arc rings for a zone
 */
const MagneticArcRings: React.FC<{
  chainAgreement: number;
  strengthTier: StrengthTier;
  type: 'UPPER' | 'LOWER';
  isFirstTouch?: boolean;
}> = ({ chainAgreement, strengthTier, type, isFirstTouch }) => {
  const ringCount = Math.max(1, Math.min(4, chainAgreement));
  const isUpper = type === 'UPPER';

  const baseColor = isUpper
    ? strengthTier === 'STRONG' ? '#00f2fe' : strengthTier === 'MEDIUM' ? '#38bdf8' : '#818cf8'
    : strengthTier === 'STRONG' ? '#f43f5e' : strengthTier === 'MEDIUM' ? '#fb923c' : '#eab308';

  return (
    <div className="relative flex items-center justify-center w-24 h-11 my-0.5 select-none pointer-events-none">
      {Array.from({ length: ringCount }).map((_, idx) => {
        const radius = 22 + idx * 7;
        const opacity = 0.4 + (idx / ringCount) * 0.6;
        const borderWidth = isFirstTouch && idx === ringCount - 1 ? 2.5 : 1.5;

        return (
          <div
            key={idx}
            className={`absolute transition-all duration-500 ${
              isFirstTouch ? 'animate-pulse' : ''
            }`}
            style={{
              width: `${radius * 2}px`,
              height: `${radius * 1.2}px`,
              borderRadius: isUpper ? '100px 100px 0 0' : '0 0 100px 100px',
              borderTop: isUpper ? `${borderWidth}px solid ${baseColor}` : 'none',
              borderBottom: !isUpper ? `${borderWidth}px solid ${baseColor}` : 'none',
              borderLeft: `${borderWidth * 0.8}px solid ${baseColor}`,
              borderRight: `${borderWidth * 0.8}px solid ${baseColor}`,
              opacity: isFirstTouch ? 0.95 : opacity,
              filter: strengthTier === 'STRONG' ? `drop-shadow(0 0 8px ${baseColor})` : `drop-shadow(0 0 3px ${baseColor})`
            }}
          />
        );
      })}
    </div>
  );
};

export const MagneticAttractionMap: React.FC<MagneticAttractionMapProps> = ({
  livePrice,
  priceDirection,
  lastTickTimestamp,
  bias = 'BUY (4/4)'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  const [zoneReachedAlert, setZoneReachedAlert] = useState<{
    active: boolean;
    zoneName: string;
    price: number;
    deltaR: number;
  } | null>(null);

  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isApproaching, setIsApproaching] = useState(false);

  const { upperZones, lowerZones, primaryTarget, pullBalance } = useMemo(() => {
    return calculateDynamicMagneticMap(livePrice);
  }, [livePrice]);

  // Monitor price proximity for "Attraction Increasing" and "Zone Completed"
  useEffect(() => {
    const target = primaryTarget.targetPrice;
    const distance = Math.abs(livePrice - target);

    if (distance <= 0.8 && distance > 0.15) {
      setIsApproaching(true);
    } else {
      setIsApproaching(false);
    }

    if (distance <= 0.15) {
      setZoneReachedAlert({
        active: true,
        zoneName: 'UPPER ATTRACTION MAGNET (1.33R)',
        price: target,
        deltaR: 1.33
      });
      setIsRecalculating(true);
      const timer = setTimeout(() => {
        setIsRecalculating(false);
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [livePrice, primaryTarget]);

  // Canvas Gravity Particles Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = container.clientWidth || 600;
      height = container.clientHeight || 640;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Particles flowing towards dominant gravitational zones
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      color: string;
    }> = [];

    const pCount = 30;
    for (let i = 0; i < pCount; i++) {
      const isDownPull = Math.random() < (pullBalance.downPullPct / 100);
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: isDownPull ? (Math.random() * 0.75 + 0.25) : -(Math.random() * 0.5 + 0.2),
        radius: Math.random() * 1.5 + 0.6,
        alpha: Math.random() * 0.35 + 0.15,
        color: isDownPull ? '#f43f5e' : '#00f2fe'
      });
    }

    const render = () => {
      animFrameId.current = requestAnimationFrame(render);

      ctx.clearRect(0, 0, width, height);

      // Draw flowing particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y > height) {
          p.y = 0;
          p.x = Math.random() * width;
        } else if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x > width) p.x = 0;
        if (p.x < 0) p.x = width;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      });
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [pullBalance]);

  const handleSimulateTouch = () => {
    setZoneReachedAlert({
      active: true,
      zoneName: 'UPPER ATTRACTION MAGNET (1.33R)',
      price: primaryTarget.targetPrice,
      deltaR: 1.33
    });
    setIsRecalculating(true);
    setTimeout(() => {
      setIsRecalculating(false);
    }, 3000);
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-[#080b14] via-[#05070e] to-[#04050a] border border-amber-500/30 p-3 sm:p-5 shadow-2xl backdrop-blur-xl font-mono space-y-4 relative overflow-hidden">
      {/* 1. TOP HEADER: MAGNET • XAUUSD • H1 • BIAS • LIVE PRICE */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        {/* Left Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-black text-white text-base tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>MAGNET</span>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-300">
            XAUUSD
          </span>

          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-900/90 border border-zinc-800 text-zinc-400">
            H1
          </span>

          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            BIAS: {bias}
          </span>
        </div>

        {/* Right Price & Live Stream Status */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className={`text-xl sm:text-2xl font-black tracking-tight ${
              priceDirection === 'up' ? 'text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : priceDirection === 'down' ? 'text-rose-300 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'text-white'
            }`}>
              {livePrice > 0 ? livePrice.toFixed(2) : '4272.88'}
            </div>
            <div className="text-[9.5px] text-zinc-400 flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE • OANDA • 00s</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LIVE ALERTS (Attraction Increasing / Zone Completed) */}
      {isApproaching && !zoneReachedAlert?.active && (
        <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span className="font-bold">Attraction Increasing — Price Approaching Upper Magnet (1.33R)</span>
          </div>
          <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">GRAVITY PULL +</span>
        </div>
      )}

      {(zoneReachedAlert?.active || isRecalculating) && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/80 via-emerald-950/60 to-cyan-950/80 border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.35)] animate-fade-in flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 animate-pulse">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-white flex items-center gap-2">
                <span>Zone Completed — Target ${zoneReachedAlert?.price.toFixed(2)} Reached</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  COMPLETED
                </span>
              </div>
              <div className="text-[10px] text-cyan-300 font-semibold flex items-center gap-1.5 pt-0.5">
                <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                <span>Recalculating Market Map... New Attraction Zone Generated</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setZoneReachedAlert(null)}
            className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-900/80 border border-zinc-700 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3. MAIN ATTRACTION FIELD & SPECTRUM */}
      <div 
        ref={containerRef}
        className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start relative"
      >
        {/* Background Gravity Particle Canvas */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 pointer-events-none z-0 block w-full h-full opacity-60" 
        />

        {/* Left Legend: Distance & Strength (Chain Agreement) */}
        <div className="lg:col-span-4 p-3.5 rounded-xl bg-zinc-950/85 border border-zinc-900 space-y-3.5 text-[10px] z-10 backdrop-blur-md">
          {/* Distance (in R) */}
          <div className="space-y-1.5">
            <div className="text-zinc-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
              <Compass className="w-3 h-3 text-cyan-400" />
              <span>DISTANCE (in R)</span>
            </div>
            <div className="space-y-1 pl-1">
              <div className="flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                  <span>STRETCH</span>
                </span>
                <span className="text-zinc-400 font-bold">&gt; 2.5R</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" />
                  <span>MEDIUM</span>
                </span>
                <span className="text-zinc-400 font-bold">1.2 - 2.5R</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_6px_#fb7185]" />
                  <span>NEAR</span>
                </span>
                <span className="text-zinc-400 font-bold">&lt; 1R</span>
              </div>
            </div>
          </div>

          {/* Strength (Chain Agreement) with exact dots ●●●● */}
          <div className="space-y-1.5 border-t border-zinc-900 pt-2.5">
            <div className="text-zinc-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
              <Layers className="w-3 h-3 text-amber-400" />
              <span>STRENGTH (CHAIN AGREEMENT)</span>
            </div>
            <div className="space-y-1 pl-1">
              <div className="flex items-center justify-between text-zinc-300">
                <span>STRONG (4)</span>
                <span className="text-cyan-300 font-bold tracking-widest text-xs">●●●●</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span>MEDIUM (2-3)</span>
                <span className="text-sky-300 font-bold tracking-widest text-xs">●●●○</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span>WEAK (1)</span>
                <span className="text-zinc-400 font-bold tracking-widest text-xs">●○○○</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span>VERY WEAK (0)</span>
                <span className="text-zinc-600 font-bold tracking-widest text-xs">○○○○</span>
              </div>
            </div>
          </div>

          {/* Action Simulation Button */}
          <div className="border-t border-zinc-900 pt-2 flex items-center justify-between text-[9px] text-zinc-400">
            <span>SIMULATION:</span>
            <button
              onClick={handleSimulateTouch}
              className="text-cyan-400 hover:text-cyan-300 underline font-bold cursor-pointer"
            >
              Simulate Zone Touch
            </button>
          </div>
        </div>

        {/* Center Field: Magnetic Arcs Vertical Spectrum */}
        <div className="lg:col-span-8 p-3 sm:p-4 rounded-xl bg-zinc-950/85 border border-zinc-900 flex flex-col items-center justify-center relative overflow-hidden z-10 backdrop-blur-md">
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.06)_0%,transparent_75%)] pointer-events-none" />

          {/* A. UPPER ATTRACTION ZONES (CYAN / NEON BLUE ARCS) */}
          <div className="w-full space-y-2 flex flex-col items-center">
            {upperZones.map((zone) => {
              const isHighlight = zone.isFirstTouchTarget;
              return (
                <div 
                  key={zone.id}
                  className={`w-full max-w-md flex items-center justify-between px-3 py-1.5 rounded-xl transition-all duration-300 ${
                    isHighlight
                      ? 'bg-cyan-950/50 border border-cyan-400/70 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700'
                  }`}
                >
                  {/* Left: Magnetic Arc Rings Graphic */}
                  <div className="w-20 flex justify-center">
                    <MagneticArcRings 
                      chainAgreement={zone.chainAgreement}
                      strengthTier={zone.strengthTier}
                      type="UPPER"
                      isFirstTouch={isHighlight}
                    />
                  </div>

                  {/* Right: Price & Distance Telemetry */}
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`text-xs sm:text-sm font-black ${
                        isHighlight ? 'text-cyan-300 font-mono tracking-tight' : 'text-zinc-200'
                      }`}>
                        ${zone.price.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-bold text-cyan-400">
                        +{zone.distanceR.toFixed(2)}R
                      </span>
                      {isHighlight && (
                        <span className="px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase bg-cyan-400/20 text-cyan-300 border border-cyan-400/50 animate-pulse">
                          FIRST
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] text-zinc-400 flex items-center justify-end gap-1.5">
                      <span>{zone.distanceTier}</span>
                      <span>•</span>
                      <span>{zone.strengthTier}</span>
                      <span>•</span>
                      <span className="text-zinc-400">{zone.channelLabel}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* B. CENTRAL LIVE PRICE NODE WITH FLASH PULSE & GRAVITY CORE */}
          <div className="w-full max-w-md my-3 py-2 px-4 rounded-xl bg-gradient-to-r from-zinc-900 via-[#0e1626] to-zinc-900 border-2 border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center justify-between z-20">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center">
                <span className="w-4 h-4 rounded-full bg-emerald-400 animate-ping absolute opacity-75" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 relative" />
              </div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
                  LIVE PRICE
                </div>
                <div className="text-xs text-zinc-400">
                  XAU/USD Magnet Anchor
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className={`text-lg sm:text-2xl font-black tracking-tight ${
                priceDirection === 'up' ? 'text-emerald-300' : priceDirection === 'down' ? 'text-rose-300' : 'text-white'
              }`}>
                ${livePrice > 0 ? livePrice.toFixed(2) : '4272.88'}
              </div>
              <div className="text-[9px] text-zinc-400">
                Real-Time Stream
              </div>
            </div>
          </div>

          {/* C. LOWER ATTRACTION ZONES (RED / ORANGE / GOLD ARCS) */}
          <div className="w-full space-y-2 flex flex-col items-center">
            {lowerZones.map((zone) => {
              return (
                <div 
                  key={zone.id}
                  className="w-full max-w-md flex items-center justify-between px-3 py-1.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700 transition"
                >
                  {/* Left: Magnetic Arc Rings Graphic */}
                  <div className="w-20 flex justify-center">
                    <MagneticArcRings 
                      chainAgreement={zone.chainAgreement}
                      strengthTier={zone.strengthTier}
                      type="LOWER"
                    />
                  </div>

                  {/* Right: Price & Distance Telemetry */}
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs sm:text-sm font-black text-zinc-200">
                        ${zone.price.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-bold text-rose-400">
                        {zone.distanceR.toFixed(2)}R
                      </span>
                    </div>
                    <div className="text-[9px] text-zinc-400 flex items-center justify-end gap-1.5">
                      <span>{zone.distanceTier}</span>
                      <span>•</span>
                      <span>{zone.strengthTier}</span>
                      <span>•</span>
                      <span className="text-zinc-400">{zone.channelLabel}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. CURRENT SIGNAL: FIRST TOUCH PREDICTION */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-zinc-950 via-[#0a0f1d] to-zinc-950 border border-cyan-500/30 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-black text-white uppercase tracking-wider">
              CURRENT SIGNAL — FIRST TOUCH
            </span>
          </div>
          <span className="text-[10px] text-zinc-400">
            Where price is most likely to be pulled first
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-cyan-300">
                ${primaryTarget.targetPrice.toFixed(2)}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />
                <span>UP</span>
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 pt-0.5">
              <span>{primaryTarget.strengthLabel}</span>
              <span className="mx-1">•</span>
              <span>{primaryTarget.distancePts} pts</span>
            </div>
          </div>

          {/* Touch Probability Badge */}
          <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-right">
            <div className="text-lg sm:text-xl font-black text-cyan-300">
              {primaryTarget.probabilityPct}%
            </div>
            <div className="text-[9px] uppercase tracking-wider text-cyan-400/80 font-bold">
              TOUCH PROBABILITY
            </div>
          </div>
        </div>

        {/* Scenario Paths: Reject vs Break */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-zinc-900 text-[10.5px]">
          <div className="p-2 rounded-lg bg-rose-950/20 border border-rose-500/20 space-y-0.5">
            <div className="text-[9px] font-bold text-rose-400 uppercase flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3" />
              <span>REJECT + FLIP DOWN</span>
            </div>
            <div className="text-xs font-bold text-zinc-200">
              Target: ${primaryTarget.rejectFlipTarget.toFixed(2)}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 space-y-0.5">
            <div className="text-[9px] font-bold text-emerald-400 uppercase flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>BREAK + CONTINUE UP</span>
            </div>
            <div className="text-xs font-bold text-zinc-200">
              Target: ${primaryTarget.breakContinueTarget.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Chain Path Sequences */}
        <div className="space-y-1 text-[9.5px] text-zinc-400 pt-1 font-mono">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-emerald-400 font-bold">IF BREAKS:</span>
            {primaryTarget.breakChain.map((p, idx) => (
              <React.Fragment key={idx}>
                <span className="text-zinc-300">${p.toFixed(2)}</span>
                {idx < primaryTarget.breakChain.length - 1 && <span className="text-zinc-600">→</span>}
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-rose-400 font-bold">IF REJECTS:</span>
            {primaryTarget.rejectChain.map((p, idx) => (
              <React.Fragment key={idx}>
                <span className="text-zinc-300">${p.toFixed(2)}</span>
                {idx < primaryTarget.rejectChain.length - 1 && <span className="text-zinc-600">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* 5. PULL BALANCE: WHICH SIDE IS PULLING HARDER */}
      <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-zinc-400 uppercase tracking-wider text-[10px]">
            PULL BALANCE — WHICH SIDE IS PULLING HARDER
          </span>
          <span className="text-rose-400 font-black">
            PULLING DOWN {pullBalance.downPullPct}%
          </span>
        </div>

        {/* Dual Progress Bar */}
        <div className="w-full h-2.5 bg-zinc-900 rounded-full flex overflow-hidden p-0.5 gap-0.5">
          <div 
            className="bg-gradient-to-r from-rose-500 to-rose-400 h-full rounded-l transition-all duration-500" 
            style={{ width: `${pullBalance.downPullPct}%` }}
          />
          <div 
            className="bg-gradient-to-r from-cyan-400 to-cyan-300 h-full rounded-r transition-all duration-500" 
            style={{ width: `${pullBalance.upPullPct}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
          <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
            <span className="text-zinc-400 text-[9px]">NEAREST UP MAGNET</span>
            <div className="text-xs font-bold text-cyan-300">
              ${pullBalance.nearestUpMagnet.price.toFixed(2)} (+{pullBalance.nearestUpMagnet.distanceR.toFixed(2)}R)
            </div>
            <span className="text-[8.5px] text-zinc-400">• {pullBalance.nearestUpMagnet.distanceTier}</span>
          </div>

          <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
            <span className="text-zinc-400 text-[9px]">NEAREST DOWN MAGNET</span>
            <div className="text-xs font-bold text-rose-300">
              ${pullBalance.nearestDownMagnet.price.toFixed(2)} ({pullBalance.nearestDownMagnet.distanceR.toFixed(2)}R)
            </div>
            <span className="text-[8.5px] text-zinc-400">• {pullBalance.nearestDownMagnet.distanceTier}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
