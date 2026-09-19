import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Send, 
  TrendingUp, 
  BarChart2, 
  Clock, 
  Radio, 
  Menu, 
  X, 
  Sparkles, 
  Bot, 
  Layers, 
  Calculator,
  Radar,
  History,
  User,
  Activity,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { userService } from '../services/userService';
import { LiveMarketConnectionIndicator } from './LiveMarketConnectionIndicator';

export const Header: React.FC = () => {
  const { 
    activeNav, 
    setActiveNav, 
    setIsTelegramModalOpen,
    setIsRealDataModalOpen,
    setIsUserDashboardOpen,
    setIsQaModalOpen,
    telegramSettings,
    scanMarket,
    isScanningMarket
  } = useMarket();

  const [currentTimeUTC, setCurrentTimeUTC] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [user, setUser] = useState(userService.getUser());
  const [role, setRole] = useState(userService.getRole());

  useEffect(() => {
    const unsub = userService.subscribe(() => {
      setUser(userService.getUser());
      setRole(userService.getRole());
    });
    return unsub;
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeUTC(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'assets', label: 'Assets', icon: Layers, targetId: 'asset-overview-section' },
    { id: 'timeframes', label: 'Timeframes', icon: Clock, targetId: 'timeframe-signals-section' },
    { id: 'signals', label: 'AI Signal & Strength', icon: Zap, targetId: 'ai-signals-section' },
    { id: 'history', label: 'Signal History', icon: History, targetId: 'ai-history-section' },
    { id: 'charts', label: 'Live Chart', icon: BarChart2, targetId: 'live-charts-section' },
    { id: 'risk', label: 'Risk & Chat', icon: Calculator, targetId: 'risk-assistant-section' }
  ];

  const handleNavClick = (id: string, targetId: string) => {
    setActiveNav(id);
    setIsMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#07080a]/90 backdrop-blur-xl border-b border-amber-500/20">
      {/* Top Ticker Bar: AI Telemetry & Status */}
      <div className="hidden sm:flex items-center justify-between px-4 sm:px-6 lg:px-8 py-1.5 text-[11px] font-mono-num bg-neutral-950 border-b border-zinc-900 text-zinc-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="font-semibold">AURUM AI SMC ENGINE:</span>
            <span className="text-emerald-400">ONLINE (5 ASSETS ACTIVE)</span>
          </div>
          <span className="text-zinc-700">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="text-zinc-300">TELEGRAM BOT:</span>
            <span className="text-emerald-400">READY ({telegramSettings.channelTag})</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{currentTimeUTC}</span>
          </div>
          <span className="text-zinc-700">•</span>
          <LiveMarketConnectionIndicator compact={true} />
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => handleNavClick('assets', 'asset-overview-section')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Custom Aurum "AT" Crest */}
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#1b1c22] to-[#0c0d12] border border-amber-500/40 flex items-center justify-center aurum-border-glow group-hover:border-amber-400 transition-all">
              <div className="relative flex flex-col items-center justify-center">
                <span className="font-cinzel text-xl sm:text-2xl font-bold tracking-tighter bg-gradient-to-b from-[#FFF2A3] via-[#D4AF37] to-[#8C6914] bg-clip-text text-transparent">
                  AT
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-syne text-lg sm:text-xl font-bold tracking-wider text-white">
                  AURUM <span className="text-amber-400 font-light">TERMINAL</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono-num font-bold text-amber-300">
                  AI
                </span>
              </div>
              <span className="text-[10px] font-cinzel text-zinc-400 tracking-widest uppercase">
                Global Markets. Live Intelligence.
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center p-1 rounded-xl bg-neutral-900/80 border border-zinc-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.targetId)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-num font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-black shadow-md font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-amber-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action: Scan Market, Telegram Quick Wire & User Profile */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQaModalOpen(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-amber-500/40 text-amber-400 text-xs font-bold font-mono-num flex items-center gap-1.5 transition cursor-pointer shadow-md"
              title="Open QA & Live Monitoring Control Center"
            >
              <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden xl:inline">QA & Monitor</span>
            </button>

            <button
              onClick={() => scanMarket()}
              disabled={isScanningMarket}
              className="px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-300 text-xs font-bold font-mono-num flex items-center gap-1.5 transition cursor-pointer shadow-md disabled:opacity-50"
            >
              <Radar className={`w-3.5 h-3.5 text-amber-400 ${isScanningMarket ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isScanningMarket ? 'Scanning...' : 'Scan'}</span>
            </button>

            <button
              onClick={() => setIsTelegramModalOpen(true)}
              className="px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] hover:brightness-110 text-black text-xs font-bold font-mono-num flex items-center gap-2 shadow-lg shadow-amber-500/10 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-black" />
              <span className="hidden xl:inline">Telegram Signal Wire</span>
              <span className="xl:hidden hidden sm:inline">Telegram</span>
            </button>

            {/* USER PROFILE & ROLE BADGE DISPLAY */}
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-zinc-800">
              <button
                onClick={() => setIsUserDashboardOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 hover:border-amber-500/40 transition cursor-pointer shadow-sm"
                title="Open Account & Settings"
              >
                <div className="w-5 h-5 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <User className="w-3 h-3 text-amber-400" />
                </div>
                <span className="text-xs font-mono font-bold text-zinc-200 hidden md:inline">
                  @{user?.username || 'user'}
                </span>
                {/* Role Badge */}
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase border flex items-center gap-1 ${
                    role === 'ADMIN'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  }`}
                >
                  {role === 'ADMIN' ? <ShieldCheck className="w-2.5 h-2.5 text-amber-400" /> : null}
                  {role}
                </span>
              </button>

              {/* Logout Button */}
              <button
                onClick={() => userService.logout()}
                className="p-2 rounded-xl bg-zinc-900/90 hover:bg-rose-500/20 border border-zinc-800 hover:border-rose-500/40 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                title="Logout from Terminal Session"
                aria-label="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden px-4 py-4 bg-neutral-950 border-b border-zinc-800 space-y-3">
          {/* User Profile in Mobile Dropdown */}
          <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <User className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-zinc-200">@{user?.username || 'user'}</p>
                <p className="text-[10px] text-zinc-400 font-mono">{user?.email}</p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase border flex items-center gap-1 ${
                role === 'ADMIN'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
              }`}
            >
              {role === 'ADMIN' ? <ShieldCheck className="w-3 h-3 text-amber-400" /> : null}
              {role}
            </span>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.targetId)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-mono-num font-medium transition ${
                    isActive
                      ? 'bg-amber-500 text-black font-bold'
                      : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-amber-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center gap-2">
            <button
              onClick={() => {
                setIsUserDashboardOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono font-bold text-center border border-zinc-800"
            >
              Account Settings
            </button>
            <button
              onClick={() => {
                userService.logout();
                setIsMobileMenuOpen(false);
              }}
              className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-400 text-xs font-mono font-bold flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
