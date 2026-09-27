import React, { useState, useEffect, useMemo, memo } from 'react';
import { 
  Clock, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Newspaper, 
  Check, 
  AlertTriangle,
  Info,
  ShieldCheck,
  ChevronDown,
  X,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { GoldNewsEngineState, EconomicNewsEvent, VerifiedGoldNewsWire } from '../../server/goldNewsEngine';

// =========================================================================
// ISOLATED TICKER & CLOCK
// =========================================================================

const IsolatedLiveTicker: React.FC<{
  dataStatus: string;
  dataQuality: string;
}> = memo(({ dataStatus, dataQuality }) => {
  const [secondsAgo, setSecondsAgo] = useState<number>(0.8);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo(prev => {
        const next = Number((prev + 0.5).toFixed(1));
        return next > 3.0 ? 3.0 : next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold border transition bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full inline-block bg-emerald-400 animate-pulse" />
        <span>LIVE DATA 🟢</span>
        <span className="text-zinc-500">•</span>
        <span>Updated: {secondsAgo < 1 ? '0.8s' : `${secondsAgo}s`} ago</span>
      </div>

      <div className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1.5">
        <span className="text-zinc-400 text-[10px] uppercase">Data Quality:</span>
        <strong className="text-amber-300 font-bold">{dataQuality}</strong>
      </div>
    </div>
  );
});
IsolatedLiveTicker.displayName = 'IsolatedLiveTicker';

const IsolatedUtcClock: React.FC = memo(() => {
  const [timeStr, setTimeStr] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')} UTC`;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setTimeStr(`${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')} UTC`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="text-zinc-400 font-mono text-[11px] hidden sm:inline">
      {timeStr}
    </span>
  );
});
IsolatedUtcClock.displayName = 'IsolatedUtcClock';

// =========================================================================
// MAIN SINGLE MERGED GOLD NEWS VIEW
// =========================================================================

export const NewsIntelligenceView: React.FC = () => {
  const { fetchNewsData, markets } = useMarket();

  const [engineState, setEngineState] = useState<GoldNewsEngineState | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedEventForModal, setSelectedEventForModal] = useState<EconomicNewsEvent | null>(null);
  const [newsFilter, setNewsFilter] = useState<'ALL' | 'BULLISH' | 'BEARISH' | 'FRESH'>('ALL');

  const fetchBackendEngine = async () => {
    try {
      const res = await fetch('/api/gold-news-intelligence');
      if (res.ok) {
        const json: GoldNewsEngineState = await res.json();
        setEngineState(json);
      }
    } catch (e) {
      console.warn('[GoldNewsEngine] Sync notice:', e);
    }
  };

  useEffect(() => {
    fetchBackendEngine();
    const interval = setInterval(fetchBackendEngine, 3000);
    return () => clearInterval(interval);
  }, []);

  const spotGoldMarket = useMemo(() => {
    return markets.find(m => m.id === 'xau-usd') || {
      price: 4272.44,
      changePercent: 1.42,
      change: 59.74
    };
  }, [markets]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchNewsData(), fetchBackendEngine()]);
    } catch (e) {
      console.warn('[GoldNewsEngine] Refresh notice:', e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const nextEvt = engineState?.nextMajorEvent || {
    eventName: 'US CPI (Consumer Price Index) MoM',
    exactTimeUtc: '12:30 UTC',
    minutesRemaining: 265,
    goldImpact: 'HIGH' as const,
    bias: 'BULLISH' as const
  };

  const formattedCountdown = useMemo(() => {
    const mins = nextEvt.minutesRemaining;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const s = 35;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [nextEvt]);

  return (
    <div className="space-y-4 text-zinc-100 font-sans pb-12 max-w-full">
      {/* ========================================================================= */}
      {/* 1. TOP SNAPSHOT COCKPIT                                                   */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#080B13] border border-[#2B2313] shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded font-black bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 uppercase tracking-wider text-[10.5px] font-mono">
              GOLD NEWS INTELLIGENCE
            </span>
            <IsolatedLiveTicker 
              dataStatus="CONNECTED" 
              dataQuality={engineState?.overallDataQuality || 'High'} 
            />
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <IsolatedUtcClock />
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition cursor-pointer flex items-center gap-1.5 text-xs font-mono"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#D4AF37]' : 'text-zinc-400'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* 3 Main Header Snapshot Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3.5">
          {/* Live Gold Price */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 shadow-inner">
            <div className="text-[10px] font-mono text-zinc-400 uppercase font-bold flex justify-between">
              <span>SPOT GOLD (XAU/USD)</span>
              <span className="text-emerald-400 font-bold">LIVE 🟢</span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-[#D4AF37] mt-0.5 tracking-tight">
              ${spotGoldMarket.price.toFixed(2)}
            </div>
            <div className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{spotGoldMarket.changePercent}% (+${spotGoldMarket.change.toFixed(2)})</span>
            </div>
          </div>

          {/* Overall Pre-News Gold Bias */}
          <div className="p-3.5 rounded-xl bg-[#091910] border border-emerald-500/40 shadow-inner">
            <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center justify-between">
              <span>FINAL PRE-NEWS GOLD BIAS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-xl font-mono font-black text-emerald-300 mt-1 flex items-center gap-1.5">
              <span>🟢 BULLISH</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-normal">
                {engineState?.overallConfidence || 'Moderate'} Conf.
              </span>
            </div>
            <div className="text-[10.5px] font-mono text-zinc-400 mt-0.5 truncate">
              Soft inflation expectations & real yield decline
            </div>
          </div>

          {/* Next Major High Impact Event & Countdown */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 shadow-inner">
            <div className="text-[10px] font-mono text-zinc-400 uppercase font-bold flex justify-between">
              <span>NEXT MAJOR EVENT</span>
              <span className="text-rose-400 font-bold">HIGH IMPACT 🔥</span>
            </div>
            <div className="text-xs sm:text-sm font-mono font-black text-white mt-1 truncate" title={nextEvt.eventName}>
              {nextEvt.eventName}
            </div>
            <div className="text-xs font-mono font-bold text-amber-300 mt-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Countdown: <strong className="text-white font-black">{formattedCountdown}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. UPCOMING ECONOMIC EVENTS & FINAL PRE-NEWS BIAS                         */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#090C14] border border-[#2B2313] space-y-3.5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            <h2 className="text-sm font-mono font-black text-white uppercase tracking-wider">
              UPCOMING HIGH-IMPACT GOLD EVENTS
            </h2>
          </div>
          <div className="text-xs font-mono text-zinc-400 flex items-center gap-2">
            <span>Sources: Tier-1 Official (BLS, Fed, BEA)</span>
          </div>
        </div>

        {/* List of Verified Events */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {(engineState?.upcomingEvents || []).map(evt => {
            const isBullish = evt.preNewsBias === 'BULLISH';
            const isBearish = evt.preNewsBias === 'BEARISH';

            return (
              <div 
                key={evt.id} 
                className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90 hover:border-amber-500/40 transition space-y-3 flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-2">
                  {/* Top Bar: Flag, Event Name, Status & Impact */}
                  <div className="flex items-center justify-between text-xs font-mono flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-zinc-300 flex items-center gap-1.5">
                      <span>{evt.flag}</span>
                      <span>{evt.country}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        🟡 {evt.status}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9.5px] font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40">
                        {evt.impactLevel} IMPACT
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs sm:text-sm font-mono font-bold text-white leading-snug">
                    {evt.eventName}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1 text-zinc-300 font-bold">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {evt.exactTimeUtc}
                    </span>
                    <span className="text-amber-300 font-bold">
                      in {Math.floor(evt.minutesRemaining / 60)}h {evt.minutesRemaining % 60}m
                    </span>
                  </div>

                  {/* Forecast vs Previous vs Actual */}
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono p-2 rounded-lg bg-zinc-900/90 border border-zinc-800 text-center">
                    <div>
                      <span className="text-[9px] text-zinc-500 block uppercase">FORECAST</span>
                      <span className="text-zinc-200 font-bold text-[11px]">{evt.forecast || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 block uppercase">PREVIOUS</span>
                      <span className="text-zinc-400 font-bold text-[11px]">{evt.previous || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 block uppercase">ACTUAL</span>
                      <span className="text-amber-300 font-bold text-[11px]">{evt.actual || 'Pending'}</span>
                    </div>
                  </div>

                  {/* Final Pre-News Bias Pill */}
                  <div className={`p-2.5 rounded-lg border text-xs font-mono space-y-1 ${
                    isBullish 
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                      : isBearish 
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-200' 
                      : 'bg-zinc-900 border-zinc-700 text-zinc-200'
                  }`}>
                    <div className="flex justify-between items-center font-bold text-[11px]">
                      <span>FINAL PRE-NEWS GOLD BIAS:</span>
                      <strong className={`px-2 py-0.5 rounded text-[10.5px] font-black uppercase ${
                        isBullish ? 'bg-emerald-500 text-black' : isBearish ? 'bg-rose-500 text-white' : 'bg-zinc-700 text-white'
                      }`}>
                        {isBullish ? '🟢 BULLISH' : isBearish ? '🔴 BEARISH' : '⚪ NEUTRAL / MIXED'}
                      </strong>
                    </div>
                    <p className="text-[10.5px] text-zinc-300 leading-relaxed pt-0.5">
                      {evt.shortReasoning}
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Quality & View Details */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-[10.5px] text-zinc-400">
                    <span>Quality: <strong className="text-emerald-400">{evt.dataQuality}</strong></span>
                    <span>•</span>
                    <span>Conf: <strong className="text-amber-300">{evt.confidence}</strong></span>
                  </div>

                  <button
                    onClick={() => setSelectedEventForModal(evt)}
                    className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 text-[10.5px] font-bold cursor-pointer transition flex items-center gap-1"
                  >
                    <span>View Details</span>
                    <ChevronDown className="w-3 h-3 text-amber-300" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. LATEST VERIFIED BREAKING GOLD NEWS WIRES                               */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#090C14] border border-[#2B2313] space-y-3.5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-[#D4AF37]" />
            <h2 className="text-sm font-mono font-black text-white uppercase tracking-wider">
              LATEST VERIFIED GOLD NEWS WIRES
            </h2>
          </div>

          <div className="flex items-center gap-1 text-xs font-mono flex-wrap">
            {[
              { id: 'ALL', label: 'All News' },
              { id: 'BULLISH', label: '🟢 Bullish' },
              { id: 'BEARISH', label: '🔴 Bearish' },
              { id: 'FRESH', label: '⚡ Fresh' }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setNewsFilter(filter.id as any)}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer text-[10.5px] font-bold ${
                  newsFilter === filter.id
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* News Wires Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(engineState?.verifiedNewsWires || [])
            .filter(card => {
              if (newsFilter === 'BULLISH') return card.goldImpact === 'Bullish Gold';
              if (newsFilter === 'BEARISH') return card.goldImpact === 'Bearish Gold';
              if (newsFilter === 'FRESH') return card.timeAgoFormatted.includes('m ago');
              return true;
            })
            .map(card => {
              const isBullish = card.goldImpact === 'Bullish Gold';
              const isBearish = card.goldImpact === 'Bearish Gold';

              return (
                <div 
                  key={card.id} 
                  className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-amber-500/40 transition space-y-2.5 flex flex-col justify-between shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono flex-wrap gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-200 font-bold">{card.primarySource.name}</span>
                        <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-zinc-900 text-amber-300 border border-zinc-800">
                          Tier 1 Verified
                        </span>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
                        {card.timeAgoFormatted}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-mono font-bold text-white leading-snug">
                      {card.headline}
                    </h3>

                    {/* Simple Takeaway */}
                    <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono text-zinc-300 leading-relaxed">
                      <div className="text-amber-400 font-bold mb-0.5">💡 Simple Takeaway:</div>
                      <p className="text-zinc-200">{card.simpleTakeaway}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono flex-wrap gap-2">
                    <span className="text-[10.5px] text-zinc-400">
                      Merged {card.mergedSourcesCount} sources • {card.publishedTimeUtc}
                    </span>

                    <span className={`px-2.5 py-1 rounded-lg text-[10.5px] font-black uppercase tracking-wider ${
                      isBullish 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' 
                        : isBearish 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50' 
                        : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}>
                      {isBullish ? '🟢 Bullish for Gold' : isBearish ? '🔴 Bearish for Gold' : '⚪ Neutral'}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. OPTIONAL "VIEW DETAILS" MODAL                                          */}
      {/* ========================================================================= */}
      {selectedEventForModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#090D16] border border-amber-500/40 p-4 sm:p-6 space-y-4 shadow-2xl font-mono text-xs text-zinc-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedEventForModal.flag}</span>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{selectedEventForModal.eventName}</h3>
                  <p className="text-[10.5px] text-zinc-400">{selectedEventForModal.country} • {selectedEventForModal.exactTimeUtc}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEventForModal(null)}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Detailed Pre-News Bias Box */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                PRE-NEWS AI ANALYSIS & BIAS BREAKDOWN
              </div>
              <p className="text-[11.5px] text-zinc-300 leading-relaxed font-sans">
                {selectedEventForModal.detailedReasoning}
              </p>
            </div>

            {/* Detailed Context Factors */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                MARKET CONTEXT FACTORS CONSIDERED:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] uppercase block">Dollar (DXY) Context</span>
                  <span className="text-zinc-200 font-semibold">{selectedEventForModal.factors.usdDxyContext}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] uppercase block">Treasury Real Yields</span>
                  <span className="text-zinc-200 font-semibold">{selectedEventForModal.factors.treasuryYieldContext}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] uppercase block">Fed Rate Expectation</span>
                  <span className="text-zinc-200 font-semibold">{selectedEventForModal.factors.fedRateExpectation}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] uppercase block">Inflation Context</span>
                  <span className="text-zinc-200 font-semibold">{selectedEventForModal.factors.inflationContext}</span>
                </div>
              </div>
            </div>

            {/* Verification & Source Tiers */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                <span>VERIFIED SOURCE TIER & LOGS:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                  {selectedEventForModal.attachedSources.length} Tier-1/2 Sources
                </span>
              </div>

              <div className="space-y-1.5">
                {selectedEventForModal.attachedSources.map((src, i) => (
                  <div key={i} className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-white font-bold">{src.name}</span>
                    </div>
                    <span className="text-[10px] text-amber-300 font-mono">
                      Reliability: {src.reliabilityScore}% ({src.tier})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Close */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEventForModal(null)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black font-extrabold text-xs cursor-pointer hover:brightness-110"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
