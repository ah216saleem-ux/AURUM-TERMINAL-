import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  Activity, 
  TrendingUp, 
  Gauge, 
  ShieldCheck, 
  Layers, 
  Zap, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Crosshair, 
  Copy, 
  Check, 
  BarChart3, 
  Brain, 
  Radio, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight, 
  Sliders, 
  Compass,
  AlertCircle,
  Eye,
  RefreshCw,
  Info
} from 'lucide-react';
import { MarketItem } from '../types';
import { useMarket } from '../context/MarketContext';
import { getPaperTradeRecords } from '../data/paperTradingTracker';
import { 
  masterIntelligenceService, 
  MASTER_SUPPORTED_ASSET_IDS, 
  MASTER_ASSET_METADATA 
} from '../services/masterIntelligenceService';
import { 
  EngineType, 
  RecommendedTradingMode, 
  AssetMasterIntelligence 
} from '../types/masterIntelligenceTypes';

type MasterSubTab = 
  | 'OVERVIEW'
  | 'ENGINES'
  | 'REGIMES'
  | 'QUALITY_SCORES'
  | 'ASSET_MATRIX'
  | 'SESSIONS'
  | 'TRADE_MEMORY'
  | 'RISK_LAYER'
  | 'FORMATTED_OUTPUT';

interface MasterIntelligenceViewProps {
  onSelectAsset?: (assetId: string) => void;
}

export const MasterIntelligenceView: React.FC<MasterIntelligenceViewProps> = ({ onSelectAsset }) => {
  const { markets, selectedMarket } = useMarket();
  const [activeTab, setActiveTab] = useState<MasterSubTab>('OVERVIEW');
  const [selectedAssetId, setSelectedAssetId] = useState<string>(selectedMarket?.id || 'xau-usd');
  const [copied, setCopied] = useState<boolean>(false);
  const [tickCounter, setTickCounter] = useState<number>(0);

  const prices = useMemo(() => {
    const map: Record<string, number> = {};
    markets.forEach(m => {
      map[m.id] = m.price;
      map[m.symbol] = m.price;
    });
    return map;
  }, [markets]);

  // Read paper trades
  const paperTrades = useMemo(() => {
    return getPaperTradeRecords();
  }, [tickCounter]);

  // Master Decision computation
  const masterDecision = useMemo(() => {
    return masterIntelligenceService.generateMasterDecision(markets, prices);
  }, [markets, prices, tickCounter]);

  // Engine Performance Metrics
  const engineRankings = useMemo(() => {
    return masterIntelligenceService.analyzeEnginePerformance(paperTrades);
  }, [paperTrades]);

  // All 9 Assets Intelligence
  const assetIntelligenceList = useMemo(() => {
    return masterIntelligenceService.analyzeAllAssets(markets, prices);
  }, [markets, prices]);

  // Selected asset detail
  const selectedAsset = useMemo(() => {
    return (
      assetIntelligenceList.find(a => a.assetId === selectedAssetId) ||
      assetIntelligenceList[0] ||
      null
    );
  }, [assetIntelligenceList, selectedAssetId]);

  // Session Intelligence
  const sessions = useMemo(() => {
    return masterIntelligenceService.analyzeSessions();
  }, []);

  // Trade Memory Patterns
  const memoryPatterns = useMemo(() => {
    return masterIntelligenceService.extractTradeMemoryPatterns(paperTrades);
  }, [paperTrades]);

  // Risk Intelligence
  const riskStatus = useMemo(() => {
    return masterIntelligenceService.analyzeRiskIntelligence(paperTrades);
  }, [paperTrades]);

  // Handle Copy of Section 10 Output
  const handleCopyStatus = () => {
    navigator.clipboard.writeText(masterDecision.statusFormattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleAssetClick = (assetId: string) => {
    setSelectedAssetId(assetId);
    if (onSelectAsset) {
      onSelectAsset(assetId);
    }
  };

  return (
    <div id="master-intelligence-view" className="space-y-6 text-white pb-16">
      {/* Top Banner: Master Intelligence Status Bar */}
      <div 
        id="master-status-header" 
        className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-5 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
                AURUM TERMINAL • MASTER PERFORMANCE INTELLIGENCE
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ADAPTIVE INTELLIGENCE ACTIVE
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Adaptive Market Intelligence Layer
            </h1>
            <p className="text-xs text-zinc-400">
              Cross-engine performance optimization, real-time regime classification, and 8-dimensional quality scoring across 9 institutional assets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Market Condition Badge */}
            <div className="px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-left">
              <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Condition</div>
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                {masterDecision.marketCondition}
              </div>
            </div>

            {/* Recommended Mode Badge */}
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left">
              <div className="text-[10px] uppercase font-bold text-amber-400/80 tracking-wider">Recommended Mode</div>
              <div className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                {masterDecision.recommendedMode} MODE
              </div>
            </div>

            {/* Risk Level Badge */}
            <div className={`px-3 py-1.5 rounded-xl border text-left ${
              riskStatus.environmentLevel === 'LOW'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : riskStatus.environmentLevel === 'MEDIUM'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Risk Level</div>
              <div className="text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                {riskStatus.environmentLevel}
              </div>
            </div>

            {/* Copy Button */}
            <button
              id="copy-status-btn"
              onClick={handleCopyStatus}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              title="Copy Section 10 Output Format"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Status'}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div id="master-subtabs" className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-800/80">
        {[
          { id: 'OVERVIEW', label: 'Master Pipeline', icon: Compass },
          { id: 'ENGINES', label: 'Engine Rankings', icon: Layers },
          { id: 'REGIMES', label: 'Adaptive Regimes', icon: Activity },
          { id: 'QUALITY_SCORES', label: 'Quality Radar (0-100)', icon: Gauge },
          { id: 'ASSET_MATRIX', label: '9-Asset Matrix', icon: BarChart3 },
          { id: 'SESSIONS', label: 'Session Intelligence', icon: Clock },
          { id: 'TRADE_MEMORY', label: 'AI Trade Memory', icon: Brain },
          { id: 'RISK_LAYER', label: 'Risk Intelligence', icon: ShieldCheck },
          { id: 'FORMATTED_OUTPUT', label: 'Status Report', icon: Copy },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`master-tab-${tab.id.toLowerCase()}`}
              onClick={() => setActiveTab(tab.id as MasterSubTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-bold'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & MASTER DECISION FLOW */}
      {activeTab === 'OVERVIEW' && (
        <div id="tab-overview-content" className="space-y-6">
          {/* Top Opportunity Highlight Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Institutional Opportunity</h3>
                    <p className="text-xs text-zinc-400">Determined via 8-step Master Decision Flow</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-xs font-black rounded-lg ${
                    masterDecision.topOpportunity.direction === 'BUY'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : masterDecision.topOpportunity.direction === 'SELL'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {masterDecision.topOpportunity.direction}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {masterDecision.topOpportunity.bestEngineName}
                  </span>
                </div>
              </div>

              {/* Asset & Execution Parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Asset</div>
                  <div className="text-sm font-black text-white">{masterDecision.topOpportunity.symbol}</div>
                  <div className="text-[10px] text-zinc-400 truncate">{masterDecision.topOpportunity.asset}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Quality Score</div>
                  <div className="text-sm font-black text-amber-400">{masterDecision.topOpportunity.entryQualityScore}/100</div>
                  <div className="text-[10px] text-zinc-400">Confidence: {masterDecision.topOpportunity.confidence}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Risk Level</div>
                  <div className={`text-sm font-black ${
                    masterDecision.topOpportunity.riskLevel === 'LOW' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {masterDecision.topOpportunity.riskLevel}
                  </div>
                  <div className="text-[10px] text-zinc-400">{masterDecision.topOpportunity.riskReward} R:R Target</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Action Gate</div>
                  <div className={`text-sm font-black ${
                    masterDecision.topOpportunity.isWait ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {masterDecision.topOpportunity.isWait ? 'WAIT MODE' : 'EXECUTE'}
                  </div>
                  <div className="text-[10px] text-zinc-400">Institutional Filter</div>
                </div>
              </div>

              {/* Targets strip if active */}
              {!masterDecision.topOpportunity.isWait && (
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800">
                    <span className="text-zinc-500 block text-[10px]">Entry Price</span>
                    <span className="font-bold text-white">{masterDecision.topOpportunity.entryPrice}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-rose-500/5 border border-rose-500/20">
                    <span className="text-rose-400 block text-[10px]">Stop Loss</span>
                    <span className="font-bold text-rose-300">{masterDecision.topOpportunity.stopLoss}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <span className="text-emerald-400 block text-[10px]">Take Profit 1</span>
                    <span className="font-bold text-emerald-300">{masterDecision.topOpportunity.tp1}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <span className="text-emerald-400 block text-[10px]">Take Profit 2</span>
                    <span className="font-bold text-emerald-300">{masterDecision.topOpportunity.tp2}</span>
                  </div>
                </div>
              )}

              {/* Rationale Quote */}
              <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-200">Decision Rationale: </span>
                  {masterDecision.topOpportunity.reason}
                </div>
              </div>
            </div>

            {/* Live Engine Ranking Summary Widget */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Live Engine Rankings
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono">ADAPTIVE</span>
              </div>

              <div className="space-y-2">
                {engineRankings.map((eng) => (
                  <div
                    key={eng.engine}
                    className={`p-3 rounded-xl border transition-all ${
                      eng.ranking === 1
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-zinc-950/60 border-zinc-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                          eng.ranking === 1 ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-300'
                        }`}>
                          #{eng.ranking}
                        </span>
                        <span className="text-xs font-bold text-zinc-200">{eng.displayName}</span>
                      </div>
                      <span className="text-xs font-black text-amber-400">{eng.winRate}% WR</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Profit Factor: <strong className="text-zinc-200">{eng.profitFactor}</strong></span>
                      <span>Avg R: <strong className="text-emerald-400">+{eng.avgR}R</strong></span>
                      <span>Setups: <strong className="text-zinc-200">{eng.totalSetups}</strong></span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Active Session:</span>
                <strong className="text-amber-400">{sessions.find(s => s.status === 'ACTIVE')?.displayName || 'Standard Hours'}</strong>
              </div>
            </div>
          </div>

          {/* Section 9: Master Decision Flow Pipeline Steps */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  Master Decision Flow (8-Gate Verification)
                </h3>
                <p className="text-xs text-zinc-400">
                  Live Market Data → Regime Detection → Engine Performance → Mode Recommendation → Quality Score → AI Validation → Risk Check → Action
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" /> All Gates Synced
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {masterDecision.decisionFlow.map((step) => {
                const isPassed = step.status === 'PASSED';
                const isWarning = step.status === 'WARNING';
                const isBlocked = step.status === 'BLOCKED';

                return (
                  <div 
                    key={step.stepNumber}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 ${
                      isPassed
                        ? 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                        : isWarning
                        ? 'bg-amber-500/5 border-amber-500/30'
                        : 'bg-rose-500/5 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-black flex items-center justify-center">
                          {step.stepNumber}
                        </span>
                        <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wide truncate">
                          {step.name}
                        </span>
                      </div>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                        isPassed ? 'bg-emerald-500/10 text-emerald-400' : isWarning ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {step.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] text-zinc-500 truncate">{step.input}</div>
                      <div className="text-xs font-bold text-zinc-200">{step.output}</div>
                      <div className="text-[11px] text-zinc-400 line-clamp-2">{step.detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-ENGINE PERFORMANCE COMPARISON */}
      {activeTab === 'ENGINES' && (
        <div id="tab-engines-content" className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Multi-Engine Performance Intelligence & Rankings
            </h3>
            <p className="text-xs text-zinc-400">
              Direct comparison between Scalping, Intraday Gann, and Quantum Swing engines using verified paper trade execution statistics.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {engineRankings.map((eng) => (
              <div 
                key={eng.engine}
                className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 ${
                  eng.ranking === 1
                    ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-zinc-900/90 to-zinc-950 shadow-xl'
                    : 'border-zinc-800 bg-zinc-900/70'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 text-xs font-black rounded-lg ${
                      eng.ranking === 1 ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      RANK #{eng.ranking}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">{eng.executionTimeframe}</span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">{eng.displayName}</h4>
                    <div className="text-xs text-amber-400/90 font-medium">{eng.badge}</div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                    <div>
                      <div className="text-[10px] uppercase text-zinc-500 font-bold">Win Rate</div>
                      <div className="text-lg font-black text-amber-400">{eng.winRate}%</div>
                      <div className="text-[10px] text-zinc-400">{eng.approvedSignals} closed trades</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-zinc-500 font-bold">Profit Factor</div>
                      <div className="text-lg font-black text-white">{eng.profitFactor}</div>
                      <div className="text-[10px] text-emerald-400">Avg R: +{eng.avgR}R</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-zinc-500 font-bold">Max Drawdown</div>
                      <div className="text-sm font-bold text-rose-400">{eng.maxDrawdown}R</div>
                      <div className="text-[10px] text-zinc-400">Total Setups: {eng.totalSetups}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-zinc-500 font-bold">Score</div>
                      <div className="text-sm font-bold text-amber-300">{eng.recommendationScore}/100</div>
                      <div className="text-[10px] text-zinc-400">Adaptive Ranking</div>
                    </div>
                  </div>

                  {/* Best Conditions */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Best Market Conditions
                    </div>
                    <ul className="text-xs text-zinc-300 space-y-1 pl-1">
                      {eng.bestConditions.map((cond, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 mt-0.5">•</span>
                          <span>{cond}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Failure Patterns */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Failure Patterns (To Avoid)
                    </div>
                    <ul className="text-xs text-zinc-400 space-y-1 pl-1">
                      {eng.failurePatterns.map((pat, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-400 mt-0.5">•</span>
                          <span>{pat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('ASSET_MATRIX');
                  }}
                  className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all border border-zinc-700"
                >
                  View Supported Assets for {eng.displayName}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ADAPTIVE MARKET REGIMES */}
      {activeTab === 'REGIMES' && (
        <div id="tab-regimes-content" className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Adaptive Market Regime Classification (7 Regimes)
            </h3>
            <p className="text-xs text-zinc-400">
              Real-time classification based on institutional Price Structure, ATR Volatility Percentiles, 24h Momentum, and Liquidity Expansion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                key: 'STRONG_TREND',
                label: 'Strong Trend',
                mode: 'INTRADAY',
                engine: 'Intraday Gann Engine',
                desc: 'Clean higher highs/lower lows with sustained pro-trend displacement. Follow Order Block mitigations & Gann Fan 1x1.',
                activeCount: assetIntelligenceList.filter(a => a.regime === 'STRONG_TREND').length
              },
              {
                key: 'WEAK_TREND',
                label: 'Weak Trend',
                mode: 'INTRADAY',
                engine: 'Intraday Gann Engine',
                desc: 'Directional drift with deep pullbacks. Wait for 61.8% Gann / Fibonacci retracements before entry.',
                activeCount: assetIntelligenceList.filter(a => a.regime === 'WEAK_TREND').length
              },
              {
                key: 'RANGE_MARKET',
                label: 'Range Market',
                mode: 'SCALPING',
                engine: 'Scalping Engine',
                desc: 'Equilibrium oscillation between 24h high/low boundaries. Fade boundary sweeps with tight stops.',
                activeCount: assetIntelligenceList.filter(a => a.regime === 'RANGE_MARKET').length
              },
              {
                key: 'HIGH_VOLATILITY',
                label: 'High Volatility',
                mode: 'SCALPING',
                engine: 'Scalping Engine',
                desc: 'ATR expansion >140%. Rapid price travel enables quick target hits, but requires calibrated stop buffers.',
                activeCount: assetIntelligenceList.filter(a => a.regime === 'HIGH_VOLATILITY').length
              },
              {
                key: 'LOW_VOLATILITY',
                label: 'Low Volatility',
                mode: 'WAIT',
                engine: 'WAIT MODE',
                desc: 'ATR compression <65%. Low volume accumulation. Strict WAIT directive to avoid choppy false breaks.',
                activeCount: assetIntelligenceList.filter(a => a.regime === 'LOW_VOLATILITY').length
              },
              {
                key: 'LIQUIDITY_EXPANSION',
                label: 'Liquidity Expansion',
                mode: 'SCALPING',
                engine: 'Scalping Engine',
                desc: 'Breakout from range boundaries accompanied by expanding tick volume and FVG creation.',
                activeCount: assetIntelligenceList.filter(a => a.regime === 'LIQUIDITY_EXPANSION').length
              },
              {
                key: 'RISK_OFF_ENVIRONMENT',
                label: 'Risk-Off Environment',
                mode: 'SWING',
                engine: 'Quantum Swing Engine',
                desc: 'Safe-haven capital inflows (Gold, Silver, JPY) while equity indices decline. Macro flight to safety.',
                activeCount: assetIntelligenceList.filter(a => a.regime === 'RISK_OFF_ENVIRONMENT').length
              }
            ].map((reg) => {
              const isDominant = masterDecision.marketCondition.toLowerCase() === reg.label.toLowerCase();
              return (
                <div
                  key={reg.key}
                  className={`p-4 rounded-2xl border space-y-3 ${
                    isDominant
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-lg'
                      : 'bg-zinc-900/60 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white uppercase tracking-wider">{reg.label}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isDominant ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {reg.activeCount} ASSETS
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">{reg.desc}</p>

                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Mode: <strong className="text-amber-400">{reg.mode}</strong></span>
                    <span className="text-zinc-400">{reg.engine}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: UNIFIED TRADE QUALITY SCORES (0-100) */}
      {activeTab === 'QUALITY_SCORES' && (
        <div id="tab-quality-content" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Gauge className="w-4 h-4 text-amber-400" />
                Unified Trade Quality Score (0-100 Radar)
              </h3>
              <p className="text-xs text-zinc-400">
                Mathematical evaluation across 8 institutional dimensions. Only setups scoring ≥82 points pass the execution gate.
              </p>
            </div>

            {/* Asset Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Select Asset:</span>
              <select
                id="quality-asset-select"
                value={selectedAssetId}
                onChange={(e) => handleAssetClick(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
              >
                {assetIntelligenceList.map((a) => (
                  <option key={a.assetId} value={a.assetId}>
                    {a.symbol} ({a.qualityScore.totalScore}/100 • Grade {a.qualityScore.grade})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedAsset && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overall Score Badge */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  {selectedAsset.symbol} Quality Score
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="w-36 h-36 rounded-full border-4 border-zinc-800 flex flex-col items-center justify-center bg-zinc-950">
                    <span className="text-4xl font-black text-amber-400">
                      {selectedAsset.qualityScore.totalScore}
                    </span>
                    <span className="text-xs font-bold text-zinc-400">/ 100</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className={`text-lg font-black ${
                    selectedAsset.qualityScore.isHighQuality ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    GRADE {selectedAsset.qualityScore.grade}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {selectedAsset.qualityScore.isHighQuality 
                      ? 'Approved for Institutional Execution (≥82 pts)'
                      : 'Below 82-point Quality Gate (WAIT enforced)'}
                  </div>
                </div>

                <div className="w-full pt-4 border-t border-zinc-800 text-xs text-zinc-300">
                  <strong>Direction:</strong> {selectedAsset.currentDirection} | <strong>Mode:</strong> {selectedAsset.recommendedMode}
                </div>
              </div>

              {/* 8-Dimensional Component Breakdown */}
              <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  8-Dimension Mathematical Breakdown
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    { label: '1. Market Structure (20%)', val: selectedAsset.qualityScore.marketStructure, desc: selectedAsset.qualityScore.componentDetails.marketStructureDetail },
                    { label: '2. Liquidity (15%)', val: selectedAsset.qualityScore.liquidity, desc: selectedAsset.qualityScore.componentDetails.liquidityDetail },
                    { label: '3. Momentum (10%)', val: selectedAsset.qualityScore.momentum, desc: selectedAsset.qualityScore.componentDetails.momentumDetail },
                    { label: '4. Gann Alignment (15%)', val: selectedAsset.qualityScore.gannAlignment, desc: selectedAsset.qualityScore.componentDetails.gannDetail },
                    { label: '5. Time Cycle (10%)', val: selectedAsset.qualityScore.timeCycle, desc: selectedAsset.qualityScore.componentDetails.timeCycleDetail },
                    { label: '6. AI Agreement (15%)', val: selectedAsset.qualityScore.aiAgreement, desc: selectedAsset.qualityScore.componentDetails.aiAgreementDetail },
                    { label: '7. News Risk (7.5%)', val: selectedAsset.qualityScore.newsRisk, desc: selectedAsset.qualityScore.componentDetails.newsRiskDetail },
                    { label: '8. Risk Reward (7.5%)', val: selectedAsset.qualityScore.riskReward, desc: selectedAsset.qualityScore.componentDetails.riskRewardDetail },
                  ].map((dim, i) => (
                    <div key={i} className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-300">{dim.label}</span>
                        <span className={`font-black ${
                          dim.val >= 85 ? 'text-emerald-400' : dim.val >= 75 ? 'text-amber-400' : 'text-zinc-400'
                        }`}>
                          {dim.val}/100
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            dim.val >= 85 ? 'bg-emerald-400' : dim.val >= 75 ? 'bg-amber-400' : 'bg-zinc-500'
                          }`}
                          style={{ width: `${dim.val}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">{dim.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: 9-ASSET INTELLIGENCE MATRIX */}
      {activeTab === 'ASSET_MATRIX' && (
        <div id="tab-matrix-content" className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              9 Core Institutional Assets Intelligence Matrix
            </h3>
            <p className="text-xs text-zinc-400">
              Live tracking for Gold, Silver, EUR/USD, GBP/USD, USD/JPY, USD/CAD, S&P 500, NASDAQ 100, and WTI Crude Oil.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Asset</th>
                    <th className="p-3.5">Live Price</th>
                    <th className="p-3.5">24h Change</th>
                    <th className="p-3.5">Market Regime</th>
                    <th className="p-3.5">Best Engine</th>
                    <th className="p-3.5">Best Session</th>
                    <th className="p-3.5">Win Rate</th>
                    <th className="p-3.5">Quality Score</th>
                    <th className="p-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {assetIntelligenceList.map((asset) => (
                    <tr 
                      key={asset.assetId}
                      onClick={() => handleAssetClick(asset.assetId)}
                      className={`hover:bg-zinc-800/40 cursor-pointer transition-all ${
                        selectedAssetId === asset.assetId ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="p-3.5">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {asset.symbol}
                          {selectedAssetId === asset.assetId && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400">{asset.name}</div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-zinc-200">
                        {asset.currentPrice.toFixed(asset.decimals)}
                      </td>
                      <td className="p-3.5">
                        <span className={`font-bold flex items-center gap-0.5 ${
                          asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-medium text-[10px]">
                          {asset.regimeLabel}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-amber-300">
                        {asset.bestEngineName}
                      </td>
                      <td className="p-3.5 text-zinc-400">
                        {asset.bestSession}
                      </td>
                      <td className="p-3.5 font-bold text-zinc-200">
                        {asset.historicalSuccessRate}%
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          asset.qualityScore.isHighQuality
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {asset.qualityScore.totalScore}/100 ({asset.qualityScore.grade})
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                          asset.currentDirection === 'BUY'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : asset.currentDirection === 'SELL'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {asset.currentDirection}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SESSION INTELLIGENCE */}
      {activeTab === 'SESSIONS' && (
        <div id="tab-sessions-content" className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Session Intelligence & Probability Windows
            </h3>
            <p className="text-xs text-zinc-400">
              Institutional probability categorization for London, New York, London/NY Overlap, and Asian sessions with strict avoid zones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessions.map((sess) => {
              const isHigh = sess.probabilityRating === 'HIGHEST';
              const isAvoid = sess.probabilityRating === 'AVOID_ZONE';

              return (
                <div
                  key={sess.sessionKey}
                  className={`p-5 rounded-2xl border space-y-4 ${
                    sess.status === 'ACTIVE'
                      ? 'border-amber-500/40 bg-zinc-900/90 shadow-xl'
                      : 'border-zinc-800 bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{sess.displayName}</h4>
                        {sess.status === 'ACTIVE' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black animate-pulse">
                            ACTIVE NOW
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400">{sess.timeWindowUtc}</div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                      isHigh
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : isAvoid
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {sess.probabilityRating}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
                    <div>
                      <div className="text-[10px] uppercase text-zinc-500 font-bold">Win Rate</div>
                      <div className="text-sm font-black text-amber-400">{sess.historicalWinRate}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-zinc-500 font-bold">Avg R:R</div>
                      <div className="text-sm font-black text-white">+{sess.avgPnlR}R</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-zinc-500 font-bold">Volatility</div>
                      <div className="text-sm font-black text-zinc-300">{sess.volatilityRank}</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-zinc-500">Best Assets: </span>
                      <span className="font-semibold text-zinc-200">{sess.bestAssets.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Strategies: </span>
                      <span className="font-semibold text-zinc-300">{sess.bestStrategies.join(', ')}</span>
                    </div>
                    <p className="text-zinc-400 pt-1 leading-relaxed">{sess.notes}</p>

                    {sess.avoidReason && (
                      <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-1.5 mt-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <div><strong>Avoid Zone Warning:</strong> {sess.avoidReason}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 7: AI LEARNING & TRADE MEMORY */}
      {activeTab === 'TRADE_MEMORY' && (
        <div id="tab-memory-content" className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Brain className="w-4 h-4 text-amber-400" />
              AI Learning & Trade Memory Patterns
            </h3>
            <p className="text-xs text-zinc-400">
              Aggregated pattern recognition extracted from live paper trade execution logs. Identifies repeat winning setups and recurring failure patterns.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Winning Patterns */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Validated Winning Patterns (High Probability)
              </div>

              {memoryPatterns.filter(p => p.type === 'WINNING_PATTERN').map((pat) => (
                <div key={pat.id} className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{pat.name}</h4>
                    <span className="text-xs font-black text-emerald-400">
                      +{pat.impactOnWinRate}% WR
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300">{pat.description}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {pat.conditions.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 text-[10px] border border-zinc-800">
                        {c}
                      </span>
                    ))}
                  </div>

                  <div className="p-2 rounded-lg bg-zinc-950/60 border border-emerald-500/20 text-[11px] text-emerald-300">
                    <strong>Institutional Guidance:</strong> {pat.actionableGuidance}
                  </div>
                </div>
              ))}
            </div>

            {/* Failure Patterns */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" /> Detected Failure Patterns (Risk To Avoid)
              </div>

              {memoryPatterns.filter(p => p.type === 'FAILURE_PATTERN').map((pat) => (
                <div key={pat.id} className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{pat.name}</h4>
                    <span className="text-xs font-black text-rose-400">
                      {pat.impactOnWinRate}% WR
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400">{pat.description}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {pat.conditions.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 text-[10px] border border-zinc-800">
                        {c}
                      </span>
                    ))}
                  </div>

                  <div className="p-2 rounded-lg bg-zinc-950/60 border border-rose-500/20 text-[11px] text-rose-300">
                    <strong>Mitigation Action:</strong> {pat.actionableGuidance}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: RISK INTELLIGENCE LAYER */}
      {activeTab === 'RISK_LAYER' && (
        <div id="tab-risk-content" className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Risk Intelligence Layer & Capital Protection
            </h3>
            <p className="text-xs text-zinc-400">
              Drawdown limits, consecutive loss circuit breakers, volatility risk indexes, and portfolio overexposure monitoring.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 space-y-1">
              <div className="text-[10px] uppercase text-zinc-500 font-bold">Drawdown Status</div>
              <div className="text-xl font-black text-emerald-400">{riskStatus.currentDrawdownPercent}%</div>
              <div className="text-[10px] text-zinc-400">Max threshold: 10.0%</div>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 space-y-1">
              <div className="text-[10px] uppercase text-zinc-500 font-bold">Consecutive Losses</div>
              <div className="text-xl font-black text-white">{riskStatus.consecutiveLosses}</div>
              <div className="text-[10px] text-zinc-400">Circuit breaker at 3 losses</div>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 space-y-1">
              <div className="text-[10px] uppercase text-zinc-500 font-bold">Volatility Risk Index</div>
              <div className="text-xl font-black text-amber-400">{riskStatus.volatilityRiskIndex}/100</div>
              <div className="text-[10px] text-zinc-400">Normal Range: 20-50</div>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 space-y-1">
              <div className="text-[10px] uppercase text-zinc-500 font-bold">Open Exposure</div>
              <div className="text-xl font-black text-zinc-200">{riskStatus.openExposureR.toFixed(1)}R</div>
              <div className="text-[10px] text-zinc-400">{riskStatus.activeTradesCount} / {riskStatus.maxRecommendedTrades} positions active</div>
            </div>
          </div>

          {/* Risk Checks List */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Institutional Risk Gates</h4>
            <div className="space-y-2">
              {riskStatus.riskChecks.map((chk, i) => (
                <div key={i} className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-zinc-200">{chk.name}</div>
                    <div className="text-[11px] text-zinc-400">{chk.detail}</div>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                    chk.status === 'PASS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {chk.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Risk Advice:</strong> {riskStatus.riskAdvice}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: VERBATIM STATUS REPORT (SECTION 10 OUTPUT FORMAT) */}
      {activeTab === 'FORMATTED_OUTPUT' && (
        <div id="tab-report-content" className="space-y-6">
          <div className="flex items-center justify-between p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Copy className="w-4 h-4 text-amber-400" />
                Master Intelligence Status Report (Section 10 Format)
              </h3>
              <p className="text-xs text-zinc-400">
                Verbatim standard output format ready for clipboard export.
              </p>
            </div>

            <button
              onClick={handleCopyStatus}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Report Copied!' : 'Copy to Clipboard'}
            </button>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 font-mono text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed shadow-2xl relative">
            {masterDecision.statusFormattedText}
          </div>
        </div>
      )}
    </div>
  );
};
