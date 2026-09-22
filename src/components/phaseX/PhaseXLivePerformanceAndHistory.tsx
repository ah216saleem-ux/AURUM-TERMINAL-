import React, { useState, useEffect } from 'react';
import { PhaseXLiveSignalRecord, PhaseXPerformanceMetrics } from './PhaseXTypes';
import { 
  TrendingUp, 
  CheckCircle2, 
  ShieldAlert, 
  Target, 
  Zap, 
  RefreshCw, 
  Activity, 
  Award,
  AlertTriangle,
  Info
} from 'lucide-react';

export const PhaseXLivePerformanceAndHistory: React.FC = () => {
  const [history, setHistory] = useState<PhaseXLiveSignalRecord[]>([]);
  const [performance, setPerformance] = useState<PhaseXPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<number>(Date.now());

  const fetchLiveHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/phase-x/live-history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
        setPerformance(data.performance || null);
        setLastRefreshed(Date.now());
      }
    } catch (err) {
      console.error('[PhaseXLiveHistory] Error fetching live history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveHistory();
    const interval = setInterval(fetchLiveHistory, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  const formatUtcTime = (ts: number) => {
    const d = new Date(ts);
    return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Performance Metrics Header */}
      <div className="rounded-2xl border border-zinc-800 bg-[#07090e] p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white tracking-wide flex items-center gap-2">
                <span>PHASE X — XAU/USD LIVE PERFORMANCE MONITOR</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  REAL SIGNALS ONLY
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Persistent history & real-time telemetry calculated strictly from completed live trades.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[10px] text-zinc-500 hidden sm:inline">
              Refreshed: {new Date(lastRefreshed).toLocaleTimeString()}
            </span>
            <button
              onClick={fetchLiveHistory}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1.5 transition border border-zinc-700/60 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 10 Performance Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
          {/* 1. Total Approved Signals */}
          <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-1">
            <div className="text-[10.5px] text-zinc-400 flex items-center justify-between">
              <span>Total Approved</span>
              <Activity className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg font-black text-white">
              {performance?.totalApprovedSignals || 0}
            </div>
            <div className="text-[9.5px] text-zinc-500">Phase 5 Passed</div>
          </div>

          {/* 2. Completed Trades */}
          <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-1">
            <div className="text-[10.5px] text-zinc-400 flex items-center justify-between">
              <span>Completed Trades</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-lg font-black text-white">
              {performance?.completedTrades || 0}
            </div>
            <div className="text-[9.5px] text-zinc-500">Closed outcomes</div>
          </div>

          {/* 3. TP1 Hits */}
          <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-1">
            <div className="text-[10.5px] text-zinc-400 flex items-center justify-between">
              <span>TP1 Hits</span>
              <Target className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-black text-emerald-400">
              {performance?.tp1Hits || 0}
            </div>
            <div className="text-[9.5px] text-zinc-500">2R+ Target Achieved</div>
          </div>

          {/* 4. TP2 Hits */}
          <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-1">
            <div className="text-[10.5px] text-zinc-400 flex items-center justify-between">
              <span>TP2 Hits</span>
              <Award className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-black text-emerald-400">
              {performance?.tp2Hits || 0}
            </div>
            <div className="text-[9.5px] text-zinc-500">3R+ Full Target Achieved</div>
          </div>

          {/* 5. Stop-Loss Hits */}
          <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-1">
            <div className="text-[10.5px] text-zinc-400 flex items-center justify-between">
              <span>Stop-Loss Hits</span>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-lg font-black text-rose-400">
              {performance?.stopLossHits || 0}
            </div>
            <div className="text-[9.5px] text-zinc-500">Protected risk limit</div>
          </div>

          {/* 6. Win Rate */}
          <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-1">
            <div className="text-[10.5px] text-zinc-400 flex items-center justify-between">
              <span>Win Rate</span>
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-sm font-black">
              {performance?.isSampleSufficient && performance.winRate !== null ? (
                <span className="text-lg text-emerald-400">{performance.winRate}%</span>
              ) : (
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  INSUFFICIENT LIVE SAMPLE
                </span>
              )}
            </div>
            <div className="text-[9.5px] text-zinc-500">Min 3 completed trades</div>
          </div>

          {/* 7. Average R */}
          <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-1">
            <div className="text-[10.5px] text-zinc-400 flex items-center justify-between">
              <span>Average R</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-sm font-black">
              {performance?.isSampleSufficient && performance.averageR !== null ? (
                <span className={`text-lg ${(performance.averageR || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {performance.averageR > 0 ? `+${performance.averageR}R` : `${performance.averageR}R`}
                </span>
              ) : (
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  INSUFFICIENT LIVE SAMPLE
                </span>
              )}
            </div>
            <div className="text-[9.5px] text-zinc-500">Per completed trade</div>
          </div>

          {/* 8. Total R Realized */}
          <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-1">
            <div className="text-[10.5px] text-zinc-400 flex items-center justify-between">
              <span>Total Realized R</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className={`text-lg font-black ${(performance?.totalR || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {(performance?.totalR || 0) > 0 ? `+${performance?.totalR}R` : `${performance?.totalR || 0}R`}
            </div>
            <div className="text-[9.5px] text-zinc-500">Sum of locked R</div>
          </div>

          {/* 9. Average Confidence */}
          <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-1">
            <div className="text-[10.5px] text-zinc-400 flex items-center justify-between">
              <span>Avg Confidence</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-lg font-black text-white">
              {performance?.averageConfidence || 0}%
            </div>
            <div className="text-[9.5px] text-zinc-500">Approved setups</div>
          </div>

          {/* 10. Signals Per Day */}
          <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-1">
            <div className="text-[10.5px] text-zinc-400 flex items-center justify-between">
              <span>Signals / Day</span>
              <Activity className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg font-black text-amber-400">
              {performance?.signalsPerDay || 0}
            </div>
            <div className="text-[9.5px] text-zinc-500">24-hour rate</div>
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-300/90 text-[10.5px] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Performance & Compliance Notice: </span>
            Statistics represent strictly recorded live production results. Past performance does not guarantee future results. No simulated or fabricated trades are permitted in live history.
          </div>
        </div>
      </div>

      {/* Persistent Signal History Table */}
      <div className="rounded-2xl border border-zinc-800 bg-[#07090e] p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs sm:text-sm font-black text-white tracking-wide">
              XAU/USD LIVE SIGNAL HISTORY
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {history.length} Records Saved
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 hidden sm:inline">
            Persisted on server storage
          </span>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 space-y-2">
            <AlertTriangle className="w-6 h-6 mx-auto text-zinc-600" />
            <div className="text-xs font-bold text-zinc-400">No Live Signals Recorded Yet</div>
            <div className="text-[11px] text-zinc-600 max-w-md mx-auto">
              Signals will appear here automatically when Phase 5 evaluates and approves an XAU/USD trade setup.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-zinc-800 text-[10.5px] text-zinc-400 bg-zinc-900/50 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date / Time (UTC)</th>
                  <th className="py-2.5 px-3">Direction</th>
                  <th className="py-2.5 px-3">Entry</th>
                  <th className="py-2.5 px-3">SL</th>
                  <th className="py-2.5 px-3">TP1</th>
                  <th className="py-2.5 px-3">TP2</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Final R</th>
                  <th className="py-2.5 px-3">Setup ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                {history.map((record) => {
                  const isBuy = record.direction === 'BUY';
                  return (
                    <tr key={record.setupId} className="hover:bg-zinc-900/40 transition">
                      <td className="py-2.5 px-3 text-zinc-400 whitespace-nowrap">
                        {formatUtcTime(record.signalTimestamp)}
                      </td>
                      <td className="py-2.5 px-3 font-bold whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          isBuy 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {isBuy ? '🟢 BUY' : '🔴 SELL'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-white font-bold whitespace-nowrap">
                        ${record.preferredEntry.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-rose-400 whitespace-nowrap">
                        ${record.stopLoss.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-400 whitespace-nowrap">
                        ${record.takeProfit1.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-300 font-bold whitespace-nowrap">
                        ${record.takeProfit2.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-cyan-300 font-bold whitespace-nowrap">
                        {Math.round(record.tradeConfidence)}%
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold uppercase ${
                          record.tp2Reached || record.phase4FinalStatus === 'TP2_HIT'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : record.slReached || record.phase4FinalStatus === 'STOP_LOSS_HIT'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : record.tp1Reached || record.phase4FinalStatus === 'TP1_HIT'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        }`}>
                          {record.displayStatusLabel || record.phase4FinalStatus || 'READY'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-black whitespace-nowrap">
                        {record.finalR !== null ? (
                          <span className={record.finalR > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {record.finalR > 0 ? `+${record.finalR}R` : `${record.finalR}R`}
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-400 text-[10px] whitespace-nowrap">
                        {record.setupId}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
