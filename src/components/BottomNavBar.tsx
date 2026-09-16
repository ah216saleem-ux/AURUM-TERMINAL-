import React from 'react';
import { Home, Zap, Radar, History, User } from 'lucide-react';
import { useMarket } from '../context/MarketContext';

interface BottomNavBarProps {
  activeTab: string;
  onTabChange: (tab: 'HOME' | 'SIGNALS' | 'SCANNER' | 'HISTORY' | 'ACCOUNT') => void;
  onOpenScanner: () => void;
  onOpenAccount: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  onOpenScanner,
  onOpenAccount
}) => {
  const { watchlistAssetIds } = useMarket();

  const handleNavClick = (tabKey: 'HOME' | 'SIGNALS' | 'SCANNER' | 'HISTORY' | 'ACCOUNT') => {
    if (tabKey === 'SCANNER') {
      onOpenScanner();
    } else if (tabKey === 'ACCOUNT') {
      onOpenAccount();
    } else {
      onTabChange(tabKey);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#07080d]/95 backdrop-blur-xl border-t border-amber-500/20 py-2 px-3 shadow-2xl">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1 font-mono-num text-[10px] font-bold">
        {/* 1. Home */}
        <button
          onClick={() => handleNavClick('HOME')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition cursor-pointer ${
            activeTab === 'HOME'
              ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
          }`}
        >
          <Home className={`w-4 h-4 mb-0.5 ${activeTab === 'HOME' ? 'text-amber-400' : 'text-zinc-400'}`} />
          <span className="truncate">Home</span>
        </button>

        {/* 2. Signals */}
        <button
          onClick={() => handleNavClick('SIGNALS')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition cursor-pointer ${
            activeTab === 'SIGNALS'
              ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
          }`}
        >
          <Zap className={`w-4 h-4 mb-0.5 ${activeTab === 'SIGNALS' ? 'text-amber-400' : 'text-zinc-400'}`} />
          <span className="truncate">Signals</span>
        </button>

        {/* 3. Scanner */}
        <button
          onClick={() => handleNavClick('SCANNER')}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition cursor-pointer text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 bg-zinc-900/80"
        >
          <Radar className="w-4 h-4 mb-0.5 text-amber-400 animate-pulse" />
          <span className="truncate">Scanner</span>
        </button>

        {/* 4. History */}
        <button
          onClick={() => handleNavClick('HISTORY')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition cursor-pointer ${
            activeTab === 'HISTORY'
              ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
          }`}
        >
          <History className={`w-4 h-4 mb-0.5 ${activeTab === 'HISTORY' ? 'text-amber-400' : 'text-zinc-400'}`} />
          <span className="truncate">History</span>
        </button>

        {/* 5. Account */}
        <button
          onClick={() => handleNavClick('ACCOUNT')}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition cursor-pointer text-zinc-400 hover:text-white hover:bg-zinc-900/50"
        >
          <User className="w-4 h-4 mb-0.5 text-amber-400" />
          <span className="truncate">Account</span>
        </button>
      </div>
    </div>
  );
};
