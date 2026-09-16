import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  CheckCircle2,
  Radar,
  Crown,
  Filter
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { DirectionType } from '../types';

export const AssetOverview: React.FC = () => {
  const { 
    markets, 
    signals, 
    selectedSignalId, 
    setSelectedSignalId,
    scanMarket,
    isScanningMarket,
    highestProbabilitySignal
  } = useMarket();

  const [filterTopOnly, setFilterTopOnly] = useState<boolean>(false);

  const getDirectionBadge = (dir: DirectionType) => {
    switch (dir) {
      case 'LONG':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono-num flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>LONG</span>
          </span>
        );
      case 'SHORT':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold font-mono-num flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-rose-400" />
            <span>SHORT</span>
          </span>
        );
      case 'WAIT':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono-num flex items-center gap-1">
            <Minus className="w-3 h-3 text-amber-400" />
            <span>WAIT</span>
          </span>
        );
    }
  };

  const displayedSignals = filterTopOnly 
    ? signals.filter(s => s.id === highestProbabilitySignal.id) 
    : signals;

  return (
    <section id="asset-overview-section" className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4">
      {/* Section Header & Scanner Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <div>
            <h2 className="text-xs font-mono-num uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              GLOBAL ASSET OVERVIEW & SIGNALS
            </h2>
            <span className="text-xs text-zinc-500 font-mono-num">
              Select an asset to view real-time AI signal & SMC execution
            </span>
          </div>
        </div>

        {/* Scan Market Button & Filter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterTopOnly(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono-num transition flex items-center gap-1.5 cursor-pointer ${
              filterTopOnly 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold' 
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>{filterTopOnly ? 'Showing Top Setup Only' : 'Filter Top Setup'}</span>
          </button>

          <button
            onClick={() => scanMarket()}
            disabled={isScanningMarket}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 active:scale-95 text-black font-bold text-xs font-mono-num transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
          >
            <Radar className={`w-3.5 h-3.5 text-black ${isScanningMarket ? 'animate-spin' : ''}`} />
            <span>{isScanningMarket ? 'Scanning Markets...' : 'Scan Market'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Assets */}
      <div className={`grid gap-4 ${
        filterTopOnly 
          ? 'grid-cols-1 max-w-xl mx-auto' 
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'
      }`}>
        {displayedSignals.map((signal) => {
          const isSelected = selectedSignalId === signal.id;
          const market = markets.find(m => m.id === signal.marketId);
          const currentPrice = market ? market.price : signal.entryPrice;
          const changePercent = market ? market.changePercent : 0;
          const isPositive = changePercent >= 0;
          const isHighest = signal.id === highestProbabilitySignal.id;
          const setupScore = signal.setupStrength?.overallScore || signal.confidenceScore;

          return (
            <div
              key={signal.id}
              onClick={() => setSelectedSignalId(signal.id)}
              className={`relative p-5 rounded-2xl transition-all duration-200 cursor-pointer border flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'bg-gradient-to-b from-[#1c1d28] to-[#0c0d12] border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-400/40 transform -translate-y-0.5'
                  : 'bg-glass-card border-zinc-800/80 hover:border-amber-500/40 hover:bg-[#111218]'
              }`}
            >
              {/* Top Conviction Badge */}
              {isHighest && (
                <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-black font-mono-num uppercase tracking-wider shadow-md flex items-center gap-1">
                  <Crown className="w-2.5 h-2.5 text-black" />
                  <span>TOP SETUP • {setupScore}%</span>
                </div>
              )}

              {/* Top: Asset Name & Direction Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white font-syne tracking-wide">
                    {signal.symbol}
                  </h3>
                  <span className="text-xs text-zinc-400 font-mono-num block">
                    {signal.name}
                  </span>
                </div>
                {getDirectionBadge(signal.direction)}
              </div>

              {/* Price & 24h Change */}
              <div>
                <div className="text-xl font-bold font-mono-num text-amber-300">
                  ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: market?.decimals || 2 })}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs font-mono-num">
                  <span className={`flex items-center font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                  </span>
                  <span className="text-zinc-500">• 24h</span>
                </div>
              </div>

              {/* Setup Score & Confidence Bar */}
              <div className="pt-3 border-t border-zinc-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono-num">
                  <span className="text-zinc-400">Setup Strength</span>
                  <span className="font-bold text-amber-300">{setupScore}% ({signal.setupStrength?.grade || 'A'})</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 transition-all duration-500"
                    style={{ width: `${setupScore}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
