import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  ShieldCheck, 
  Activity, 
  Zap, 
  Copy, 
  Check, 
  TrendingUp 
} from 'lucide-react';
import { MarketItem, AiTradeSignal } from '../../types';
import { getPaperTradeRecords, computePaperTradeAnalytics } from '../../data/paperTradingTracker';
import { signalGovernanceService } from '../../services/signalGovernanceService';
import { GovernedSignalCard } from '../GovernedSignalCard';
import { SimplePerformanceSummary } from './SimplePerformanceSummary';
import { ActiveTradeMonitor } from './ActiveTradeMonitor';
import { MarketOverviewPanel } from './MarketOverviewPanel';
import { UserTradeHistory } from './UserTradeHistory';

interface UserDashboardProps {
  markets: MarketItem[];
  signals: AiTradeSignal[];
  onSelectMarket?: (market: MarketItem) => void;
  onSendTelegram?: (signalId: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  markets,
  signals,
  onSelectMarket,
  onSendTelegram
}) => {
  const [signalFilter, setSignalFilter] = useState<'APPROVED' | 'WAIT' | 'BLOCKED'>('APPROVED');
  const [paperTrades, setPaperTrades] = useState(() => getPaperTradeRecords());

  // Listen to live paper trade sync updates
  useEffect(() => {
    const handleUpdate = () => {
      setPaperTrades(getPaperTradeRecords());
    };

    window.addEventListener('paper-trades-updated', handleUpdate);
    return () => {
      window.removeEventListener('paper-trades-updated', handleUpdate);
    };
  }, []);

  // Also refresh when markets update
  useEffect(() => {
    setPaperTrades(getPaperTradeRecords());
  }, [markets]);

  const analytics = useMemo(() => {
    return computePaperTradeAnalytics(paperTrades);
  }, [paperTrades]);

  // Evaluate institutional signal governance
  const governanceResults = useMemo(() => {
    return signalGovernanceService.governAllSignals(signals, markets, paperTrades);
  }, [signals, markets, paperTrades]);

  const { governedSignals, stats } = governanceResults;

  // Filter signals strictly based on selected tab
  const displayedSignals = useMemo(() => {
    return governedSignals.filter(s => s.status === signalFilter);
  }, [governedSignals, signalFilter]);

  return (
    <div className="space-y-5">
      {/* 1. Approved Signals Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-zinc-200 font-mono">
                Approved Signals
              </h3>
            </div>
            <span className="text-[11px] text-zinc-400">
              Only high-probability trade setups passing all 7 institutional governance gates
            </span>
          </div>

          {/* Filter Pills: Approved, Wait, Blocked */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800 self-start sm:self-auto text-xs font-mono font-bold">
            <button
              onClick={() => setSignalFilter('APPROVED')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                signalFilter === 'APPROVED'
                  ? 'bg-emerald-500 text-black shadow-sm font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>APPROVED ({stats.approvedCount})</span>
            </button>

            <button
              onClick={() => setSignalFilter('WAIT')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                signalFilter === 'WAIT'
                  ? 'bg-amber-500 text-black shadow-sm font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>WAIT ({stats.waitCount})</span>
            </button>

            <button
              onClick={() => setSignalFilter('BLOCKED')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                signalFilter === 'BLOCKED'
                  ? 'bg-rose-500 text-white shadow-sm font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>BLOCKED ({stats.blockedCount})</span>
            </button>
          </div>
        </div>

        {/* Signals List */}
        {displayedSignals.length === 0 ? (
          <div className="p-8 rounded-2xl bg-zinc-950/70 border border-zinc-800 text-center text-zinc-400 text-xs space-y-1">
            <ShieldCheck className="w-6 h-6 text-zinc-500 mx-auto mb-1" />
            <div className="font-bold text-zinc-300">No signals in this status category.</div>
            <div>Switch to Approved to view actionable trade executions.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedSignals.map((signal) => (
              <GovernedSignalCard
                key={signal.id}
                signal={signal}
                isAdmin={false} // Keeps internal technical calculations hidden for clean user experience
                onSendTelegram={onSendTelegram}
                onOpenAssetDetail={(assetId) => {
                  const m = markets.find(item => item.id === assetId || item.symbol.toLowerCase() === assetId.toLowerCase());
                  if (m && onSelectMarket) onSelectMarket(m);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. Current Market Status / Market Overview Panel */}
      <MarketOverviewPanel
        markets={markets}
        onSelectMarket={onSelectMarket}
      />

      {/* 3. Active Trade Monitor with TP/SL Progress */}
      <ActiveTradeMonitor
        paperTrades={paperTrades}
        markets={markets}
        onSelectAsset={(assetSymbol) => {
          const m = markets.find(item => item.symbol.toUpperCase() === assetSymbol.toUpperCase());
          if (m && onSelectMarket) onSelectMarket(m);
        }}
      />

      {/* 4. Trade History */}
      <UserTradeHistory
        trades={paperTrades}
        limit={5}
      />

      {/* 5. Simple Performance Summary */}
      <SimplePerformanceSummary analytics={analytics} />
    </div>
  );
};
