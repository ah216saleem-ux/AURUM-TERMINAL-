import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Key, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  User, 
  ArrowLeft,
  Shield,
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('Please enter your username.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
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
        setVerificationStep('Verifying role permissions & access policies...');

        setTimeout(() => {
          try {
            const session = userService.login(username, password, selectedRole, rememberLogin);
            setIsLoading(false);
            setVerificationStep('Access granted. Entering AURUM Terminal...');
            setTimeout(() => {
              onLoginSuccess(session.role);
            }, 250);
          } catch {
            setIsLoading(false);
            setErrorMessage('Invalid username or password');
          }
        }, 300);
      }, 350);
    }, 350);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#050608] text-zinc-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200 relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[300px] sm:h-[400px] bg-gradient-to-b from-amber-500/10 via-amber-600/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-72 sm:w-96 h-72 sm:h-96 bg-amber-500/5 rounded-full blur-3xl" />

      {/* Top Bar: Back & Status */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className="px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 hover:border-amber-500/50 text-zinc-300 hover:text-amber-300 text-xs font-sans transition flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
          <span>Back to Portal</span>
        </button>

        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-zinc-400 bg-zinc-900/60 border border-zinc-800 px-2.5 py-1 rounded-xl">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline text-zinc-300">AUTH SERVER:</span>
          <span className="text-emerald-400 font-bold">ONLINE</span>
        </div>
      </div>

      {/* Main Container - Optimized for Single Mobile Viewport */}
      <div className="flex-1 flex items-center justify-center px-3 sm:px-4 py-2 sm:py-6 relative z-10 my-auto">
        <div className="w-full max-w-md">
          
          {/* Compact Brand Header */}
          <div className="text-center mb-3 sm:mb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#1b1c24] to-[#0c0d12] border border-amber-500/40 shadow-lg shadow-amber-500/10 mb-1.5 sm:mb-2">
              <span className="font-cinzel text-lg sm:text-xl font-bold bg-gradient-to-b from-[#FFF2A3] via-[#D4AF37] to-[#8C6914] bg-clip-text text-transparent">
                AT
              </span>
            </div>
            <h1 className="font-syne text-xl sm:text-2xl font-bold tracking-wider text-white">
              AURUM <span className="text-amber-400 font-light">TERMINAL</span>
            </h1>
            <p className="text-[10px] sm:text-xs font-cinzel text-zinc-400 tracking-widest uppercase mt-0.5">
              Institutional Authentication Gateway
            </p>
          </div>

          {/* Session Expired Banner (if redirected after expiry) */}
          {expiredNotice && (
            <div className="mb-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2 animate-fadeIn shadow-lg">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold font-mono tracking-wide text-amber-300 block uppercase text-[11px]">
                  Session Expired
                </span>
                <span className="text-zinc-300 text-[10.5px] leading-tight block">
                  Your session has expired. Re-enter credentials to restore terminal access.
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-2.5 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Role Selection Context */}
          <div className="mb-3 p-2.5 sm:p-3 rounded-xl bg-[#0a0d17]/80 border border-amber-500/25">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Select Account Role Context
              </span>
              <span className="text-[9.5px] font-mono text-zinc-500">
                Access Level Policy
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* ADMIN ROLE */}
              <button
                type="button"
                onClick={() => handleRoleSelect('ADMIN')}
                className={`p-2 sm:p-2.5 rounded-lg border text-left transition flex flex-col gap-0.5 cursor-pointer ${
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
                <span className="text-[9.5px] text-zinc-400 font-sans leading-tight">
                  <strong className="text-zinc-300 block font-mono">Full Access:</strong>
                  Dashboard, AI, Risk, Controls
                </span>
              </button>

              {/* USER ROLE */}
              <button
                type="button"
                onClick={() => handleRoleSelect('USER')}
                className={`p-2 sm:p-2.5 rounded-lg border text-left transition flex flex-col gap-0.5 cursor-pointer ${
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
                <span className="text-[9.5px] text-zinc-400 font-sans leading-tight">
                  <strong className="text-zinc-300 block font-mono">Standard Access:</strong>
                  Markets, Signals, Intelligence
                </span>
              </button>
            </div>
          </div>

          {/* Main Login Card */}
          <div className="bg-[#0b0e18]/95 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Username Field */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1 font-mono">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <User className="w-3.5 h-3.5 text-amber-400/80" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                    disabled={isLoading}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-700/80 focus:border-amber-500 text-zinc-100 text-xs placeholder:text-zinc-600 outline-none transition font-mono h-10"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-medium text-zinc-300 font-mono">
                    Password
                  </label>
                  <span className="text-[9.5px] font-mono text-zinc-500">
                    Encrypted Token
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Key className="w-3.5 h-3.5 text-amber-400/80" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    disabled={isLoading}
                    className="w-full pl-8 pr-9 py-2 rounded-xl bg-zinc-900/90 border border-zinc-700/80 focus:border-amber-500 text-zinc-100 text-xs placeholder:text-zinc-600 outline-none transition font-mono h-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Remember Login (7-Day Persistent Session) */}
              <div className="pt-0.5 pb-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberLogin}
                    onChange={(e) => setRememberLogin(e.target.checked)}
                    disabled={isLoading}
                    className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500/30 accent-amber-500 cursor-pointer w-3.5 h-3.5"
                  />
                  <div className="text-left">
                    <span className="text-[11px] text-zinc-300 font-medium leading-tight block">
                      Remember Login (7-Day Active Session)
                    </span>
                  </div>
                </label>
              </div>

              {/* Verification Progress Notice */}
              {isLoading && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2 font-mono animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
                  <span className="truncate">{verificationStep}</span>
                </div>
              )}

              {/* Primary Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA771C] hover:brightness-110 active:scale-[0.99] text-black font-bold text-xs font-mono uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 h-10"
              >
                <Lock className="w-3.5 h-3.5 text-black" />
                <span>LOGIN TO TERMINAL</span>
                <ArrowRight className="w-3.5 h-3.5 text-black" />
              </button>
            </form>

            {/* REQUEST TERMINAL ACCESS (WHATSAPP COMMUNITY ACTION) - IMMEDIATELY BELOW LOGIN BUTTON */}
            <div className="mt-3 pt-3 border-t border-zinc-800/80">
              <a
                href="https://chat.whatsapp.com/Cgn2qq7XVqI9Q0VGex44aJ?s=cl&p=i&mlu=4&ilr=4"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-950/80 via-[#0a1811] to-teal-950/80 hover:bg-emerald-900/40 border border-emerald-500/40 hover:border-emerald-400/80 text-emerald-300 font-bold text-[11px] font-mono uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition cursor-pointer group"
              >
                <svg className="w-3.5 h-3.5 fill-current text-emerald-400 shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>REQUEST TERMINAL ACCESS</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </a>
              <p className="text-[9.5px] text-zinc-400 font-sans text-center mt-1 leading-tight">
                Join AURUM Community for platform updates and access requests.
              </p>
            </div>

            {/* Role Permissions Summary Box */}
            <div className="mt-2.5 pt-2 border-t border-zinc-800/60 text-[10px] text-zinc-400 font-mono flex items-center justify-between">
              <span className="text-[9.5px] uppercase text-zinc-500">Active Policy:</span>
              <span className={`font-bold ${selectedRole === 'ADMIN' ? 'text-amber-400' : 'text-sky-400'}`}>
                {selectedRole === 'ADMIN' ? 'ADMIN (Full System)' : 'USER (Standard Trading)'}
              </span>
            </div>
          </div>

          {/* Institutional Compliance Notice */}
          <div className="mt-3 text-center text-[9.5px] font-mono text-zinc-500 space-y-0.5">
            <div className="flex items-center justify-center gap-1.5 text-zinc-400">
              <Shield className="w-3 h-3 text-amber-400/80" />
              <span>TLS 1.3 • AES-256 SESSION TOKENS</span>
            </div>
            <p>AURUM TERMINAL — Proprietary Market Intelligence Infrastructure</p>
          </div>

        </div>
      </div>
    </div>
  );
};

