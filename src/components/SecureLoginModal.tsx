import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  Key, 
  Terminal, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { userService } from '../services/userService';
import { UserAccountTier } from '../types';

interface SecureLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SecureLoginModal: React.FC<SecureLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [email, setEmail] = useState('a.h216saleem@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [tier, setTier] = useState<UserAccountTier>('INSTITUTIONAL_PRO');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      try {
        userService.login(email, password, 'ADMIN', true);
        setIsLoading(false);
        onSuccess();
      } catch (err) {
        setIsLoading(false);
        setErrorMessage('Authentication handshake failed. Please verify credentials.');
      }
    }, 600);
  };

  const handleInstantDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      userService.login('institutional.demo', 'demo-key', 'ADMIN', true);
      setIsLoading(false);
      onSuccess();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0a0d17] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-20 bg-amber-500/20 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/80 bg-[#0d101d]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-cinzel tracking-wider">
                SECURE ACCESS PORTAL
              </h2>
              <span className="text-[10px] font-mono text-zinc-400 block -mt-0.5">
                AURUM Terminal Authentication
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-sans text-xs">
          
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Account Tier Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Select Institutional Tier
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTier('INSTITUTIONAL_PRO')}
                className={`p-2.5 rounded-xl border text-left font-mono-num transition cursor-pointer ${
                  tier === 'INSTITUTIONAL_PRO'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="font-bold text-xs block text-white">Institutional Pro</span>
                <span className="text-[9.5px] text-zinc-400 block mt-0.5">Full Market Feed</span>
              </button>

              <button
                type="button"
                onClick={() => setTier('VIP_ELITE')}
                className={`p-2.5 rounded-xl border text-left font-mono-num transition cursor-pointer ${
                  tier === 'VIP_ELITE'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="font-bold text-xs block text-white">VIP Family Office</span>
                <span className="text-[9.5px] text-zinc-400 block mt-0.5">Custom Thresholds</span>
              </button>
            </div>
          </div>

          {/* Email / Operator ID */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Operator Email / Identity
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-zinc-800 focus:border-amber-500/60 text-zinc-100 placeholder:text-zinc-600 outline-none text-xs font-mono"
                placeholder="analyst@fund.com"
              />
            </div>
          </div>

          {/* Access Key / Password */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Passkey / Security Token
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-zinc-800 focus:border-amber-500/60 text-zinc-100 placeholder:text-zinc-600 outline-none text-xs font-mono"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-500 shadow-lg shadow-amber-500/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2 font-mono">
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  AUTHENTICATING...
                </span>
              ) : (
                <>
                  <span>LOGIN TO LIVE TERMINAL</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Access */}
            <button
              type="button"
              onClick={handleInstantDemo}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-semibold text-zinc-300 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>One-Click Institutional Demo Access</span>
            </button>
          </div>

          {/* Security Disclaimer */}
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Zero-Knowledge TLS Handshake
            </span>
            <span>256-BIT AES</span>
          </div>

        </form>

      </div>
    </div>
  );
};
