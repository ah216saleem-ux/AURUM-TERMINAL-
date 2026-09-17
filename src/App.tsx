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
import { InlineScanner } from './components/InlineScanner';
import { AiSignalCenter } from './components/AiSignalCenter';
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
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'SIGNALS' | 'SCANNER' | 'NEWS' | 'RISK' | 'LEARNING' | 'HISTORY'>('DASHBOARD');
  const [categoryFilter, setCategoryFilter] = useState<MarketCategory | 'all'>('all');

  const [selectedAssetId, setSelectedAssetId] = useState<string>('xau-usd');
  const [selectedForexId, setSelectedForexId] = useState<string>('eur-usd');
  const [showAllPairs, setShowAllPairs] = useState<boolean>(false);

  // The 9 dashboard assets as specified by user requirements
  const dashboardMarkets = useMemo(() => {
    const ids = ['xau-usd', 'xag-usd', 'eur-usd', 'gbp-usd', 'usd-jpy', 'aud-usd', 'usd-cad', 'sp-500', 'nasdaq-100'];
    return ids.map(id => markets.find(m => m.id === id)).filter((m): m is MarketItem => !!m);
  }, [markets]);

  // Currently active selected market for backends
  const activeSelectedMarket = useMemo(() => {
    return markets.find(m => m.id === selectedAssetId) || dashboardMarkets[0] || INITIAL_MARKETS[0];
  }, [markets, selectedAssetId, dashboardMarkets]);

  const filteredMarkets = useMemo(() => {
    if (categoryFilter === 'all') return markets;
    return markets.filter(m => m.category === categoryFilter);
  }, [markets, categoryFilter]);

  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* Centered Mobile-First Container */}
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col px-4 py-5 sm:py-6 pb-24 space-y-4">
        {/* Mobile App Header with Subtle 3D Globe */}
        <MobileAppHeader />

        {selectedAssetForSetup ? (
          /* SELECTED PAIR VIEW: DEDICATED TRADING VIEW FOR THE PAIR */
          <AssetDetailView
            market={selectedAssetForSetup}
            onBack={() => setSelectedAssetForSetup(null)}
            onSelectOtherMarket={(m) => {
              setSelectedAssetForSetup(m);
              setSelectedAssetId(m.id);
            }}
          />
        ) : (
          /* MAIN TERMINAL WORKSPACE */
          <>
            {/* 7 Core Navigation Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-[10.5px] font-mono-num font-bold">
              {[
                { id: 'DASHBOARD', label: 'Dashboard', icon: Zap },
                { id: 'SIGNALS', label: 'Signals', icon: Sparkles },
                { id: 'SCANNER', label: 'Scanner', icon: Radar },
                { id: 'NEWS', label: 'News', icon: Newspaper },
                { id: 'RISK', label: 'Risk Management', icon: ShieldCheck },
                { id: 'LEARNING', label: 'AI Learning', icon: BrainCircuit },
                { id: 'HISTORY', label: 'Trade History', icon: History }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-3.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer text-center whitespace-nowrap border ${
                      isActive
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black font-extrabold shadow-md shadow-amber-500/25 border-amber-300/40'
                        : 'bg-zinc-950/80 text-zinc-400 border-zinc-900 hover:text-white hover:bg-zinc-900/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Workspace Content */}
            {activeTab === 'DASHBOARD' ? (
              /* MAIN DASHBOARD: SIMPLIFIED TARGET 9 ASSET LIST */
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h2 className="text-xs sm:text-sm font-mono-num font-black text-white uppercase tracking-wider">
                      PRIMARY ASSETS
                    </h2>
                    <span className="text-[10px] text-zinc-400 font-sans block">
                      Select any pair to open its dedicated AI trading terminal
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-xl text-[10px] font-bold text-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span>9 CORE MARKETS</span>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-3.5">
                  {dashboardMarkets.map((market, index) => (
                    <AssetCard
                      key={market.id}
                      market={market}
                      index={index}
                      isSelected={false}
                      onClick={() => {
                        setSelectedAssetId(market.id);
                        setSelectedAssetForSetup(market);
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : activeTab === 'SIGNALS' ? (
              /* SIGNALS TAB: INSTITUTIONAL SIGNAL CENTER */
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h2 className="text-xs sm:text-sm font-mono-num font-black text-white uppercase tracking-wider">
                      AI SIGNALS CONTROL
                    </h2>
                    <span className="text-[10px] text-zinc-400 font-sans block">
                      Institutional smart money live confluences
                    </span>
                  </div>
                </div>
                <AiSignalCenter />
              </div>
            ) : activeTab === 'SCANNER' ? (
              /* SCANNER TAB: AUTOMATED INLINE RADAR */
              <InlineScanner
                markets={markets}
                onOpenAssetChart={(market) => {
                  setSelectedAssetId(market.id);
                  setSelectedAssetForSetup(market);
                }}
              />
            ) : activeTab === 'NEWS' ? (
              /* NEWS TAB */
              <NewsIntelligenceView />
            ) : activeTab === 'RISK' ? (
              /* RISK MANAGEMENT TAB */
              <AiRiskControlView />
            ) : activeTab === 'LEARNING' ? (
              /* AI LEARNING TAB */
              <AiLearningBacktestView />
            ) : (
              /* TRADE HISTORY TAB */
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
        activeTab={
          selectedAssetForSetup 
            ? 'HOME' 
            : activeTab === 'DASHBOARD' 
              ? 'HOME' 
              : activeTab === 'SIGNALS' 
                ? 'SIGNALS' 
                : activeTab === 'HISTORY' 
                  ? 'HISTORY' 
                  : 'HOME'
        }
        onTabChange={(tab) => {
          setSelectedAssetForSetup(null);
          if (tab === 'HOME') {
            setActiveTab('DASHBOARD');
          } else if (tab === 'SIGNALS') {
            setActiveTab('SIGNALS');
          } else if (tab === 'HISTORY') {
            setActiveTab('HISTORY');
          }
        }}
        onOpenScanner={() => {
          setSelectedAssetForSetup(null);
          setActiveTab('SCANNER');
        }}
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
