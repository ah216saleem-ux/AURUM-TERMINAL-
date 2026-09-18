import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  Layers, 
  RefreshCw, 
  Search, 
  PlusCircle, 
  Lock, 
  Zap, 
  Filter,
  DollarSign,
  Activity,
  Calendar,
  ChevronRight,
  FileCheck,
  Percent,
  X,
  Target,
  Copy,
  Check,
  FileText,
  Share2,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { PaperTradeRecord, PaperTradeAnalytics, ValidationMilestone, DailyPaperReport } from '../types';
import { 
  getPaperTradeRecords, 
  computePaperTradeAnalytics, 
  computeDailyPaperTradingReports,
  savePaperTrade, 
  closeTradeManually,
  updateActivePaperTradesWithLivePrices
} from '../data/paperTradingTracker';
import { useMarket } from '../context/MarketContext';

export const PaperTradingDashboardView: React.FC = () => {
  const { markets } = useMarket();
  const [trades, setTrades] = useState<PaperTradeRecord[]>(getPaperTradeRecords());
  const [analytics, setAnalytics] = useState<PaperTradeAnalytics>(computePaperTradeAnalytics(trades));
  const [dailyReports, setDailyReports] = useState<DailyPaperReport[]>(computeDailyPaperTradingReports(trades));
  const [selectedDailyDate, setSelectedDailyDate] = useState<string>('');
  const [copiedDailyReport, setCopiedDailyReport] = useState<boolean>(false);
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'TP HIT' | 'SL HIT' | 'ACTIVE' | 'CANCELLED'>('ALL');
  const [assetFilter, setAssetFilter] = useState<string>('ALL');
  const [activeTabSection, setActiveTabSection] = useState<'ACTIVE_TRADES' | 'DAILY_REPORTS' | 'PERFORMANCE' | 'AI_ANALYSIS' | 'REPORTS'>('DAILY_REPORTS');
  const [selectedReportModal, setSelectedReportModal] = useState<ValidationMilestone | null>(null);

  // Map market symbols to prices for live price tick evaluation
  const marketPriceMap = useMemo(() => {
    const map: Record<string, number> = {};
    markets.forEach(m => {
      map[m.id] = m.price;
      map[m.symbol] = m.price;
    });
    return map;
  }, [markets]);

  // Continuously monitor active paper trades with live price updates
  useEffect(() => {
    if (Object.keys(marketPriceMap).length > 0) {
      updateActivePaperTradesWithLivePrices(marketPriceMap);
    }
  }, [marketPriceMap]);

  const refreshData = () => {
    const current = getPaperTradeRecords();
    setTrades(current);
    setAnalytics(computePaperTradeAnalytics(current));
    const reports = computeDailyPaperTradingReports(current);
    setDailyReports(reports);
    if (!selectedDailyDate && reports.length > 0) {
      setSelectedDailyDate(reports[0].date);
    }
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener('paper-trades-updated', handleUpdate);
    return () => {
      window.removeEventListener('paper-trades-updated', handleUpdate);
    };
  }, []);

  // Currently active daily report for display
  const activeDailyReport = useMemo(() => {
    if (dailyReports.length === 0) return null;
    const found = dailyReports.find(r => r.date === selectedDailyDate);
    return found || dailyReports[0];
  }, [dailyReports, selectedDailyDate]);

  // Filter trades specific to selected date in daily reports view
  const selectedDateTrades = useMemo(() => {
    if (!activeDailyReport) return [];
    return trades.filter(t => t.timestamp && t.timestamp.startsWith(activeDailyReport.date));
  }, [trades, activeDailyReport]);

  const activeTrades = useMemo(() => {
    return trades.filter(t => t.result === 'ACTIVE');
  }, [trades]);

  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
      const matchesSearch = t.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.strategy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.direction.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || t.result === statusFilter;
      const matchesAsset = assetFilter === 'ALL' || t.asset === assetFilter;
      return matchesSearch && matchesStatus && matchesAsset;
    });
  }, [trades, searchTerm, statusFilter, assetFilter]);

  // Quick helper to simulate approving a signal for Paper Trading
  const handleSimulateNewApproval = () => {
    const sampleMarket = markets[Math.floor(Math.random() * markets.length)];
    const isBuy = sampleMarket.changePercent >= 0;
    const entry = sampleMarket.price;
    const stopLoss = isBuy ? Number((entry * 0.992).toFixed(2)) : Number((entry * 1.008).toFixed(2));
    const tp1 = isBuy ? Number((entry * 1.015).toFixed(2)) : Number((entry * 0.985).toFixed(2));
    const tp2 = isBuy ? Number((entry * 1.028).toFixed(2)) : Number((entry * 0.972).toFixed(2));

    savePaperTrade({
      asset: sampleMarket.symbol,
      assetId: sampleMarket.id,
      timeframe: 'H1',
      strategy: 'SMC Order Block Mitigation',
      direction: isBuy ? 'BUY' : 'SELL',
      entry,
      stopLoss,
      tp1,
      tp2,
      riskReward: '1:2.40',
      confidence: Math.floor(Math.random() * 12) + 85,
      aurumDecision: isBuy ? 'BUY' : 'SELL',
      qwenConfirmation: 'AGREED',
      newsRiskStatus: 'CLEAR',
      result: 'ACTIVE',
      pnlR: 0
    });

    refreshData();
  };

  const handleManualTradeClose = (tradeId: string, outcome: 'TP HIT' | 'SL HIT' | 'CANCELLED') => {
    closeTradeManually(tradeId, outcome);
    refreshData();
  };

  const handleCopyDailyReport = (report: DailyPaperReport) => {
    const text = `
📊 AURUM TERMINAL - AUTOMATED DAILY PAPER TRADING REPORT
📅 Date: ${report.formattedDate} (${report.date})
--------------------------------------------------
• Total Signals Logged: ${report.totalSignals}
• Approved Trades Executed: ${report.approvedTrades}
• TP Targets Hit: ${report.tpHits}
• Stop Losses Hit: ${report.slHits}
• Daily Win Rate: ${report.winRate}%
• Net R Return: ${report.netPnlR >= 0 ? '+' : ''}${report.netPnlR}R (Profit Factor: ${report.profitFactor})
--------------------------------------------------
🏆 Best Performing Asset: ${report.bestAsset.symbol} (+${report.bestAsset.netPnlR}R, ${report.bestAsset.winRate}% WR)
⚠️ Worst Performing Asset: ${report.worstAsset.symbol} (${report.worstAsset.netPnlR}R, ${report.worstAsset.winRate}% WR)
🎯 Best Strategy: ${report.bestStrategy.strategy} (${report.bestStrategy.winRate}% WR)
--------------------------------------------------
🤖 Qwen AI Contribution: ${report.qwenContribution.summary}
--------------------------------------------------
📝 Executive Summary: ${report.executiveSummary}
🔒 Note: Non-custodial simulation mode only. No real capital at risk.
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedDailyReport(true);
    setTimeout(() => setCopiedDailyReport(false), 2500);
  };

  return (
    <div className="space-y-4 font-sans text-zinc-100">
      {/* Top Banner Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121624] via-[#0e111a] to-[#07090e] border border-amber-500/35 shadow-2xl space-y-3 font-mono-num relative overflow-hidden">
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <BarChart3 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-syne tracking-wide uppercase">
                  AURUM Live Paper Trading Validation Mode
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[9.5px] font-mono-num font-bold">
                  NON-CUSTODIAL ENGINE
                </span>
              </div>
              <span className="text-[10.5px] font-mono-num text-zinc-400">
                Automated Signal Paper Execution, Daily Reports & Equity Tracking
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateNewApproval}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-black hover:bg-amber-400 font-bold text-xs transition cursor-pointer shadow-md shadow-amber-500/20"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Trigger Paper Trade</span>
            </button>

            <button
              onClick={refreshData}
              className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition cursor-pointer"
              title="Refresh Dashboard"
            >
              <RefreshCw className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* 6 Primary Metrics Header Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-zinc-900 space-y-0.5">
            <span className="text-[9.5px] uppercase font-bold text-zinc-400 block">Total Signals</span>
            <div className="text-lg font-black text-white">{analytics.totalTrades}</div>
            <span className="text-[9px] text-zinc-500">{analytics.activeTradesCount} Active Position(s)</span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-emerald-500/20 space-y-0.5">
            <span className="text-[9.5px] uppercase font-bold text-emerald-400 block">Win Rate</span>
            <div className="text-lg font-black text-emerald-400">{analytics.winRate}%</div>
            <span className="text-[9px] text-zinc-500">TP Reached</span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-rose-500/20 space-y-0.5">
            <span className="text-[9.5px] uppercase font-bold text-rose-400 block">Loss Rate</span>
            <div className="text-lg font-black text-rose-400">{analytics.lossRate}%</div>
            <span className="text-[9px] text-zinc-500">SL Hit</span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-amber-500/20 space-y-0.5">
            <span className="text-[9.5px] uppercase font-bold text-amber-400 block">Avg Risk:Reward</span>
            <div className="text-lg font-black text-amber-400">{analytics.avgRiskReward}</div>
            <span className="text-[9px] text-zinc-500">Target Expectancy</span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-sky-500/20 space-y-0.5">
            <span className="text-[9.5px] uppercase font-bold text-sky-400 block">Profit Factor</span>
            <div className="text-lg font-black text-sky-400">{analytics.profitFactor}</div>
            <span className="text-[9px] text-zinc-500">Gross W / Gross L</span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-purple-500/20 space-y-0.5">
            <span className="text-[9.5px] uppercase font-bold text-purple-400 block">Net Cumulative</span>
            <div className={`text-lg font-black ${analytics.netPnlR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {analytics.netPnlR >= 0 ? `+${analytics.netPnlR}` : analytics.netPnlR}R
            </div>
            <span className="text-[9px] text-zinc-500">
              ≈ ${(10000 + analytics.netPnlR * 100).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 rounded-xl bg-neutral-950 border border-zinc-800 text-xs font-mono-num font-bold">
        <button
          onClick={() => setActiveTabSection('DAILY_REPORTS')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer text-center ${
            activeTabSection === 'DAILY_REPORTS'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Daily Performance Report</span>
        </button>

        <button
          onClick={() => setActiveTabSection('ACTIVE_TRADES')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer text-center ${
            activeTabSection === 'ACTIVE_TRADES'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Active Paper Trades ({activeTrades.length})</span>
        </button>

        <button
          onClick={() => setActiveTabSection('PERFORMANCE')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer text-center ${
            activeTabSection === 'PERFORMANCE'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Performance & Curve</span>
        </button>

        <button
          onClick={() => setActiveTabSection('AI_ANALYSIS')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer text-center ${
            activeTabSection === 'AI_ANALYSIS'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Decision Comparison</span>
        </button>

        <button
          onClick={() => setActiveTabSection('REPORTS')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer text-center ${
            activeTabSection === 'REPORTS'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>50/100 Trade Validation</span>
        </button>
      </div>

      {/* SECTION 0: AUTOMATED DAILY PERFORMANCE REPORT SYSTEM */}
      {activeTabSection === 'DAILY_REPORTS' && activeDailyReport && (
        <div className="space-y-4 font-mono-num">
          {/* Header Card & Date Selector */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-950 via-[#0d101a] to-neutral-950 border border-amber-500/40 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white uppercase font-syne">
                      Daily Paper Trading Performance Report
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold">
                      AUTOMATED AUDIT
                    </span>
                  </div>
                  <span className="text-[10.5px] text-zinc-400">
                    Comprehensive daily signal metrics, TP/SL audit, net return & AI contribution
                  </span>
                </div>
              </div>

              {/* Date Selector & Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                  <Calendar className="w-3.5 h-3.5 text-amber-400 ml-1.5" />
                  <select
                    value={activeDailyReport.date}
                    onChange={(e) => setSelectedDailyDate(e.target.value)}
                    className="bg-transparent text-xs text-zinc-200 font-bold focus:outline-none pr-2 cursor-pointer"
                  >
                    {dailyReports.map((r, idx) => (
                      <option key={r.date} value={r.date} className="bg-zinc-950 text-zinc-200">
                        {r.formattedDate} {idx === 0 ? '(Today)' : idx === 1 ? '(Yesterday)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => handleCopyDailyReport(activeDailyReport)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition cursor-pointer flex items-center gap-1.5"
                >
                  {copiedDailyReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDailyReport ? 'Report Copied!' : 'Copy Daily Report'}</span>
                </button>
              </div>
            </div>

            {/* Executive Summary Narrative */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 uppercase text-[10px] text-amber-400">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Executive Audit Summary ({activeDailyReport.formattedDate})
                </span>
                <span className="text-[9.5px] text-zinc-400">Simulation Only • Zero Real Capital</span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-zinc-200">
                {activeDailyReport.executiveSummary}
              </p>
            </div>

            {/* 10 Core Daily Summary Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {/* Card 1: Total Signals */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-0.5">
                <span className="text-[9.5px] text-zinc-400 block uppercase font-bold">Total Signals</span>
                <div className="text-xl font-black text-white">{activeDailyReport.totalSignals}</div>
                <span className="text-[9px] text-zinc-500">Logged Signals</span>
              </div>

              {/* Card 2: Approved Trades */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-amber-500/30 space-y-0.5">
                <span className="text-[9.5px] text-amber-400 block uppercase font-bold">Approved Trades</span>
                <div className="text-xl font-black text-amber-300">{activeDailyReport.approvedTrades}</div>
                <span className="text-[9px] text-zinc-500">Paper Executed</span>
              </div>

              {/* Card 3: TP Hits */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-emerald-500/30 space-y-0.5">
                <span className="text-[9.5px] text-emerald-400 block uppercase font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> TP Hits
                </span>
                <div className="text-xl font-black text-emerald-400">{activeDailyReport.tpHits}</div>
                <span className="text-[9px] text-zinc-500">Target 1/2 Reached</span>
              </div>

              {/* Card 4: SL Hits */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-rose-500/30 space-y-0.5">
                <span className="text-[9.5px] text-rose-400 block uppercase font-bold flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-rose-400" /> SL Hits
                </span>
                <div className="text-xl font-black text-rose-400">{activeDailyReport.slHits}</div>
                <span className="text-[9px] text-zinc-500">Stop Loss Hit</span>
              </div>

              {/* Card 5: Daily Win Rate */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-emerald-500/30 space-y-0.5">
                <span className="text-[9.5px] text-emerald-400 block uppercase font-bold">Daily Win Rate</span>
                <div className="text-xl font-black text-emerald-400">{activeDailyReport.winRate}%</div>
                <span className="text-[9px] text-zinc-500">Closed Trades</span>
              </div>

              {/* Card 6: Net R Profit / Loss */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-sky-500/30 space-y-0.5">
                <span className="text-[9.5px] text-sky-400 block uppercase font-bold">Net Daily Return</span>
                <div className={`text-xl font-black ${activeDailyReport.netPnlR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {activeDailyReport.netPnlR >= 0 ? `+${activeDailyReport.netPnlR}` : activeDailyReport.netPnlR}R
                </div>
                <span className="text-[9px] text-zinc-500">
                  ≈ ${(activeDailyReport.netPnlR * 100).toFixed(2)}
                </span>
              </div>

              {/* Card 7: Profit Factor */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-purple-500/30 space-y-0.5">
                <span className="text-[9.5px] text-purple-400 block uppercase font-bold">Profit Factor</span>
                <div className="text-xl font-black text-purple-300">{activeDailyReport.profitFactor}</div>
                <span className="text-[9px] text-zinc-500">Gross W / Gross L</span>
              </div>

              {/* Card 8: Active Positions */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-0.5">
                <span className="text-[9.5px] text-zinc-400 block uppercase font-bold">Active Trades</span>
                <div className="text-xl font-black text-white">{activeDailyReport.activeCount}</div>
                <span className="text-[9px] text-zinc-500">Currently Live</span>
              </div>

              {/* Card 9: Cancelled / Saved */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-0.5">
                <span className="text-[9.5px] text-zinc-400 block uppercase font-bold">Filter Rejected</span>
                <div className="text-xl font-black text-zinc-300">{activeDailyReport.cancelledCount}</div>
                <span className="text-[9px] text-zinc-500">Risk / News Blocked</span>
              </div>

              {/* Card 10: Mode Status */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-0.5">
                <span className="text-[9.5px] text-amber-400 block uppercase font-bold">Execution Mode</span>
                <div className="text-sm font-black text-amber-300 truncate">PAPER SIMULATION</div>
                <span className="text-[9px] text-zinc-400">Zero Financial Risk</span>
              </div>
            </div>

            {/* Asset & Strategy Intelligence Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Best Asset */}
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    Best Asset Today
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">
                    TOP GAINER
                  </span>
                </div>
                <div className="text-lg font-black text-white">{activeDailyReport.bestAsset.symbol}</div>
                <div className="flex items-center justify-between text-xs border-t border-zinc-800 pt-2 text-zinc-400">
                  <span>Win Rate: <strong className="text-emerald-400">{activeDailyReport.bestAsset.winRate}%</strong></span>
                  <span>Net Return: <strong className="text-emerald-400">+{activeDailyReport.bestAsset.netPnlR}R</strong></span>
                </div>
              </div>

              {/* Worst Asset */}
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    Worst Asset Today
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 font-bold">
                    REVIEW NEEDED
                  </span>
                </div>
                <div className="text-lg font-black text-white">{activeDailyReport.worstAsset.symbol}</div>
                <div className="flex items-center justify-between text-xs border-t border-zinc-800 pt-2 text-zinc-400">
                  <span>Win Rate: <strong className="text-rose-400">{activeDailyReport.worstAsset.winRate}%</strong></span>
                  <span>Net Return: <strong className="text-rose-400">{activeDailyReport.worstAsset.netPnlR}R</strong></span>
                </div>
              </div>

              {/* Best Strategy */}
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    Best Strategy Today
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-bold">
                    TOP SMC SETUP
                  </span>
                </div>
                <div className="text-sm font-bold text-white truncate" title={activeDailyReport.bestStrategy.strategy}>
                  {activeDailyReport.bestStrategy.strategy}
                </div>
                <div className="flex items-center justify-between text-xs border-t border-zinc-800 pt-2 text-zinc-400">
                  <span>Win Rate: <strong className="text-emerald-400">{activeDailyReport.bestStrategy.winRate}%</strong></span>
                  <span>Executions: <strong className="text-white">{activeDailyReport.bestStrategy.tradesCount}</strong></span>
                </div>
              </div>
            </div>

            {/* Qwen AI Contribution Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/40 via-zinc-900/60 to-sky-950/40 border border-sky-500/30 space-y-2.5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-white uppercase">
                    Qwen Second-Opinion Contribution
                  </span>
                </div>
                <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 font-bold">
                  {activeDailyReport.qwenContribution.winRateWhenAgreed}% Accuracy when Agreed
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 block uppercase">Agreed Signals</span>
                  <span className="font-bold text-emerald-400">{activeDailyReport.qwenContribution.agreedCount}</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 block uppercase">Disagreed / Filtered</span>
                  <span className="font-bold text-amber-400">{activeDailyReport.qwenContribution.disagreedCount}</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 block uppercase">Bad Trades Saved</span>
                  <span className="font-bold text-sky-400">{activeDailyReport.qwenContribution.savedCount}</span>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-800">
                {activeDailyReport.qwenContribution.summary}
              </p>
            </div>

            {/* Selected Date Trade Executions Ledger */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Executions Logged On {activeDailyReport.formattedDate} ({selectedDateTrades.length})
                </h5>
                <span className="text-[10px] text-zinc-500">Time-Stamped Signals</span>
              </div>

              {selectedDateTrades.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-500 bg-zinc-900/30 rounded-xl border border-zinc-900">
                  No paper trade executions logged for this date.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono-num">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 text-[10px] uppercase">
                        <th className="p-2">Asset / Time</th>
                        <th className="p-2">Direction</th>
                        <th className="p-2">Strategy</th>
                        <th className="p-2">Entry</th>
                        <th className="p-2">SL / TP1</th>
                        <th className="p-2">R:R</th>
                        <th className="p-2">Qwen Status</th>
                        <th className="p-2">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {selectedDateTrades.map(t => (
                        <tr key={t.id} className="hover:bg-zinc-900/40 transition">
                          <td className="p-2">
                            <span className="font-bold text-white block">{t.asset}</span>
                            <span className="text-[9.5px] text-zinc-500">{t.timestamp.slice(11)} ({t.timeframe})</span>
                          </td>
                          <td className="p-2 font-bold">
                            <span className={`px-2 py-0.5 rounded text-[9.5px] ${
                              t.direction === 'BUY' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                            }`}>
                              {t.direction}
                            </span>
                          </td>
                          <td className="p-2 text-zinc-300 truncate max-w-[130px]" title={t.strategy}>
                            {t.strategy}
                          </td>
                          <td className="p-2 font-bold text-white">${t.entry}</td>
                          <td className="p-2">
                            <div className="text-rose-400 text-[10px]">SL: ${t.stopLoss}</div>
                            <div className="text-emerald-400 text-[10px]">TP: ${t.tp1}</div>
                          </td>
                          <td className="p-2 text-amber-400 font-bold">{t.riskReward}</td>
                          <td className="p-2">
                            <span className={`text-[10px] font-bold ${
                              t.qwenConfirmation === 'AGREED' ? 'text-emerald-400' : 'text-amber-400'
                            }`}>
                              {t.qwenConfirmation}
                            </span>
                          </td>
                          <td className="p-2 font-bold">
                            {t.result === 'TP HIT' ? (
                              <span className="text-emerald-400">+{(t.pnlR || 2.4).toFixed(2)}R</span>
                            ) : t.result === 'SL HIT' ? (
                              <span className="text-rose-400">-1.0R</span>
                            ) : t.result === 'ACTIVE' ? (
                              <span className="text-sky-400">ACTIVE</span>
                            ) : (
                              <span className="text-zinc-500">CANCELLED</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Historical Daily Reports Archive Table */}
          <div className="p-4 rounded-2xl bg-neutral-950/90 border border-zinc-900 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase font-syne">
                  Historical Daily Performance Reports Archive ({dailyReports.length} Days)
                </h4>
              </div>
              <span className="text-[10px] text-zinc-400">Select any day to view full report</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono-num">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-[10px] uppercase">
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Signals Logged</th>
                    <th className="p-2.5">Approved Trades</th>
                    <th className="p-2.5">TP / SL Hits</th>
                    <th className="p-2.5">Daily Win Rate</th>
                    <th className="p-2.5">Net Daily R</th>
                    <th className="p-2.5">Best Asset</th>
                    <th className="p-2.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {dailyReports.map(report => (
                    <tr 
                      key={report.date} 
                      className={`hover:bg-zinc-900/40 transition cursor-pointer ${
                        report.date === activeDailyReport.date ? 'bg-amber-500/10' : ''
                      }`}
                      onClick={() => setSelectedDailyDate(report.date)}
                    >
                      <td className="p-2.5 font-bold text-white">
                        {report.formattedDate}
                        {report.date === dailyReports[0]?.date && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px]">TODAY</span>
                        )}
                      </td>
                      <td className="p-2.5 text-zinc-300">{report.totalSignals}</td>
                      <td className="p-2.5 text-amber-300 font-bold">{report.approvedTrades}</td>
                      <td className="p-2.5">
                        <span className="text-emerald-400">{report.tpHits} TP</span> / <span className="text-rose-400">{report.slHits} SL</span>
                      </td>
                      <td className="p-2.5 font-bold text-emerald-400">{report.winRate}%</td>
                      <td className="p-2.5 font-bold">
                        <span className={report.netPnlR >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {report.netPnlR >= 0 ? `+${report.netPnlR}` : report.netPnlR}R
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-white">{report.bestAsset.symbol}</td>
                      <td className="p-2.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDailyDate(report.date);
                          }}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold transition flex items-center gap-1"
                        >
                          <span>View Report</span>
                          <ChevronRight className="w-3 h-3 text-amber-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: LIVE ACTIVE PAPER TRADES MONITOR */}
      {activeTabSection === 'ACTIVE_TRADES' && (
        <div className="space-y-3 font-mono-num">
          <div className="p-3.5 rounded-2xl bg-neutral-950/90 border border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h4 className="text-xs font-bold text-white uppercase font-syne">
                Live Active Position Monitor ({activeTrades.length})
              </h4>
            </div>
            <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800">
              Evaluated with Real-Time Ticks
            </span>
          </div>

          {activeTrades.length === 0 ? (
            <div className="p-8 rounded-2xl bg-neutral-950/60 border border-zinc-900 text-center space-y-2">
              <Clock className="w-8 h-8 text-zinc-600 mx-auto" />
              <div className="text-sm font-bold text-zinc-300">No Active Paper Trades Right Now</div>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                When an AI signal is generated and approved, it will automatically enter the live paper monitor and track real-time market movements.
              </p>
              <button
                onClick={handleSimulateNewApproval}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Simulate Approved Signal</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeTrades.map(trade => {
                const livePrice = marketPriceMap[trade.assetId] || trade.currentPrice || trade.entry;
                const isBuy = trade.direction === 'BUY';
                
                // Calculate dist to TP & SL
                const distToTp = isBuy ? trade.tp1 - trade.entry : trade.entry - trade.tp1;
                const currentDist = isBuy ? livePrice - trade.entry : trade.entry - livePrice;
                const progressPct = Math.min(100, Math.max(0, (currentDist / (distToTp || 1)) * 100));

                const floatingR = trade.pnlR ?? 0;
                const floatingUsd = floatingR * 100;

                return (
                  <div key={trade.id} className="p-4 rounded-2xl bg-neutral-950/95 border border-amber-500/30 space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{trade.asset}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          isBuy ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                        }`}>
                          {trade.direction}
                        </span>
                        <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded">
                          {trade.timeframe} • {trade.session || 'London'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 block">Floating P&L</span>
                        <span className={`text-sm font-black ${floatingR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {floatingR >= 0 ? `+${floatingR}` : floatingR}R (${floatingUsd >= 0 ? `+${floatingUsd.toFixed(2)}` : floatingUsd.toFixed(2)})
                        </span>
                      </div>
                    </div>

                    {/* Price Grid */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                        <span className="text-[9px] text-zinc-500 block uppercase font-bold">Entry</span>
                        <span className="font-bold text-white">${trade.entry}</span>
                      </div>

                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                        <span className="text-[9px] text-amber-400 block uppercase font-bold">Live Tick</span>
                        <span className="font-black text-amber-300">${livePrice}</span>
                      </div>

                      <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <span className="text-[9px] text-rose-400 block uppercase font-bold">Stop Loss</span>
                        <span className="font-bold text-rose-400">${trade.stopLoss}</span>
                      </div>

                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-[9px] text-emerald-400 block uppercase font-bold">TP1</span>
                        <span className="font-bold text-emerald-400">${trade.tp1}</span>
                      </div>
                    </div>

                    {/* Progress Bar towards Target */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-zinc-400 font-mono-num">
                        <span>TP Target Progress</span>
                        <span>{progressPct.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Manual Execution Action Buttons */}
                    <div className="flex items-center justify-between border-t border-zinc-900 pt-2.5 text-xs">
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                        <Sparkles className="w-3 h-3 text-sky-400" />
                        <span>AI Score: {trade.confidence}% ({trade.qwenConfirmation})</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleManualTradeClose(trade.id, 'TP HIT')}
                          className="px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] hover:bg-emerald-500/30 transition cursor-pointer"
                        >
                          Trigger TP
                        </button>
                        <button
                          onClick={() => handleManualTradeClose(trade.id, 'SL HIT')}
                          className="px-2 py-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-[10px] hover:bg-rose-500/30 transition cursor-pointer"
                        >
                          Trigger SL
                        </button>
                        <button
                          onClick={() => handleManualTradeClose(trade.id, 'CANCELLED')}
                          className="px-2 py-1 rounded bg-zinc-800 text-zinc-400 hover:text-white font-bold text-[10px] transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: PERFORMANCE & EQUITY CURVE */}
      {activeTabSection === 'PERFORMANCE' && (
        <div className="space-y-4 font-mono-num">
          {/* Equity Curve Chart */}
          <div className="p-4 rounded-2xl bg-neutral-950/90 border border-zinc-900 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase font-syne">
                  Simulated Account Equity Curve ($10,000 Base)
                </h4>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                Net Growth: +{analytics.netPnlR}R (${(analytics.netPnlR * 100).toFixed(2)})
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.equityCurve}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="tradeIndex" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} stroke="#71717a" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#3f3f46', borderRadius: '12px', fontSize: '11px' }}
                    formatter={(value: any) => [`$${value}`, 'Account Equity']}
                    labelFormatter={(label) => `Trade #${label}`}
                  />
                  <Area type="monotone" dataKey="equity" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorEquity)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4 Analytics Pillars Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Pillar 1: Best Performing Asset */}
            <div className="p-3.5 rounded-2xl bg-neutral-950/90 border border-zinc-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Best Asset
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-bold">
                  TOP SYMBOL
                </span>
              </div>
              <div className="text-lg font-black text-white">{analytics.bestPerformingAsset.symbol}</div>
              <div className="flex items-center justify-between text-xs border-t border-zinc-900/90 pt-2 text-zinc-400">
                <span>Win Rate: <strong className="text-emerald-400">{analytics.bestPerformingAsset.winRate}%</strong></span>
                <span>Net PnL: <strong className="text-amber-400">+{analytics.bestPerformingAsset.netPnlR}R</strong></span>
              </div>
            </div>

            {/* Pillar 2: Best Timeframe */}
            <div className="p-3.5 rounded-2xl bg-neutral-950/90 border border-zinc-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  Best Timeframe
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 font-bold">
                  OPTIMAL TF
                </span>
              </div>
              <div className="text-lg font-black text-white">{analytics.bestTimeframe.timeframe} Chart</div>
              <div className="flex items-center justify-between text-xs border-t border-zinc-900/90 pt-2 text-zinc-400">
                <span>Win Rate: <strong className="text-emerald-400">{analytics.bestTimeframe.winRate}%</strong></span>
                <span>Trades: <strong className="text-white">{analytics.bestTimeframe.totalTrades}</strong></span>
              </div>
            </div>

            {/* Pillar 3: Best Strategy */}
            <div className="p-3.5 rounded-2xl bg-neutral-950/90 border border-zinc-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  Best Strategy
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">
                  TOP SMC SETUP
                </span>
              </div>
              <div className="text-sm font-bold text-white truncate" title={analytics.bestStrategy.strategy}>
                {analytics.bestStrategy.strategy}
              </div>
              <div className="flex items-center justify-between text-xs border-t border-zinc-900/90 pt-2 text-zinc-400">
                <span>Win Rate: <strong className="text-emerald-400">{analytics.bestStrategy.winRate}%</strong></span>
                <span>Evaluated: <strong className="text-white">{analytics.bestStrategy.totalTrades}</strong></span>
              </div>
            </div>

            {/* Pillar 4: Best Session */}
            <div className="p-3.5 rounded-2xl bg-neutral-950/90 border border-zinc-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  Best Session
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 font-bold">
                  OPTIMAL WINDOW
                </span>
              </div>
              <div className="text-lg font-black text-white">{analytics.bestSession.session} Session</div>
              <div className="flex items-center justify-between text-xs border-t border-zinc-900/90 pt-2 text-zinc-400">
                <span>Win Rate: <strong className="text-emerald-400">{analytics.bestSession.winRate}%</strong></span>
                <span>Net PnL: <strong className="text-purple-400">+{analytics.bestSession.netPnlR}R</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: AI DECISION MATRIX COMPARISON */}
      {activeTabSection === 'AI_ANALYSIS' && (
        <div className="space-y-4 font-mono-num">
          <div className="p-4 rounded-2xl bg-neutral-950/90 border border-sky-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-400" />
                <div>
                  <h4 className="text-sm font-bold text-white uppercase font-syne">
                    Dual-AI Decision Matrix: AURUM vs Qwen vs Outcome
                  </h4>
                  <span className="text-[10.5px] text-zinc-400">
                    Quantifying Qwen confirmation accuracy boost and bad setup rejection efficiency
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 font-bold text-xs">
                +{analytics.qwenImpact.extraAccuracyGained}% Accuracy Boost
              </span>
            </div>

            {/* 3 AI Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-emerald-500/30 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 block uppercase">When Qwen Agrees</span>
                <div className="text-2xl font-black text-emerald-400">{analytics.qwenImpact.winRateWhenAgreed}%</div>
                <p className="text-[10.5px] text-zinc-400 leading-tight">
                  High-conviction dual-AI consensus trades achieve peak win rate and risk execution.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-rose-500/30 space-y-1">
                <span className="text-[10px] font-bold text-rose-400 block uppercase">When Qwen Disagrees</span>
                <div className="text-2xl font-black text-rose-400">{analytics.qwenImpact.winRateWhenDisagreed}%</div>
                <p className="text-[10.5px] text-zinc-400 leading-tight">
                  Trades taken despite Qwen hesitation show sharply reduced probability, validating the filter.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-amber-500/30 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 block uppercase">Saved Bad Setups</span>
                <div className="text-2xl font-black text-amber-400">{analytics.qwenImpact.tradesSavedByQwen} Losses Avoided</div>
                <p className="text-[10.5px] text-zinc-400 leading-tight">
                  Qwen rejected unfavorable risk setups or news conflicts before execution.
                </p>
              </div>
            </div>

            {/* Decision Logic Matrix Table */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Recent AI Consensus Evaluation Sample
              </h5>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono-num">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 text-[10px] uppercase">
                      <th className="p-2">Asset</th>
                      <th className="p-2">AURUM Signal</th>
                      <th className="p-2">Qwen Second Opinion</th>
                      <th className="p-2">Consensus Result</th>
                      <th className="p-2">Final Trade Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {trades.slice(0, 6).map(t => (
                      <tr key={t.id} className="hover:bg-zinc-900/30 transition">
                        <td className="p-2 font-bold text-white">{t.asset} ({t.timeframe})</td>
                        <td className="p-2 font-bold text-amber-400">{t.aurumDecision}</td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.qwenConfirmation === 'AGREED' ? 'bg-emerald-500/15 text-emerald-400' :
                            t.qwenConfirmation === 'DISAGREED' ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'
                          }`}>
                            {t.qwenConfirmation}
                          </span>
                        </td>
                        <td className="p-2 font-bold text-zinc-300">{t.confidence}% Score</td>
                        <td className="p-2 font-bold">
                          {t.result === 'TP HIT' ? (
                            <span className="text-emerald-400">TP HIT (+{t.pnlR}R)</span>
                          ) : t.result === 'SL HIT' ? (
                            <span className="text-rose-400">SL HIT (-1.0R)</span>
                          ) : t.result === 'ACTIVE' ? (
                            <span className="text-sky-400">ACTIVE POSITION</span>
                          ) : (
                            <span className="text-zinc-500">CANCELLED (SAVED)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: 50/100 TRADE VALIDATION PERIOD REPORTS */}
      {activeTabSection === 'REPORTS' && (
        <div className="space-y-4 font-mono-num">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 50-Trade Milestone Card */}
            <div className="p-4 rounded-2xl bg-neutral-950/90 border border-amber-500/30 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase font-syne">
                      50-Trade Institutional Validation
                    </h4>
                    <span className="text-[10px] text-zinc-400">Initial Consistency Milestone</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  analytics.milestone50.reached ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}>
                  {analytics.milestone50.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Progress to Target:</span>
                  <span className="font-bold text-white">{analytics.milestone50.tradeCount} / 50 Trades</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500" 
                    style={{ width: `${(analytics.milestone50.tradeCount / 50) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 block uppercase">Win Rate</span>
                  <span className="font-bold text-emerald-400">{analytics.milestone50.winRate}%</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 block uppercase">Profit Factor</span>
                  <span className="font-bold text-sky-400">{analytics.milestone50.profitFactor}</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 block uppercase">Rating Grade</span>
                  <span className="font-bold text-amber-300">{analytics.milestone50.grade.split(' ')[0]}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedReportModal(analytics.milestone50)}
                className="w-full py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>View Full 50-Trade Audit Report</span>
              </button>
            </div>

            {/* 100-Trade Master Milestone Card */}
            <div className="p-4 rounded-2xl bg-neutral-950/90 border border-purple-500/30 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase font-syne">
                      100-Trade Master Certification
                    </h4>
                    <span className="text-[10px] text-zinc-400">Institutional Algorithmic Audit</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  analytics.milestone100.reached ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                }`}>
                  {analytics.milestone100.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Progress to Target:</span>
                  <span className="font-bold text-white">{analytics.milestone100.tradeCount} / 100 Trades</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500" 
                    style={{ width: `${(analytics.milestone100.tradeCount / 100) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 block uppercase">Win Rate</span>
                  <span className="font-bold text-emerald-400">{analytics.milestone100.winRate}%</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 block uppercase">Profit Factor</span>
                  <span className="font-bold text-sky-400">{analytics.milestone100.profitFactor}</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 block uppercase">Audit Score</span>
                  <span className="font-bold text-purple-300">{analytics.milestone100.readinessScore}/100</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedReportModal(analytics.milestone100)}
                className="w-full py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-xs hover:bg-purple-500/30 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>View Full 100-Trade Audit Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Paper Trading Ledger Table */}
      <div className="p-4 rounded-2xl bg-neutral-950/90 border border-zinc-900 space-y-3 font-mono-num">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase font-syne">
              Approved Paper Trade Ledger ({filteredTrades.length})
            </h4>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search asset or strategy..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 w-44"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-amber-500/50"
            >
              <option value="ALL">All Results</option>
              <option value="ACTIVE">Active Position</option>
              <option value="TP HIT">TP Hit</option>
              <option value="SL HIT">SL Hit</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Paper Trades Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-num">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-[10px] uppercase">
                <th className="p-2.5">Asset / Time</th>
                <th className="p-2.5">Direction</th>
                <th className="p-2.5">Entry Zone</th>
                <th className="p-2.5">Stop Loss</th>
                <th className="p-2.5">TP1 / TP2</th>
                <th className="p-2.5">R:R</th>
                <th className="p-2.5">Confidence</th>
                <th className="p-2.5">AURUM / Qwen</th>
                <th className="p-2.5">News Risk</th>
                <th className="p-2.5">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredTrades.map(trade => (
                <tr key={trade.id} className="hover:bg-zinc-900/40 transition">
                  <td className="p-2.5">
                    <span className="font-bold text-white block">{trade.asset}</span>
                    <span className="text-[10px] text-zinc-500 block">{trade.timestamp} ({trade.timeframe})</span>
                  </td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                      trade.direction === 'BUY' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' :
                      trade.direction === 'SELL' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25' :
                      'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                    }`}>
                      {trade.direction}
                    </span>
                  </td>
                  <td className="p-2.5 font-bold text-zinc-200">${trade.entry}</td>
                  <td className="p-2.5 text-rose-400">${trade.stopLoss}</td>
                  <td className="p-2.5">
                    <div className="text-emerald-400 text-[11px]">${trade.tp1}</div>
                    <div className="text-emerald-300 text-[10px]">${trade.tp2}</div>
                  </td>
                  <td className="p-2.5 font-bold text-amber-400">{trade.riskReward}</td>
                  <td className="p-2.5 font-bold text-white">{trade.confidence}%</td>
                  <td className="p-2.5">
                    <div className="text-zinc-300 font-bold">{trade.aurumDecision}</div>
                    <div className={`text-[10px] ${
                      trade.qwenConfirmation === 'AGREED' ? 'text-emerald-400 font-bold' :
                      trade.qwenConfirmation === 'DISAGREED' ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'
                    }`}>
                      Qwen: {trade.qwenConfirmation}
                    </div>
                  </td>
                  <td className="p-2.5">
                    <span className={`text-[10px] font-bold ${trade.newsRiskStatus === 'CLEAR' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {trade.newsRiskStatus}
                    </span>
                  </td>
                  <td className="p-2.5">
                    {trade.result === 'TP HIT' ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[10px] font-bold flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> TP HIT (+{trade.pnlR}R)
                      </span>
                    ) : trade.result === 'SL HIT' ? (
                      <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/25 text-[10px] font-bold flex items-center gap-1 w-fit">
                        <XCircle className="w-3 h-3" /> SL HIT (-1.0R)
                      </span>
                    ) : trade.result === 'ACTIVE' ? (
                      <span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/25 text-[10px] font-bold flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3 animate-spin" /> ACTIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-bold">
                        CANCELLED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Modal */}
      {selectedReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono-num">
          <div className="bg-neutral-950 border border-amber-500/40 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedReportModal(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 border-b border-zinc-900 pb-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-syne uppercase">
                  {selectedReportModal.target}-Trade Performance Audit Report
                </h3>
                <span className="text-[10px] text-zinc-400">AURUM TERMINAL Algorithmic Audit</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block uppercase">Audit Status</span>
                <span className="font-bold text-emerald-400 text-sm">{selectedReportModal.status}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block uppercase">Qualification Grade</span>
                <span className="font-bold text-amber-300 text-sm">{selectedReportModal.grade}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block uppercase">Win Rate Benchmark</span>
                <span className="font-bold text-white text-sm">{selectedReportModal.winRate}%</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block uppercase">Profit Factor</span>
                <span className="font-bold text-sky-400 text-sm">{selectedReportModal.profitFactor}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
              <span className="font-bold block">Institutional Audit Summary:</span>
              <p className="text-[11px] leading-relaxed text-zinc-300">
                This report confirms that the system has executed high-probability paper trades adhering to SMC order blocks, news blackout windows, and dual-AI Qwen validation without any real account exposure.
              </p>
            </div>

            <button
              onClick={() => setSelectedReportModal(null)}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition cursor-pointer"
            >
              Close Performance Report
            </button>
          </div>
        </div>
      )}

      {/* Non-Custodial Safety Footnote */}
      <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center gap-2.5 text-xs">
        <Lock className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="text-zinc-400 font-sans text-[11px] leading-normal">
          <strong className="text-white">Paper Trading Protocol:</strong> All records herein represent non-custodial paper trading simulations. No real capital is placed at risk or transmitted to live brokerage APIs.
        </p>
      </div>
    </div>
  );
};
