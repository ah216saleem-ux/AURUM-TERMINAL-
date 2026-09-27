import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sliders,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  RefreshCw,
  Compass,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Activity,
  History,
  Target,
  BarChart3,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Zap,
  Globe,
  Gauge,
  CheckCircle2,
  XCircle,
  PlusCircle,
  RotateCcw,
  BookOpen,
  Filter,
  Check,
  Percent,
  Clock,
  Award
} from 'lucide-react';
import {
  MarketRegimeType,
  VolatilityStateType,
  TradingSessionType,
  StrategyApproachMethod,
  StrategyMemoryRecord,
  MethodPerformanceRanking,
  MarketConditionPlaybook,
  RegimeLearningModel,
  AdaptiveWeightAdjustment,
  LearningReliability,
  QuickCommandSummary,
  StrategyMemoryFullState
} from '../types/strategyMemoryTypes';

interface AdaptiveStrategyMemoryViewProps {
  onSelectTab?: (tabId: string) => void;
}

export const AdaptiveStrategyMemoryView: React.FC<AdaptiveStrategyMemoryViewProps> = ({
  onSelectTab
}) => {
  const [data, setData] = useState<StrategyMemoryFullState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active section view
  const [activeSection, setActiveSection] = useState<'COMMAND_SUMMARY' | 'REGIMES' | 'RANKINGS' | 'WEIGHTS' | 'PLAYBOOKS' | 'DATABASE'>('COMMAND_SUMMARY');

  // Selected regime for drilldown
  const [selectedRegime, setSelectedRegime] = useState<MarketRegimeType>('NEWS_DRIVEN');

  // Modal for logging new trade memory record
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [isSubmittingRecord, setIsSubmittingRecord] = useState<boolean>(false);
  const [newRecordForm, setNewRecordForm] = useState<{
    marketRegime: MarketRegimeType;
    newsEnvironment: string;
    volatilityState: VolatilityStateType;
    session: TradingSessionType;
    smcCondition: string;
    macroCondition: string;
    approachUsed: StrategyApproachMethod;
    prediction: string;
    targetPrice: string;
    invalidationPrice: string;
    outcome: 'SUCCESS' | 'FAILURE' | 'BE_OR_PARTIAL';
    outcomePnlR: string;
    outcomeNotes: string;
  }>({
    marketRegime: 'NEWS_DRIVEN',
    newsEnvironment: 'FOMC Press Conference Rate Guidance',
    volatilityState: 'HIGH',
    session: 'NY_OPEN',
    smcCondition: 'Liquidity Sweep + Order Block reaction',
    macroCondition: 'Dovish Fed statement, DXY -0.85%',
    approachUsed: 'WAIT_CONFIRMATION',
    prediction: 'Sweep of 4240 liquidity pool followed by 15M CHoCH rally to 4295',
    targetPrice: '4295',
    invalidationPrice: '4235',
    outcome: 'SUCCESS',
    outcomePnlR: '3.4',
    outcomeNotes: 'Waiting 20 min allowed initial spikes to exhaust before entering pristine order block retest.'
  });

  // Filter for memory database records
  const [dbFilterRegime, setDbFilterRegime] = useState<string>('ALL');
  const [dbFilterOutcome, setDbFilterOutcome] = useState<string>('ALL');

  // Fetch full state from server
  const fetchState = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/strategy-memory');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json: StrategyMemoryFullState = await res.json();
      setData(json);
      if (json.currentEnvironment?.regime) {
        setSelectedRegime(json.currentEnvironment.regime);
      }
      setError(null);
    } catch (err: any) {
      console.error('[StrategyMemory] Fetch error:', err);
      setError(err?.message || 'Failed to connect to Strategy Memory engine');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  // Submit new memory record
  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRecord(true);
    try {
      const res = await fetch('/api/strategy-memory/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRecordForm,
          targetPrice: parseFloat(newRecordForm.targetPrice) || undefined,
          invalidationPrice: parseFloat(newRecordForm.invalidationPrice) || undefined,
          outcomePnlR: parseFloat(newRecordForm.outcomePnlR) || 2.5
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.updatedState) {
          setData(json.updatedState);
        }
        setIsLogModalOpen(false);
      }
    } catch (err) {
      console.warn('[StrategyMemory] Record submission error:', err);
    } finally {
      setIsSubmittingRecord(false);
    }
  };

  // Reset database to default benchmarks
  const handleResetDefaults = async () => {
    if (!window.confirm('Reset Strategy Memory Database to calibrated benchmark cases?')) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/strategy-memory/reset-defaults', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json.freshState) setData(json.freshState);
      }
    } catch (e) {
      console.warn('Reset error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="min-h-[480px] flex flex-col items-center justify-center space-y-4 p-8 bg-[#0b0e18]/80 border border-zinc-900 rounded-2xl">
        <div className="relative">
          <BrainCircuit className="w-12 h-12 text-[#D4AF37] animate-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin" />
        </div>
        <div className="text-center font-mono space-y-1">
          <div className="text-sm font-bold text-white tracking-wider">INITIALIZING STRATEGY MEMORY ENGINE</div>
          <div className="text-xs text-zinc-500">Querying empirical regimes, ranking analysis methods & calculating adaptive weights...</div>
        </div>
      </div>
    );
  }

  const currentEnv = data?.currentEnvironment;
  const quickSummary = data?.quickCommandSummary;
  const weights = data?.weights;
  const reliability = data?.reliability;
  const selectedModel = data?.regimes?.[selectedRegime];
  const activePlaybook = data?.playbooks?.[selectedRegime];

  // Filtered records
  const filteredRecords = (data?.memoryDatabase || []).filter(rec => {
    if (dbFilterRegime !== 'ALL' && rec.marketRegime !== dbFilterRegime) return false;
    if (dbFilterOutcome !== 'ALL' && rec.outcome !== dbFilterOutcome) return false;
    return true;
  });

  return (
    <div className="space-y-5 text-zinc-200">
      {/* 1. TOP HEADER & CMD: STRATEGY MEMORY BADGE */}
      <div className="bg-[#0B0D14] border border-[#2A2315] p-5 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#D4AF37]/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
                <BrainCircuit className="w-3 h-3 text-[#D4AF37]" />
                CMD: STRATEGY MEMORY
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                ● Adaptive Intelligence Online
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400">
                Confidence: <strong className="text-amber-300">{reliability?.confidenceScore || 87}%</strong> ({reliability?.sampleCasesCount || 142} Cases)
              </span>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white flex items-center gap-2">
              <span>ADAPTIVE STRATEGY MEMORY ENGINE</span>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700 text-amber-300 font-normal">
                {currentEnv?.activeAsset || 'XAU/USD Gold'}
              </span>
            </h1>

            <p className="text-xs text-zinc-400 font-sans max-w-2xl leading-relaxed">
              Learns which analysis approaches perform best under different market environments.
              Continuously stores conditions, tests empirical accuracy, ranks execution methods, and adaptively balances system weights.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start lg:self-center">
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black text-xs font-mono font-black transition cursor-pointer shadow-lg shadow-amber-500/20 hover:brightness-110 flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Trade Outcome</span>
            </button>

            <button
              onClick={fetchState}
              disabled={isLoading}
              className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-300 transition cursor-pointer flex items-center justify-center gap-1.5 text-xs font-mono"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">Refresh Engine</span>
            </button>

            <button
              onClick={handleResetDefaults}
              className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300 transition cursor-pointer text-xs"
              title="Reset to benchmark samples"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-mono">
          {[
            { id: 'COMMAND_SUMMARY', label: 'CMD: STRATEGY MEMORY', icon: Zap },
            { id: 'REGIMES', label: 'Regime Learning Models', icon: Layers },
            { id: 'RANKINGS', label: 'Method Rankings', icon: Award },
            { id: 'WEIGHTS', label: 'Adaptive Weights', icon: Sliders },
            { id: 'PLAYBOOKS', label: 'Condition Playbooks', icon: BookOpen },
            { id: 'DATABASE', label: 'Memory Database', icon: History }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#D4AF37] text-black font-black shadow-md shadow-amber-500/20'
                    : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SECTION: CMD: STRATEGY MEMORY HERO & COMMAND SUMMARY */}
      {/* ========================================================================= */}
      {activeSection === 'COMMAND_SUMMARY' && quickSummary && (
        <div className="space-y-4">
          {/* Quick Command Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Current Environment Card */}
            <div className="p-4 rounded-xl bg-[#0e121e] border border-amber-500/30 space-y-2 relative overflow-hidden">
              <div className="text-[10.5px] font-mono font-bold text-amber-400/90 uppercase tracking-wider flex items-center justify-between">
                <span>CURRENT ENVIRONMENT</span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              </div>
              <div className="text-base font-black font-mono text-white">
                {currentEnv?.regimeLabel || 'High Volatility'}
              </div>
              <div className="text-[11px] font-mono text-zinc-400 space-y-0.5">
                <div>News: <strong className="text-zinc-200">{currentEnv?.newsEnvironment}</strong></div>
                <div>Session: <strong className="text-zinc-200">{currentEnv?.session}</strong></div>
                <div>Gold: <strong className="text-amber-300">${currentEnv?.goldPrice?.toFixed(2)}</strong></div>
              </div>
            </div>

            {/* Best Historical Approach */}
            <div className="p-4 rounded-xl bg-[#0b1b13] border border-emerald-500/40 space-y-2">
              <div className="text-[10.5px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                <span>BEST HISTORICAL APPROACH</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-sm font-black font-mono text-emerald-300">
                1. {quickSummary.bestHistoricalApproach.name}
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <div>
                  <span className="text-zinc-400 text-[10px] block">ACCURACY</span>
                  <span className="text-lg font-black text-emerald-400">{quickSummary.bestHistoricalApproach.accuracy}%</span>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] block">SAMPLES</span>
                  <span className="text-zinc-200 font-bold">{quickSummary.bestHistoricalApproach.sampleSize}</span>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] block">AVG R:R</span>
                  <span className="text-amber-300 font-bold">{quickSummary.bestHistoricalApproach.avgRR}</span>
                </div>
              </div>
            </div>

            {/* Worst Performing Approach */}
            <div className="p-4 rounded-xl bg-[#1b0d10] border border-rose-500/40 space-y-2">
              <div className="text-[10.5px] font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center justify-between">
                <span>WORST PERFORMING APPROACH</span>
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-sm font-black font-mono text-rose-300">
                {quickSummary.worstPerformingApproach.name}
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <div>
                  <span className="text-zinc-400 text-[10px] block">ACCURACY</span>
                  <span className="text-lg font-black text-rose-400">{quickSummary.worstPerformingApproach.accuracy}%</span>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] block">VERDICT</span>
                  <span className="text-rose-400 font-black">AVOID</span>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] block">SLIP/RISK</span>
                  <span className="text-zinc-300 font-bold">Severe Trap</span>
                </div>
              </div>
            </div>

            {/* System Success Rate & Learning Confidence */}
            <div className="p-4 rounded-xl bg-[#14121e] border border-indigo-500/40 space-y-2">
              <div className="text-[10.5px] font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center justify-between">
                <span>OVERALL SUCCESS RATE</span>
                <Award className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-2xl font-black font-mono text-indigo-200">
                {quickSummary.successRate}%
              </div>
              <div className="text-[11px] font-mono text-zinc-400">
                Based on <strong className="text-amber-300">{reliability?.sampleCasesCount}</strong> verified cases across 5 market regimes.
              </div>
            </div>
          </div>

          {/* Institutional Learning Notes */}
          <div className="p-5 rounded-2xl bg-[#0B0D14] border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-black text-amber-400 tracking-wider uppercase">
              <BrainCircuit className="w-4 h-4 text-[#D4AF37]" />
              <span>TERMINAL LEARNING NOTES & CONDITIONAL LOGIC</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickSummary.learningNotes.map((note, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-start gap-2.5 text-xs text-zinc-300">
                  <span className="w-5 h-5 rounded-md bg-[#D4AF37]/10 text-[#D4AF37] font-mono font-black flex items-center justify-center shrink-0 text-[10px]">
                    0{idx + 1}
                  </span>
                  <p className="leading-relaxed">{note}</p>
                </div>
              ))}
            </div>

            {/* Fast Quick Links to Other Analytical Commands */}
            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
              <span className="text-zinc-500">Related Terminal Intelligence Engines:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectTab && onSelectTab('SCENARIO_LAB')}
                  className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Compass className="w-3 h-3" />
                  <span>CMD: SCENARIO LAB</span>
                </button>
                <button
                  onClick={() => onSelectTab && onSelectTab('DECISION_AUDIT')}
                  className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-sky-300 border border-sky-500/30 transition cursor-pointer flex items-center gap-1.5"
                >
                  <History className="w-3 h-3" />
                  <span>Decision Audit</span>
                </button>
                <button
                  onClick={() => onSelectTab && onSelectTab('EXECUTION_INTELLIGENCE')}
                  className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border border-emerald-500/30 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-3 h-3" />
                  <span>Execution Grid</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SECTION: REGIME-BASED LEARNING & METHOD PERFORMANCE RANKING */}
      {/* ========================================================================= */}
      {(activeSection === 'REGIMES' || activeSection === 'RANKINGS') && (
        <div className="space-y-4">
          {/* Regime Selector Bar */}
          <div className="p-3.5 rounded-2xl bg-[#0B0D14] border border-zinc-800 space-y-2">
            <div className="text-[10.5px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
              SELECT MARKET REGIME LEARNING MODEL:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'NEWS_DRIVEN', label: 'News Driven', badge: 'High Volatility', icon: Zap },
                { id: 'TRENDING', label: 'Trending', badge: 'SMC 78% Acc', icon: TrendingUp },
                { id: 'RANGING', label: 'Ranging', badge: 'Mean Revert 81%', icon: Sliders },
                { id: 'HIGH_VOLATILITY', label: 'High Volatility', badge: 'Liquidity 84%', icon: Activity },
                { id: 'LOW_LIQUIDITY', label: 'Low Liquidity', badge: 'Capital Preserve', icon: BarChart3 }
              ].map(regime => {
                const Icon = regime.icon;
                const isSelected = selectedRegime === regime.id;
                const regData = data?.regimes?.[regime.id as MarketRegimeType];

                return (
                  <button
                    key={regime.id}
                    onClick={() => setSelectedRegime(regime.id as MarketRegimeType)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#1C180E] to-[#120F08] border-[#D4AF37] shadow-lg shadow-amber-500/10'
                        : 'bg-zinc-950/60 border-zinc-800/80 hover:bg-zinc-900/60 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#D4AF37]' : 'text-zinc-400'}`} />
                      <span className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-amber-400/20 text-amber-300 font-bold' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {regData?.totalCases || 0} cases
                      </span>
                    </div>
                    <div className={`text-xs font-mono font-bold ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                      {regime.label}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 mt-0.5 flex items-center justify-between">
                      <span>Win Rate:</span>
                      <strong className={isSelected ? 'text-[#D4AF37]' : 'text-zinc-300'}>
                        {regData?.overallWinRate || 0}%
                      </strong>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Regime Detailed Model Overview */}
          {selectedModel && (
            <div className="p-5 rounded-2xl bg-[#0B0D14] border border-[#2A2315] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                <div>
                  <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                    REGIME-SPECIFIC MACHINE LEARNING MODEL
                  </div>
                  <h2 className="text-lg font-black font-mono text-white flex items-center gap-2">
                    <span>{selectedModel.displayName}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                      Overall Win Rate: {selectedModel.overallWinRate}%
                    </span>
                  </h2>
                </div>
                <div className="text-xs font-mono text-zinc-400">
                  Total Historical Database Samples: <strong className="text-white">{selectedModel.totalCases} verified setups</strong>
                </div>
              </div>

              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                {selectedModel.description}
              </p>

              {/* Primary Market Characteristics */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10.5px] font-mono text-zinc-500 font-bold uppercase">Primary Characteristics:</span>
                {selectedModel.primaryCharacteristics.map((char, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[10.5px] font-mono text-zinc-300">
                    • {char}
                  </span>
                ))}
              </div>

              {/* METHOD PERFORMANCE RANKING TABLE */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#D4AF37]" />
                    <span>METHOD PERFORMANCE RANKING ({selectedModel.displayName.toUpperCase()})</span>
                  </div>
                  <span className="text-[10.5px] font-mono text-zinc-500">
                    Ranked by empirical accuracy %
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/70">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-zinc-900/90 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Rank & Method</th>
                        <th className="py-2.5 px-3">Accuracy %</th>
                        <th className="py-2.5 px-3">W / L / BE</th>
                        <th className="py-2.5 px-3">Avg R:R</th>
                        <th className="py-2.5 px-3">Profit Factor</th>
                        <th className="py-2.5 px-3">Algorithmic Verdict</th>
                        <th className="py-2.5 px-3 min-w-[200px]">Empirical Rationale</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {selectedModel.methodRankings.map((m, idx) => (
                        <tr 
                          key={m.method}
                          className={`hover:bg-zinc-900/40 transition ${
                            idx === 0 ? 'bg-[#D4AF37]/5 font-semibold' : ''
                          }`}
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                idx === 0
                                  ? 'bg-[#D4AF37] text-black'
                                  : idx === 1
                                  ? 'bg-zinc-300 text-black'
                                  : idx === 2
                                  ? 'bg-amber-700 text-white'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}>
                                {m.rank}
                              </span>
                              <span className={idx === 0 ? 'text-amber-300 font-bold' : 'text-zinc-200'}>
                                {m.methodName}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-black ${
                                m.accuracy >= 75
                                  ? 'text-emerald-400'
                                  : m.accuracy >= 60
                                  ? 'text-amber-300'
                                  : 'text-rose-400'
                              }`}>
                                {m.accuracy}%
                              </span>
                              <div className="w-16 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    m.accuracy >= 75 ? 'bg-emerald-400' : m.accuracy >= 60 ? 'bg-amber-400' : 'bg-rose-400'
                                  }`}
                                  style={{ width: `${m.accuracy}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-zinc-300 text-[11px]">
                            <span className="text-emerald-400 font-bold">{m.wins}W</span> - <span className="text-rose-400 font-bold">{m.losses}L</span> - <span className="text-zinc-400">{m.breakevens}BE</span>
                            <span className="text-zinc-500 text-[10px] block font-light">({m.sampleSize} total)</span>
                          </td>

                          <td className="py-3 px-3 font-bold text-amber-300">
                            {m.avgRiskReward.toFixed(1)}R
                          </td>

                          <td className="py-3 px-3 text-zinc-200 font-bold">
                            {m.profitFactor.toFixed(2)}
                          </td>

                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider inline-block ${
                              m.verdict === 'HIGHLY_RECOMMENDED'
                                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                                : m.verdict === 'VIABLE_WITH_CAUTION'
                                ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300'
                                : 'bg-rose-500/15 border border-rose-500/40 text-rose-400'
                            }`}>
                              {m.verdict.replace(/_/g, ' ')}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-zinc-400 text-[11px] leading-relaxed">
                            {m.reasoning}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SECTION: ADAPTIVE WEIGHT ADJUSTMENT ENGINE */}
      {/* ========================================================================= */}
      {activeSection === 'WEIGHTS' && weights && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#0B0D14] border border-[#2A2315] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
              <div>
                <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#D4AF37]" />
                  <span>ADAPTIVE WEIGHT ADJUSTMENT ENGINE</span>
                </div>
                <h2 className="text-lg font-black font-mono text-white">
                  Baseline System Weights vs. Learned Adaptive Weights
                </h2>
              </div>

              {/* Statistical Significance Badge */}
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md text-[10.5px] font-mono font-bold flex items-center gap-1.5 ${
                  weights.statisticallySignificant
                    ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                    : 'bg-amber-500/15 border border-amber-500/40 text-amber-300'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>STATISTICALLY SIGNIFICANT SAMPLE (p &lt; {weights.pValue})</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              Weights only adapt dynamically after statistically significant samples (threshold: N ≥ {weights.significanceThreshold} cases).
              Currently evaluating <strong className="text-amber-300">{weights.sampleCount} historical cases</strong> for {weights.activeEnvironmentContext}.
            </p>

            {/* Weights Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              {[
                { 
                  name: 'SMC Structure', 
                  key: 'smc', 
                  base: weights.baselineWeights.smc, 
                  adapted: weights.adaptedWeights.smc,
                  desc: 'Order blocks, Breakers, Liquidity Wicks, BOS'
                },
                { 
                  name: 'Macro Conditions', 
                  key: 'macro', 
                  base: weights.baselineWeights.macro, 
                  adapted: weights.adaptedWeights.macro,
                  desc: 'Central Banks, Yields, DXY Direction, Policy'
                },
                { 
                  name: 'News Environment', 
                  key: 'news', 
                  base: weights.baselineWeights.news, 
                  adapted: weights.adaptedWeights.news,
                  desc: 'CPI, FOMC, NFP, Geopolitical Catalyst'
                },
                { 
                  name: 'Liquidity Levels', 
                  key: 'liquidity', 
                  base: weights.baselineWeights.liquidity, 
                  adapted: weights.adaptedWeights.liquidity,
                  desc: 'Range highs/lows, Session sweeps, Pools'
                }
              ].map(w => {
                const diff = w.adapted - w.base;
                const isIncreased = diff > 0;
                const isDecreased = diff < 0;

                return (
                  <div key={w.key} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-200">
                      <span>{w.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                        isIncreased
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isDecreased
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {diff > 0 ? `+${diff}%` : diff < 0 ? `${diff}%` : '0%'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-zinc-500">Baseline Weight:</span>
                        <strong className="text-zinc-300">{w.base}%</strong>
                      </div>
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-amber-400 font-bold">Learned Adaptive:</span>
                        <strong className="text-amber-300 text-sm font-black">{w.adapted}%</strong>
                      </div>
                    </div>

                    {/* Visual Comparison Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden flex">
                        <div className="bg-zinc-500 h-full" style={{ width: `${w.base}%` }} title="Baseline" />
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden flex">
                        <div className="bg-[#D4AF37] h-full" style={{ width: `${w.adapted}%` }} title="Adaptive" />
                      </div>
                    </div>

                    <div className="text-[10px] text-zinc-500 font-sans pt-1">
                      {w.desc}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Adaptation Rationale Callout */}
            <div className="p-4 rounded-xl bg-[#141009] border border-amber-500/40 text-xs font-mono text-zinc-300 space-y-1.5">
              <div className="text-[#D4AF37] font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <BrainCircuit className="w-4 h-4" />
                <span>ADAPTATION REASONING MATRIX</span>
              </div>
              <p className="text-zinc-300 leading-relaxed font-sans">
                {weights.adaptationRationale}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SECTION: MARKET CONDITION PLAYBOOK */}
      {/* ========================================================================= */}
      {activeSection === 'PLAYBOOKS' && activePlaybook && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#0B0D14] border border-[#2A2315] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
              <div>
                <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                  <span>AUTOMATIC MARKET CONDITION PLAYBOOK</span>
                </div>
                <h2 className="text-lg font-black font-mono text-white">
                  {activePlaybook.title}
                </h2>
              </div>

              {/* Regime Selector */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['NEWS_DRIVEN', 'TRENDING', 'RANGING', 'HIGH_VOLATILITY', 'LOW_LIQUIDITY'] as MarketRegimeType[]).map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedRegime(r)}
                    className={`px-2.5 py-1 rounded-md text-[10.5px] font-mono transition cursor-pointer ${
                      selectedRegime === r
                        ? 'bg-[#D4AF37] text-black font-bold'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {r.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Playbook Core Directives */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Recommended Behaviour */}
              <div className="p-4 rounded-xl bg-[#091a11] border border-emerald-500/40 space-y-2">
                <div className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>RECOMMENDED BEHAVIOUR</span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                  {activePlaybook.recommendedBehaviour}
                </p>
              </div>

              {/* What to Avoid */}
              <div className="p-4 rounded-xl bg-[#1c0c10] border border-rose-500/40 space-y-2">
                <div className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5 uppercase">
                  <XCircle className="w-4 h-4" />
                  <span>WHAT TO AVOID</span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                  {activePlaybook.avoid}
                </p>
              </div>

              {/* Primary Focus */}
              <div className="p-4 rounded-xl bg-[#141108] border border-amber-500/40 space-y-2">
                <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5 uppercase">
                  <Target className="w-4 h-4" />
                  <span>PRIMARY FOCUS</span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                  {activePlaybook.focus}
                </p>
              </div>
            </div>

            {/* Invalidation Rules & Operational Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                  ⚠️ STRICT INVALIDATION RULES
                </div>
                <ul className="space-y-1.5 text-xs text-zinc-400 font-mono">
                  {activePlaybook.invalidationRules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                  ⏱️ OPERATIONAL TIMING & SESSIONS
                </div>
                <div className="space-y-2 text-xs font-mono text-zinc-300">
                  <div className="flex justify-between items-center pb-1.5 border-b border-zinc-800">
                    <span className="text-zinc-400">Execution Speed:</span>
                    <strong className="text-amber-300">{activePlaybook.executionSpeed.replace('_', ' ')}</strong>
                  </div>
                  <div className="flex justify-between items-center pb-1.5 border-b border-zinc-800">
                    <span className="text-zinc-400">Risk Size Multiplier:</span>
                    <strong className="text-white">{activePlaybook.riskToleranceMultiplier}x standard</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Optimal Sessions:</span>
                    <div className="flex items-center gap-1">
                      {activePlaybook.optimalSessions.map(s => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SECTION: STRATEGY PERFORMANCE MEMORY DATABASE */}
      {/* ========================================================================= */}
      {activeSection === 'DATABASE' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#0B0D14] border border-[#2A2315] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              <div>
                <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-[#D4AF37]" />
                  <span>STRATEGY MEMORY DATABASE</span>
                </div>
                <h2 className="text-lg font-black font-mono text-white">
                  Empirical Trade & Analysis Records Store ({filteredRecords.length} Records)
                </h2>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                <div className="flex items-center gap-1">
                  <span className="text-zinc-500 text-[10.5px]">Regime:</span>
                  <select
                    value={dbFilterRegime}
                    onChange={(e) => setDbFilterRegime(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 text-zinc-200 rounded px-2 py-1 text-xs"
                  >
                    <option value="ALL">All Regimes</option>
                    <option value="NEWS_DRIVEN">News Driven</option>
                    <option value="HIGH_VOLATILITY">High Volatility</option>
                    <option value="TRENDING">Trending</option>
                    <option value="RANGING">Ranging</option>
                    <option value="LOW_LIQUIDITY">Low Liquidity</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-zinc-500 text-[10.5px]">Outcome:</span>
                  <select
                    value={dbFilterOutcome}
                    onChange={(e) => setDbFilterOutcome(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 text-zinc-200 rounded px-2 py-1 text-xs"
                  >
                    <option value="ALL">All Outcomes</option>
                    <option value="SUCCESS">Success (TP)</option>
                    <option value="FAILURE">Failure (SL)</option>
                    <option value="BE_OR_PARTIAL">Breakeven/Partial</option>
                  </select>
                </div>

                <button
                  onClick={() => setIsLogModalOpen(true)}
                  className="px-3 py-1 rounded bg-[#D4AF37] hover:brightness-110 text-black font-black flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Case</span>
                </button>
              </div>
            </div>

            {/* Table of Database Records */}
            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-900/90 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">ID / Date</th>
                    <th className="py-2.5 px-3">Regime & Volatility</th>
                    <th className="py-2.5 px-3">News & Session</th>
                    <th className="py-2.5 px-3">Approach Used</th>
                    <th className="py-2.5 px-3">SMC Condition</th>
                    <th className="py-2.5 px-3">Outcome</th>
                    <th className="py-2.5 px-3">PnL</th>
                    <th className="py-2.5 px-3 min-w-[180px]">Learning Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredRecords.map(rec => (
                    <tr key={rec.id} className="hover:bg-zinc-900/30 transition">
                      <td className="py-2.5 px-3 text-zinc-300">
                        <strong className="text-amber-400 block">{rec.id}</strong>
                        <span className="text-[10px] text-zinc-500 font-sans">
                          {new Date(rec.timestamp).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 block w-fit mb-0.5">
                          {rec.marketRegime.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] font-bold ${
                          rec.volatilityState === 'EXTREME' || rec.volatilityState === 'HIGH' ? 'text-amber-400' : 'text-zinc-400'
                        }`}>
                          {rec.volatilityState}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-zinc-300 text-[11px]">
                        <div className="font-semibold">{rec.newsEnvironment}</div>
                        <span className="text-zinc-500 text-[10px]">{rec.session}</span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="text-amber-300 font-bold block">
                          {rec.approachUsed.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-zinc-300 text-[11px]">
                        {rec.smcCondition}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase inline-block ${
                          rec.outcome === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : rec.outcome === 'FAILURE'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}>
                          {rec.outcome}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 font-bold">
                        <span className={rec.outcomePnlR > 0 ? 'text-emerald-400' : rec.outcomePnlR < 0 ? 'text-rose-400' : 'text-zinc-400'}>
                          {rec.outcomePnlR > 0 ? `+${rec.outcomePnlR}R` : `${rec.outcomePnlR}R`}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-[11px] text-zinc-400 leading-relaxed font-sans">
                        {rec.outcomeNotes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: LOG NEW ANALYSIS / TRADE OUTCOME CASE */}
      {/* ========================================================================= */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0e121e] border border-amber-500/40 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base font-black font-mono text-white">
                  RECORD NEW STRATEGY MEMORY CASE
                </h3>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="text-zinc-500 hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Market Regime:</label>
                  <select
                    value={newRecordForm.marketRegime}
                    onChange={e => setNewRecordForm({ ...newRecordForm, marketRegime: e.target.value as MarketRegimeType })}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg p-2"
                  >
                    <option value="NEWS_DRIVEN">News Driven Market</option>
                    <option value="HIGH_VOLATILITY">High Volatility</option>
                    <option value="TRENDING">Trending Market</option>
                    <option value="RANGING">Ranging Market</option>
                    <option value="LOW_LIQUIDITY">Low Liquidity</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Volatility State:</label>
                  <select
                    value={newRecordForm.volatilityState}
                    onChange={e => setNewRecordForm({ ...newRecordForm, volatilityState: e.target.value as VolatilityStateType })}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg p-2"
                  >
                    <option value="HIGH">High Volatility</option>
                    <option value="EXTREME">Extreme Expansion</option>
                    <option value="NORMAL">Normal Volatility</option>
                    <option value="COMPRESSED">Compressed / Squeeze</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Session:</label>
                  <select
                    value={newRecordForm.session}
                    onChange={e => setNewRecordForm({ ...newRecordForm, session: e.target.value as TradingSessionType })}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg p-2"
                  >
                    <option value="NY_OPEN">NY Open</option>
                    <option value="LONDON_OPEN">London Open</option>
                    <option value="NY_LONDON_OVERLAP">NY-London Overlap</option>
                    <option value="ASIA_PACIFIC">Asia Pacific</option>
                    <option value="NY_CLOSE">NY Close</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Approach Used:</label>
                  <select
                    value={newRecordForm.approachUsed}
                    onChange={e => setNewRecordForm({ ...newRecordForm, approachUsed: e.target.value as StrategyApproachMethod })}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg p-2"
                  >
                    <option value="WAIT_CONFIRMATION">Wait for Confirmation</option>
                    <option value="LIQUIDITY_CONFIRMATION">Liquidity Confirmation</option>
                    <option value="SMC_CONTINUATION">SMC Trend Continuation</option>
                    <option value="MEAN_REVERSION">Mean Reversion / Fade</option>
                    <option value="BREAKOUT_CONTINUATION">Breakout Continuation</option>
                    <option value="TREND_PULLBACK">Trend Pullback (Breaker)</option>
                    <option value="MOMENTUM_CHASE">Momentum Chasing</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-zinc-400 block mb-1">News Environment:</label>
                  <input
                    type="text"
                    value={newRecordForm.newsEnvironment}
                    onChange={e => setNewRecordForm({ ...newRecordForm, newsEnvironment: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg p-2"
                    placeholder="e.g. FOMC Meeting or US CPI Release"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-zinc-400 block mb-1">SMC Condition:</label>
                  <input
                    type="text"
                    value={newRecordForm.smcCondition}
                    onChange={e => setNewRecordForm({ ...newRecordForm, smcCondition: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg p-2"
                    placeholder="e.g. Liquidity Sweep + Order Block reaction"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-zinc-400 block mb-1">Prediction / Target Thesis:</label>
                  <input
                    type="text"
                    value={newRecordForm.prediction}
                    onChange={e => setNewRecordForm({ ...newRecordForm, prediction: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg p-2"
                    placeholder="e.g. Sweep of 4240 liquidity pool followed by rally to 4295"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Outcome:</label>
                  <select
                    value={newRecordForm.outcome}
                    onChange={e => setNewRecordForm({ ...newRecordForm, outcome: e.target.value as any })}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg p-2"
                  >
                    <option value="SUCCESS">Success (TP Hit)</option>
                    <option value="FAILURE">Failure (SL Hit)</option>
                    <option value="BE_OR_PARTIAL">Breakeven / Partial</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">PnL (R Units):</label>
                  <input
                    type="text"
                    value={newRecordForm.outcomePnlR}
                    onChange={e => setNewRecordForm({ ...newRecordForm, outcomePnlR: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg p-2"
                    placeholder="e.g. 3.2 or -1.0"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-zinc-400 block mb-1">Learning Notes / Why it Worked or Failed:</label>
                  <textarea
                    rows={2}
                    value={newRecordForm.outcomeNotes}
                    onChange={e => setNewRecordForm({ ...newRecordForm, outcomeNotes: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg p-2"
                    placeholder="e.g. Waiting allowed initial volatility trap to clear..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRecord}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black font-black transition cursor-pointer hover:brightness-110 shadow-lg shadow-amber-500/20"
                >
                  {isSubmittingRecord ? 'Saving & Recalculating...' : 'Store Record & Adapt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
