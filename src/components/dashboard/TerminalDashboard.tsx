import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Sparkles, LayoutDashboard, Eye } from 'lucide-react';
import { MarketItem, AiTradeSignal } from '../../types';
import { UserDashboard } from './UserDashboard';
import { AdminDashboard } from './AdminDashboard';
import { LiveMarketConnectionIndicator } from '../LiveMarketConnectionIndicator';

interface TerminalDashboardProps {
  markets: MarketItem[];
  signals: AiTradeSignal[];
  currentRole: 'ADMIN' | 'USER';
  onSelectMarket?: (market: MarketItem) => void;
  onNavigateTab?: (tabId: string) => void;
  onSendTelegram?: (signalId: string) => void;
}

export const TerminalDashboard: React.FC<TerminalDashboardProps> = ({
  markets,
  signals,
  currentRole,
  onSelectMarket,
  onNavigateTab,
  onSendTelegram
}) => {
  // For Admin role, allow previewing the User view
  const [adminViewMode, setAdminViewMode] = useState<'ADMIN' | 'USER_PREVIEW'>('ADMIN');

  const isAdmin = currentRole === 'ADMIN';

  return (
    <div className="space-y-4">
      {/* Live Market Data Feed Synchronization Bar */}
      <LiveMarketConnectionIndicator />

      {/* Admin Experience Switcher: Allows root admins to switch between Admin Systems and User Dashboard Preview */}
      {isAdmin && (
        <div className="p-2.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 font-bold hidden sm:inline">Active Dashboard Mode:</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-black text-[11px] border border-amber-500/40">
              {adminViewMode === 'ADMIN' ? 'ADMIN 7-SYSTEM VIEW' : 'USER EXPERIENCE PREVIEW'}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setAdminViewMode('ADMIN')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                adminViewMode === 'ADMIN'
                  ? 'bg-amber-500 text-black shadow-sm font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Systems</span>
            </button>

            <button
              onClick={() => setAdminViewMode('USER_PREVIEW')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                adminViewMode === 'USER_PREVIEW'
                  ? 'bg-sky-500 text-black shadow-sm font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Preview the exact simplified dashboard viewed by standard users"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>User Preview</span>
            </button>
          </div>
        </div>
      )}

      {/* Render Appropriate Dashboard View */}
      {isAdmin && adminViewMode === 'ADMIN' ? (
        <AdminDashboard
          markets={markets}
          signals={signals}
          onNavigateTab={onNavigateTab}
          onSelectMarket={onSelectMarket}
          onSendTelegram={onSendTelegram}
        />
      ) : (
        <UserDashboard
          markets={markets}
          signals={signals}
          onSelectMarket={onSelectMarket}
          onSendTelegram={onSendTelegram}
        />
      )}
    </div>
  );
};
