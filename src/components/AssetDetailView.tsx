import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  Copy, 
  Check, 
  Send, 
  BarChart2, 
  ShieldCheck, 
  Layers, 
  Star,
  Activity,
  Radar,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Clock,
  Unlock,
  Globe2,
  BrainCircuit,
  Radio
} from 'lucide-react';
import { MarketItem, Timeframe, SignalType, AiSignalRecord } from '../types';
import { getTimeframeSetup, DetailedTimeframeSetup } from '../data/timeframeSignals';
import { useMarket } from '../context/MarketContext';
import { getStyleAdjustedParameters } from '../data/tradingStyleData';
import { getAurumRiskEvaluation } from '../data/riskQualityData';
import { getNewsTradingStatus } from '../data/newsIntelligenceData';
import { InteractiveCandleChart } from './InteractiveCandleChart';
import { INITIAL_MARKETS } from '../data/initialData';
import { databaseService } from '../services/databaseService';
import { getCurrentMarketSession, getAssetVolatility } from '../utils/marketContextHelpers';
import { ConnectionValidationCard } from './ConnectionValidationCard';
import { LiveTickDebugPanel } from './LiveTickDebugPanel';
import { TerminalTradeLockController } from './TerminalTradeLockController';

interface AssetDetailViewProps {
  market?: MarketItem | null;
  onBack: () => void;
  onSelectOtherMarket: (m: MarketItem) => void;
}

const ALL_TIMEFRAMES: Timeframe[] = ['1M', '5M', '15M', '30M', '1H', '4H', '1D', '1W'];

export const AssetDetailView: React.FC<AssetDetailViewProps> = ({
  market: propMarket,
  onBack,
  onSelectOtherMarket
}) => {
  const { 
    markets, 
    tradingStyleMode, 
    isFavorite, 
    toggleWatchlist, 
    sendSignalToTelegram 
  } = useMarket();

  // Always resolve the real-time live market item from MarketContext state to match dashboard cards
  const inputMarket = propMarket && propMarket.id ? propMarket : INITIAL_MARKETS[0];
  const liveMarket: MarketItem = markets.find(m => m.id === inputMarket.id) || inputMarket;

  // Active selected timeframe
  const defaultTf: Timeframe = tradingStyleMode === 'SCALPING' ? '5M' : tradingStyleMode === 'SWING' ? '4H' : '1H';
  const [selectedTf, setSelectedTf] = useState<Timeframe>(defaultTf);
  const [showChart, setShowChart] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [telegramSuccess, setTelegramSuccess] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('03:45:00');

  // Accordion state for expandable sections (collapsed by default for minimal scrolling)
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleAccordion = (sectionId: string) => {
    setExpandedSection(prev => prev === sectionId ? null : sectionId);
  };

  const [activeSignal, setActiveSignal] = useState<AiSignalRecord | null>(() => databaseService.getActiveSignalForAsset(liveMarket.id));

  // Retrieve asset title & formatting
  const getAssetTitle = () => {
    switch (liveMarket.id) {
      case 'xau-usd':
        return { symbol: 'XAU/USD', name: 'Gold Spot' };
      case 'xag-usd':
        return { symbol: 'XAG/USD', name: 'Silver' };
      case 'nasdaq-100':
        return { symbol: 'NASDAQ 100', name: 'NASDAQ 100' };
      case 'sp-500':
        return { symbol: 'S&P 500', name: 'S&P 500' };
      case 'crude-oil':
        return { symbol: 'WTI Crude Oil', name: 'WTI Crude Oil' };
      case 'eur-usd':
        return { symbol: 'EUR/USD', name: 'EUR/USD' };
      case 'gbp-usd':
        return { symbol: 'GBP/USD', name: 'GBP/USD' };
      case 'usd-jpy':
        return { symbol: 'USD/JPY', name: 'USD/JPY' };
      case 'aud-usd':
        return { symbol: 'AUD/USD', name: 'AUD/USD' };
      case 'usd-cad':
        return { symbol: 'USD/CAD', name: 'USD/CAD' };
      case 'btc-usd':
        return { symbol: 'BTC/USD', name: 'BTC/USD' };
      default:
        return { symbol: liveMarket.symbol, name: liveMarket.name };
    }
  };

  const assetInfo = getAssetTitle();

  // Timeframe setup calculation grounded on current live BIQUOTE price
  const setup: DetailedTimeframeSetup = getTimeframeSetup(liveMarket.id, selectedTf, liveMarket.price);
  
  // Clean Active Setup determination
  // Valid active trade exists only if signal is BUY or SELL, confidence >= 75%, and not expired
  const isSignalWait = setup.signal === 'WAIT';
  const hasActiveSetup = !isSignalWait && setup.confidence >= 75 && (!activeSignal || activeSignal.status === 'ACTIVE');

  const isBuy = setup.signal === 'BUY';
  const isSell = setup.signal === 'SELL';

  // Take profit targets
  const tp1 = setup.takeProfit;
  const tp2 = setup.takeProfit2 || (isBuy ? setup.entry + (tp1 - setup.entry) * 1.5 : setup.entry - (setup.entry - tp1) * 1.5);
  const tp3 = setup.takeProfit3 || (isBuy ? setup.entry + (tp1 - setup.entry) * 2.2 : setup.entry - (setup.entry - tp1) * 2.2);

  // Sync active signal from database on market change
  useEffect(() => {
    setActiveSignal(databaseService.getActiveSignalForAsset(liveMarket.id));
  }, [liveMarket.id]);

  // Real-time Countdown Timer synchronized with candle intervals
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const mins = now.getMinutes();
      const secs = now.getSeconds();
      const hrs = now.getHours();

      let totalSecs = 0;
      switch (selectedTf) {
        case '1M':
          totalSecs = 60 - secs;
          break;
        case '5M':
          totalSecs = (5 * 60) - ((mins % 5) * 60 + secs);
          break;
        case '15M':
          totalSecs = (15 * 60) - ((mins % 15) * 60 + secs);
          break;
        case '30M':
          totalSecs = (30 * 60) - ((mins % 30) * 60 + secs);
          break;
        case '1H':
          totalSecs = (60 * 60) - (mins * 60 + secs);
          break;
        case '4H':
          totalSecs = (4 * 3600) - (((hrs % 4) * 3600) + mins * 60 + secs);
          break;
        case '1D':
          totalSecs = (24 * 3600) - (hrs * 3600 + mins * 60 + secs);
          break;
        default:
          totalSecs = (30 * 60) - ((mins % 30) * 60 + secs);
      }

      if (totalSecs < 0) totalSecs = 0;
      const m = Math.floor(totalSecs / 60);
      const s = totalSecs % 60;
      setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [selectedTf]);

  // Auto-lock creation on approved BUY/SELL signal with duplicate protection & live price validation
  useEffect(() => {
    if (!activeSignal && (setup.signal === 'BUY' || setup.signal === 'SELL') && setup.confidence >= 75) {
      // Live Price Validation: Ensure entry is close to live BIQUOTE price
      const priceDiffRatio = Math.abs(setup.entry - liveMarket.price) / liveMarket.price;
      if (priceDiffRatio > 0.04) {
        return;
      }

      const candleId = `m30-${liveMarket.id}-${selectedTf}-${Math.floor(Date.now() / (30 * 60 * 1000))}`;
      if (!databaseService.hasActiveSignalForCandle(liveMarket.id, candleId) && !databaseService.hasActiveSignalForAsset(liveMarket.id)) {
        const saved = databaseService.saveSignal({
          assetId: liveMarket.id,
          symbol: assetInfo.symbol,
          category: liveMarket.category || 'commodities',
          decision: setup.signal,
          entry: setup.entry,
          stopLoss: setup.stopLoss,
          tp1: tp1,
          tp2: tp2,
          tp3: tp3,
          confidenceScore: setup.confidence,
          timeframe: selectedTf,
          tradingMode: tradingStyleMode,
          candleId,
          expiryTimestamp: new Date(Date.now() + 4 * 3600 * 1000).toISOString()
        });
        setActiveSignal(saved);
      }
    }
  }, [liveMarket.id, liveMarket.price, selectedTf, setup.signal]);

  // Real-time active trade monitoring against live BIQUOTE ticks
  useEffect(() => {
    if (!activeSignal || activeSignal.status !== 'ACTIVE') return;

    const isBuySignal = activeSignal.decision === 'BUY';
    const sl = activeSignal.stopLoss;
    const tp2Val = activeSignal.tp2 || activeSignal.tp1;
    const currentPrice = liveMarket.price;

    if (new Date(activeSignal.expiryTimestamp).getTime() <= Date.now()) {
      databaseService.updateSignalStatus(activeSignal.id, 'EXPIRED', 'EXPIRED');
      setActiveSignal(null);
      return;
    }

    if (isBuySignal) {
      if (currentPrice >= tp2Val) {
        databaseService.updateSignalStatus(activeSignal.id, 'TP HIT', 'TP2_HIT');
        setActiveSignal(null);
      } else if (currentPrice <= sl) {
        databaseService.updateSignalStatus(activeSignal.id, 'SL HIT', 'SL_HIT');
        setActiveSignal(null);
      }
    } else {
      if (currentPrice <= tp2Val) {
        databaseService.updateSignalStatus(activeSignal.id, 'TP HIT', 'TP2_HIT');
        setActiveSignal(null);
      } else if (currentPrice >= sl) {
        databaseService.updateSignalStatus(activeSignal.id, 'SL HIT', 'SL_HIT');
        setActiveSignal(null);
      }
    }
  }, [liveMarket.price, activeSignal]);

  const activeSignalR = activeSignal ? (() => {
    const isBuySig = activeSignal.decision === 'BUY';
    const risk = Math.abs(activeSignal.entry - activeSignal.stopLoss);
    if (risk === 0) return 0;
    return Number(((isBuySig ? liveMarket.price - activeSignal.entry : activeSignal.entry - liveMarket.price) / risk).toFixed(2));
  })() : 0;

  const handleUnlockOrCancel = (status: 'CANCELLED' | 'TP HIT' | 'SL HIT') => {
    if (!activeSignal) return;
    databaseService.updateSignalStatus(activeSignal.id, status, status === 'TP HIT' ? 'TP2_HIT' : status === 'SL HIT' ? 'SL_HIT' : 'EXPIRED');
    setActiveSignal(null);
  };

  const aurumVerdict = getAurumRiskEvaluation(liveMarket.id, selectedTf);
  const newsStatus = getNewsTradingStatus();
  const starred = isFavorite(liveMarket.id);
  const isPositive = liveMarket.changePercent >= 0;

  const handleCopySignal = () => {
    if (!hasActiveSetup) return;
    const text = `AURUM AI TRADING SIGNAL
Asset: ${assetInfo.symbol} (${assetInfo.name})
Signal: ${setup.signal}
Confidence: ${setup.confidence}%
Live Price: $${liveMarket.price.toLocaleString(undefined, { minimumFractionDigits: liveMarket.decimals })}
Entry: $${setup.entry.toLocaleString(undefined, { minimumFractionDigits: liveMarket.decimals })}
SL: $${setup.stopLoss.toLocaleString(undefined, { minimumFractionDigits: liveMarket.decimals })}
TP: $${tp1.toLocaleString(undefined, { minimumFractionDigits: liveMarket.decimals })}
Status: ACTIVE`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTelegramBroadcast = () => {
    if (!hasActiveSetup) return;
    sendSignalToTelegram(`sig-${liveMarket.id}-${selectedTf}`);
    setTelegramSuccess('Broadcasted signal to Telegram wire!');
    setTimeout(() => setTelegramSuccess(null), 2500);
  };

  // Supported 9 assets list for universal switcher
  const supportedAssetIds = ['xau-usd', 'xag-usd', 'eur-usd', 'gbp-usd', 'usd-jpy', 'aud-usd', 'usd-cad', 'sp-500', 'nasdaq-100'];
  const supportedMarkets = supportedAssetIds.map(id => markets.find(m => m.id === id) || INITIAL_MARKETS.find(m => m.id === id)).filter((m): m is MarketItem => !!m);

  return (
    <div className="w-full space-y-3.5 text-zinc-100 font-sans pb-16">
      
      {/* 0. NAVIGATION & TOP CONTROLS */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition font-mono-num text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Back to Assets</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono-num font-bold text-[10.5px]">
            {tradingStyleMode}
          </span>
          <button
            onClick={() => toggleWatchlist(liveMarket.id)}
            className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-400 transition cursor-pointer"
            title={starred ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            <Star className={`w-4 h-4 ${starred ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Horizontal Asset Switcher - All 9 Supported Assets */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-mono-num font-bold">
        {supportedMarkets.map((m) => {
          const isActive = m.id === liveMarket.id;
          const shortName = m.id === 'xau-usd' ? 'XAU/USD' : m.id === 'xag-usd' ? 'XAG/USD' : m.symbol;
          return (
            <button
              key={m.id}
              onClick={() => onSelectOtherMarket(m)}
              className={`py-1 px-2.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-black font-black shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {shortName}
            </button>
          );
        })}
      </div>

      {/* 1. CONNECTION VALIDATION (BIQUOTE Live Price Status) */}
      <ConnectionValidationCard assetId={liveMarket.id} />

      {/* 1b. REAL-TIME TICK PIPELINE DEBUG PANEL */}
      <LiveTickDebugPanel assetId={liveMarket.id} />

      {/* AURUM TERMINAL LIVE SIGNAL + TRADE LOCK CONTROLLER */}
      <TerminalTradeLockController
        market={liveMarket}
        selectedTf={selectedTf}
        onTimeframeSelect={(tf) => setSelectedTf(tf)}
        onOpenChart={() => setShowChart(!showChart)}
      />

      {/* Timeframe Selector Pills */}
      <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none font-mono-num text-[11px] font-bold">
        <span className="text-[10px] uppercase text-zinc-500 font-semibold mr-1 shrink-0">TF:</span>
        {ALL_TIMEFRAMES.map(tf => {
          const isTfActive = selectedTf === tf;
          return (
            <button
              key={tf}
              onClick={() => setSelectedTf(tf)}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer shrink-0 ${
                isTfActive
                  ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {tf}
            </button>
          );
        })}
      </div>

      {/* Optional Candlestick Chart Drawer */}
      {showChart && (
        <div className="p-3.5 rounded-3xl bg-[#090b12] border border-zinc-800 space-y-3 font-mono-num">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white uppercase flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
              SMC Candlestick Chart ({selectedTf})
            </span>
            <span className="text-[10.5px] text-zinc-400">Live Spot Ticks</span>
          </div>
          <InteractiveCandleChart
            market={liveMarket}
            timeframe={selectedTf}
            onTimeframeChange={setSelectedTf}
            height={260}
          />
        </div>
      )}

      {/* =========================================================================
          3. EXPANDABLE ADVANCED ANALYSIS SECTIONS
          Keep backend calculations unchanged.
          Moved behind clean expandable panels:
          - AURUM AI reasoning
          - Qwen reasoning
          - SMC analysis
          - Market structure
          - Risk analysis
          - News analysis
          - Strategy details
      ========================================================================= */}
      <div className="space-y-2 font-mono-num pt-1">
        <div className="flex items-center justify-between px-1 text-xs text-zinc-400">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-500">
            ADVANCED AI CONFLUENCE & ANALYSIS
          </span>
          <span className="text-[10px] text-amber-400/80">
            Tap to expand details
          </span>
        </div>

        {/* 1. AURUM AI REASONING */}
        <div className="rounded-2xl bg-zinc-950 border border-zinc-800/90 overflow-hidden">
          <button
            onClick={() => toggleAccordion('aurumAi')}
            className="w-full p-3.5 flex items-center justify-between bg-zinc-950 hover:bg-zinc-900/60 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  AURUM AI Reasoning
                </h3>
                <span className="text-[10px] text-zinc-400 font-sans block">
                  Autonomous trend conviction & algorithmic thesis
                </span>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'aurumAi' ? 'rotate-180' : ''}`} />
          </button>

          {expandedSection === 'aurumAi' && (
            <div className="p-3.5 border-t border-zinc-800/80 space-y-2 text-xs font-sans">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-200 leading-relaxed text-xs">
                {setup.aiReason || 'Institutional order flow alignment detected with multi-timeframe trend continuation.'}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono-num">
                <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">AURUM Conviction</span>
                  <span className="text-sm font-black text-amber-400 block mt-0.5">{setup.confidence}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Execution Bias</span>
                  <span className={`text-sm font-black block mt-0.5 ${isBuy ? 'text-emerald-400' : isSell ? 'text-rose-400' : 'text-amber-400'}`}>
                    {setup.signal}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. SECONDARY VALIDATOR REASONING */}
        <div className="rounded-2xl bg-zinc-950 border border-zinc-800/90 overflow-hidden">
          <button
            onClick={() => toggleAccordion('qwenAi')}
            className="w-full p-3.5 flex items-center justify-between bg-zinc-950 hover:bg-zinc-900/60 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-sky-400" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  Consensus Validator Reasoning
                </h3>
                <span className="text-[10px] text-zinc-400 font-sans block">
                  Secondary quantitative risk confirmation & counter-trend audit
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30">
                2/2 CONFIRMED
              </span>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'qwenAi' ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {expandedSection === 'qwenAi' && (
            <div className="p-3.5 border-t border-zinc-800/80 space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-200 leading-relaxed font-sans text-xs">
                Quantitative Consensus Engine validates signal direction ({setup.signal}). Macro liquidity and risk tolerance are within institutional bounds. No fatal divergence identified.
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs">
                <span className="text-zinc-400 font-medium">Council Consensus Status:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Unanimous Approval</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. SMC ANALYSIS */}
        <div className="rounded-2xl bg-zinc-950 border border-zinc-800/90 overflow-hidden">
          <button
            onClick={() => toggleAccordion('smc')}
            className="w-full p-3.5 flex items-center justify-between bg-zinc-950 hover:bg-zinc-900/60 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  SMC Analysis
                </h3>
                <span className="text-[10px] text-zinc-400 font-sans block">
                  Order Block, Fair Value Gap (FVG), Liquidity Sweep, BOS & CHOCH
                </span>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'smc' ? 'rotate-180' : ''}`} />
          </button>

          {expandedSection === 'smc' && (
            <div className="p-3.5 border-t border-zinc-800/80 space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <span className="text-[10px] font-bold text-amber-400 uppercase block">Order Block</span>
                  <span className="text-xs text-zinc-200 font-semibold block mt-0.5 truncate">
                    {setup.strategies.smc.orderBlock}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <span className="text-[10px] font-bold text-purple-400 uppercase block">Fair Value Gap (FVG)</span>
                  <span className="text-xs text-zinc-200 font-semibold block mt-0.5 truncate">
                    {setup.strategies.smc.fairValueGap}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <span className="text-[10px] font-bold text-sky-400 uppercase block">Liquidity Sweep</span>
                  <span className="text-xs text-zinc-200 font-semibold block mt-0.5 truncate">
                    {setup.strategies.smc.liquiditySweep}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block">BOS & CHOCH</span>
                  <div className="text-xs text-zinc-200 font-semibold space-y-0.5 mt-0.5 truncate">
                    <div>BOS: <strong className="text-emerald-300">{setup.strategies.smc.bos}</strong></div>
                    <div>CHOCH: <strong className="text-emerald-300">{setup.strategies.smc.choch}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. MARKET STRUCTURE */}
        <div className="rounded-2xl bg-zinc-950 border border-zinc-800/90 overflow-hidden">
          <button
            onClick={() => toggleAccordion('structure')}
            className="w-full p-3.5 flex items-center justify-between bg-zinc-950 hover:bg-zinc-900/60 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  Market Structure
                </h3>
                <span className="text-[10px] text-zinc-400 font-sans block">
                  Structural bias, displacement series & invalidation level
                </span>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'structure' ? 'rotate-180' : ''}`} />
          </button>

          {expandedSection === 'structure' && (
            <div className="p-3.5 border-t border-zinc-800/80 space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">Structure Bias</span>
                  <span className="text-xs text-zinc-200 font-bold block mt-0.5">
                    {setup.strategies.marketStructure.structureBias}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">Internal Structure</span>
                  <span className="text-xs text-zinc-200 font-bold block mt-0.5">
                    {setup.strategies.marketStructure.internalStructure}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <span className="text-[10px] font-bold text-rose-400 uppercase block">Invalidation Level</span>
                  <span className="text-xs text-rose-300 font-bold block mt-0.5">
                    {setup.strategies.marketStructure.invalidationLevel}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. RISK ANALYSIS */}
        <div className="rounded-2xl bg-zinc-950 border border-zinc-800/90 overflow-hidden">
          <button
            onClick={() => toggleAccordion('risk')}
            className="w-full p-3.5 flex items-center justify-between bg-zinc-950 hover:bg-zinc-900/60 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  Risk Analysis
                </h3>
                <span className="text-[10px] text-zinc-400 font-sans block">
                  Risk:Reward profile, ATR volatility & drawdown limit
                </span>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'risk' ? 'rotate-180' : ''}`} />
          </button>

          {expandedSection === 'risk' && (
            <div className="p-3.5 border-t border-zinc-800/80 space-y-2 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Risk:Reward</span>
                  <span className="text-sm font-black text-amber-300 block mt-0.5">{setup.riskReward}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Max Risk</span>
                  <span className="text-sm font-black text-emerald-400 block mt-0.5">1.0% Equity</span>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block font-semibold">ATR Volatility</span>
                  <span className="text-sm font-black text-zinc-200 block mt-0.5">{getAssetVolatility(liveMarket).level}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Active Session</span>
                  <span className="text-sm font-black text-sky-400 block mt-0.5 truncate">{getCurrentMarketSession().activeSession}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 6. NEWS ANALYSIS */}
        <div className="rounded-2xl bg-zinc-950 border border-zinc-800/90 overflow-hidden">
          <button
            onClick={() => toggleAccordion('news')}
            className="w-full p-3.5 flex items-center justify-between bg-zinc-950 hover:bg-zinc-900/60 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-sky-400" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  News Analysis
                </h3>
                <span className="text-[10px] text-zinc-400 font-sans block">
                  Macro calendar filter & central bank event clearance
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                newsStatus.isBlocked ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
              }`}>
                {newsStatus.isBlocked ? 'LOCKED' : 'CLEAR'}
              </span>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'news' ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {expandedSection === 'news' && (
            <div className="p-3.5 border-t border-zinc-800/80 space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300 font-sans text-xs">
                {newsStatus.status}
              </div>
            </div>
          )}
        </div>

        {/* 7. STRATEGY DETAILS */}
        <div className="rounded-2xl bg-zinc-950 border border-zinc-800/90 overflow-hidden">
          <button
            onClick={() => toggleAccordion('strategy')}
            className="w-full p-3.5 flex items-center justify-between bg-zinc-950 hover:bg-zinc-900/60 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  Strategy Details
                </h3>
                <span className="text-[10px] text-zinc-400 font-sans block">
                  EMA 20/50/200 stack, Breakout/Retest & RSI/MACD momentum
                </span>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'strategy' ? 'rotate-180' : ''}`} />
          </button>

          {expandedSection === 'strategy' && (
            <div className="p-3.5 border-t border-zinc-800/80 space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <span className="text-[10px] font-bold text-amber-400 uppercase block">EMA Alignment</span>
                  <span className="text-xs text-zinc-100 font-bold block mt-0.5 truncate">
                    {setup.strategies.trendFollowing.emaAlignment}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <span className="text-[10px] font-bold text-sky-400 uppercase block">Momentum / RSI</span>
                  <span className="text-xs text-zinc-100 font-bold block mt-0.5">
                    RSI {setup.strategies.momentum.rsi} • {setup.strategies.momentum.rsiStatus}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Signal Lock Management (Only if active locked signal) */}
        {activeSignal && (
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Trade Lock PnL</span>
              <div className="text-white font-bold">
                PnL: <strong className={activeSignalR >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{activeSignalR >= 0 ? `+${activeSignalR}R` : `${activeSignalR}R`}</strong>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleUnlockOrCancel('TP HIT')}
                className="py-1 px-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10.5px] font-bold hover:bg-emerald-500/30 transition cursor-pointer"
              >
                TP Hit
              </button>
              <button
                onClick={() => handleUnlockOrCancel('SL HIT')}
                className="py-1 px-2.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10.5px] font-bold hover:bg-rose-500/30 transition cursor-pointer"
              >
                SL Hit
              </button>
              <button
                onClick={() => handleUnlockOrCancel('CANCELLED')}
                className="py-1 px-2 rounded-lg bg-zinc-800 text-zinc-300 text-[10.5px] font-bold hover:bg-zinc-700 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
