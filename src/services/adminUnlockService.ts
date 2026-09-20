import { userService } from './userService';

const UNLOCK_STORAGE_KEY = 'aurum_admin_unlock_token_v1';

export interface AdminUnlockState {
  isUnlocked: boolean;
  token: string | null;
  expiresAt: number | null;
  expiredNotice: boolean;
  activeModule?: string | null;
}

class AdminUnlockService {
  private state: AdminUnlockState = {
    isUnlocked: false,
    token: null,
    expiresAt: null,
    expiredNotice: false,
    activeModule: null
  };

  private listeners: Array<() => void> = [];
  private expirationTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.loadFromStorage();

    // Auto verify with server on init
    if (typeof window !== 'undefined') {
      this.verifyServer();
    }

    // Subscribe to userService changes (e.g., user logs out -> revoke unlock)
    userService.subscribe(() => {
      if (!userService.isAuthenticated()) {
        this.lock(false);
      }
    });
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const stored = sessionStorage.getItem(UNLOCK_STORAGE_KEY) || localStorage.getItem(UNLOCK_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const now = Date.now();
        if (parsed.token && parsed.expiresAt && now < parsed.expiresAt) {
          this.state = {
            isUnlocked: true,
            token: parsed.token,
            expiresAt: parsed.expiresAt,
            expiredNotice: false,
            activeModule: parsed.activeModule || null
          };
          this.scheduleAutoLock(parsed.expiresAt - now);
        } else {
          this.clearStorage();
        }
      }
    } catch (e) {
      console.warn('[AdminUnlockService] Failed to load unlock state', e);
      this.clearStorage();
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      if (this.state.isUnlocked && this.state.token && this.state.expiresAt) {
        const data = JSON.stringify({
          token: this.state.token,
          expiresAt: this.state.expiresAt,
          activeModule: this.state.activeModule
        });
        sessionStorage.setItem(UNLOCK_STORAGE_KEY, data);
      } else {
        this.clearStorage();
      }
    } catch (e) {
      console.error('[AdminUnlockService] Failed to save state', e);
    }
  }

  private clearStorage() {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(UNLOCK_STORAGE_KEY);
    localStorage.removeItem(UNLOCK_STORAGE_KEY);
  }

  private scheduleAutoLock(delayMs: number) {
    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }

    if (delayMs <= 0) {
      this.triggerExpiration();
      return;
    }

    this.expirationTimer = setTimeout(() => {
      this.triggerExpiration();
    }, delayMs);
  }

  private triggerExpiration() {
    this.state = {
      isUnlocked: false,
      token: null,
      expiresAt: null,
      expiredNotice: true,
      activeModule: null
    };
    this.clearStorage();
    this.notifyListeners();
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(cb => cb());
  }

  public isUnlocked(role?: string): boolean {
    const currentRole = role || userService.getRole();
    if (currentRole === 'ADMIN') {
      return true; // Admin role has direct unrestricted access
    }

    if (!this.state.isUnlocked || !this.state.expiresAt) {
      return false;
    }

    if (Date.now() >= this.state.expiresAt) {
      this.triggerExpiration();
      return false;
    }

    return true;
  }

  public getToken(): string | null {
    return this.state.token;
  }

  public getExpiresAt(): number | null {
    return this.state.expiresAt;
  }

  public getExpiredNotice(): boolean {
    return this.state.expiredNotice;
  }

  public clearExpiredNotice(): void {
    this.state.expiredNotice = false;
    this.notifyListeners();
  }

  public getRemainingSeconds(): number {
    if (!this.state.expiresAt) return 0;
    return Math.max(0, Math.floor((this.state.expiresAt - Date.now()) / 1000));
  }

  public getRemainingTimeFormatted(): string {
    const totalSecs = this.getRemainingSeconds();
    if (totalSecs <= 0) return '0m';
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins >= 1) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  }

  /**
   * Unlock with password sent to server verification endpoint
   */
  public async unlock(password: string, moduleName?: string): Promise<{
    success: boolean;
    error?: string;
    code?: string;
    attemptsRemaining?: number;
    retryAfterSeconds?: number;
  }> {
    try {
      const user = userService.getUser();
      const res = await fetch('/api/auth/admin-unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          module: moduleName || 'ALL_PROTECTED',
          userId: user?.username || 'user'
        })
      });

      const data = await res.json();

      if (res.ok && data.status === 'AUTHORIZED') {
        const remainingMs = data.expiresAt - Date.now();
        this.state = {
          isUnlocked: true,
          token: data.token,
          expiresAt: data.expiresAt,
          expiredNotice: false,
          activeModule: moduleName || null
        };
        this.saveToStorage();
        this.scheduleAutoLock(remainingMs);
        this.notifyListeners();

        return { success: true };
      }

      return {
        success: false,
        error: data.error || 'ACCESS DENIED',
        code: data.code,
        attemptsRemaining: data.attemptsRemaining,
        retryAfterSeconds: data.retryAfterSeconds
      };
    } catch (err: any) {
      return {
        success: false,
        error: 'Network connection error. Could not reach authentication authority.'
      };
    }
  }

  /**
   * Verify token with server
   */
  public async verifyServer(): Promise<boolean> {
    const role = userService.getRole();
    if (role === 'ADMIN') return true;

    if (!this.state.token) return false;

    try {
      const res = await fetch('/api/auth/admin-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.state.token}`
        },
        body: JSON.stringify({
          token: this.state.token,
          userId: userService.getUser()?.username,
          role
        })
      });

      if (!res.ok) {
        this.triggerExpiration();
        return false;
      }

      const data = await res.json();
      if (data.authorized) {
        return true;
      } else {
        this.triggerExpiration();
        return false;
      }
    } catch (e) {
      return this.isUnlocked();
    }
  }

  /**
   * Lock / Revoke authorization
   */
  public async lock(notifyServer: boolean = true): Promise<void> {
    const currentToken = this.state.token;

    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }

    this.state = {
      isUnlocked: false,
      token: null,
      expiresAt: null,
      expiredNotice: false,
      activeModule: null
    };
    this.clearStorage();
    this.notifyListeners();

    if (notifyServer && currentToken) {
      try {
        await fetch('/api/auth/admin-lock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: currentToken })
        });
      } catch (e) {
        // ignore
      }
    }
  }
}

export const adminUnlockService = new AdminUnlockService();
