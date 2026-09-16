import React from 'react';
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles, 
  CheckCircle2, 
  Gauge, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { Timeframe } from '../types';

export const TimeframeSignals: React.FC = () => {
  const { 
    selectedSignal, 
    selectedMarket, 
    selectedTimeframe, 
    setSelectedTimeframe 
  } = useMarket();

  const mtf = selectedSignal.multiTimeframe;

  const getDirectionBadge = (direction: 'LONG' | 'SHORT' | 'WAIT') => {
    switch (direction) {
      case 'LONG':
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono-num tracking-wide">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>LONG</span>
          </div>
        );
      case 'SHORT':
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold font-mono-num tracking-wide">
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            <span>SHORT</span>
          </div>
        );
      case 'WAIT':
      default:
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono-num tracking-wide">
            <Minus className="w-3.5 h-3.5 text-amber-400" />
            <span>WAIT</span>
          </div>
        );
    }
  };

  return (
    <section id="timeframe-signals-section" className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs font-mono-num uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            TIMEFRAME SIGNAL RADAR • {selectedSignal.symbol}
          </span>
        </div>
        <div className="text-xs font-mono-num text-zinc-400 flex items-center gap-2">
          <span className="text-zinc-500">Confluence:</span>
          <span className="text-amber-300 font-bold">{mtf.agreementCount}/{mtf.totalTimeframes} Timeframes Aligned</span>
        </div>
      </div>

      {/* 7 Timeframe Cards Grid (5M, 15M, 30M, 1H, 4H, 1D, 1W) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {mtf.timeframes.map((tfItem) => {
          const isActive = selectedTimeframe === (tfItem.timeframe as Timeframe);

          return (
            <div
              key={tfItem.timeframe}
              onClick={() => setSelectedTimeframe(tfItem.timeframe as Timeframe)}
              className={`p-4 rounded-2xl transition-all cursor-pointer border flex flex-col justify-between space-y-3 ${
                isActive
                  ? 'bg-gradient-to-b from-[#1c1d26] to-[#0f1016] border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/40'
                  : 'bg-glass-card border-zinc-800/80 hover:border-amber-500/40 hover:bg-[#111218]'
              }`}
            >
              {/* Top Row: Timeframe Pill & Direction */}
              <div className="flex items-center justify-between gap-1">
                <span className={`text-sm font-bold font-syne ${isActive ? 'text-amber-300' : 'text-white'}`}>
                  {tfItem.timeframe}
                </span>
                {getDirectionBadge(tfItem.direction)}
              </div>

              {/* Confidence Score % */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono-num">
                  <span className="text-zinc-400">Confidence</span>
                  <span className="font-bold text-amber-300">{tfItem.confidence}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      tfItem.direction === 'LONG'
                        ? 'bg-gradient-to-r from-amber-500 to-emerald-400'
                        : tfItem.direction === 'SHORT'
                        ? 'bg-gradient-to-r from-amber-500 to-rose-400'
                        : 'bg-amber-400'
                    }`}
                    style={{ width: `${tfItem.confidence}%` }}
                  />
                </div>
              </div>

              {/* Entry Status */}
              <div className="pt-2 border-t border-zinc-800/70">
                <span className="text-[10px] text-zinc-500 uppercase block font-mono-num">Entry Status</span>
                <span className="text-xs font-semibold text-zinc-200 font-mono-num truncate block mt-0.5" title={tfItem.entryStatus}>
                  {tfItem.entryStatus}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
