import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Clock, 
  Target, 
  ShieldCheck, 
  ShieldAlert, 
  Layers, 
  Activity, 
  Copy, 
  Check, 
  Zap, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Gauge, 
  ArrowRight, 
  BarChart3, 
  Calendar, 
  Send,
  RefreshCw,
  Eye,
  Info,
  Moon
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { 
  gannIntradayEngine, 
  GANN_SUPPORTED_ASSET_IDS, 
  GANN_ASSET_PROFILES 
} from '../services/gannIntradayEngine';
import { GannIntradayOpportunity } from '../types/gannTypes';

interface GannIntradayEnginePanelProps {
  initialAssetId?: string;
  onOpenAssetDetail?: (assetId: string) => void;
}

export const GannIntradayEnginePanel: React.FC<GannIntradayEnginePanelProps> = ({
  initialAssetId,
  onOpenAssetDetail
}) => {
  const { markets, sendSignalToTelegram } = useMarket();

  // Active selected asset from the 9 supported assets
  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    initialAssetId && GANN_SUPPORTED_ASSET_IDS.includes(initialAssetId as any) 
      ? initialAssetId 
      : 'xau-usd'
  );

  // Active sub-tool tab: ALL, FAN, SQUARE, BOX, CHECKLIST, TIME_CYCLES, MANAGEMENT
  const [activeSubTab, setActiveSubTab] = useState<'OVERVIEW' | 'CHECKLIST' | 'FAN' | 'SQUARE' | 'BOX' | 'TIME_CYCLES' | 'MANAGEMENT'>('OVERVIEW');

  // Copy state
  const [copied, setCopied] = useState<boolean>(false);
  const [telegramStatus, setTelegramStatus] = useState<string | null>(null);

  // Live price resolution from MarketContext
  const currentMarket = useMemo(() => {
    return markets.find(m => m.id === selectedAssetId);
  }, [markets, selectedAssetId]);

  // Compute live opportunity from Gann Intraday Engine
  const opportunity: GannIntradayOpportunity = useMemo(() => {
    return gannIntradayEngine.analyzeAsset(selectedAssetId, currentMarket?.price);
  }, [selectedAssetId, currentMarket?.price]);

  // Scan all 9 assets for overview radar
  const scanOverview = useMemo(() => {
    return gannIntradayEngine.scanAllAssets(markets);
  }, [markets]);

  // Handle copying verbatim output format (Section 17)
  const handleCopyVerbatim = () => {
    navigator.clipboard.writeText(opportunity.formattedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // Direction color helper
  const isBuy = opportunity.direction === 'BUY';
  const isSell = opportunity.direction === 'SELL';
  const isWait = opportunity.direction === 'WAIT';

  const directionColor = isBuy
    ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
    : isSell
    ? 'text-rose-400 border-rose-500/40 bg-rose-500/10'
    : 'text-amber-400 border-amber-500/40 bg-amber-500/10';

  return (
    <div className="w-full space-y-4 font-sans text-zinc-100">
      {/* 1. HEADER & INSTITUTIONAL TIMING STATUS RIBBON */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#101422] via-[#0b0e18] to-[#070912] border border-amber-500/35 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 shadow-md shadow-amber-500/10">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider font-mono">
                  GANN INTRADAY TIMING & PRICE ENGINE
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  INSTITUTIONAL INTRADAY MODE
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                Additive high-confluence intraday opportunity discovery • 4H/1H/15M multi-timeframe bias • Gann Fan, Square of 9 & Gann Box
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center gap-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-300 font-bold">1-2 SIGNALS/DAY</span>
              <span className="text-[10px] text-amber-400 font-normal border-l border-zinc-700 pl-2">QUALITY OVER QUANTITY</span>
            </div>
          </div>
        </div>

        {/* 9 SUPPORTED ASSETS SELECTOR PILLS */}
        <div className="pt-3">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mb-2">
            <span>SELECT MONITORED ASSET (9 SUPPORTED MARKETS):</span>
            <span className="text-amber-400 font-bold">
              Active: {opportunity.assetSymbol} ({opportunity.currentPriceFormatted})
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
            {GANN_SUPPORTED_ASSET_IDS.map(assetId => {
              const prof = GANN_ASSET_PROFILES[assetId];
              const isSelected = selectedAssetId === assetId;
              const opp = scanOverview.opportunities[assetId];
              const assetDir = opp?.direction || 'WAIT';

              return (
                <button
                  key={assetId}
                  onClick={() => setSelectedAssetId(assetId)}
                  className={`py-2 px-1.5 rounded-xl text-center transition cursor-pointer border flex flex-col items-center justify-center relative ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500/30 to-amber-600/30 border-amber-400 text-white font-bold shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/50'
                      : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <span className="text-xs font-mono font-bold tracking-tight">{prof.symbol}</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        assetDir === 'BUY'
                          ? 'bg-emerald-400'
                          : assetDir === 'SELL'
                          ? 'bg-rose-400'
                          : 'bg-amber-400/60'
                      }`}
                    />
                    <span className="text-[9px] font-mono font-semibold text-zinc-300">
                      {assetDir}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. PROMINENT VERBATIM OUTPUT CARD (SECTION 17) */}
      <div className="p-4 rounded-2xl bg-[#090c16] border border-amber-500/40 shadow-xl space-y-3 relative">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-extrabold uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              OFFICIAL INTRADAY OPPORTUNITY DISCOVERY
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyVerbatim}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1 transition cursor-pointer border border-zinc-700"
              title="Copy Verbatim Format"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
              <span>{copied ? 'Copied' : 'Copy Output'}</span>
            </button>
          </div>
        </div>

        {/* Verbatim Monospace Terminal Display */}
        <div className="p-3.5 rounded-xl bg-black/80 border border-zinc-800/80 font-mono text-xs sm:text-sm text-zinc-200 space-y-1 select-all relative overflow-x-auto shadow-inner">
          <div className="text-amber-400 font-bold pb-1">INTRADAY OPPORTUNITY</div>
          <div className="flex items-center justify-between">
            <span>Asset: <strong className="text-white">{opportunity.assetSymbol}</strong></span>
            <span className="text-zinc-400 text-xs font-sans">Spot: {opportunity.currentPriceFormatted}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Direction:</span>
            <span className={`px-2 py-0.5 rounded text-xs font-extrabold border ${directionColor}`}>
              {opportunity.direction}
            </span>
            {isWait && (
              <span className="text-[11px] text-zinc-400 font-sans italic">
                (Institutional Discipline: WAIT is expected standard output)
              </span>
            )}
          </div>
          <div>Entry Zone: <span className="text-zinc-100">{opportunity.entryZone}</span></div>
          <div>Stop Loss: <span className="text-rose-300">{opportunity.stopLoss}</span></div>
          <div>TP1: <span className="text-emerald-300">{opportunity.tp1}</span></div>
          <div>TP2: <span className="text-emerald-400">{opportunity.tp2}</span></div>
          <div>Timeframe: <span className="text-zinc-300">{opportunity.timeframe}</span></div>
          <div>Gann Confluence: <span className="text-amber-300 font-semibold">{opportunity.gannConfluence}</span></div>
          <div>Gann Time Cycle: <span className="text-amber-300 font-semibold">{opportunity.timeCycles.primaryCycle.cycleName} ({opportunity.timeCycles.timingWindow})</span></div>
          <div>Lunar Confluence: <span className="text-sky-300 font-semibold">{opportunity.lunarIntelligence.phaseSymbol} {opportunity.lunarIntelligence.phaseDisplayName} [{opportunity.lunarIntelligence.statusBadge}]</span></div>
          <div>Confirmations Aligned: <strong className="text-sky-300">{opportunity.confirmationsAligned}</strong></div>
          <div>Confidence: <strong className="text-amber-300">{opportunity.confidence} / 100</strong></div>
          <div>Historical Similarity: <strong className="text-purple-300">{opportunity.historicalSimilarity}%</strong></div>
          <div>Risk Level: <strong className={opportunity.riskLevel === 'LOW' ? 'text-emerald-400' : 'text-amber-400'}>{opportunity.riskLevel}</strong></div>
        </div>

        {/* Quick Decision Flow Status Pill */}
        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[11px] font-mono text-zinc-400 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Flow:</span>
            <span>4H Bias</span>
            <span>→</span>
            <span>1H Trend</span>
            <span>→</span>
            <span>15M Trigger</span>
            <span>→</span>
            <span>Gann 2/3</span>
            <span>→</span>
            <span className="text-amber-300">Time Cycles & Lunar</span>
            <span>→</span>
            <span>Session</span>
            <span>→</span>
            <span>News Filter</span>
            <span>→</span>
            <strong className={opportunity.direction === 'BUY' ? 'text-emerald-400' : opportunity.direction === 'SELL' ? 'text-rose-400' : 'text-amber-400'}>
              {opportunity.direction}
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${opportunity.qualityGatePassed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'}`}>
              Quality Gate: {opportunity.qualityGatePassed ? 'PASSED (≥8/10 & Conf ≥75)' : 'WAIT (Discipline Enforced)'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. SUB-TOOL NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-mono font-bold">
        {[
          { id: 'OVERVIEW', label: '10-Confluence Overview', icon: Activity },
          { id: 'CHECKLIST', label: 'Confluence Checklist (x/10)', icon: CheckCircle2 },
          { id: 'FAN', label: 'Gann Fan Engine', icon: Compass },
          { id: 'SQUARE', label: 'Square of 9 (Daily Open)', icon: Sliders },
          { id: 'BOX', label: 'Gann Box Timing', icon: Clock },
          { id: 'TIME_CYCLES', label: 'Time Cycles & Lunar', icon: Moon },
          { id: 'MANAGEMENT', label: 'Post-Entry Management', icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`py-2 px-3 rounded-xl flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap border ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold shadow-md border-amber-300'
                  : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. TAB PANELS */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'OVERVIEW' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-4"
          >
            {/* Multi-Timeframe Bias Agreement Matrix */}
            <div className="p-3.5 rounded-2xl bg-[#0c0e17] border border-zinc-800/90 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  MULTI-TIMEFRAME BIAS ENGINE (MINIMUM REQUIRED: 4H + 1H + 15M)
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${opportunity.multiTf.allThreeAgree ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'}`}>
                  {opportunity.multiTf.allThreeAgree ? '✓ 4H + 1H + 15M IN FULL AGREEMENT' : '⚠ TIMEFRAME DISCREPANCY'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                {/* 4H */}
                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold">4H Major Bias</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${opportunity.multiTf.fourHour.bias === 'BULLISH' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {opportunity.multiTf.fourHour.bias}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans leading-tight">
                    {opportunity.multiTf.fourHour.keyFactor}
                  </p>
                  <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-900">
                    SMC: {opportunity.multiTf.fourHour.bosChoch}
                  </div>
                </div>

                {/* 1H */}
                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold">1H Trend + Structure</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${opportunity.multiTf.oneHour.bias === 'BULLISH' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {opportunity.multiTf.oneHour.bias}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans leading-tight">
                    {opportunity.multiTf.oneHour.keyFactor}
                  </p>
                  <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-900">
                    OB: {opportunity.multiTf.oneHour.orderBlockZone}
                  </div>
                </div>

                {/* 15M */}
                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold">15M Entry Execution</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${opportunity.multiTf.fifteenMin.bias === 'BULLISH' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {opportunity.multiTf.fifteenMin.bias}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans leading-tight">
                    {opportunity.multiTf.fifteenMin.keyFactor}
                  </p>
                  <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-900">
                    Momentum: {opportunity.multiTf.fifteenMin.momentumState}
                  </div>
                </div>
              </div>

              {/* 30M Secondary Filter Note */}
              <div className="p-2 rounded-xl bg-black/40 border border-zinc-800/80 text-[11px] text-zinc-400 flex items-center justify-between font-mono">
                <span className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-zinc-500" />
                  30M Zone Refinement Filter: <strong className="text-zinc-200">{opportunity.multiTf.thirtyMinRefinement?.bias || 'ALIGNED'}</strong>
                </span>
                <span className="text-[10px] text-zinc-500 font-sans">
                  Secondary filter only — does not veto valid 4H/1H/15M agreement
                </span>
              </div>
            </div>

            {/* Gann Confluence Triad Summary */}
            <div className="p-3.5 rounded-2xl bg-[#0c0e17] border border-amber-500/20 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  GANN CONFLUENCE RULE (MINIMUM 2 OF 3 TOOLS REQUIRED)
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${opportunity.confluence.isConfluenceMet ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'}`}>
                  {opportunity.confluence.alignedToolsCount}/3 GANN TOOLS ALIGNED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                {/* 1. FAN */}
                <div className={`p-3 rounded-xl border ${opportunity.confluence.fanAligned ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}>
                  <div className="flex items-center justify-between font-bold">
                    <span>1. Gann Fan</span>
                    <span>{opportunity.confluence.fanAligned ? '✓ ALIGNED' : '— OFF'}</span>
                  </div>
                  <div className="text-[11px] text-zinc-300 font-sans mt-1">
                    1x1 Angle at {opportunity.fan.oneByOnePrice}. Price {opportunity.fan.isPriceAboveOneByOne ? 'above 1x1 (Bullish)' : 'below 1x1 (Bearish)'}.
                  </div>
                </div>

                {/* 2. SQUARE OF 9 */}
                <div className={`p-3 rounded-xl border ${opportunity.confluence.squareAligned ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}>
                  <div className="flex items-center justify-between font-bold">
                    <span>2. Square of 9</span>
                    <span>{opportunity.confluence.squareAligned ? '✓ ALIGNED' : '— OFF'}</span>
                  </div>
                  <div className="text-[11px] text-zinc-300 font-sans mt-1">
                    Fixed Ref: Daily Open ({opportunity.squareOf9.fixedReferencePrice}). Nearest: {opportunity.squareOf9.nearestSupport.price} / {opportunity.squareOf9.nearestResistance.price}.
                  </div>
                </div>

                {/* 3. GANN BOX */}
                <div className={`p-3 rounded-xl border ${opportunity.confluence.boxAligned ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}>
                  <div className="flex items-center justify-between font-bold">
                    <span>3. Gann Box</span>
                    <span>{opportunity.confluence.boxAligned ? '✓ ALIGNED' : '— OFF'}</span>
                  </div>
                  <div className="text-[11px] text-zinc-300 font-sans mt-1">
                    Price at {opportunity.box.nearestPriceRatio.ratio} ratio. {opportunity.box.timeWindows[0]?.ratioLabel} reaction window active.
                  </div>
                </div>
              </div>
            </div>

            {/* Session Liquidity & Macro News Risk Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    Session & Asian Liquidity
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${opportunity.sessionInfo.sessionTimingOk ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {opportunity.sessionInfo.activeSession}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-300 font-sans">
                  Asian Range: {opportunity.sessionInfo.asianRange.formattedRange}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  {opportunity.sessionInfo.asianSweepEvent}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    News & Risk Filter (30m Rule)
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${opportunity.newsRisk.newsRiskClear ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {opportunity.newsRisk.newsRiskClear ? 'NEWS RISK CLEAR' : 'NEWS PAUSE (WAIT)'}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-300 font-sans">
                  {opportunity.newsRisk.statusText}
                </div>
              </div>
            </div>

            {/* GANN TIME CYCLE & LUNAR TIMING CONFIRMATION LAYER */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#101423] via-[#0c0f1d] to-[#070912] border border-amber-500/30 space-y-3 font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-zinc-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <Moon className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Gann Time Cycle & Lunar Timing Confirmation Layer
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/35">
                    CONFIRMATION LAYER ONLY • NEVER STANDALONE SIGNAL
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {/* Time Cycle Summary */}
                <div className="p-3 rounded-xl bg-black/60 border border-zinc-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Gann Time Cycle ({opportunity.timeCycles.primaryCycle.cycleName})
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${opportunity.timeCycles.isConfirmationGranted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-400'}`}>
                      {opportunity.timeCycles.primaryCycle.isWindowActive ? 'WINDOW ACTIVE' : 'IN PROGRESS'}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-200 font-sans">
                    <strong className="text-amber-300">Anchor:</strong> {opportunity.timeCycles.majorSwingAnchor.anchorDescription}
                  </div>
                  <div className="text-[11px] text-zinc-300 font-sans">
                    <strong className="text-zinc-400">Timing Window:</strong> {opportunity.timeCycles.timingWindow}
                  </div>
                  <div className="text-[11px] text-zinc-300 font-sans">
                    <strong className="text-zinc-400">Reaction Horizon:</strong> {opportunity.timeCycles.potentialReactionPeriod}
                  </div>
                  <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/80 font-mono flex items-center justify-between">
                    <span>Momentum Shift:</span>
                    <span className={opportunity.timeCycles.timeBasedMomentumShift.bias === 'BULLISH' ? 'text-emerald-400' : opportunity.timeCycles.timeBasedMomentumShift.bias === 'BEARISH' ? 'text-rose-400' : 'text-zinc-400'}>
                      {opportunity.timeCycles.timeBasedMomentumShift.description}
                    </span>
                  </div>
                </div>

                {/* Lunar Intelligence Summary */}
                <div className="p-3 rounded-xl bg-black/60 border border-zinc-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sky-300 font-bold flex items-center gap-1.5">
                      <span>{opportunity.lunarIntelligence.phaseSymbol}</span>
                      Lunar Phase: {opportunity.lunarIntelligence.phaseDisplayName}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                      opportunity.lunarIntelligence.statusBadge === 'CONFIRMED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : opportunity.lunarIntelligence.statusBadge === 'IGNORED'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                      {opportunity.lunarIntelligence.statusBadge === 'IGNORED' ? '⚠ IGNORED (CONFLICT)' : opportunity.lunarIntelligence.statusBadge}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-300 font-sans">
                    <strong className="text-zinc-400">Illumination:</strong> {opportunity.lunarIntelligence.illuminationPercent}% • Next: {opportunity.lunarIntelligence.nextKeyPhase} ({opportunity.lunarIntelligence.daysToNextKeyPhase}d)
                  </div>
                  <p className="text-[11px] text-zinc-300 font-sans leading-tight">
                    {opportunity.lunarIntelligence.historicalVolatilityBehavior}
                  </p>
                  <div className="text-[10px] pt-1 border-t border-zinc-800/80 flex items-center justify-between font-mono">
                    <span className="text-zinc-400">4-Pillar Alignment:</span>
                    <span className={opportunity.lunarIntelligence.confluenceGranted ? 'text-emerald-400' : opportunity.lunarIntelligence.isIgnoredDueToStructureConflict ? 'text-rose-400 font-bold' : 'text-zinc-400'}>
                      {opportunity.lunarIntelligence.isIgnoredDueToStructureConflict ? 'Structure Conflict (Vetoed)' : opportunity.lunarIntelligence.confluenceGranted ? '✓ Fully Aligned' : 'Partial / Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'CHECKLIST' && (
          <motion.div
            key="checklist"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-4 rounded-2xl bg-[#0c0e17] border border-zinc-800 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div>
                <h3 className="text-xs sm:text-sm font-bold font-mono text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  SMART INTRADAY ENTRY ENGINE — CONFLUENCE CHECKLIST (10 CONFIRMATIONS)
                </h3>
                <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">
                  Quality Gate: Approve ONLY if Confidence ≥ 75 AND at least 8 of 10 confirmations align. Otherwise → WAIT.
                </span>
              </div>

              <div className="text-right">
                <span className="text-base font-extrabold font-mono text-amber-300">
                  {opportunity.checklist.alignedCount} / 10
                </span>
                <span className="text-[10px] text-zinc-400 block font-mono">
                  {opportunity.qualityGatePassed ? 'GATE PASSED' : 'GATE FAILED (WAIT)'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {opportunity.checklist.items.map((item, idx) => (
                <div
                  key={item.key}
                  className={`p-2.5 rounded-xl border flex items-start justify-between gap-3 text-xs font-mono transition ${
                    item.isAligned
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                      : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-500'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${item.isAligned ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-zinc-200">{item.label}</div>
                      <div className="text-[11px] text-zinc-400 font-sans mt-0.5">{item.description}</div>
                      <div className="text-[10px] text-zinc-500 mt-1">{item.detail}</div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold shrink-0 ${item.isAligned ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-800 text-zinc-400'}`}>
                    {item.isAligned ? 'CONFIRMED' : 'WAIT'}
                  </span>
                </div>
              ))}
            </div>

            {opportunity.rejectionReasons.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  DISCIPLINE GATE REPORT — REASONS FOR WAIT:
                </div>
                {opportunity.rejectionReasons.map((reason, i) => (
                  <div key={i} className="pl-4 text-[11px] text-zinc-300">• {reason}</div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeSubTab === 'FAN' && (
          <motion.div
            key="fan"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-4 rounded-2xl bg-[#0c0e17] border border-zinc-800 space-y-3 font-mono"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  GANN FAN ENGINE (ANGLES: 1x1, 1x2, 2x1, 1x4, 4x1)
                </h3>
                <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">
                  Anchor: {opportunity.fan.anchorType} @ {opportunity.fan.anchorPrice} • {opportunity.fan.anchorTime}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${opportunity.fan.isPriceAboveOneByOne ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'}`}>
                {opportunity.fan.fanStructure}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-black/60 border border-zinc-800 text-xs text-zinc-300 space-y-1 font-sans">
              <div className="font-mono text-amber-400 font-bold">1x1 Balance Plane Rule:</div>
              <p>Price above 1x1 ({opportunity.fan.oneByOnePrice}) = Bullish Structure. Below = Bearish Structure. Breaks of 1x1 or 2x1 angles trigger momentum-shift confirmation.</p>
              <div className="text-[11px] text-zinc-400 pt-1 font-mono">{opportunity.fan.momentumShiftNote}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
              {(['1x4', '1x2', '1x1', '2x1', '4x1'] as const).map(angleKey => {
                const info = opportunity.fan.angles[angleKey];
                const isOneByOne = angleKey === '1x1';

                return (
                  <div
                    key={angleKey}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between space-y-1.5 ${
                      isOneByOne
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 ring-1 ring-amber-400/30'
                        : 'bg-zinc-950/80 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold">{info.angle}</span>
                      <span className="text-zinc-500">{info.degrees}°</span>
                    </div>
                    <div className="text-sm font-bold text-white">
                      {info.currentPriceLevel}
                    </div>
                    <div className="text-[10px] text-zinc-400 flex items-center justify-between">
                      <span>Relation:</span>
                      <span className="font-semibold text-zinc-200">{info.priceRelation}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeSubTab === 'SQUARE' && (
          <motion.div
            key="square"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-4 rounded-2xl bg-[#0c0e17] border border-zinc-800 space-y-3 font-mono"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  GANN SQUARE OF 9 ENGINE
                </h3>
                <span className="text-[10px] text-amber-300 font-mono block mt-0.5">
                  {opportunity.squareOf9.referenceLabel} — FIXED REFERENCE (DO NOT SWITCH MID-SESSION)
                </span>
              </div>

              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 border border-zinc-700 text-zinc-300">
                Scale: 1:{opportunity.squareOf9.scaleFactor}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Cardinal Levels (90, 180, 270, 360) */}
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-amber-400 font-bold border-b border-zinc-800/80 pb-1">
                  <span>CARDINAL CROSS LEVELS</span>
                  <span className="text-[10px] text-zinc-500">90° • 180° • 270° • 360°</span>
                </div>
                <div className="space-y-1.5">
                  {opportunity.squareOf9.cardinalLevels.map((lvl, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 px-2 rounded bg-black/40 border border-zinc-900 text-xs">
                      <span className="text-zinc-400">{lvl.angleDegrees}° Cardinal</span>
                      <span className="font-bold text-white">{lvl.formattedPrice}</span>
                      <span className="text-[10px] text-zinc-500">{lvl.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagonal Levels (45, 135, 225, 315) */}
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-sky-400 font-bold border-b border-zinc-800/80 pb-1">
                  <span>DIAGONAL CROSS LEVELS</span>
                  <span className="text-[10px] text-zinc-500">45° • 135° • 225° • 315°</span>
                </div>
                <div className="space-y-1.5">
                  {opportunity.squareOf9.diagonalLevels.map((lvl, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 px-2 rounded bg-black/40 border border-zinc-900 text-xs">
                      <span className="text-zinc-400">{lvl.angleDegrees}° Diagonal</span>
                      <span className="font-bold text-white">{lvl.formattedPrice}</span>
                      <span className="text-[10px] text-zinc-500">{lvl.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-zinc-300 font-sans flex items-center justify-between">
              <span>{opportunity.squareOf9.alignmentNote}</span>
              <span className="text-amber-300 font-mono font-bold text-[11px] shrink-0">
                180° Target: {opportunity.squareOf9.targetZone.formattedPrice}
              </span>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'BOX' && (
          <motion.div
            key="box"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-4 rounded-2xl bg-[#0c0e17] border border-zinc-800 space-y-3 font-mono"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  GANN BOX TIMING ENGINE
                </h3>
                <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">
                  Drawn from recent significant swing on 1H/15M • Swing Low: {opportunity.box.swingLow} ↔ Swing High: {opportunity.box.swingHigh}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Range: {opportunity.box.swingRange}
              </span>
            </div>

            {/* Price Ratio Levels */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-zinc-400 flex items-center justify-between">
                <span>PRICE RATIO EQUILIBRIUM LEVELS:</span>
                <span className="text-[10px] text-zinc-500">0.25 • 0.382 • 0.50 • 0.618 • 0.75 • 1.0</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {opportunity.box.priceLevels.map(lvl => {
                  const isNearest = lvl.ratio === opportunity.box.nearestPriceRatio.ratio;

                  return (
                    <div
                      key={lvl.ratio}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between space-y-1 ${
                        isNearest
                          ? 'bg-amber-500/15 border-amber-400 text-white shadow-md shadow-amber-500/10'
                          : 'bg-zinc-950/80 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-amber-400">{lvl.ratio}</span>
                        {isNearest && <span className="text-[9px] px-1 bg-amber-500 text-black font-extrabold rounded">ACTIVE</span>}
                      </div>
                      <div className="text-sm font-bold text-white">{lvl.formattedPrice}</div>
                      <div className="text-[10px] text-zinc-500 font-sans truncate">{lvl.ratioLabel}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time Ratio Reaction Windows */}
            <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
              <div className="text-xs font-bold text-zinc-400">
                TIME RATIO REACTION WINDOWS:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {opportunity.box.timeWindows.map((tw, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-zinc-200">{tw.ratioLabel}</div>
                      <div className="text-[10px] text-zinc-400 font-sans">{tw.reactionType}</div>
                    </div>
                    <span className="text-right text-[11px] font-bold text-amber-300">
                      {tw.projectedTimeFormatted}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'MANAGEMENT' && (
          <motion.div
            key="management"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-4 rounded-2xl bg-[#0c0e17] border border-zinc-800 space-y-3 font-mono text-xs"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                TRADE MANAGEMENT ENGINE (POST-ENTRY EXECUTION)
              </h3>
              <span className="text-[10px] text-zinc-400">
                Risk-to-Reward: {opportunity.dynamicLevels.riskRewardFormatted}
              </span>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                <div className="text-amber-400 font-bold">1. Move Stop Loss to Break-Even</div>
                <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                  {opportunity.management.breakevenRule}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                <div className="text-emerald-400 font-bold">2. TP1 Partial Profit Securing</div>
                <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                  {opportunity.management.tp1PartialAction}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                <div className="text-sky-400 font-bold">3. Trailing Stop Toward TP2</div>
                <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                  {opportunity.management.tp2TrailAction}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                <div className="text-rose-400 font-bold">4. Structure Invalidation Exit Warning</div>
                <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                  {opportunity.management.structureBreakExitWarning}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 4F. GANN TIME CYCLES & LUNAR TIMING CONFIRMATION TAB */}
        {activeSubTab === 'TIME_CYCLES' && (
          <motion.div
            key="time-cycles"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-4 font-mono text-zinc-200"
          >
            {/* Strict Operational Rules Ribbon */}
            <div className="p-3.5 rounded-2xl bg-[#0e1220] border border-amber-500/40 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <Moon className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      Gann Time Cycles & Lunar Timing Confirmation Layer
                    </h3>
                    <span className="text-[10.5px] text-zinc-400 font-sans">
                      Confirmation layer only • Never a standalone signal • Strict rule: If timing conflicts with market structure, ignore lunar signal.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/40">
                    CONFIRMATION LAYER ONLY
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-sans">
                <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 space-y-1">
                  <span className="text-zinc-400 text-[11px] font-mono block">Anchor Reference</span>
                  <div className="text-white font-bold font-mono text-xs">
                    {opportunity.timeCycles.majorSwingAnchor.anchorDescription}
                  </div>
                  <span className="text-[10px] text-zinc-400 block">
                    Price: {opportunity.timeCycles.majorSwingAnchor.formattedPrice} • {opportunity.timeCycles.majorSwingAnchor.barsAgo} bars ago
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 space-y-1">
                  <span className="text-zinc-400 text-[11px] font-mono block">Primary Active Cycle</span>
                  <div className="text-amber-400 font-bold font-mono text-xs flex items-center justify-between">
                    <span>{opportunity.timeCycles.primaryCycle.cycleName}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] ${opportunity.timeCycles.primaryCycle.isWindowActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-400'}`}>
                      {opportunity.timeCycles.primaryCycle.timingWindow}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block">
                    {opportunity.timeCycles.primaryCycle.barsElapsed} / {opportunity.timeCycles.primaryCycle.cycleLengthBars} bars ({opportunity.timeCycles.primaryCycle.completionPercent}%)
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 space-y-1">
                  <span className="text-zinc-400 text-[11px] font-mono block">Time-Based Momentum Shift</span>
                  <div className="text-white font-bold font-mono text-xs flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${opportunity.timeCycles.timeBasedMomentumShift.bias === 'BULLISH' ? 'bg-emerald-400' : opportunity.timeCycles.timeBasedMomentumShift.bias === 'BEARISH' ? 'bg-rose-400' : 'bg-amber-400'}`} />
                    <span>{opportunity.timeCycles.timeBasedMomentumShift.bias} SHIFT</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block">
                    {opportunity.timeCycles.timeBasedMomentumShift.description}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 1: GANN TIME CYCLES (72, 90, 144, 180, 360 BARS) */}
            <div className="p-4 rounded-2xl bg-[#0b0e1a] border border-zinc-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-zinc-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    Gann Time Cycle Matrix (144, 72, 90, 180, 360 Bars)
                  </h4>
                </div>
                <span className="text-[10.5px] text-zinc-400 font-sans">
                  Detects cycle completion windows, reaction zones, and time-based momentum shifts
                </span>
              </div>

              {/* 5 Cycles Table / Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs font-mono">
                {opportunity.timeCycles.cycles.map(cycle => (
                  <div
                    key={cycle.cycleLengthBars}
                    className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 transition ${
                      cycle.isWindowActive
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                        : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-extrabold text-xs">{cycle.cycleName}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          cycle.isWindowActive 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                            : 'bg-zinc-900 text-zinc-400'
                        }`}>
                          {cycle.timingWindow}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-sans mt-0.5">
                        {cycle.cycleLengthBars} bars from anchor
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span>Progress</span>
                        <span className="text-white font-bold">{cycle.completionPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cycle.isWindowActive ? 'bg-amber-400' : 'bg-zinc-600'}`}
                          style={{ width: `${Math.min(cycle.completionPercent, 100)}%` }}
                        />
                      </div>
                      <div className="text-[9.5px] text-zinc-500 text-right">
                        {cycle.barsRemaining <= 0 ? 'Cycle Reached' : `${cycle.barsRemaining} bars remaining`}
                      </div>
                    </div>

                    {/* Potential Reaction Zone */}
                    <div className="p-2 rounded-lg bg-black/60 border border-zinc-900 space-y-0.5 text-[10px]">
                      <span className="text-zinc-500 block">Potential Reaction Zone:</span>
                      <span className="text-amber-300 font-bold block">{cycle.reactionZoneLevel}</span>
                    </div>

                    <div className="text-[10px] text-zinc-400 font-sans leading-tight pt-1 border-t border-zinc-900">
                      {cycle.momentumShiftDetail}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cycle Outputs: Timing Window & Reaction Period */}
              <div className="p-3.5 rounded-xl bg-black/70 border border-amber-500/30 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-zinc-400 font-mono text-[11px] block">Timing Window Output:</span>
                  <div className="text-amber-300 font-mono font-bold text-sm">
                    {opportunity.timeCycles.timingWindow}
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    Window represents harmonic convergence across {opportunity.timeCycles.cycles.filter(c => c.isWindowActive).length || 1} active Gann cycle(s).
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-400 font-mono text-[11px] block">Potential Reaction Period Output:</span>
                  <div className="text-emerald-300 font-mono font-bold text-sm">
                    {opportunity.timeCycles.potentialReactionPeriod}
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    Projected intraday horizon based on 15M candle turnover and session liquidity expansion.
                  </p>
                </div>
              </div>

              {/* Strict Discipline Notice: DO NOT PREDICT EXACT DATES */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 font-sans flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-mono text-amber-300">STRICT INSTITUTIONAL DISCIPLINE: DO NOT PREDICT EXACT DATES.</strong>
                  <p className="text-zinc-300 mt-0.5">
                    Gann time analysis is computed as relative bar completion windows (144, 72, 90, 180, 360 bars) and session turnover horizons. Timing windows define windows of heightened price-time sensitivity, never fixed calendar forecasts.
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 2: LUNAR CYCLE INTELLIGENCE */}
            <div className="p-4 rounded-2xl bg-[#0b0e1a] border border-zinc-800 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-zinc-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-sky-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    Lunar Cycle Intelligence (Confluence Layer Only)
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                    opportunity.lunarIntelligence.statusBadge === 'CONFIRMED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : opportunity.lunarIntelligence.statusBadge === 'IGNORED'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    {opportunity.lunarIntelligence.statusBadge === 'IGNORED' ? '⚠ IGNORED: CONFLICT' : `LUNAR STATUS: ${opportunity.lunarIntelligence.statusBadge}`}
                  </span>
                </div>
              </div>

              {/* Lunar Tracking Dashboard */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Visual Phase Display */}
                <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-950 via-zinc-900 to-amber-200/20 border border-sky-400/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
                    {opportunity.lunarIntelligence.phaseSymbol}
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-mono block">Current Phase</span>
                    <span className="text-white font-bold font-mono text-sm block">
                      {opportunity.lunarIntelligence.phaseDisplayName}
                    </span>
                    <span className="text-[11px] text-sky-300 font-sans block mt-0.5">
                      {opportunity.lunarIntelligence.illuminationPercent}% Illuminated
                    </span>
                  </div>
                </div>

                {/* Key Astrological Turnovers */}
                <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block">Next Major Phase</span>
                  <div className="text-white font-bold font-mono text-sm flex items-center justify-between">
                    <span>{opportunity.lunarIntelligence.nextKeyPhase}</span>
                    <span className="text-amber-300 text-xs font-normal font-sans">
                      In ~{opportunity.lunarIntelligence.daysToNextKeyPhase} days
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans leading-tight">
                    Tracking Synodic month cycle (29.53d) from reference lunation anchor.
                  </p>
                </div>

                {/* Conflict Rule Indicator */}
                <div className={`p-3.5 rounded-xl border space-y-1 ${
                  opportunity.lunarIntelligence.isIgnoredDueToStructureConflict
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                    : opportunity.lunarIntelligence.confluenceGranted
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                }`}>
                  <span className="text-[10px] uppercase font-mono block">Structure Conflict Rule</span>
                  <div className="font-bold font-mono text-xs">
                    {opportunity.lunarIntelligence.isIgnoredDueToStructureConflict
                      ? 'LUNAR SIGNAL IGNORED'
                      : opportunity.lunarIntelligence.confluenceGranted
                      ? 'CONFLUENCE GRANTED'
                      : 'CONFLUENCE NEUTRAL'}
                  </div>
                  <p className="text-[10.5px] font-sans leading-tight">
                    {opportunity.lunarIntelligence.summaryRationale}
                  </p>
                </div>
              </div>

              {/* Historical Volatility, Expansion & Reversal Timing Analysis */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-sans">
                <div className="p-3 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-1">
                  <div className="text-sky-300 font-bold font-mono text-xs flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-sky-400" />
                    Historical Volatility Behavior
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {opportunity.lunarIntelligence.historicalVolatilityBehavior}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-1">
                  <div className="text-amber-300 font-bold font-mono text-xs flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    Market Expansion Periods
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {opportunity.lunarIntelligence.marketExpansionPeriod}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-1">
                  <div className="text-purple-300 font-bold font-mono text-xs flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    Possible Reversal Timing
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {opportunity.lunarIntelligence.possibleReversalTiming}
                  </p>
                </div>
              </div>

              {/* Strict 4-Pillar Alignment Matrix */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-300 font-bold">
                    LUNAR CONFIRMATION 4-PILLAR ALIGNMENT REQUIREMENT:
                  </span>
                  <span className="text-zinc-400 text-[10px]">
                    Lunar cycle cannot create a signal alone. Must align with:
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  {/* Pillar 1: Market Structure */}
                  <div className={`p-2.5 rounded-lg border ${opportunity.lunarIntelligence.alignmentChecks.marketStructureAligned ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/10 border-rose-500/40 text-rose-300'}`}>
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span>1. Structure</span>
                      <span>{opportunity.lunarIntelligence.alignmentChecks.marketStructureAligned ? '✓ ALIGNED' : '✗ CONFLICT'}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">
                      {opportunity.lunarIntelligence.alignmentChecks.marketStructureAligned ? '4H/1H direction matches' : 'Bias conflict (Vetoed)'}
                    </span>
                  </div>

                  {/* Pillar 2: Liquidity */}
                  <div className={`p-2.5 rounded-lg border ${opportunity.lunarIntelligence.alignmentChecks.liquidityAligned ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span>2. Liquidity</span>
                      <span>{opportunity.lunarIntelligence.alignmentChecks.liquidityAligned ? '✓ SWEPT' : '— UNCONFIRMED'}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">
                      {opportunity.lunarIntelligence.alignmentChecks.liquidityAligned ? 'Asian high/low taken' : 'Awaiting sweep event'}
                    </span>
                  </div>

                  {/* Pillar 3: Gann Levels */}
                  <div className={`p-2.5 rounded-lg border ${opportunity.lunarIntelligence.alignmentChecks.gannLevelsAligned ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span>3. Gann Levels</span>
                      <span>{opportunity.lunarIntelligence.alignmentChecks.gannLevelsAligned ? '✓ CONFLUENCE' : '— OFF'}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">
                      {opportunity.lunarIntelligence.alignmentChecks.gannLevelsAligned ? '≥2 Gann tools in zone' : 'Gann confluence incomplete'}
                    </span>
                  </div>

                  {/* Pillar 4: Momentum */}
                  <div className={`p-2.5 rounded-lg border ${opportunity.lunarIntelligence.alignmentChecks.momentumAligned ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span>4. Momentum</span>
                      <span>{opportunity.lunarIntelligence.alignmentChecks.momentumAligned ? '✓ CONFIRMED' : '— OFF'}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">
                      {opportunity.lunarIntelligence.alignmentChecks.momentumAligned ? 'Inflection confirmed' : 'No directional momentum'}
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-black/40 text-[10.5px] text-zinc-400 font-sans">
                  <strong className="text-zinc-300 font-mono">RULE ENFORCEMENT: </strong>
                  If timing conflicts with market structure, the lunar signal is automatically flagged as <span className="text-rose-300 font-bold">IGNORED</span>. It will never override Market Structure or risk gates.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. HISTORICAL PATTERN MEMORY & SCANNER RADAR OVERVIEW */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0c0e18] to-[#070910] border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-300 font-bold flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
            HISTORICAL PATTERN MEMORY (SIMILAR PAST GANN CONDITIONS)
          </span>
          <span className="text-purple-300 font-bold">
            Similarity Score: {opportunity.historicalSimilarity}%
          </span>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-zinc-800/80 text-xs font-sans space-y-1 text-zinc-300">
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-zinc-400">Match Archetype:</span>
            <span className="text-white font-semibold">{opportunity.historicalMatch.matchedSetupType}</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-zinc-400">Historical Hit Rate (TP1):</span>
            <span className="text-emerald-400 font-bold">{opportunity.historicalMatch.historicalWinRate}% ({opportunity.historicalMatch.sampleSize} instances)</span>
          </div>
          <p className="text-[11px] text-zinc-400 pt-1 font-sans">
            {opportunity.historicalMatch.summary}
          </p>
        </div>

        {/* 9 Supported Assets Radar Table */}
        <div className="pt-2 border-t border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>INSTITUTIONAL RADAR (9 MONITORED ASSETS):</span>
            <span className="text-amber-400">{scanOverview.scanSummary}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800 text-[10px]">
                  <th className="py-1.5 px-2">ASSET</th>
                  <th className="py-1.5 px-2">SPOT</th>
                  <th className="py-1.5 px-2">DIRECTION</th>
                  <th className="py-1.5 px-2">CONFIRMATIONS</th>
                  <th className="py-1.5 px-2">CONFIDENCE</th>
                  <th className="py-1.5 px-2 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {GANN_SUPPORTED_ASSET_IDS.map(assetId => {
                  const opp = scanOverview.opportunities[assetId];
                  const prof = GANN_ASSET_PROFILES[assetId];
                  const isCurrent = selectedAssetId === assetId;

                  return (
                    <tr 
                      key={assetId}
                      onClick={() => setSelectedAssetId(assetId)}
                      className={`hover:bg-zinc-900/40 cursor-pointer transition ${isCurrent ? 'bg-amber-500/10' : ''}`}
                    >
                      <td className="py-2 px-2 font-bold text-white flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${opp.direction === 'BUY' ? 'bg-emerald-400' : opp.direction === 'SELL' ? 'bg-rose-400' : 'bg-amber-400/60'}`} />
                        <span>{prof.symbol}</span>
                      </td>
                      <td className="py-2 px-2 text-zinc-300">{opp.currentPriceFormatted}</td>
                      <td className="py-2 px-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${opp.direction === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : opp.direction === 'SELL' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {opp.direction}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-sky-300">{opp.confirmationsAligned}</td>
                      <td className="py-2 px-2 text-amber-300 font-bold">{opp.confidence}</td>
                      <td className="py-2 px-2 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAssetId(assetId);
                          }}
                          className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] transition"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
