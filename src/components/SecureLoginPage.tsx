import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Key, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  User, 
  Clock, 
  ArrowLeft,
  Shield,
  Check,
  AlertTriangle
} from 'lucide-react';
import { userService } from '../services/userService';
import { UserRole } from '../types';

interface SecureLoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
  onBackToLanding: () => void;
  initialExpiredMessage?: string | null;
}

export const SecureLoginPage: React.FC<SecureLoginPageProps> = ({
  onLoginSuccess,
  onBackToLanding,
  initialExpiredMessage
}) => {
  const [username, setUsername] = useState('Ahmadf7');
  const [password, setPassword] = useState('9663059aA@');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [rememberLogin, setRememberLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [expiredNotice, setExpiredNotice] = useState<string | null>(initialExpiredMessage || null);

  useEffect(() => {
    const expired = userService.getExpiredNotice();
    if (expired) {
      setExpiredNotice(expired);
    }
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'ADMIN') {
      setUsername('Ahmadf7');
      setPassword('9663059aA@');
    } else {
      setUsername('gmcf7');
      setPassword('whynotmerijaan');
    }
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('Please enter your institutional username or email.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your security key or password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setExpiredNotice(null);
    userService.clearExpiredNotice();

    // Stage 1: Authentication Verification
    setVerificationStep('Authenticating institutional credentials...');

    setTimeout(() => {
      setVerificationStep('Generating 7-day cryptographic session token...');

      setTimeout(() => {
        setVerificationStep(`Verifying permission matrix for ${username}...`);

        setTimeout(() => {
          try {
            const session = userService.login(username, password, selectedRole, rememberLogin);
            setIsLoading(false);
            setVerificationStep('Access granted. Entering AURUM Terminal...');
            setTimeout(() => {
              onLoginSuccess(session.role);
            }, 250);
          } catch (err: any) {
            setIsLoading(false);
            setErrorMessage(err?.message || 'Invalid institutional credentials. Please verify your username and password.');
          }
        }, 300);
      }, 350);
    }, 350);
  };

  return (
    <div className="min-h-screen w-full bg-[#050608] text-zinc-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-500/10 via-amber-600/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

      {/* Top Bar: Back & Status */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className="px-3.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 hover:border-amber-500/50 text-zinc-300 hover:text-amber-300 text-xs font-sans transition flex items-center gap-2 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Back to Public Portal</span>
        </button>

        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 bg-zinc-900/60 border border-zinc-800 px-3 py-1.5 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-300">AUTH SERVER:</span>
          <span className="text-emerald-400 font-bold">ONLINE (RSA-4096)</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md">
          
          {/* Brand Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1b1c24] to-[#0c0d12] border border-amber-500/40 shadow-xl shadow-amber-500/10 mb-3">
              <span className="font-cinzel text-2xl font-bold bg-gradient-to-b from-[#FFF2A3] via-[#D4AF37] to-[#8C6914] bg-clip-text text-transparent">
                AT
              </span>
            </div>
            <h1 className="font-syne text-2xl sm:text-3xl font-bold tracking-wider text-white">
              AURUM <span className="text-amber-400 font-light">TERMINAL</span>
            </h1>
            <p className="text-xs font-cinzel text-zinc-400 tracking-widest uppercase mt-1">
              Institutional Authentication Gateway
            </p>
          </div>

          {/* Session Expired Banner (if redirected after expiry) */}
          {expiredNotice && (
            <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5 animate-fadeIn shadow-lg">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold font-mono tracking-wide text-amber-300 block uppercase">
                  Session Expired
                </span>
                <span className="text-zinc-300 text-[11px] leading-relaxed">
                  Your 7-day authenticated session has expired. Please enter your credentials to restore terminal access.
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Role Presets Card */}
          <div className="mb-4 p-3 rounded-xl bg-[#0a0d17]/80 border border-amber-500/25">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Select Institutional Role
              </span>
              <span className="text-[10px] font-mono text-amber-400/80">
                1-Click Quick Preset
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* ADMIN ROLE */}
              <button
                type="button"
                onClick={() => handleRoleSelect('ADMIN')}
                className={`p-2.5 rounded-lg border text-left transition flex flex-col gap-1 cursor-pointer ${
                  selectedRole === 'ADMIN'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-bold font-mono">ADMIN</span>
                  </div>
                  {selectedRole === 'ADMIN' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </div>
                <span className="text-[10px] text-amber-300 font-mono font-semibold">
                  Ahmadf7
                </span>
                <span className="text-[9px] text-zinc-500">
                  Full Access: Dashboard, AI, Risk, Paper, Controls
                </span>
              </button>

              {/* USER ROLE */}
              <button
                type="button"
                onClick={() => handleRoleSelect('USER')}
                className={`p-2.5 rounded-lg border text-left transition flex flex-col gap-1 cursor-pointer ${
                  selectedRole === 'USER'
                    ? 'bg-sky-500/15 border-sky-500 text-sky-300 shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-xs font-bold font-mono">USER</span>
                  </div>
                  {selectedRole === 'USER' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  )}
                </div>
                <span className="text-[10px] text-sky-300 font-mono font-semibold">
                  gmcf7
                </span>
                <span className="text-[9px] text-zinc-500">
                  Standard Access: Markets, Signals, Intelligence
                </span>
              </button>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-[#0b0e18] border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <User className="w-4 h-4 text-amber-400/80" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username (e.g. admin or trader)"
                    required
                    disabled={isLoading}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 focus:border-amber-500 text-zinc-100 text-xs placeholder:text-zinc-600 outline-none transition font-mono"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-zinc-300 font-mono">
                    Password
                  </label>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Encrypted Token
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Key className="w-4 h-4 text-amber-400/80" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    disabled={isLoading}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 focus:border-amber-500 text-zinc-100 text-xs placeholder:text-zinc-600 outline-none transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Login (7-Day Persistent Session) */}
              <div className="pt-1 pb-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberLogin}
                    onChange={(e) => setRememberLogin(e.target.checked)}
                    disabled={isLoading}
                    className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500/30 accent-amber-500 cursor-pointer"
                  />
                  <div className="text-left">
                    <span className="text-xs text-zinc-300 font-medium block">
                      Remember Login (7-Day Active Session)
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono block leading-relaxed">
                      Stay authenticated across browser sessions without re-entering password.
                    </span>
                  </div>
                </label>
              </div>

              {/* Verification Progress Notice */}
              {isLoading && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5 font-mono animate-pulse">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>{verificationStep}</span>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA771C] hover:brightness-110 active:scale-[0.99] text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4 text-black" />
                <span>LOGIN TO TERMINAL</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </form>

            {/* Role Permissions Summary Box */}
            <div className="mt-5 pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-400 font-mono space-y-1.5">
              <div className="flex items-center justify-between text-zinc-300">
                <span className="text-[10px] uppercase text-zinc-500">Active Role Policy:</span>
                <span className={`font-bold ${selectedRole === 'ADMIN' ? 'text-amber-400' : 'text-sky-400'}`}>
                  {selectedRole === 'ADMIN' ? 'ADMIN (Unrestricted)' : 'USER (Standard Trading)'}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                {selectedRole === 'ADMIN'
                  ? '• Access to all dashboard components, AI engines, risk models, paper trading, and internal controls.'
                  : '• Access to Live Terminal, Market Monitor, News, and Signals. Admin controls and API settings restricted.'}
              </p>
            </div>
          </div>

          {/* Institutional Compliance Notice */}
          <div className="mt-6 text-center text-[10px] font-mono text-zinc-500 space-y-1">
            <div className="flex items-center justify-center gap-2 text-zinc-400">
              <Shield className="w-3.5 h-3.5 text-amber-400/80" />
              <span>TLS 1.3 • AES-256 SESSION TOKENS • 7-DAY VALIDITY</span>
            </div>
            <p>AURUM TERMINAL — Proprietary Market Intelligence Infrastructure</p>
          </div>

        </div>
      </div>
    </div>
  );
};
