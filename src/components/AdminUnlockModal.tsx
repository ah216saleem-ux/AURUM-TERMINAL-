import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Loader2,
  KeyRound
} from 'lucide-react';
import { adminUnlockService } from '../services/adminUnlockService';

interface AdminUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (targetModuleId?: string) => void;
  targetModuleId?: string;
  targetModuleName?: string;
}

export const AdminUnlockModal: React.FC<AdminUnlockModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetModuleId,
  targetModuleName
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMessage(null);
      setIsSuccess(false);
      setIsLoading(false);
      setAttemptsLeft(null);
      setRetryAfter(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    const result = await adminUnlockService.unlock(password, targetModuleName || targetModuleId);

    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess(targetModuleId);
        onClose();
      }, 700);
    } else {
      if (result.code === 'RATE_LIMITED') {
        setErrorMessage('TOO MANY FAILED ATTEMPTS. TRY AGAIN LATER.');
        setRetryAfter(result.retryAfterSeconds || 900);
      } else if (result.code === 'NOT_CONFIGURED') {
        setErrorMessage('ADMIN UNLOCK NOT CONFIGURED. Please set AURUM_ADMIN_UNLOCK_PASSWORD on the server.');
      } else {
        setErrorMessage('INVALID PASSWORD. ACCESS DENIED.');
        if (typeof result.attemptsRemaining === 'number') {
          setAttemptsLeft(result.attemptsRemaining);
        }
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md rounded-2xl bg-[#0b0e17] border border-amber-500/40 p-5 sm:p-6 shadow-2xl shadow-amber-500/10 text-zinc-100 font-sans"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex flex-col items-center text-center space-y-2 mb-5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
              isSuccess 
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/20' 
                : 'bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-lg shadow-amber-500/10'
            }`}>
              {isSuccess ? (
                <Unlock className="w-6 h-6 text-emerald-400 animate-bounce" />
              ) : (
                <Lock className="w-6 h-6 text-amber-400" />
              )}
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-xs font-mono font-bold text-amber-400/90 tracking-widest uppercase">
                  AURUM SECURITY GUARD
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide font-mono mt-0.5">
                🔒 RESTRICTED ACCESS
              </h2>
            </div>

            <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
              This module {targetModuleName ? <span className="text-amber-300 font-semibold font-mono">({targetModuleName})</span> : ''} is protected. Admin authorization is required to continue.
            </p>
          </div>

          {/* Success Banner */}
          {isSuccess ? (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-center space-y-1 my-3">
              <div className="flex items-center justify-center gap-2 font-mono font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>🔓 ACCESS GRANTED</span>
              </div>
              <p className="text-[11px] text-emerald-400/80">
                Temporary privileged session active (30 minutes)
              </p>
            </div>
          ) : (
            <form onSubmit={handleUnlock} className="space-y-4">
              {/* Password Input Container */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono font-bold text-zinc-300">
                  Enter Access Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Admin unlock password"
                    autoFocus
                    disabled={isLoading || isSuccess}
                    className="w-full pl-9 pr-11 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm font-mono text-zinc-100 placeholder-zinc-500 outline-none transition disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message Box */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="font-mono font-bold">{errorMessage}</div>
                    {typeof attemptsLeft === 'number' && attemptsLeft > 0 && (
                      <div className="text-[11px] text-rose-400/80">
                        {attemptsLeft} attempt{attemptsLeft > 1 ? 's' : ''} remaining before temporary lockout.
                      </div>
                    )}
                    {retryAfter && (
                      <div className="text-[11px] text-amber-400">
                        Locked for security. Please try again in {Math.ceil(retryAfter / 60)} minutes.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono font-bold text-zinc-300 transition cursor-pointer disabled:opacity-50"
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={isLoading || !password.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] hover:brightness-110 active:scale-[0.98] text-black text-xs font-mono font-extrabold transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>VERIFYING...</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>UNLOCK</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Privacy and Security Footer */}
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>Server Authoritative Guard</span>
            <span>Auto-Locks in 30m</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
