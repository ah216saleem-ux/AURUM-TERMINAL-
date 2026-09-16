import { 
  UserProfile, 
  UserAlertSettings, 
  AuthSession, 
  UserAccountTier, 
  TradingStyleMode 
} from '../types';

const AUTH_STORAGE_KEY = 'aurum_user_session_v1';
const SETTINGS_STORAGE_KEY = 'aurum_user_settings_v1';

const DEFAULT_USER: UserProfile = {
  id: 'usr-inst-9021',
  email: 'a.h216saleem@gmail.com',
  name: 'Institutional Trader',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  accountTier: 'INSTITUTIONAL_PRO',
  createdAt: '2025-01-10T08:00:00Z',
  apiKey: 'aurum_live_sec_9941a82f883204c101b',
  webhookSecret: 'whsec_aurum_live_901848293112'
};

const DEFAULT_SETTINGS: UserAlertSettings = {
  telegramEnabled: true,
  telegramChatId: '@AurumSignalsOfficial',
  minConfidenceThreshold: 85,
  soundAlerts: true,
  desktopNotifications: true,
  maxRiskPerTradePercent: 1.0,
  autoExecuteTrades: false,
  preferredTradingModes: ['INTRADAY', 'SCALPING', 'SWING']
};

class UserService {
  private currentSession: AuthSession = {
    user: DEFAULT_USER,
    token: 'jwt_aurum_live_session_990112',
    isAuthenticated: true
  };

  private settings: UserAlertSettings = DEFAULT_SETTINGS;
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);

      if (storedSession) {
        this.currentSession = JSON.parse(storedSession);
      } else {
        this.saveSessionToStorage();
      }

      if (storedSettings) {
        this.settings = JSON.parse(storedSettings);
      } else {
        this.saveSettingsToStorage();
      }
    } catch (err) {
      console.warn('[UserService] Error loading user session from storage:', err);
    }
  }

  private saveSessionToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentSession));
    } catch (err) {
      console.error('[UserService] Error saving session to storage:', err);
    }
  }

  private saveSettingsToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    } catch (err) {
      console.error('[UserService] Error saving settings to storage:', err);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(cb => cb());
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  // AUTH API
  public getSession(): AuthSession {
    return { ...this.currentSession };
  }

  public getUser(): UserProfile | null {
    return this.currentSession.user;
  }

  public isAuthenticated(): boolean {
    return this.currentSession.isAuthenticated;
  }

  public login(email: string, pass: string, tier: UserAccountTier = 'INSTITUTIONAL_PRO'): AuthSession {
    const name = email.split('@')[0].toUpperCase();
    const user: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      name: name || 'Institutional Trader',
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
      accountTier: tier,
      createdAt: new Date().toISOString(),
      apiKey: `aurum_live_sec_${Math.random().toString(36).substring(2, 15)}`,
      webhookSecret: `whsec_aurum_live_${Math.random().toString(36).substring(2, 15)}`
    };

    this.currentSession = {
      user,
      token: `jwt_aurum_session_${Date.now()}`,
      isAuthenticated: true
    };

    this.saveSessionToStorage();
    this.notifyListeners();
    return this.getSession();
  }

  public signup(email: string, name: string, tier: UserAccountTier = 'VIP_ELITE'): AuthSession {
    const user: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      name,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
      accountTier: tier,
      createdAt: new Date().toISOString(),
      apiKey: `aurum_live_sec_${Math.random().toString(36).substring(2, 15)}`,
      webhookSecret: `whsec_aurum_live_${Math.random().toString(36).substring(2, 15)}`
    };

    this.currentSession = {
      user,
      token: `jwt_aurum_session_${Date.now()}`,
      isAuthenticated: true
    };

    this.saveSessionToStorage();
    this.notifyListeners();
    return this.getSession();
  }

  public logout() {
    this.currentSession = {
      user: null,
      token: null,
      isAuthenticated: false
    };
    this.saveSessionToStorage();
    this.notifyListeners();
  }

  // SETTINGS API
  public getSettings(): UserAlertSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<UserAlertSettings>): UserAlertSettings {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettingsToStorage();
    this.notifyListeners();
    return this.getSettings();
  }

  public regenerateApiKey(): string {
    if (!this.currentSession.user) return '';
    const newKey = `aurum_live_sec_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 8)}`;
    this.currentSession.user.apiKey = newKey;
    this.saveSessionToStorage();
    this.notifyListeners();
    return newKey;
  }
}

export const userService = new UserService();
