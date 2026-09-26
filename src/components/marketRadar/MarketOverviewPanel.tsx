import React from 'react';
import { MarketOverviewState } from './types';
import { Scale } from 'lucide-react';

interface MarketOverviewPanelProps {
  overview: MarketOverviewState;
}

export const MarketOverviewPanel: React.FC<MarketOverviewPanelProps> = ({ overview }) => {
  const { marketBias } = overview;

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-[#0c0f1d] via-[#090b14] to-[#060810] border border-amber-500/30 p-4 sm:p-5 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-widest">
            Market Condition
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-amber-300 pt-0.5">
            {marketBias || 'Neutral'}
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs font-mono font-bold text-zinc-300">
          <Scale className="w-3.5 h-3.5 text-amber-400" />
          <span>Equilibrium</span>
        </div>
      </div>
    </div>
  );
};

