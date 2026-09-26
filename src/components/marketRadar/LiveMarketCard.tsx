import React, { useEffect, useState } from 'react';
import { MarketRadarTelemetry } from './types';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

interface LiveMarketCardProps {
  telemetry: MarketRadarTelemetry;
}

export const LiveMarketCard: React.FC<LiveMarketCardProps> = ({ telemetry }) => {
  const {
    symbol,
    livePrice,
    change24h,
    change24hAmount,
    tickAgeSeconds,
    priceDirection,
    isLiveStreaming
  } = telemetry;

  // Flash animation state on tick
  const [flashColor, setFlashColor] = useState<'none' | 'green' | 'red'>('none');

  useEffect(() => {
    if (priceDirection === 'up') {
      setFlashColor('green');
      const timer = setTimeout(() => setFlashColor('none'), 400);
      return () => clearTimeout(timer);
    } else if (priceDirection === 'down') {
      setFlashColor('red');
      const timer = setTimeout(() => setFlashColor('none'), 400);
      return () => clearTimeout(timer);
    }
  }, [livePrice, priceDirection]);

  const formattedTickAge = tickAgeSeconds <= 1 ? '1 sec ago' : `${tickAgeSeconds} sec ago`;
  const isPositive = change24h >= 0;

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-[#0c0f1d] via-[#090b14] to-[#060810] border border-amber-500/30 p-4 sm:p-5 shadow-xl backdrop-blur-xl space-y-3">
      {/* Top Meta Bar: Symbol & Live Status */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-black font-mono text-white tracking-wider">
            {symbol}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Gold
          </span>
        </div>

        {/* Status: LIVE & Last Update */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[11px] font-mono">
            <span className="text-zinc-400 font-bold">Status:</span>
            <span className="flex items-center gap-1 font-black text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[11px] font-mono text-zinc-400">
            <Clock className="w-3 h-3 text-zinc-500" />
            <span>{formattedTickAge}</span>
          </div>
        </div>
      </div>

      {/* Main Live Price Display */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pt-1">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
            LIVE PRICE
          </div>
          <div 
            className={`text-3xl sm:text-4xl md:text-5xl font-black font-mono tracking-tight transition-all duration-200 ${
              flashColor === 'green' 
                ? 'text-emerald-300 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]' 
                : flashColor === 'red'
                  ? 'text-rose-300 drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                  : 'text-white'
            }`}
          >
            ${livePrice > 0 ? livePrice.toFixed(2) : '----.--'}
          </div>
        </div>

        {/* Change Badge */}
        <div className="self-start sm:self-auto flex items-center gap-2">
          <div className="text-[10px] font-mono text-zinc-400 font-bold sm:hidden">Change:</div>
          <div 
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-black flex items-center gap-1 border ${
              isPositive 
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40' 
                : 'bg-rose-500/15 text-rose-400 border-rose-500/40'
            }`}
          >
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>Change: {isPositive ? '+' : ''}{change24h.toFixed(2)}%</span>
            <span className="text-[11px] opacity-80 hidden sm:inline">
              ({isPositive ? '+' : ''}${change24hAmount.toFixed(2)})
            </span>
          </div>
        </div>
      </div>

      {/* Mobile-only Last Update */}
      <div className="sm:hidden flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-900">
        <span>Last Update:</span>
        <span className="text-zinc-300 font-semibold">{formattedTickAge}</span>
      </div>
    </div>
  );
};
