import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Bell, Volume2 } from 'lucide-react';
import { requestNotificationPermission } from '../utils/notificationService';
import { trackGaEvent } from '../utils/googleAnalytics';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Check Notification permission state
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    trackGaEvent('pwa_install_prompt_choice', { outcome });

    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    trackGaEvent('notification_permission_requested', { granted });
  };

  if (isDismissed) return null;

  return (
    <div className="w-full max-w-lg mx-auto mb-3 font-mono">
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#121629] to-[#0c0e1a] border border-amber-500/30 shadow-xl flex items-center justify-between gap-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>AURUM TERMINAL PWA</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                INSTALLABLE
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Install to Home Screen & enable mobile lock-screen alerts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!notificationsEnabled && (
            <button
              onClick={handleEnableNotifications}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-bold transition cursor-pointer"
              title="Enable Mobile Lock-Screen Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
          )}

          {isInstallable ? (
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-md shadow-amber-500/10"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          ) : (
            <button
              onClick={handleEnableNotifications}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Alerts</span>
            </button>
          )}

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-lg text-zinc-500 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
