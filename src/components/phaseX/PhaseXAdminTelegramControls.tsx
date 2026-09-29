import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  UserPlus, 
  Trash2, 
  Clock, 
  Target, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Terminal, 
  Users, 
  Sliders,
  Zap,
  Radio
} from 'lucide-react';

interface AdminRecipient {
  chatId: string;
  name?: string;
  username?: string;
  role: 'PRIMARY_ADMIN' | 'CO_ADMIN' | 'SUBSCRIBER';
  addedAt: number;
}

interface DynamicSettings {
  cooldownMinutes: number;
  tp1: number;
  tp2: number;
  slMin: number;
  slMax: number;
}

export const PhaseXAdminTelegramControls: React.FC = () => {
  const [admins, setAdmins] = useState<AdminRecipient[]>([]);
  const [settings, setSettings] = useState<DynamicSettings>({
    cooldownMinutes: 30,
    tp1: 7.00,
    tp2: 10.00,
    slMin: 8.00,
    slMax: 10.00
  });

  const [n8nWebhookUrl, setN8nWebhookUrl] = useState('');
  const [newChatId, setNewChatId] = useState('');
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingN8n, setIsTestingN8n] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/phase-x/telegram-admins');
      const data = await res.json();
      if (data.success) {
        if (data.admins) setAdmins(data.admins);
        if (data.settings) setSettings(data.settings);
      }

      const statusRes = await fetch('/api/phase-x/telegram-status');
      const statusData = await statusRes.json();
      if (statusData.n8nWebhookUrlPreview) {
        setN8nWebhookUrl(statusData.n8nWebhookUrlPreview.replace('...', ''));
      }
    } catch {
      console.warn('Error fetching admin telegram data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveN8nWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch('/api/phase-x/telegram-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n8nWebhookUrl: n8nWebhookUrl.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: 'N8N Webhook URL updated successfully!' });
      } else {
        setFeedbackMsg({ type: 'error', text: 'Failed to update N8N Webhook URL.' });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Error connecting to server.' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  const handleTestN8nWebhook = async () => {
    setIsTestingN8n(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch('/api/phase-x/test-n8n-webhook', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Test signal successfully accepted by n8n Webhook (HTTP ${data.status || 200})!` });
      } else {
        setFeedbackMsg({ type: 'error', text: `N8N Test Failed: ${data.error || 'Check webhook URL'}` });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Failed to dispatch test payload to N8N webhook.' });
    } finally {
      setIsTestingN8n(false);
      setTimeout(() => setFeedbackMsg(null), 6000);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatId.trim()) return;
    
    setIsLoading(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch('/api/phase-x/telegram-admins/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: newChatId.trim(),
          name: newName.trim() || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Admin added! Welcome notification sent to Chat ID: ${newChatId}` });
        setNewChatId('');
        setNewName('');
        if (data.admins) setAdmins(data.admins);
      } else {
        setFeedbackMsg({ type: 'error', text: data.message || 'Failed to add admin.' });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Network error adding admin.' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  const handleRemoveAdmin = async (chatId: string) => {
    if (!window.confirm(`Are you sure you want to remove Chat ID: ${chatId}?`)) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/phase-x/telegram-admins/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId })
      });
      const data = await res.json();
      if (data.admins) setAdmins(data.admins);
      setFeedbackMsg({ type: 'success', text: `Admin ${chatId} removed.` });
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Error removing admin.' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleUpdateCooldown = async (mins: number) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/phase-x/admin-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cooldownMinutes: mins })
      });
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        setFeedbackMsg({ type: 'success', text: `Cooldown updated to ${mins} minutes for all subsequent trades!` });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Error updating cooldown.' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleUpdateTargets = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/phase-x/admin-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        setFeedbackMsg({ type: 'success', text: `Target levels calibrated successfully!` });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Error saving target levels.' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6 font-mono text-sm">
      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
        }`}>
          {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-[#12161C] border border-[#1E252E] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-white font-bold flex items-center gap-2">
              Telegram Bot Admin Control Center
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                @Aurumterminal_bot
              </span>
            </h4>
            <p className="text-xs text-zinc-400">
              Multi-Admin signal distribution & two-way remote bot commands.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-xl bg-[#1E252E] hover:bg-[#2A3441] text-zinc-300 flex items-center gap-1.5 text-xs font-bold transition-all self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Quick Cooldown Switcher (5m, 10m, 15m, 30m) */}
      <div className="bg-[#12161C] border border-[#1E252E] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4 text-[#D4AF37]" />
            <span>Post-Trade Cooldown Period</span>
          </div>
          <span className="text-xs text-[#D4AF37] font-bold">
            Current: {settings.cooldownMinutes} Minutes
          </span>
        </div>
        <p className="text-xs text-zinc-400">
          Cooldown enforces a waiting window after TP or SL hit to let the market settle before scanning the next 15M trade.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {[5, 10, 15, 30].map(mins => {
            const isSelected = settings.cooldownMinutes === mins;
            return (
              <button
                key={mins}
                onClick={() => handleUpdateCooldown(mins)}
                disabled={isLoading}
                className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-2 ${
                  isSelected
                    ? 'bg-[#D4AF37]/25 text-[#D4AF37] border-[#D4AF37] shadow-sm shadow-[#D4AF37]/20'
                    : 'bg-[#161C24] text-zinc-400 border-[#1E252E] hover:border-zinc-700 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{mins} Minutes</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target & Stop Loss Settings */}
      <form onSubmit={handleUpdateTargets} className="bg-[#12161C] border border-[#1E252E] rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Calibrated Target & Stop Loss Parameters</span>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all"
          >
            Save Targets
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* 1st TP */}
          <div className="bg-[#161C24] border border-[#1E252E] p-3 rounded-xl space-y-1.5">
            <label className="text-zinc-400 block font-bold">1st Take Profit (TP1)</label>
            <div className="flex items-center gap-2">
              <span className="text-[#D4AF37] font-bold">$</span>
              <input
                type="number"
                step="0.5"
                min="3"
                max="30"
                value={settings.tp1}
                onChange={e => setSettings({ ...settings, tp1: parseFloat(e.target.value) || 7 })}
                className="w-full bg-[#0B0D10] border border-[#1E252E] rounded-lg px-2.5 py-1.5 text-white font-bold"
              />
            </div>
            <span className="text-[10px] text-zinc-500">{(settings.tp1 * 10).toFixed(0)} Pips (+50% Partial Close & BE)</span>
          </div>

          {/* 2nd TP */}
          <div className="bg-[#161C24] border border-[#1E252E] p-3 rounded-xl space-y-1.5">
            <label className="text-zinc-400 block font-bold">2nd Take Profit (TP2)</label>
            <div className="flex items-center gap-2">
              <span className="text-[#D4AF37] font-bold">$</span>
              <input
                type="number"
                step="0.5"
                min="5"
                max="50"
                value={settings.tp2}
                onChange={e => setSettings({ ...settings, tp2: parseFloat(e.target.value) || 10 })}
                className="w-full bg-[#0B0D10] border border-[#1E252E] rounded-lg px-2.5 py-1.5 text-white font-bold"
              />
            </div>
            <span className="text-[10px] text-zinc-500">{(settings.tp2 * 10).toFixed(0)} Pips (Full Target Close)</span>
          </div>

          {/* Stop Loss Range */}
          <div className="bg-[#161C24] border border-[#1E252E] p-3 rounded-xl space-y-1.5">
            <label className="text-zinc-400 block font-bold">Stop Loss Range (SL)</label>
            <div className="flex items-center gap-1.5">
              <span className="text-rose-400 font-bold">$</span>
              <input
                type="number"
                step="0.5"
                min="4"
                max="25"
                value={settings.slMin}
                onChange={e => setSettings({ ...settings, slMin: parseFloat(e.target.value) || 8 })}
                className="w-16 bg-[#0B0D10] border border-[#1E252E] rounded-lg px-2 py-1.5 text-white text-center font-bold"
              />
              <span className="text-zinc-500">-</span>
              <input
                type="number"
                step="0.5"
                min="4"
                max="25"
                value={settings.slMax}
                onChange={e => setSettings({ ...settings, slMax: parseFloat(e.target.value) || 10 })}
                className="w-16 bg-[#0B0D10] border border-[#1E252E] rounded-lg px-2 py-1.5 text-white text-center font-bold"
              />
            </div>
            <span className="text-[10px] text-zinc-500">{(settings.slMin * 10).toFixed(0)} to {(settings.slMax * 10).toFixed(0)} Pips Dynamic SL</span>
          </div>
        </div>
      </form>

      {/* Admin Recipients Distribution List */}
      <div className="bg-[#12161C] border border-[#1E252E] rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
            <Users className="w-4 h-4 text-[#D4AF37]" />
            <span>Registered Admin Telegram Recipients ({admins.length})</span>
          </div>
        </div>

        <div className="space-y-2">
          {admins.map((admin, idx) => (
            <div key={admin.chatId} className="bg-[#161C24] border border-[#1E252E] p-3 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#D4AF37] w-5">{idx + 1}.</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-xs">{admin.name || 'Admin'}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#1E252E] text-zinc-400">
                      ID: {admin.chatId}
                    </span>
                    {admin.username && (
                      <span className="text-xs text-blue-400">@{admin.username}</span>
                    )}
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                      {admin.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    Registered: {new Date(admin.addedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {admin.chatId !== '7124285012' && (
                <button
                  onClick={() => handleRemoveAdmin(admin.chatId)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Remove Admin"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add New Admin Form */}
        <form onSubmit={handleAddAdmin} className="bg-[#0B0D10] border border-[#1E252E] p-3 rounded-xl flex flex-col sm:flex-row items-center gap-2.5">
          <input
            type="text"
            placeholder="Telegram Chat ID (e.g. 7124285012)"
            value={newChatId}
            onChange={e => setNewChatId(e.target.value)}
            className="w-full sm:w-1/2 bg-[#161C24] border border-[#1E252E] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500"
          />
          <input
            type="text"
            placeholder="Admin Name (Optional)"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="w-full sm:w-1/3 bg-[#161C24] border border-[#1E252E] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500"
          />
          <button
            type="submit"
            disabled={isLoading || !newChatId.trim()}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#B89628] text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Admin</span>
          </button>
        </form>
      </div>

      {/* N8N Webhook Workflow Integration */}
      <div className="bg-[#12161C] border border-[#1E252E] rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
            <Radio className="w-4 h-4 text-[#D4AF37]" />
            <span>n8n AI Analysis & Webhook Integration</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-bold">
            Railway → n8n → Telegram
          </span>
        </div>
        <p className="text-xs text-zinc-400">
          When configured, each approved trading signal and lifecycle update JSON payload is forwarded directly to your n8n Webhook workflow (for AI analysis, validation, CRM, or custom routing).
        </p>

        <form onSubmit={handleSaveN8nWebhook} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <input
              type="url"
              placeholder="https://your-n8n.com/webhook/aurum-signal (or set N8N_WEBHOOK_URL env)"
              value={n8nWebhookUrl}
              onChange={e => setN8nWebhookUrl(e.target.value)}
              className="w-full bg-[#161C24] border border-[#1E252E] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 font-mono"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#B89628] text-black font-bold text-xs transition-all disabled:opacity-50"
              >
                Save URL
              </button>
              <button
                type="button"
                onClick={handleTestN8nWebhook}
                disabled={isTestingN8n || !n8nWebhookUrl.trim()}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#1E252E] hover:bg-[#2A3441] text-zinc-200 border border-[#2A3441] font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Zap className={`w-3.5 h-3.5 text-amber-400 ${isTestingN8n ? 'animate-spin' : ''}`} />
                <span>Test Webhook</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Two-Way Telegram Bot Interactive Commands Guide */}
      <div className="bg-[#12161C] border border-[#1E252E] rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Remote Telegram Bot Interactive Commands</span>
        </div>
        <p className="text-xs text-zinc-400">
          Admins can send any of the following commands directly to <strong>@Aurumterminal_bot</strong> on Telegram to manage trades and system settings in real time:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
          <div className="bg-[#161C24] border border-[#1E252E] p-2.5 rounded-xl">
            <span className="text-[#D4AF37] font-bold">/status</span>
            <p className="text-zinc-400 text-[11px] mt-0.5">Returns live Gold spot price, active trade details, cooldown & scanner state.</p>
          </div>
          <div className="bg-[#161C24] border border-[#1E252E] p-2.5 rounded-xl">
            <span className="text-emerald-400 font-bold">/scan</span>
            <p className="text-zinc-400 text-[11px] mt-0.5">Triggers immediate 15M candle scan on MT5 feed & returns setup result.</p>
          </div>
          <div className="bg-[#161C24] border border-[#1E252E] p-2.5 rounded-xl">
            <span className="text-amber-400 font-bold">/cooldown &lt;mins&gt;</span>
            <p className="text-zinc-400 text-[11px] mt-0.5">Updates post-trade cooldown (e.g. <code>/cooldown 5</code> or <code>/cooldown 30</code>).</p>
          </div>
          <div className="bg-[#161C24] border border-[#1E252E] p-2.5 rounded-xl">
            <span className="text-blue-400 font-bold">/tp &lt;tp1&gt; &lt;tp2&gt;</span>
            <p className="text-zinc-400 text-[11px] mt-0.5">Updates TP levels (e.g. <code>/tp 7 10</code> for $7 and $10 targets).</p>
          </div>
          <div className="bg-[#161C24] border border-[#1E252E] p-2.5 rounded-xl">
            <span className="text-purple-400 font-bold">/sl &lt;min&gt; &lt;max&gt;</span>
            <p className="text-zinc-400 text-[11px] mt-0.5">Calibrates SL range (e.g. <code>/sl 8 10</code> for $8-$10 stop loss).</p>
          </div>
          <div className="bg-[#161C24] border border-[#1E252E] p-2.5 rounded-xl">
            <span className="text-rose-400 font-bold">/cancel</span>
            <p className="text-zinc-400 text-[11px] mt-0.5">Force closes/cancels the current active trade & clears cooldown.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
