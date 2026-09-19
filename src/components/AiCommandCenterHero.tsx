import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Activity, 
  Cpu, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Zap, 
  Globe2, 
  Radio,
  Clock,
  Database
} from 'lucide-react';
import { MarketItem } from '../types';

interface AiCommandCenterHeroProps {
  onAccessTerminal: () => void;
  markets: MarketItem[];
}

interface Point3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  size: number;
  alpha: number;
  speed: number;
  orbitRadius: number;
  orbitAngle: number;
  orbitSpeed: number;
  color: string;
}

interface DataStreamPacket {
  progress: number;
  speed: number;
  targetIndex: number;
  length: number;
  color: string;
}

export const AiCommandCenterHero: React.FC<AiCommandCenterHeroProps> = ({
  onAccessTerminal,
  markets
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [targetMousePos, setTargetMousePos] = useState({ x: 0, y: 0 });
  const [lastTickTime, setLastTickTime] = useState<string>('Just now (12ms)');
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  // Update real-time relative tick timestamp
  useEffect(() => {
    const timer = setInterval(() => {
      const ms = Math.floor(8 + Math.random() * 14);
      setLastTickTime(`Updated ${ms}ms ago`);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // IntersectionObserver to pause heavy 3D canvas render loop when hero is scrolled out of view
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Extract live market data dynamically from props with fallbacks
  const xauMarket = useMemo(() => 
    markets.find(m => m.id === 'xau-usd' || m.symbol.includes('XAU')) || {
      id: 'xau-usd',
      symbol: 'XAU/USD',
      name: 'Gold Spot',
      price: 4284.50,
      changePercent: 0.48,
      isOpen: true,
      category: 'commodities' as const,
      sparkline: [4270, 4274, 4272, 4279, 4281, 4284.5]
    }, [markets]);

  const spMarket = useMemo(() => 
    markets.find(m => m.id === 'sp-500' || m.symbol.includes('S&P') || m.symbol.includes('SPX')) || {
      id: 'sp-500',
      symbol: 'S&P 500',
      name: 'E-mini S&P 500',
      price: 5894.20,
      changePercent: 0.64,
      isOpen: true,
      category: 'indices' as const,
      sparkline: [5860, 5872, 5868, 5885, 5890, 5894.2]
    }, [markets]);

  const nasdaqMarket = useMemo(() => 
    markets.find(m => m.id === 'nasdaq-100' || m.symbol.includes('NASDAQ') || m.symbol.includes('NDX')) || {
      id: 'nasdaq-100',
      symbol: 'NASDAQ 100',
      name: 'US Tech 100',
      price: 20418.60,
      changePercent: 0.92,
      isOpen: true,
      category: 'indices' as const,
      sparkline: [20250, 20310, 20290, 20380, 20400, 20418.6]
    }, [markets]);

  const eurMarket = useMemo(() => 
    markets.find(m => m.id === 'eur-usd' || m.symbol.includes('EUR')) || {
      id: 'eur-usd',
      symbol: 'EUR/USD',
      name: 'Euro / US Dollar',
      price: 1.0846,
      changePercent: -0.15,
      isOpen: true,
      category: 'forex' as const,
      sparkline: [1.0860, 1.0855, 1.0850, 1.0848, 1.0846]
    }, [markets]);

  // Format currency helpers
  const formatPrice = (val: number, symbol: string) => {
    if (symbol.includes('EUR') || symbol.includes('GBP') || symbol.includes('AUD')) {
      return val.toFixed(4);
    }
    if (val >= 1000) {
      return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return '$' + val.toFixed(2);
  };

  // 3D Realistic AI Core & Particle Command Center Engine
  useEffect(() => {
    if (!isHeroVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Initialize 3D Core Particle Swarm
    const particleCount = width < 640 ? 50 : width < 1024 ? 80 : 120;
    const particles: Point3D[] = [];
    const colors = ['#f59e0b', '#fbbf24', '#d97706', '#fef08a', '#38bdf8', '#ffffff'];

    for (let i = 0; i < particleCount; i++) {
      const radius = 80 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      particles.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta) * 0.65,
        z: radius * Math.cos(phi),
        baseX: radius * Math.sin(phi) * Math.cos(theta),
        baseY: radius * Math.sin(phi) * Math.sin(theta) * 0.65,
        baseZ: radius * Math.cos(phi),
        size: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.7 + 0.3,
        speed: 0.002 + Math.random() * 0.004,
        orbitRadius: radius,
        orbitAngle: theta,
        orbitSpeed: (Math.random() - 0.5) * 0.015,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // Dynamic Data Stream Packets
    const packets: DataStreamPacket[] = [
      { progress: 0.1, speed: 0.009, targetIndex: 0, length: 0.25, color: '#fbbf24' },
      { progress: 0.4, speed: 0.013, targetIndex: 1, length: 0.3, color: '#f59e0b' },
      { progress: 0.7, speed: 0.010, targetIndex: 2, length: 0.2, color: '#38bdf8' },
      { progress: 0.2, speed: 0.012, targetIndex: 3, length: 0.28, color: '#34d399' }
    ];

    // Core Geometry Nodes
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const baseCoreScale = width < 768 ? 44 : 70;
    const coreVertices: [number, number, number][] = [
      [-1, goldenRatio, 0], [1, goldenRatio, 0], [-1, -goldenRatio, 0], [1, -goldenRatio, 0],
      [0, -1, goldenRatio], [0, 1, goldenRatio], [0, -1, -goldenRatio], [0, 1, -goldenRatio],
      [goldenRatio, 0, -1], [goldenRatio, 0, 1], [-goldenRatio, 0, -1], [-goldenRatio, 0, 1]
    ].map(([x, y, z]) => [x * baseCoreScale, y * baseCoreScale, z * baseCoreScale]);

    const coreEdges: [number, number][] = [
      [0, 11], [0, 5], [0, 1], [0, 7], [0, 10],
      [1, 5], [1, 9], [1, 8], [1, 7],
      [2, 11], [2, 10], [2, 6], [2, 4], [2, 3],
      [3, 4], [3, 9], [3, 8], [3, 6],
      [4, 5], [4, 9], [4, 11],
      [5, 9],
      [6, 7], [6, 8], [6, 10],
      [7, 8],
      [8, 9],
      [10, 11]
    ];

    let angleX = 0.2;
    let angleY = 0;
    let angleZ = 0;
    let pulse = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse tracking inertia
      currentTiltX += (targetMousePos.y * 0.25 - currentTiltX) * 0.05;
      currentTiltY += (targetMousePos.x * 0.35 - currentTiltY) * 0.05;

      angleY += 0.006;
      angleX = 0.25 + Math.sin(pulse * 0.8) * 0.08 + currentTiltX;
      angleZ = Math.cos(pulse * 0.5) * 0.04;
      pulse += 0.02;

      const centerX = width / 2;
      const centerY = height * (width < 768 ? 0.44 : 0.48);
      const fov = 480;

      // 1. Central Volumetric Golden Radial Reactor Core
      const coreGlow = ctx.createRadialGradient(
        centerX, centerY, 10,
        centerX, centerY, width < 768 ? 200 : 330
      );
      coreGlow.addColorStop(0, 'rgba(251, 191, 36, 0.42)');
      coreGlow.addColorStop(0.2, 'rgba(245, 158, 11, 0.22)');
      coreGlow.addColorStop(0.45, 'rgba(180, 83, 9, 0.08)');
      coreGlow.addColorStop(0.75, 'rgba(14, 165, 233, 0.03)');
      coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, width < 768 ? 200 : 330, 0, Math.PI * 2);
      ctx.fill();

      // 2. 3D Rotation Transformations
      const rotate3D = (x: number, y: number, z: number): [number, number, number] => {
        const cosY = Math.cos(angleY + currentTiltY);
        const sinY = Math.sin(angleY + currentTiltY);
        let x1 = x * cosY - z * sinY;
        let z1 = x * sinY + z * cosY;

        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        let y2 = y * cosX - z1 * sinX;
        let z2 = y * sinX + z1 * cosX;

        const cosZ = Math.cos(angleZ);
        const sinZ = Math.sin(angleZ);
        let x3 = x1 * cosZ - y2 * sinZ;
        let y3 = x1 * sinZ + y2 * cosZ;

        return [x3, y3, z2];
      };

      // 3. Concentric Energy Rings
      const rings = [
        { radius: width < 768 ? 95 : 140, tilt: 0.35, speed: 0.015, color: 'rgba(245, 158, 11, 0.45)', dash: [6, 10] },
        { radius: width < 768 ? 130 : 185, tilt: -0.55, speed: -0.011, color: 'rgba(251, 191, 36, 0.35)', dash: [14, 18] },
        { radius: width < 768 ? 165 : 235, tilt: 0.75, speed: 0.008, color: 'rgba(56, 189, 248, 0.25)', dash: [4, 16] }
      ];

      rings.forEach(ring => {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(currentTiltY + pulse * ring.speed);
        ctx.scale(1, Math.cos(ring.tilt + currentTiltX));
        ctx.beginPath();
        ctx.arc(0, 0, ring.radius + Math.sin(pulse * 2) * 4, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 1.2;
        ctx.setLineDash(ring.dash);
        ctx.stroke();
        ctx.restore();
      });

      // 4. Transform and Project Core Lattice Vertices
      const projectedCoreVertices: { x: number; y: number; z: number; scale: number }[] = [];
      const dynamicScale = 1 + Math.sin(pulse * 1.5) * 0.05;

      coreVertices.forEach(([vx, vy, vz]) => {
        const [rx, ry, rz] = rotate3D(vx * dynamicScale, vy * dynamicScale, vz * dynamicScale);
        const scale = fov / (fov + rz + 180);
        projectedCoreVertices.push({
          x: centerX + rx * scale,
          y: centerY + ry * scale,
          z: rz,
          scale
        });
      });

      // 5. Draw 3D Core Edges
      ctx.lineWidth = 1.5;
      coreEdges.forEach(([i, j]) => {
        const p1 = projectedCoreVertices[i];
        const p2 = projectedCoreVertices[j];
        if (!p1 || !p2) return;

        const avgZ = (p1.z + p2.z) / 2;
        const alpha = Math.max(0.12, Math.min(0.85, (avgZ + 120) / 240));

        const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        gradient.addColorStop(0, `rgba(251, 191, 36, ${alpha * 0.9})`);
        gradient.addColorStop(0.5, `rgba(245, 158, 11, ${alpha * 0.6})`);
        gradient.addColorStop(1, `rgba(217, 119, 6, ${alpha * 0.9})`);

        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // 6. Core Nodes
      projectedCoreVertices.forEach(p => {
        const nodeAlpha = Math.max(0.2, (p.z + 120) / 240);
        ctx.fillStyle = `rgba(255, 255, 255, ${nodeAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5 * p.scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(251, 191, 36, ${nodeAlpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.5 * p.scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // 7. Core Singularity
      const innerRadius = (width < 768 ? 18 : 26) + Math.sin(pulse * 3) * 3;
      const innerGlow = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, innerRadius * 2
      );
      innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      innerGlow.addColorStop(0.35, 'rgba(251, 191, 36, 0.9)');
      innerGlow.addColorStop(0.75, 'rgba(217, 119, 6, 0.5)');
      innerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = innerGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // 8. 3D Swarm Particles
      particles.forEach(p => {
        p.orbitAngle += p.orbitSpeed;
        const currentRadius = p.orbitRadius + Math.sin(pulse + p.orbitAngle) * 12;

        const rawX = Math.cos(p.orbitAngle) * currentRadius;
        const rawY = Math.sin(p.orbitAngle) * currentRadius * 0.45 + Math.sin(p.orbitAngle * 3) * 20;
        const rawZ = Math.sin(p.orbitAngle) * currentRadius * 0.8;

        const [rx, ry, rz] = rotate3D(rawX, rawY, rawZ);
        const scale = fov / (fov + rz + 200);
        const screenX = centerX + rx * scale;
        const screenY = centerY + ry * scale;

        const depthAlpha = Math.max(0.08, Math.min(0.95, (rz + 240) / 480)) * p.alpha;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = depthAlpha;
        ctx.beginPath();
        ctx.arc(screenX, screenY, p.size * scale, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // 9. Data Stream Laser Pulses connecting AI Core
      const targetAnchors = [
        { x: width * 0.18, y: height * 0.32 },
        { x: width * 0.82, y: height * 0.32 },
        { x: width * 0.18, y: height * 0.68 },
        { x: width * 0.82, y: height * 0.68 }
      ];

      packets.forEach((pkt) => {
        pkt.progress += pkt.speed;
        if (pkt.progress > 1) pkt.progress = 0;

        const target = targetAnchors[pkt.targetIndex % targetAnchors.length];
        
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();

        const curX = centerX + (target.x - centerX) * pkt.progress;
        const curY = centerY + (target.y - centerY) * pkt.progress;

        const tailX = centerX + (target.x - centerX) * Math.max(0, pkt.progress - pkt.length);
        const tailY = centerY + (target.y - centerY) * Math.max(0, pkt.progress - pkt.length);

        const beamGradient = ctx.createLinearGradient(tailX, tailY, curX, curY);
        beamGradient.addColorStop(0, 'rgba(245, 158, 11, 0)');
        beamGradient.addColorStop(0.8, pkt.color);
        beamGradient.addColorStop(1, '#ffffff');

        ctx.strokeStyle = beamGradient;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(curX, curY);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(curX, curY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [targetMousePos, isHeroVisible]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setTargetMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setTargetMousePos({ x: 0, y: 0 });
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative z-10 w-full min-h-[calc(100vh-80px)] flex flex-col justify-between py-6 sm:py-10 px-4 sm:px-6 lg:px-8 overflow-hidden select-none"
    >
      {/* 3D WebGL / Canvas Command Center Layer */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Cybernetic HUD Reticle Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[540px] h-[340px] sm:h-[540px] rounded-full border border-amber-500/15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] sm:w-[380px] h-[240px] sm:h-[380px] rounded-full border border-dashed border-amber-400/20 animate-spin" style={{ animationDuration: '60s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] sm:w-[720px] h-[440px] sm:h-[720px] rounded-full border border-amber-500/5" />
      </div>

      {/* 1. TOP HERO HEADER & IDENTITY */}
      <div className="relative z-20 text-center max-w-4xl mx-auto space-y-3 sm:space-y-4 pt-2 sm:pt-4">
        
        {/* Small Institutional Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 border border-amber-500/40 text-amber-300 text-[11px] sm:text-xs font-mono tracking-wider backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>INSTITUTIONAL MARKET INTELLIGENCE</span>
          </div>
        </div>

        {/* Main Heading */}
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-cinzel font-black tracking-tight leading-tight">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 drop-shadow-[0_2px_15px_rgba(245,158,11,0.3)]">
              AURUM TERMINAL
            </span>
          </h1>
          <p className="text-xs sm:text-sm lg:text-base font-mono uppercase tracking-[0.25em] text-zinc-300 font-bold">
            AI-POWERED MARKET INTELLIGENCE PLATFORM
          </p>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm lg:text-base text-zinc-400 font-sans max-w-2xl mx-auto leading-relaxed px-2">
          Real-time market intelligence, AI analysis, economic awareness, and advanced risk monitoring in one professional terminal.
        </p>

        {/* Hero CTA Button */}
        <div className="pt-2 sm:pt-4 flex justify-center">
          <button
            onClick={onAccessTerminal}
            className="group relative px-7 sm:px-9 py-3.5 sm:py-4 rounded-xl font-bold text-xs sm:text-sm text-black bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.45)] hover:shadow-[0_0_50px_rgba(245,158,11,0.65)] transition-all duration-300 cursor-pointer flex items-center gap-2.5 overflow-hidden active:scale-98"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
            <span className="tracking-wider uppercase font-mono font-black">ACCESS LIVE TERMINAL</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-black" />
          </button>
        </div>
      </div>

      {/* 2. COMMAND CENTER 3D VIEWPORT & FLOATING HOLOGRAPHIC PANELS */}
      <div className="relative z-20 w-full max-w-6xl mx-auto my-auto py-6 sm:py-10">
        
        {/* Desktop 4-Corner Hologram Layout */}
        <div className="hidden lg:grid grid-cols-12 gap-4 items-center min-h-[300px]">
          
          {/* LEFT COLUMN: XAU/USD & EUR/USD */}
          <div className="col-span-3 space-y-4">
            
            {/* Panel 1: XAU/USD (LIVE MARKET) */}
            <div className="p-4 rounded-2xl bg-[#080b14]/90 border border-amber-500/35 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.75)] hover:border-amber-400/70 transition-all duration-300 group hover:-translate-y-1">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-sm font-cinzel font-black text-amber-300">XAU/USD</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[9.5px] font-mono font-bold border border-amber-500/30">
                  LIVE MARKET
                </span>
              </div>
              <div className="mt-2.5 space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">Live Price</span>
                  <span className="text-base font-bold font-mono text-zinc-100 group-hover:text-amber-300 transition">
                    {formatPrice(xauMarket.price, xauMarket.symbol)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">24H Change</span>
                  <span className={`text-xs font-mono font-bold flex items-center gap-0.5 ${xauMarket.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {xauMarket.changePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {xauMarket.changePercent >= 0 ? `+${xauMarket.changePercent.toFixed(2)}%` : `${xauMarket.changePercent.toFixed(2)}%`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-zinc-800/60">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Database className="w-3 h-3 text-amber-400" />
                    LIVE MARKET DATA
                  </span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ACTIVE
                  </span>
                </div>
                <div className="text-[9px] font-mono text-zinc-500 text-right">
                  {lastTickTime}
                </div>
              </div>
            </div>

            {/* Panel 2: EUR/USD (LIVE FOREX DATA) */}
            <div className="p-4 rounded-2xl bg-[#080b14]/90 border border-sky-500/30 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.75)] hover:border-sky-400/60 transition-all duration-300 group hover:-translate-y-1">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <span className="text-sm font-cinzel font-black text-sky-300">EUR/USD</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 text-[9.5px] font-mono font-bold border border-sky-500/30">
                  LIVE FOREX DATA
                </span>
              </div>
              <div className="mt-2.5 space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">Live Price</span>
                  <span className="text-base font-bold font-mono text-zinc-100 group-hover:text-sky-300 transition">
                    {formatPrice(eurMarket.price, eurMarket.symbol)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">24H Change</span>
                  <span className={`text-xs font-mono font-bold flex items-center gap-0.5 ${eurMarket.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {eurMarket.changePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {eurMarket.changePercent >= 0 ? `+${eurMarket.changePercent.toFixed(2)}%` : `${eurMarket.changePercent.toFixed(2)}%`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-zinc-800/60">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Database className="w-3 h-3 text-sky-400" />
                    LIVE MARKET DATA
                  </span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ACTIVE
                  </span>
                </div>
                <div className="text-[9px] font-mono text-zinc-500 text-right">
                  {lastTickTime}
                </div>
              </div>
            </div>

          </div>

          {/* CENTER COLUMN: AI COMMAND CORE STATUS HUD */}
          <div className="col-span-6 flex flex-col items-center justify-center text-center pointer-events-none px-4">
            <div className="p-3 rounded-2xl bg-black/75 border border-amber-500/30 backdrop-blur-md shadow-2xl flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>AI COMMAND CORE // 24/7 ACTIVE SURVEILLANCE</span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400">
                Continuous Market Structure & Multi-Agent Intelligence
              </p>
              <div className="flex items-center gap-3 pt-1 text-[10px] font-mono text-zinc-300">
                <span className="text-emerald-400">● Latency: &lt;12ms</span>
                <span className="text-amber-300">● Engine: Multi-Agent</span>
                <span className="text-sky-400">● Telemetry: 100% OK</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: S&P 500 & NASDAQ 100 */}
          <div className="col-span-3 space-y-4">
            
            {/* Panel 3: S&P 500 (LIVE INDEX DATA) */}
            <div className="p-4 rounded-2xl bg-[#080b14]/90 border border-amber-500/35 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.75)] hover:border-amber-400/70 transition-all duration-300 group hover:-translate-y-1">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-cinzel font-black text-amber-300">S&P 500</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[9.5px] font-mono font-bold border border-amber-500/30">
                  LIVE INDEX DATA
                </span>
              </div>
              <div className="mt-2.5 space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">Live Price</span>
                  <span className="text-base font-bold font-mono text-zinc-100 group-hover:text-amber-300 transition">
                    {formatPrice(spMarket.price, spMarket.symbol)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">24H Change</span>
                  <span className={`text-xs font-mono font-bold flex items-center gap-0.5 ${spMarket.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {spMarket.changePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {spMarket.changePercent >= 0 ? `+${spMarket.changePercent.toFixed(2)}%` : `${spMarket.changePercent.toFixed(2)}%`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-zinc-800/60">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Database className="w-3 h-3 text-emerald-400" />
                    LIVE MARKET DATA
                  </span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ACTIVE
                  </span>
                </div>
                <div className="text-[9px] font-mono text-zinc-500 text-right">
                  {lastTickTime}
                </div>
              </div>
            </div>

            {/* Panel 4: NASDAQ 100 (LIVE INDEX DATA) */}
            <div className="p-4 rounded-2xl bg-[#080b14]/90 border border-purple-500/30 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.75)] hover:border-purple-400/60 transition-all duration-300 group hover:-translate-y-1">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="text-sm font-cinzel font-black text-purple-300">NASDAQ 100</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 text-[9.5px] font-mono font-bold border border-purple-500/30">
                  LIVE INDEX DATA
                </span>
              </div>
              <div className="mt-2.5 space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">Live Price</span>
                  <span className="text-base font-bold font-mono text-zinc-100 group-hover:text-purple-300 transition">
                    {formatPrice(nasdaqMarket.price, nasdaqMarket.symbol)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">24H Change</span>
                  <span className={`text-xs font-mono font-bold flex items-center gap-0.5 ${nasdaqMarket.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {nasdaqMarket.changePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {nasdaqMarket.changePercent >= 0 ? `+${nasdaqMarket.changePercent.toFixed(2)}%` : `${nasdaqMarket.changePercent.toFixed(2)}%`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-zinc-800/60">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Database className="w-3 h-3 text-purple-400" />
                    LIVE MARKET DATA
                  </span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ACTIVE
                  </span>
                </div>
                <div className="text-[9px] font-mono text-zinc-500 text-right">
                  {lastTickTime}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Mobile & Tablet Compact Holographic Grid (< 1024px) */}
        <div className="lg:hidden grid grid-cols-2 gap-2.5 sm:gap-3">
          
          {/* Mobile XAU/USD */}
          <div className="p-3 rounded-xl bg-[#080b14]/90 border border-amber-500/35 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-cinzel text-amber-300">XAU/USD</span>
              <span className="text-[8.5px] font-mono text-amber-400 bg-amber-500/15 px-1 py-0.2 rounded border border-amber-500/30">
                LIVE
              </span>
            </div>
            <div className="mt-1.5 space-y-0.5">
              <span className="text-sm font-bold font-mono text-zinc-100 block">
                {formatPrice(xauMarket.price, xauMarket.symbol)}
              </span>
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className={xauMarket.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {xauMarket.changePercent >= 0 ? `+${xauMarket.changePercent.toFixed(2)}%` : `${xauMarket.changePercent.toFixed(2)}%`}
                </span>
                <span className="text-zinc-500">{lastTickTime}</span>
              </div>
            </div>
          </div>

          {/* Mobile S&P 500 */}
          <div className="p-3 rounded-xl bg-[#080b14]/90 border border-amber-500/35 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-cinzel text-amber-300">S&P 500</span>
              <span className="text-[8.5px] font-mono text-amber-400 bg-amber-500/15 px-1 py-0.2 rounded border border-amber-500/30">
                LIVE
              </span>
            </div>
            <div className="mt-1.5 space-y-0.5">
              <span className="text-sm font-bold font-mono text-zinc-100 block">
                {formatPrice(spMarket.price, spMarket.symbol)}
              </span>
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className={spMarket.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {spMarket.changePercent >= 0 ? `+${spMarket.changePercent.toFixed(2)}%` : `${spMarket.changePercent.toFixed(2)}%`}
                </span>
                <span className="text-zinc-500">{lastTickTime}</span>
              </div>
            </div>
          </div>

          {/* Mobile NASDAQ 100 */}
          <div className="p-3 rounded-xl bg-[#080b14]/90 border border-purple-500/30 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-cinzel text-purple-300">NASDAQ 100</span>
              <span className="text-[8.5px] font-mono text-purple-400 bg-purple-500/15 px-1 py-0.2 rounded border border-purple-500/30">
                LIVE
              </span>
            </div>
            <div className="mt-1.5 space-y-0.5">
              <span className="text-sm font-bold font-mono text-zinc-100 block">
                {formatPrice(nasdaqMarket.price, nasdaqMarket.symbol)}
              </span>
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className={nasdaqMarket.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {nasdaqMarket.changePercent >= 0 ? `+${nasdaqMarket.changePercent.toFixed(2)}%` : `${nasdaqMarket.changePercent.toFixed(2)}%`}
                </span>
                <span className="text-zinc-500">{lastTickTime}</span>
              </div>
            </div>
          </div>

          {/* Mobile EUR/USD */}
          <div className="p-3 rounded-xl bg-[#080b14]/90 border border-sky-500/30 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-cinzel text-sky-300">EUR/USD</span>
              <span className="text-[8.5px] font-mono text-sky-400 bg-sky-500/15 px-1 py-0.2 rounded border border-sky-500/30">
                LIVE
              </span>
            </div>
            <div className="mt-1.5 space-y-0.5">
              <span className="text-sm font-bold font-mono text-zinc-100 block">
                {formatPrice(eurMarket.price, eurMarket.symbol)}
              </span>
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className={eurMarket.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {eurMarket.changePercent >= 0 ? `+${eurMarket.changePercent.toFixed(2)}%` : `${eurMarket.changePercent.toFixed(2)}%`}
                </span>
                <span className="text-zinc-500">{lastTickTime}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. BOTTOM TICKER & AUDIT BAR */}
      <div className="relative z-20 pt-2 border-t border-zinc-800/80 max-w-5xl mx-auto w-full flex flex-wrap items-center justify-between text-[10.5px] sm:text-xs font-mono text-zinc-400 gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>INSTITUTIONAL AI INTELLIGENCE SYSTEM</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            24/7 Market Surveillance Active
          </span>
          <span className="hidden sm:inline text-zinc-700">|</span>
          <span className="hidden sm:inline text-amber-400/90 font-mono">
            Direct Liquidity Node Ingestion
          </span>
        </div>
      </div>

    </section>
  );
};
