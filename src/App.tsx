/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { MarketProvider, useMarket } from './context/MarketContext';
import { MobileAppHeader } from './components/MobileAppHeader';
import { TradingStyleSelector } from './components/TradingStyleSelector';
import { ModeAnalysisPanel } from './components/ModeAnalysisPanel';
import { AurumMarketRanking } from './components/AurumMarketRanking';
import { AssetAiProfileModal } from './components/AssetAiProfileModal';
import { AssetCard } from './components/AssetCard';
import { SignalDetailModal } from './components/SignalDetailModal';
import { TelegramModal } from './components/TelegramModal';
import { AiMarketScannerModal } from './components/AiMarketScannerModal';
import { SignalHistoryView } from './components/SignalHistoryView';
import { NewsIntelligenceView } from './components/NewsIntelligenceView';
import { AiLearningBacktestView } from './components/AiLearningBacktestView';
import { AiRiskControlView } from './components/AiRiskControlView';
import { AiWatchlistView } from './components/AiWatchlistView';
import { AiAlertCenterModal } from './components/AiAlertCenterModal';
import { DailyMarketBriefModal } from './components/DailyMarketBriefModal';
import { RealDataIntegrationModal } from './components/RealDataIntegrationModal';
import { UserDashboardModal } from './components/UserDashboardModal';
import { MarketCategory, MarketItem } from './types';
import { 
  Sparkles, 
  ShieldCheck, 
  Radar, 
  ArrowRight, 
  History, 
  Zap, 
  Newspaper, 
  ShieldAlert, 
  BrainCircuit, 
  Sliders, 
  Layers,
  Star,
  Bell,
  BookOpen
} from 'lucide-react';

function MainApp() {
  const { 
    markets, 
    historyStats,
    isAlertCenterOpen,
    setIsAlertCenterOpen,
    isDailyBriefOpen,
    setIsDailyBriefOpen,
    isRealDataModalOpen,
    setIsRealDataModalOpen,
    isUserDashboardOpen,
    setIsUserDashboardOpen,
    watchlistAssetIds
  } = useMarket();
  const [activeModalMarket, setActiveModalMarket] = useState<MarketItem | null>(null);
  const [selectedProfileAssetId, setSelectedProfileAssetId] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'SIGNALS' | 'WATCHLIST' | 'RANKINGS' | 'RISK' | 'NEWS' | 'BACKTEST' | 'HISTORY'>('SIGNALS');
  const [categoryFilter, setCategoryFilter] = useState<MarketCategory | 'all'>('all');

  const filteredMarkets = useMemo(() => {
    if (categoryFilter === 'all') return markets;
    return markets.filter(m => m.category === categoryFilter);
  }, [markets, categoryFilter]);

  const categoryCounts = useMemo(() => {
    return {
      all: markets.length,
      commodities: markets.filter(m => m.category === 'commodities').length,
      indices: markets.filter(m => m.category === 'indices').length,
      forex: markets.filter(m => m.category === 'forex').length,
      crypto: markets.filter(m => m.category === 'crypto').length
    };
  }, [markets]);

  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* Centered Mobile-First Container */}
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col px-4 py-5 sm:py-6 space-y-4">
        {/* Mobile App Header with Subtle 3D Globe */}
        <MobileAppHeader />

        {/* Trading Style Selector: SCALPING | INTRADAY | SWING */}
        <TradingStyleSelector />

        {/* 1. AI Market Scanner: "Scan Best Trade" Button */}
        <button
          onClick={() => setIsScannerOpen(true)}
          className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38728] text-black font-mono-num font-bold text-xs uppercase tracking-wider flex items-center justify-between shadow-lg shadow-amber-500/20 hover:brightness-105 active:scale-[0.99] transition cursor-pointer border border-amber-300/40"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black/15 flex items-center justify-center shadow-inner">
              <Radar className="w-5 h-5 text-black animate-pulse" />
            </div>
            <div className="text-left">
              <span className="block font-extrabold text-sm sm:text-base leading-tight">
                SCAN BEST TRADE
              </span>
              <span className="block text-[10.5px] font-semibold text-black/80 font-sans">
                AI scans 11 assets for highest probability setup
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-black/15 px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold">
            <span>AI SCAN</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* Navigation Tabs: Live Signals, Watchlist, AI Ranking, Risk Control, AI News, Backtest Engine, Signal History */}
        <div className="grid grid-cols-7 gap-1 p-1 rounded-xl bg-neutral-950 border border-zinc-800 text-[9px] sm:text-[10px] font-mono-num font-bold">
          <button
            onClick={() => setActiveTab('SIGNALS')}
            className={`py-2 px-0.5 rounded-lg flex items-center justify-center gap-0.5 sm:gap-1 transition cursor-pointer text-center ${
              activeTab === 'SIGNALS'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25 font-extrabold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span className="truncate">Signals</span>
          </button>

          <button
            onClick={() => setActiveTab('WATCHLIST')}
            className={`py-2 px-0.5 rounded-lg flex items-center justify-center gap-0.5 sm:gap-1 transition cursor-pointer text-center relative ${
              activeTab === 'WATCHLIST'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25 font-extrabold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            <Star className={`w-3 h-3 ${watchlistAssetIds.length > 0 ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span className="truncate">Watch</span>
            {watchlistAssetIds.length > 0 && (
              <span className={`text-[8.5px] px-1 rounded-full ${activeTab === 'WATCHLIST' ? 'bg-black text-amber-300 font-extrabold' : 'bg-amber-500/20 text-amber-300 font-bold'}`}>
                {watchlistAssetIds.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('RANKINGS')}
            className={`py-2 px-0.5 rounded-lg flex items-center justify-center gap-0.5 sm:gap-1 transition cursor-pointer text-center ${
              activeTab === 'RANKINGS'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25 font-extrabold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span className="truncate">Rank</span>
          </button>

          <button
            onClick={() => setActiveTab('RISK')}
            className={`py-2 px-0.5 rounded-lg flex items-center justify-center gap-0.5 sm:gap-1 transition cursor-pointer text-center ${
              activeTab === 'RISK'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25 font-extrabold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span className="truncate">Risk</span>
          </button>

          <button
            onClick={() => setActiveTab('NEWS')}
            className={`py-2 px-0.5 rounded-lg flex items-center justify-center gap-0.5 sm:gap-1 transition cursor-pointer text-center ${
              activeTab === 'NEWS'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25 font-extrabold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            <Newspaper className="w-3 h-3" />
            <span className="truncate">News</span>
          </button>

          <button
            onClick={() => setActiveTab('BACKTEST')}
            className={`py-2 px-0.5 rounded-lg flex items-center justify-center gap-0.5 sm:gap-1 transition cursor-pointer text-center ${
              activeTab === 'BACKTEST'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25 font-extrabold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            <BrainCircuit className="w-3 h-3" />
            <span className="truncate">Learn</span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`py-2 px-0.5 rounded-lg flex items-center justify-center gap-0.5 sm:gap-1 transition cursor-pointer text-center ${
              activeTab === 'HISTORY'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25 font-extrabold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            <History className="w-3 h-3" />
            <span className="truncate">History</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'SIGNALS' ? (
          <div className="space-y-3.5">
            {/* Mode Analysis Panel */}
            <ModeAnalysisPanel />

            {/* Asset Category Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10.5px] font-mono-num font-bold">
              {(
                [
                  { id: 'all', label: 'ALL', count: categoryCounts.all },
                  { id: 'commodities', label: 'COMMODITIES', count: categoryCounts.commodities },
                  { id: 'indices', label: 'INDICES', count: categoryCounts.indices },
                  { id: 'forex', label: 'FOREX', count: categoryCounts.forex },
                  { id: 'crypto', label: 'CRYPTO', count: categoryCounts.crypto }
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCategoryFilter(tab.id as MarketCategory | 'all')}
                  className={`py-1.5 px-2.5 rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    categoryFilter === tab.id
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25 font-extrabold'
                      : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[9.5px] px-1.5 py-0.2 rounded-full ${
                      categoryFilter === tab.id ? 'bg-black/20 text-black font-extrabold' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Section Header */}
            <div className="flex items-center justify-between px-1 pt-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <h2 className="text-xs font-mono-num font-bold text-zinc-300 uppercase tracking-wider">
                  Live Asset Signals ({filteredMarkets.length})
                </h2>
              </div>
              <span className="text-[11px] font-mono-num text-amber-400/80">
                Tap card for Chart & SMC
              </span>
            </div>

            {/* Filtered Asset Cards */}
            <div className="space-y-2.5">
              {filteredMarkets.map((market, index) => (
                <AssetCard
                  key={market.id}
                  market={market}
                  index={index}
                  onClick={() => setActiveModalMarket(market)}
                />
              ))}
            </div>
          </div>
        ) : activeTab === 'WATCHLIST' ? (
          /* AI PRIORITY WATCHLIST VIEW */
          <AiWatchlistView
            onSelectMarket={(market) => setActiveModalMarket(market)}
            onOpenProfile={(assetId) => setSelectedProfileAssetId(assetId)}
          />
        ) : activeTab === 'RANKINGS' ? (
          /* AURUM MARKET RANKING VIEW */
          <div className="space-y-3.5">
            <AurumMarketRanking
              onSelectMarket={(market) => setActiveModalMarket(market)}
              onOpenProfile={(assetId) => setSelectedProfileAssetId(assetId)}
            />
          </div>
        ) : activeTab === 'RISK' ? (
          /* AI Risk & Quality Control View */
          <AiRiskControlView />
        ) : activeTab === 'NEWS' ? (
          /* AI News Intelligence & Risk View */
          <NewsIntelligenceView />
        ) : activeTab === 'BACKTEST' ? (
          /* AI Learning & Backtesting Engine View */
          <AiLearningBacktestView />
        ) : (
          /* Signal History View */
          <SignalHistoryView />
        )}

        {/* Minimal App Footer */}
        <footer className="pt-6 pb-4 text-center space-y-1.5 border-t border-zinc-900 mt-auto">
          <div className="flex items-center justify-center gap-1 text-[11px] font-mono-num text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500/70" />
            <span>AURUM AI • Institutional Smart Money Signals</span>
          </div>
          <p className="text-[10px] text-zinc-600 font-light">
            Real-time multi-asset intelligence. For informational and educational purposes.
          </p>
        </footer>
      </div>

      {/* 2. Interactive Chart & Signal Detail Modal */}
      {activeModalMarket && (
        <SignalDetailModal
          market={activeModalMarket}
          onClose={() => setActiveModalMarket(null)}
          initialViewMode="CHART"
        />
      )}

      {/* 3. Asset AI Profile Modal */}
      {selectedProfileAssetId && (
        <AssetAiProfileModal
          assetId={selectedProfileAssetId}
          isOpen={!!selectedProfileAssetId}
          onClose={() => setSelectedProfileAssetId(null)}
          onOpenChart={(assetId) => {
            const m = markets.find(item => item.id === assetId);
            if (m) {
              setSelectedProfileAssetId(null);
              setActiveModalMarket(m);
            }
          }}
        />
      )}

      {/* 1. AI Market Scanner Modal */}
      <AiMarketScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        markets={markets}
        onOpenAssetChart={(market) => {
          setIsScannerOpen(false);
          setActiveModalMarket(market);
        }}
      />

      {/* Telegram Wire Modal */}
      <TelegramModal />

      {/* AI Alert Center Modal */}
      <AiAlertCenterModal
        isOpen={isAlertCenterOpen}
        onClose={() => setIsAlertCenterOpen(false)}
        onOpenAssetChart={(market) => {
          setIsAlertCenterOpen(false);
          setActiveModalMarket(market);
        }}
      />

      {/* Daily AI Market Brief Modal */}
      <DailyMarketBriefModal
        isOpen={isDailyBriefOpen}
        onClose={() => setIsDailyBriefOpen(false)}
        onSelectMarket={(market) => {
          setIsDailyBriefOpen(false);
          setActiveModalMarket(market);
        }}
      />

      {/* Real Data Integration Architecture Gateway Modal */}
      <RealDataIntegrationModal
        isOpen={isRealDataModalOpen}
        onClose={() => setIsRealDataModalOpen(false)}
      />

      {/* Production User System & Dashboard Modal */}
      <UserDashboardModal
        isOpen={isUserDashboardOpen}
        onClose={() => setIsUserDashboardOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <MarketProvider>
      <MainApp />
    </MarketProvider>
  );
}
