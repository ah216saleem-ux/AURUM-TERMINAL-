import React from 'react';
import { 
  Compass, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  Send, 
  CheckCircle2, 
  XCircle,
  Activity,
  Gauge,
  Zap,
  Target,
  BarChart3,
  ShieldAlert,
  ArrowRight,
  Crosshair,
  Clock
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { SetupQuality } from '../types';

export const AiMarketRadar: React.FC = () => {
  const { 
    signals, 
    selectedSignalId, 
    setSelectedSignalId, 
    selectedSignal, 
    selectedMarket,
    sendSignalToTelegram
  } = useMarket();

  const radar = selectedSignal.radar;
  const smc = selectedSignal.smc;
  const mtf = selectedSignal.multiTimeframe;
  const tech = selectedSignal.technicals;

  const getScoreBadge = (score: SetupQuality) => {
    switch (score) {
      case 'A+':
        return <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono-num">A+ PRIME INSTITUTIONAL</span>;
      case 'A':
        return <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono-num">A GRADE HIGH CONVICTION</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold font-mono-num">{score} WATCHLIST</span>;
    }
  };

  return (
    <section id="ai-radar-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono-num text-amber-400 font-semibold tracking-wider uppercase mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>INSTITUTIONAL QUANT RADAR & SMC</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-syne tracking-tight">
            AI Market Radar & Smart Money Concepts
          </h2>
          <p className="text-zinc-400 text-sm mt-1 max-w-3xl">
            Live order book imbalances, multi-timeframe confluence (M15–D1), and Smart Money structural mapping (Order Blocks, Sweeps, BOS, CHOCH).
          </p>
        </div>

        {/* Asset Selector Tabs */}
        <div className="flex items-center p-1 bg-neutral-900 rounded-xl border border-zinc-800 self-start md:self-auto overflow-x-auto max-w-full">
          {signals.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSignalId(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-num font-semibold transition cursor-pointer whitespace-nowrap ${
                selectedSignalId === s.id
                  ? 'bg-amber-500 text-black shadow-md font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {s.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Top Banner: Selected Asset Quick Status */}
      <div className="p-4 sm:p-5 rounded-2xl bg-glass-card border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neutral-950 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold font-syne text-lg">
            {selectedSignal.symbol.slice(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-bold text-white font-syne">{selectedSignal.symbol}</h3>
              <span className="text-xs text-zinc-400 font-mono-num">({selectedSignal.name})</span>
              {getScoreBadge(radar.setupQualityScore)}
            </div>
            <div className="flex items-center gap-3 text-xs font-mono-num mt-1 text-zinc-400">
              <span>Timeframe: <strong className="text-zinc-200">{selectedSignal.timeframe}</strong></span>
              <span>•</span>
              <span>SMC Phase: <strong className="text-amber-300">{radar.smartMoneyActivity}</strong></span>
              <span>•</span>
              <span>Confidence: <strong className="text-emerald-400">{selectedSignal.confidenceScore}%</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              document.getElementById('live-charts-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-mono-num flex items-center gap-2 border border-zinc-700 transition cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5 text-amber-400" />
            <span>View on SMC Chart</span>
          </button>
        </div>
      </div>

      {/* Grid: AI Market Radar (6 Core Metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Trend Strength */}
        <div className="rounded-2xl bg-neutral-950/90 border border-zinc-800 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono-num">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-amber-400" />
              <span>Trend Strength</span>
            </span>
            <span className="font-bold text-white text-sm">{radar.trendStrength} / 100</span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${radar.trendStrength}%` }}
            />
          </div>
          <div className="text-[11px] font-mono-num text-zinc-400 flex justify-between">
            <span>Directional Intensity</span>
            <span className="text-amber-300 font-semibold">{selectedSignal.trend}</span>
          </div>
        </div>

        {/* 2. Buyers vs. Sellers Pressure */}
        <div className="rounded-2xl bg-neutral-950/90 border border-zinc-800 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono-num">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Buyers vs Sellers Pressure</span>
            </span>
            <span className="font-bold text-emerald-400 font-mono-num">
              {radar.buyersPressurePercent}% B / {radar.sellersPressurePercent}% S
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-rose-500/80 overflow-hidden flex">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${radar.buyersPressurePercent}%` }}
            />
          </div>
          <div className="text-[11px] font-mono-num text-zinc-400 flex justify-between">
            <span className="text-emerald-400">Buyers Domination</span>
            <span className="text-rose-400">Sellers Exhaustion</span>
          </div>
        </div>

        {/* 3. Smart Money Activity */}
        <div className="rounded-2xl bg-neutral-950/90 border border-zinc-800 p-5 space-y-2">
          <div className="text-xs font-mono-num text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Smart Money Activity</span>
          </div>
          <div className="text-base font-bold text-amber-300 font-syne pt-1">
            {radar.smartMoneyActivity}
          </div>
          <p className="text-[11px] text-zinc-400 font-mono-num leading-tight">
            Institutional footprint detected via high-volume order absorption and limit order block defense.
          </p>
        </div>

        {/* 4. Market Momentum */}
        <div className="rounded-2xl bg-neutral-950/90 border border-zinc-800 p-5 space-y-2">
          <div className="text-xs font-mono-num text-zinc-400 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Market Momentum</span>
          </div>
          <div className="text-base font-bold text-white font-syne pt-1">
            {radar.marketMomentum}
          </div>
          <p className="text-[11px] text-zinc-400 font-mono-num leading-tight">
            Expansion phase confirmed by ATR expansion (${tech.atr.toFixed(2)}) and MACD histogram velocity.
          </p>
        </div>

        {/* 5. Entry Timing */}
        <div className="rounded-2xl bg-neutral-950/90 border border-zinc-800 p-5 space-y-2">
          <div className="text-xs font-mono-num text-zinc-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Entry Timing State</span>
          </div>
          <div className="text-base font-bold text-emerald-300 font-syne pt-1">
            {radar.entryTiming}
          </div>
          <p className="text-[11px] text-zinc-400 font-mono-num leading-tight">
            Asset is residing in the prime mitigation pocket between ${selectedSignal.entryZone.min.toLocaleString()} and ${selectedSignal.entryZone.max.toLocaleString()}.
          </p>
        </div>

        {/* 6. Setup Quality Score */}
        <div className="rounded-2xl bg-neutral-950/90 border border-zinc-800 p-5 space-y-2">
          <div className="text-xs font-mono-num text-zinc-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Algorithmic Quality Grade</span>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-2xl font-black font-syne text-amber-400">
              {radar.setupQualityScore}
            </span>
            <span className="text-xs font-mono-num text-zinc-300">
              High Probability Risk Asymmetry ({selectedSignal.riskReward})
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-mono-num leading-tight">
            Calculated from order flow, liquidity clearance, and multi-timeframe confluence.
          </p>
        </div>
      </div>

      {/* Smart Money Concepts (SMC) Deep Breakdown Container */}
      <div className="rounded-2xl bg-glass-card border border-amber-500/25 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-2">
          <div className="flex items-center gap-2 text-sm font-bold font-syne text-white">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>SMART MONEY CONCEPTS (SMC) BLUEPRINT</span>
          </div>
          <span className="text-xs font-mono-num px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
            Structure: {smc.structure}
          </span>
        </div>

        {/* SMC Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Order Blocks */}
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-zinc-800 space-y-3">
            <div className="text-xs font-mono-num font-bold text-amber-300 uppercase tracking-wider">
              Order Blocks (OB)
            </div>
            <div className="space-y-2 text-xs font-mono-num">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
                <div className="text-emerald-300 font-bold flex items-center justify-between">
                  <span>Bullish OB+ ({smc.bullishOrderBlock.timeframe})</span>
                  <span className="text-[10px] text-zinc-400">
                    {smc.bullishOrderBlock.isMitigated ? 'Mitigated' : 'Active Demand'}
                  </span>
                </div>
                <div className="text-white font-mono-num mt-1">
                  ${smc.bullishOrderBlock.low.toLocaleString()} - ${smc.bullishOrderBlock.high.toLocaleString()}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25">
                <div className="text-rose-300 font-bold flex items-center justify-between">
                  <span>Bearish OB- ({smc.bearishOrderBlock.timeframe})</span>
                  <span className="text-[10px] text-zinc-400">
                    {smc.bearishOrderBlock.isMitigated ? 'Mitigated' : 'Active Supply'}
                  </span>
                </div>
                <div className="text-white font-mono-num mt-1">
                  ${smc.bearishOrderBlock.low.toLocaleString()} - ${smc.bearishOrderBlock.high.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Liquidity Zones & Sweeps */}
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-zinc-800 space-y-3">
            <div className="text-xs font-mono-num font-bold text-amber-300 uppercase tracking-wider">
              Liquidity Zones & Sweeps
            </div>
            <div className="space-y-2 text-xs font-mono-num">
              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400 text-[10px] block">Buy-Side Liquidity (BSL)</span>
                <span className="text-amber-200 font-bold block">${smc.buySideLiquidity.price.toLocaleString()}</span>
                <span className="text-[10px] text-zinc-500">{smc.buySideLiquidity.label}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400 text-[10px] block">Sell-Side Liquidity (SSL)</span>
                <span className="text-amber-200 font-bold block">${smc.sellSideLiquidity.price.toLocaleString()}</span>
                <span className="text-[10px] text-zinc-500">{smc.sellSideLiquidity.label}</span>
              </div>

              {smc.liquiditySweep.occurred && (
                <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[11px] text-amber-200">
                  <strong className="block text-amber-400">⚡ {smc.liquiditySweep.type} Detected</strong>
                  <span>{smc.liquiditySweep.description}</span>
                </div>
              )}
            </div>
          </div>

          {/* Market Structure (BOS, CHOCH, FVG) */}
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-zinc-800 space-y-3">
            <div className="text-xs font-mono-num font-bold text-amber-300 uppercase tracking-wider">
              BOS, CHOCH & Fair Value Gaps
            </div>
            <div className="space-y-2 text-xs font-mono-num">
              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                <div>
                  <span className="text-zinc-400 text-[10px] block">Break of Structure (BOS)</span>
                  <span className="text-emerald-400 font-bold">${smc.bosLevel?.toLocaleString() || 'N/A'}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Confirmed
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                <div>
                  <span className="text-zinc-400 text-[10px] block">Change of Character (CHOCH)</span>
                  <span className="text-amber-300 font-bold">${smc.chochLevel?.toLocaleString() || 'N/A'}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Key Pivot
                </span>
              </div>

              {smc.fairValueGap && (
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/25 text-[11px]">
                  <span className="text-blue-300 font-semibold block">{smc.fairValueGap.type} ({smc.fairValueGap.timeframe})</span>
                  <span className="text-white font-mono-num">
                    ${smc.fairValueGap.low.toLocaleString()} - ${smc.fairValueGap.high.toLocaleString()} (Imbalance pocket)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Timeframe Confirmation Matrix (M15, M30, H1, H4, D1) */}
      <div className="rounded-2xl bg-neutral-950 border border-zinc-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-2">
          <div>
            <h4 className="text-base font-bold text-white font-syne flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Multi-Timeframe Confirmation Matrix</span>
            </h4>
            <p className="text-xs text-zinc-400 font-mono-num mt-0.5">
              Only high-confluence setups with multi-timeframe consensus are dispatched.
            </p>
          </div>
          <div className="text-xs font-mono-num font-bold px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-300">
            {mtf.verdict}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {mtf.timeframes.map(item => (
            <div 
              key={item.timeframe}
              className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs font-mono-num"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{item.timeframe}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  item.bias === 'Bullish' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : item.bias === 'Bearish'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                }`}>
                  {item.bias}
                </span>
              </div>
              <div className="text-[11px] text-zinc-300 font-mono-num truncate">
                {item.trend}
              </div>
              <div className="text-[10px] text-zinc-500 truncate">
                {item.keyLevel}
              </div>
              <div className="w-full h-1 rounded-full bg-zinc-800 overflow-hidden mt-1">
                <div 
                  className="h-full bg-amber-400"
                  style={{ width: `${item.confidence}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Analysis Stack (EMA 20/50/200, RSI, MACD, S&R) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* EMAs */}
        <div className="p-5 rounded-2xl bg-neutral-950/90 border border-zinc-800 space-y-3">
          <div className="text-xs font-mono-num text-amber-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Exponential Moving Averages</span>
            <span className="text-[10px] text-emerald-400">{tech.emaAlignment}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono-num">
            <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
              <span className="text-zinc-500 text-[10px] block">EMA 20</span>
              <span className="text-white font-bold">${tech.ema20.toLocaleString()}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
              <span className="text-zinc-500 text-[10px] block">EMA 50</span>
              <span className="text-white font-bold">${tech.ema50.toLocaleString()}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
              <span className="text-zinc-500 text-[10px] block">EMA 200</span>
              <span className="text-white font-bold">${tech.ema200.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* RSI & MACD */}
        <div className="p-5 rounded-2xl bg-neutral-950/90 border border-zinc-800 space-y-3">
          <div className="text-xs font-mono-num text-amber-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Oscillators & Momentum</span>
            <span className="text-[10px] text-zinc-400">RSI(14) & MACD(12,26,9)</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono-num">
            <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-[10px]">RSI (14)</span>
                <span className="text-amber-300 font-bold">{tech.rsi}</span>
              </div>
              <span className="text-[10px] text-zinc-400 mt-1 block truncate">{tech.rsiCondition}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-[10px]">MACD Status</span>
                <span className="text-emerald-400 font-bold">{tech.macd.status}</span>
              </div>
              <span className="text-[10px] text-zinc-400 mt-1 block font-mono-num">
                Hist: +{tech.macd.histogram}
              </span>
            </div>
          </div>
        </div>

        {/* Support & Resistance */}
        <div className="p-5 rounded-2xl bg-neutral-950/90 border border-zinc-800 space-y-3">
          <div className="text-xs font-mono-num text-amber-400 font-bold uppercase tracking-wider">
            Key Support & Resistance Levels
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono-num">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-emerald-400 text-[10px] font-bold block">Support Levels (Demand)</span>
              <div className="text-white font-mono-num mt-1 space-y-0.5">
                {selectedSignal.supportLevels.map((lvl, idx) => (
                  <div key={idx}>S{idx+1}: ${lvl.toLocaleString()}</div>
                ))}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <span className="text-rose-400 text-[10px] font-bold block">Resistance Levels (Supply)</span>
              <div className="text-white font-mono-num mt-1 space-y-0.5">
                {selectedSignal.resistanceLevels.map((lvl, idx) => (
                  <div key={idx}>R{idx+1}: ${lvl.toLocaleString()}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
