import React, { useState, useEffect, useCallback } from 'react';
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
  BarChart2,
  Activity,
  Flame,
  Sparkles
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
  marketDataProvider: string;
  currentLivePrice: number;
  currentPnlPoints: number;
  currentPnlPercent: number;
  rationale: string;
}

export interface TerminalAnalysisResponse {
  assetId: string;
  symbol: string;
  assetName: string;
  timeframe: '15M' | '30M' | '1H';
  decision: 'BUY' | 'SELL' | 'WAIT';
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
  marketStatus: 'LIVE' | 'MARKET_CLOSED' | 'DATA_UNAVAILABLE';
  lastVerifiedPrice: number;
}

interface TerminalTradeLockControllerProps {
  market: MarketItem;
  selectedTf: Timeframe;
  onTimeframeSelect: (tf: Timeframe) => void;
  onOpenChart?: () => void;
}

export const TerminalTradeLockController: React.FC<TerminalTradeLockControllerProps> = ({
  market,
  selectedTf,
  onTimeframeSelect,
  onOpenChart
}) => {
  const { sendSignalToTelegram } = useMarket();

  // Allowed signal timeframes
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
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [telegramSuccess, setTelegramSuccess] = useState<string | null>(null);

  // 1. Fetch server state for this asset
  const fetchServerState = useCallback(async () => {
    try {
      const res = await fetch('/api/terminal-signals/state');
      if (!res.ok) return;
      const data = await res.json();
      if (data.activeTrades && data.activeTrades[market.id]) {
        setActiveTrade(data.activeTrades[market.id]);
      } else {
        setActiveTrade(null);
      }
    } catch (err) {
      console.warn('[TerminalTradeLockController] Failed to sync state:', err);
    }
  }, [market.id]);

  useEffect(() => {
    fetchServerState();
    const interval = setInterval(fetchServerState, 3000);
    return () => clearInterval(interval);
  }, [fetchServerState]);

  // 2. Handle START SIGNAL button
  const handleStartSignal = async () => {
    if (market.id === 'spy' || market.id === 'spy-options') return;
    setIsAnalyzing(true);
    setErrorMsg(null);
    setLastAnalysis(null);

    try {
      const res = await fetch('/api/terminal-signals/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: market.id,
          timeframe: currentTf
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Signal analysis request failed');
      }

      const result: TerminalAnalysisResponse = await res.json();
      setLastAnalysis(result);

      if (result.activeTrade) {
        setActiveTrade(result.activeTrade);
      } else {
        setActiveTrade(null);
      }
    } catch (err: any) {
      console.error('[TerminalTradeLockController] Signal analysis error:', err);
      setErrorMsg(err?.message || 'Error executing signal analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 3. Handle Manual Close Trade & Unlock
  const handleCloseAndUnlock = async () => {
    if (!activeTrade) return;
    setIsClosing(true);
    try {
      const res = await fetch('/api/terminal-signals/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: market.id })
      });
      if (res.ok) {
        setActiveTrade(null);
        setLastAnalysis(null);
        await fetchServerState();
      }
    } catch (err) {
      console.error('[TerminalTradeLockController] Manual close error:', err);
    } finally {
      setIsClosing(false);
    }
  };

  const handleCopy = () => {
    const trade = activeTrade || (lastAnalysis?.decision !== 'WAIT' ? lastAnalysis : null);
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
  const isBuy = activeTrade ? activeTrade.direction === 'BUY' : lastAnalysis?.decision === 'BUY';
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

  return (
    <div className="w-full space-y-3 font-mono-num">
      {/* 1. Timeframe Selection & Start Signal Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-[#0c0f1d] via-[#090b14] to-[#06070a] border border-amber-500/40 shadow-2xl relative overflow-hidden space-y-4">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />

        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider font-syne">
              AURUM SIGNAL ENGINE — {market.symbol}
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
              <span>CLOSED-CANDLE ATR ENGINE</span>
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

        {/* ACTIVE TRADE LOCK BANNER vs START SIGNAL TRIGGER */}
        {activeTrade ? (
          /* ACTIVE TRADE LOCKED DISPLAY */
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

              {/* Confidence */}
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
          /* NO ACTIVE TRADE LOCK — SHOW START SIGNAL TRIGGER */
          <div className="space-y-3 pt-1">
            <button
              onClick={handleStartSignal}
              disabled={isAnalyzing}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38728] text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 hover:brightness-105 active:scale-[0.99] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>ANALYZING {currentTf} CLOSED CANDLES & ATR...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-black fill-black" />
                  <span>START SIGNAL ({currentTf})</span>
                </>
              )}
            </button>

            {/* LAST ANALYSIS RESULT (WAIT OR APPROVED) */}
            {lastAnalysis && (
              <div className={`p-4 rounded-2xl border space-y-2.5 transition-all ${
                lastAnalysis.decision === 'BUY'
                  ? 'bg-emerald-950/20 border-emerald-500/50'
                  : lastAnalysis.decision === 'SELL'
                    ? 'bg-rose-950/20 border-rose-500/50'
                    : 'bg-zinc-950/90 border-zinc-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-bold uppercase">DECISION:</span>
                    <span className={`px-3 py-1 rounded-xl text-sm font-black tracking-wider ${
                      lastAnalysis.decision === 'BUY'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : lastAnalysis.decision === 'SELL'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {lastAnalysis.decision === 'BUY' ? 'BUY 🟢' : lastAnalysis.decision === 'SELL' ? 'SELL 🔴' : 'WAIT 🟡'}
                    </span>
                  </div>

                  {lastAnalysis.confidence > 0 && (
                    <span className="text-xs font-black text-amber-400">
                      Confidence: {lastAnalysis.confidence}%
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  {lastAnalysis.rationale}
                </p>

                {lastAnalysis.confluenceFactors && lastAnalysis.confluenceFactors.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {lastAnalysis.confluenceFactors.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-semibold">
                        • {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
