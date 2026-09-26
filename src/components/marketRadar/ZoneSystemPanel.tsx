import React from 'react';
import { DynamicZonePlaceholder } from './types';
import { ArrowUpRight, ArrowDownRight, Activity, Gauge, Compass } from 'lucide-react';

interface ZoneSystemPanelProps {
  upperZone: DynamicZonePlaceholder;
  lowerZone: DynamicZonePlaceholder;
  livePrice?: number;
}

export const ZoneSystemPanel: React.FC<ZoneSystemPanelProps> = ({
  upperZone,
  lowerZone,
  livePrice = 4353.50
}) => {
  const currentPrice = livePrice > 0 ? livePrice : 4353.50;
  const upperPriceMin = +(currentPrice + 18.20).toFixed(2);
  const upperPriceMax = +(currentPrice + 38.50).toFixed(2);
  const lowerPriceMin = +(currentPrice - 32.80).toFixed(2);
  const lowerPriceMax = +(currentPrice - 12.40).toFixed(2);

  return (
    <div className="w-full space-y-3 font-mono">
      {/* 1. CURRENT ZONE STATUS */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0c0f1d] via-[#090b14] to-[#0c0f1d] border border-amber-500/30 shadow-xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[9.5px] text-zinc-400 font-bold uppercase tracking-widest">
              CURRENT ZONE
            </div>
            <div className="text-xs sm:text-sm font-black text-white">
              EQUILIBRIUM CHANNEL • SPOT ${currentPrice.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="px-2.5 py-1 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-300 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Market Equilibrium</span>
          </span>
        </div>
      </div>

      {/* 2. DYNAMIC MAGNET ZONES (UPPER & LOWER) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* UPPER MAGNET ZONE */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0c0f1d] via-[#090b14] to-[#060810] border border-cyan-500/30 shadow-xl backdrop-blur-xl space-y-3 relative overflow-hidden group hover:border-cyan-500/50 transition">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xs font-bold">
                ▲
              </div>
              <span className="text-xs font-black text-white tracking-wider">
                UPPER MAGNET ZONE
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              STRONG
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-0.5">
              <span className="text-[8.5px] text-zinc-400 font-bold uppercase">Price Range</span>
              <div className="text-xs font-black text-cyan-300">
                ${upperPriceMin} - ${upperPriceMax}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-0.5">
              <span className="text-[8.5px] text-zinc-400 font-bold uppercase">Distance</span>
              <div className="text-xs font-black text-zinc-200">
                +1.33R (+28.4 pts)
              </div>
            </div>

            <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-0.5">
              <span className="text-[8.5px] text-zinc-400 font-bold uppercase">Strength</span>
              <div className="text-xs font-black text-emerald-400">
                Strong (4ch)
              </div>
            </div>
          </div>
        </div>

        {/* LOWER MAGNET ZONE */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0c0f1d] via-[#090b14] to-[#060810] border border-rose-500/30 shadow-xl backdrop-blur-xl space-y-3 relative overflow-hidden group hover:border-rose-500/50 transition">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 text-xs font-bold">
                ▼
              </div>
              <span className="text-xs font-black text-white tracking-wider">
                LOWER MAGNET ZONE
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
              STRONG
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-0.5">
              <span className="text-[8.5px] text-zinc-400 font-bold uppercase">Price Range</span>
              <div className="text-xs font-black text-rose-300">
                ${lowerPriceMin} - ${lowerPriceMax}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-0.5">
              <span className="text-[8.5px] text-zinc-400 font-bold uppercase">Distance</span>
              <div className="text-xs font-black text-zinc-200">
                -0.74R (-15.8 pts)
              </div>
            </div>

            <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-0.5">
              <span className="text-[8.5px] text-zinc-400 font-bold uppercase">Strength</span>
              <div className="text-xs font-black text-rose-400">
                Strong (4ch)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. STRENGTH & ATTRACTION FORCE BAR */}
      <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-amber-400" />
          <span className="text-zinc-400 font-bold text-[11px] uppercase">
            MAGNETIC ATTRACTION STRENGTH:
          </span>
          <span className="text-amber-300 font-black text-[12px]">
            ELEVATED (84% Downward Gravitational Force)
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>Upper Magnet: High Imbalance</span>
          <span className="mx-1">•</span>
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          <span>Lower Magnet: Deep Liquidity</span>
        </div>
      </div>
    </div>
  );
};
