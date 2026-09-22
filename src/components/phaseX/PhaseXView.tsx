import React, { useState, useEffect, useCallback } from 'react';
import { useMarket } from '../../context/MarketContext';
import { PhaseX3DCore, Phase3DMarketState } from './PhaseX3DCore';
import { PhaseXActiveTradeCard } from './PhaseXActiveTradeCard';
import { PhaseXHistoryAndVerification } from './PhaseXHistoryAndVerification';
import { 
  PhaseXResult, 
  PhaseXFinalDirection, 
  PhaseXExecutionStatus, 
  PhaseXWaitReasonCode, 
  PhaseXEngineDetails 
} from './PhaseXTypes';
import { 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Clock, 
  AlertCircle,
  Cpu,
  Crosshair,
  TrendingUp,
  TrendingDown,
  PauseCircle,
  Activity,
  Layers,
  ShieldAlert,
  Target,
  Lock,
  LockOpen,
  KeyRound,
  X,
  ShieldCheck,
  CheckCircle2,
  Database,
  Radio
} from 'lucide-react';

// Phase X operates exclusively in XAU/USD Auto-Signal Mode
const DEDICATED_ASSET = {
  id: 'xau-usd',
  symbol: 'XAU/USD',
  name: 'Gold Spot',
  category: 'Commodities'
};

export const PhaseXView: React.FC = () => {
  const { markets, isDataConnected, dataConnectedStatus } = useMarket();

  const selectedAssetId = 'xau-usd';
  const isEvaluatingRef = React.useRef(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<PhaseXResult | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [lastEvaluatedAt, setLastEvaluatedAt] = useState<string>('');

  // Admin Telemetry Panels Access Control State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState<boolean>(false);

  // Collapsible States for Admin Panels
  const [showEngineDetails1, setShowEngineDetails1] = useState<boolean>(false);
  const [showEngineDetails2, setShowEngineDetails2] = useState<boolean>(false);
  const [showEngineDetails5, setShowEngineDetails5] = useState<boolean>(false);
  const [showEngineDetails3, setShowEngineDetails3] = useState<boolean>(false);

  // Get active market from context for live price display
  const activeMarket = markets.find(m => m.id === selectedAssetId);

  // Verify stored session token on mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem('phase_x_admin_token');
    if (storedToken) {
      fetch(`/api/phase-x/admin-verify?token=${encodeURIComponent(storedToken)}`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.authenticated) {
            setIsAdminAuthenticated(true);
          } else {
            sessionStorage.removeItem('phase_x_admin_token');
          }
        })
        .catch(() => {});
    }
  }, []);

  // Autonomous Multi-Timeframe Analysis with Phase 4 Live Management
  const handleAnalyzePhase = useCallback(async () => {
    if (isEvaluatingRef.current) return;
    isEvaluatingRef.current = true;
    setIsAnalyzing(true);

    try {
      const storedToken = sessionStorage.getItem('phase_x_admin_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`;
      }

      const res = await fetch('/api/phase-x/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          assetId: 'xau-usd',
          clientLivePrice: activeMarket?.price
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data: PhaseXResult = await res.json();
      setAnalysisResult(data);
      setErrorNotice(null);
      setLastEvaluatedAt(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      console.error('[PhaseXView] Analysis error:', err);
      setErrorNotice('WAIT — MARKET DATA (Waiting for verified market data feed)');
    } finally {
      setIsAnalyzing(false);
      isEvaluatingRef.current = false;
    }
  }, [activeMarket?.price]);

  // Initial autonomous analysis on mount + continuous evaluation loop (every 4 seconds)
  useEffect(() => {
    handleAnalyzePhase();

    const interval = setInterval(() => {
      handleAnalyzePhase();
    }, 4000);

    return () => clearInterval(interval);
  }, [handleAnalyzePhase]);

  // Re-evaluate automatically whenever new verified market data tick arrives
  useEffect(() => {
    if (activeMarket?.price && activeMarket.price > 0) {
      handleAnalyzePhase();
    }
  }, [activeMarket?.price, handleAnalyzePhase]);

  const current3DState: Phase3DMarketState = analysisResult?.marketPhase || 'WAIT';
  const confidenceScore = analysisResult?.tradeConfidence || analysisResult?.confidence || 75;

  // Server-Side Admin Auth Verification Handler
  const handleAdminAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPasswordInput.trim()) return;
    setIsAuthSubmitting(true);
    setAdminAuthError(null);

    try {
      const res = await fetch('/api/phase-x/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPasswordInput })
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        sessionStorage.setItem('phase_x_admin_token', data.token);
        setIsAdminAuthenticated(true);
        setShowAdminModal(false);
        setAdminPasswordInput('');
        setShowEngineDetails1(true);
        setShowEngineDetails2(true);
        setShowEngineDetails3(true);
        handleAnalyzePhase();
      } else {
        setAdminAuthError(data.message || 'ACCESS DENIED — INVALID ADMIN PASSWORD');
      }
    } catch (err: any) {
      setAdminAuthError('ACCESS DENIED — SERVER AUTHENTICATION ERROR');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  // Lock Admin Session Handler
  const handleAdminLogout = () => {
    sessionStorage.removeItem('phase_x_admin_token');
    setIsAdminAuthenticated(false);
    setShowEngineDetails1(false);
    setShowEngineDetails2(false);
    setShowEngineDetails5(false);
    setShowEngineDetails3(false);
    handleAnalyzePhase();
  };

  // Panel Toggles with Access Control Gate
  const handleTogglePanel1 = () => {
    if (!isAdminAuthenticated) {
      setAdminAuthError(null);
      setAdminPasswordInput('');
      setShowAdminModal(true);
    } else {
      setShowEngineDetails1(prev => !prev);
    }
  };

  const handleTogglePanel2 = () => {
    if (!isAdminAuthenticated) {
      setAdminAuthError(null);
      setAdminPasswordInput('');
      setShowAdminModal(true);
    } else {
      setShowEngineDetails2(prev => !prev);
    }
  };

  const handleTogglePanel5 = () => {
    if (!isAdminAuthenticated) {
      setAdminAuthError(null);
      setAdminPasswordInput('');
      setShowAdminModal(true);
    } else {
      setShowEngineDetails5(prev => !prev);
    }
  };

  const handleTogglePanel3 = () => {
    if (!isAdminAuthenticated) {
      setAdminAuthError(null);
      setAdminPasswordInput('');
      setShowAdminModal(true);
    } else {
      setShowEngineDetails3(prev => !prev);
    }
  };

  // Helper for formatting user-facing WAIT display states strictly without revealing internal strategy terms
  const getWaitDisplayInfo = (result: PhaseXResult): { title: string; subtitle: string } => {
    const cleanState = result.phase5QualityGate?.cleanWaitState || result.displayStatusLabel;

    if (cleanState === 'WAIT — MARKET DATA' || result.waitReasonCode === 'STALE_FEED' || result.waitReasonCode === 'INSUFFICIENT_DATA') {
      return {
        title: 'WAIT — MARKET DATA',
        subtitle: 'Waiting for verified market data.'
      };
    }

    if (cleanState === 'WAIT — STRUCTURAL INVALIDATION' || result.waitReasonCode === 'STRUCTURE_INVALIDATED') {
      return {
        title: 'WAIT — STRUCTURAL INVALIDATION',
        subtitle: 'Market structure invalidates setup direction.'
      };
    }

    if (cleanState === 'WAIT — RISK NOT QUALIFIED' || result.waitReasonCode === 'RISK_STRUCTURE_UNSUITABLE') {
      return {
        title: 'WAIT — RISK NOT QUALIFIED',
        subtitle: 'Stop loss or risk anchor cannot be safely placed outside noise.'
      };
    }

    if (cleanState === 'WAIT — R:R NOT VIABLE' || result.waitReasonCode === 'RR_NOT_VIABLE') {
      return {
        title: 'WAIT — R:R NOT VIABLE',
        subtitle: 'Target path does not provide qualified 2R/3R reward relative to risk.'
      };
    }

    if (cleanState === 'WAIT — EXTREME VOLATILITY' || result.waitReasonCode === 'EXTREME_VOLATILITY') {
      return {
        title: 'WAIT — EXTREME VOLATILITY',
        subtitle: 'Current market volatility exceeds safety threshold (>2.5x ATR).'
      };
    }

    if (cleanState === 'WAIT — SPREAD UNSAFE') {
      return {
        title: 'WAIT — SPREAD UNSAFE',
        subtitle: 'Spread is too wide relative to risk distance (>15%).'
      };
    }

    if (cleanState === 'WAIT — EVENT RISK') {
      return {
        title: 'WAIT — EVENT RISK',
        subtitle: 'High-impact economic release imminent. Capital protected.'
      };
    }

    if (cleanState === 'WAIT — ENTRY INVALID') {
      return {
        title: 'WAIT — ENTRY INVALID',
        subtitle: 'Pre-entry structure invalidated prior to execution trigger.'
      };
    }

    if (cleanState === 'MISSED ENTRY — DO NOT CHASE' || result.executionStatus === 'MISSED_ENTRY' || result.waitReasonCode === 'ENTRY_EXTENDED') {
      return {
        title: 'MISSED ENTRY — DO NOT CHASE',
        subtitle: 'Price moved beyond entry threshold. Waiting for next opportunity.'
      };
    }

    if (cleanState === 'WAIT — CONFIRMATION WEAK' || result.waitReasonCode === 'LOW_CONFIDENCE') {
      return {
        title: 'WAIT — CONFIRMATION WEAK',
        subtitle: 'Additional confirmation is required (Trade Confidence < 75%).'
      };
    }

    if (cleanState === 'WAIT — DUPLICATE SETUP') {
      return {
        title: 'WAIT — DUPLICATE SETUP',
        subtitle: 'Active setup already under live risk management.'
      };
    }

    if (
      result.waitReasonCode === 'EXECUTION_STRUCTURE_UNCONFIRMED' ||
      result.executionStatus === 'WAITING_FOR_ENTRY' ||
      (result.userOutputState && result.userOutputState.includes('DEVELOPING'))
    ) {
      return {
        title: 'WAIT — ENTRY FORMING',
        subtitle: 'Market conditions detected. Waiting for final confirmation.'
      };
    }

    return {
      title: cleanState || 'WAIT — SETUP NOT CONFIRMED',
      subtitle: 'PHASE X is scanning for a high-confidence entry.'
    };
  };

  const liveDetails = analysisResult?.engineDetails?.liveTradeDetails;
  const decimals = analysisResult?.engineDetails?.decimals || 2;

  return (
    <div className="w-full space-y-4 font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-[#0d101d] via-[#090b14] to-[#07080d] border border-amber-500/30 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-[1px] shadow-lg shadow-amber-500/10">
            <div className="w-full h-full rounded-[11px] bg-[#08090f] flex items-center justify-center">
              <Crosshair className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black font-mono-num tracking-wider text-white">
                PHASE X
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                PHASE 5 ENGINE
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">
              Market Cycle Intelligence • Precision Entry • Protected SL & Take Profit • Live Trade Management • Final Quality Gate
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {isAdminAuthenticated && (
            <button
              onClick={handleAdminLogout}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-[11px] font-bold transition cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>LOCK ADMIN SESSION</span>
            </button>
          )}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Deterministic Tick Evaluation</span>
          </span>
        </div>
      </div>

      {/* 2. PHASE X — AI Intelligence Network 3D Visualization */}
      <PhaseX3DCore
        marketState={current3DState}
        confidence={confidenceScore}
        isAnalyzing={isAnalyzing}
      />

      {/* 3. Dedicated Autonomous XAU/USD Monitoring Control Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0c16] border border-amber-500/30 shadow-xl font-mono space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Dedicated XAU/USD Asset & Real-Time Price */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-[1px] shadow-lg shadow-amber-500/10 shrink-0">
              <div className="w-full h-full rounded-[11px] bg-[#090b14] flex items-center justify-center">
                <Crosshair className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black text-white tracking-wider">
                  XAU/USD
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  GOLD SPOT
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-800/80 text-zinc-300 border border-zinc-700">
                  COMMODITIES
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-zinc-400 pt-0.5">
                <span>Live Price:</span>
                <span className="text-sm font-bold text-amber-300">
                  ${(activeMarket?.price ?? analysisResult?.currentLivePrice ?? 0).toFixed(2)}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-[11px] text-zinc-400">
                  15M Close: ${(analysisResult?.signalConfirmationPrice ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: AUTO MONITORING Indicator & Current Status */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Clear AUTO MONITORING Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-lg shadow-emerald-500/10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="tracking-wide">AUTO MONITORING: ACTIVE</span>
            </div>

            {/* Current Engine Status */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
              analysisResult?.executionStatus === 'READY'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : analysisResult?.executionStatus === 'ACTIVE'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : analysisResult?.executionStatus === 'WAITING_FOR_ENTRY'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300'
            }`}>
              <span className="text-[10px] text-zinc-400 font-normal uppercase">Status:</span>
              <span className="tracking-wider">
                {!analysisResult
                  ? 'CONNECTING...'
                  : analysisResult.finalDirection === 'WAIT' || analysisResult.executionStatus === 'WAIT'
                  ? analysisResult.displayStatusLabel || 'WAIT'
                  : analysisResult.executionStatus === 'READY'
                  ? `READY (${analysisResult.finalDirection})`
                  : analysisResult.executionStatus === 'WAITING_FOR_ENTRY'
                  ? `PENDING ENTRY (${analysisResult.finalDirection})`
                  : analysisResult.executionStatus === 'ACTIVE'
                  ? `ACTIVE (${analysisResult.finalDirection})`
                  : analysisResult.displayStatusLabel || analysisResult.executionStatus || 'WAIT'}
              </span>
            </div>
          </div>
        </div>

        {/* Continuous Monitoring Heartbeat Sub-bar */}
        <div className="pt-2.5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Continuous Real-Time Evaluation • Re-evaluating on verified ticks & closed candles</span>
          </div>
          <div className="flex items-center gap-3 font-mono">
            {isAnalyzing && (
              <span className="inline-flex items-center gap-1.5 text-amber-400">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Evaluating...</span>
              </span>
            )}
            {lastEvaluatedAt && (
              <span className="text-zinc-500">
                Last cycle: <strong className="text-zinc-300">{lastEvaluatedAt}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error / Data Status Banner */}
      {errorNotice && (
        <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* 4. PHASE X Result Card (Phase 4 Active Trade Card or Strict Clean User WAIT Card) */}
      {analysisResult && (
        <>
          {analysisResult.finalDirection !== 'WAIT' && (analysisResult.executionStatus === 'READY' || analysisResult.executionStatus === 'WAITING_FOR_ENTRY' || analysisResult.liveTradeDetails != null) ? (
            <PhaseXActiveTradeCard
              result={analysisResult}
              onRefresh={() => handleAnalyzePhase()}
            />
          ) : (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#0e111d] to-[#07090f] border border-amber-500/40 shadow-2xl space-y-4 font-mono-num relative overflow-hidden">
              <div className="pointer-events-none absolute -top-16 inset-x-0 h-32 bg-amber-500/10 blur-3xl" />

              {/* Asset Info Header */}
              <div className="text-center space-y-1">
                <div className="text-xs font-mono font-semibold text-zinc-400">
                  {analysisResult.assetName}
                </div>
                <div className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  {analysisResult.symbol}
                </div>
                <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-center gap-3">
                  <span>Live Market: <strong className="text-amber-300">{analysisResult.currentLivePrice.toFixed(analysisResult.currentLivePrice < 5 ? 4 : 2)}</strong></span>
                  <span className="text-zinc-600">•</span>
                  <span>15M Confirmation Bar: <strong className="text-zinc-300">{analysisResult.signalConfirmationPrice.toFixed(analysisResult.signalConfirmationPrice < 5 ? 4 : 2)}</strong></span>
                </div>
              </div>

              {/* Strict Clean User-Facing WAIT Card without Internal Strategy Terminology */}
              <div className="text-center pt-2">
                {(() => {
                  const waitInfo = getWaitDisplayInfo(analysisResult);
                  return (
                    <div className="inline-flex flex-col items-center gap-1.5 p-3.5 sm:px-8 sm:py-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/60 shadow-lg shadow-amber-500/20 max-w-lg mx-auto">
                      <div className="flex items-center gap-2 text-amber-300 font-mono font-black text-base sm:text-lg tracking-wider text-center">
                        <PauseCircle className="w-5 h-5 text-amber-400 shrink-0" />
                        <span>{waitInfo.title}</span>
                      </div>
                      <div className="text-xs font-mono text-zinc-300 text-center font-medium">
                        {waitInfo.subtitle}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Verification Timestamp */}
              <div className="text-[10px] font-mono text-zinc-400 pt-2 flex items-center justify-center gap-1.5 border-t border-zinc-800/60">
                <Clock className="w-3 h-3 text-zinc-400" />
                <span>Closed-candle verified: {analysisResult.engineDetails?.lastClosedCandleTimeFormatted || 'Live Verified'}</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* 5. ADMIN PANEL 1: PHASE X ENGINE DETAILS (Locked for normal user) */}
      <div className="rounded-2xl bg-[#090b14] border border-amber-500/30 overflow-hidden shadow-lg font-mono">
        <button
          onClick={handleTogglePanel1}
          className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-zinc-300 hover:text-amber-300 transition cursor-pointer bg-gradient-to-r from-[#0d101d] to-[#080911]"
        >
          <div className="flex items-center gap-2">
            {isAdminAuthenticated ? (
              <LockOpen className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="uppercase tracking-wider font-extrabold text-white">
              {isAdminAuthenticated ? '🔓' : '🔒'} PHASE X ENGINE DETAILS
            </span>
            <span className="text-[10px] text-zinc-400 font-normal">
              (Admin, Telemetry & Confidence Matrix)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isAdminAuthenticated && (
              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                LOCKED
              </span>
            )}
            {isAdminAuthenticated ? (
              showEngineDetails1 ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            )}
          </div>
        </button>

        {isAdminAuthenticated && showEngineDetails1 && analysisResult && (
          <div className="p-4 pt-2 border-t border-zinc-800/80 space-y-3 text-[11px] text-zinc-300 bg-[#07080f]">
            {/* Phase 3 Stop Loss & Take Profit Telemetry */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Phase 3 Protected SL & TP Mathematical Telemetry</span>
                </span>
                <span className="text-[10px] text-zinc-400">
                  SL Source: <strong className={`font-bold ${analysisResult.engineDetails.slAnchorSource === '5M' ? 'text-emerald-300' : 'text-amber-300'}`}>{analysisResult.engineDetails.slAnchorSource}</strong>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
                <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/60">
                  <span className="text-zinc-400 font-semibold block text-[10px]">SL Structural Anchor:</span>
                  <span className="font-bold text-white">
                    {analysisResult.engineDetails.slStructuralAnchor != null 
                      ? `${analysisResult.engineDetails.slStructuralAnchor.toFixed(decimals)} (${analysisResult.engineDetails.slAnchorType})`
                      : 'N/A'}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/60">
                  <span className="text-zinc-400 font-semibold block text-[10px]">5M ATR & Noise Multiplier:</span>
                  <span className="font-bold text-amber-300">
                    ATR: {analysisResult.engineDetails.atr5M} • Mult: {analysisResult.engineDetails.atrBufferMultiplier}x
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/60">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Final Protected SL:</span>
                  <span className="font-bold text-rose-400">
                    {analysisResult.engineDetails.finalProtectedSL ? analysisResult.engineDetails.finalProtectedSL.toFixed(decimals) : 'N/A'}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/60">
                  <span className="text-zinc-400 font-semibold block text-[10px]">SL Distance & ATR Multiple:</span>
                  <span className="font-bold text-zinc-200">
                    {analysisResult.engineDetails.slDistance != null ? `${analysisResult.engineDetails.slDistance.toFixed(decimals)} (${analysisResult.engineDetails.slDistanceAtr} ATR)` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Phase 2 Trade Decision Telemetry */}
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                  <span>Phase 2 Decision & Precision Entry Telemetry</span>
                </span>
                <span className="text-[10px] text-zinc-400">
                  Setup ID: <strong className="text-zinc-300">{analysisResult.setupId}</strong>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
                <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/60">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Final Direction:</span>
                  <span className="font-bold text-white">{analysisResult.finalDirection}</span>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/60">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Execution Status:</span>
                  <span className="font-bold text-amber-300">{analysisResult.executionStatus}</span>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/60">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Trade Confidence:</span>
                  <span className="font-bold text-white">{analysisResult.tradeConfidence}%</span>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/60">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Wait Reason Code:</span>
                  <span className="font-bold text-zinc-300">{analysisResult.waitReasonCode}</span>
                </div>
              </div>
            </div>

            {/* Trade Confidence Breakdown Matrix */}
            {analysisResult.engineDetails.tradeConfidenceBreakdown && (
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Trade Confidence Scoring Breakdown (Gate: 75%)</span>
                  </span>
                  <span className="font-bold text-amber-300 text-[10.5px]">
                    Total: {analysisResult.engineDetails.tradeConfidenceBreakdown.totalScore} pts
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-[10px]">
                  <div className="p-1.5 rounded bg-black/40 border border-zinc-800">
                    <span className="text-zinc-400 block">4H Macro Context:</span>
                    <span className="font-bold text-zinc-200">{analysisResult.engineDetails.tradeConfidenceBreakdown.htfMacroContextScore} / 15</span>
                  </div>
                  <div className="p-1.5 rounded bg-black/40 border border-zinc-800">
                    <span className="text-zinc-400 block">Wyckoff Phase:</span>
                    <span className="font-bold text-zinc-200">{analysisResult.engineDetails.tradeConfidenceBreakdown.wyckoffPhaseQualityScore} / 15</span>
                  </div>
                  <div className="p-1.5 rounded bg-black/40 border border-zinc-800">
                    <span className="text-zinc-400 block">Wyckoff Event:</span>
                    <span className="font-bold text-zinc-200">{analysisResult.engineDetails.tradeConfidenceBreakdown.wyckoffEventQualityScore} / 15</span>
                  </div>
                  <div className="p-1.5 rounded bg-black/40 border border-zinc-800">
                    <span className="text-zinc-400 block">30M Setup:</span>
                    <span className="font-bold text-zinc-200">{analysisResult.engineDetails.tradeConfidenceBreakdown.setupConfirmation30MScore} / 15</span>
                  </div>
                  <div className="p-1.5 rounded bg-black/40 border border-zinc-800">
                    <span className="text-zinc-400 block">15M Trigger:</span>
                    <span className="font-bold text-zinc-200">{analysisResult.engineDetails.tradeConfidenceBreakdown.executionTrigger15MScore} / 15</span>
                  </div>
                </div>
              </div>
            )}

            {/* Autonomous Multi-Timeframe Alignment Matrix */}
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold uppercase text-[10px]">
                  Autonomous Multi-Timeframe Engine Synthesis
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                  analysisResult.engineDetails.timeframeAlignment === 'ALIGNED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : analysisResult.engineDetails.timeframeAlignment === 'PARTIALLY ALIGNED'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {analysisResult.engineDetails.timeframeAlignment}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
                <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/60">
                  <span className="text-zinc-400 font-semibold block text-[10px]">4H Macro Context Layer:</span>
                  <span className="text-zinc-200">{analysisResult.engineDetails.fourHourContext}</span>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/60">
                  <span className="text-zinc-400 font-semibold block text-[10px]">1H Primary Wyckoff Phase:</span>
                  <span className="text-zinc-200">{analysisResult.engineDetails.oneHourPhase}</span>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/60">
                  <span className="text-zinc-400 font-semibold block text-[10px]">30M Setup Confirmation:</span>
                  <span className="text-zinc-200">{analysisResult.engineDetails.thirtyMinSetup}</span>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/60">
                  <span className="text-zinc-400 font-semibold block text-[10px]">15M Micro Structure:</span>
                  <span className="text-zinc-200">{analysisResult.engineDetails.fifteenMinStructure}</span>
                </div>
              </div>
            </div>

            {/* Invalidation Architecture (15M Execution Anchor) */}
            {analysisResult.engineDetails.precisionExecution15M && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase text-[10px]">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span>Micro Invalidation Architecture (15M Execution Anchor)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-zinc-300 text-[10.5px]">
                  <div>
                    <span className="text-zinc-400 text-[10px] block">Execution Timeframe:</span>
                    <span className="font-bold text-amber-300">15M (Micro Pivot)</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 text-[10px] block">15M Micro Swing High:</span>
                    <span className="font-bold text-white">{analysisResult.engineDetails.precisionExecution15M.microSwingHigh.toFixed(decimals)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 text-[10px] block">15M Micro Swing Low:</span>
                    <span className="font-bold text-white">{analysisResult.engineDetails.precisionExecution15M.microSwingLow.toFixed(decimals)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 text-[10px] block">15M ATR:</span>
                    <span className="font-bold text-white">{analysisResult.engineDetails.precisionExecution15M.microAtr}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Real Data Lineage & Data Provenance Matrix (Admin Only) */}
            {analysisResult.engineDetails.dataProvenance && (
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1.5">
                  <span className="text-cyan-300 font-bold uppercase text-[10px] flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Real Market Data Lineage & Data Provenance Audit</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold uppercase border ${
                    analysisResult.engineDetails.dataProvenance.realDataStatus === 'VERIFIED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : analysisResult.engineDetails.dataProvenance.realDataStatus === 'DEGRADED'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}>
                    {analysisResult.engineDetails.dataProvenance.realDataStatus}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
                  <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/60">
                    <span className="text-zinc-400 font-semibold block text-[10px]">Live Data Provider:</span>
                    <span className="font-bold text-cyan-300">{analysisResult.engineDetails.dataProvenance.liveDataProvider}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/60">
                    <span className="text-zinc-400 font-semibold block text-[10px]">Instrument / Symbol:</span>
                    <span className="font-bold text-white">{analysisResult.engineDetails.dataProvenance.instrumentSymbol}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/60">
                    <span className="text-zinc-400 font-semibold block text-[10px]">Bid/Ask Availability:</span>
                    <span className="font-bold text-zinc-200">{analysisResult.engineDetails.dataProvenance.bidAskAvailability}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/60">
                    <span className="text-zinc-400 font-semibold block text-[10px]">Tick Age / Freshness:</span>
                    <span className="font-bold text-emerald-300">
                      {analysisResult.engineDetails.dataProvenance.tickAgeFormatted} • {analysisResult.engineDetails.dataProvenance.dataFreshnessStatus}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/60 col-span-2">
                    <span className="text-zinc-400 font-semibold block text-[10px]">Candle Data Sources (5M to 4H):</span>
                    <span className="font-bold text-zinc-200 text-[10px]">
                      5M: {analysisResult.engineDetails.dataProvenance.candleSource5M}<br />
                      15M: {analysisResult.engineDetails.dataProvenance.candleSource15M}<br />
                      1H/4H: {analysisResult.engineDetails.dataProvenance.candleSource1H}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/60">
                    <span className="text-zinc-400 font-semibold block text-[10px]">Fallback Provider Used:</span>
                    <span className={`font-bold ${analysisResult.engineDetails.dataProvenance.fallbackProviderUsed ? 'text-amber-300' : 'text-emerald-400'}`}>
                      {analysisResult.engineDetails.dataProvenance.fallbackProviderUsed ? 'YES' : 'NO'}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/60">
                    <span className="text-zinc-400 font-semibold block text-[10px]">Data Gaps Detected:</span>
                    <span className="font-bold text-emerald-400">{analysisResult.engineDetails.dataProvenance.dataGapsDetails}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. ADMIN PANEL 2: PHASE 4 ENGINE DETAILS (Locked for normal user) */}
      <div className="rounded-2xl bg-[#090b14] border border-amber-500/30 overflow-hidden shadow-lg font-mono">
        <button
          onClick={handleTogglePanel2}
          className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-zinc-300 hover:text-amber-300 transition cursor-pointer bg-gradient-to-r from-[#0d101d] to-[#080911]"
        >
          <div className="flex items-center gap-2">
            {isAdminAuthenticated ? (
              <LockOpen className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="uppercase tracking-wider font-extrabold text-white">
              {isAdminAuthenticated ? '🔓' : '🔒'} PHASE 4 ENGINE DETAILS
            </span>
            <span className="text-[10px] text-zinc-400 font-normal">
              (Live Trade Management & Capital Protection)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isAdminAuthenticated && (
              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                LOCKED
              </span>
            )}
            {isAdminAuthenticated ? (
              showEngineDetails2 ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            )}
          </div>
        </button>

        {isAdminAuthenticated && showEngineDetails2 && analysisResult && (
          <div className="p-4 pt-2 border-t border-zinc-800/80 space-y-3 text-[11px] text-zinc-300 bg-[#07080f]">
            {/* Phase 4 Full Telemetry Matrix */}
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                <span className="text-purple-300 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-purple-400" />
                  <span>Phase 4 Live Management & Level-Lock Telemetry (24 Attributes)</span>
                </span>
                <span className="text-[10px] text-zinc-400">
                  Lifecycle State: <strong className="text-purple-300 font-bold">{liveDetails?.lifecycleState || analysisResult.lifecycleState || 'NONE'}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
                {/* 1. Setup ID */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Setup ID:</span>
                  <span className="font-bold text-amber-300 truncate block">{analysisResult.setupId}</span>
                </div>

                {/* 2. Lifecycle State */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Lifecycle State:</span>
                  <span className="font-bold text-purple-300">{liveDetails?.lifecycleState || 'NONE'}</span>
                </div>

                {/* 3. Locked Entry */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Locked Entry Price:</span>
                  <span className="font-bold text-amber-300">
                    {liveDetails?.lockedEntry != null ? liveDetails.lockedEntry.toFixed(decimals) : (analysisResult.preferredEntry ? analysisResult.preferredEntry.toFixed(decimals) : 'N/A')}
                  </span>
                </div>

                {/* 4. Locked SL */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Locked Stop Loss:</span>
                  <span className="font-bold text-rose-400">
                    {liveDetails?.lockedSL != null ? liveDetails.lockedSL.toFixed(decimals) : (analysisResult.stopLoss ? analysisResult.stopLoss.toFixed(decimals) : 'N/A')}
                  </span>
                </div>

                {/* 5. Locked TP1 */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Locked Take Profit 1:</span>
                  <span className="font-bold text-emerald-400">
                    {liveDetails?.lockedTP1 != null ? liveDetails.lockedTP1.toFixed(decimals) : (analysisResult.takeProfit1 ? analysisResult.takeProfit1.toFixed(decimals) : 'N/A')}
                  </span>
                </div>

                {/* 6. Locked TP2 */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Locked Take Profit 2:</span>
                  <span className="font-bold text-sky-400">
                    {liveDetails?.lockedTP2 != null ? liveDetails.lockedTP2.toFixed(decimals) : (analysisResult.takeProfit2 ? analysisResult.takeProfit2.toFixed(decimals) : 'N/A')}
                  </span>
                </div>

                {/* 7. Original Risk */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Original Risk (1R):</span>
                  <span className="font-bold text-zinc-200">
                    {liveDetails?.originalRisk != null ? `${liveDetails.originalRisk.toFixed(decimals)} pts` : (analysisResult.riskDistance ? `${analysisResult.riskDistance.toFixed(decimals)} pts` : 'N/A')}
                  </span>
                </div>

                {/* 8. Activation Price */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Activation Price:</span>
                  <span className="font-bold text-amber-300">
                    {liveDetails?.activationPrice != null ? liveDetails.activationPrice.toFixed(decimals) : 'N/A'}
                  </span>
                </div>

                {/* 9. Current Verified Price */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Current Verified Price:</span>
                  <span className="font-bold text-white">
                    {liveDetails?.currentVerifiedPrice ? liveDetails.currentVerifiedPrice.toFixed(decimals) : analysisResult.currentLivePrice.toFixed(decimals)}
                  </span>
                </div>

                {/* 10. Current R */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Current Progress R:</span>
                  <span className="font-bold text-emerald-400">
                    {liveDetails?.currentLiveR != null ? `${liveDetails.currentLiveR > 0 ? '+' : ''}${liveDetails.currentLiveR.toFixed(2)}R` : (analysisResult.liveProgressR != null ? `${analysisResult.liveProgressR.toFixed(2)}R` : '0.00R')}
                  </span>
                </div>

                {/* 11. Price Source */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Price Feed Source:</span>
                  <span className="font-bold text-zinc-200">{liveDetails?.priceSource || 'VERIFIED_WEBSOCKET_ORACLE'}</span>
                </div>

                {/* 12. Bid/Ask Availability */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Bid/Ask Availability:</span>
                  <span className="font-bold text-white">{liveDetails?.bidAskAvailability || 'UNAVAILABLE'}</span>
                </div>

                {/* 13. Entry Timestamp */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Entry Activation Time:</span>
                  <span className="font-bold text-zinc-300 text-[10px]">
                    {liveDetails?.entryTimestamp ? new Date(liveDetails.entryTimestamp).toLocaleString('en-US', { timeZone: 'America/New_York' }) + ' ET' : 'N/A'}
                  </span>
                </div>

                {/* 14. TP1 Timestamp */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">TP1 Execution Time:</span>
                  <span className="font-bold text-emerald-300 text-[10px]">
                    {liveDetails?.tp1Timestamp ? new Date(liveDetails.tp1Timestamp).toLocaleString('en-US', { timeZone: 'America/New_York' }) + ' ET' : 'N/A'}
                  </span>
                </div>

                {/* 15. TP2 Timestamp */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">TP2 Execution Time:</span>
                  <span className="font-bold text-sky-300 text-[10px]">
                    {liveDetails?.tp2Timestamp ? new Date(liveDetails.tp2Timestamp).toLocaleString('en-US', { timeZone: 'America/New_York' }) + ' ET' : 'N/A'}
                  </span>
                </div>

                {/* 16. SL Timestamp */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">SL Hit Timestamp:</span>
                  <span className="font-bold text-rose-300 text-[10px]">
                    {liveDetails?.slTimestamp ? new Date(liveDetails.slTimestamp).toLocaleString('en-US', { timeZone: 'America/New_York' }) + ' ET' : 'N/A'}
                  </span>
                </div>

                {/* 17. Expiration Status */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Expiration Status:</span>
                  <span className="font-bold text-zinc-200">{liveDetails?.expirationStatus || 'NOT_EXPIRED'}</span>
                </div>

                {/* 18. Pre-entry Invalidation Status */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Pre-entry Invalidation:</span>
                  <span className="font-bold text-zinc-200">{liveDetails?.preEntryInvalidationStatus || 'VALID'}</span>
                </div>

                {/* 19. Gap Execution Uncertainty */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Gap / Slippage Risk:</span>
                  <span className={`font-bold ${liveDetails?.gapExecutionUncertainty ? 'text-amber-300' : 'text-emerald-400'}`}>
                    {liveDetails?.gapExecutionUncertainty ? 'UNCERTAINTY DETECTED' : 'NONE'}
                  </span>
                </div>

                {/* 20. Last Verified Price Timestamp */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Last Verified Tick:</span>
                  <span className="font-bold text-zinc-300 text-[10px]">
                    {liveDetails?.lastVerifiedPriceTimestamp ? new Date(liveDetails.lastVerifiedPriceTimestamp).toLocaleString('en-US', { timeZone: 'America/New_York' }) + ' ET' : 'N/A'}
                  </span>
                </div>

                {/* 21. Concurrent Trades / Maximum */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Concurrent Trades Cap:</span>
                  <span className="font-bold text-white">
                    {liveDetails?.concurrentActiveTrades ?? 0} / {liveDetails?.maxConcurrentAllowed ?? 1}
                  </span>
                </div>

                {/* 22. Session Status */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Session Status:</span>
                  <span className="font-bold text-emerald-400">
                    {liveDetails?.currentSessionStatus || 'OPEN'}
                  </span>
                </div>

                {/* 23. Spread at Activation */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Spread at Activation:</span>
                  <span className="font-bold text-amber-300">
                    {typeof liveDetails?.spreadAtActivation === 'number' ? `${liveDetails.spreadAtActivation} pts` : liveDetails?.spreadAtActivation || 'N/A'}
                  </span>
                </div>

                {/* 24. Cancellation Source */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400 font-semibold block text-[10px]">Cancellation Source:</span>
                  <span className="font-bold text-zinc-300">{liveDetails?.cancellationSource || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7. ADMIN PANEL: PHASE 5 ENGINE DETAILS (Final Signal Quality & Execution Gate) */}
      <div className="rounded-2xl bg-[#090b14] border border-amber-500/30 overflow-hidden shadow-lg font-mono">
        <button
          onClick={handleTogglePanel5}
          className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-zinc-300 hover:text-amber-300 transition cursor-pointer bg-gradient-to-r from-[#0d101d] to-[#080911]"
        >
          <div className="flex items-center gap-2">
            {isAdminAuthenticated ? (
              <LockOpen className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="uppercase tracking-wider font-extrabold text-white">
              {isAdminAuthenticated ? '🔓' : '🔒'} PHASE 5 ENGINE DETAILS
            </span>
            <span className="text-[10px] text-zinc-400 font-normal">
              (Final Signal Quality & Execution Gate)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isAdminAuthenticated && (
              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                LOCKED
              </span>
            )}
            {isAdminAuthenticated ? (
              showEngineDetails5 ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            )}
          </div>
        </button>

        {isAdminAuthenticated && showEngineDetails5 && analysisResult && (
          <div className="p-4 pt-2 border-t border-zinc-800/80 space-y-3 text-[11px] text-zinc-300 bg-[#07080f]">
            {/* Gate Evaluation Result Banner */}
            <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
              analysisResult.phase5QualityGate?.finalGateStatus === 'APPROVED'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-[11px] block">
                    PHASE 5 DETERMINISTIC GATE: {analysisResult.phase5QualityGate?.finalGateStatus || 'REJECTED'}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Fail-Closed Arbitration • 17 Quality Dimensions • 11 Priority Tiers
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold uppercase border ${
                  analysisResult.phase5QualityGate?.finalGateStatus === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  GATE: {analysisResult.phase5QualityGate?.finalGateStatus || 'REJECTED'}
                </span>
                <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  DATA: {analysisResult.phase5QualityGate?.liveDataStatus || 'VERIFIED'}
                </span>
              </div>
            </div>

            {/* Primary Rejection & Clean Wait State if Rejected */}
            {analysisResult.phase5QualityGate?.finalGateStatus === 'REJECTED' && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10.5px] flex items-center justify-between">
                <div>
                  <span className="font-bold block">
                    Priority #{analysisResult.phase5QualityGate.rejectionPriority || 1} Reason: {analysisResult.phase5QualityGate.primaryRejectionReason}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Clean Wait Output: <strong className="text-white">{analysisResult.phase5QualityGate.cleanWaitState}</strong>
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 font-bold text-[9.5px]">
                  FAIL-CLOSED
                </span>
              </div>
            )}

            {/* 17 Quality Dimensions Grid */}
            <div className="space-y-1.5">
              <div className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                <span>Phase 5 Deterministic Quality Checks (17 Attributes)</span>
                <span className="text-[10px] text-amber-400">Priority Tiers 1–11</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[10px]">
                {/* 1. Market Data Status */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-semibold">1. Market Data Feed:</span>
                    <span className={`font-bold ${analysisResult.phase5QualityGate?.liveDataStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {analysisResult.phase5QualityGate?.liveDataStatus || 'VERIFIED'}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[9.5px]">Tick Age: {analysisResult.phase5QualityGate?.tickAgeFormatted || '0.0s'}</span>
                </div>

                {/* 2. 4H Macro Bias */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-semibold">2. 4H Macro Bias:</span>
                    <span className={`font-bold ${analysisResult.phase5QualityGate?.alignment4H === 'ALIGNED' ? 'text-emerald-400' : analysisResult.phase5QualityGate?.alignment4H === 'CONFLICTING' ? 'text-rose-400' : 'text-zinc-300'}`}>
                      {analysisResult.phase5QualityGate?.alignment4H || 'NEUTRAL'}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[9.5px] truncate block">{analysisResult.phase5QualityGate?.alignment4HDetails}</span>
                </div>

                {/* 3. 1H Wyckoff Phase */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-semibold">3. 1H Wyckoff Phase:</span>
                    <span className={`font-bold ${analysisResult.phase5QualityGate?.alignment1H === 'ALIGNED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {analysisResult.phase5QualityGate?.alignment1H || 'ALIGNED'}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[9.5px] truncate block">{analysisResult.phase5QualityGate?.alignment1HDetails}</span>
                </div>

                {/* 4. 30M Confirmation */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-semibold">4. 30M Confirmation:</span>
                    <span className={`font-bold ${analysisResult.phase5QualityGate?.confirmation30M === 'CONFIRMED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {analysisResult.phase5QualityGate?.confirmation30M || 'UNCONFIRMED'}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[9.5px] truncate block">{analysisResult.phase5QualityGate?.confirmation30MDetails}</span>
                </div>

                {/* 5. 15M Trigger */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-semibold">5. 15M Micro Trigger:</span>
                    <span className={`font-bold ${analysisResult.phase5QualityGate?.execution15M === 'TRIGGERED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {analysisResult.phase5QualityGate?.execution15M || 'PENDING'}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[9.5px] truncate block">{analysisResult.phase5QualityGate?.execution15MDetails}</span>
                </div>

                {/* 6. 5M SL Anchor */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-semibold">6. 5M Structural Anchor:</span>
                    <span className={`font-bold ${analysisResult.phase5QualityGate?.riskValidation5M === 'VALID' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {analysisResult.phase5QualityGate?.riskValidation5M || 'VALID'}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[9.5px] truncate block">{analysisResult.phase5QualityGate?.riskValidation5MDetails}</span>
                </div>

                {/* 7. Entry Invalidation */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-semibold">7. Entry Structure:</span>
                    <span className={`font-bold ${analysisResult.phase5QualityGate?.entryValidation === 'VALID' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {analysisResult.phase5QualityGate?.entryValidation || 'VALID'}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[9.5px] truncate block">{analysisResult.phase5QualityGate?.entryValidationDetails}</span>
                </div>

                {/* 8. Anti-Chase Validation (<0.5 ATR) */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-semibold">8. Anti-Chase (&lt;0.5 ATR):</span>
                    <span className={`font-bold ${analysisResult.phase5QualityGate?.antiChaseValidation === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {analysisResult.phase5QualityGate?.antiChaseValidation || 'PASS'}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[9.5px] truncate block">{analysisResult.phase5QualityGate?.antiChaseDetails}</span>
                </div>

                {/* 9. Stop Loss Safety */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-semibold">9. SL Placement Safety:</span>
                    <span className={`font-bold ${analysisResult.phase5QualityGate?.slValidation === 'SAFE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {analysisResult.phase5QualityGate?.slValidation || 'SAFE'}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[9.5px] truncate block">{analysisResult.phase5QualityGate?.slValidationDetails}</span>
                </div>

                {/* 10. Noise Wick Validation */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-semibold">10. Noise Wick Clearance:</span>
                    <span className={`font-bold ${analysisResult.phase5QualityGate?.noiseValidation === 'OUTSIDE_NOISE_WICK' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {analysisResult.phase5QualityGate?.noiseValidation || 'OUTSIDE_NOISE_WICK'}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[9.5px] truncate block">{analysisResult.phase5QualityGate?.noiseValidationDetails}</span>
                </div>

                {/* 11. TP1 Viability (>=2R) */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-semibold">11. TP1 Path (≥2R):</span>
                    <span className={`font-bold ${analysisResult.phase5QualityGate?.tp1Validation === 'QUALIFIED_2R' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {analysisResult.phase5QualityGate?.tp1Validation || 'QUALIFIED_2R'}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[9.5px] truncate block">{analysisResult.phase5QualityGate?.tp1ValidationDetails}</span>
                </div>

                {/* 12. TP2 Viability (>=3R) */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-semibold">12. TP2 Path (≥3R):</span>
                    <span className={`font-bold ${analysisResult.phase5QualityGate?.tp2Validation === 'QUALIFIED_3R' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {analysisResult.phase5QualityGate?.tp2Validation || 'QUALIFIED_3R'}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[9.5px] truncate block">{analysisResult.phase5QualityGate?.tp2ValidationDetails}</span>
                </div>

                {/* 13. R:R Synthesis */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-semibold">13. R:R Viability Synthesis:</span>
                    <span className={`font-bold ${analysisResult.phase5QualityGate?.rrValidation === 'QUALIFIED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {analysisResult.phase5QualityGate?.rrValidation || 'QUALIFIED'}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[9.5px] truncate block">{analysisResult.phase5QualityGate?.rrValidationDetails}</span>
                </div>

                {/* 14. Volatility Regime */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-semibold">14. Volatility Threshold:</span>
                    <span className={`font-bold ${analysisResult.phase5QualityGate?.volatilityStatus === 'SAFE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {analysisResult.phase5QualityGate?.volatilityStatus || 'SAFE'}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[9.5px] truncate block">{analysisResult.phase5QualityGate?.volatilityDetails}</span>
                </div>

                {/* 15. Spread Safety */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-semibold">15. Spread Fraction (&lt;15%):</span>
                    <span className={`font-bold ${analysisResult.phase5QualityGate?.spreadStatus === 'SAFE' ? 'text-emerald-400' : analysisResult.phase5QualityGate?.spreadStatus === 'LIMITED' ? 'text-amber-300' : 'text-rose-400'}`}>
                      {analysisResult.phase5QualityGate?.spreadStatus || 'SAFE'}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[9.5px] truncate block">{analysisResult.phase5QualityGate?.spreadDetails}</span>
                </div>

                {/* 16. Event Risk / News Gate */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-semibold">16. Event Risk (±15m):</span>
                    <span className={`font-bold ${analysisResult.phase5QualityGate?.newsEventStatus === 'CLEAR' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {analysisResult.phase5QualityGate?.newsEventStatus || 'CLEAR'}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[9.5px] truncate block">{analysisResult.phase5QualityGate?.newsEventDetails}</span>
                </div>

                {/* 17. Trade Confidence */}
                <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-semibold">17. Confidence Gate (≥75%):</span>
                    <span className={`font-bold ${analysisResult.phase5QualityGate?.tradeConfidenceStatus === 'QUALIFIED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {analysisResult.phase5QualityGate?.tradeConfidenceScore || 0}% ({analysisResult.phase5QualityGate?.tradeConfidenceStatus || 'WEAK'})
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[9.5px]">Threshold: Minimum 75 pts required</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 8. ADMIN PANEL: PHASE 5 & 4 VERIFICATION & ENGINE HISTORY (Locked for normal user) */}
      <div className="rounded-2xl bg-[#090b14] border border-amber-500/30 overflow-hidden shadow-lg font-mono">
        <button
          onClick={handleTogglePanel3}
          className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-zinc-300 hover:text-amber-300 transition cursor-pointer bg-gradient-to-r from-[#0d101d] to-[#080911]"
        >
          <div className="flex items-center gap-2">
            {isAdminAuthenticated ? (
              <LockOpen className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="uppercase tracking-wider font-extrabold text-white">
              {isAdminAuthenticated ? '🔓' : '🔒'} PHASE 5 & 4 VERIFICATION & ENGINE SUITE
            </span>
            <span className="text-[10px] text-zinc-400 font-normal">
              (Deterministic Quality Gate, Lifecycle Testing & Trade Records)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isAdminAuthenticated && (
              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                LOCKED
              </span>
            )}
            {isAdminAuthenticated ? (
              showEngineDetails3 ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            )}
          </div>
        </button>

        {isAdminAuthenticated && showEngineDetails3 && (
          <div className="p-4 pt-2 border-t border-zinc-800/80 bg-[#07080f]">
            <PhaseXHistoryAndVerification selectedAssetId={selectedAssetId} />
          </div>
        )}
      </div>

      {/* ADMIN ACCESS REQUIRED PASSWORD MODAL */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#0b0e17] border-2 border-amber-500/60 shadow-2xl overflow-hidden space-y-4 p-5 sm:p-6 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    ADMIN ACCESS REQUIRED
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    Phase X & Phase 4 Telemetry Control Gate
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAdminModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Notice Banner */}
            {adminAuthError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{adminAuthError}</span>
              </div>
            )}

            {/* Password Form */}
            <form onSubmit={handleAdminAuthSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 uppercase block">
                  Admin Security Password:
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="Enter admin password..."
                    autoFocus
                    className="w-full py-2.5 px-3.5 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-amber-500 text-white font-mono text-xs focus:outline-none transition"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 italic">
                  Password verification is processed via secure server-side validation.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isAuthSubmitting || !adminPasswordInput.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAuthSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>VERIFY & UNLOCK PANELS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhaseXView;
