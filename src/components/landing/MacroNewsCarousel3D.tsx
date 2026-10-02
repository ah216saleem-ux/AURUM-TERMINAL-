import React, { useState } from 'react';
import { Calendar, BellRing, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tilt3DCard } from './Tilt3DCard';

interface MacroEvent {
  id: string;
  eventName: string;
  category: string;
  impactLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  currency: string;
  affectedAssets: string[];
  countdown: string;
  status: string;
  forecast: string;
  previous: string;
  oneLineBrief: string;
  riskProtocol: string;
}

const EVENTS: MacroEvent[] = [
  {
    id: 'cpi',
    eventName: 'US Consumer Price Index (CPI YoY)',
    category: 'INFLATION_METRICS',
    impactLevel: 'HIGH',
    currency: 'USD',
    affectedAssets: ['XAU/USD', 'EUR/USD', 'S&P 500', 'NASDAQ'],
    countdown: 'In 25 minutes',
    status: 'PRE-RELEASE FREEZE 🔴',
    forecast: '2.9%',
    previous: '3.1%',
    oneLineBrief: 'Core inflation release driving structural repricing across Precious Metals and USD pairs.',
    riskProtocol: '30-minute pre/post release automated execution freeze enforced.'
  },
  {
    id: 'fomc',
    eventName: 'Fed Chair Press Conference',
    category: 'CENTRAL_BANK',
    impactLevel: 'HIGH',
    currency: 'USD',
    affectedAssets: ['XAU/USD', 'S&P 500', 'USD/JPY'],
    countdown: 'Tomorrow 18:30 UTC',
    status: 'SCHEDULED QUEUE ⏳',
    forecast: '5.25% - 5.50%',
    previous: '5.50%',
    oneLineBrief: 'Monetary policy rate decision and interest rate path guidance.',
    riskProtocol: 'Volatility bracket expansion active on scalping algorithms.'
  },
  {
    id: 'nfp',
    eventName: 'US Non-Farm Payrolls (NFP)',
    category: 'LABOR_MARKET',
    impactLevel: 'HIGH',
    currency: 'USD',
    affectedAssets: ['XAU/USD', 'EUR/USD', 'GBP/USD'],
    countdown: 'Friday 13:30 UTC',
    status: 'SCHEDULED ⏳',
    forecast: '175K',
    previous: '189K',
    oneLineBrief: 'Monthly employment change establishing high-timeframe trend direction.',
    riskProtocol: 'Liquidity sweep defense mode activated during the opening 15 minutes.'
  },
  {
    id: 'ecb',
    eventName: 'ECB Monetary Policy Statement',
    category: 'CENTRAL_BANK',
    impactLevel: 'MEDIUM',
    currency: 'EUR',
    affectedAssets: ['EUR/USD', 'EUR/GBP'],
    countdown: 'In 2 Days',
    status: 'MONITORING 🟡',
    forecast: '3.65%',
    previous: '3.75%',
    oneLineBrief: 'Eurozone policy rate update and economic growth forecast.',
    riskProtocol: 'EUR pair risk limits reduced to 0.5R per trade.'
  }
];

export const MacroNewsCarousel3D: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextEvent = () => {
    setActiveIndex(prev => (prev + 1) % EVENTS.length);
  };

  const prevEvent = () => {
    setActiveIndex(prev => (prev - 1 + EVENTS.length) % EVENTS.length);
  };

  const featured = EVENTS[activeIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[11px] font-mono">
          <Calendar className="w-3.5 h-3.5 text-sky-400" />
          <span>MACRO INTELLIGENCE DESK</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-cinzel font-black tracking-tight text-white">
          NEWS & <span className="gold-shimmer-text">MACRO INTELLIGENCE</span>
        </h2>
        <p className="text-zinc-300 text-xs sm:text-sm max-w-md mx-auto leading-normal">
          Macroeconomic calendar auditing, countdown alerts, and automated volatility blackouts.
        </p>
      </div>

      {/* 3D Carousel Array */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        
        {/* Navigation Selector List (4 Cols) */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold px-1">
            SCHEDULED MACRO CATALYSTS:
          </span>
          {EVENTS.map((ev, idx) => {
            const isSelected = activeIndex === idx;
            return (
              <div
                key={ev.id}
                onClick={() => setActiveIndex(idx)}
                className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.2)] translate-x-1'
                    : 'bg-[#080b14]/70 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-[11px] shrink-0 ${
                    ev.impactLevel === 'HIGH' 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {ev.currency}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-cinzel line-clamp-1">
                      {ev.eventName}
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
                      {ev.countdown}
                    </span>
                  </div>
                </div>

                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  ev.impactLevel === 'HIGH'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {ev.impactLevel}
                </span>
              </div>
            );
          })}

          {/* Carousel Arrows */}
          <div className="flex items-center justify-between pt-1 px-1">
            <button
              onClick={prevEvent}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer flex items-center gap-1"
              aria-label="Previous Event"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-mono">Prev</span>
            </button>
            <span className="text-xs font-mono text-zinc-500">
              {activeIndex + 1} / {EVENTS.length}
            </span>
            <button
              onClick={nextEvent}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer flex items-center gap-1"
              aria-label="Next Event"
            >
              <span className="text-xs font-mono">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Featured Center 3D Holographic Card (8 Cols) */}
        <div className="lg:col-span-8">
          <Tilt3DCard
            glowColor={featured.impactLevel === 'HIGH' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)'}
            borderColor={featured.impactLevel === 'HIGH' ? 'rgba(244, 63, 94, 0.45)' : 'rgba(245, 158, 11, 0.45)'}
            elevation="lg"
            className="p-5 sm:p-6 space-y-4 rounded-3xl"
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
                    {featured.category}
                  </span>
                  <h3 className="text-base sm:text-xl font-bold text-white font-cinzel">
                    {featured.eventName}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                  {featured.status}
                </span>
              </div>
            </div>

            {/* Impact Meter Gauge & Forecast Data */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block font-sans">Countdown</span>
                <span className="text-sm sm:text-base font-black text-amber-300 block mt-0.5">{featured.countdown}</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block font-sans">Forecast / Prior</span>
                <span className="text-sm sm:text-base font-black text-sky-400 block mt-0.5">{featured.forecast} / {featured.previous}</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block font-sans">Impact Meter</span>
                <div className="flex items-center gap-1 mt-1.5">
                  <div className="flex-1 h-2 rounded-full bg-emerald-500" />
                  <div className="flex-1 h-2 rounded-full bg-amber-500" />
                  <div className={`flex-1 h-2 rounded-full ${featured.impactLevel === 'HIGH' ? 'bg-rose-500 animate-pulse' : 'bg-zinc-800'}`} />
                </div>
              </div>
            </div>

            {/* 1-Line Description & Protocol */}
            <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-1.5">
              <p className="text-xs text-zinc-200 font-medium leading-relaxed">
                {featured.oneLineBrief}
              </p>
              <div className="flex items-center gap-2 text-[11px] font-mono text-amber-400/90 pt-1 border-t border-zinc-800/50">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>Protocol: {featured.riskProtocol}</span>
              </div>
            </div>

            {/* Affected Assets */}
            <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-zinc-800/80">
              <span className="text-zinc-500 text-[11px]">Affected Assets:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {featured.affectedAssets.map((asset, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px]">
                    {asset}
                  </span>
                ))}
              </div>
            </div>

          </Tilt3DCard>
        </div>

      </div>
    </div>
  );
};
