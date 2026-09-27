import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  TrendingUp, 
  Zap, 
  ArrowRight, 
  ChevronRight, 
  Sparkles, 
  RefreshCw, 
  Compass, 
  Layers, 
  FileText, 
  Activity, 
  BookOpen, 
  BrainCircuit, 
  Scale, 
  Eye, 
  Sliders, 
  Plus, 
  Check, 
  Flame, 
  ShieldAlert,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  History
} from 'lucide-react';

export interface DecisionTraceItem {
  id: string;
  time: string;
  timestamp: number;
  event: string;
  marketCondition: string;
  newsState: string;
  macroInputs: {
    gold: string;
    dxy: string;
    yield: string;
    newsRisk: string;
  };
  smcInputs: {
    structure: string;
    liquidityTarget: string;
    orderBlock: string;
  };
  liquidityData: {
    buySideLiquidity: string;
    sellSideLiquidity: string;
    volumeDelta: string;
  };
  confidenceChange: {
    before: number;
    after: number;
    delta: number;
    reason: string;
  };
  finalBias: string;
}

export interface DecisionAuditData {
  timestamp: number;
  serverTime: string;
  symbol: string;
  currentPrice: number;
  currentDecision: {
    status: 'OPPORTUNITY_PENDING' | 'VALIDATED_READY' | 'STAND_ASIDE';
    action: 'BUY' | 'SELL' | 'WAIT';
    bias: string;
    headline: string;
    executiveSummary: string;
  };
  supportingFactors: string[];
  opposingFactors: string[];
  confidence: {
    base: number;
    final: number;
    rating: 'HIGH' | 'MODERATE' | 'CAUTION';
  };
  historicalEvidence: string;
  riskWarnings: string[];
  decisionTrace: DecisionTraceItem[];
  confidenceBreakdown: {
    totalScore: number;
    maxScore: number;
    alignment: {
      macroAlignment: { score: number; max: number; status: 'PASS' | 'WARNING' | 'FAIL'; note: string };
      smcStructure: { score: number; max: number; status: 'PASS' | 'WARNING' | 'FAIL'; note: string };
      liquidity: { score: number; max: number; status: 'PASS' | 'WAIT' | 'FAIL'; note: string };
      newsEnvironment: { score: number; max: number; status: 'PASS' | 'DEDUCTION' | 'LOCKED'; note: string };
    };
    deductions: Array<{ factor: string; points: number; reason: string }>;
  };
  signalPipeline: {
    currentStep: number;
    totalSteps: number;
    overallStatus: 'READY' | 'NOT READY' | 'LOCKED';
    waitingFor: string;
    stages: Array<{
      step: number;
      name: string;
      status: 'PASS' | 'WAIT' | 'FAIL';
      summary: string;
      detail: string;
    }>;
  };
  disagreementDetector: {
    conflictDetected: boolean;
    conflictSeverity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
    originalConfidence: number;
    adjustedConfidence: number;
    confidenceReductionPercent: number;
    conflictSummary: string;
    mitigationAdvice: string;
    views: {
      macroView: { name: string; bias: string; weight: number; confidence: number; evidence: string };
      technicalView: { name: string; bias: string; weight: number; confidence: number; evidence: string };
      newsView: { name: string; bias: string; weight: number; confidence: number; evidence: string };
      historicalPattern: { name: string; bias: string; weight: number; confidence: number; evidence: string };
    };
  };
  historicalComparison: {
    scenarioName: string;
    previousMatches: number;
    successfulOutcomes: number;
    failedOutcomes: number;
    successRatio: number;
    avgMovePoints: string;
    explanation: string;
    sampleEvents: Array<{
      date: string;
      event: string;
      condition: string;
      prediction: string;
      outcome: string;
      result: 'CORRECT' | 'INCORRECT';
      points: string;
    }>;
  };
  decisionJournal: Array<{
    id: string;
    date: string;
    event: string;
    prediction: string;
    reason: string;
    outcome: string;
    status: 'CORRECT' | 'INCORRECT' | 'PENDING';
    accuracyPercent: number;
    learning: string;
  }>;
}

interface DecisionAuditViewProps {
  onSelectTab?: (tabId: string) => void;
}

export const DecisionAuditView: React.FC<DecisionAuditViewProps> = () => {
  const [data, setData] = useState<DecisionAuditData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedSubTab, setSelectedSubTab] = useState<'OVERVIEW' | 'TRACE' | 'PIPELINE' | 'DISAGREEMENT' | 'JOURNAL'>('OVERVIEW');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newEntryForm, setNewEntryForm] = useState({
    event: '',
    prediction: '',
    reason: '',
    outcome: '',
    status: 'CORRECT' as 'CORRECT' | 'INCORRECT',
    accuracyPercent: 92,
    learning: ''
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchAuditData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch('/api/decision-audit/live');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.warn('[DecisionAudit] Failed to fetch audit:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
    const interval = setInterval(() => fetchAuditData(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateJournalEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryForm.event || !newEntryForm.prediction || !newEntryForm.reason || !newEntryForm.outcome) {
      alert('Please fill out all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/decision-audit/journal/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntryForm)
      });
      if (res.ok) {
        setFeedbackMsg('Decision record successfully logged into transparent AI memory.');
        setShowAddModal(false);
        setNewEntryForm({
          event: '',
          prediction: '',
          reason: '',
          outcome: '',
          status: 'CORRECT',
          accuracyPercent: 92,
          learning: ''
        });
        await fetchAuditData(true);
        setTimeout(() => setFeedbackMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-8 rounded-2xl bg-[#090C12] border border-[#1E252E] text-center space-y-3 font-mono">
        <BrainCircuit className="w-8 h-8 text-[#D4AF37] animate-pulse mx-auto" />
        <div className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider">
          SYNCHRONIZING DECISION AUDIT & EXPLAINABILITY ENGINE...
        </div>
        <p className="text-[11px] text-zinc-500">Constructing multi-dimensional trace timeline & disagreement matrix</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4 font-mono text-zinc-200">
      {/* TOP BANNER / AUDIT HEADER */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0C0F17] via-[#101420] to-[#0A0D15] border border-[#D4AF37]/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-40 bg-[#D4AF37]/5 blur-3xl pointer-events-none rounded-full" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                <BrainCircuit className="w-3 h-3 animate-pulse" />
                AURUM TRANSPARENCY PROTOCOL
              </span>
              <span className="text-[10px] text-zinc-400">
                AUDIT ENGINE v4.2 • ZERO BLACK BOX
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-wide flex items-center gap-2">
              DECISION AUDIT & EXPLAINABILITY COCKPIT
            </h1>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Every Aurum decision is audited across macro drivers, smart money structure, liquidity order flow, and conflict detection before capital is put at risk.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <button
              onClick={() => fetchAuditData(true)}
              disabled={refreshing}
              className="px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-[#D4AF37] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#D4AF37]' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Sync Audit'}</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Decision</span>
            </button>
          </div>
        </div>

        {/* FEEDBACK NOTICE */}
        {feedbackMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* SUBTAB CONTROLS */}
        <div className="mt-4 pt-3 border-t border-[#1E252E] flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedSubTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
              selectedSubTab === 'OVERVIEW'
                ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-black shadow-md shadow-[#D4AF37]/20'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>CMD: AUDIT SUMMARY</span>
          </button>

          <button
            onClick={() => setSelectedSubTab('TRACE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
              selectedSubTab === 'TRACE'
                ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-black shadow-md shadow-[#D4AF37]/20'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>DECISION TRACE ({data.decisionTrace.length})</span>
          </button>

          <button
            onClick={() => setSelectedSubTab('PIPELINE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
              selectedSubTab === 'PIPELINE'
                ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-black shadow-md shadow-[#D4AF37]/20'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>APPROVAL PIPELINE ({data.signalPipeline.stages.filter(s => s.status === 'PASS').length}/{data.signalPipeline.totalSteps})</span>
          </button>

          <button
            onClick={() => setSelectedSubTab('DISAGREEMENT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
              selectedSubTab === 'DISAGREEMENT'
                ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-black shadow-md shadow-[#D4AF37]/20'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>AI CONFLICT DETECTOR</span>
            {data.disagreementDetector.conflictDetected && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping ml-0.5" />
            )}
          </button>

          <button
            onClick={() => setSelectedSubTab('JOURNAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
              selectedSubTab === 'JOURNAL'
                ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-black shadow-md shadow-[#D4AF37]/20'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>DECISION JOURNAL ({data.decisionJournal.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW: OVERVIEW / COMMAND DECISION AUDIT */}
      {selectedSubTab === 'OVERVIEW' && (
        <div className="space-y-4">
          
          {/* CURRENT DECISION EXECUTIVE CARD */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090C13] border border-[#1E252E] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black block">
                    ACTIVE EVALUATION ASSET: {data.symbol}
                  </span>
                  <h3 className="text-base font-black text-white">
                    {data.currentDecision.headline}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-black flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>ACTION: {data.currentDecision.action}</span>
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono font-bold">
                  SPOT: ${data.currentPrice.toFixed(2)}
                </div>
              </div>
            </div>

            {/* SUMMARY & CONFIDENCE SNAPSHOT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-900 space-y-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Executive Explanation</span>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {data.currentDecision.executiveSummary}
                </p>
                <div className="pt-2 flex items-center gap-2 text-[11px] text-amber-300 font-mono">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{data.signalPipeline.waitingFor}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gradient-to-br from-zinc-950 to-[#0e121e] border border-amber-500/20 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold block">
                    AURUM CONFIRMATION SCORE
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-amber-400 font-mono-num">
                      {data.confidence.final}
                    </span>
                    <span className="text-xs text-zinc-500">/ 100</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {data.confidence.rating}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1">
                    Base: <span className="text-zinc-300 font-bold">{data.confidence.base}%</span> → Conflict Deduction: <span className="text-rose-400 font-bold">-{data.disagreementDetector.confidenceReductionPercent}%</span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-zinc-800/80 text-[10.5px] text-zinc-400 flex items-center justify-between">
                  <span>Approval Pipeline:</span>
                  <span className="text-amber-400 font-bold">{data.signalPipeline.overallStatus}</span>
                </div>
              </div>
            </div>

            {/* BATTLE OF FORCES: SUPPORTING VS OPPOSING FACTORS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Supporting Factors */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <span className="text-xs font-black text-emerald-400 tracking-wider uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    SUPPORTING FACTORS ({data.supportingFactors.length})
                  </span>
                  <span className="text-[10px] text-emerald-400/80 font-bold">PASS CONFLUENCE</span>
                </div>
                <div className="space-y-1.5">
                  {data.supportingFactors.map((factor, i) => (
                    <div key={i} className="text-xs text-zinc-300 flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-400 font-black mt-0.5">✓</span>
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opposing Factors */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
                  <span className="text-xs font-black text-rose-400 tracking-wider uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    OPPOSING FACTORS & RISKS ({data.opposingFactors.length})
                  </span>
                  <span className="text-[10px] text-rose-400/80 font-bold">THREAT GUARD</span>
                </div>
                <div className="space-y-1.5">
                  {data.opposingFactors.map((factor, i) => (
                    <div key={i} className="text-xs text-zinc-300 flex items-start gap-2 leading-relaxed">
                      <span className="text-rose-400 font-black mt-0.5">✕</span>
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* HISTORICAL EVIDENCE & RISK WARNINGS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900 space-y-1.5">
                <span className="text-[10.5px] font-bold text-[#D4AF37] uppercase flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Historical Evidence Base
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {data.historicalEvidence}
                </p>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-zinc-400">
                  <span>Win Rate: <strong className="text-emerald-400">{data.historicalComparison.successRatio}%</strong></span>
                  <span>Matches: <strong className="text-white">{data.historicalComparison.previousMatches}</strong></span>
                  <span>Avg Expansion: <strong className="text-[#D4AF37]">{data.historicalComparison.avgMovePoints}</strong></span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                <span className="text-[10.5px] font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  Mandatory Execution Warnings
                </span>
                <div className="space-y-1">
                  {data.riskWarnings.map((warn, i) => (
                    <div key={i} className="text-[11px] text-amber-200/90 flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CONFIDENCE BREAKDOWN EXPLAINER MODULE */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#080B11] border border-[#1E252E] space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  2. CONFIDENCE BREAKDOWN PANEL — SCORE EXPLAINABILITY
                </h3>
              </div>
              <span className="text-xs font-mono text-[#D4AF37] font-bold">
                Total: {data.confidenceBreakdown.totalScore} / {data.confidenceBreakdown.maxScore}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Macro Alignment */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-400">Macro Alignment</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {data.confidenceBreakdown.alignment.macroAlignment.status}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">{data.confidenceBreakdown.alignment.macroAlignment.score}</span>
                  <span className="text-xs text-zinc-500">/ {data.confidenceBreakdown.alignment.macroAlignment.max}</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full rounded-full" 
                    style={{ width: `${(data.confidenceBreakdown.alignment.macroAlignment.score / data.confidenceBreakdown.alignment.macroAlignment.max) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-400 font-sans leading-tight">
                  {data.confidenceBreakdown.alignment.macroAlignment.note}
                </p>
              </div>

              {/* SMC Structure */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-400">SMC Structure</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {data.confidenceBreakdown.alignment.smcStructure.status}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">{data.confidenceBreakdown.alignment.smcStructure.score}</span>
                  <span className="text-xs text-zinc-500">/ {data.confidenceBreakdown.alignment.smcStructure.max}</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full rounded-full" 
                    style={{ width: `${(data.confidenceBreakdown.alignment.smcStructure.score / data.confidenceBreakdown.alignment.smcStructure.max) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-400 font-sans leading-tight">
                  {data.confidenceBreakdown.alignment.smcStructure.note}
                </p>
              </div>

              {/* Liquidity */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-400">Liquidity Depth</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {data.confidenceBreakdown.alignment.liquidity.status}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">{data.confidenceBreakdown.alignment.liquidity.score}</span>
                  <span className="text-xs text-zinc-500">/ {data.confidenceBreakdown.alignment.liquidity.max}</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full rounded-full" 
                    style={{ width: `${(data.confidenceBreakdown.alignment.liquidity.score / data.confidenceBreakdown.alignment.liquidity.max) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-400 font-sans leading-tight">
                  {data.confidenceBreakdown.alignment.liquidity.note}
                </p>
              </div>

              {/* News Environment */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-400">News Environment</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {data.confidenceBreakdown.alignment.newsEnvironment.status}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-amber-400">{data.confidenceBreakdown.alignment.newsEnvironment.score}</span>
                  <span className="text-xs text-zinc-500">/ {data.confidenceBreakdown.alignment.newsEnvironment.max}</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-400 h-full rounded-full" 
                    style={{ width: `${(data.confidenceBreakdown.alignment.newsEnvironment.score / data.confidenceBreakdown.alignment.newsEnvironment.max) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-400 font-sans leading-tight">
                  {data.confidenceBreakdown.alignment.newsEnvironment.note}
                </p>
              </div>
            </div>

            {/* Transparent Deductions Panel */}
            {data.confidenceBreakdown.deductions.length > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <span className="font-bold text-rose-300">Deduction Reason: </span>
                    <span className="text-zinc-300 font-sans">{data.confidenceBreakdown.deductions[0].reason}</span>
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 font-mono font-black text-xs shrink-0 self-start sm:self-auto">
                  {data.confidenceBreakdown.deductions[0].points} PTS
                </span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* VIEW: DECISION TRACE TIMELINE */}
      {selectedSubTab === 'TRACE' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#080B11] border border-[#1E252E] space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                1. DECISION TRACE SYSTEM — AUDIT TIMELINE
              </h3>
              <p className="text-[11px] text-zinc-500">
                Granular multi-step log of inputs, market regimes, and confidence adjustments
              </p>
            </div>
            <span className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
              {data.decisionTrace.length} Recorded Steps
            </span>
          </div>

          <div className="space-y-4">
            {data.decisionTrace.map((trace, idx) => (
              <div key={trace.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[#D4AF37] font-bold text-xs">
                      {trace.time}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      {trace.event}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                      {trace.marketCondition}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {trace.newsState}
                    </span>
                  </div>
                </div>

                {/* Granular Trace Inputs Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Macro Inputs */}
                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">
                      Macro Inputs
                    </span>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Gold Bias:</span>
                        <span className="text-zinc-200 font-bold">{trace.macroInputs.gold}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">DXY:</span>
                        <span className="text-zinc-200 font-bold">{trace.macroInputs.dxy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">10Y Yield:</span>
                        <span className="text-zinc-200 font-bold">{trace.macroInputs.yield}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">News Risk:</span>
                        <span className="text-amber-400 font-bold">{trace.macroInputs.newsRisk}</span>
                      </div>
                    </div>
                  </div>

                  {/* SMC Inputs */}
                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">
                      SMC Structure Inputs
                    </span>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Structure:</span>
                        <span className="text-zinc-200 font-bold">{trace.smcInputs.structure}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Target (BSL):</span>
                        <span className="text-emerald-400 font-bold">{trace.smcInputs.liquidityTarget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Order Block:</span>
                        <span className="text-zinc-200 font-bold">{trace.smcInputs.orderBlock}</span>
                      </div>
                    </div>
                  </div>

                  {/* Liquidity Data & Confidence Adjustment */}
                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">
                      Liquidity & Confidence Delta
                    </span>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">SSL Sweep:</span>
                        <span className="text-emerald-400 font-bold">{trace.liquidityData.sellSideLiquidity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Volume Delta:</span>
                        <span className="text-[#D4AF37] font-bold">{trace.liquidityData.volumeDelta}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-zinc-800">
                        <span className="text-zinc-400 font-bold">Confidence:</span>
                        <span className={`font-mono font-black ${trace.confidenceChange.delta < 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {trace.confidenceChange.before}% → {trace.confidenceChange.after}% ({trace.confidenceChange.delta > 0 ? '+' : ''}{trace.confidenceChange.delta}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Bias & Reasoning */}
                <div className="p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 font-bold text-[10.5px]">REASONING:</span>
                    <span className="text-zinc-300 font-sans text-[11px]">{trace.confidenceChange.reason}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-zinc-500 font-bold text-[10.5px]">FINAL BIAS:</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold text-[11px]">
                      {trace.finalBias}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: SIGNAL APPROVAL PIPELINE */}
      {selectedSubTab === 'PIPELINE' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#080B11] border border-[#1E252E] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-3">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#D4AF37]" />
                3. SIGNAL APPROVAL PIPELINE — VISIBLE VALIDATION PATH
              </h3>
              <p className="text-[11px] text-zinc-500">
                Multi-stage sequential gates. Every stage must validate before execution release.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-black">
              STATUS: {data.signalPipeline.overallStatus}
            </div>
          </div>

          {/* Stepper Flow Graphic */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
            {data.signalPipeline.stages.map((stage, i) => (
              <div 
                key={stage.step}
                className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                  stage.status === 'PASS'
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm shadow-emerald-500/5'
                    : stage.status === 'WAIT'
                    ? 'bg-amber-950/20 border-amber-500/50 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                    : 'bg-zinc-950 border-zinc-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-zinc-500">GATE 0{stage.step}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      stage.status === 'PASS' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                    }`}>
                      {stage.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-white">
                    {stage.name}
                  </h4>
                  <p className="text-[11px] text-zinc-300 mt-1 font-sans leading-tight">
                    {stage.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400 font-sans leading-relaxed">
                  {stage.detail}
                </div>
              </div>
            ))}
          </div>

          {/* Pipeline Action Summary */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Active Execution Clearance Gate
              </span>
              <div className="text-xs text-white font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>{data.signalPipeline.waitingFor}</span>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400 text-xs font-mono">
              Signal Execution: <span className="text-amber-400 font-bold">Paused by Safety Gate</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: AI DISAGREEMENT DETECTOR */}
      {selectedSubTab === 'DISAGREEMENT' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#080B11] border border-[#1E252E] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-3">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#D4AF37]" />
                4. AI DISAGREEMENT DETECTOR — CONFLICT RESOLUTION
              </h3>
              <p className="text-[11px] text-zinc-500">
                Monitors divergent perspectives across Macro, SMC Technicals, News Volatility, and Historical Memory
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
              data.disagreementDetector.conflictDetected
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
            }`}>
              {data.disagreementDetector.conflictDetected ? '⚠️ CONFLICT DETECTED' : '✓ FULL HARMONY'}
            </span>
          </div>

          {/* Conflict Alert Banner */}
          {data.disagreementDetector.conflictDetected && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <strong className="text-xs sm:text-sm text-amber-300 font-bold">
                    {data.disagreementDetector.conflictSummary}
                  </strong>
                </div>
                <div className="px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-mono font-bold">
                  {data.disagreementDetector.originalConfidence}% → {data.disagreementDetector.adjustedConfidence}%
                </div>
              </div>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                {data.disagreementDetector.mitigationAdvice}
              </p>
            </div>
          )}

          {/* View Perspective Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.entries(data.disagreementDetector.views) as [string, any][]).map(([key, view]) => (
              <div key={key} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <span className="text-xs font-bold text-zinc-300">{view.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    view.bias === 'Bullish'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : view.bias === 'Cautious'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {view.bias.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Weight: <strong className="text-white">{view.weight}%</strong></span>
                  <span>Confidence: <strong className="text-amber-400">{view.confidence}%</strong></span>
                </div>

                <p className="text-xs text-zinc-400 font-sans leading-relaxed bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-850">
                  {view.evidence}
                </p>
              </div>
            ))}
          </div>

          {/* HISTORICAL COMPARISON EXPLANATION */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#0B0E17] border border-[#1E252E] space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
              <span className="text-xs font-black text-[#D4AF37] uppercase flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#D4AF37]" />
                5. HISTORICAL COMPARISON EXPLANATION — SIMILAR REGIME MATCHES
              </span>
              <span className="text-xs text-emerald-400 font-bold">
                {data.historicalComparison.successfulOutcomes} Wins / {data.historicalComparison.previousMatches} Matches ({data.historicalComparison.successRatio}%)
              </span>
            </div>

            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              {data.historicalComparison.explanation}
            </p>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] text-zinc-500 uppercase">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Event</th>
                    <th className="pb-2">Matching Condition</th>
                    <th className="pb-2">Outcome</th>
                    <th className="pb-2 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  {data.historicalComparison.sampleEvents.map((ev, i) => (
                    <tr key={i} className="hover:bg-zinc-900/40">
                      <td className="py-2.5 font-bold text-zinc-400">{ev.date}</td>
                      <td className="py-2.5 text-white font-bold">{ev.event}</td>
                      <td className="py-2.5 text-zinc-400 font-sans">{ev.condition}</td>
                      <td className="py-2.5 font-sans">{ev.outcome}</td>
                      <td className="py-2.5 text-right font-black">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          ev.result === 'CORRECT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {ev.points}
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

      {/* VIEW: DECISION JOURNAL */}
      {selectedSubTab === 'JOURNAL' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#080B11] border border-[#1E252E] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-3">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                6. DECISION JOURNAL — AUTOMATIC & CONTINUOUS AUDIT LOG
              </h3>
              <p className="text-[11px] text-zinc-500">
                Persistent institutional records: What Aurum thought, Why it thought it, What happened later, and the AI learning extracted.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-black transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record New Entry</span>
            </button>
          </div>

          <div className="space-y-3">
            {data.decisionJournal.map((entry) => (
              <div key={entry.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5 hover:border-zinc-700 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[#D4AF37] text-xs font-bold">
                      {entry.date}
                    </span>
                    <strong className="text-xs sm:text-sm text-white">{entry.event}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      entry.status === 'CORRECT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {entry.status} ({entry.accuracyPercent}%)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">
                      What Aurum Thought (Prediction):
                    </span>
                    <p className="text-zinc-200 font-bold">{entry.prediction}</p>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block pt-1">
                      Why Aurum Thought It (Reasoning):
                    </span>
                    <p className="text-zinc-400 font-sans text-[11px] leading-relaxed">{entry.reason}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">
                      What Happened Later (Outcome):
                    </span>
                    <p className="text-emerald-400 font-bold">{entry.outcome}</p>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block pt-1">
                      Institutional Learning (AI Rule Update):
                    </span>
                    <p className="text-[#D4AF37] font-sans text-[11px] leading-relaxed bg-[#D4AF37]/5 p-2 rounded border border-[#D4AF37]/20">
                      {entry.learning}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECORD DECISION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0E121B] border border-[#D4AF37]/40 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  RECORD DECISION IN AUDIT JOURNAL
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJournalEntry} className="space-y-3 text-xs">
              <div>
                <label className="text-[10.5px] text-zinc-400 font-bold block mb-1">Event / Trigger Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. US CPI Release, London SSL Sweep"
                  value={newEntryForm.event}
                  onChange={(e) => setNewEntryForm({ ...newEntryForm, event: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-[10.5px] text-zinc-400 font-bold block mb-1">What Aurum Thought (Prediction) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gold bullish after CPI"
                  value={newEntryForm.prediction}
                  onChange={(e) => setNewEntryForm({ ...newEntryForm, prediction: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-[10.5px] text-zinc-400 font-bold block mb-1">Why Aurum Thought It (Reasoning & Evidence) *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Lower inflation, yields plunged -8bps, DXY broke support."
                  value={newEntryForm.reason}
                  onChange={(e) => setNewEntryForm({ ...newEntryForm, reason: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-[10.5px] text-zinc-400 font-bold block mb-1">What Happened Later (Outcome) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gold +34 points expansion into target"
                  value={newEntryForm.outcome}
                  onChange={(e) => setNewEntryForm({ ...newEntryForm, outcome: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10.5px] text-zinc-400 font-bold block mb-1">Outcome Status</label>
                  <select
                    value={newEntryForm.status}
                    onChange={(e) => setNewEntryForm({ ...newEntryForm, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="CORRECT">CORRECT (Win)</option>
                    <option value="INCORRECT">INCORRECT (Loss)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10.5px] text-zinc-400 font-bold block mb-1">Accuracy / Confidence (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={newEntryForm.accuracyPercent}
                    onChange={(e) => setNewEntryForm({ ...newEntryForm, accuracyPercent: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10.5px] text-zinc-400 font-bold block mb-1">Institutional Learning (AI Rule to Store)</label>
                <input
                  type="text"
                  placeholder="e.g. Increase CPI bullish weighting when yields slide prior to release."
                  value={newEntryForm.learning}
                  onChange={(e) => setNewEntryForm({ ...newEntryForm, learning: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#B38728] text-black font-black cursor-pointer shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Save Decision to Journal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
