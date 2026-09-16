import React from 'react';
import { 
  Layers, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';

export const SmcAnalysisCard: React.FC = () => {
  const { selectedSignal, selectedMarket } = useMarket();
  const smc = selectedSignal.smc;

  return (
    <div className="w-full rounded-2xl bg-glass-card border border-amber-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-neutral-950 border border-amber-500/40 text-amber-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-syne">
              Smart Money Concepts (SMC)
            </h3>
            <span className="text-xs text-zinc-400 font-mono-num">
              Institutional Order Flow & Structural Levels
            </span>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs font-mono-num font-semibold">
          {smc.structure}
        </span>
      </div>

      {/* 4 Clean SMC Metric Blocks: Order Block, Liquidity Zone, BOS, CHOCH */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-num">
        {/* 1. Order Block */}
        <div className="p-4 rounded-xl bg-neutral-950/80 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              ORDER BLOCK (OB)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
              {smc.orderBlock.type}
            </span>
          </div>
          <div className="text-sm font-bold text-white">
            ${smc.orderBlock.low.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })} - ${smc.orderBlock.high.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })}
          </div>
          <p className="text-[11px] text-zinc-400 line-clamp-1">
            {smc.orderBlock.label}
          </p>
        </div>

        {/* 2. Liquidity Zone */}
        <div className="p-4 rounded-xl bg-neutral-950/80 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-sky-400" />
              LIQUIDITY ZONE
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold">
              Active Pool
            </span>
          </div>
          <div className="text-sm font-bold text-sky-300">
            ${smc.liquidityZone.price.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })}
          </div>
          <p className="text-[11px] text-zinc-400 line-clamp-1">
            {smc.liquidityZone.label}
          </p>
        </div>

        {/* 3. Break of Structure (BOS) */}
        <div className="p-4 rounded-xl bg-neutral-950/80 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              BREAK OF STRUCTURE (BOS)
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
              smc.bos.status === 'Confirmed'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}>
              {smc.bos.status}
            </span>
          </div>
          <div className="text-sm font-bold text-amber-300">
            ${smc.bos.level.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })}
          </div>
          <p className="text-[11px] text-zinc-400">
            {smc.bos.type} trend continuation pivot
          </p>
        </div>

        {/* 4. Change of Character (CHOCH) */}
        <div className="p-4 rounded-xl bg-neutral-950/80 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              CHANGE OF CHARACTER (CHOCH)
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
              smc.choch.status === 'Confirmed'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}>
              {smc.choch.status}
            </span>
          </div>
          <div className="text-sm font-bold text-emerald-300">
            ${smc.choch.level.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })}
          </div>
          <p className="text-[11px] text-zinc-400">
            {smc.choch.type} structural trend shift level
          </p>
        </div>
      </div>

      {/* Sweep & Execution Callout Footer */}
      {smc.liquiditySweep.occurred && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs font-mono-num">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-amber-300 font-bold block">
              ⚡ {smc.liquiditySweep.type} Executed
            </span>
            <span className="text-zinc-300 font-light">
              {smc.liquiditySweep.description}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
