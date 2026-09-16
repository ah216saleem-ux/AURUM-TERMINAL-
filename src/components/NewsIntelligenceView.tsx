import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Newspaper, 
  ShieldAlert, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Flame, 
  Clock, 
  Search, 
  Radio, 
  Globe, 
  Target, 
  AlertTriangle,
  History,
  Layers,
  ChevronRight,
  Zap,
  Filter
} from 'lucide-react';
import { 
  UPCOMING_ECONOMIC_EVENTS, 
  HISTORICAL_EVENTS_DATABASE, 
  CURRENT_AI_NEWS_PREDICTION, 
  getNewsTradingStatus,
  fontSources 
} from '../data/newsIntelligenceData';
import { EventCategory, ImpactLevel, MarketReactionType } from '../types';

export const NewsIntelligenceView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'CALENDAR' | 'PREDICTION' | 'HISTORICAL'>('CALENDAR');
  const [calendarFilter, setCalendarFilter] = useState<'ALL' | 'HIGH_IMPACT' | 'UPCOMING'>('ALL');
  const [historicalCategory, setHistoricalCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const newsStatus = getNewsTradingStatus();

  // Filtered economic calendar events
  const filteredEvents = UPCOMING_ECONOMIC_EVENTS.filter((evt) => {
    if (calendarFilter === 'HIGH_IMPACT' && evt.impact !== 'HIGH') return false;
    if (calendarFilter === 'UPCOMING' && !evt.isUpcoming) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return evt.eventName.toLowerCase().includes(q) || evt.currency.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered historical events
  const filteredHistorical = HISTORICAL_EVENTS_DATABASE.filter((evt) => {
    if (historicalCategory !== 'ALL' && evt.category !== historicalCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return evt.eventName.toLowerCase().includes(q) || evt.eventDate.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* 1. NEWS RISK ENGINE HEADER & TRADING FILTER STATUS */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121522] via-[#0d0f18] to-[#08090d] border border-amber-500/30 shadow-lg space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-syne tracking-wide uppercase">
                  AI News Intelligence & Risk Engine
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9.5px] font-mono-num font-bold">
                  LIVE API
                </span>
              </div>
              <span className="text-[10px] font-mono-num text-zinc-400">
                Forex Factory • Investing.com • Trading Economics
              </span>
            </div>
          </div>

          {/* Sources Sync Status */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono-num text-zinc-400 bg-neutral-950/80 px-2.5 py-1 rounded-lg border border-zinc-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>3 Data Feeds Synced</span>
          </div>
        </div>

        {/* 4. NEWS TRADING FILTER STATUS BANNER */}
        <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 font-mono-num ${
          newsStatus.isBlocked 
            ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)]' 
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2.5">
            {newsStatus.isBlocked ? (
              <div className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400">
                <ShieldAlert className="w-4 h-4 animate-bounce" />
              </div>
            ) : (
              <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase text-zinc-400 font-bold block">
                  Trading Status
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  newsStatus.isBlocked ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {newsStatus.status}
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 font-sans mt-0.5 leading-snug">
                {newsStatus.message}
              </p>
            </div>
          </div>

          {newsStatus.minutesUntil !== null && (
            <div className="text-right shrink-0">
              <span className="text-[9.5px] uppercase text-zinc-500 block">Window</span>
              <span className="text-sm font-bold text-amber-300 font-mono-num">
                -{newsStatus.minutesUntil}m
              </span>
            </div>
          )}
        </div>
      </div>

      {/* VIEW SUB-NAVIGATION TABS */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-neutral-950 border border-zinc-800 text-xs font-mono-num font-bold">
        <button
          onClick={() => setActiveSubTab('CALENDAR')}
          className={`py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer text-center ${
            activeSubTab === 'CALENDAR'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Calendar</span>
        </button>

        <button
          onClick={() => setActiveSubTab('PREDICTION')}
          className={`py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer text-center ${
            activeSubTab === 'PREDICTION'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Prediction</span>
        </button>

        <button
          onClick={() => setActiveSubTab('HISTORICAL')}
          className={`py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer text-center ${
            activeSubTab === 'HISTORICAL'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Historical (2-3Y)</span>
        </button>
      </div>

      {/* SUB-VIEW CONTENT */}
      {activeSubTab === 'CALENDAR' && (
        /* 1. ECONOMIC CALENDAR VIEW */
        <div className="space-y-3">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-neutral-950 border border-zinc-800 text-[11px] font-mono-num">
              <button
                onClick={() => setCalendarFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                  calendarFilter === 'ALL'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setCalendarFilter('HIGH_IMPACT')}
                className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                  calendarFilter === 'HIGH_IMPACT'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                High Impact Only
              </button>
              <button
                onClick={() => setCalendarFilter('UPCOMING')}
                className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                  calendarFilter === 'UPCOMING'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Upcoming
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative flex-1 sm:max-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search event or USD..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-neutral-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* Economic Events List */}
          <div className="space-y-2">
            {filteredEvents.map((evt) => {
              const isHigh = evt.impact === 'HIGH';
              const isMed = evt.impact === 'MEDIUM';

              return (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-2xl bg-[#0c0e15] border border-zinc-800 hover:border-zinc-700 transition space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-mono-num font-bold">
                        {evt.currency}
                      </span>
                      {/* Impact Badge */}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono-num font-bold border ${
                        isHigh 
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.2)]'
                          : isMed 
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>
                        {evt.impact} IMPACT
                      </span>
                      <span className="text-[10px] font-mono-num text-zinc-500">
                        {evt.source}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono-num text-amber-300 font-semibold">
                      {evt.formattedTime}
                    </span>
                  </div>

                  {/* Event Title */}
                  <div className="text-sm font-bold text-white tracking-tight">
                    {evt.eventName}
                  </div>

                  {/* Data Metrics: Forecast, Previous, Actual */}
                  <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-neutral-950/80 border border-zinc-800/80 text-[11px] font-mono-num">
                    <div>
                      <span className="text-[9.5px] text-zinc-500 uppercase block">Forecast</span>
                      <span className="font-bold text-zinc-200 block">{evt.forecast}</span>
                    </div>

                    <div>
                      <span className="text-[9.5px] text-zinc-500 uppercase block">Previous</span>
                      <span className="font-bold text-zinc-400 block">{evt.previous}</span>
                    </div>

                    <div>
                      <span className="text-[9.5px] text-zinc-500 uppercase block">Actual</span>
                      <span className={`font-bold block ${evt.actual ? 'text-emerald-400' : 'text-amber-400/70 italic'}`}>
                        {evt.actual ? evt.actual : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === 'PREDICTION' && (
        /* 3. AI NEWS PREDICTION VIEW */
        <div className="space-y-3.5">
          <div className="p-4 rounded-2xl bg-[#0c0e16] border border-amber-500/35 space-y-4 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-mono-num font-bold text-amber-300 uppercase tracking-wider">
                  NEWS IMPACT ANALYSIS
                </h4>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono-num font-bold">
                Risk Level: {CURRENT_AI_NEWS_PREDICTION.riskLevel}
              </span>
            </div>

            {/* Event Name & Expected Impact */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-zinc-800">
              <div>
                <span className="text-[10px] text-zinc-500 font-mono-num uppercase block">
                  Upcoming Catalyst Event
                </span>
                <h3 className="text-base font-bold text-white">
                  {CURRENT_AI_NEWS_PREDICTION.eventName}
                </h3>
              </div>

              <div className="text-right font-mono-num">
                <span className="text-[10px] text-zinc-500 uppercase block">Expected Impact</span>
                <span className="text-sm font-bold text-emerald-400 flex items-center justify-end gap-1">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  {CURRENT_AI_NEWS_PREDICTION.expectedImpact}
                </span>
              </div>
            </div>

            {/* AI Summary */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
              <span className="text-[10px] font-mono-num font-bold text-amber-300 uppercase block">
                AI Synthesis Rationale
              </span>
              <p className="text-xs text-zinc-200 font-sans leading-relaxed">
                {CURRENT_AI_NEWS_PREDICTION.summary}
              </p>
            </div>

            {/* Affected Assets Matrix: Gold, NASDAQ, S&P500, Oil */}
            <div className="space-y-2">
              <span className="text-xs font-mono-num font-bold text-zinc-300 uppercase tracking-wider block">
                Affected Assets Projection
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono-num">
                {/* Gold */}
                <div className="p-3 rounded-xl bg-neutral-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">Gold (XAU/USD)</span>
                    <span className="text-emerald-400 font-bold text-[11px]">
                      {CURRENT_AI_NEWS_PREDICTION.affectedAssets.gold.expectedDirection} ({CURRENT_AI_NEWS_PREDICTION.affectedAssets.gold.priceTarget})
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans leading-snug">
                    {CURRENT_AI_NEWS_PREDICTION.affectedAssets.gold.rationale}
                  </p>
                </div>

                {/* NASDAQ */}
                <div className="p-3 rounded-xl bg-neutral-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">NASDAQ 100</span>
                    <span className="text-emerald-400 font-bold text-[11px]">
                      {CURRENT_AI_NEWS_PREDICTION.affectedAssets.nasdaq.expectedDirection} ({CURRENT_AI_NEWS_PREDICTION.affectedAssets.nasdaq.priceTarget})
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans leading-snug">
                    {CURRENT_AI_NEWS_PREDICTION.affectedAssets.nasdaq.rationale}
                  </p>
                </div>

                {/* S&P 500 */}
                <div className="p-3 rounded-xl bg-neutral-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">S&P 500</span>
                    <span className="text-emerald-400 font-bold text-[11px]">
                      {CURRENT_AI_NEWS_PREDICTION.affectedAssets.sp500.expectedDirection} ({CURRENT_AI_NEWS_PREDICTION.affectedAssets.sp500.priceTarget})
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans leading-snug">
                    {CURRENT_AI_NEWS_PREDICTION.affectedAssets.sp500.rationale}
                  </p>
                </div>

                {/* Crude Oil */}
                <div className="p-3 rounded-xl bg-neutral-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">Crude Oil (WTI)</span>
                    <span className="text-zinc-300 font-bold text-[11px]">
                      {CURRENT_AI_NEWS_PREDICTION.affectedAssets.oil.expectedDirection} ({CURRENT_AI_NEWS_PREDICTION.affectedAssets.oil.priceTarget})
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans leading-snug">
                    {CURRENT_AI_NEWS_PREDICTION.affectedAssets.oil.rationale}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'HISTORICAL' && (
        /* 2. HISTORICAL EVENT ANALYSIS DATABASE (2-3 YEARS: 2024 - 2026) */
        <div className="space-y-3">
          {/* Historical Category Filter */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono-num font-bold text-zinc-300 uppercase tracking-wider">
              2-3 Years Historical Event Database
            </span>

            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px] font-mono-num">
              {['ALL', 'CPI', 'NFP', 'FOMC', 'RATES', 'PPI', 'RETAIL'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setHistoricalCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg shrink-0 font-semibold transition cursor-pointer ${
                    historicalCategory === cat
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                      : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Historical Event Cards */}
          <div className="space-y-3">
            {filteredHistorical.map((item) => {
              const isBullish = item.overallReaction === 'Bullish';
              const isBearish = item.overallReaction === 'Bearish';

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#0c0e15] border border-zinc-800 hover:border-zinc-700 transition space-y-3 shadow-md"
                >
                  {/* Row 1: Event Name & Reaction Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono-num text-zinc-500 uppercase block">
                        {item.eventDate} ({item.year})
                      </span>
                      <h4 className="text-sm font-bold text-white font-syne">
                        {item.eventName}
                      </h4>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-xs font-mono-num font-bold border ${
                      isBullish 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                        : isBearish
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    }`}>
                      {item.overallReaction}
                    </div>
                  </div>

                  {/* Row 2: Before News Conditions */}
                  <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800/80 space-y-1 text-xs font-mono-num">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      Before News State
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px]">
                      <div>
                        <span className="text-zinc-500 block text-[9.5px]">Trend:</span>
                        <span className="text-zinc-200 font-medium">{item.beforeNews.marketTrend}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[9.5px]">Position:</span>
                        <span className="text-zinc-200 font-medium">{item.beforeNews.pricePosition}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[9.5px]">Volatility:</span>
                        <span className="text-zinc-200 font-medium">{item.beforeNews.volatility}</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: After News Asset Reactions */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono-num font-bold text-zinc-400 uppercase tracking-wider block">
                      After News Reaction Across Assets
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono-num text-[11px]">
                      <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                        <span className="text-[9.5px] text-amber-300 block font-bold">Gold (XAU/USD)</span>
                        <span className="text-zinc-200 text-[10.5px] font-medium block truncate">{item.afterNews.xauusdReaction}</span>
                      </div>

                      <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                        <span className="text-[9.5px] text-amber-300 block font-bold">NASDAQ 100</span>
                        <span className="text-zinc-200 text-[10.5px] font-medium block truncate">{item.afterNews.nasdaqReaction}</span>
                      </div>

                      <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                        <span className="text-[9.5px] text-amber-300 block font-bold">S&P 500</span>
                        <span className="text-zinc-200 text-[10.5px] font-medium block truncate">{item.afterNews.sp500Reaction}</span>
                      </div>

                      <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                        <span className="text-[9.5px] text-amber-300 block font-bold">Oil WTI</span>
                        <span className="text-zinc-200 text-[10.5px] font-medium block truncate">{item.afterNews.oilReaction}</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Key Takeaway */}
                  <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-zinc-300 font-sans leading-relaxed">
                    <span className="font-mono-num font-bold text-amber-400 mr-1.5">Key Takeaway:</span>
                    {item.keyTakeaway}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
