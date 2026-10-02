import React, { useState, useEffect } from 'react';
import { 
  Lock, 
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
import { Persistent3DStoryCanvas } from './hero3d/Persistent3DStoryCanvas';

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
  const [rememberLogin, setRememberLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [expiredNotice, setExpiredNotice] = useState<string | null>(initialExpiredMessage || null);

  // Failed attempts rate-limiting / lockout state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  useEffect(() => {
    const expired = userService.getExpiredNotice();
    if (expired) {
      setExpiredNotice(expired);
    }
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

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

    setVerificationStep('Authenticating institutional credentials...');

    setTimeout(() => {
      setVerificationStep('Generating 7-day cryptographic session token...');

      setTimeout(() => {
        try {
          // Role is automatically resolved from credentials
          const session = userService.login(username, password, undefined, rememberLogin);
          setIsLoading(false);
          setFailedAttempts(0);
          setVerificationStep('Access granted. Entering AURUM Terminal...');
          setTimeout(() => {
            onLoginSuccess(session.role);
          }, 200);
        } catch {
          setIsLoading(false);
          const newFailed = failedAttempts + 1;
          setFailedAttempts(newFailed);
          setErrorMessage('Invalid institutional credentials. Please verify your username and password.');

          // Lockout for 30s after 5 failed attempts
          if (newFailed >= 5) {
            setLockoutRemaining(30);
          }
        }
      }, 300);
    }, 350);
  };

  const isLockedOut = lockoutRemaining > 0;

  return (
    <div className="min-h-[100dvh] w-full bg-[#050608] text-zinc-100 flex flex-col justify-between font-sans selection:bg-amber-500/20 selection:text-amber-200 relative overflow-x-hidden">
      
      {/* 3D Gold Particle Story Canvas Background */}
      <Persistent3DStoryCanvas />

      {/* Lightweight Dark Overlay to ensure glass card legibility */}
      <div className="fixed inset-0 pointer-events-none z-[1] bg-black/40 backdrop-blur-[2px]" />

      {/* Ambient Glows */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[300px] bg-gradient-to-b from-amber-500/10 via-amber-600/5 to-transparent blur-3xl z-[2]" />

      {/* TOP BAR: Back to Portal & Server Status */}
      <div className="relative z-20 w-full max-w-5xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4 flex items-center justify-between shrink-0">
        <button
          onClick={onBackToLanding}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 hover:border-amber-500/50 text-zinc-300 hover:text-amber-300 text-xs font-sans transition flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
          <span>Back to Portal</span>
        </button>

        <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-zinc-400 bg-zinc-900/80 border border-zinc-800 px-3 py-2 rounded-xl backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline text-zinc-300">AUTH SERVER:</span>
          <span className="text-emerald-400 font-bold">ONLINE</span>
        </div>
      </div>

      {/* MAIN CONTAINER: Compact Glass Card */}
      <div className="flex-1 flex items-center justify-center px-3 sm:px-4 py-3 sm:py-6 relative z-10 my-auto shrink-0">
        <div className="w-full max-w-md">
          
          {/* Glass Card Container */}
          <div className="bg-[#090b14]/85 border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

            {/* Emblem & Brand Title Header */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1b1c24] to-[#0c0d12] border border-amber-500/40 shadow-lg shadow-amber-500/15 mb-2">
                <span className="font-cinzel text-lg font-black bg-gradient-to-b from-[#FFF2A3] via-[#D4AF37] to-[#8C6914] bg-clip-text text-transparent">
                  AT
                </span>
              </div>
              <h1 className="font-cinzel text-xl sm:text-2xl font-black tracking-wider text-white">
                AURUM <span className="gold-shimmer-text">TERMINAL</span>
              </h1>
              <p className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase mt-0.5">
                Secure Access Gateway
              </p>
            </div>

            {/* Session Expired Banner */}
            {expiredNotice && (
              <div className="mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2 animate-fadeIn shadow-lg">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold font-mono tracking-wide text-amber-300 block uppercase text-[10.5px]">
                    Session Expired
                  </span>
                  <span className="text-zinc-300 text-[10.5px] leading-tight block">
                    Session expired. Re-enter credentials to restore terminal access.
                  </span>
                </div>
              </div>
            )}

            {/* Rate-limit Lockout Warning */}
            {isLockedOut && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
                <Shield className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Too many failed attempts. Please wait {lockoutRemaining} seconds.</span>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && !isLockedOut && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Username Field */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1 font-mono">
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
                    placeholder="Enter username"
                    required
                    disabled={isLoading || isLockedOut}
                    className="w-full min-h-[44px] pl-9 pr-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-700/80 focus:border-amber-400 text-zinc-100 text-xs placeholder:text-zinc-600 outline-none transition font-mono"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-zinc-300 font-mono">
                    Password
                  </label>
                  <a
                    href="https://chat.whatsapp.com/Cgn2qq7XVqI9Q0VGex44aJ?mode=gi_t"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono text-amber-400 hover:text-amber-300 underline"
                  >
                    Forgot password? Contact admin
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Key className="w-4 h-4 text-amber-400/80" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    disabled={isLoading || isLockedOut}
                    className="w-full min-h-[44px] pl-9 pr-9 py-2 rounded-xl bg-zinc-900/90 border border-zinc-700/80 focus:border-amber-400 text-zinc-100 text-xs placeholder:text-zinc-600 outline-none transition font-mono"
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
              <div className="pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberLogin}
                    onChange={(e) => setRememberLogin(e.target.checked)}
                    disabled={isLoading || isLockedOut}
                    className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500/30 accent-amber-500 cursor-pointer w-4 h-4"
                  />
                  <span className="text-[11px] text-zinc-300 font-medium">
                    Remember Login (7-Day Active Session)
                  </span>
                </label>
              </div>

              {/* Verification Progress Notice */}
              {isLoading && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2 font-mono animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
                  <span className="truncate">{verificationStep}</span>
                </div>
              )}

              {/* Primary Gold Login Button */}
              <button
                type="submit"
                disabled={isLoading || isLockedOut}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 active:scale-[0.99] text-black font-extrabold text-xs font-mono uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 border border-amber-200/50"
              >
                <Lock className="w-4 h-4 text-black" />
                <span>LOGIN TO TERMINAL</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </form>

            {/* Green WhatsApp Access Request Button */}
            <div className="mt-3.5 pt-3.5 border-t border-zinc-800/80 text-center">
              <a
                href="https://chat.whatsapp.com/Cgn2qq7XVqI9Q0VGex44aJ?mode=gi_t"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/40 text-white font-extrabold text-xs font-mono uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition cursor-pointer group active:scale-98"
              >
                <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>REQUEST TERMINAL ACCESS</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </a>
              <p className="text-[10px] text-zinc-400 font-sans mt-1.5 leading-tight">
                Need access? Request it on WhatsApp.
              </p>
            </div>

          </div>

          {/* Single Short Footer Line */}
          <div className="mt-3 text-center text-[10.5px] font-mono text-zinc-500">
            Secure session. Authorized users only.
          </div>

        </div>
      </div>

    </div>
  );
};
