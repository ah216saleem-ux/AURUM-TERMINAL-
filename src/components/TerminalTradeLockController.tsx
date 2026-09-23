import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Lock, 
  Unlock, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Clock, 
  Copy, 
  Check, 
  Send, 
  Sparkles,
  Bot,
  Brain,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { MarketItem, Timeframe } from '../types';
import { useMarket } from '../context/MarketContext';

export interface TerminalActiveTrade {
  tradeId: string;
  assetId: string;
  symbol: string;
  assetName: string;
  direction: 'BUY' | 'SELL';
  timeframe: '15M' | '30M' | '1H';
  entryPrice: number;
  entryZone: string;
  stopLossPrice: number;
  target1Price: number;
  target2Price: number;
  confidence: number;
  status: 'ACTIVE';
  createdAtET: string;
  createdAtTimestamp: number;
  expiryTimestamp: number;
  marketDataProvider: string;
  currentLivePrice: number;
  currentPnlPoints: number;
  currentPnlPercent: number;
  aurumReasoning?: string;
  qwenReasoning?: string;
  rationale: string;
}

export interface DualAiAnalysis {
  aurum: {
    direction: 'BUY' | 'SELL' | 'NO_TRADE';
    confidence: number;
    reasoning: string;
    invalidation?: string;
  };
  qwen: {
    direction: 'BUY' | 'SELL' | 'NO_TRADE';
    confidence: number;
    reasoning: string;
    invalidation?: string;
  };
}

export interface TerminalAnalysisResponse {
  assetId: string;
  symbol: string;
  assetName: string;
  timeframe: '15M' | '30M' | '1H';
  decision: 'BUY' | 'SELL' | 'NO_TRADE' | 'COOLDOWN';
  entryPrice: number;
  entryZone: string;
  stopLossPrice: number;
  target1Price: number;
  target2Price: number;
  riskRewardRatio: string;
  confidence: number;
  confluenceFactors: string[];
  rationale: string;
  isLocked: boolean;
  activeTrade?: TerminalActiveTrade | null;
  dualAiAnalysis?: DualAiAnalysis;
  marketStatus: 'LIVE' | 'MARKET_CLOSED' | 'DATA_UNAVAILABLE';
  lastVerifiedPrice: number;
  cooldownSecondsRemaining?: number;
}

interface TerminalTradeLockControllerProps {
  market: MarketItem;
  selectedTf: Timeframe;
  onTimeframeSelect: (tf: Timeframe) => void;
  onOpenChart?: () => void;
}

/**
 * Safe fetch wrapper with timeout, status checking, and text-then-JSON parsing.
 * Prevents Safari DOMException ("The string did not match the expected pattern").
 */
async function safeFetchJson<T>(
  url: string, 
  options: RequestInit = {}, 
  timeoutMs: number = 25000
): Promise<{ ok: boolean; data?: T; error?: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const text = await res.text();
    let json: any = null;

    try {
      json = text ? JSON.parse(text) : {};
    } catch (e) {
      return { ok: false, error: `Invalid response format from server (${res.status}).` };
    }

    if (!res.ok) {
      return { ok: false, error: json?.error || `Server error (${res.status}).` };
    }

    return { ok: true, data: json as T };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.name === 'AbortError') {
      return { ok: false, error: 'Analysis timed out (25s). Please tap Retry.' };
    }
    return { ok: false, error: err?.message || 'Network error connecting to Signal Engine.' };
  }
}

export const TerminalTradeLockController: React.FC<TerminalTradeLockControllerProps> = ({
  market,
  selectedTf,
  onTimeframeSelect
}) => {
  const { sendSignalToTelegram } = useMarket();

  // Allowed timeframes
  const allowedTfs: { tf: '15M' | '30M' | '1H'; label: string; mode: string }[] = [
    { tf: '15M', label: '15M', mode: 'Scalping' },
    { tf: '30M', label: '30M', mode: 'Scalp / Short Intraday' },
    { tf: '1H', label: '1H', mode: 'Intraday' }
  ];

  const currentTf: '15M' | '30M' | '1H' = (selectedTf === '15M' || selectedTf === '30M' || selectedTf === '1H')
    ? (selectedTf as '15M' | '30M' | '1H')
    : '15M';

  const [activeTrade, setActiveTrade] = useState<TerminalActiveTrade | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<TerminalAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<number>(0);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [telegramSuccess, setTelegramSuccess] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  const analysisTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync server state
  const fetchServerState = useCallback(async () => {
    const res = await safeFetchJson<{ activeTrades: Record<string, TerminalActiveTrade>; cooldowns: Record<string, number> }>('/api/terminal-signals/state');
    if (res.ok && res.data) {
      if (res.data.activeTrades && res.data.activeTrades[market.id]) {
        setActiveTrade(res.data.activeTrades[market.id]);
      } else {
        setActiveTrade(null);
      }

      const cdEnds = res.data.cooldowns?.[market.id] || 0;
      if (Date.now() < cdEnds) {
        setCooldownRemaining(Math.ceil((cdEnds - Date.now()) / 1000));
      } else {
        setCooldownRemaining(0);
      }
    }
  }, [market.id]);

  useEffect(() => {
    fetchServerState();
    const interval = setInterval(fetchServerState, 3000);
    return () => clearInterval(interval);
  }, [fetchServerState]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const cdInterval = setInterval(() => {
      setCooldownRemaining(prev => {
        if (prev <= 1) {
          clearInterval(cdInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(cdInterval);
  }, [cooldownRemaining]);

  // Handle START SIGNAL Button Click
  const handleStartSignal = async () => {
    if (market.id === 'spy' || market.id === 'spy-options') return;

    setIsAnalyzing(true);
    setProgressStep(1);
    setErrorMsg(null);

    // Terminal progress animation steps
    if (analysisTimerRef.current) clearInterval(analysisTimerRef.current);
    let step = 1;
    analysisTimerRef.current = setInterval(() => {
      step++;
      if (step <= 5) {
        setProgressStep(step);
      } else {
        if (analysisTimerRef.current) clearInterval(analysisTimerRef.current);
      }
    }, 450);

    const res = await safeFetchJson<TerminalAnalysisResponse>(
      '/api/terminal-signals/analyze',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: market.id,
          timeframe: currentTf
        })
      },
      25000
    );

    if (analysisTimerRef.current) clearInterval(analysisTimerRef.current);
    setIsAnalyzing(false);

    if (!res.ok) {
      setErrorMsg(res.error || 'Signal analysis failed. Please tap Retry.');
      return;
    }

    const result = res.data!;
    setLastAnalysis(result);

    if (result.activeTrade) {
      setActiveTrade(result.activeTrade);
    } else {
      setActiveTrade(null);
    }

    if (result.decision === 'COOLDOWN' && result.cooldownSecondsRemaining) {
      setCooldownRemaining(result.cooldownSecondsRemaining);
    }
  };

  // Handle Manual Close & Unlock
  const handleCloseAndUnlock = async () => {
    if (!activeTrade) return;
    setIsClosing(true);

    const res = await safeFetchJson<{ success: boolean }>('/api/terminal-signals/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetId: market.id })
    });

    setIsClosing(false);
    if (res.ok) {
      setActiveTrade(null);
      setLastAnalysis(null);
      await fetchServerState();
    } else {
      setErrorMsg(res.error || 'Failed to close trade');
    }
  };

  const handleCopy = () => {
    const trade = activeTrade || (lastAnalysis?.decision === 'BUY' || lastAnalysis?.decision === 'SELL' ? lastAnalysis : null);
    if (!trade) return;

    const dir = activeTrade ? activeTrade.direction : lastAnalysis?.decision;
    const entry = activeTrade ? activeTrade.entryPrice : lastAnalysis?.entryPrice;
    const sl = activeTrade ? activeTrade.stopLossPrice : lastAnalysis?.stopLossPrice;
    const tp1 = activeTrade ? activeTrade.target1Price : lastAnalysis?.target1Price;
    const tp2 = activeTrade ? activeTrade.target2Price : lastAnalysis?.target2Price;
    const conf = activeTrade ? activeTrade.confidence : lastAnalysis?.confidence;

    const text = `AURUM TERMINAL LIVE SIGNAL 🔒
Asset: ${market.symbol} (${market.name})
Direction: ${dir}
Timeframe: ${activeTrade ? activeTrade.timeframe : currentTf}
Entry Price: $${entry}
Stop Loss: $${sl}
Take Profit 1: $${tp1}
Take Profit 2: $${tp2}
Confidence: ${conf}%
Status: ${activeTrade ? 'ACTIVE TRADE LOCKED 🔒' : 'APPROVED'}
Provider: ${activeTrade?.marketDataProvider || 'FINNHUB/BIQUOTE'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWireTelegram = () => {
    sendSignalToTelegram(`sig-${market.id}-${currentTf}`);
    setTelegramSuccess('Broadcasted signal to Telegram wire!');
    setTimeout(() => setTelegramSuccess(null), 2500);
  };

  // Calculate live PnL if active
  const livePrice = market.price;
  const dec = market.decimals;

  let pnlPoints = 0;
  let pnlPercent = 0;
  if (activeTrade) {
    if (activeTrade.direction === 'BUY') {
      pnlPoints = +(livePrice - activeTrade.entryPrice).toFixed(dec);
      pnlPercent = +(((livePrice - activeTrade.entryPrice) / activeTrade.entryPrice) * 100).toFixed(2);
    } else {
      pnlPoints = +(activeTrade.entryPrice - livePrice).toFixed(dec);
      pnlPercent = +(((activeTrade.entryPrice - livePrice) / activeTrade.entryPrice) * 100).toFixed(2);
    }
  }

  const isProfitable = pnlPoints >= 0;

  const progressLabels = [
    'Fetching closed candles & OHLC structure...',
    'AURUM AI multi-timeframe analysis...',
    'Qwen Institutional agent evaluation...',
    'Multi-agent consensus & HTF trend check...',
    'Risk & ATR validation...'
  ];

  return (
    <div className="w-full space-y-3 font-mono-num">
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-[#0c0f1d] via-[#090b14] to-[#06070a] border border-amber-500/40 shadow-2xl relative overflow-hidden space-y-4">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />

        {/* Section Header: Title strictly follows market.symbol */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider font-syne truncate">
              {market.symbol} — {market.name}
            </h3>
          </div>

          {activeTrade ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-extrabold text-[11px] tracking-wider animate-pulse">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>ACTIVE TRADE 🔒</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10.5px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>DUAL AI CONSENSUS ENGINE</span>
            </div>
          )}
        </div>

        {/* TIMEFRAME SELECTOR PILLS (15M / 30M / 1H) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-bold uppercase text-[10.5px]">
              EXECUTION TIMEFRAME:
            </span>
            {activeTrade && (
              <span className="text-amber-400/90 text-[10px] font-bold">
                🔒 Asset is locked on {activeTrade.timeframe}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {allowedTfs.map(({ tf, label, mode }) => {
              const isSelected = currentTf === tf;
              const isLockedTf = activeTrade?.timeframe === tf;

              return (
                <button
                  key={tf}
                  onClick={() => onTimeframeSelect(tf)}
                  disabled={isAnalyzing}
                  className={`p-2.5 rounded-2xl text-center transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-500 text-black border-amber-400 font-black shadow-lg shadow-amber-500/25 scale-[1.01]'
                      : 'bg-zinc-950/80 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-sm font-black">{label}</span>
                    {isLockedTf && <Lock className="w-3 h-3 text-black" />}
                  </div>
                  <div className={`text-[9.5px] font-bold mt-0.5 truncate ${isSelected ? 'text-black/80' : 'text-zinc-500'}`}>
                    {mode}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ====================================================================
            STATE A: ACTIVE TRADE LOCKED DISPLAY
        ==================================================================== */}
        {activeTrade ? (
          <div className="p-4 rounded-2xl bg-zinc-950/90 border-2 border-amber-500/60 space-y-3.5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-xl ${activeTrade.direction === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {activeTrade.direction === 'BUY' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-black ${activeTrade.direction === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {activeTrade.direction}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black">
                      {activeTrade.timeframe}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block font-semibold">
                    Started at {activeTrade.createdAtET}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">CONFIDENCE</span>
                <span className="text-lg font-black text-amber-400">{activeTrade.confidence}%</span>
              </div>
            </div>

            {/* FROZEN ENTRY / SL / TP LEVELS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-center">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Entry (Frozen)</span>
                <span className="text-sm font-black text-white block mt-0.5">${activeTrade.entryPrice.toFixed(dec)}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-rose-500/30 text-center">
                <span className="text-[10px] text-rose-400 uppercase font-bold block">Stop Loss (SL)</span>
                <span className="text-sm font-black text-rose-400 block mt-0.5">${activeTrade.stopLossPrice.toFixed(dec)}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-emerald-500/30 text-center">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">Target TP1</span>
                <span className="text-sm font-black text-emerald-400 block mt-0.5">${activeTrade.target1Price.toFixed(dec)}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-emerald-500/30 text-center">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">Target TP2</span>
                <span className="text-sm font-black text-emerald-300 block mt-0.5">${activeTrade.target2Price.toFixed(dec)}</span>
              </div>
            </div>

            {/* LIVE PNL & PRICE MONITORING */}
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">CURRENT LIVE PRICE</span>
                <span className="text-lg font-black text-white">${livePrice.toFixed(dec)}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">UNREALIZED PnL</span>
                <div className={`text-base font-black flex items-center justify-end gap-1 ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isProfitable ? '+' : ''}{pnlPoints} pts ({isProfitable ? '+' : ''}{pnlPercent}%)
                </div>
              </div>
            </div>

            {/* DUAL AI SIDE-BY-SIDE VERDICTS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-amber-500/30 space-y-1">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
                  <span className="font-black text-amber-300 flex items-center gap-1 text-[11px]">
                    <Brain className="w-3.5 h-3.5 text-amber-400" />
                    AURUM AI VERDICT
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    {activeTrade.direction}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed pt-0.5">
                  {activeTrade.aurumReasoning || activeTrade.rationale}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/90 border border-sky-500/30 space-y-1">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
                  <span className="font-black text-sky-300 flex items-center gap-1 text-[11px]">
                    <Bot className="w-3.5 h-3.5 text-sky-400" />
                    QWEN AI VERDICT
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    {activeTrade.direction}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed pt-0.5">
                  {activeTrade.qwenReasoning || 'SMC order block mitigation and HTF trend alignment verified independently.'}
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS: COPY, WIRE, CLOSE & UNLOCK */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handleCopy}
                className="flex-1 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>

              <button
                onClick={handleWireTelegram}
                className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-sky-400" />
                <span>WIRE</span>
              </button>

              <button
                onClick={handleCloseAndUnlock}
                disabled={isClosing}
                className="py-2 px-3.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 font-black text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <Unlock className="w-3.5 h-3.5 text-rose-400" />
                <span>{isClosing ? 'UNLOCKING...' : 'CLOSE & UNLOCK 🔓'}</span>
              </button>
            </div>

            {telegramSuccess && (
              <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 text-center text-xs font-bold">
                {telegramSuccess}
              </div>
            )}
          </div>
        ) : (
          /* ====================================================================
             STATE B: NO ACTIVE TRADE — START SIGNAL BUTTON & IDLE / RESULTS
          ==================================================================== */
          <div className="space-y-3 pt-1">
            {/* 1. START SIGNAL BUTTON or LIVE ANALYSIS PROGRESS PANEL */}
            {isAnalyzing ? (
              <div className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/50 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                      RUNNING DUAL-AI ANALYSIS ({currentTf})
                    </span>
                  </div>
                  <span className="text-xs font-bold text-zinc-400 font-mono">
                    [{progressStep}/5]
                  </span>
                </div>

                <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-amber-300 h-full transition-all duration-300 ease-out" 
                    style={{ width: `${(progressStep / 5) * 100}%` }}
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
                  <span>{progressLabels[Math.min(progressStep - 1, 4)]}</span>
                </div>
              </div>
            ) : cooldownRemaining > 0 ? (
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-2 text-center">
                <div className="flex items-center justify-center gap-2 text-amber-400">
                  <Clock className="w-5 h-5 animate-pulse" />
                  <span className="text-sm font-black uppercase tracking-wider">
                    30-MINUTE COOLDOWN ACTIVE
                  </span>
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {Math.floor(cooldownRemaining / 60)}m {cooldownRemaining % 60}s
                </div>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  To protect capital and prevent overtrading, a 30-minute cooldown is applied after each trade.
                </p>
              </div>
            ) : (
              <button
                onClick={handleStartSignal}
                disabled={isAnalyzing}
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38728] text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 hover:brightness-105 active:scale-[0.99] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4 text-black fill-black" />
                <span>START SIGNAL ({currentTf})</span>
              </button>
            )}

            {/* 2. ERROR STATE WITH RETRY BUTTON */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/50 text-rose-300 text-xs font-sans space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-rose-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>SIGNAL ENGINE ANALYSIS ERROR</span>
                </div>
                <p className="text-zinc-300 leading-relaxed">{errorMsg}</p>
                <button
                  onClick={handleStartSignal}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>RETRY ANALYSIS</span>
                </button>
              </div>
            )}

            {/* 3. POST-ANALYSIS RESULT DISPLAY (APPROVED OR NO_TRADE) */}
            {lastAnalysis && !isAnalyzing && (
              <div className="space-y-3">
                {lastAnalysis.decision === 'NO_TRADE' ? (
                  /* NO TRADE STATE CARD */
                  <div className="p-4 rounded-2xl bg-zinc-950/90 border border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                          NO TRADE SETUP — CAPITAL PRESERVATION ACTIVE
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                        CONFIDENCE: {lastAnalysis.confidence}%
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {lastAnalysis.rationale}
                    </p>

                    {/* DUAL AI BREAKDOWN */}
                    {lastAnalysis.dualAiAnalysis && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-amber-300 border-b border-zinc-800 pb-1">
                            <span>AURUM AI VERDICT</span>
                            <span className="text-zinc-400">{lastAnalysis.dualAiAnalysis.aurum.direction}</span>
                          </div>
                          <p className="text-[10.5px] text-zinc-400 leading-normal">
                            {lastAnalysis.dualAiAnalysis.aurum.reasoning}
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-sky-300 border-b border-zinc-800 pb-1">
                            <span>QWEN AI VERDICT</span>
                            <span className="text-zinc-400">{lastAnalysis.dualAiAnalysis.qwen.direction}</span>
                          </div>
                          <p className="text-[10.5px] text-zinc-400 leading-normal">
                            {lastAnalysis.dualAiAnalysis.qwen.reasoning}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (lastAnalysis.decision === 'BUY' || lastAnalysis.decision === 'SELL') ? (
                  /* APPROVED TRADE CARD */
                  <div className={`p-4 rounded-2xl border space-y-3.5 transition-all ${
                    lastAnalysis.decision === 'BUY'
                      ? 'bg-emerald-950/20 border-emerald-500/50'
                      : 'bg-rose-950/20 border-rose-500/50'
                  }`}>
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-xl text-sm font-black tracking-wider ${
                          lastAnalysis.decision === 'BUY'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}>
                          {lastAnalysis.decision === 'BUY' ? 'BUY 🟢' : 'SELL 🔴'}
                        </span>
                        <span className="text-xs text-zinc-400 font-bold uppercase">
                          {lastAnalysis.timeframe}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold block">CONFIDENCE</span>
                        <span className="text-base font-black text-amber-400">{lastAnalysis.confidence}%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold block">Entry</span>
                        <span className="text-xs font-black text-white mt-0.5 block">${lastAnalysis.entryPrice.toFixed(dec)}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-zinc-900/90 border border-rose-500/30 text-center">
                        <span className="text-[10px] text-rose-400 uppercase font-bold block">SL</span>
                        <span className="text-xs font-black text-rose-400 mt-0.5 block">${lastAnalysis.stopLossPrice.toFixed(dec)}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-zinc-900/90 border border-emerald-500/30 text-center">
                        <span className="text-[10px] text-emerald-400 uppercase font-bold block">TP1</span>
                        <span className="text-xs font-black text-emerald-400 mt-0.5 block">${lastAnalysis.target1Price.toFixed(dec)}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-zinc-900/90 border border-emerald-500/30 text-center">
                        <span className="text-[10px] text-emerald-400 uppercase font-bold block">TP2</span>
                        <span className="text-xs font-black text-emerald-300 mt-0.5 block">${lastAnalysis.target2Price.toFixed(dec)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                      {lastAnalysis.rationale}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={handleCopy}
                        className="flex-1 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                        <span>{copied ? 'COPIED' : 'COPY SETUP'}</span>
                      </button>

                      <button
                        onClick={handleWireTelegram}
                        className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 text-sky-400" />
                        <span>WIRE</span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
