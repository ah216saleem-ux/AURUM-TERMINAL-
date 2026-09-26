import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  BarChart3, 
  Layers, 
  Lock, 
  Activity,
  History,
  Award,
  RefreshCw,
  Search
} from 'lucide-react';
import { QwenReviewRecord, QwenAnalyticsData } from '../types';
import { getQwenReviewLogs, computeQwenAnalytics } from '../data/qwenPerformanceTracker';

export const QwenPerformanceAnalyticsView: React.FC = () => {
  const [logs, setLogs] = useState<QwenReviewRecord[]>(getQwenReviewLogs());
  const [analytics, setAnalytics] = useState<QwenAnalyticsData>(computeQwenAnalytics(logs));
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AGREED' | 'DISAGREED' | 'WAIT_REJECT'>('ALL');

  const refreshData = () => {
    const currentLogs = getQwenReviewLogs();
    setLogs(currentLogs);
    setAnalytics(computeQwenAnalytics(currentLogs));
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener('qwen-performance-updated', handleUpdate);
    return () => {
      window.removeEventListener('qwen-performance-updated', handleUpdate);
    };
  }, []);

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.asset.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.tradeResult.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (l.marketCondition && l.marketCondition.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || l.agreementStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 font-sans">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c121e] via-[#090b14] to-[#05070d] border border-sky-500/35 shadow-xl space-y-3 font-mono-num relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-500/10 blur-2xl" />

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300">
              <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-syne tracking-wide uppercase">
                  Consensus Validator Performance & Accuracy Tracker
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-[9.5px] font-mono-num font-bold">
                  VALIDATION ENGINE: ACTIVE
                </span>
              </div>
              <span className="text-[10.5px] font-mono-num text-zinc-400">
                Independent Secondary Quantitative & Live Review Analytics
              </span>
            </div>
          </div>

          <button
            onClick={refreshData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
            <span>Refresh Analytics</span>
          </button>
        </div>

        {/* 4 Summary Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-neutral-950/80 border border-zinc-900 space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Total Reviews</span>
            <div className="text-xl font-black text-white">{analytics.totalReviews}</div>
            <span className="text-[9.5px] text-zinc-400">Evaluated Setups</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/80 border border-zinc-900 space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Agreement Rate</span>
            <div className="text-xl font-black text-sky-400">{analytics.agreementRate}%</div>
            <span className="text-[9.5px] text-zinc-400">{analytics.agreementCount} Agreed / {analytics.totalReviews} Total</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/80 border border-zinc-900 space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Confirmed Win Rate</span>
            <div className="text-xl font-black text-emerald-400">{analytics.accuracyWhenAgreed}%</div>
            <span className="text-[9.5px] text-zinc-400">{analytics.tpCountWhenAgreed} TP vs {analytics.slCountWhenAgreed} SL</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/80 border border-zinc-900 space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Disagreement Accuracy</span>
            <div className="text-xl font-black text-amber-400">{analytics.accuracyWhenDisagreed}%</div>
            <span className="text-[9.5px] text-zinc-400">Filtered Risky Trades</span>
          </div>
        </div>
      </div>

      {/* Two-Column Analytics Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Most Reliable Assets */}
        <div className="p-4 rounded-2xl bg-neutral-950/80 border border-zinc-900 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase font-mono-num">
                Most Reliable Assets for Consensus Confirmation
              </h4>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono-num">Sorted by Reliability</span>
          </div>

          <div className="space-y-2">
            {analytics.mostReliableAssets.map((asset, idx) => (
              <div 
                key={asset.assetId} 
                className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs font-mono-num"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center text-[10px] font-bold">
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-white block">{asset.symbol}</span>
                    <span className="text-[10px] text-zinc-400">{asset.totalReviews} Total Reviews</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-[9.5px] text-zinc-400 block">Agreement</span>
                    <span className="font-bold text-sky-400">{asset.agreementRate}%</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-zinc-400 block">Win Rate</span>
                    <span className="font-bold text-emerald-400">{asset.winRate}%</span>
                  </div>
                  <div className="pl-2 border-l border-zinc-800">
                    <span className="text-[9.5px] text-zinc-400 block">Score</span>
                    <span className="font-black text-amber-400 text-sm">{asset.reliabilityScore}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Market Conditions */}
        <div className="p-4 rounded-2xl bg-neutral-950/80 border border-zinc-900 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white uppercase font-mono-num">
                Best Market Conditions for Consensus Confirmation
              </h4>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono-num">Highest Win Rate Setup</span>
          </div>

          <div className="space-y-2">
            {analytics.bestMarketConditions.map((cond, idx) => (
              <div 
                key={idx} 
                className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2 font-mono-num"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-sans">{cond.conditionName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-bold">
                    {cond.qwenAccuracy}% Win Rate
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-900/80 pt-1.5">
                  <span>Evaluations: <strong className="text-white">{cond.totalEvaluations}</strong></span>
                  <span>Avg Confidence Boost: <strong className="text-sky-400">+{cond.avgConfidenceBoost}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-4 rounded-2xl bg-neutral-950/80 border border-zinc-900 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-sky-400" />
            <h4 className="text-xs font-bold text-white uppercase font-mono-num">
              Consensus Historical Review Log & Signals
            </h4>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search asset, result..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500/50 font-mono-num w-44"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-sky-500/50 font-mono-num"
            >
              <option value="ALL">All Statuses</option>
              <option value="AGREED">Agreed Only</option>
              <option value="DISAGREED">Disagreed Only</option>
              <option value="WAIT_REJECT">Wait Rejects</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-num">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-[10px] uppercase">
                <th className="p-2.5">Asset</th>
                <th className="p-2.5">Date / Time</th>
                <th className="p-2.5">Primary Signal</th>
                <th className="p-2.5">Validator Review</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Diff</th>
                <th className="p-2.5">Final Signal</th>
                <th className="p-2.5">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-zinc-900/40 transition">
                  <td className="p-2.5 font-bold text-white">{log.asset}</td>
                  <td className="p-2.5 text-zinc-400 text-[11px]">{log.timestamp}</td>
                  <td className="p-2.5">
                    <span className={`font-bold ${
                      log.aurumDirection === 'BUY' ? 'text-emerald-400' :
                      log.aurumDirection === 'SELL' ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {log.aurumDirection} ({log.aurumConfidence}%)
                    </span>
                  </td>
                  <td className="p-2.5">
                    <span className={`font-bold ${
                      log.qwenDirection === 'BUY' ? 'text-emerald-400' :
                      log.qwenDirection === 'SELL' ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {log.qwenDirection} ({log.qwenConfidence}%)
                    </span>
                  </td>
                  <td className="p-2.5">
                    {log.agreementStatus === 'AGREED' ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[10px] font-bold">
                        AGREED
                      </span>
                    ) : log.agreementStatus === 'DISAGREED' ? (
                      <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/25 text-[10px] font-bold">
                        DISAGREED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25 text-[10px] font-bold">
                        WAIT REJECT
                      </span>
                    )}
                  </td>
                  <td className="p-2.5">
                    <span className={log.confidenceDiff >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {log.confidenceDiff >= 0 ? `+${log.confidenceDiff}%` : `${log.confidenceDiff}%`}
                    </span>
                  </td>
                  <td className="p-2.5 font-bold text-white">{log.finalSignal}</td>
                  <td className="p-2.5">
                    {log.tradeResult === 'TP' ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> TP HIT
                      </span>
                    ) : log.tradeResult === 'SL' ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> SL HIT
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold">NO TRADE</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety Guardrail Notice */}
      <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center gap-2.5 text-xs">
        <Lock className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="text-zinc-400 font-sans text-[11px] leading-normal">
          <strong className="text-white">Strict Safety Protocols:</strong> Performance data is used exclusively for second-opinion analytics and dynamic confidence weight adjustments. Learning outputs cannot override Risk Management parameters, News Lockout windows, or the 75% execution filter.
        </p>
      </div>
    </div>
  );
};
