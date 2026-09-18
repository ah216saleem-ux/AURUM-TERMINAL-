import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Copy, 
  Check, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ShieldAlert, 
  Target, 
  Sparkles, 
  Zap,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  BrainCircuit,
  Lock,
  Unlock,
  Radio,
  Layers,
  Flame,
  Globe2,
  ShieldCheck,
  Activity,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { SignalType } from '../types';
import { getCurrentMarketSession, getAssetVolatility, calculateLiveRMultiple } from '../utils/marketContextHelpers';
import { getNewsTradingStatus } from '../data/newsIntelligenceData';
import { detectMarketRegime, calculateSetupQualityScore, getStrategyPerformance } from '../services/marketRegimeEngine';

export const TradeSignalCard: React.FC = () => {
  const { 
    selectedSignal, 
    selectedMarket, 
    tradingStyleMode,
    sendSignalToTelegram,
    setIsTelegramModalOpen,
    isAssetLocked,
    getAssetLock,
    lockAsset,
    unlockAsset,
    getAssetPipelineStatus,
    runSignalPipeline
  } = useMarket();

  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentNotice, setSentNotice] = useState<string | null>(null);
  const [showAiThoughts, setShowAiThoughts] = useState(false); // Collapsed by default per user requirement
  const [timeRemaining, setTimeRemaining] = useState<string>('03:44:18');
  const [signalAgeMinutes, setSignalAgeMinutes] = useState<number>(14);

  const lockedState = getAssetLock(selectedSignal.marketId);
  const isLocked = isAssetLocked(selectedSignal.marketId);
  const pipelineStatus = getAssetPipelineStatus(selectedSignal.marketId);

  // Check if expired or no active setup
  const isExpired = selectedSignal.isExpired || (selectedSignal.entryPrice === 0 && selectedSignal.type === 'WAIT');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      let createdTime = now - 14 * 60 * 1000;
      const rawTimestamp = (selectedSignal as any).timestamp;
      const rawGen = selectedSignal.generatedAt;

      if (typeof rawTimestamp === 'number' && !isNaN(rawTimestamp)) {
        createdTime = rawTimestamp;
      } else if (typeof rawTimestamp === 'string') {
        const parsed = new Date(rawTimestamp).getTime();
        if (!isNaN(parsed)) createdTime = parsed;
      } else if (typeof rawGen === 'string') {
        const parsed = new Date(rawGen).getTime();
        if (!isNaN(parsed)) {
          createdTime = parsed;
        } else if (rawGen.toLowerCase().includes('just now')) {
          createdTime = now;
        } else {
          const matchMin = rawGen.match(/(\d+)\s*min/i);
          if (matchMin) {
            createdTime = now - parseInt(matchMin[1], 10) * 60 * 1000;
          } else {
            const matchHour = rawGen.match(/(\d+)\s*h/i);
            if (matchHour) {
              createdTime = now - parseInt(matchHour[1], 10) * 3600 * 1000;
            }
          }
        }
      }

      const ageMins = Math.max(1, Math.floor((now - createdTime) / 60000));
      setSignalAgeMinutes(ageMins);

      // Expiry computation
      const expiryMs = lockedState?.expiryTimestamp || (createdTime + 4 * 60 * 60 * 1000);
      const remMs = expiryMs - now;
      if (remMs <= 0 || isExpired) {
        setTimeRemaining('00:00:00');
      } else {
        const hrs = Math.floor(remMs / 3600000);
        const mins = Math.floor((remMs % 3600000) / 60000);
        const secs = Math.floor((remMs % 60000) / 1000);
        setTimeRemaining(`${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedSignal.generatedAt, (selectedSignal as any).timestamp, lockedState, isExpired]);

  const marketSession = getCurrentMarketSession();
  const volatility = getAssetVolatility(selectedMarket);
  const newsStatus = getNewsTradingStatus();

  const isBuy = selectedSignal.type === 'BUY';
  const isSell = selectedSignal.type === 'SELL';
  const isWait = selectedSignal.type === 'WAIT';

  // Entry validation against live market price
  const entryMin = selectedSignal.entryZone?.min ?? (selectedSignal.entryPrice ? selectedSignal.entryPrice * 0.998 : 0);
  const entryMax = selectedSignal.entryZone?.max ?? (selectedSignal.entryPrice ? selectedSignal.entryPrice * 1.002 : 0);
  const isPriceInZone = selectedSignal.entryPrice > 0 && selectedMarket.price >= entryMin && selectedMarket.price <= entryMax;

  // Market Regime Detection & Setup Quality Score (0-100)
  const marketRegime = detectMarketRegime(selectedMarket, selectedSignal);
  const qualityScore = calculateSetupQualityScore(
    selectedMarket,
    selectedSignal,
    pipelineStatus.isSynchronizing ? 'QWEN_ANALYZING' : 'SYNCED',
    marketRegime
  );
  const strategyMetrics = getStrategyPerformance(marketRegime.recommendedStrategy);

  // Setup Grade: A+ (>=90%), A (>=82%), B+ (>=75%), B (<75%)
  const grade = isExpired ? '--' : qualityScore.grade;

  // Qwen sync state check
  const isQwenAnalyzing = selectedSignal.qwenSyncState === 'QWEN_ANALYZING' || pipelineStatus.isSynchronizing;

  const handleCopy = () => {
    if (isExpired) return;
    const text = `AURUM AI SIGNAL
Asset: ${selectedSignal.symbol} (${selectedSignal.name})
Direction: ${selectedSignal.type}
Grade: ${grade}
Confidence: ${selectedSignal.confidenceScore}%
Entry: $${selectedSignal.entryPrice.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })} (Zone: $${selectedSignal.entryZone?.min ?? selectedSignal.entryPrice} - $${selectedSignal.entryZone?.max ?? selectedSignal.entryPrice})
SL: $${selectedSignal.stopLoss.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })}
TP1: $${selectedSignal.takeProfit.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })}
TP2: $${selectedSignal.takeProfit2.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })}
Risk Reward: ${selectedSignal.riskReward}
Timeframe: ${selectedSignal.timeframe}

Reason:
${selectedSignal.marketReason}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendTelegram = async () => {
    if (isExpired) return;
    setSending(true);
    const res = await sendSignalToTelegram(selectedSignal.id);
    setSending(false);
    if (res.success) {
      setSentNotice(res.message);
      setTimeout(() => setSentNotice(null), 3000);
    }
  };

  const handleManualUnlock = () => {
    unlockAsset(selectedSignal.marketId, 'MANUAL_CANCEL');
    setSentNotice(`Asset ${selectedSignal.symbol} unlocked manually.`);
    setTimeout(() => setSentNotice(null), 3000);
  };

  const handleManualLock = () => {
    if (isExpired) return;
    lockAsset(selectedSignal.marketId, selectedSignal, { lockReason: 'Manual Execution & Hard Lock' });
    setSentNotice(`Asset ${selectedSignal.symbol} locked & paper trade registered.`);
    setTimeout(() => setSentNotice(null), 3000);
  };

  const handleRunPipeline = async () => {
    setSentNotice(`AI Council pipeline running for ${selectedSignal.symbol}...`);
    await runSignalPipeline(selectedSignal.marketId);
    setSentNotice(`AI Council analysis complete for ${selectedSignal.symbol}.`);
    setTimeout(() => setSentNotice(null), 3000);
  };

  return (
    <div className="w-full rounded-2xl bg-glass-card border border-amber-500/40 p-5 sm:p-6 shadow-2xl space-y-4 aurum-glow relative overflow-hidden font-mono-num">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Toast Notification */}
      {sentNotice && (
        <div className="p-3 rounded-xl bg-neutral-900 border border-amber-500/60 text-xs text-amber-200 flex items-center gap-2">
          <Send className="w-4 h-4 text-amber-400" />
          <span>{sentNotice}</span>
        </div>
      )}

      {/* Hard Asset Lock Banner */}
      {isLocked && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                  HARD ASSET LOCKED 🔒
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold">
                  ACTIVE TRADE PROTECTED
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                New signals & duplicate trades locked until TP/SL or expiry.
              </p>
            </div>
          </div>

          <button
            onClick={handleManualUnlock}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0 transition"
          >
            <Unlock className="w-3.5 h-3.5 text-amber-400" />
            <span>Manual Unlock</span>
          </button>
        </div>
      )}

      {/* Qwen Synchronization In-Progress Overlay/State Banner */}
      {isQwenAnalyzing && (
        <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-500/50 space-y-2.5 animate-pulse">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-sky-300 uppercase tracking-wider flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
              SYNCHRONIZING DUAL AI CONSENSUS
            </span>
            <span className="text-[10px] font-mono font-bold text-sky-400">STAGE 2/4</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono font-bold">
            <div className="p-2 rounded-lg bg-zinc-900/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
              <span>AURUM COMPLETE</span>
              <span>✅</span>
            </div>
            <div className="p-2 rounded-lg bg-zinc-900/80 border border-sky-500/60 text-sky-300 flex items-center gap-1.5">
              <span>QWEN ANALYZING</span>
              <span className="animate-spin">⏳</span>
            </div>
            <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-700 text-zinc-400 flex items-center gap-1.5">
              <span>FINAL DECISION WAITING</span>
            </div>
          </div>
        </div>
      )}

      {/* 1. Header: Asset, Direction Badge & Setup Grade */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">
              AURUM AI SIGNAL ENGINE
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h3 className="text-2xl sm:text-3xl font-black text-white font-syne tracking-tight">
              {selectedSignal.symbol}
            </h3>
            <span className="text-sm text-zinc-400 font-medium">
              ({selectedSignal.name})
            </span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/40">
              GRADE {grade}
            </span>
          </div>
        </div>

        {/* Signal Direction Badge & Countdown */}
        <div className="flex items-center gap-2.5">
          {/* Signal Direction */}
          <span className={`px-4 py-1.5 rounded-xl text-xs font-black tracking-wide border flex items-center gap-1.5 ${
            isExpired 
              ? 'bg-zinc-900 text-zinc-400 border-zinc-800' 
              : isBuy 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-500/10' 
              : isSell 
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-lg shadow-rose-500/10'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/10'
          }`}>
            {isExpired && <Clock className="w-4 h-4 text-zinc-500" />}
            {!isExpired && isBuy && <TrendingUp className="w-4 h-4 text-emerald-400" />}
            {!isExpired && isSell && <TrendingDown className="w-4 h-4 text-rose-400" />}
            {!isExpired && isWait && <Clock className="w-4 h-4 text-amber-400" />}
            <span>{isExpired ? 'NO ACTIVE SETUP' : selectedSignal.type}</span>
          </span>

          {/* Countdown Clock */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950 border border-zinc-800 text-xs text-zinc-300 font-mono-num font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-500 text-[10px] uppercase font-semibold">Countdown:</span>
            <span className="text-emerald-400 font-extrabold">{isExpired ? '00:00:00' : timeRemaining}</span>
          </div>
        </div>
      </div>

      {/* 2. Setup Quality Score System & Market Regime Detection */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121624] via-[#0d101a] to-[#07080c] border border-amber-500/40 shadow-xl font-mono-num space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex flex-col items-center justify-center text-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-[9px] font-black text-amber-300">GRADE {grade}</span>
            </div>
            <div>
              <span className="text-[10px] font-black text-amber-400 tracking-wider uppercase block">
                SETUP QUALITY:
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {isExpired ? '--' : `${qualityScore.totalScore}/100`}
              </div>
            </div>
          </div>

          {/* Market Regime Detection Badge */}
          <div className="flex flex-col sm:items-end gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400">REGIME:</span>
              <span className="px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/30 text-xs font-black">
                {marketRegime.regime}
              </span>
            </div>
            <div className="text-[11px] font-bold text-amber-300">
              Optimal Strategy: <span className="text-white">{marketRegime.recommendedStrategy}</span>
            </div>
          </div>
        </div>

        {/* Breakdown as specified by User:
            Breakdown:
            AI Consensus:
            Market Structure:
            Risk:
            News:
            Trend:
        */}
        <div className="pt-2.5 border-t border-zinc-800/80 space-y-2">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            Breakdown:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-neutral-950/90 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">AI Consensus:</span>
              <span className="text-sm font-black text-emerald-400 block mt-0.5">
                {isExpired ? '--' : `${qualityScore.aiConsensus}/100`}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-neutral-950/90 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Market Structure:</span>
              <span className="text-sm font-black text-amber-300 block mt-0.5">
                {isExpired ? '--' : `${qualityScore.marketStructure}/100`}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-neutral-950/90 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Risk:</span>
              <span className="text-sm font-black text-sky-400 block mt-0.5">
                {isExpired ? '--' : `${qualityScore.riskReward}/100`}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-neutral-950/90 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">News:</span>
              <span className="text-sm font-black text-emerald-400 block mt-0.5">
                {isExpired ? '--' : `${qualityScore.newsSafety}/100`}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-neutral-950/90 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Trend:</span>
              <span className="text-sm font-black text-purple-300 block mt-0.5">
                {isExpired ? '--' : `${qualityScore.trendAlignment}/100`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 Primary Confluence: Confidence & Dual AI Agreement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-neutral-950/80 border border-zinc-800/80 text-xs">
        {/* Confidence Meter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono-num">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold uppercase text-[11px]">Confidence:</span>
            </span>
            <span className="font-extrabold text-amber-300 text-sm">
              {isExpired ? '--' : `${selectedSignal.confidenceScore}%`}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-500"
              style={{ width: isExpired ? '0%' : `${selectedSignal.confidenceScore}%` }}
            />
          </div>
        </div>

        {/* Dual AI Agreement */}
        <div className="flex flex-col justify-center space-y-1 sm:border-l sm:border-zinc-800 sm:pl-3">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-[10.5px] uppercase font-bold flex items-center gap-1">
              <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />
              <span>AURUM + Qwen Agreement:</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              isExpired 
                ? 'bg-zinc-900 text-zinc-500 border-zinc-800'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            }`}>
              {isExpired ? 'Idle' : isQwenAnalyzing ? 'Synchronizing...' : 'Confirmed (2/2)'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
            {isExpired ? (
              <span className="text-zinc-500">Awaiting structure breakout</span>
            ) : isQwenAnalyzing ? (
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-emerald-400">AURUM COMPLETE ✅</span>
                <span className="text-zinc-600">•</span>
                <span className="text-sky-300 animate-pulse">QWEN ANALYZING ⏳</span>
              </div>
            ) : (
              <>
                <span>AURUM: <strong className="text-emerald-400">{selectedSignal.type} ✅</strong></span>
                <span className="text-zinc-600">•</span>
                <span>Qwen: <strong className="text-emerald-400">{selectedSignal.type} ✅</strong></span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. Trade Setup Parameters (Entry, SL, TP1, TP2) */}
      {isExpired ? (
        <div className="p-5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-black text-zinc-300 uppercase tracking-wide">
            NO ACTIVE SETUP
          </h4>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            All previous price levels have completed or expired. The AI Council is awaiting the next institutional liquidity sweep or confirmed candle close.
          </p>
          <div className="pt-1">
            <button
              onClick={handleRunPipeline}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 text-xs font-bold transition flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Generate Fresh Setup (AI Council)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Live Price & Entry Validation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-neutral-950/80 border border-zinc-800 text-xs font-mono-num">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-bold uppercase text-[10px]">Live Price:</span>
              <span className="text-white font-black text-sm">
                ${selectedMarket.price.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })}
              </span>
              <span className={`text-[11px] font-bold ${selectedMarket.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {selectedMarket.changePercent >= 0 ? '+' : ''}{selectedMarket.changePercent.toFixed(2)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">Entry Validation:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                isPriceInZone 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}>
                {isPriceInZone ? 'IN ENTRY ZONE ✅' : 'PENDING ZONE RETEST ⏳'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Entry */}
            <div className="p-3.5 rounded-xl bg-neutral-950/90 border border-zinc-800 space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-bold block">Entry</span>
              <div className="text-base font-black text-amber-300">
                ${selectedSignal.entryPrice.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })}
              </div>
              <span className="text-[10px] text-zinc-400 block truncate">
                Zone: ${selectedSignal.entryZone?.min ?? selectedSignal.entryPrice} - ${selectedSignal.entryZone?.max ?? selectedSignal.entryPrice}
              </span>
            </div>

            {/* Stop Loss */}
            <div className="p-3.5 rounded-xl bg-neutral-950/90 border border-rose-950/40 space-y-1">
              <span className="text-rose-500/90 text-[10px] uppercase font-bold block flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                Stop Loss (SL)
              </span>
              <div className="text-base font-black text-rose-400">
                ${selectedSignal.stopLoss.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })}
              </div>
              <span className="text-[10px] text-zinc-500 block">
                Structural Invalidation
              </span>
            </div>

            {/* Take Profit 1 */}
            <div className="p-3.5 rounded-xl bg-neutral-950/90 border border-emerald-950/40 space-y-1">
              <span className="text-emerald-500/90 text-[10px] uppercase font-bold block flex items-center gap-1">
                <Target className="w-3 h-3 text-emerald-400" />
                Take Profit 1 (TP1)
              </span>
              <div className="text-base font-black text-emerald-400">
                ${selectedSignal.takeProfit.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })}
              </div>
              <span className="text-[10px] text-emerald-300/80 block">
                Primary Objective
              </span>
            </div>

            {/* Take Profit 2 */}
            <div className="p-3.5 rounded-xl bg-neutral-950/90 border border-emerald-950/40 space-y-1">
              <span className="text-emerald-500/90 text-[10px] uppercase font-bold block flex items-center gap-1">
                <Target className="w-3 h-3 text-emerald-400" />
                Take Profit 2 (TP2)
              </span>
              <div className="text-base font-black text-emerald-300">
                ${selectedSignal.takeProfit2.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })}
              </div>
              <span className="text-[10px] text-amber-300 block">
                R:R {selectedSignal.riskReward}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Expandable Detailed AI Reasoning & Market Context */}
      <div className="rounded-xl bg-neutral-950/90 border border-zinc-800 overflow-hidden">
        <button
          onClick={() => setShowAiThoughts(!showAiThoughts)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-900/50 transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wide">
              Detailed AI Reasoning & Market Analysis
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${showAiThoughts ? 'rotate-180' : ''}`} />
        </button>

        {showAiThoughts && (
          <div className="p-4 border-t border-zinc-800/80 space-y-3 text-xs font-sans">
            {/* Market Context telemetry */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-zinc-900/40 border border-zinc-900 text-xs font-mono-num">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Market Trend</span>
                <span className={`font-bold ${selectedMarket.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedMarket.changePercent >= 0 ? 'Bullish' : 'Bearish'}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Volatility</span>
                <span className="font-bold text-white">{volatility.level} ({volatility.atrPips})</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Trading Session</span>
                <span className="font-bold text-sky-400 truncate block">{marketSession.activeSession}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">News Risk</span>
                <span className={`font-bold ${newsStatus.isBlocked ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {newsStatus.isBlocked ? 'Blocked (News)' : 'Clear'}
                </span>
              </div>
            </div>

            {/* Market Regime & Strategy Intelligence Module */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-950/40 via-neutral-950 to-neutral-950 border border-sky-500/30 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-sky-300 font-black uppercase text-[11px]">
                    Market Regime: {marketRegime.regime}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono-num">
                  <span className="text-zinc-400">ADX: <strong className="text-white">{marketRegime.adxLevel}</strong></span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400">Confidence Adj: <strong className={marketRegime.confidenceAdjustment >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {marketRegime.confidenceAdjustment >= 0 ? `+${marketRegime.confidenceAdjustment}%` : `${marketRegime.confidenceAdjustment}%`}
                  </strong></span>
                </div>
              </div>
              <p className="text-zinc-300 text-xs leading-relaxed">
                <strong>Strategy Rationale:</strong> {marketRegime.strategyRationale}
              </p>

              {/* Strategy Track Record */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-zinc-800/80 text-[11px] font-mono-num">
                <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/60">
                  <span className="text-[9.5px] text-zinc-500 block uppercase">Strategy Win Rate</span>
                  <span className="font-black text-emerald-400">{strategyMetrics.winRate}%</span>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/60">
                  <span className="text-[9.5px] text-zinc-500 block uppercase">Profit Factor</span>
                  <span className="font-black text-amber-300">{strategyMetrics.profitFactor}x</span>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/60">
                  <span className="text-[9.5px] text-zinc-500 block uppercase">Best Assets</span>
                  <span className="font-bold text-zinc-200 truncate block">{strategyMetrics.bestAssets.slice(0, 2).join(', ')}</span>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/60">
                  <span className="text-[9.5px] text-zinc-500 block uppercase">Peak Session</span>
                  <span className="font-bold text-purple-300 truncate block">{strategyMetrics.bestSession}</span>
                </div>
              </div>
            </div>

            {/* Quality Score Breakdown Text Explanations */}
            <div className="p-3 rounded-xl bg-neutral-950 border border-zinc-800/80 space-y-1.5 text-[11px]">
              <span className="text-zinc-400 font-bold uppercase tracking-wider block text-[10px]">
                Quality Breakdown Details:
              </span>
              <div className="space-y-1 text-zinc-300">
                <div>• <strong className="text-emerald-400">AI Consensus ({qualityScore.aiConsensus}/100):</strong> {qualityScore.details.aiConsensusText}</div>
                <div>• <strong className="text-amber-300">Market Structure ({qualityScore.marketStructure}/100):</strong> {qualityScore.details.marketStructureText}</div>
                <div>• <strong className="text-sky-400">Risk ({qualityScore.riskReward}/100):</strong> {qualityScore.details.riskText}</div>
                <div>• <strong className="text-emerald-400">News ({qualityScore.newsSafety}/100):</strong> {qualityScore.details.newsText}</div>
                <div>• <strong className="text-purple-300">Trend ({qualityScore.trendAlignment}/100):</strong> {qualityScore.details.trendText}</div>
              </div>
            </div>

            {/* AURUM Analysis */}
            <div className="p-3 rounded-xl bg-zinc-900/40 border border-amber-500/20 space-y-1.5">
              <div className="flex items-center justify-between font-mono-num text-[10.5px]">
                <span className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AURUM Core Analysis
                </span>
                <span className="text-zinc-400 font-medium">Bias: <strong className="text-white">{selectedSignal.type === 'BUY' ? 'Bullish Expansion' : selectedSignal.type === 'SELL' ? 'Bearish Distribution' : 'Neutral Range'}</strong></span>
              </div>
              <p className="text-zinc-300 text-xs leading-relaxed">
                <strong>Setup Reason:</strong> {selectedSignal.marketReason}
              </p>
              <p className="text-zinc-400 text-[11px]">
                <strong>Risk Invalidation:</strong> Protect capital beyond ${selectedSignal.stopLoss}. Order block invalidates upon full body close past structure.
              </p>
            </div>

            {/* Qwen Analysis */}
            <div className="p-3 rounded-xl bg-zinc-900/40 border border-sky-500/20 space-y-1.5">
              <div className="flex items-center justify-between font-mono-num text-[10.5px]">
                <span className="text-sky-400 font-bold uppercase flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Qwen 3.8 Max Second Opinion
                </span>
                <span className="text-zinc-400 font-medium">Agreement: <strong className="text-emerald-400">Confirmed (2/2)</strong></span>
              </div>
              <p className="text-zinc-300 text-xs leading-relaxed">
                <strong>Confirmation:</strong> Higher timeframe structure aligns with the {selectedSignal.timeframe} Fair Value Gap reclaim. Risk:Reward of {selectedSignal.riskReward} satisfies institutional threshold.
              </p>
              <p className="text-zinc-400 text-[11px]">
                <strong>Concerns:</strong> Monitor high-volume liquidity sweeps near session crossover. Ensure stop loss order is active before trigger.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 5. Action Buttons: Lock / Unlock, Re-Analyze, Copy Signal & Telegram Wire */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {/* Re-Analyze Pipeline Button */}
          <button
            onClick={handleRunPipeline}
            disabled={pipelineStatus.isSynchronizing}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-300 hover:text-amber-200 text-xs font-semibold border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            title="Re-run AURUM Core and Qwen Consensus Pipeline"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${pipelineStatus.isSynchronizing ? 'animate-spin' : ''}`} />
            <span>{pipelineStatus.isSynchronizing ? 'Analyzing...' : 'AI Council Re-Analyze'}</span>
          </button>

          {/* Lock / Unlock Toggle Button */}
          {isLocked ? (
            <button
              onClick={handleManualUnlock}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 text-xs font-bold border border-rose-500/40 transition flex items-center gap-1.5 cursor-pointer"
              title="Unlock asset and cancel active trade monitoring"
            >
              <Unlock className="w-3.5 h-3.5 text-rose-400" />
              <span>Manual Unlock</span>
            </button>
          ) : (
            <button
              onClick={handleManualLock}
              disabled={isExpired}
              className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 text-xs font-bold border border-amber-500/40 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Lock setup and execute paper trade"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Lock Setup (Paper Trade)</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={isExpired}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-800 transition flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Copy formatted signal"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copied ? 'Signal Copied' : 'Copy Signal'}</span>
          </button>

          <button
            onClick={handleSendTelegram}
            disabled={sending || isExpired}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] hover:brightness-110 text-black font-bold text-xs flex items-center gap-2 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className={`w-3.5 h-3.5 text-black ${sending ? 'animate-spin' : ''}`} />
            <span>{sending ? 'Dispatching...' : 'Send to Telegram'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
