import React, { useState, useEffect } from 'react';
import { 
  PhaseXTradeHistoryRecord, 
  Phase4VerificationReport, 
  Phase5VerificationReport,
  TelegramVerificationReport,
  TelegramServiceStatus,
  LiveValidationSuiteReport,
  TelegramConsistencyReport
} from './PhaseXTypes';
import { 
  ShieldCheck, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  XCircle, 
  FlaskConical,
  Layers,
  Sparkles,
  Lock,
  Send,
  Database,
  Check,
  SearchCheck
} from 'lucide-react';

interface PhaseXHistoryAndVerificationProps {
  selectedAssetId: string;
}

export const PhaseXHistoryAndVerification: React.FC<PhaseXHistoryAndVerificationProps> = ({ selectedAssetId }) => {
  const [activeTab, setActiveTab] = useState<'live_validation' | 'telegram_audit' | 'phase5' | 'phase4' | 'telegram' | 'history'>('live_validation');
  const [history, setHistory] = useState<PhaseXTradeHistoryRecord[]>([]);
  const [liveReport, setLiveReport] = useState<LiveValidationSuiteReport | null>(null);
  const [telegramAudit, setTelegramAudit] = useState<TelegramConsistencyReport | null>(null);
  const [phase4Report, setPhase4Report] = useState<Phase4VerificationReport | null>(null);
  const [phase5Report, setPhase5Report] = useState<Phase5VerificationReport | null>(null);
  const [telegramReport, setTelegramReport] = useState<TelegramVerificationReport | null>(null);
  const [telegramStatus, setTelegramStatus] = useState<TelegramServiceStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLiveValidationSuite = async () => {
    setLoading(true);
    try {
      const storedToken = sessionStorage.getItem('phase_x_admin_token');
      const headers: Record<string, string> = {};
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;
      
      const res = await fetch('/api/phase-x/verify-live-suite', { headers });
      if (res.ok) {
        const data: LiveValidationSuiteReport = await res.json();
        setLiveReport(data);
      }
    } catch (err) {
      console.error('[PhaseXHistory] Error running live validation suite:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTelegramAudit = async () => {
    setLoading(true);
    try {
      const storedToken = sessionStorage.getItem('phase_x_admin_token');
      const headers: Record<string, string> = {};
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;

      const res = await fetch('/api/phase-x/audit-telegram', { headers });
      if (res.ok) {
        const data: TelegramConsistencyReport = await res.json();
        setTelegramAudit(data);
      }
    } catch (err) {
      console.error('[PhaseXHistory] Error running Telegram audit:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const storedToken = sessionStorage.getItem('phase_x_admin_token');
      const headers: Record<string, string> = {};
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;
      const res = await fetch(`/api/phase-x/history?assetId=${selectedAssetId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('[PhaseXHistory] Error fetching trade history:', err);
    }
  };

  const fetchPhase4Verification = async () => {
    setLoading(true);
    try {
      const storedToken = sessionStorage.getItem('phase_x_admin_token');
      const headers: Record<string, string> = {};
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;
      const res = await fetch('/api/phase-x/verify-phase4', { headers });
      if (res.ok) {
        const data: Phase4VerificationReport = await res.json();
        setPhase4Report(data);
      }
    } catch (err) {
      console.error('[PhaseXHistory] Error running Phase 4 verification:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPhase5Verification = async () => {
    setLoading(true);
    try {
      const storedToken = sessionStorage.getItem('phase_x_admin_token');
      const headers: Record<string, string> = {};
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;
      const res = await fetch('/api/phase-x/verify-phase5', { headers });
      if (res.ok) {
        const data: Phase5VerificationReport = await res.json();
        setPhase5Report(data);
      }
    } catch (err) {
      console.error('[PhaseXHistory] Error running Phase 5 verification:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTelegramVerification = async () => {
    setLoading(true);
    try {
      const storedToken = sessionStorage.getItem('phase_x_admin_token');
      const headers: Record<string, string> = {};
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;
      
      const [verifRes, statusRes] = await Promise.all([
        fetch('/api/phase-x/verify-telegram', { headers }),
        fetch('/api/phase-x/telegram-status')
      ]);

      if (verifRes.ok) {
        const data: TelegramVerificationReport = await verifRes.json();
        setTelegramReport(data);
      }
      if (statusRes.ok) {
        const statusData: TelegramServiceStatus = await statusRes.json();
        setTelegramStatus(statusData);
      }
    } catch (err) {
      console.error('[PhaseXHistory] Error running Telegram verification:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'live_validation') {
      fetchLiveValidationSuite();
    } else if (activeTab === 'telegram_audit') {
      fetchTelegramAudit();
    } else if (activeTab === 'history') {
      fetchHistory();
    } else if (activeTab === 'phase4') {
      fetchPhase4Verification();
    } else if (activeTab === 'telegram') {
      fetchTelegramVerification();
    } else {
      fetchPhase5Verification();
    }
  }, [activeTab, selectedAssetId]);

  const handleRefresh = () => {
    if (activeTab === 'live_validation') fetchLiveValidationSuite();
    else if (activeTab === 'telegram_audit') fetchTelegramAudit();
    else if (activeTab === 'history') fetchHistory();
    else if (activeTab === 'phase4') fetchPhase4Verification();
    else if (activeTab === 'telegram') fetchTelegramVerification();
    else fetchPhase5Verification();
  };

  return (
    <div className="rounded-2xl bg-[#090b14] border border-zinc-800 shadow-xl overflow-hidden font-mono text-xs">
      {/* Navigation Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-zinc-800/80 p-3 bg-zinc-950/60 gap-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Live Validation Suite Tab (Requirement 9 A-L) */}
          <button
            onClick={() => setActiveTab('live_validation')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'live_validation'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>LIVE VALIDATION (A–L)</span>
          </button>

          {/* Telegram Consistency Audit Tab (Requirement 5) */}
          <button
            onClick={() => setActiveTab('telegram_audit')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'telegram_audit'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <SearchCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>TELEGRAM AUDIT</span>
          </button>

          {/* Phase 5 Tab */}
          <button
            onClick={() => setActiveTab('phase5')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'phase5'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>PHASE 5 GATES</span>
          </button>

          {/* Phase 4 Tab */}
          <button
            onClick={() => setActiveTab('phase4')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'phase4'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>PHASE 4 ENGINE</span>
          </button>

          {/* Telegram Auto-Signal */}
          <button
            onClick={() => setActiveTab('telegram')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'telegram'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-emerald-400" />
            <span>TELEGRAM BOT</span>
          </button>

          {/* History Tab */}
          <button
            onClick={() => setActiveTab('history')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'history'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <History className="w-3.5 h-3.5 text-zinc-400" />
            <span>DIAGNOSTIC LOGS</span>
          </button>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tab Content: LIVE VALIDATION SUITE (Requirements A-L) */}
      {activeTab === 'live_validation' && (
        <div className="p-4 space-y-4">
          {liveReport ? (
            <>
              {/* Overall Status Banner */}
              <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                liveReport.overallStatus === 'PASS' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-black text-sm block">{liveReport.system}</span>
                    <span className="text-[10.5px] text-zinc-400">
                      Persistent live storage, deterministic deduplication & real telemetry validation
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-bold">
                    {liveReport.liveSignalsCount} Live Signals Saved
                  </span>
                  <span className={`px-2.5 py-1 rounded text-xs font-black uppercase ${
                    liveReport.overallStatus === 'PASS' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {liveReport.overallStatus === 'PASS' ? '12/12 CHECKS PASS' : 'FAILED'}
                  </span>
                </div>
              </div>

              {/* 12 Tests Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {liveReport.results.map((r) => (
                  <div key={r.testId} className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/90 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-zinc-200 text-xs flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{r.title}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                        r.passed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {r.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400 pl-5">
                      {r.details}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-zinc-500 flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
              <span>Running Live Validation Suite (Tests A–L)...</span>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: TELEGRAM CONSISTENCY AUDIT */}
      {activeTab === 'telegram_audit' && (
        <div className="p-4 space-y-4">
          {telegramAudit ? (
            <>
              {/* Audit Summary Banner */}
              <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                telegramAudit.inconsistentCount === 0 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                <div className="flex items-center gap-2">
                  <SearchCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div>
                    <span className="font-black text-sm block">TELEGRAM CONSISTENCY AUDITOR</span>
                    <span className="text-[10.5px] text-zinc-400">
                      Cross-validates Website Setup ID, Entry, SL, TP1, TP2 with Telegram alert payload
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-bold">
                    {telegramAudit.consistentCount} / {telegramAudit.totalAudited} Matched
                  </span>
                  <span className={`px-2.5 py-1 rounded text-xs font-black uppercase ${
                    telegramAudit.inconsistentCount === 0 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {telegramAudit.inconsistentCount === 0 ? '100% CONSISTENT' : `${telegramAudit.inconsistentCount} DISCREPANCIES`}
                  </span>
                </div>
              </div>

              {/* Audited Signals List */}
              {telegramAudit.auditItems.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  No live signals to audit yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {telegramAudit.auditItems.map((item) => (
                    <div key={item.setupId} className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/90 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            item.websiteDirection === 'BUY' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {item.websiteDirection}
                          </span>
                          <span className="text-white font-bold text-xs">{item.setupId}</span>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase ${
                          item.isConsistent ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {item.isConsistent ? '✓ PERFECT MATCH' : '⚠ MISMATCH'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/60">
                        <div>Entry: <strong className="text-white">${item.websiteEntry.toFixed(2)}</strong></div>
                        <div>SL: <strong className="text-rose-300">${item.websiteSL.toFixed(2)}</strong></div>
                        <div>TP1: <strong className="text-emerald-300">${item.websiteTP1.toFixed(2)}</strong></div>
                        <div>TP2: <strong className="text-emerald-300">${item.websiteTP2.toFixed(2)}</strong></div>
                      </div>

                      <div className="text-[10px] text-zinc-400">
                        {item.details}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 text-zinc-500 flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
              <span>Auditing Telegram Consistency...</span>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: PHASE 5 Verification Suite */}
      {activeTab === 'phase5' && (
        <div className="p-4 space-y-4">
          {phase5Report ? (
            <>
              {/* Overall Status Banner */}
              <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                phase5Report.overallStatus === 'PASS' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-black text-sm block">{phase5Report.system}</span>
                    <span className="text-[10.5px] text-zinc-400">
                      Deterministic Pre-Execution Verification (Fail-Closed Architecture)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded text-xs font-black uppercase ${
                    phase5Report.overallStatus === 'PASS' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {phase5Report.overallStatus === 'PASS' ? '10/10 TESTS PASS' : 'FAILED'}
                  </span>
                </div>
              </div>

              {/* Test Cases Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {phase5Report.results.map((r) => (
                  <div key={r.testId} className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/90 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-zinc-200 text-xs flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>{r.title}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                        r.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {r.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400 pl-5">
                      {r.details}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-zinc-500 flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
              <span>Running Phase 5 Verification Suite...</span>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: PHASE 4 Verification Suite */}
      {activeTab === 'phase4' && (
        <div className="p-4 space-y-4">
          {phase4Report ? (
            <>
              {/* Overall Status Banner */}
              <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                phase4Report.overallStatus === 'PASS' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-black text-sm block">{phase4Report.system}</span>
                    <span className="text-[10.5px] text-zinc-400">
                      Phase 4 Lifecycle, Capital Protection & Execution State Machine
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded text-xs font-black uppercase ${
                    phase4Report.overallStatus === 'PASS' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {phase4Report.overallStatus === 'PASS' ? '6/6 TESTS PASS' : 'FAILED'}
                  </span>
                </div>
              </div>

              {/* Simulation Steps */}
              <div className="space-y-2">
                <span className="text-zinc-400 font-bold uppercase text-[10px] block">
                  Simulated Trade Lifecycle Execution
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {phase4Report.simulatedTrade.timeline.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-300 text-[11px]">{item.step}</span>
                        <span className="text-[10px] text-zinc-500">{item.timestamp}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span>Price: <strong className="text-white">${item.simulatedPrice.toFixed(2)}</strong></span>
                        <span className="text-amber-400">{item.displayLabel}</span>
                        <span className="text-cyan-400 font-bold">{item.liveR}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-zinc-500 flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
              <span>Running Phase 4 Verification Suite...</span>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: TELEGRAM BOT */}
      {activeTab === 'telegram' && (
        <div className="p-4 space-y-4">
          <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <span className="font-black text-sm block text-cyan-300">TELEGRAM AUTO-SIGNAL DELIVERY SERVICE</span>
                <span className="text-[10.5px] text-zinc-400">
                  Real-time notification engine for approved XAU/USD setups
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded text-xs font-black uppercase ${
                telegramStatus?.configured 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {telegramStatus?.configured ? 'CONNECTED' : 'CONFIG READY'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <div className="text-zinc-400">Target Asset Scope</div>
              <div className="text-xs font-black text-white">XAU/USD ONLY</div>
              <div className="text-[9px] text-zinc-500">All other assets excluded</div>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <div className="text-zinc-400">Initial Signals Dispatched</div>
              <div className="text-xs font-black text-emerald-400">{telegramStatus?.sentInitialSignalsCount || 0}</div>
              <div className="text-[9px] text-zinc-500">Deduplicated per Setup ID</div>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <div className="text-zinc-400">Lifecycle Updates Sent</div>
              <div className="text-xs font-black text-cyan-400">
                {(telegramStatus?.sentTP1Count || 0) + (telegramStatus?.sentTP2Count || 0) + (telegramStatus?.sentSLCount || 0)}
              </div>
              <div className="text-[9px] text-zinc-500">TP1, TP2, and SL events</div>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <div className="text-zinc-400">Security & Credentials</div>
              <div className="text-xs font-black text-amber-300">Protected</div>
              <div className="text-[9px] text-zinc-500">Server-side env variables</div>
            </div>
          </div>

          {telegramReport ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-black uppercase text-[11px] flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-cyan-400" />
                  <span>Programmatic Verification Suite (10 Requirements A–J)</span>
                </span>
                <span className={`text-[9.5px] font-black px-2 py-0.5 rounded uppercase border ${
                  telegramReport.overallStatus === 'PASS'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  {telegramReport.overallStatus === 'PASS' ? '10/10 AUDITS PASS' : 'FAIL'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {telegramReport.results.map((r) => (
                  <div key={r.testId} className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800/90 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-200 text-[11px]">{r.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        r.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {r.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    <div className="text-[9.5px] text-zinc-400">{r.details}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-500 flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
              <span>Running Telegram Verification Suite...</span>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Diagnostic Logs */}
      {activeTab === 'history' && (
        <div className="p-4 space-y-3">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Diagnostic History Logs ({history.length})
          </div>

          {history.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              No diagnostic records found for this asset.
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((record) => (
                <div key={record.setupId} className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                        record.direction === 'BUY' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {record.direction}
                      </span>
                      <span className="font-bold text-white text-xs">{record.symbol}</span>
                      <span className="text-zinc-500 text-[10px]">({record.setupId})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`font-black text-xs ${
                        (record.finalR || 0) > 0 ? 'text-emerald-400' : (record.finalR || 0) < 0 ? 'text-rose-400' : 'text-zinc-400'
                      }`}>
                        {record.finalR != null ? `${record.finalR > 0 ? '+' : ''}${record.finalR.toFixed(2)}R` : '—'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-bold">
                        {record.finalStatusLabel}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-zinc-400">
                    <div>Entry: <strong className="text-zinc-200">${record.entry.toFixed(2)}</strong></div>
                    <div>SL: <strong className="text-rose-300">${record.sl.toFixed(2)}</strong></div>
                    <div>TP1: <strong className="text-emerald-300">${record.tp1.toFixed(2)} {record.tp1Reached ? '✓' : ''}</strong></div>
                    <div>TP2: <strong className="text-emerald-300">${record.tp2.toFixed(2)} {record.tp2Reached ? '✓' : ''}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
