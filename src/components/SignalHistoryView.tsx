import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ShieldCheck,
  Zap,
  Percent,
  BarChart3,
  History
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { SignalHistoryItem } from '../types';
import { PaperTradingDashboardView } from './PaperTradingDashboardView';

export const SignalHistoryView: React.FC = () => {
  const { signalHistory, historyStats } = useMarket();
  const [activeSubTab, setActiveSubTab] = useState<'PAPER_TRADING' | 'VERIFIED_SIGNALS'>('PAPER_TRADING');
  const [filterResult, setFilterResult] = useState<'ALL' | 'TP_HIT' | 'SL_HIT'>('ALL');

  const filteredSignals = useMemo(() => {
    return signalHistory.filter((item) => {
      if (filterResult === 'TP_HIT') return item.result === 'TP HIT';
      if (filterResult === 'SL_HIT') return item.result === 'SL HIT';
      return true;
    });
  }, [signalHistory, filterResult]);

  const tpCount = signalHistory.filter((s) => s.result === 'TP HIT').length;
  const slCount = signalHistory.filter((s) => s.result === 'SL HIT').length;

  return (
    <div className="space-y-3.5">
      {/* Sub-tab Navigation */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-neutral-950 border border-zinc-800 text-xs font-mono-num font-bold">
        <button
          onClick={() => setActiveSubTab('PAPER_TRADING')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer text-center ${
            activeSubTab === 'PAPER_TRADING'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Paper Trading Dashboard</span>
        </button>

        <button
          onClick={() => setActiveSubTab('VERIFIED_SIGNALS')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer text-center ${
            activeSubTab === 'VERIFIED_SIGNALS'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Verified Signals Track Record</span>
        </button>
      </div>

      {activeSubTab === 'PAPER_TRADING' ? (
        <PaperTradingDashboardView />
      ) : (
        <>
          {/* Accuracy & Track Record Overview Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121522] via-[#0d0f18] to-[#08090d] border border-amber-500/30 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono-num text-zinc-400 uppercase tracking-wider block">
                Verified Performance
              </span>
              <h3 className="text-sm font-bold text-white font-syne">
                AURUM AI Track Record
              </h3>
            </div>
          </div>

          {/* Accuracy % Callout */}
          <div className="text-right">
            <span className="text-[10px] font-mono-num text-zinc-400 uppercase block">
              Accuracy
            </span>
            <span className="text-xl font-bold font-mono-num text-emerald-400 tracking-tight">
              {historyStats.winRate}%
            </span>
          </div>
        </div>

        {/* 4 Stats Pills */}
        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-zinc-800/80 font-mono-num text-[11px] text-center">
          <div className="p-2 rounded-xl bg-neutral-950/70 border border-zinc-800/80">
            <span className="text-[10px] text-zinc-500 block">Total</span>
            <span className="font-bold text-zinc-200">{historyStats.totalTrades} Signals</span>
          </div>
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
            <span className="text-[10px] text-emerald-400 block">TP Hit</span>
            <span className="font-bold text-emerald-300">{tpCount}</span>
          </div>
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/25">
            <span className="text-[10px] text-rose-400 block">SL Hit</span>
            <span className="font-bold text-rose-300">{slCount}</span>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25">
            <span className="text-[10px] text-amber-300 block">Net R</span>
            <span className="font-bold text-amber-400">{historyStats.totalPnlR}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-mono-num font-bold text-zinc-300 uppercase tracking-wider">
          Signal History ({filteredSignals.length})
        </span>

        <div className="flex gap-1 p-0.5 rounded-lg bg-neutral-950 border border-zinc-800 text-[11px] font-mono-num">
          <button
            onClick={() => setFilterResult('ALL')}
            className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
              filterResult === 'ALL'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterResult('TP_HIT')}
            className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
              filterResult === 'TP_HIT'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            TP Hit ({tpCount})
          </button>
          <button
            onClick={() => setFilterResult('SL_HIT')}
            className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
              filterResult === 'SL_HIT'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            SL Hit ({slCount})
          </button>
        </div>
      </div>

      {/* Historical Signal Cards */}
      <div className="space-y-2">
        {filteredSignals.map((item, idx) => {
          const isTpHit = item.result === 'TP HIT';
          const isBuy = item.type === 'BUY';

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.04 }}
              className="p-3.5 rounded-2xl bg-[#0b0d14] border border-zinc-800 hover:border-zinc-700 transition space-y-2.5 shadow-sm"
            >
              {/* Row 1: Asset, Signal, and Result Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white font-syne">
                    {item.symbol}
                  </span>
                  {/* BUY / SELL Badge */}
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono-num font-bold border ${
                    isBuy ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-[10px] font-mono-num text-zinc-500">
                    {item.timeframe}
                  </span>
                </div>

                {/* TP HIT / SL HIT Badge */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono-num font-bold border ${
                  isTpHit 
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/40'
                }`}>
                  {isTpHit ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>{item.result}</span>
                </div>
              </div>

              {/* Row 2: Entry, Exit, and Result (R / %) */}
              <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-neutral-950/70 border border-zinc-800/80 font-mono-num text-[11px]">
                <div>
                  <span className="text-[9.5px] text-zinc-500 uppercase block">Entry</span>
                  <span className="font-bold text-zinc-200 block">
                    ${item.entryPrice.toLocaleString(undefined, { minimumFractionDigits: item.decimals })}
                  </span>
                </div>

                <div>
                  <span className="text-[9.5px] text-zinc-500 uppercase block">Exit</span>
                  <span className="font-bold text-zinc-300 block">
                    ${item.exitPrice.toLocaleString(undefined, { minimumFractionDigits: item.decimals })}
                  </span>
                </div>

                <div>
                  <span className="text-[9.5px] text-zinc-500 uppercase block">Result</span>
                  <span className={`font-bold block ${isTpHit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.pnlR} ({item.pnlPercent >= 0 ? `+${item.pnlPercent}%` : `${item.pnlPercent}%`})
                  </span>
                </div>
              </div>

              {/* Row 3: Closed Time and Trade Validation Reason */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5">
                <span className="text-[10px] text-zinc-400 line-clamp-1 pr-2">
                  <span className="text-amber-400/90 font-semibold mr-1">Setup:</span>
                  {item.reason}
                </span>
                <span className="text-[10px] font-mono-num text-zinc-500 shrink-0">
                  {item.closedAt}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
        </>
      )}
    </div>
  );
};
