import { 
  UserProfile, 
  UserAlertSettings, 
  AuthSession, 
  UserAccountTier, 
  UserRole,
  TradingStyleMode 
} from '../types';

const AUTH_STORAGE_KEY = 'aurum_session_v2';
const SETTINGS_STORAGE_KEY = 'aurum_user_settings_v1';
export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days in milliseconds

export interface RegisteredAccount {
  username: string;
  password: string;
  role: UserRole;
  name: string;
  email: string;
  accountTier: UserAccountTier;
  avatarUrl: string;
  apiKey: string;
  webhookSecret: string;
}

export const REGISTERED_ACCOUNTS: Record<string, RegisteredAccount> = {
  'ahmadf7': {
    username: 'Ahmadf7',
    password: '9663059aA@',
    role: 'ADMIN',
    name: 'Ahmad F. (Admin)',
    email: 'ahmadf7@aurum-terminal.internal',
    accountTier: 'INSTITUTIONAL_PRO',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    apiKey: 'aurum_live_adm_9941a82f883204c101b',
    webhookSecret: 'whsec_adm_live_901848293112'
  },
  'gmcf7': {
    username: 'gmcf7',
    password: 'whynotmerijaan',
    role: 'USER',
    name: 'GMC Trader',
    email: 'gmcf7@aurum-terminal.internal',
    accountTier: 'VIP_ELITE',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    apiKey: 'aurum_live_usr_7732b11d994320f202a',
    webhookSecret: 'whsec_usr_live_449102839102'
  },
  'admin': {
    username: 'admin',
    password: 'aurum2026',
    role: 'ADMIN',
    name: 'Terminal Administrator',
    email: 'admin@aurum-terminal.internal',
    accountTier: 'INSTITUTIONAL_PRO',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    apiKey: 'aurum_live_adm_8812903bce302194',
    webhookSecret: 'whsec_adm_live_449102839102'
  },
  'trader': {
    username: 'trader',
    password: 'aurum2026',
    role: 'USER',
    name: 'Institutional Trader',
    email: 'trader@aurum-terminal.internal',
    accountTier: 'VIP_ELITE',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    apiKey: 'aurum_live_usr_3319028a119420b1',
    webhookSecret: 'whsec_usr_live_883019284102'
  }
};

export const PRESET_ADMIN_USER: UserProfile = {
  id: 'usr-admin-001',
  email: 'ahmadf7@aurum-terminal.internal',
  username: 'Ahmadf7',
  name: 'Ahmad F. (Admin)',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  accountTier: 'INSTITUTIONAL_PRO',
  role: 'ADMIN',
  createdAt: '2025-01-01T00:00:00Z',
  apiKey: 'aurum_live_adm_9941a82f883204c101b',
  webhookSecret: 'whsec_adm_live_901848293112'
};

export const PRESET_STANDARD_USER: UserProfile = {
  id: 'usr-trader-102',
  email: 'gmcf7@aurum-terminal.internal',
  username: 'gmcf7',
  name: 'GMC Trader',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  accountTier: 'VIP_ELITE',
  role: 'USER',
  createdAt: '2025-02-15T09:30:00Z',
  apiKey: 'aurum_live_usr_7732b11d994320f202a',
  webhookSecret: 'whsec_usr_live_449102839102'
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
    user: null,
    token: null,
    isAuthenticated: false,
    role: 'USER',
    loginTimestamp: 0,
    expiresAt: 0,
    rememberMe: true
  };

  private settings: UserAlertSettings = DEFAULT_SETTINGS;
  private listeners: Array<() => void> = [];
  private sessionExpiredNotice: string | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private generateSecureToken(username: string, role: UserRole): string {
    const timestamp = Date.now();
    const entropy = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
    return `AT-SEC-${role}-${btoa(username).replace(/=/g, '')}-${timestamp}-${entropy}`;
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const storedSessionRaw = localStorage.getItem(AUTH_STORAGE_KEY);
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);

      if (storedSessionRaw) {
        const parsedSession: AuthSession = JSON.parse(storedSessionRaw);
        const now = Date.now();

        // Validate 7-day persistence
        if (parsedSession && parsedSession.isAuthenticated && parsedSession.expiresAt) {
          if (now < parsedSession.expiresAt) {
            // Valid active session
            this.currentSession = parsedSession;
            this.sessionExpiredNotice = null;
          } else {
            // Session expired!
            console.warn('[UserService] 7-Day Session expired. Invalidating session.');
            this.sessionExpiredNotice = 'SESSION EXPIRED: Please login again.';
            this.logout(true);
          }
        } else {
          this.currentSession.isAuthenticated = false;
        }
      } else {
        // First visit or clean state: ensure no stale unauthenticated session
        this.currentSession.isAuthenticated = false;
      }

      if (storedSettings) {
        this.settings = JSON.parse(storedSettings);
      } else {
        this.saveSettingsToStorage();
      }
    } catch (err) {
      console.warn('[UserService] Error loading user session from storage:', err);
      this.currentSession.isAuthenticated = false;
    }
  }

  private saveSessionToStorage() {
    if (typeof window === 'undefined') return;
    try {
      if (this.currentSession.isAuthenticated && this.currentSession.rememberMe) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentSession));
      } else if (!this.currentSession.isAuthenticated) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
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
    // Re-verify expiration on each read
    if (this.currentSession.isAuthenticated && this.currentSession.expiresAt > 0) {
      if (Date.now() >= this.currentSession.expiresAt) {
        this.sessionExpiredNotice = 'SESSION EXPIRED: Please login again.';
        this.logout(true);
      }
    }
    return { ...this.currentSession };
  }

  public getUser(): UserProfile | null {
    return this.getSession().user;
  }

  public isAuthenticated(): boolean {
    return this.getSession().isAuthenticated;
  }

  public getRole(): UserRole {
    return this.getSession().role || 'USER';
  }

  public isAdmin(): boolean {
    return this.isAuthenticated() && this.getRole() === 'ADMIN';
  }

  public isUser(): boolean {
    return this.isAuthenticated() && this.getRole() === 'USER';
  }

  public getExpiredNotice(): string | null {
    return this.sessionExpiredNotice;
  }

  public clearExpiredNotice(): void {
    this.sessionExpiredNotice = null;
  }

  public getRemainingSessionTime(): { days: number; hours: number; minutes: number } {
    if (!this.currentSession.isAuthenticated || !this.currentSession.expiresAt) {
      return { days: 0, hours: 0, minutes: 0 };
    }
    const diff = Math.max(0, this.currentSession.expiresAt - Date.now());
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    return { days, hours, minutes };
  }

  public verifyCredentials(usernameOrEmail: string, pass: string): { valid: boolean; role?: UserRole; error?: string } {
    const cleanIdentifier = usernameOrEmail.trim().toLowerCase();
    const registered = REGISTERED_ACCOUNTS[cleanIdentifier];

    if (!registered) {
      if (pass === 'demo-key' || pass === 'aurum2026') {
        const inferredRole: UserRole = cleanIdentifier.includes('admin') ? 'ADMIN' : 'USER';
        return { valid: true, role: inferredRole };
      }
      return { valid: false, error: 'Invalid username. Account not recognized.' };
    }

    if (registered.password !== pass) {
      return { valid: false, error: 'Invalid institutional password. Security key authentication failed.' };
    }

    return { valid: true, role: registered.role };
  }

  public login(
    usernameOrEmail: string, 
    pass: string, 
    preferredRole?: UserRole, 
    rememberMe: boolean = true
  ): AuthSession {
    const cleanIdentifier = usernameOrEmail.trim().toLowerCase();
    const registered = REGISTERED_ACCOUNTS[cleanIdentifier];

    // Credential validation
    if (!registered) {
      // Allow legacy demo key
      if (pass !== 'demo-key' && pass !== 'aurum2026') {
        throw new Error('Invalid institutional credentials. Please verify your username and password.');
      }
    } else {
      if (registered.password !== pass) {
        throw new Error('Invalid institutional credentials. Please verify your username and password.');
      }
    }

    // Role resolution: registered account's role takes priority for security
    let role: UserRole = registered ? registered.role : (preferredRole || (cleanIdentifier.includes('admin') ? 'ADMIN' : 'USER'));

    const now = Date.now();
    const expiresAt = now + SEVEN_DAYS_MS;
    const secureToken = this.generateSecureToken(cleanIdentifier, role);

    const displayName = registered ? registered.name : (
      cleanIdentifier.includes('@') 
        ? cleanIdentifier.split('@')[0].toUpperCase() 
        : cleanIdentifier.toUpperCase()
    );

    const userProfile: UserProfile = {
      id: registered ? `usr-${registered.role.toLowerCase()}-${registered.username.toLowerCase()}` : `usr-${role.toLowerCase()}-${now.toString().slice(-6)}`,
      email: registered ? registered.email : (cleanIdentifier.includes('@') ? cleanIdentifier : `${cleanIdentifier}@aurum-terminal.internal`),
      username: registered ? registered.username : cleanIdentifier,
      name: displayName,
      avatarUrl: registered ? registered.avatarUrl : (role === 'ADMIN' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'),
      accountTier: registered ? registered.accountTier : (role === 'ADMIN' ? 'INSTITUTIONAL_PRO' : 'VIP_ELITE'),
      role,
      createdAt: registered ? '2025-01-01T00:00:00Z' : new Date().toISOString(),
      apiKey: registered ? registered.apiKey : `aurum_live_${role.toLowerCase()}_${Math.random().toString(36).substring(2, 15)}`,
      webhookSecret: registered ? registered.webhookSecret : `whsec_${role.toLowerCase()}_${Math.random().toString(36).substring(2, 15)}`
    };

    this.currentSession = {
      user: userProfile,
      token: secureToken,
      isAuthenticated: true,
      role,
      loginTimestamp: now,
      expiresAt,
      rememberMe
    };

    this.sessionExpiredNotice = null;
    this.saveSessionToStorage();
    this.notifyListeners();

    return this.getSession();
  }

  public simulateSessionExpiry(): void {
    if (this.currentSession.isAuthenticated) {
      console.warn('[UserService] Simulating 7-Day Session Expiration');
      this.sessionExpiredNotice = 'SESSION EXPIRED: Please login again.';
      this.logout(true);
    }
  }

  public logout(isExpired: boolean = false) {
    this.currentSession = {
      user: null,
      token: null,
      isAuthenticated: false,
      role: 'USER',
      loginTimestamp: 0,
      expiresAt: 0,
      rememberMe: true
    };

    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    if (!isExpired) {
      this.sessionExpiredNotice = null;
    }

    this.notifyListeners();
  }

  // Quick helper for role simulator / test suites
  public switchRole(newRole: UserRole): AuthSession {
    if (!this.currentSession.user) {
      return this.login(newRole.toLowerCase(), 'pass', newRole);
    }
    this.currentSession.role = newRole;
    this.currentSession.user.role = newRole;
    this.currentSession.user.accountTier = newRole === 'ADMIN' ? 'INSTITUTIONAL_PRO' : 'VIP_ELITE';
    this.saveSessionToStorage();
    this.notifyListeners();
    return this.getSession();
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
