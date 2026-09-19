import React from 'react';
import { Activity, TrendingUp, TrendingDown, Target, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { PaperTradeRecord, MarketItem } from '../../types';

interface ActiveTradeMonitorProps {
  paperTrades: PaperTradeRecord[];
  markets: MarketItem[];
  onSelectAsset?: (assetSymbol: string) => void;
}

export const ActiveTradeMonitor: React.FC<ActiveTradeMonitorProps> = ({
  paperTrades,
  markets,
  onSelectAsset
}) => {
  // Find all active trades or recently executed in-progress positions
  const activeTrades = paperTrades.filter(t => t.result === 'ACTIVE');

  // Fallback: If no trades marked ACTIVE, take the most recent 2 non-cancelled trades for live monitoring demonstration
  const displayTrades = activeTrades.length > 0 
    ? activeTrades 
    : paperTrades.filter(t => t.result !== 'CANCELLED').slice(0, 2).map(t => ({
        ...t,
        result: 'ACTIVE' as const
      }));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-zinc-200 font-mono">
            Active Trade Monitor
          </h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-400">
          {displayTrades.length} Active Positions
        </span>
      </div>

      {displayTrades.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-zinc-950/70 border border-zinc-800/80 text-zinc-500 text-xs">
          <Clock className="w-6 h-6 mx-auto mb-2 text-zinc-600" />
          <span>No active positions currently running. Awaiting approved signal triggers.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {displayTrades.map((trade) => {
            // Find live market for live current price
            const matchedMarket = markets.find(m => 
              m.symbol.toUpperCase() === trade.asset.toUpperCase() ||
              trade.asset.toUpperCase().includes(m.symbol.toUpperCase()) ||
              m.id === trade.assetId
            );

            const isBuy = trade.direction === 'BUY';
            const entry = trade.entry;
            const currentPrice = matchedMarket ? matchedMarket.price : (trade.currentPrice || entry);
            const sl = trade.stopLoss;
            const tp1 = trade.tp1;
            const tp2 = trade.tp2;

            // Calculate current profit/loss in R
            const riskDistance = Math.abs(entry - sl);
            let profitLossR = 0;
            if (riskDistance > 0) {
              const move = isBuy ? (currentPrice - entry) : (entry - currentPrice);
              profitLossR = parseFloat((move / riskDistance).toFixed(2));
            }

            const isProfitable = profitLossR >= 0;
            const approxDollarPnl = Math.round(profitLossR * 250); // $250 standard 1R risk baseline

            // Compute TP/SL Progress percentage (0% = at SL, 50% = at Entry, 100% = at TP1)
            let progressPct = 50;
            if (isBuy) {
              const totalSpan = tp1 - sl;
              if (totalSpan > 0) {
                progressPct = Math.min(100, Math.max(0, ((currentPrice - sl) / totalSpan) * 100));
              }
            } else {
              const totalSpan = sl - tp1;
              if (totalSpan > 0) {
                progressPct = Math.min(100, Math.max(0, ((sl - currentPrice) / totalSpan) * 100));
              }
            }

            // Decimals formatting helper
            const dec = currentPrice > 500 ? 2 : currentPrice > 5 ? 3 : 5;

            return (
              <div
                key={trade.id}
                onClick={() => onSelectAsset && onSelectAsset(trade.asset)}
                className="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 transition-all duration-150 space-y-3.5 shadow-md cursor-pointer"
              >
                {/* Header: Asset & Direction + Status & Profit/Loss */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="text-base font-black text-white font-mono">
                      {trade.asset}
                    </div>
                    <div className={`px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1 border ${
                      isBuy
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    }`}>
                      {isBuy ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{trade.direction}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                      {trade.result === 'ACTIVE' ? 'ACTIVE' : trade.result}
                    </span>
                    <div className={`text-xs font-black font-mono px-2.5 py-1 rounded-lg ${
                      isProfitable ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
                    }`}>
                      {isProfitable ? `+${profitLossR.toFixed(2)}R` : `${profitLossR.toFixed(2)}R`}
                      <span className="opacity-80 text-[10px] ml-1">
                        ({isProfitable ? '+' : ''}${approxDollarPnl})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Level Strips: Entry, Current Price, SL, TP1, TP2 */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs bg-zinc-900/70 p-3 rounded-xl border border-zinc-800/80">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold">Entry</span>
                    <span className="font-mono font-bold text-zinc-200">{entry.toFixed(dec)}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Current Price
                    </span>
                    <span className="font-mono font-black text-amber-300">{currentPrice.toFixed(dec)}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-rose-400 block uppercase font-bold">Stop Loss</span>
                    <span className="font-mono font-bold text-rose-300">{sl.toFixed(dec)}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-emerald-400 block uppercase font-bold">TP1</span>
                    <span className="font-mono font-bold text-emerald-300">{tp1.toFixed(dec)}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-emerald-400 block uppercase font-bold">TP2</span>
                    <span className="font-mono font-bold text-emerald-300">{tp2.toFixed(dec)}</span>
                  </div>
                </div>

                {/* Distance to Targets Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] font-mono text-zinc-400">
                  <div className="flex items-center gap-3">
                    <span>
                      Dist to TP1: <strong className="text-emerald-400">{isBuy ? (tp1 - currentPrice > 0 ? '+' : '') : (currentPrice - tp1 > 0 ? '+' : '')}{(isBuy ? (tp1 - currentPrice) : (currentPrice - tp1)).toFixed(dec)}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Dist to SL: <strong className="text-rose-400">{isBuy ? (currentPrice - sl > 0 ? '+' : '') : (sl - currentPrice > 0 ? '+' : '')}{(isBuy ? (currentPrice - sl) : (sl - currentPrice)).toFixed(dec)}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">Filled: {trade.timestamp}</span>
                  </div>
                </div>

                {/* TP/SL Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span className="text-rose-400">SL ({sl.toFixed(dec)})</span>
                    <span className="text-zinc-400">Entry ({entry.toFixed(dec)})</span>
                    <span className="text-emerald-400">Target TP1 ({tp1.toFixed(dec)})</span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden relative">
                    {/* Midline marker for Entry */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-zinc-600 z-10" />

                    <div
                      className={`h-full transition-all duration-300 ${
                        isProfitable ? 'bg-gradient-to-r from-amber-400 to-emerald-400' : 'bg-rose-500'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span>Progress: {progressPct.toFixed(0)}% to TP1</span>
                    <span>Risk/Reward: {trade.riskReward}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
