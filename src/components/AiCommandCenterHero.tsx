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
import { GlowCard } from './landing/GlowCard';
import { MagneticButton } from './landing/MagneticButton';

interface AiCommandCenterHeroProps {
  onAccessTerminal: () => void;
  markets: MarketItem[];
}

export const AiCommandCenterHero: React.FC<AiCommandCenterHeroProps> = ({
  onAccessTerminal,
  markets
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [lastTickTime, setLastTickTime] = useState<string>('Just now (12ms)');

  // Update real-time relative tick timestamp
  useEffect(() => {
    const timer = setInterval(() => {
      const ms = Math.floor(8 + Math.random() * 14);
      setLastTickTime(`Updated ${ms}ms ago`);
    }, 2500);
    return () => clearInterval(timer);
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

  return (
    <section 
      id="hero"
      ref={containerRef}
      className="relative z-10 w-full min-h-[calc(100vh-80px)] flex flex-col justify-between py-6 sm:py-10 px-4 sm:px-6 lg:px-8 overflow-hidden select-none"
    >
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

        {/* Main Heading with Cinzel & Gold Shimmer */}
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-cinzel font-black tracking-tight leading-tight">
            <span className="block text-white drop-shadow-[0_2px_15px_rgba(245,158,11,0.3)]">
              AURUM <span className="gold-shimmer-text">TERMINAL</span>
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

        {/* Hero CTA Buttons with Magnetic Pull */}
        <div className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center gap-3">
          <MagneticButton
            onClick={onAccessTerminal}
            variant="primary"
            className="px-7 sm:px-9 py-3.5 sm:py-4"
          >
            <span className="font-black">ACCESS LIVE TERMINAL</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-black" />
          </MagneticButton>

          <MagneticButton
            onClick={() => {
              try {
                window.location.hash = 'phase-x';
                localStorage.setItem('aurum_active_tab', 'PHASE_X');
              } catch {}
              onAccessTerminal();
            }}
            variant="secondary"
            className="px-6 sm:px-8 py-3.5 sm:py-4 font-mono font-bold"
          >
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-black">PHASE X SIGNAL ENGINE</span>
          </MagneticButton>
        </div>
      </div>

      {/* 2. COMMAND CENTER 3D VIEWPORT & FLOATING HOLOGRAPHIC PANELS */}
      <div className="relative z-20 w-full max-w-6xl mx-auto my-auto py-6 sm:py-10">
        
        {/* Desktop 4-Corner Hologram Layout */}
        <div className="hidden lg:grid grid-cols-12 gap-4 items-center min-h-[300px]">
          
          {/* LEFT COLUMN: XAU/USD & EUR/USD */}
          <div className="col-span-3 space-y-4">
            
            {/* Panel 1: XAU/USD (LIVE MARKET) */}
            <GlowCard className="p-4 shadow-[0_8px_32px_rgba(0,0,0,0.75)] hover:-translate-y-1">
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
            </GlowCard>

            {/* Panel 2: EUR/USD (LIVE FOREX DATA) */}
            <GlowCard className="p-4 shadow-[0_8px_32px_rgba(0,0,0,0.75)] hover:-translate-y-1" glowColor="rgba(56, 189, 248, 0.14)" borderColor="rgba(56, 189, 248, 0.4)">
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
            </GlowCard>

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
            <GlowCard className="p-4 shadow-[0_8px_32px_rgba(0,0,0,0.75)] hover:-translate-y-1">
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
            </GlowCard>

            {/* Panel 4: NASDAQ 100 (LIVE INDEX DATA) */}
            <GlowCard className="p-4 shadow-[0_8px_32px_rgba(0,0,0,0.75)] hover:-translate-y-1" glowColor="rgba(168, 85, 247, 0.14)" borderColor="rgba(168, 85, 247, 0.4)">
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
            </GlowCard>

          </div>

        </div>

        {/* Mobile & Tablet Compact Holographic Grid (< 1024px) */}
        <div className="lg:hidden grid grid-cols-2 gap-2.5 sm:gap-3">
          
          {/* Card 1: XAU/USD */}
          <GlowCard className="p-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-cinzel font-black text-amber-300">XAU/USD</span>
              <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-amber-500/20 text-amber-300">
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
          </GlowCard>

          {/* Card 2: S&P 500 */}
          <GlowCard className="p-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-cinzel font-black text-amber-300">S&P 500</span>
              <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-amber-500/20 text-amber-300">
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
          </GlowCard>

          {/* Card 3: NASDAQ 100 */}
          <GlowCard className="p-3 shadow-lg" glowColor="rgba(168, 85, 247, 0.14)" borderColor="rgba(168, 85, 247, 0.4)">
            <div className="flex items-center justify-between">
              <span className="text-xs font-cinzel font-black text-purple-300">NASDAQ 100</span>
              <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-purple-500/20 text-purple-300">
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
          </GlowCard>

          {/* Card 4: EUR/USD */}
          <GlowCard className="p-3 shadow-lg" glowColor="rgba(56, 189, 248, 0.14)" borderColor="rgba(56, 189, 248, 0.4)">
            <div className="flex items-center justify-between">
              <span className="text-xs font-cinzel font-black text-sky-300">EUR/USD</span>
              <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-sky-500/20 text-sky-300">
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
          </GlowCard>

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
