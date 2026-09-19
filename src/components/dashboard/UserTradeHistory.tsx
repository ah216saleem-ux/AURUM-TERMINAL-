import React from 'react';
import { History, TrendingUp, TrendingDown, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { PaperTradeRecord } from '../../types';

interface UserTradeHistoryProps {
  trades: PaperTradeRecord[];
  limit?: number;
}

export const UserTradeHistory: React.FC<UserTradeHistoryProps> = ({
  trades,
  limit = 8
}) => {
  const completedTrades = trades
    .filter(t => t.result !== 'ACTIVE' && t.result !== 'CANCELLED')
    .slice(0, limit);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-zinc-400" />
          <h3 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-zinc-200 font-mono">
            Recent Trade History
          </h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          Last {completedTrades.length} Completed
        </span>
      </div>

      <div className="space-y-2">
        {completedTrades.map((trade) => {
          const isWin = trade.result === 'TP HIT' || trade.result === 'TP1 HIT' || trade.result === 'TP2 HIT';
          const isBuy = trade.direction === 'BUY';
          const pnlR = trade.pnlR !== undefined ? trade.pnlR : (isWin ? 2.4 : -1.0);

          return (
            <div
              key={trade.id}
              className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700/80 transition flex items-center justify-between text-xs"
            >
              {/* Asset & Direction */}
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${
                  isBuy ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                }`}>
                  {isBuy ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-white text-sm">
                      {trade.asset}
                    </span>
                    <span className="text-[10px] text-zinc-400 uppercase font-mono">
                      {trade.direction}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {trade.timestamp}
                  </span>
                </div>
              </div>

              {/* Price details & Result */}
              <div className="text-right flex items-center gap-3">
                <div className="hidden sm:block text-zinc-400 font-mono text-[11px]">
                  <span>Entry {trade.entry}</span>
                  {trade.closePrice && (
                    <span className="text-zinc-500"> → Exit {trade.closePrice}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    isWin ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {trade.result}
                  </span>

                  <span className={`font-mono font-black text-xs px-2 py-0.5 rounded ${
                    isWin ? 'bg-emerald-500 text-black' : 'bg-rose-500/80 text-white'
                  }`}>
                    {pnlR > 0 ? `+${pnlR}R` : `${pnlR}R`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
