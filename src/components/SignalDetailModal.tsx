import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Copy, 
  Check, 
  Send, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Target, 
  Layers, 
  LineChart,
  BarChart2,
  RefreshCw,
  Compass,
  Gauge,
  Info,
  ChevronDown,
  Sliders,
  BrainCircuit,
  Activity,
  Clock
} from 'lucide-react';
import { MarketItem, Timeframe, SignalType, AssetAiProfile } from '../types';
import { getTimeframeSetup, DetailedTimeframeSetup } from '../data/timeframeSignals';
import { useMarket } from '../context/MarketContext';
import { InteractiveCandleChart } from './InteractiveCandleChart';
import { ModeAnalysisPanel } from './ModeAnalysisPanel';
import { getCompositeAiScore, getNewsTradingStatus } from '../data/newsIntelligenceData';
import { getAurumRiskEvaluation } from '../data/riskQualityData';
import { getStyleAdjustedParameters, TRADING_STYLES } from '../data/tradingStyleData';
import { getAssetAiProfile } from '../data/multiAssetIntelligence';
import { SignalLifecycleTimeline } from './SignalLifecycleTimeline';
import { SmartTradeApprovalChecklist } from './SmartTradeApprovalChecklist';
import { AiConfidenceBreakdown } from './AiConfidenceBreakdown';
import { ASSET_BACKTEST_DATA } from '../data/backtestLearningData';

interface SignalDetailModalProps {
  market: MarketItem | null;
  onClose: () => void;
  initialViewMode?: 'AI_SETUP' | 'CHART' | 'MODE_AI' | 'AI_PROFILE' | 'LIFECYCLE' | 'STRATEGY';
}

type StrategyTab = 'ALL' | 'SMC' | 'TREND' | 'BREAKOUT' | 'LIQUIDITY' | 'STRUCTURE' | 'MOMENTUM';

export const SignalDetailModal: React.FC<SignalDetailModalProps> = ({ 
  market, 
  onClose,
  initialViewMode = 'AI_SETUP'
}) => {
  const { tradingStyleMode, sendSignalToTelegram } = useMarket();
  const activeStyleConfig = TRADING_STYLES[tradingStyleMode];

  const [selectedTf, setSelectedTf] = useState<Timeframe>(activeStyleConfig.primaryTimeframe);
  const [modalView, setModalView] = useState<'AI_SETUP' | 'CHART' | 'MODE_AI' | 'AI_PROFILE' | 'LIFECYCLE' | 'STRATEGY'>(initialViewMode);
  const [expandedSections, setExpandedSections] = useState({
    timeframes: true,
    tradeSetup: true,
    smc: true,
    strategy: true,
    backtest: true
  });
  const [activeTab, setActiveTab] = useState<StrategyTab>('ALL');
  const [copied, setCopied] = useState<boolean>(false);
  const [telegramSuccess, setTelegramSuccess] = useState<string | null>(null);
  const [profileStyleTab, setProfileStyleTab] = useState<'scalping' | 'intraday' | 'swing'>('intraday');

  if (!market) return null;

  const profile: AssetAiProfile = getAssetAiProfile(market.id);
  const profileWeights = profile.strategyWeightAdjustment[profileStyleTab];

  const styleParams = getStyleAdjustedParameters(
    market.id,
    getTimeframeSetup(market.id, selectedTf).entry,
    getTimeframeSetup(market.id, selectedTf).stopLoss,
    getTimeframeSetup(market.id, selectedTf).takeProfit,
    getTimeframeSetup(market.id, selectedTf).takeProfit2,
    getTimeframeSetup(market.id, selectedTf).confidence,
    tradingStyleMode
  );

  const setup: DetailedTimeframeSetup = getTimeframeSetup(market.id, selectedTf);
  const compositeScore = getCompositeAiScore(market.id, selectedTf);
  const newsStatus = getNewsTradingStatus();
  const aurumVerdict = getAurumRiskEvaluation(market.id, selectedTf);
  const availableTimeframes = activeStyleConfig.timeframes;

  // Asset display titles
  const getAssetDisplay = () => {
    switch (market.id) {
      case 'xau-usd':
        return 'XAU/USD Gold';
      case 'nasdaq-100':
        return 'NASDAQ 100';
      case 'sp-500':
        return 'S&P 500';
      case 'crude-oil':
        return 'Oil (WTI Crude)';
      case 'xag-usd':
        return 'Silver (XAG/USD)';
      default:
        return market.symbol;
    }
  };

  const assetTitle = getAssetDisplay();

  // Signal styling
  const signalBadgeConfig: Record<SignalType, {
    bg: string;
    text: string;
    border: string;
    glow: string;
    dot: string;
  }> = {
    BUY: {
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-400',
      border: 'border-emerald-500/40',
      glow: 'shadow-[0_0_16px_rgba(16,185,129,0.3)]',
      dot: 'bg-emerald-400'
    },
    SELL: {
      bg: 'bg-rose-500/20',
      text: 'text-rose-400',
      border: 'border-rose-500/40',
      glow: 'shadow-[0_0_16px_rgba(244,63,94,0.3)]',
      dot: 'bg-rose-400'
    },
    WAIT: {
      bg: 'bg-amber-500/20',
      text: 'text-amber-400',
      border: 'border-amber-500/40',
      glow: 'shadow-[0_0_16px_rgba(245,158,11,0.3)]',
      dot: 'bg-amber-400'
    }
  };

  const badgeStyle = signalBadgeConfig[setup.signal] || signalBadgeConfig.WAIT;

  // Copy formatted signal to clipboard
  const handleCopySignal = () => {
    const s = setup.strategies;
    const formatted = `AURUM AI TRADING SIGNAL

Asset: ${assetTitle}
Signal: ${setup.signal}
Entry: $${setup.entry.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
Stop Loss: $${setup.stopLoss.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
Take Profit: $${setup.takeProfit.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
Risk Reward: ${setup.riskReward}
Timeframe: ${setup.timeframe}
Confidence: ${setup.confidence}%

AI Reason:
${setup.aiReason}

AI STRATEGY ANALYSIS:
1. Smart Money Concepts (SMC):
   • Order Block: ${s.smc.orderBlock}
   • Fair Value Gap (FVG): ${s.smc.fairValueGap}
   • Liquidity Sweep: ${s.smc.liquiditySweep}
   • BOS: ${s.smc.bos}
   • CHOCH: ${s.smc.choch}

2. Trend Following:
   • EMA Stack: ${s.trendFollowing.emaAlignment}
   • EMA 20: ${s.trendFollowing.ema20} | EMA 50: ${s.trendFollowing.ema50} | EMA 200: ${s.trendFollowing.ema200}
   • Pullback: ${s.trendFollowing.pullbackConfirmation}

3. Breakout Retest:
   • Level: ${s.breakoutRetest.breakoutLevel}
   • Status: ${s.breakoutRetest.retestStatus}
   • Volume: ${s.breakoutRetest.volumeConfirmation}

4. Liquidity Reversal:
   • Sweep: ${s.liquidityReversal.sweepLevel}
   • Zone: ${s.liquidityReversal.reversalZone}
   • Target: ${s.liquidityReversal.targetPool}

5. Market Structure:
   • Bias: ${s.marketStructure.structureBias}
   • Internal: ${s.marketStructure.internalStructure}
   • Invalidation: ${s.marketStructure.invalidationLevel}

6. Momentum Confirmation:
   • RSI: ${s.momentum.rsi} (${s.momentum.rsiStatus})
   • MACD: ${s.momentum.macd}
   • Volume: ${s.momentum.volume}`;

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Telegram dispatch
  const handleTelegramSend = () => {
    sendSignalToTelegram(`sig-${market.id}-01`);
    setTelegramSuccess('Signal broadcasted to Telegram Wire!');
    setTimeout(() => setTelegramSuccess(null), 2500);
  };

  const st = setup.strategies;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, y: 70, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 70, scale: 0.97 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-xl max-h-[94vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#090b10] border border-amber-500/30 shadow-2xl p-4 sm:p-6 space-y-4 text-zinc-100 selection:bg-amber-500/20"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20">
                <Zap className="w-4 h-4 text-black" />
              </div>
              <div>
                <h2 className="text-base font-bold font-syne text-white tracking-wide">
                  AURUM <span className="text-amber-400">AI SIGNAL ENGINE</span>
                </h2>
                <span className="text-[11px] font-mono-num text-zinc-400">
                  Strategy Confluence & Execution Levels
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Timeframe Buttons filtered by Trading Style Mode */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono-num text-zinc-400">
              <span className="uppercase tracking-wider flex items-center gap-1.5">
                <span>{tradingStyleMode} TIMEFRAMES</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-extrabold text-[9px]">
                  {activeStyleConfig.badge}
                </span>
              </span>
              <span className="text-amber-400 font-semibold">{selectedTf} Calibrated</span>
            </div>

            <div className={`grid gap-1.5 p-1 rounded-xl bg-neutral-950 border border-zinc-800/80 ${
              availableTimeframes.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
            }`}>
              {availableTimeframes.map((tf) => {
                const isActive = selectedTf === tf;
                return (
                  <button
                    key={tf}
                    onClick={() => setSelectedTf(tf)}
                    className={`py-1.5 rounded-lg text-xs font-mono-num font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25 scale-[1.02]'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                    }`}
                  >
                    {tf}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Asset & Signal Summary Card */}
          <div className="p-4 rounded-2xl bg-[#0e111a] border border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono-num text-zinc-400 uppercase tracking-wider block">
                  Asset
                </span>
                <span className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {assetTitle}
                </span>
              </div>

              {/* Signal Badge */}
              <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono-num tracking-wide border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border} ${badgeStyle.glow}`}>
                <span className={`w-2 h-2 rounded-full ${badgeStyle.dot} animate-pulse`} />
                <span>{setup.signal}</span>
              </div>
            </div>

            {/* Current Price, Timeframe & Confidence Row */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/60 text-xs font-mono-num">
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase">Current Price</span>
                <span className="text-sm font-bold text-zinc-100">
                  ${market.price.toLocaleString(undefined, { 
                    minimumFractionDigits: market.decimals, 
                    maximumFractionDigits: market.decimals 
                  })}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 block uppercase">Timeframe</span>
                <span className="text-sm font-bold text-amber-300">
                  {setup.timeframe}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 block uppercase">Confidence</span>
                <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  {setup.confidence}%
                </span>
              </div>
            </div>
          </div>

          {/* COMBINED AI TRADE SCORE & RISK VERDICT MATRIX */}
          <div className="p-3.5 rounded-2xl bg-[#0b0e17] border border-amber-500/35 space-y-3 font-mono-num shadow-xl">
            {/* Header: Title, Grade Badge, News Status */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  AURUM FINAL VERDICT
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${
                  aurumVerdict.setupGrade === 'A+ Setup'
                    ? 'bg-emerald-500 text-black border-emerald-400'
                    : aurumVerdict.setupGrade === 'A Setup'
                      ? 'bg-amber-500 text-black border-amber-400'
                      : aurumVerdict.setupGrade === 'B Setup'
                        ? 'bg-blue-500 text-white border-blue-400'
                        : 'bg-rose-500 text-white border-rose-400 animate-pulse'
                }`}>
                  {aurumVerdict.setupGrade}
                </span>

                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  newsStatus.isBlocked
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {newsStatus.status}
                </span>
              </div>
            </div>

            {/* 5 Score Pillars: Technical, SMC, Momentum, News, Risk */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs">
              <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800 text-center">
                <span className="text-[9px] text-zinc-500 uppercase block">Technical</span>
                <span className="text-xs font-bold text-zinc-100">{aurumVerdict.scores.technicalScore}%</span>
              </div>
              <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800 text-center">
                <span className="text-[9px] text-zinc-500 uppercase block">SMC</span>
                <span className="text-xs font-bold text-amber-300">{aurumVerdict.scores.smcScore}%</span>
              </div>
              <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800 text-center">
                <span className="text-[9px] text-zinc-500 uppercase block">Momentum</span>
                <span className="text-xs font-bold text-emerald-400">{aurumVerdict.scores.momentumScore}%</span>
              </div>
              <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800 text-center">
                <span className="text-[9px] text-zinc-500 uppercase block">News Score</span>
                <span className={`text-xs font-bold ${aurumVerdict.scores.newsScore < 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {aurumVerdict.scores.newsScore}%
                </span>
              </div>
              <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800 text-center col-span-2 sm:col-span-1">
                <span className="text-[9px] text-zinc-500 uppercase block">Risk Score</span>
                <span className="text-xs font-bold text-amber-300">{aurumVerdict.scores.riskScore}%</span>
              </div>
            </div>

            {/* Final AI Output Row */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950 border border-amber-500/20 text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Verdict Output</span>
                <span className="text-xs font-bold text-zinc-300">
                  Confidence: <strong className="text-emerald-400">{aurumVerdict.confidence}%</strong>
                </span>
              </div>

              <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border shadow-md ${
                aurumVerdict.decision === 'BUY'
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow-emerald-500/30'
                  : aurumVerdict.decision === 'SELL'
                    ? 'bg-rose-500 text-white border-rose-400 shadow-rose-500/30'
                    : 'bg-amber-500 text-black border-amber-400 shadow-amber-500/30'
              }`}>
                {aurumVerdict.decision}
              </span>
            </div>

            {/* AI Verdict Reason */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-0.5">
              <span className="text-[9.5px] font-bold text-amber-300 uppercase block">AI Verdict Rationale</span>
              <p className="text-[11px] text-zinc-200 font-sans leading-tight">
                {aurumVerdict.verdictReason}
              </p>
            </div>

            {/* AI Validation Layer: Smart Trade Approval & Confidence Breakdown */}
            <div className="space-y-3.5 pt-1">
              <SmartTradeApprovalChecklist
                assetId={market.id}
                symbol={market.symbol}
                tradingMode={tradingStyleMode}
              />

              <AiConfidenceBreakdown
                assetId={market.id}
                timeframe={selectedTf}
                tradingMode={tradingStyleMode}
              />
            </div>
          </div>

          {/* View Mode Toggle: Detailed AI Setup vs Interactive Chart vs Mode AI vs AI Profile vs Lifecycle vs Strategy */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 p-1 rounded-xl bg-neutral-950 border border-zinc-800 text-[10px] sm:text-xs font-mono-num font-bold">
            <button
              onClick={() => setModalView('AI_SETUP')}
              className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer text-center ${
                modalView === 'AI_SETUP'
                  ? 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38728] text-black shadow-md shadow-amber-500/25 font-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="truncate">AI Setup</span>
            </button>
            <button
              onClick={() => setModalView('CHART')}
              className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer text-center ${
                modalView === 'CHART'
                  ? 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38728] text-black shadow-md shadow-amber-500/25 font-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="truncate">Chart</span>
            </button>
            <button
              onClick={() => setModalView('LIFECYCLE')}
              className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer text-center ${
                modalView === 'LIFECYCLE'
                  ? 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38728] text-black shadow-md shadow-amber-500/25 font-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="truncate">Lifecycle</span>
            </button>
            <button
              onClick={() => setModalView('MODE_AI')}
              className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer text-center ${
                modalView === 'MODE_AI'
                  ? 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38728] text-black shadow-md shadow-amber-500/25 font-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="truncate">Mode AI</span>
            </button>
            <button
              onClick={() => setModalView('AI_PROFILE')}
              className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer text-center ${
                modalView === 'AI_PROFILE'
                  ? 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38728] text-black shadow-md shadow-amber-500/25 font-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span className="truncate">Profile</span>
            </button>
            <button
              onClick={() => setModalView('STRATEGY')}
              className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer text-center ${
                modalView === 'STRATEGY'
                  ? 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38728] text-black shadow-md shadow-amber-500/25 font-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="truncate">Strategy</span>
            </button>
          </div>

          {modalView === 'AI_SETUP' ? (
            /* DETAILED AI SETUP PAGE VIEW (5 SECTIONS) */
            <div className="space-y-3.5 font-mono-num">
              {/* 1. ALL TIMEFRAMES ANALYSIS */}
              <div className="rounded-2xl bg-[#0c0f18] border border-amber-500/25 p-3.5 space-y-3">
                <div 
                  onClick={() => setExpandedSections(prev => ({ ...prev, timeframes: !prev.timeframes }))}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wide">
                      1. ALL TIMEFRAMES ANALYSIS
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 font-bold">8 Timeframes Active</span>
                    {expandedSections.timeframes ? <ChevronDown className="w-4 h-4 text-zinc-400 rotate-180 transition" /> : <ChevronDown className="w-4 h-4 text-zinc-400 transition" />}
                  </div>
                </div>

                {expandedSections.timeframes && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-800/80">
                    {(['1M', '5M', '15M', '30M', '1H', '4H', '1D', '1W'] as Timeframe[]).map((tf) => {
                      const tfSetup = getTimeframeSetup(market.id, tf);
                      const isSelected = selectedTf === tf;
                      
                      let statusText = 'In Entry Zone';
                      if (tf === '1M') statusText = 'Micro FVG Entry';
                      else if (tf === '5M') statusText = 'OB Mitigation';
                      else if (tf === '15M') statusText = 'In Entry Zone';
                      else if (tf === '30M') statusText = 'Sweep Complete';
                      else if (tf === '1H') statusText = 'Optimal Entry';
                      else if (tf === '4H') statusText = 'Trend Retest';
                      else if (tf === '1D') statusText = 'Structural Base';
                      else if (tf === '1W') statusText = 'Macro Accumulation';

                      return (
                        <button
                          key={tf}
                          onClick={() => setSelectedTf(tf)}
                          className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-amber-500/15 border-amber-400/80 shadow-[0_0_12px_rgba(245,158,11,0.2)] scale-[1.02]' 
                              : 'bg-neutral-950/80 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-zinc-300'}`}>
                              {tf}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                              tfSetup.signal === 'BUY' 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                : tfSetup.signal === 'SELL' 
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {tfSetup.signal}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-zinc-500">Confidence</span>
                            <span className="font-bold text-amber-300">{tfSetup.confidence}%</span>
                          </div>
                          <div className="text-[9px] text-zinc-500 truncate mt-1 pt-1 border-t border-zinc-800/50">
                            {statusText}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. AI TRADE SETUP */}
              <div className="rounded-2xl bg-[#0c0f18] border border-amber-500/25 p-3.5 space-y-3">
                <div 
                  onClick={() => setExpandedSections(prev => ({ ...prev, tradeSetup: !prev.tradeSetup }))}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs sm:text-sm font-bold text-emerald-300 uppercase tracking-wide">
                      2. AI TRADE SETUP ({selectedTf})
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${badgeStyle.bg} ${badgeStyle.text}`}>
                      {setup.signal}
                    </span>
                    {expandedSections.tradeSetup ? <ChevronDown className="w-4 h-4 text-zinc-400 rotate-180 transition" /> : <ChevronDown className="w-4 h-4 text-zinc-400 transition" />}
                  </div>
                </div>

                {expandedSections.tradeSetup && (
                  <div className="space-y-3 pt-2 border-t border-zinc-800/80">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800">
                        <span className="text-[9.5px] text-zinc-500 block uppercase">Signal</span>
                        <span className={`text-xs font-black ${badgeStyle.text}`}>{setup.signal}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800">
                        <span className="text-[9.5px] text-zinc-500 block uppercase">Entry</span>
                        <span className="text-xs font-bold text-zinc-100 truncate block">
                          ${setup.entry.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-neutral-950 border border-rose-500/30">
                        <span className="text-[9.5px] text-rose-400/80 block uppercase">Stop Loss</span>
                        <span className="text-xs font-bold text-rose-400 truncate block">
                          ${setup.stopLoss.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-neutral-950 border border-amber-500/30">
                        <span className="text-[9.5px] text-amber-400 block uppercase">Risk Reward</span>
                        <span className="text-xs font-bold text-amber-300 truncate block">{setup.riskReward}</span>
                      </div>
                    </div>

                    {/* TP Targets Row */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                        <span className="text-[9.5px] text-emerald-400/80 block uppercase">TP1 Target</span>
                        <span className="text-xs font-bold text-emerald-300 truncate block">
                          ${setup.takeProfit.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
                        <span className="text-[9.5px] text-emerald-400/80 block uppercase">TP2 Target</span>
                        <span className="text-xs font-bold text-emerald-300 truncate block">
                          ${(setup.takeProfit2 ?? (setup.signal === 'SELL' ? setup.entry - Math.abs(setup.takeProfit - setup.entry) * 1.6 : setup.entry + Math.abs(setup.takeProfit - setup.entry) * 1.6)).toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-400">
                        <span className="text-[9.5px] text-emerald-300 block uppercase">TP3 Target</span>
                        <span className="text-xs font-extrabold text-emerald-200 truncate block">
                          ${(setup.takeProfit3 ?? (setup.signal === 'SELL' ? setup.entry - Math.abs(setup.takeProfit - setup.entry) * 2.3 : setup.entry + Math.abs(setup.takeProfit - setup.entry) * 2.3)).toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
                        </span>
                      </div>
                    </div>

                    {/* AI Reason */}
                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800 space-y-0.5">
                      <span className="text-[9.5px] text-amber-400 font-bold uppercase block">AI Reason</span>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">{setup.aiReason}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. SMART MONEY ANALYSIS */}
              <div className="rounded-2xl bg-[#0c0f18] border border-amber-500/25 p-3.5 space-y-3">
                <div 
                  onClick={() => setExpandedSections(prev => ({ ...prev, smc: !prev.smc }))}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wide">
                      3. SMART MONEY ANALYSIS (SMC)
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 font-bold">Institutional Flow</span>
                    {expandedSections.smc ? <ChevronDown className="w-4 h-4 text-zinc-400 rotate-180 transition" /> : <ChevronDown className="w-4 h-4 text-zinc-400 transition" />}
                  </div>
                </div>

                {expandedSections.smc && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80 text-xs">
                    <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800 flex items-center justify-between">
                      <span className="text-zinc-400 text-[11px]">Order Block</span>
                      <span className="font-bold text-amber-300 text-[11px] truncate">{st.smc.orderBlock}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800 flex items-center justify-between">
                      <span className="text-zinc-400 text-[11px]">Fair Value Gap</span>
                      <span className="font-bold text-amber-300 text-[11px] truncate">{st.smc.fairValueGap}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800 flex items-center justify-between">
                      <span className="text-zinc-400 text-[11px]">Liquidity Zone</span>
                      <span className="font-bold text-emerald-400 text-[11px] truncate">{st.smc.liquiditySweep}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800 flex items-center justify-between">
                      <span className="text-zinc-400 text-[11px]">BOS Level</span>
                      <span className="font-bold text-zinc-100 text-[11px] truncate">{st.smc.bos}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800 flex items-center justify-between sm:col-span-2">
                      <span className="text-zinc-400 text-[11px]">CHOCH Level</span>
                      <span className="font-bold text-amber-300 text-[11px] truncate">{st.smc.choch}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. STRATEGY CONFIRMATION */}
              <div className="rounded-2xl bg-[#0c0f18] border border-amber-500/25 p-3.5 space-y-3">
                <div 
                  onClick={() => setExpandedSections(prev => ({ ...prev, strategy: !prev.strategy }))}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wide">
                      4. STRATEGY CONFIRMATION
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400">5 Pillars Confluence</span>
                    {expandedSections.strategy ? <ChevronDown className="w-4 h-4 text-zinc-400 rotate-180 transition" /> : <ChevronDown className="w-4 h-4 text-zinc-400 transition" />}
                  </div>
                </div>

                {expandedSections.strategy && (
                  <div className="space-y-2.5 pt-2 border-t border-zinc-800/80 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-center">
                      <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800">
                        <span className="text-[9px] text-zinc-500 uppercase block">SMC</span>
                        <span className="font-bold text-amber-300 text-[11px]">CONFIRMED</span>
                      </div>
                      <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800">
                        <span className="text-[9px] text-zinc-500 uppercase block">Trend</span>
                        <span className="font-bold text-emerald-400 text-[11px]">ALIGNED</span>
                      </div>
                      <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800">
                        <span className="text-[9px] text-zinc-500 uppercase block">Breakout</span>
                        <span className="font-bold text-zinc-200 text-[11px]">RETESTED</span>
                      </div>
                      <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800">
                        <span className="text-[9px] text-zinc-500 uppercase block">Liquidity</span>
                        <span className="font-bold text-amber-300 text-[11px]">SWEPT</span>
                      </div>
                      <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800 col-span-2 sm:col-span-1">
                        <span className="text-[9px] text-zinc-500 uppercase block">Momentum</span>
                        <span className="font-bold text-emerald-400 text-[11px]">EXPANDING</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-neutral-950 to-neutral-950 border border-amber-500/40">
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase block">Final AI Score</span>
                        <span className="text-xs text-zinc-300 font-bold">Strategy Confluence</span>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="text-lg font-black text-amber-300 font-mono-num">{setup.confidence}%</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500 text-black font-extrabold text-[9.5px]">
                          A+ SETUP
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. BACKTEST SUMMARY */}
              {(() => {
                const backtest = ASSET_BACKTEST_DATA.find(b => b.assetId === market.id) || ASSET_BACKTEST_DATA[0];
                return (
                  <div className="rounded-2xl bg-[#0c0f18] border border-amber-500/25 p-3.5 space-y-3">
                    <div 
                      onClick={() => setExpandedSections(prev => ({ ...prev, backtest: !prev.backtest }))}
                      className="flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs sm:text-sm font-bold text-emerald-300 uppercase tracking-wide">
                          5. BACKTEST SUMMARY
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-amber-300 font-bold">{backtest.totalTrades} Trades Tested</span>
                        {expandedSections.backtest ? <ChevronDown className="w-4 h-4 text-zinc-400 rotate-180 transition" /> : <ChevronDown className="w-4 h-4 text-zinc-400 transition" />}
                      </div>
                    </div>

                    {expandedSections.backtest && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-800/80 text-xs">
                        <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800">
                          <span className="text-[9.5px] text-zinc-500 block uppercase">Win Rate</span>
                          <span className="text-sm font-black text-emerald-400">{backtest.winRate}%</span>
                        </div>
                        <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800">
                          <span className="text-[9.5px] text-zinc-500 block uppercase">Profit Factor</span>
                          <span className="text-sm font-bold text-amber-300">{backtest.profitFactor}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800">
                          <span className="text-[9.5px] text-zinc-500 block uppercase">Best Timeframe</span>
                          <span className="text-xs font-bold text-zinc-100 truncate block">{backtest.bestTimeframe}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800">
                          <span className="text-[9.5px] text-zinc-500 block uppercase">Strategy Performance</span>
                          <span className="text-sm font-black text-emerald-400">{backtest.totalRMultiple}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : modalView === 'LIFECYCLE' ? (
            /* SIGNAL LIFECYCLE TIMELINE VIEW */
            <SignalLifecycleTimeline
              assetId={market.id}
              symbol={market.symbol}
              entryPrice={setup.entry}
              stopLoss={setup.stopLoss}
              takeProfit={setup.takeProfit}
              tradingMode={tradingStyleMode}
              timeframe={selectedTf}
            />
          ) : modalView === 'MODE_AI' ? (
            /* MODE AI DECISION PANEL VIEW */
            <div className="space-y-4">
              <ModeAnalysisPanel initialAssetId={market.id} isCompact={false} />
            </div>
          ) : modalView === 'AI_PROFILE' ? (
            /* ASSET-SPECIFIC AI PROFILE VIEW */
            <div className="space-y-3.5 text-xs font-sans">
              {/* Volatility Card */}
              <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-mono-num font-bold uppercase text-[11px]">
                    <Activity className="w-4 h-4" />
                    <span>Volatility Behaviour</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-num font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {profile.volatilityBehavior.level} VOLATILITY
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono-num text-[11px]">
                  <div className="p-2 rounded-xl bg-zinc-900/70 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block uppercase">ADR</span>
                    <span className="font-bold text-zinc-200">{profile.volatilityBehavior.adrText}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-900/70 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block uppercase">Expansion Speed</span>
                    <span className="font-bold text-amber-300">{profile.volatilityBehavior.speedOfExpansion}</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-300 font-normal leading-relaxed">
                  {profile.volatilityBehavior.description}
                </p>
              </div>

              {/* Best Trading Sessions */}
              <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-mono-num font-bold uppercase text-[11px]">
                    <Clock className="w-4 h-4" />
                    <span>Best Trading Sessions</span>
                  </div>
                  <span className="text-[10px] font-mono-num text-zinc-400">
                    {profile.bestTradingSessions.recommendedHoursUtc}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono-num text-[11px]">
                  <div className="p-2 rounded-xl bg-amber-950/20 border border-amber-500/20">
                    <span className="text-[9.5px] text-amber-400/80 block uppercase font-bold">Primary</span>
                    <span className="font-bold text-white text-xs">{profile.bestTradingSessions.primary}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-900/70 border border-zinc-800">
                    <span className="text-[9.5px] text-zinc-500 block uppercase font-bold">Secondary</span>
                    <span className="font-bold text-zinc-300 text-xs">{profile.bestTradingSessions.secondary}</span>
                  </div>
                </div>
                <p className="text-[10.5px] text-zinc-400 bg-black/40 p-2 rounded-xl border border-zinc-900">
                  💡 {profile.bestTradingSessions.sessionNote}
                </p>
              </div>

              {/* Strategy Weight Adjustments */}
              <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-mono-num font-bold uppercase text-[11px]">
                    <Sliders className="w-4 h-4" />
                    <span>Strategy Weight Adjustment</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[10px] font-mono-num font-bold">
                  {(['scalping', 'intraday', 'swing'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setProfileStyleTab(mode)}
                      className={`py-1 rounded-lg uppercase tracking-wider transition cursor-pointer ${
                        profileStyleTab === mode
                          ? 'bg-amber-500 text-black shadow-md font-extrabold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 font-mono-num text-[11px]">
                  <div>
                    <div className="flex justify-between text-zinc-300 text-[10.5px] mb-0.5">
                      <span>Smart Money (SMC)</span>
                      <span className="font-bold text-amber-400">{profileWeights.smc}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${profileWeights.smc}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-300 text-[10.5px] mb-0.5">
                      <span>Trend Direction</span>
                      <span className="font-bold text-emerald-400">{profileWeights.trend}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${profileWeights.trend}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-300 text-[10.5px] mb-0.5">
                      <span>Liquidity Pools</span>
                      <span className="font-bold text-sky-400">{profileWeights.liquidity}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-400 rounded-full" style={{ width: `${profileWeights.liquidity}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-300 text-[10.5px] mb-0.5">
                      <span>Momentum Delta</span>
                      <span className="font-bold text-purple-400">{profileWeights.momentum}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400 rounded-full" style={{ width: `${profileWeights.momentum}%` }} />
                    </div>
                  </div>
                </div>

                <p className="text-[10.5px] text-zinc-300 italic bg-amber-500/5 border border-amber-500/20 p-2 rounded-xl">
                  "{profileWeights.rationale}"
                </p>
              </div>

              {/* News Sensitivity */}
              <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-mono-num font-bold uppercase text-[11px]">
                    <ShieldAlert className="w-4 h-4" />
                    <span>News Sensitivity</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono-num font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    {profile.newsSensitivity.level} IMPACT
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {profile.newsSensitivity.keyCatalysts.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300">
                      • {c}
                    </span>
                  ))}
                </div>

                <div className="p-2 rounded-xl bg-rose-950/20 border border-rose-500/20 text-rose-300 text-[10.5px]">
                  ⚠️ Freeze: {profile.newsSensitivity.blackoutMinutesBefore}m before & {profile.newsSensitivity.blackoutMinutesAfter}m after high impact data
                </div>
              </div>
            </div>
          ) : modalView === 'CHART' ? (
            /* INTERACTIVE CANDLESTICK CHART VIEW */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#0b0d13] border border-amber-500/25 space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between text-xs font-mono-num">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                    <LineChart className="w-3.5 h-3.5 text-amber-400" />
                    Interactive Candlestick Chart
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Entry • SL • TP • Order Block • Liquidity
                  </span>
                </div>

                <InteractiveCandleChart
                  market={market}
                  timeframe={selectedTf}
                  onTimeframeChange={setSelectedTf}
                  height={280}
                />
              </div>

              {/* Key Execution Levels: Entry, Stop Loss, Take Profit, Risk Reward */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-num font-semibold text-zinc-400 uppercase tracking-wider">
                    Execution Levels
                  </span>
                  <span className="text-xs font-mono-num font-bold text-amber-400">
                    Risk Reward: {setup.riskReward}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono-num">
                  {/* Entry */}
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-0.5">
                    <span className="text-[10px] text-zinc-400 block uppercase">Entry</span>
                    <div className="text-sm sm:text-base font-bold text-white">
                      ${setup.entry.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">
                      {setup.entryZone}
                    </div>
                  </div>

                  {/* Stop Loss */}
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-0.5">
                    <span className="text-[10px] text-rose-300 flex items-center gap-1 uppercase">
                      <ShieldAlert className="w-3 h-3 text-rose-400" />
                      Stop Loss
                    </span>
                    <div className="text-sm sm:text-base font-bold text-rose-400">
                      ${setup.stopLoss.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
                    </div>
                    <div className="text-[10px] text-rose-300/70">
                      Invalidation
                    </div>
                  </div>

                  {/* Take Profit */}
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-0.5">
                    <span className="text-[10px] text-emerald-300 flex items-center gap-1 uppercase">
                      <Target className="w-3 h-3 text-emerald-400" />
                      Take Profit
                    </span>
                    <div className="text-sm sm:text-base font-bold text-emerald-400">
                      ${setup.takeProfit.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
                    </div>
                    <div className="text-[10px] text-emerald-300/70">
                      Target 1
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Reason (Small Explanation Section) */}
              <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/25 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono-num font-bold text-amber-300 uppercase tracking-wider">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Reason (Trade Validation)</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                  {setup.aiReason}
                </p>
              </div>

              {/* SMC Quick Matrix */}
              <div className="p-3 rounded-2xl bg-[#0c0e14] border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono-num font-bold text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Smart Money Concepts (SMC)
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase">{setup.timeframe} Institutional Flow</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-xs font-mono-num">
                  <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800/80">
                    <span className="text-[9.5px] text-zinc-500 uppercase block">Order Block</span>
                    <span className="text-zinc-200 text-[11px] font-medium block truncate">{st.smc.orderBlock}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800/80">
                    <span className="text-[9.5px] text-zinc-500 uppercase block">Liquidity Zone</span>
                    <span className="text-rose-300 text-[11px] font-medium block truncate">{st.smc.liquiditySweep}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800/80">
                    <span className="text-[9.5px] text-zinc-500 uppercase block">BOS</span>
                    <span className="text-emerald-400 text-[11px] font-medium block truncate">{st.smc.bos}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800/80">
                    <span className="text-[9.5px] text-zinc-500 uppercase block">CHOCH</span>
                    <span className="text-amber-300 text-[11px] font-medium block truncate">{st.smc.choch}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* AI STRATEGY ANALYSIS SECTION (6 STRATEGIES) */
            <div className="space-y-3">
              {/* Key Execution Levels: Entry, Stop Loss, Take Profit, Risk Reward */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-num font-semibold text-zinc-400 uppercase tracking-wider">
                    Execution Levels
                  </span>
                  <span className="text-xs font-mono-num font-bold text-amber-400">
                    Risk Reward: {setup.riskReward}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono-num">
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-0.5">
                    <span className="text-[10px] text-zinc-400 block uppercase">Entry</span>
                    <div className="text-sm font-bold text-white">
                      ${setup.entry.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-0.5">
                    <span className="text-[10px] text-rose-300 flex items-center gap-1 uppercase">
                      <ShieldAlert className="w-3 h-3 text-rose-400" />
                      SL
                    </span>
                    <div className="text-sm font-bold text-rose-400">
                      ${setup.stopLoss.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-0.5">
                    <span className="text-[10px] text-emerald-300 flex items-center gap-1 uppercase">
                      <Target className="w-3 h-3 text-emerald-400" />
                      TP
                    </span>
                    <div className="text-sm font-bold text-emerald-400">
                      ${setup.takeProfit.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Reason */}
              <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/25 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono-num font-bold text-amber-300 uppercase tracking-wider">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Reason</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                  {setup.aiReason}
                </p>
              </div>

              {/* Strategy Filter Tabs */}
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px] font-mono-num">
                {[
                  { id: 'ALL', label: 'All (6)' },
                  { id: 'SMC', label: '1. SMC' },
                  { id: 'TREND', label: '2. Trend' },
                  { id: 'BREAKOUT', label: '3. Breakout' },
                  { id: 'LIQUIDITY', label: '4. Liquidity' },
                  { id: 'STRUCTURE', label: '5. Structure' },
                  { id: 'MOMENTUM', label: '6. Momentum' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as StrategyTab)}
                    className={`px-2.5 py-1 rounded-lg shrink-0 font-semibold transition cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Strategy Blocks Container */}
              <div className="space-y-2.5">
                {/* 1. Smart Money Concepts (SMC) */}
                {(activeTab === 'ALL' || activeTab === 'SMC') && (
                  <div className="p-3.5 rounded-2xl bg-[#0c0e14] border border-zinc-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-mono-num font-bold text-amber-300">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        Smart Money Concepts (SMC)
                      </span>
                      <span className="text-[10px] text-zinc-500 uppercase">Institutional Order Flow</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono-num">
                      <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800/80">
                        <span className="text-[10px] text-zinc-500 uppercase block">Order Block</span>
                        <span className="text-zinc-200 font-medium">{st.smc.orderBlock}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800/80">
                        <span className="text-[10px] text-zinc-500 uppercase block">Fair Value Gap (FVG)</span>
                        <span className="text-amber-300 font-medium">{st.smc.fairValueGap}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800/80">
                        <span className="text-[10px] text-zinc-500 uppercase block">Liquidity Sweep</span>
                        <span className="text-rose-300 font-medium">{st.smc.liquiditySweep}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800/80">
                        <span className="text-[10px] text-zinc-500 uppercase block">BOS (Break of Structure)</span>
                        <span className="text-emerald-400 font-medium">{st.smc.bos}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800/80 sm:col-span-2">
                        <span className="text-[10px] text-zinc-500 uppercase block">CHOCH (Change of Character)</span>
                        <span className="text-amber-300 font-medium">{st.smc.choch}</span>
                      </div>
                    </div>
                  </div>
                )}

              {/* 2. Trend Following */}
              {(activeTab === 'ALL' || activeTab === 'TREND') && (
                <div className="p-3.5 rounded-2xl bg-[#0c0e14] border border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono-num font-bold text-sky-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      Trend Following Strategy
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase">EMA 20/50/200</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono-num">
                    <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-500 uppercase block">EMA 20</span>
                      <span className="text-zinc-100 font-bold">${st.trendFollowing.ema20.toLocaleString()}</span>
                    </div>

                    <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-500 uppercase block">EMA 50</span>
                      <span className="text-zinc-100 font-bold">${st.trendFollowing.ema50.toLocaleString()}</span>
                    </div>

                    <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-500 uppercase block">EMA 200</span>
                      <span className="text-zinc-100 font-bold">${st.trendFollowing.ema200.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800/80 text-xs font-mono-num space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 uppercase">EMA Stack Alignment</span>
                      <span className="text-emerald-400 font-semibold">{st.trendFollowing.emaAlignment}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block">Pullback Confirmation</span>
                      <span className="text-zinc-300">{st.trendFollowing.pullbackConfirmation}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Breakout Retest Strategy */}
              {(activeTab === 'ALL' || activeTab === 'BREAKOUT') && (
                <div className="p-3.5 rounded-2xl bg-[#0c0e14] border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono-num font-bold text-amber-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Breakout Retest Strategy
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase">Level Verification</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono-num">
                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-500 uppercase block">Breakout Level</span>
                      <span className="text-white font-bold">{st.breakoutRetest.breakoutLevel}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-500 uppercase block">Retest Status</span>
                      <span className="text-emerald-400 font-semibold">{st.breakoutRetest.retestStatus}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-500 uppercase block">Volume Spike</span>
                      <span className="text-amber-300 font-semibold">{st.breakoutRetest.volumeConfirmation}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Liquidity Reversal Strategy */}
              {(activeTab === 'ALL' || activeTab === 'LIQUIDITY') && (
                <div className="p-3.5 rounded-2xl bg-[#0c0e14] border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono-num font-bold text-purple-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      Liquidity Reversal Strategy
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase">Stop Hunt & Recovery</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono-num">
                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-500 uppercase block">Swept Level</span>
                      <span className="text-rose-400 font-medium">{st.liquidityReversal.sweepLevel}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-500 uppercase block">Reversal Zone</span>
                      <span className="text-amber-300 font-medium">{st.liquidityReversal.reversalZone}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-500 uppercase block">Liquidity Target</span>
                      <span className="text-emerald-400 font-medium">{st.liquidityReversal.targetPool}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Market Structure Analysis */}
              {(activeTab === 'ALL' || activeTab === 'STRUCTURE') && (
                <div className="p-3.5 rounded-2xl bg-[#0c0e14] border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono-num font-bold text-teal-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-400" />
                      Market Structure Analysis
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase">Swing Mapping</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono-num">
                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-500 uppercase block">Structure Bias</span>
                      <span className="text-teal-300 font-semibold">{st.marketStructure.structureBias}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-500 uppercase block">Internal Structure</span>
                      <span className="text-zinc-200 font-medium">{st.marketStructure.internalStructure}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-500 uppercase block">Invalidation Level</span>
                      <span className="text-rose-400 font-semibold">{st.marketStructure.invalidationLevel}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Momentum Confirmation (RSI, MACD, Volume) */}
              {(activeTab === 'ALL' || activeTab === 'MOMENTUM') && (
                <div className="p-3.5 rounded-2xl bg-[#0c0e14] border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono-num font-bold text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Momentum Confirmation
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase">RSI • MACD • Volume</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono-num">
                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800/80">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 uppercase">RSI (14)</span>
                        <span className="text-emerald-400 font-bold">{st.momentum.rsi}</span>
                      </div>
                      <span className="text-[11px] text-zinc-300 font-medium block mt-1">
                        {st.momentum.rsiStatus}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-500 uppercase block">MACD Status</span>
                      <span className="text-zinc-200 font-medium block mt-1">{st.momentum.macd}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-500 uppercase block">Volume Delta</span>
                      <span className="text-amber-300 font-semibold block mt-1">{st.momentum.volume}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

          {/* Action Buttons: Copy Signal & Send to Telegram */}
          <div className="pt-3 flex flex-col sm:flex-row items-center gap-2 border-t border-zinc-800/60">
            <button
              onClick={handleCopySignal}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono-num font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md active:scale-98"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Signal Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span>Copy Signal</span>
                </>
              )}
            </button>

            <button
              onClick={handleTelegramSend}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#996515] hover:brightness-110 text-black text-xs font-mono-num font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20 active:scale-98"
            >
              <Send className="w-4 h-4 text-black" />
              <span>Send to Telegram Wire</span>
            </button>
          </div>

          {telegramSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-[11px] font-mono-num text-emerald-400 font-semibold"
            >
              ✓ {telegramSuccess}
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
