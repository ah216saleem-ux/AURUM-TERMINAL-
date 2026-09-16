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
import { AssetDetailView } from './components/AssetDetailView';
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
import { QaMonitorModal } from './components/QaMonitorModal';
import { SelectedAssetTradeFlow } from './components/SelectedAssetTradeFlow';
import { BottomNavBar } from './components/BottomNavBar';
import { MarketCategory, MarketItem } from './types';
import { INITIAL_MARKETS } from './data/initialData';
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
  const [selectedAssetForSetup, setSelectedAssetForSetup] = useState<MarketItem | null>(null);
  const [selectedProfileAssetId, setSelectedProfileAssetId] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'SIGNALS' | 'WATCHLIST' | 'RANKINGS' | 'RISK' | 'NEWS' | 'BACKTEST' | 'HISTORY'>('SIGNALS');
  const [categoryFilter, setCategoryFilter] = useState<MarketCategory | 'all'>('all');

  const [selectedAssetId, setSelectedAssetId] = useState<string>('xau-usd');
  const [selectedForexId, setSelectedForexId] = useState<string>('eur-usd');
  const [showAllPairs, setShowAllPairs] = useState<boolean>(false);

  // The 7 core primary asset cards requested - guaranteed safe fallback
  const xauMarket = useMemo(() => markets.find(m => m.id === 'xau-usd') || INITIAL_MARKETS.find(m => m.id === 'xau-usd') || INITIAL_MARKETS[0], [markets]);
  const xagMarket = useMemo(() => markets.find(m => m.id === 'xag-usd') || INITIAL_MARKETS.find(m => m.id === 'xag-usd') || INITIAL_MARKETS[1], [markets]);
  const nasdaqMarket = useMemo(() => markets.find(m => m.id === 'nasdaq-100') || INITIAL_MARKETS.find(m => m.id === 'nasdaq-100') || INITIAL_MARKETS[2], [markets]);
  const spMarket = useMemo(() => markets.find(m => m.id === 'sp-500') || INITIAL_MARKETS.find(m => m.id === 'sp-500') || INITIAL_MARKETS[3], [markets]);
  const oilMarket = useMemo(() => markets.find(m => m.id === 'crude-oil') || INITIAL_MARKETS.find(m => m.id === 'crude-oil') || INITIAL_MARKETS[4], [markets]);
  const forexMarkets = useMemo(() => {
    const list = markets.filter(m => m.category === 'forex');
    return list.length > 0 ? list : INITIAL_MARKETS.filter(m => m.category === 'forex');
  }, [markets]);
  const activeForexMarket = useMemo(() => {
    return markets.find(m => m.id === selectedForexId) || forexMarkets[0] || INITIAL_MARKETS.find(m => m.id === 'eur-usd') || INITIAL_MARKETS[5];
  }, [markets, selectedForexId, forexMarkets]);
  const btcMarket = useMemo(() => markets.find(m => m.id === 'btc-usd') || INITIAL_MARKETS.find(m => m.id === 'btc-usd') || INITIAL_MARKETS[INITIAL_MARKETS.length - 1], [markets]);

  // Currently active selected market for the downstream AI Mode Decision, Trade Setup & Advanced Analysis
  const activeSelectedMarket = useMemo(() => {
    return markets.find(m => m.id === selectedAssetId) || xauMarket;
  }, [markets, selectedAssetId, xauMarket]);

  const isForexSelected = useMemo(() => {
    return forexMarkets.some(fx => fx.id === selectedAssetId);
  }, [forexMarkets, selectedAssetId]);

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
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col px-4 py-5 sm:py-6 pb-24 space-y-4">
        {/* Mobile App Header with Subtle 3D Globe */}
        <MobileAppHeader />

        {selectedAssetForSetup ? (
          /* STEP 2 to 5: DEDICATED AI SETUP PAGE */
          <AssetDetailView
            market={selectedAssetForSetup}
            onBack={() => setSelectedAssetForSetup(null)}
            onSelectOtherMarket={(m) => {
              setSelectedAssetForSetup(m);
              setSelectedAssetId(m.id);
            }}
          />
        ) : (
          /* TERMINAL WORKSPACE */
          <>
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
              <div className="space-y-4">
                {/* =========================================================================
                    1. ASSET SELECTION (TOP)
                    Show large asset cards:
                    XAU/USD
                    Silver
                    NASDAQ
                    S&P500
                    Oil
                    Forex
                    BTC
                ========================================================================= */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <div>
                        <h2 className="text-xs sm:text-sm font-mono-num font-black text-white uppercase tracking-wider">
                          1. ASSET SELECTION
                        </h2>
                        <span className="text-[10px] text-zinc-400 font-sans block">
                          Select an asset to calibrate AI trading mode & trade setup
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowAllPairs(!showAllPairs)}
                      className="text-[10.5px] font-mono-num font-bold text-amber-400/90 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-xl border border-amber-500/25 transition cursor-pointer"
                    >
                      {showAllPairs ? 'Show Core 7' : 'View All 11'}
                    </button>
                  </div>

                  {/* 7 Large Asset Cards */}
                  {!showAllPairs ? (
                    <div className="space-y-3 sm:space-y-3.5">
                      {/* 1. XAU/USD */}
                      <AssetCard
                        market={xauMarket}
                        index={0}
                        isSelected={selectedAssetId === 'xau-usd'}
                        onClick={() => setSelectedAssetId('xau-usd')}
                      />

                      {/* 2. Silver */}
                      <AssetCard
                        market={xagMarket}
                        index={1}
                        customTitle="Silver"
                        customSubtitle="Silver Spot (XAG/USD)"
                        isSelected={selectedAssetId === 'xag-usd'}
                        onClick={() => setSelectedAssetId('xag-usd')}
                      />

                      {/* 3. NASDAQ */}
                      <AssetCard
                        market={nasdaqMarket}
                        index={2}
                        customTitle="NASDAQ"
                        customSubtitle="NASDAQ 100 Index"
                        isSelected={selectedAssetId === 'nasdaq-100'}
                        onClick={() => setSelectedAssetId('nasdaq-100')}
                      />

                      {/* 4. S&P500 */}
                      <AssetCard
                        market={spMarket}
                        index={3}
                        customTitle="S&P500"
                        customSubtitle="S&P 500 Index"
                        isSelected={selectedAssetId === 'sp-500'}
                        onClick={() => setSelectedAssetId('sp-500')}
                      />

                      {/* 5. Oil */}
                      <AssetCard
                        market={oilMarket}
                        index={4}
                        customTitle="Oil"
                        customSubtitle="WTI Crude Oil Spot"
                        isSelected={selectedAssetId === 'crude-oil'}
                        onClick={() => setSelectedAssetId('crude-oil')}
                      />

                      {/* 6. Forex (with quick pair selector) */}
                      <AssetCard
                        market={activeForexMarket}
                        index={5}
                        customTitle="Forex"
                        customSubtitle={`${activeForexMarket.name} (${activeForexMarket.symbol})`}
                        isSelected={isForexSelected}
                        forexMarkets={forexMarkets}
                        onSelectForexPair={(fx) => {
                          setSelectedForexId(fx.id);
                          setSelectedAssetId(fx.id);
                        }}
                        onClick={() => setSelectedAssetId(selectedForexId)}
                      />

                      {/* 7. BTC */}
                      <AssetCard
                        market={btcMarket}
                        index={6}
                        customTitle="BTC"
                        customSubtitle="Bitcoin (BTC/USD)"
                        isSelected={selectedAssetId === 'btc-usd'}
                        onClick={() => setSelectedAssetId('btc-usd')}
                      />
                    </div>
                  ) : (
                    /* All Pairs with Category Filters */
                    <div className="space-y-3">
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

                      <div className="space-y-3 sm:space-y-3.5">
                        {filteredMarkets.map((market, index) => (
                          <AssetCard
                            key={market.id}
                            market={market}
                            index={index}
                            isSelected={selectedAssetId === market.id}
                            onClick={() => setSelectedAssetId(market.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* =========================================================================
                    2. MOVE AI MODE DECISION PANEL BELOW ASSET SELECTION
                    Trading modes:
                    Scalping
                    Intraday
                    Swing
                ========================================================================= */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      <div>
                        <h2 className="text-xs sm:text-sm font-mono-num font-black text-white uppercase tracking-wider">
                          2. AI MODE DECISION PANEL
                        </h2>
                        <span className="text-[10px] text-zinc-400 font-sans block">
                          Calibrating execution mode for {activeSelectedMarket.symbol}
                        </span>
                      </div>
                    </div>
                  </div>

                  <ModeAnalysisPanel selectedAssetId={selectedAssetId} />
                </div>

                {/* =========================================================================
                    3. KEEP SCAN BEST TRADE BELOW THE AI MODE PANEL
                ========================================================================= */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10.5px] font-mono-num font-bold text-zinc-400 uppercase tracking-wider">
                      3. SCAN BEST TRADE
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono-num font-semibold">
                      Autonomous Market Radar
                    </span>
                  </div>
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
                </div>

                {/* =========================================================================
                    4 & 5. SHOW SELECTED ASSET SIGNAL AFTER THAT & ADVANCED ANALYSIS BELOW
                    4. BUY/SELL/WAIT, Entry, SL, TP, Timeframe, Confidence
                    5. SMC, Strategy Scores, Risk, News, Final AI Confidence
                ========================================================================= */}
                <div className="pt-2">
                  <SelectedAssetTradeFlow market={activeSelectedMarket} />
                </div>
              </div>
            ) : activeTab === 'WATCHLIST' ? (
              /* AI PRIORITY WATCHLIST VIEW */
              <AiWatchlistView
                onSelectMarket={(market) => {
                  setSelectedAssetId(market.id);
                  setActiveTab('SIGNALS');
                }}
                onOpenProfile={(assetId) => setSelectedProfileAssetId(assetId)}
              />
            ) : activeTab === 'RANKINGS' ? (
              /* AURUM MARKET RANKING VIEW */
              <div className="space-y-3.5">
                <AurumMarketRanking
                  onSelectMarket={(market) => {
                    setSelectedAssetId(market.id);
                    setActiveTab('SIGNALS');
                  }}
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
          </>
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
          initialViewMode="AI_SETUP"
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
              setSelectedAssetForSetup(m);
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
          setSelectedAssetForSetup(market);
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
          setSelectedAssetForSetup(market);
        }}
      />

      {/* Daily AI Market Brief Modal */}
      <DailyMarketBriefModal
        isOpen={isDailyBriefOpen}
        onClose={() => setIsDailyBriefOpen(false)}
        onSelectMarket={(market) => {
          setIsDailyBriefOpen(false);
          setSelectedAssetForSetup(market);
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

      {/* QA & Monitoring Control Center Modal */}
      <QaMonitorModal />

      {/* Sticky Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={selectedAssetForSetup ? 'SIGNALS' : activeTab === 'SIGNALS' ? 'HOME' : activeTab === 'HISTORY' ? 'HISTORY' : 'SIGNALS'}
        onTabChange={(tab) => {
          setSelectedAssetForSetup(null);
          if (tab === 'HOME' || tab === 'SIGNALS') {
            setActiveTab('SIGNALS');
          } else if (tab === 'HISTORY') {
            setActiveTab('HISTORY');
          }
        }}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenAccount={() => setIsUserDashboardOpen(true)}
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
