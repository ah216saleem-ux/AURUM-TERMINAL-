import React, { useState, useEffect } from 'react';
import {
  Activity,
  Radio,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Zap,
  ShieldCheck,
  Search,
  Eye,
  Check,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { PhaseXEngineDiagnostics } from './PhaseXTypes';

export const PhaseXLiveDiagnosticsPanel: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<PhaseXEngineDiagnostics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [testingApproval, setTestingApproval] = useState<boolean>(false);
  const [testResponse, setTestResponse] = useState<any | null>(null);
  const [nowTs, setNowTs] = useState<number>(Date.now());

  const fetchDiagnostics = async () => {
    try {
      const res = await fetch('/api/phase-x/diagnostics');
      if (res.ok) {
        const data: PhaseXEngineDiagnostics = await res.json();
        setDiagnostics(data);
      }
    } catch (err) {
      console.error('[PhaseXDiagnostics] Error fetching diagnostics:', err);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
    const interval = setInterval(() => {
      fetchDiagnostics();
      setNowTs(Date.now());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleStartScan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/phase-x/start-scanning', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDiagnostics(data.diagnostics);
      }
    } catch (err) {
      console.error('[PhaseXDiagnostics] Error starting scan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestApprovalDispatch = async () => {
    setTestingApproval(true);
    setTestResponse(null);
    try {
      const res = await fetch('/api/phase-x/test-approved-signal-dispatch', { method: 'POST' });
      const data = await res.json();
      setTestResponse(data);
      await fetchDiagnostics();
    } catch (err: any) {
      console.error('[PhaseXDiagnostics] Error testing approval dispatch:', err);
      setTestResponse({ success: false, error: err?.message || 'Network error' });
    } finally {
      setTestingApproval(false);
    }
  };

  const timeAgo = (ts: number | null) => {
    if (!ts) return 'Never';
    const seconds = Math.max(0, Math.floor((nowTs - ts) / 1000));
    if (seconds < 60) return `${seconds}s ago`;
    const mins = Math.floor(seconds / 60);
    return `${mins}m ${seconds % 60}s ago`;
  };

  const formatExactTime = (ts: number | null) => {
    if (!ts) return 'Never';
    const d = new Date(ts);
    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`;
  };

  const getEngineStateBadge = (state?: string) => {
    switch (state) {
      case 'APPROVED':
      case 'SENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold uppercase tracking-wider animate-pulse">
            <Send className="w-3.5 h-3.5 text-emerald-400" />
            {state === 'SENT' ? 'SIGNAL SENT TO TELEGRAM' : 'PHASE 5 APPROVED'}
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40 text-xs font-mono font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            TRADE IN PROGRESS
          </span>
        );
      case 'SEARCHING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold uppercase tracking-wider">
            <Search className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
            CONTINUOUS SEARCHING
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            GATE REJECTED → SCANNING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            WAIT — MONITORING
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-800 p-5 shadow-2xl space-y-4 font-mono-num">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide uppercase font-mono">
                Phase X — Continuous Live Engine & Telegram Dispatch Diagnostics
              </h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Live automated XAU/USD market scanner, deterministic Phase 1–5 arbitration & Telegram auto-signal delivery engine
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {getEngineStateBadge(diagnostics?.engineState)}
          
          <button
            onClick={handleTestApprovalDispatch}
            disabled={testingApproval}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-mono font-bold transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-sky-500/10"
            title="Sends a formatted test signal with current live price to verify Telegram pipeline"
          >
            <Send className={`w-3.5 h-3.5 ${testingApproval ? 'animate-bounce' : ''}`} />
            {testingApproval ? 'DISPATCHING TEST...' : 'TEST APPROVAL DISPATCH'}
          </button>

          <button
            onClick={handleStartScan}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'SCANNING...' : 'TRIGGER CYCLE'}
          </button>
        </div>
      </div>

      {/* Grid of Key Diagnostic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Live Market Price */}
        <div className="bg-slate-950/60 rounded-lg p-3.5 border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Verified Live Price (XAU/USD)</span>
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {diagnostics?.currentMarketPrice ? `$${diagnostics.currentMarketPrice.toFixed(2)}` : 'Fetching...'}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              Live Tick • Age: {timeAgo(diagnostics?.lastAnalysisTimestamp || null)}
            </div>
          </div>
        </div>

        {/* 2. Setup Status & Gate */}
        <div className="bg-slate-950/60 rounded-lg p-3.5 border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Current Setup Status</span>
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-sm font-bold font-mono text-amber-300 truncate" title={diagnostics?.currentSetupStatus}>
              {diagnostics?.currentSetupStatus || 'SCANNING...'}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              Confidence: {diagnostics?.tradeConfidence || 0}% • Direction: {diagnostics?.direction || 'WAIT'}
            </div>
          </div>
        </div>

        {/* 3. Telegram Auto-Dispatch Telemetry */}
        <div className="bg-slate-950/60 rounded-lg p-3.5 border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Telegram Signal Dispatch</span>
            <Send className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="mt-2">
            <div className="text-sm font-bold font-mono text-sky-300 flex items-center justify-between">
              <span>{diagnostics?.lastTelegramDispatchTimestamp ? 'SENT' : 'ARMED FOR APPROVAL'}</span>
              {diagnostics?.lastTelegramDispatchTimestamp && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  HTTP 200 OK
                </span>
              )}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1 truncate">
              Last Dispatch: <strong className="text-sky-300">{diagnostics?.lastTelegramDispatchTimestamp ? `${formatExactTime(diagnostics.lastTelegramDispatchTimestamp)} (${timeAgo(diagnostics.lastTelegramDispatchTimestamp)})` : 'Never'}</strong>
            </div>
          </div>
        </div>

        {/* 4. Total Cycles & Continuous Engine Status */}
        <div className="bg-slate-950/60 rounded-lg p-3.5 border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Continuous Scanner Loop</span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-sm font-bold font-mono text-emerald-300">
              ACTIVE (2.5s INTERVAL)
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              Total Scans Completed: {diagnostics?.totalScanCount || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Test Response Banner (if user triggers test approval dispatch) */}
      {testResponse && (
        <div className={`p-4 rounded-xl border font-mono text-xs space-y-2 ${
          testResponse.success
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
        }`}>
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-2">
              {testResponse.success ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
              {testResponse.success ? 'TELEGRAM APPROVAL TEST MESSAGE DISPATCHED SUCCESSFULLY' : 'TELEGRAM TEST DISPATCH FAILED'}
            </span>
            <span className="text-[11px] text-slate-400">
              Setup ID: {testResponse.setupId || 'N/A'} • Message ID: {testResponse.messageId || 'Delivered'}
            </span>
          </div>
          {testResponse.textSent && (
            <pre className="p-2.5 rounded bg-black/50 text-[11px] font-mono whitespace-pre-wrap border border-slate-800 text-slate-300">
              {testResponse.textSent}
            </pre>
          )}
        </div>
      )}

      {/* Detailed Live State Details Box */}
      <div className="bg-slate-950/80 rounded-lg p-4 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            Live Market Structure & Active Decision Details
          </span>
          <span className="text-xs font-mono text-slate-400">
            Phase Gate: <span className="text-amber-400 font-bold">{diagnostics?.currentPhaseGate}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="space-y-1.5">
            <div className="text-slate-400">Market Structure & Trigger:</div>
            <div className="text-slate-200 bg-slate-900 px-3 py-2 rounded border border-slate-800">
              {diagnostics?.currentMarketStructure || 'Evaluating closed candle structure across 5M/15M/30M/1H/4H...'}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-slate-400">Current Phase Gate Rejection / Reason:</div>
            <div className="text-amber-300/90 bg-slate-900 px-3 py-2 rounded border border-slate-800">
              {diagnostics?.rejectionReason || 'Phase 1–5 evaluation in progress — awaiting structural confirmation'}
            </div>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="text-slate-400 text-xs font-mono">Next Setup Search Pipeline Status:</div>
          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/30 px-3 py-2 rounded border border-emerald-800/40 text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{diagnostics?.nextSetupSearchStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
