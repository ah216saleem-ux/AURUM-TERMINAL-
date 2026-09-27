import React, { useState, useEffect } from 'react';
import { 
  Gauge, 
  Activity, 
  Newspaper, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  Coins, 
  Clock, 
  Compass, 
  BrainCircuit, 
  Sliders, 
  Plus, 
  Search, 
  Lock, 
  Unlock, 
  Terminal, 
  ArrowUpRight, 
  LineChart, 
  BookOpen,
  Sparkles,
  RefreshCw,
  Award,
  Scale
} from 'lucide-react';
import { DecisionAuditView } from './DecisionAuditView';
import { ScenarioSimulationLabView } from './ScenarioSimulationLabView';
import { AdaptiveStrategyMemoryView } from './AdaptiveStrategyMemoryView';

interface ConfirmationBreakdown {
  macro: number;
  smcStructure: number;
  liquidity: number;
  newsRisk: number;
}

interface ConfirmationScore {
  symbol: string;
  assetId: string;
  direction: 'BUY' | 'SELL' | 'WAIT';
  score: number;
  breakdown: ConfirmationBreakdown;
}

interface NewsFilter {
  tradingMode: 'NORMAL' | 'CAUTION';
  signalGeneration: 'NORMAL' | 'REDUCED' | 'LOCKED';
  minutesUntilNextEvent: number;
  nextEventName: string;
  nextEventCategory: string;
  reason: string;
}

interface MarketClassifier {
  condition: 'TRENDING' | 'RANGING' | 'HIGH VOLATILITY' | 'NEWS DRIVEN' | 'LOW LIQUIDITY';
  confidenceMultiplier: number;
  explanation: string;
}

interface FalseSignalAlert {
  warningDetected: boolean;
  warningType: string;
  confidenceImpactPercent: number;
  alertMessage: string;
}

interface SmartEntryTiming {
  assetId: string;
  symbol: string;
  generalBias: string;
  status: 'PENDING' | 'READY' | 'COOLDOWN';
  waitingFor: string;
}

interface JournalRecord {
  id: string;
  date: string;
  eventName: string;
  category: string;
  marketCondition: string;
  newsEnvironment: string;
  prediction: string;
  outcome: 'CORRECT' | 'INCORRECT' | 'PENDING';
  accuracyPercent: number;
  learning: string;
}

interface ConfidenceWeight {
  category: string;
  baseConfidence: number;
  adjustedConfidence: number;
  totalPredictionsCount: number;
  wrongPredictionsCount: number;
  correctPredictionsCount: number;
}

export const ExecutionIntelligenceView: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Core state from API
  const [statusData, setStatusData] = useState<{
    newsFilter: NewsFilter;
    marketClassifier: MarketClassifier;
    confirmationScores: ConfirmationScore[];
    falseSignalDetections: Record<string, FalseSignalAlert>;
    smartEntryTimings: SmartEntryTiming[];
  } | null>(null);

  const [journalData, setJournalData] = useState<{
    journal: JournalRecord[];
    calibrationWeights: Record<string, ConfidenceWeight>;
  } | null>(null);

  // Interactive local states
  const [selectedAsset, setSelectedAsset] = useState<string>('xau-usd');
  const [newPredictionForm, setNewPredictionForm] = useState({
    eventName: '',
    category: 'FOMC',
    marketCondition: 'TRENDING' as any,
    newsEnvironment: '',
    prediction: '',
    outcome: 'CORRECT' as 'CORRECT' | 'INCORRECT',
    accuracyPercent: 90,
    learning: ''
  });
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [showDecisionAudit, setShowDecisionAudit] = useState<boolean>(false);
  const [showScenarioLab, setShowScenarioLab] = useState<boolean>(false);
  const [showStrategyMemory, setShowStrategyMemory] = useState<boolean>(false);

  // Fetch all system intelligence metrics
  const fetchIntelligenceData = async (showRefIndicator = false) => {
    if (showRefIndicator) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      // 1. Fetch live system status
      const statusRes = await fetch('/api/execution-intelligence/status');
      if (!statusRes.ok) throw new Error('Failed to retrieve real-time confirmation values.');
      const statusJson = await statusRes.json();
      setStatusData(statusJson);

      // 2. Fetch journal history
      const journalRes = await fetch('/api/execution-intelligence/journal');
      if (!journalRes.ok) throw new Error('Failed to retrieve performance journal details.');
      const journalJson = await journalRes.json();
      setJournalData(journalJson);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Subsystem communication error occurred.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIntelligenceData();
    // Auto-refresh every 12 seconds to keep the real-time simulation completely in sync
    const interval = setInterval(() => {
      fetchIntelligenceData(true);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Form submission handler
  const handleAddPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess(null);

    const { eventName, category, marketCondition, newsEnvironment, prediction, outcome, accuracyPercent, learning } = newPredictionForm;
    if (!eventName || !prediction || !learning) {
      setError('Please populate all prediction fields prior to recording.');
      return;
    }

    try {
      const response = await fetch('/api/execution-intelligence/journal/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          category,
          marketCondition,
          newsEnvironment: newsEnvironment || `Released ${category} data point.`,
          prediction,
          outcome,
          accuracyPercent,
          learning
        })
      });

      if (!response.ok) throw new Error('Failed to post prediction to server database.');
      const result = await response.json();

      setFormSuccess('Execution prediction recorded. AI adaptive weights calibrated successfully!');
      
      // Reset form
      setNewPredictionForm({
        eventName: '',
        category: 'FOMC',
        marketCondition: 'TRENDING',
        newsEnvironment: '',
        prediction: '',
        outcome: 'CORRECT',
        accuracyPercent: 90,
        learning: ''
      });

      // Refresh data to show changes
      fetchIntelligenceData(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit prediction record.');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-4 font-mono">
        <Activity className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
        <p className="text-xs text-zinc-400">LOADING AURUM EXECUTION & VALIDATION INTELLIGENCE LAYER...</p>
      </div>
    );
  }

  const activeConfScore = statusData?.confirmationScores.find(
    score => score.assetId === selectedAsset
  ) || statusData?.confirmationScores[0];

  const activeFalseSignal = statusData?.falseSignalDetections[selectedAsset] || {
    warningDetected: false,
    warningType: 'None',
    confidenceImpactPercent: 0,
    alertMessage: 'No structural manipulation detected. Signal matches genuine volume footprints.'
  };

  const activeTiming = statusData?.smartEntryTimings.find(
    t => t.assetId === selectedAsset
  ) || statusData?.smartEntryTimings[0];

  return (
    <div className="space-y-6 font-mono text-zinc-300">
      
      {/* HEADER SECTION */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0d111d] to-[#070911] border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500/10 text-amber-400">
              <BrainCircuit className="w-4 h-4 animate-pulse" />
            </span>
            <h2 className="text-sm font-black text-white tracking-wider uppercase">
              INSTITUTIONAL EXECUTION & CONFIRMATION INTELLIGENCE
            </h2>
          </div>
          <p className="text-[10.5px] text-zinc-400 leading-normal max-w-xl">
            Real-time multi-dimensional validation suite. Avoid blind entries: analyze macro bias, news blocks, SMC liquidity pools, and adaptive accuracy.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button 
            onClick={() => {
              setShowDecisionAudit(!showDecisionAudit);
              setShowScenarioLab(false);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md ${
              showDecisionAudit
                ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-black'
                : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-[#D4AF37]'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{showDecisionAudit ? 'Return to Execution Grid' : 'CMD: DECISION AUDIT'}</span>
          </button>

          <button 
            onClick={() => {
              setShowScenarioLab(!showScenarioLab);
              setShowDecisionAudit(false);
              setShowStrategyMemory(false);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md ${
              showScenarioLab
                ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-black'
                : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-[#D4AF37]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{showScenarioLab ? 'Return to Execution Grid' : 'CMD: SCENARIO LAB'}</span>
          </button>

          <button 
            onClick={() => {
              setShowStrategyMemory(!showStrategyMemory);
              setShowScenarioLab(false);
              setShowDecisionAudit(false);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md ${
              showStrategyMemory
                ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-black'
                : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-[#D4AF37]'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{showStrategyMemory ? 'Return to Execution Grid' : 'CMD: STRATEGY MEMORY'}</span>
          </button>

          <button 
            onClick={() => fetchIntelligenceData(true)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-300 transition cursor-pointer flex items-center justify-center gap-1.5 text-[11px] font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Force Sync'}</span>
          </button>
          
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
            Live Feed: Active
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-mono">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showDecisionAudit ? (
        <DecisionAuditView />
      ) : showScenarioLab ? (
        <ScenarioSimulationLabView />
      ) : showStrategyMemory ? (
        <AdaptiveStrategyMemoryView />
      ) : (
        <>
          {/* BLOCK 1: SMART NEWS FILTER INDICATOR & CURRENT MARKET ENVIRONMENT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* News Volatility Risk Filter */}
        <div className={`p-4 rounded-2xl border transition-all ${
          statusData?.newsFilter.tradingMode === 'CAUTION' 
            ? 'bg-amber-500/5 border-amber-500/40 shadow-lg shadow-amber-500/5' 
            : 'bg-[#080b13] border-zinc-900 shadow-md'
        }`}>
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5 mb-3">
            <span className="text-[11px] font-black tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
              <Newspaper className="w-4 h-4 text-sky-400" />
              Smart News Volatility Filter
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
              statusData?.newsFilter.tradingMode === 'CAUTION'
                ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {statusData?.newsFilter.tradingMode === 'CAUTION' ? '⚠️ RISK: CAUTION' : '🟢 STATE: NORMAL'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] text-zinc-500 font-sans">Active Status:</span>
              <span className={`text-base font-black ${
                statusData?.newsFilter.tradingMode === 'CAUTION' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {statusData?.newsFilter.tradingMode === 'CAUTION' ? 'CAUTION PROTOCOL ENABLED' : 'STABLE MARKET ENVIRONMENT'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 text-xs space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">Upcoming Event:</span>
                <span className="text-zinc-300 font-bold">{statusData?.newsFilter.nextEventName}</span>
              </div>
              
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">Event Time remaining:</span>
                <span className={`font-black font-mono-num ${
                  statusData?.newsFilter.minutesUntilNextEvent >= 0 && statusData?.newsFilter.minutesUntilNextEvent <= 30
                    ? 'text-amber-400 animate-pulse'
                    : 'text-zinc-300'
                }`}>
                  {statusData?.newsFilter.minutesUntilNextEvent >= 0 
                    ? `${statusData.newsFilter.minutesUntilNextEvent} Minutes` 
                    : 'No upcoming event within threshold'}
                </span>
              </div>

              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">Signal Restrictions:</span>
                <span className={`font-bold ${
                  statusData?.newsFilter.signalGeneration === 'REDUCED' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {statusData?.newsFilter.signalGeneration === 'REDUCED' ? 'REDUCED FREQUENCY (Adaptive Protect)' : 'NORMAL OPERATION'}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 italic leading-relaxed bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-900/50">
              {statusData?.newsFilter.reason}
            </p>
          </div>
        </div>

        {/* Market Condition Classifier */}
        <div className="p-4 rounded-2xl bg-[#080b13] border border-zinc-900 shadow-md">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5 mb-3">
            <span className="text-[11px] font-black tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-400" />
              Market Condition Classifier
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-500">
              Live Scanner
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] text-zinc-500 font-sans">Current Environment:</span>
              <span className={`text-xl font-black tracking-wider ${
                statusData?.marketClassifier.condition === 'NEWS DRIVEN' ? 'text-amber-400' :
                statusData?.marketClassifier.condition === 'HIGH VOLATILITY' ? 'text-rose-400' :
                statusData?.marketClassifier.condition === 'TRENDING' ? 'text-emerald-400' : 'text-sky-400'
              }`}>
                {statusData?.marketClassifier.condition}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 text-xs space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">Trading Confidence Multiplier:</span>
                <span className={`font-black ${
                  statusData?.marketClassifier.confidenceMultiplier === 1.0 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {statusData?.marketClassifier.confidenceMultiplier ? `${(statusData.marketClassifier.confidenceMultiplier * 100).toFixed(0)}%` : '100%'}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">Validation Filter Strength:</span>
                <span className="text-zinc-300 font-bold">
                  {statusData?.marketClassifier.condition === 'NEWS DRIVEN' ? 'STRICT' : 'STANDARD'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-zinc-900 bg-zinc-950/30 flex items-start gap-2">
              <Sliders className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
              <p className="text-[10.5px] text-zinc-400 leading-relaxed font-sans">
                {statusData?.marketClassifier.explanation}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* BLOCK 2: ASSET VALIDATOR COCKPIT */}
      <div className="p-4 rounded-2xl bg-[#080b13] border border-zinc-900 shadow-md space-y-4">
        
        {/* Asset Switcher Tab Strip */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <span className="text-[11px] font-black tracking-wider text-white uppercase font-mono">
              REAL-TIME CONFIRMATION & PROTECTION SUITE
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedAsset('xau-usd')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                selectedAsset === 'xau-usd'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black border-amber-300'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white'
              }`}
            >
              🏅 GOLD (XAU/USD)
            </button>
            <button
              onClick={() => setSelectedAsset('spy')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                selectedAsset === 'spy'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black border-amber-300'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white'
              }`}
            >
              🎯 SPY OPTIONS
            </button>
            <button
              onClick={() => setSelectedAsset('nasdaq-100')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                selectedAsset === 'nasdaq-100'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black border-amber-300'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white'
              }`}
            >
              💻 NASDAQ-100
            </button>
          </div>
        </div>

        {/* Dashboard Grid for Selected Asset */}
        {activeConfScore && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Real-time Confirmation Score Meter (Column 5) */}
            <div className="md:col-span-5 p-4 rounded-xl bg-zinc-950 border border-zinc-900/80 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-sans block">
                  Confirmation scoring engine
                </span>
                <h3 className="text-sm font-bold text-white flex items-center gap-1">
                  <Gauge className="w-4 h-4 text-amber-400" />
                  Aurum Confirmation Score
                </h3>
              </div>

              {/* Score Display Ring/Circle Mock */}
              <div className="py-6 flex flex-col items-center justify-center relative">
                <span className={`text-4xl font-black tracking-tighter ${
                  activeConfScore.score >= 80 ? 'text-emerald-400' :
                  activeConfScore.score >= 65 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {activeConfScore.score}/100
                </span>
                <span className="text-[10px] text-zinc-500 uppercase font-sans font-bold tracking-wider mt-1.5">
                  Alignment Rating: {activeConfScore.score >= 80 ? 'A+ HIGH CONFLUENCE' : activeConfScore.score >= 65 ? 'A- CAUTIOUS ALLY' : 'SPECULATIVE MOVE'}
                </span>
                
                {/* Micro Bar */}
                <div className="w-full bg-zinc-900 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      activeConfScore.score >= 80 ? 'bg-emerald-400' :
                      activeConfScore.score >= 65 ? 'bg-amber-400' : 'bg-rose-400'
                    }`}
                    style={{ width: `${activeConfScore.score}%` }}
                  />
                </div>
              </div>

              {/* Status Alert Indicator */}
              <div className="p-3 rounded-lg bg-zinc-900 text-[10.5px] border border-zinc-800 space-y-1">
                <div className="flex justify-between text-zinc-400 font-bold">
                  <span>Symbol Index:</span>
                  <span className="text-white">{activeConfScore.symbol}</span>
                </div>
                <div className="flex justify-between text-zinc-400 font-bold">
                  <span>Current Direction Bias:</span>
                  <span className={`font-black ${
                    activeConfScore.direction === 'BUY' ? 'text-emerald-400' :
                    activeConfScore.direction === 'SELL' ? 'text-rose-400' : 'text-amber-400'
                  }`}>{activeConfScore.direction}</span>
                </div>
              </div>
            </div>

            {/* Breakdowns & Timing Bars (Column 7) */}
            <div className="md:col-span-7 space-y-3.5">
              
              {/* Parameter Bar Gauges */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900/80 space-y-3">
                <h4 className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-900 pb-1.5 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Score Parameter Breakdown
                </h4>

                <div className="space-y-2.5">
                  {/* Macro Condition */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500 font-sans">Macro Condition Weighting:</span>
                      <span className="text-zinc-300 font-bold font-mono-num">{activeConfScore.breakdown.macro}/30</span>
                    </div>
                    <div className="h-1 bg-zinc-900 rounded overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${(activeConfScore.breakdown.macro / 30) * 100}%` }} />
                    </div>
                  </div>

                  {/* SMC Structure */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500 font-sans">SMC Market Structure alignment:</span>
                      <span className="text-zinc-300 font-bold font-mono-num">{activeConfScore.breakdown.smcStructure}/30</span>
                    </div>
                    <div className="h-1 bg-zinc-900 rounded overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${(activeConfScore.breakdown.smcStructure / 30) * 100}%` }} />
                    </div>
                  </div>

                  {/* Liquidity Sweep */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500 font-sans">Liquidity Pool sweep volume:</span>
                      <span className="text-zinc-300 font-bold font-mono-num">{activeConfScore.breakdown.liquidity}/20</span>
                    </div>
                    <div className="h-1 bg-zinc-900 rounded overflow-hidden">
                      <div className="h-full bg-sky-400" style={{ width: `${(activeConfScore.breakdown.liquidity / 20) * 100}%` }} />
                    </div>
                  </div>

                  {/* News Risk */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500 font-sans">Macro News Volatility Risk Index:</span>
                      <span className="text-zinc-300 font-bold font-mono-num">{activeConfScore.breakdown.newsRisk}/20</span>
                    </div>
                    <div className="h-1 bg-zinc-900 rounded overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: `${(activeConfScore.breakdown.newsRisk / 20) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* False Signal Detector Warning Alert */}
              <div className={`p-3.5 rounded-xl border ${
                activeFalseSignal.warningDetected 
                  ? 'bg-rose-500/10 border-rose-500/40 animate-pulse' 
                  : 'bg-zinc-950 border-zinc-900/80 text-zinc-300'
              }`}>
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 mb-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>FALSE SIGNAL REJECTION ENGINE ({activeFalseSignal.warningType})</span>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-300">
                  {activeFalseSignal.alertMessage}
                </p>
                {activeFalseSignal.warningDetected && (
                  <div className="mt-2 text-[10px] text-rose-300/80 font-bold uppercase tracking-wider">
                    ⚠️ CONFIDENCE VALUE ADJUSTED DOWNWARD BY -{activeFalseSignal.confidenceImpactPercent}%
                  </div>
                )}
              </div>

              {/* Smart Entry Timing recommendations */}
              {activeTiming && (
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900/80 space-y-2">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
                    <span className="text-[10.5px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      Smart Entry Timing Assistant
                    </span>
                    <span className={`text-[9.5px] px-1.5 py-0.5 rounded font-bold ${
                      activeTiming.status === 'READY' ? 'bg-emerald-500/20 text-emerald-400' :
                      activeTiming.status === 'COOLDOWN' ? 'bg-zinc-800 text-zinc-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {activeTiming.status}
                    </span>
                  </div>

                  <div className="text-[11px] space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">General Market Bias:</span>
                      <span className="text-zinc-300 font-bold">{activeTiming.generalBias}</span>
                    </div>
                    <div className="p-2 rounded bg-zinc-900 border border-zinc-850 flex items-start gap-1.5">
                      <span className="text-amber-400 text-xs font-bold">👉</span>
                      <p className="text-zinc-300 text-[10.5px] font-bold">
                        <span className="text-amber-400">WAIT FOR:</span> {activeTiming.waitingFor}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>

      {/* BLOCK 3: AI CONFIDENCE CALIBRATION & ADAPTIVE WEIGHTS */}
      <div className="p-4 rounded-2xl bg-[#080b13] border border-zinc-900 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
          <span className="text-[11px] font-black tracking-wider text-white uppercase flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-sky-400" />
            Adaptive AI Confidence Calibration System
          </span>
          <span className="text-[10px] text-zinc-500">
            Self-Learning Calibration (Auto-Weights)
          </span>
        </div>

        <p className="text-[10.5px] text-zinc-400 leading-normal max-w-2xl font-sans">
          The system actively tracking previous news release reactions. If a strategy produces high alignment and correct predictions, the specific event weight is dynamically scaled up. Conversely, if high-volatility spikes generate false triggers, the weighting is lowered to protect positions.
        </p>

        {journalData && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
            {(Object.values(journalData.calibrationWeights) as ConfidenceWeight[]).map((weight) => {
              const diff = weight.adjustedConfidence - weight.baseConfidence;
              return (
                <div key={weight.category} className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-white">{weight.category}</span>
                    <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${
                      diff > 0 ? 'bg-emerald-500/20 text-emerald-400' :
                      diff < 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {diff > 0 ? `+${diff}%` : diff === 0 ? '0%' : `${diff}%`}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-500 font-sans">
                      <span>Base Confidence:</span>
                      <span className="font-mono-num">{weight.baseConfidence}%</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 font-sans">
                      <span>Adjusted Conf:</span>
                      <span className="font-black text-white font-mono-num">{weight.adjustedConfidence}%</span>
                    </div>
                  </div>

                  {/* Tiny accuracy gauge */}
                  <div className="w-full bg-zinc-900 h-1 rounded">
                    <div 
                      className={`h-full rounded ${diff > 0 ? 'bg-emerald-400' : 'bg-sky-400'}`}
                      style={{ width: `${weight.adjustedConfidence}%` }}
                    />
                  </div>

                  <div className="text-[9px] text-zinc-500 text-right font-sans">
                    Score: {weight.correctPredictionsCount}/{weight.totalPredictionsCount} Correct
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BLOCK 4: PERFORMANCE JOURNAL & NEW PREDICTION CENTER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Record New Prediction Form (Column 5) */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-[#080b13] border border-zinc-900 shadow-md flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2">
              <Plus className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-black text-white uppercase tracking-wider">
                Log New Macro Prediction
              </span>
            </div>

            <form onSubmit={handleAddPrediction} className="space-y-3 text-[10.5px]">
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-zinc-500 font-sans font-bold">Event Name:</label>
                  <input
                    type="text"
                    value={newPredictionForm.eventName}
                    onChange={e => setNewPredictionForm(p => ({ ...p, eventName: e.target.value }))}
                    placeholder="e.g. US Retail Sales"
                    className="w-full bg-zinc-950 border border-zinc-900/80 rounded px-2 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-500/40"
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-zinc-500 font-sans font-bold">Category Scope:</label>
                  <select
                    value={newPredictionForm.category}
                    onChange={e => setNewPredictionForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-900/80 rounded px-2 py-1.5 text-zinc-300 focus:outline-none focus:border-amber-500/40"
                  >
                    <option value="FOMC">FOMC Decisions</option>
                    <option value="CPI">CPI Inflation</option>
                    <option value="NFP">NFP Job Reports</option>
                    <option value="GDP">GDP Performance</option>
                    <option value="RATES">Interest Rates</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-zinc-500 font-sans font-bold">Market Condition:</label>
                  <select
                    value={newPredictionForm.marketCondition}
                    onChange={e => setNewPredictionForm(p => ({ ...p, marketCondition: e.target.value as any }))}
                    className="w-full bg-zinc-950 border border-zinc-900/80 rounded px-2 py-1.5 text-zinc-300 focus:outline-none"
                  >
                    <option value="TRENDING">TRENDING</option>
                    <option value="RANGING">RANGING</option>
                    <option value="HIGH VOLATILITY">HIGH VOLATILITY</option>
                    <option value="NEWS DRIVEN">NEWS DRIVEN</option>
                    <option value="LOW LIQUIDITY">LOW LIQUIDITY</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500 font-sans font-bold">Historical Outcome:</label>
                  <select
                    value={newPredictionForm.outcome}
                    onChange={e => setNewPredictionForm(p => ({ ...p, outcome: e.target.value as any }))}
                    className="w-full bg-zinc-950 border border-zinc-900/80 rounded px-2 py-1.5 text-zinc-350 focus:outline-none"
                  >
                    <option value="CORRECT">CORRECT (Matched)</option>
                    <option value="INCORRECT">INCORRECT (Failed)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500 font-sans font-bold">Prediction Thesis:</label>
                <input
                  type="text"
                  value={newPredictionForm.prediction}
                  onChange={e => setNewPredictionForm(p => ({ ...p, prediction: e.target.value }))}
                  placeholder="e.g. Gold bullish on soft PPI data"
                  className="w-full bg-zinc-950 border border-zinc-900/80 rounded px-2 py-1.5 text-zinc-200 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500 font-sans font-bold">Key Intelligence Learning:</label>
                <textarea
                  value={newPredictionForm.learning}
                  onChange={e => setNewPredictionForm(p => ({ ...p, learning: e.target.value }))}
                  placeholder="What was the core takeaway for the calibration weight models?"
                  className="w-full h-16 bg-zinc-950 border border-zinc-900/80 rounded px-2 py-1.5 text-zinc-250 focus:outline-none text-[10px]"
                  required
                />
              </div>

              {formSuccess && (
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                  {formSuccess}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-black font-extrabold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Record & Calibrate Weights</span>
              </button>

            </form>
          </div>
        </div>

        {/* History Log List (Column 7) */}
        <div className="lg:col-span-7 p-4 rounded-2xl bg-[#080b13] border border-zinc-900 shadow-md flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span className="text-[11px] font-black text-white uppercase tracking-wider">
                Live Intelligence Journal & Memory
              </span>
            </div>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {journalData && journalData.journal.map((record) => (
                <div key={record.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-900/80 text-[10.5px] space-y-2">
                  <div className="flex justify-between items-center font-mono">
                    <span className="font-bold text-white uppercase">{record.eventName} ({record.category})</span>
                    <span className="text-zinc-500">{record.date}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-zinc-900 pt-1.5 text-[9.5px]">
                    <div>
                      <span className="text-zinc-500 block">Condition:</span>
                      <span className="text-zinc-400 font-bold">{record.marketCondition}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Thesis:</span>
                      <span className="text-zinc-400 font-bold truncate block">{record.prediction}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Outcome:</span>
                      <span className={`font-black uppercase flex items-center gap-1 ${
                        record.outcome === 'CORRECT' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {record.outcome === 'CORRECT' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                        {record.outcome}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-400 bg-zinc-900/50 p-2 rounded border border-zinc-900/40 leading-relaxed font-sans italic">
                    <span className="font-bold text-amber-300/80 font-mono text-[9px] block uppercase not-italic mb-0.5">takeaway learning:</span>
                    {record.learning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* BLOCK 5: COMMAND cockpit "EXECUTION INTELLIGENCE" INSTITUTIONAL BOARD */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/20 shadow-2xl relative overflow-hidden space-y-4">
        
        {/* Glowing aura effect */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
          <span className="text-[11px] font-black tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-amber-400 animate-pulse" />
            CMD: EXECUTION INTELLIGENCE WORKSPACE
          </span>
          <span className="text-[10px] text-zinc-500">
            Institutional Board Mode Active
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          
          {/* Item 1 */}
          <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-2">
            <span className="text-[9px] text-zinc-500 uppercase font-sans">Current Market State</span>
            <div className="text-xs font-black text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              STABLE ORDER
            </div>
          </div>

          {/* Item 2 */}
          <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-2">
            <span className="text-[9px] text-zinc-500 uppercase font-sans">Macro Bias</span>
            <div className="text-xs font-black text-amber-300">
              GOLD BULLISH LIQUIDITY
            </div>
          </div>

          {/* Item 3 */}
          <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-2">
            <span className="text-[9px] text-zinc-500 uppercase font-sans">News Risk</span>
            <div className={`text-xs font-black ${
              statusData?.newsFilter.tradingMode === 'CAUTION' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {statusData?.newsFilter.tradingMode === 'CAUTION' ? 'CAUTION (HIGH)' : 'NORMAL (LOW)'}
            </div>
          </div>

          {/* Item 4 */}
          <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-2">
            <span className="text-[9px] text-zinc-500 uppercase font-sans">Radar Confidence</span>
            <div className="text-xs font-black text-white">
              88% CONSENSUS
            </div>
          </div>

          {/* Item 5 */}
          <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-2">
            <span className="text-[9px] text-zinc-500 uppercase font-sans">Liquidity Condition</span>
            <div className="text-xs font-black text-sky-400">
              SSL SWEEP PENDING
            </div>
          </div>

          {/* Item 6 */}
          <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-2">
            <span className="text-[9px] text-zinc-500 uppercase font-sans">AI Reliability</span>
            <div className="text-xs font-black text-emerald-400">
              91.4% COMPREHENSIVE
            </div>
          </div>

          {/* Item 7 */}
          <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-2 col-span-2 md:col-span-1">
            <span className="text-[9px] text-zinc-500 uppercase font-sans">Trading Environment</span>
            <div className="text-xs font-black text-white">
              {statusData?.marketClassifier.condition}
            </div>
          </div>

        </div>

      </div>
    </>
  )}

</div>
);
};
