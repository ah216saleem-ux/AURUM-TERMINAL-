import React from 'react';
import { Home, Sparkles, Radar, History, User, Lock } from 'lucide-react';
import { useMarket } from '../context/MarketContext';

interface BottomNavBarProps {
  activeTab: 'HOME' | 'SIGNALS' | 'SCANNER' | 'HISTORY';
  isHistoryLocked?: boolean;
  onTabChange: (tab: 'HOME' | 'SIGNALS' | 'SCANNER' | 'HISTORY') => void;
  onOpenScanner: () => void;
  onOpenAccount: () => void;
  onLockedClick?: (moduleName: string) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  isHistoryLocked = false,
  onTabChange,
  onOpenScanner,
  onOpenAccount,
  onLockedClick
}) => {
  const { signals } = useMarket();
  const activeSignalsCount = signals.filter(s => s.status === 'ACTIVE').length;

  const handleNavClick = (tabKey: 'HOME' | 'SIGNALS' | 'SCANNER' | 'HISTORY') => {
    if (tabKey === 'HISTORY' && isHistoryLocked && onLockedClick) {
      onLockedClick('Trade History');
      return;
    }

    if (tabKey === 'SCANNER') {
      onOpenScanner();
    } else {
      onTabChange(tabKey);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#07080d]/95 backdrop-blur-xl border-t border-amber-500/20 py-1.5 px-2 shadow-2xl">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1 font-mono-num text-[10px] font-bold">
        {/* 1. Home / Terminal */}
        <button
          onClick={() => handleNavClick('HOME')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition cursor-pointer ${
            activeTab === 'HOME'
              ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
          }`}
        >
          <Home className={`w-4 h-4 mb-0.5 ${activeTab === 'HOME' ? 'text-amber-400' : 'text-zinc-400'}`} />
          <span className="truncate">Terminal</span>
        </button>

        {/* 2. Signals */}
        <button
          onClick={() => handleNavClick('SIGNALS')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition relative cursor-pointer ${
            activeTab === 'SIGNALS'
              ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
          }`}
        >
          {activeSignalsCount > 0 && (
            <span className="absolute top-1 right-3.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#07080d] animate-pulse" />
          )}
          <Sparkles className={`w-4 h-4 mb-0.5 ${activeTab === 'SIGNALS' ? 'text-amber-400' : 'text-zinc-400'}`} />
          <span className="truncate">Signals</span>
        </button>

        {/* 3. Scanner (Radar) */}
        <button
          onClick={() => handleNavClick('SCANNER')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition cursor-pointer ${
            activeTab === 'SCANNER'
              ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
          }`}
        >
          <Radar className={`w-4 h-4 mb-0.5 ${activeTab === 'SCANNER' ? 'text-amber-400' : 'text-zinc-400'}`} />
          <span className="truncate">Scanner</span>
        </button>

        {/* 4. History (with Lock Guard) */}
        <button
          onClick={() => handleNavClick('HISTORY')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition cursor-pointer ${
            activeTab === 'HISTORY'
              ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
          }`}
        >
          <div className="relative">
            <History className={`w-4 h-4 mb-0.5 ${activeTab === 'HISTORY' ? 'text-amber-400' : 'text-zinc-400'}`} />
            {isHistoryLocked && (
              <Lock className="w-2.5 h-2.5 text-amber-500 absolute -top-0.5 -right-2" />
            )}
          </div>
          <span className="truncate">History</span>
        </button>

        {/* 5. Account */}
        <button
          onClick={onOpenAccount}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition cursor-pointer text-zinc-400 hover:text-white hover:bg-zinc-900/50"
        >
          <User className="w-4 h-4 mb-0.5 text-amber-400" />
          <span className="truncate">Account</span>
        </button>
      </div>
    </div>
  );
};
