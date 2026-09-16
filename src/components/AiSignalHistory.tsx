import React, { useState, useMemo } from 'react';
import { 
  History, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Sparkles, 
  Trophy, 
  Percent, 
  Zap, 
  Clock, 
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Download
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { SignalHistoryItem } from '../types';

export const AiSignalHistory: React.FC = () => {
  const { signalHistory, historyStats, setSelectedSignalId, signals } = useMarket();

  const [filterResult, setFilterResult] = useState<'ALL' | 'TP_HIT' | 'SL_HIT'>('ALL');
  const [filterAsset, setFilterAsset] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredHistory = useMemo(() => {
    return signalHistory.filter((item) => {
      if (filterResult === 'TP_HIT' && item.result !== 'TP HIT') return false;
      if (filterResult === 'SL_HIT' && item.result !== 'SL HIT') return false;
      if (filterAsset !== 'ALL' && item.symbol !== filterAsset) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          item.symbol.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.reason.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [signalHistory, filterResult, filterAsset, searchQuery]);

  const uniqueAssets = useMemo(() => {
    return Array.from(new Set(signalHistory.map(h => h.symbol)));
  }, [signalHistory]);

  const handleSelectAssetSignal = (marketId: string) => {
    const matchingSignal = signals.find(s => s.marketId === marketId);
    if (matchingSignal) {
      setSelectedSignalId(matchingSignal.id);
      const element = document.getElementById('ai-signals-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="ai-history-section" className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-neutral-950 border border-amber-500/40 text-amber-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-syne">
                AI Signal History & Track Record
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono-num font-bold">
                VERIFIED AI TRADES
              </span>
            </div>
            <span className="text-xs text-zinc-400 font-mono-num">
              Historical closed trade execution telemetry & institutional performance audit
            </span>
          </div>
        </div>

        {/* Quick Win Rate Badge */}
        <div className="flex items-center gap-2 text-xs font-mono-num">
          <span className="text-zinc-500">Live Win Rate:</span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
            {historyStats.winRate}% (Won {historyStats.wonTrades}/{historyStats.totalTrades})
          </span>
        </div>
      </div>

      {/* 4 Performance Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Stat 1: Win Rate */}
        <div className="p-4 rounded-2xl bg-glass-card border border-zinc-800/90 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-num text-zinc-400 font-bold uppercase">Win Rate</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
              <Trophy className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono-num text-emerald-400">
              {historyStats.winRate}%
            </span>
            <span className="text-xs text-zinc-500 font-mono-num">
              {historyStats.wonTrades}W - {historyStats.lostTrades}L
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400"
              style={{ width: `${historyStats.winRate}%` }}
            />
          </div>
        </div>

        {/* Stat 2: Total Return in R */}
        <div className="p-4 rounded-2xl bg-glass-card border border-zinc-800/90 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-num text-zinc-400 font-bold uppercase">Total Return (R)</span>
            <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono-num text-amber-300">
              {historyStats.totalPnlR}
            </span>
            <span className="text-xs text-emerald-400 font-mono-num">
              +{historyStats.netPips} Pips
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono-num">
            Cumulative Risk-Adjusted Alpha
          </span>
        </div>

        {/* Stat 3: Profit Factor */}
        <div className="p-4 rounded-2xl bg-glass-card border border-zinc-800/90 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-num text-zinc-400 font-bold uppercase">Profit Factor</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono-num text-white">
              {historyStats.profitFactor}
            </span>
            <span className="text-xs text-zinc-500 font-mono-num">
              Gross Win/Loss
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono-num">
            Institutional Benchmark &gt; 2.5
          </span>
        </div>

        {/* Stat 4: Avg Risk to Reward */}
        <div className="p-4 rounded-2xl bg-glass-card border border-zinc-800/90 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-num text-zinc-400 font-bold uppercase">Avg Risk:Reward</span>
            <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono-num text-emerald-400">
              {historyStats.avgRiskReward}
            </span>
            <span className="text-xs text-zinc-500 font-mono-num">
              Per Execution
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono-num">
            Positive Expectancy System
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-neutral-950/90 border border-zinc-800 text-xs font-mono-num">
        {/* Result Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterResult('ALL')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
              filterResult === 'ALL'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            All Signals ({signalHistory.length})
          </button>
          <button
            onClick={() => setFilterResult('TP_HIT')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filterResult === 'TP_HIT'
                ? 'bg-emerald-500 text-black shadow-md font-bold'
                : 'bg-zinc-900 text-emerald-400 hover:bg-zinc-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>TP Hit ({signalHistory.filter(h => h.result === 'TP HIT').length})</span>
          </button>
          <button
            onClick={() => setFilterResult('SL_HIT')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filterResult === 'SL_HIT'
                ? 'bg-rose-500 text-white shadow-md font-bold'
                : 'bg-zinc-900 text-rose-400 hover:bg-zinc-800'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>SL Hit ({signalHistory.filter(h => h.result === 'SL HIT').length})</span>
          </button>
        </div>

        {/* Asset Filter & Search */}
        <div className="flex items-center gap-2">
          <select
            value={filterAsset}
            onChange={(e) => setFilterAsset(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-mono-num focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Assets</option>
            {uniqueAssets.map(asset => (
              <option key={asset} value={asset}>{asset}</option>
            ))}
          </select>

          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-mono-num focus:outline-none focus:border-amber-500 placeholder:text-zinc-600"
            />
          </div>
        </div>
      </div>

      {/* History Records: Responsive Table on Desktop, Cards on Mobile */}
      <div className="space-y-3">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-zinc-800/90 bg-neutral-950/60 shadow-xl">
          <table className="w-full text-left text-xs font-mono-num">
            <thead className="bg-neutral-900/80 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Asset</th>
                <th className="py-3.5 px-4">Direction</th>
                <th className="py-3.5 px-4">Entry / TF</th>
                <th className="py-3.5 px-4">Exit (SL / TP)</th>
                <th className="py-3.5 px-4">Result</th>
                <th className="py-3.5 px-4">Return (R / %)</th>
                <th className="py-3.5 px-4">Closed</th>
                <th className="py-3.5 px-4">Execution Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredHistory.map((item) => {
                const isWin = item.result === 'TP HIT';
                const isLong = item.direction === 'LONG';

                return (
                  <tr 
                    key={item.id}
                    onClick={() => handleSelectAssetSignal(item.marketId)}
                    className="hover:bg-zinc-900/50 transition cursor-pointer group"
                  >
                    {/* Asset */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white group-hover:text-amber-300 transition">
                          {item.symbol}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {item.name}
                        </span>
                      </div>
                    </td>

                    {/* Direction */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 border ${
                        isLong 
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      }`}>
                        {isLong ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-rose-400" />}
                        <span>{item.type} ({item.direction})</span>
                      </span>
                    </td>

                    {/* Entry & Timeframe */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-amber-300">
                        ${item.entryPrice.toLocaleString(undefined, { minimumFractionDigits: item.decimals })}
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        {item.timeframe} • Score: {item.setupScore}%
                      </span>
                    </td>

                    {/* Exit */}
                    <td className="py-3.5 px-4">
                      <div className="text-zinc-200">
                        ${item.exitPrice.toLocaleString(undefined, { minimumFractionDigits: item.decimals })}
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        SL: ${item.stopLoss.toLocaleString()} | TP: ${item.takeProfit.toLocaleString()}
                      </span>
                    </td>

                    {/* Result */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1 border ${
                        isWin
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/20'
                      }`}>
                        {isWin ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                        <span>{item.result}</span>
                      </span>
                    </td>

                    {/* Return */}
                    <td className="py-3.5 px-4">
                      <div className={`font-bold ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.pnlR}
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        {item.pnlPercent > 0 ? `+${item.pnlPercent.toFixed(2)}%` : `${item.pnlPercent.toFixed(2)}%`}
                      </span>
                    </td>

                    {/* Closed At & Duration */}
                    <td className="py-3.5 px-4 text-zinc-400">
                      <div>{item.closedAt}</div>
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {item.duration}
                      </span>
                    </td>

                    {/* SMC Reason */}
                    <td className="py-3.5 px-4 text-zinc-300 text-[11px] max-w-xs truncate" title={item.reason}>
                      {item.reason}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden space-y-3">
          {filteredHistory.map((item) => {
            const isWin = item.result === 'TP HIT';
            const isLong = item.direction === 'LONG';

            return (
              <div
                key={item.id}
                onClick={() => handleSelectAssetSignal(item.marketId)}
                className="p-4 rounded-2xl bg-glass-card border border-zinc-800/90 space-y-3 cursor-pointer hover:border-amber-500/40 transition"
              >
                {/* Top Row: Symbol, Direction, Result Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-sm font-syne flex items-center gap-2">
                      {item.symbol}
                      <span className="text-xs text-zinc-400 font-mono-num font-normal">
                        ({item.name})
                      </span>
                    </h4>
                    <span className="text-[11px] text-zinc-500 font-mono-num">
                      {item.timeframe} Timeframe • Closed {item.closedAt}
                    </span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full font-bold text-xs inline-flex items-center gap-1 border font-mono-num ${
                    isWin
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}>
                    {isWin ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-rose-400" />}
                    <span>{item.result}</span>
                  </span>
                </div>

                {/* Numbers Grid: Entry, Exit, PnL Return */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-neutral-950/80 border border-zinc-800 text-xs font-mono-num">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Entry</span>
                    <span className="font-bold text-amber-300">
                      ${item.entryPrice.toLocaleString(undefined, { minimumFractionDigits: item.decimals })}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Exit</span>
                    <span className="font-bold text-white">
                      ${item.exitPrice.toLocaleString(undefined, { minimumFractionDigits: item.decimals })}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Return</span>
                    <span className={`font-bold ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.pnlR} ({item.pnlPercent > 0 ? `+${item.pnlPercent.toFixed(1)}%` : `${item.pnlPercent.toFixed(1)}%`})
                    </span>
                  </div>
                </div>

                {/* SMC Reason */}
                <p className="text-xs text-zinc-300 font-light line-clamp-2">
                  {item.reason}
                </p>
              </div>
            );
          })}
        </div>

        {/* Empty state if search finds nothing */}
        {filteredHistory.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-neutral-950/60 border border-zinc-800 text-zinc-400 text-xs font-mono-num">
            No signals match the current filter or search criteria.
          </div>
        )}
      </div>
    </section>
  );
};
