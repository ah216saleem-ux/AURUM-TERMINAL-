import React from 'react';
import { motion } from 'motion/react';
import { Zap, Clock, TrendingUp, Sliders, ShieldCheck, Sparkles, Target, Layers } from 'lucide-react';
import { TradingStyleMode } from '../types';
import { TRADING_STYLES } from '../data/tradingStyleData';
import { useMarket } from '../context/MarketContext';

export const TradingStyleSelector: React.FC = () => {
  const { tradingStyleMode, setTradingStyleMode } = useMarket();

  const currentConfig = TRADING_STYLES[tradingStyleMode];

  return (
    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#121524] via-[#0d0f19] to-[#070911] border border-amber-500/35 shadow-xl space-y-3 font-mono-num">
      {/* HEADER & CURRENT MODE BADGE */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-syne">
              TRADING STYLE MODE
            </h3>
            <span className="text-[10px] text-zinc-400 font-sans block">
              AI adjusts strategy weights & SL/TP bounds
            </span>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10.5px] font-extrabold uppercase tracking-wide flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          {tradingStyleMode}
        </span>
      </div>

      {/* 3 MODE SELECTOR BUTTONS */}
      <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
        {(['SCALPING', 'INTRADAY', 'SWING'] as TradingStyleMode[]).map((mode) => {
          const isActive = tradingStyleMode === mode;
          const config = TRADING_STYLES[mode];

          return (
            <button
              key={mode}
              onClick={() => setTradingStyleMode(mode)}
              className={`py-2.5 px-2 rounded-xl transition cursor-pointer text-center relative flex flex-col items-center justify-center border ${
                isActive
                  ? 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38728] text-black border-amber-300 shadow-md shadow-amber-500/30 font-black'
                  : 'bg-neutral-950 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center gap-1 uppercase tracking-wide text-xs">
                {mode === 'SCALPING' && <Zap className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-amber-400'}`} />}
                {mode === 'INTRADAY' && <Clock className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-emerald-400'}`} />}
                {mode === 'SWING' && <TrendingUp className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-blue-400'}`} />}
                <span>{mode}</span>
              </div>
              <span className={`text-[9.5px] mt-0.5 font-normal ${isActive ? 'text-black/80 font-semibold' : 'text-zinc-500'}`}>
                {mode === 'SCALPING' ? '1M-15M' : mode === 'INTRADAY' ? '15M-4H' : '4H-1W'}
              </span>
            </button>
          );
        })}
      </div>

      {/* ACTIVE MODE FOCUS HIGHLIGHTS */}
      <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800/80 space-y-1.5">
        <div className="flex items-center justify-between text-[10.5px]">
          <span className="text-zinc-400 font-bold uppercase tracking-wide flex items-center gap-1 font-sans">
            <Target className="w-3 h-3 text-amber-400" />
            Active Mode Focus Areas:
          </span>
          <span className="text-amber-300 font-mono-num font-bold text-[10px]">
            {currentConfig.badge}
          </span>
        </div>

        <div className="flex flex-wrap gap-1 text-[10px]">
          {currentConfig.focus.map((item, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-zinc-200 font-sans flex items-center gap-1"
            >
              <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
