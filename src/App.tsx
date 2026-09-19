/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
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
import { PaperTradingDashboardView } from './components/PaperTradingDashboardView';
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
import { ValidationMonitoringDashboardView } from './components/ValidationMonitoringDashboardView';
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
  BookOpen,
  BarChart3,
  Globe,
  User,
  LogOut,
  Lock,
  Compass,
  Cpu
} from 'lucide-react';
import { GannIntradayEnginePanel } from './components/GannIntradayEnginePanel';
import { MasterIntelligenceView } from './components/MasterIntelligenceView';
import { InstitutionalLandingPage } from './components/InstitutionalLandingPage';
import { SecureLoginPage } from './components/SecureLoginPage';
import { AdminManagementPanel } from './components/AdminManagementPanel';
import { TerminalDashboard } from './components/dashboard/TerminalDashboard';
import { userService } from './services/userService';

function MainApp() {
  const { 
    markets, 
    signals,
    sendSignalToTelegram,
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
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'MASTER' | 'SIGNALS' | 'GANN' | 'PAPER' | 'VALIDATION' | 'SCANNER' | 'NEWS' | 'RISK' | 'LEARNING' | 'HISTORY'>('DASHBOARD');
  const [categoryFilter, setCategoryFilter] = useState<MarketCategory | 'all'>('all');
  
  // Persistent Login & Direct Access Protection State
  const [viewMode, setViewMode] = useState<'LANDING' | 'LOGIN' | 'TERMINAL'>(() => {
    if (userService.isAuthenticated()) {
      return 'TERMINAL'; // Valid 7-day session: skip login screen and open terminal directly
    }
    if (userService.getExpiredNotice()) {
      return 'LOGIN'; // Show session expired notice
    }
    return 'LANDING';
  });

  const [currentUser, setCurrentUser] = useState(userService.getUser());
  const [currentRole, setCurrentRole] = useState(userService.getRole());

  // Listen to session changes & enforce direct route access protection
  useEffect(() => {
    const unsub = userService.subscribe(() => {
      const isAuth = userService.isAuthenticated();
      setCurrentUser(userService.getUser());
      setCurrentRole(userService.getRole());
      if (!isAuth && viewMode === 'TERMINAL') {
        setViewMode('LOGIN');
      }
    });
    return unsub;
  }, [viewMode]);

  useEffect(() => {
    // Direct URL protection: Block direct terminal access without valid session
    if (viewMode === 'TERMINAL' && !userService.isAuthenticated()) {
      setViewMode('LOGIN');
    }
  }, [viewMode]);

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

  if (viewMode === 'LANDING') {
    return (
      <InstitutionalLandingPage
        onAccessTerminal={() => {
          if (userService.isAuthenticated()) {
            setViewMode('TERMINAL');
          } else {
            setViewMode('LOGIN');
          }
        }}
        onOpenLogin={() => setViewMode('LOGIN')}
        markets={markets}
      />
    );
  }

  if (viewMode === 'LOGIN') {
    return (
      <SecureLoginPage
        onLoginSuccess={() => setViewMode('TERMINAL')}
        onBackToLanding={() => setViewMode('LANDING')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* Institutional Top Switcher Bar */}
      <div className="sticky top-0 z-30 bg-[#090b14]/95 backdrop-blur-md border-b border-amber-500/30 px-3 sm:px-4 py-2 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-amber-300">AURUM LIVE TERMINAL</span>
          <span className="hidden sm:inline text-zinc-400 text-[11px]">• 7-Day Session Active</span>
        </div>

        {/* User Profile, Role Badge & Logout Controls */}
        <div className="flex items-center gap-2">
          {currentRole === 'ADMIN' && (
            <button
              onClick={() => setIsAdminPanelOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 transition flex items-center gap-1.5 font-bold cursor-pointer shadow-sm"
              title="Open Production Database & Health Admin Panel"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Prod Admin</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700/80">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-200 font-bold hidden sm:inline">@{currentUser?.username || 'user'}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase border flex items-center gap-1 ${
                currentRole === 'ADMIN'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
              }`}
            >
              {currentRole === 'ADMIN' ? <ShieldCheck className="w-2.5 h-2.5 text-amber-400" /> : null}
              {currentRole}
            </span>
          </div>

          <button
            onClick={() => userService.logout()}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-rose-500/20 border border-zinc-700 hover:border-rose-500/40 text-zinc-300 hover:text-rose-400 transition flex items-center gap-1 cursor-pointer"
            title="Logout from Terminal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>

          <button
            onClick={() => setViewMode('LANDING')}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-amber-500/50 text-zinc-300 hover:text-amber-300 transition flex items-center gap-1 cursor-pointer"
            title="Return to Public Landing Page"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Public Portal</span>
          </button>
        </div>
      </div>

      {/* Centered Mobile-First Container */}
      <div className="w-full max-w-xl lg:max-w-4xl mx-auto flex-1 flex flex-col px-3 sm:px-4 py-4 sm:py-5 pb-24 space-y-4">
        {/* Mobile App Header with Subtle 3D Globe */}
        <MobileAppHeader />

        {selectedAssetForSetup ? (
          /* SELECTED PAIR VIEW: DEDICATED TRADING VIEW FOR THE PAIR */
          <AssetDetailView
            market={markets.find(m => m.id === selectedAssetForSetup.id) || selectedAssetForSetup}
            onBack={() => setSelectedAssetForSetup(null)}
            onSelectOtherMarket={(m) => {
              const liveM = markets.find(item => item.id === m.id) || m;
              setSelectedAssetForSetup(liveM);
              setSelectedAssetId(liveM.id);
            }}
          />
        ) : (
          /* MAIN TERMINAL WORKSPACE */
          <>
            {/* Core Navigation Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-[10.5px] font-mono-num font-bold">
              {[
                { id: 'DASHBOARD', label: 'Dashboard', icon: Zap, adminOnly: false },
                { id: 'MASTER', label: 'Master Intelligence', icon: Cpu, adminOnly: false },
                { id: 'SIGNALS', label: 'Signals', icon: Sparkles, adminOnly: false },
                { id: 'GANN', label: 'Gann Intraday', icon: Compass, adminOnly: false },
                { id: 'PAPER', label: 'Paper Trading', icon: BarChart3, adminOnly: true },
                { id: 'VALIDATION', label: 'Validation & Health', icon: ShieldAlert, adminOnly: true },
                { id: 'SCANNER', label: 'Scanner', icon: Radar, adminOnly: false },
                { id: 'NEWS', label: 'News', icon: Newspaper, adminOnly: false },
                { id: 'RISK', label: 'Risk Management', icon: ShieldCheck, adminOnly: true },
                { id: 'LEARNING', label: 'AI Learning', icon: BrainCircuit, adminOnly: true },
                { id: 'HISTORY', label: 'Trade History', icon: History, adminOnly: true }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isLockedForUser = tab.adminOnly && currentRole === 'USER';

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-3.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer text-center whitespace-nowrap border ${
                      isActive
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black font-extrabold shadow-md shadow-amber-500/25 border-amber-300/40'
                        : isLockedForUser
                          ? 'bg-zinc-950/40 text-zinc-500 border-zinc-900/60 hover:text-zinc-400 hover:border-zinc-800'
                          : 'bg-zinc-950/80 text-zinc-400 border-zinc-900 hover:text-white hover:bg-zinc-900/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                    {isLockedForUser && (
                      <Lock className="w-2.5 h-2.5 text-amber-500/70 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Role-Based Guard for USER on Admin Tabs */}
            {currentRole === 'USER' && ['PAPER', 'VALIDATION', 'RISK', 'LEARNING', 'HISTORY'].includes(activeTab) ? (
              <div className="p-8 my-4 rounded-2xl bg-[#0b0e18] border border-amber-500/30 text-center space-y-4 max-w-xl mx-auto shadow-2xl">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
                  <Lock className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white font-mono tracking-wide">
                    ADMIN PRIVILEGES REQUIRED
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Access to this module ({activeTab}) is restricted to institutional accounts with the <span className="font-mono font-bold text-amber-400">ADMIN</span> role.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[11px] font-mono text-zinc-400 text-left space-y-1.5">
                  <div className="flex justify-between items-center text-zinc-300 font-bold border-b border-zinc-800 pb-1.5">
                    <span>Active Account: @{currentUser?.username || 'user'}</span>
                    <span className="text-sky-400 px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-[10px]">
                      USER ROLE
                    </span>
                  </div>
                  <div className="text-emerald-400 font-semibold pt-1">✓ Allowed for USER:</div>
                  <div className="pl-2 text-zinc-300">• Live Market Dashboard & Asset Monitoring</div>
                  <div className="pl-2 text-zinc-300">• Market Intelligence (Radar Scanner)</div>
                  <div className="pl-2 text-zinc-300">• News Intelligence & Macro Feed</div>
                  <div className="pl-2 text-zinc-300">• AI Signal View & Confluence Checks</div>
                  <div className="text-rose-400 font-semibold pt-1.5">✗ Blocked for USER:</div>
                  <div className="pl-2 text-zinc-400">• Internal Controls & System QA Health</div>
                  <div className="pl-2 text-zinc-400">• Paper Trading Execution & Simulated Fills</div>
                  <div className="pl-2 text-zinc-400">• Dynamic Risk Management Parameters</div>
                  <div className="pl-2 text-zinc-400">• AI Model Learning Weights & Historical Audits</div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setActiveTab('DASHBOARD')}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition cursor-pointer"
                  >
                    Return to Live Market Dashboard
                  </button>
                  <button
                    onClick={() => {
                      userService.switchRole('ADMIN');
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black text-xs font-bold transition cursor-pointer shadow-md"
                  >
                    Switch to ADMIN Account (Ahmadf7)
                  </button>
                </div>
              </div>
            ) : activeTab === 'DASHBOARD' ? (
              /* AURUM TERMINAL: FINAL INTELLIGENCE DASHBOARD (USER & ADMIN VIEWS) */
              <TerminalDashboard
                markets={markets}
                signals={signals}
                currentRole={currentRole}
                onSelectMarket={(market) => {
                  setSelectedAssetId(market.id);
                  setSelectedAssetForSetup(market);
                }}
                onNavigateTab={(tabId) => {
                  setActiveTab(tabId as any);
                }}
                onSendTelegram={sendSignalToTelegram}
              />
            ) : activeTab === 'MASTER' ? (
              /* MASTER PERFORMANCE INTELLIGENCE ENGINE */
              <MasterIntelligenceView
                onSelectAsset={(assetId) => {
                  const m = markets.find(item => item.id === assetId);
                  if (m) {
                    setSelectedAssetId(m.id);
                    setSelectedAssetForSetup(m);
                  }
                }}
              />
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
            ) : activeTab === 'GANN' ? (
              /* GANN INTRADAY TIMING & PRICE ENGINE TAB */
              <div className="space-y-4">
                <GannIntradayEnginePanel
                  onOpenAssetDetail={(assetId) => {
                    const m = markets.find(item => item.id === assetId);
                    if (m) setSelectedAssetForSetup(m);
                  }}
                />
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
            ) : activeTab === 'PAPER' ? (
              /* PAPER TRADING TAB */
              <PaperTradingDashboardView />
            ) : activeTab === 'VALIDATION' ? (
              /* VALIDATION & HEALTH MONITORING TAB */
              <ValidationMonitoringDashboardView />
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
        onLogout={() => setViewMode('LANDING')}
      />

      {/* QA & Monitoring Control Center Modal */}
      <QaMonitorModal />

      {/* Production Admin Infrastructure & Health Panel Modal */}
      <AdminManagementPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
      />

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
