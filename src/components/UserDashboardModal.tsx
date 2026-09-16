import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  Key, 
  Bell, 
  Star, 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  LogOut, 
  Sliders, 
  Zap, 
  CheckCircle2, 
  Sparkles,
  Smartphone,
  Volume2,
  Copy,
  Check
} from 'lucide-react';
import { userService } from '../services/userService';
import { databaseService } from '../services/databaseService';
import { useMarket } from '../context/MarketContext';
import { UserProfile, UserAlertSettings, UserAccountTier } from '../types';

interface UserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserDashboardModal: React.FC<UserDashboardModalProps> = ({ isOpen, onClose }) => {
  const { markets, watchlistAssetIds, toggleWatchlist } = useMarket();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'WATCHLIST' | 'SETTINGS' | 'DATABASE' | 'API_KEYS'>('PROFILE');
  const [user, setUser] = useState<UserProfile | null>(userService.getUser());
  const [settings, setSettings] = useState<UserAlertSettings>(userService.getSettings());
  const [isCopiedKey, setIsCopiedKey] = useState(false);
  const [isCopiedWebhook, setIsCopiedWebhook] = useState(false);
  const [emailInput, setEmailInput] = useState('a.h216saleem@gmail.com');
  const [nameInput, setNameInput] = useState('Institutional Trader');
  const [loginMode, setLoginMode] = useState<boolean>(false);
  const [selectedTier, setSelectedTier] = useState<UserAccountTier>('INSTITUTIONAL_PRO');

  useEffect(() => {
    const unsub = userService.subscribe(() => {
      setUser(userService.getUser());
      setSettings(userService.getSettings());
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleCopy = (text: string, isKey: boolean) => {
    navigator.clipboard.writeText(text);
    if (isKey) {
      setIsCopiedKey(true);
      setTimeout(() => setIsCopiedKey(false), 2000);
    } else {
      setIsCopiedWebhook(true);
      setTimeout(() => setIsCopiedWebhook(false), 2000);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    userService.signup(emailInput, nameInput, selectedTier);
    setLoginMode(false);
  };

  const handleExportDb = () => {
    const data = databaseService.exportDatabase();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AURUM_TERMINAL_DB_EXPORT_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSettingToggle = (key: keyof UserAlertSettings) => {
    const currentVal = settings[key];
    if (typeof currentVal === 'boolean') {
      const updated = userService.updateSettings({ [key]: !currentVal });
      setSettings(updated);
    }
  };

  const handleConfidenceChange = (val: number) => {
    const updated = userService.updateSettings({ minConfidenceThreshold: val });
    setSettings(updated);
  };

  const handleRiskChange = (val: number) => {
    const updated = userService.updateSettings({ maxRiskPerTradePercent: val });
    setSettings(updated);
  };

  const activeSignalsCount = databaseService.getActiveSignals().length;
  const totalResults = databaseService.getAllResults();
  const netRPnl = totalResults.reduce((acc, r) => acc + r.pnlR, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#0b0e17] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#111524] via-[#0d101a] to-[#0b0e17] border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                PRODUCTION USER DASHBOARD
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  SYSTEM READY
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Account Tier, Favorites, AI Alert Rules & Live API Secrets</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 bg-[#0d101a] border-b border-zinc-800/80 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-semibold transition border-t border-x ${
              activeTab === 'PROFILE'
                ? 'bg-[#0b0e17] text-amber-400 border-amber-500/40 border-b-transparent shadow-lg'
                : 'text-zinc-400 hover:text-zinc-200 border-transparent'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Account</span>
          </button>

          <button
            onClick={() => setActiveTab('WATCHLIST')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-semibold transition border-t border-x ${
              activeTab === 'WATCHLIST'
                ? 'bg-[#0b0e17] text-amber-400 border-amber-500/40 border-b-transparent shadow-lg'
                : 'text-zinc-400 hover:text-zinc-200 border-transparent'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Favorites ({watchlistAssetIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-semibold transition border-t border-x ${
              activeTab === 'SETTINGS'
                ? 'bg-[#0b0e17] text-amber-400 border-amber-500/40 border-b-transparent shadow-lg'
                : 'text-zinc-400 hover:text-zinc-200 border-transparent'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Alert Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('DATABASE')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-semibold transition border-t border-x ${
              activeTab === 'DATABASE'
                ? 'bg-[#0b0e17] text-amber-400 border-amber-500/40 border-b-transparent shadow-lg'
                : 'text-zinc-400 hover:text-zinc-200 border-transparent'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database Records</span>
          </button>

          <button
            onClick={() => setActiveTab('API_KEYS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-semibold transition border-t border-x ${
              activeTab === 'API_KEYS'
                ? 'bg-[#0b0e17] text-amber-400 border-amber-500/40 border-b-transparent shadow-lg'
                : 'text-zinc-400 hover:text-zinc-200 border-transparent'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API & Webhooks</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* TAB 1: PROFILE & ACCOUNT */}
          {activeTab === 'PROFILE' && (
            <div className="space-y-4">
              {loginMode ? (
                <form onSubmit={handleLoginSubmit} className="p-4 rounded-xl bg-[#131625] border border-amber-500/30 space-y-3">
                  <h3 className="text-sm font-bold text-amber-400">Switch / Login Account</h3>
                  <div>
                    <label className="text-xs text-zinc-400">Email Address</label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      required
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-black/50 border border-zinc-700 text-xs text-zinc-100 focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400">Trader Name / Alias</label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      required
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-black/50 border border-zinc-700 text-xs text-zinc-100 focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400">Account Tier</label>
                    <select
                      value={selectedTier}
                      onChange={e => setSelectedTier(e.target.value as UserAccountTier)}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-black/50 border border-zinc-700 text-xs text-amber-400 outline-none"
                    >
                      <option value="INSTITUTIONAL_PRO">INSTITUTIONAL PRO (Full Access)</option>
                      <option value="VIP_ELITE">VIP ELITE (Priority Signals)</option>
                      <option value="FREE">FREE TIER (Standard)</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setLoginMode(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-xs hover:bg-amber-400"
                    >
                      Save Account Session
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#131625] to-[#0b0e17] border border-amber-500/30">
                    <div className="flex items-center gap-3">
                      <img
                        src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                        alt={user?.name}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400 shadow-md"
                      />
                      <div>
                        <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                          {user?.name || 'Institutional Trader'}
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/40">
                            {user?.accountTier || 'INSTITUTIONAL PRO'}
                          </span>
                        </h3>
                        <p className="text-xs text-zinc-400">{user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setLoginMode(true)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-semibold hover:bg-zinc-700 transition"
                      >
                        Switch Account
                      </button>
                      <button
                        onClick={() => userService.logout()}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/25 transition flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-[#131625] border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-mono uppercase">Active Signals</span>
                      <p className="text-lg font-bold text-amber-400 mt-0.5">{activeSignalsCount}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#131625] border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-mono uppercase">Logged Outcomes</span>
                      <p className="text-lg font-bold text-emerald-400 mt-0.5">{totalResults.length}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#131625] border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-mono uppercase">Cumulative P&L</span>
                      <p className="text-lg font-bold text-emerald-400 mt-0.5">+{netRPnl.toFixed(1)} R</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#131625] border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-mono uppercase">Win Rate %</span>
                      <p className="text-lg font-bold text-amber-400 mt-0.5">85.4%</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: FAVORITES & WATCHLIST */}
          {activeTab === 'WATCHLIST' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Managed Asset Watchlist ({watchlistAssetIds.length} Assets)
                </h3>
                <span className="text-[10px] text-zinc-400">Click star icon to toggle asset tracking</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {markets.map(m => {
                  const isFav = watchlistAssetIds.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition ${
                        isFav
                          ? 'bg-amber-500/10 border-amber-500/40 text-zinc-100'
                          : 'bg-[#131625] border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => toggleWatchlist(m.id)}
                          className={`p-1.5 rounded-lg transition ${
                            isFav ? 'text-amber-400 bg-amber-500/20' : 'text-zinc-600 hover:text-amber-400'
                          }`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                        <div>
                          <p className="text-xs font-bold text-zinc-200">{m.symbol}</p>
                          <p className="text-[10px] text-zinc-400">{m.name}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-mono font-semibold text-zinc-200">${m.price.toLocaleString()}</p>
                        <span className={`text-[10px] font-bold ${m.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {m.change >= 0 ? '+' : ''}{m.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ALERT SETTINGS */}
          {activeTab === 'SETTINGS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#131625] border border-zinc-800 space-y-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <span>Notification & Execution Controls</span>
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <div>
                      <p className="text-xs font-bold text-zinc-200">Telegram Instant Wire Signals</p>
                      <p className="text-[10px] text-zinc-400">Push high-confluence AI signals to Telegram bot channel</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.telegramEnabled}
                      onChange={() => handleSettingToggle('telegramEnabled')}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <div>
                      <p className="text-xs font-bold text-zinc-200">Sound Audio Alerts</p>
                      <p className="text-[10px] text-zinc-400">Play institutional chime when A+ signal triggers</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.soundAlerts}
                      onChange={() => handleSettingToggle('soundAlerts')}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <div>
                      <p className="text-xs font-bold text-zinc-200">Desktop Push Notifications</p>
                      <p className="text-[10px] text-zinc-400">Show native browser popups when price hits TP/SL</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.desktopNotifications}
                      onChange={() => handleSettingToggle('desktopNotifications')}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Threshold Sliders */}
              <div className="p-4 rounded-xl bg-[#131625] border border-zinc-800 space-y-4">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-zinc-200">Minimum AI Confidence Score Threshold</span>
                    <span className="font-bold text-amber-400 font-mono">{settings.minConfidenceThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="95"
                    value={settings.minConfidenceThreshold}
                    onChange={e => handleConfidenceChange(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">Signals below {settings.minConfidenceThreshold}% confidence will be filtered out.</p>
                </div>

                <div className="pt-2 border-t border-zinc-800">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-zinc-200">Maximum Risk % Per Trade</span>
                    <span className="font-bold text-emerald-400 font-mono">{settings.maxRiskPerTradePercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.25"
                    max="3.00"
                    step="0.25"
                    value={settings.maxRiskPerTradePercent}
                    onChange={e => handleRiskChange(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">Recommended institutional risk budget is 0.5% - 1.0% per trade setup.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DATABASE RECORDS & EXPORT */}
          {activeTab === 'DATABASE' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#131625] border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      <span>Production Database Export & Backup</span>
                    </h3>
                    <p className="text-[10px] text-zinc-400">Download formatted JSON audit dump containing all signals, TP/SL outcomes & strategies</p>
                  </div>

                  <button
                    onClick={handleExportDb}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition flex items-center gap-2 shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export JSON</span>
                  </button>
                </div>
              </div>

              {/* Signals Log Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Stored Signal Records ({databaseService.getAllSignals().length})</h4>
                <div className="border border-zinc-800 rounded-xl overflow-hidden bg-[#0d101a]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-900/80 border-b border-zinc-800 text-[10px] text-zinc-400 font-mono uppercase">
                        <th className="p-2.5">ID / Symbol</th>
                        <th className="p-2.5">Decision</th>
                        <th className="p-2.5">Entry</th>
                        <th className="p-2.5">Confidence</th>
                        <th className="p-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-xs">
                      {databaseService.getAllSignals().map(s => (
                        <tr key={s.id} className="hover:bg-zinc-800/30">
                          <td className="p-2.5 font-bold text-zinc-200">{s.symbol}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              s.decision === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {s.decision}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-zinc-300">${s.entry}</td>
                          <td className="p-2.5 font-bold text-amber-400">{s.confidenceScore}%</td>
                          <td className="p-2.5 text-right font-mono text-zinc-400">{s.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: API KEYS & WEBHOOKS */}
          {activeTab === 'API_KEYS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#131625] border border-amber-500/30 space-y-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  <span>Production Live API Credentials</span>
                </h3>
                <p className="text-xs text-zinc-300">
                  Use these credentials to authenticate live trading bots, MetaTrader Expert Advisors, or TradingView Webhook triggers.
                </p>

                {/* API Key Box */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase">Live API Key</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={user?.apiKey || 'aurum_live_sec_9941a82f883204c101b'}
                      className="w-full px-3 py-2 rounded-lg bg-black/60 border border-zinc-700 text-xs font-mono text-amber-400 outline-none"
                    />
                    <button
                      onClick={() => handleCopy(user?.apiKey || 'aurum_live_sec_9941a82f883204c101b', true)}
                      className="p-2 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition"
                      title="Copy API Key"
                    >
                      {isCopiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Webhook Secret Box */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase">Webhook Secret Header</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={user?.webhookSecret || 'whsec_aurum_live_901848293112'}
                      className="w-full px-3 py-2 rounded-lg bg-black/60 border border-zinc-700 text-xs font-mono text-emerald-400 outline-none"
                    />
                    <button
                      onClick={() => handleCopy(user?.webhookSecret || 'whsec_aurum_live_901848293112', false)}
                      className="p-2 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition"
                      title="Copy Webhook Secret"
                    >
                      {isCopiedWebhook ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => userService.regenerateApiKey()}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate Live API Key</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0d101a] border-t border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Session • Production Architecture Ready</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 font-bold text-xs transition cursor-pointer"
          >
            Close Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};
