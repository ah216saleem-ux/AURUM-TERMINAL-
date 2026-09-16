/**
 * AURUM TERMINAL - PRODUCTION DEPLOYMENT CONFIGURATION
 * Safe credentials fallback, API key encryption, request validation, and rate-limiting middleware mockups.
 */

export interface ProductionConfig {
  marketDataApiKey: string;
  newsApiKey: string;
  economicCalendarApiKey: string;
  telegramBotToken: string;
  databaseCredentials: string;
  websocketEndpoint: string;
}

// Read environment variables with safe client fallback
const env = (import.meta as any).env || {};

export const PRODUCTION_CONFIG: ProductionConfig = {
  marketDataApiKey: env.VITE_MARKET_DATA_API_KEY || "sec_prod_mk_5829a8f9024c",
  newsApiKey: env.VITE_NEWS_API_KEY || "sec_prod_ns_1928374829bc",
  economicCalendarApiKey: env.VITE_ECONOMIC_CALENDAR_API_KEY || "sec_prod_ec_0284820a10df",
  telegramBotToken: env.VITE_TELEGRAM_BOT_TOKEN || "7481902456:AAHzD8_SAMPLE_TOKEN",
  databaseCredentials: env.VITE_DATABASE_CREDENTIALS || "firestore://aurum-terminal-prod-gcp",
  websocketEndpoint: env.VITE_WEBSOCKET_ENDPOINT || "wss://feed.aurum-terminal.io/live"
};

/**
 * PRODUCTION SECURITY LAYER
 */
export const SecurityService = {
  /**
   * Safe symmetric key simulation for client-side persistence of private keys
   */
  encryptApiKey: (key: string): string => {
    if (!key) return "";
    try {
      // Clean salt prefixed base64 obfuscation for production security simulator
      const salt = "AURUM_SALT_PROD_2026";
      const plainText = `${salt}:${key}`;
      return btoa(plainText);
    } catch {
      return key;
    }
  },

  decryptApiKey: (encrypted: string): string => {
    if (!encrypted) return "";
    try {
      const decoded = atob(encrypted);
      const parts = decoded.split(":");
      if (parts[0] === "AURUM_SALT_PROD_2026") {
        return parts.slice(1).join(":");
      }
      return encrypted;
    } catch {
      return encrypted;
    }
  },

  /**
   * Backend-style validation schema checks
   */
  validateTelegramCredentials: (token: string, chatId: string): { valid: boolean; error?: string } => {
    if (!token || token.trim().length < 15) {
      return { valid: false, error: "Invalid Bot Token length. Token must be at least 15 characters." };
    }
    if (!token.includes(":")) {
      return { valid: false, error: "Malformed Bot Token. Missing numeric bot identifier prefix." };
    }
    if (!chatId || chatId.trim().length < 3) {
      return { valid: false, error: "Invalid Chat ID or Channel Tag." };
    }
    return { valid: true };
  },

  /**
   * Client-side request rate limiter to prevent abuse
   */
  createRateLimiter: (maxRequestsPerMinute: number = 30) => {
    const requestTimes: number[] = [];
    return {
      checkLimit: (): { allowed: boolean; remaining: number; retryAfter?: number } => {
        const now = Date.now();
        // filter out requests older than 1 minute
        const oneMinuteAgo = now - 60000;
        while (requestTimes.length > 0 && requestTimes[0] < oneMinuteAgo) {
          requestTimes.shift();
        }

        if (requestTimes.length >= maxRequestsPerMinute) {
          const earliestTime = requestTimes[0];
          const retryAfter = Math.ceil((earliestTime + 60000 - now) / 1000);
          return { allowed: false, remaining: 0, retryAfter };
        }

        requestTimes.push(now);
        return { allowed: true, remaining: maxRequestsPerMinute - requestTimes.length };
      }
    };
  }
};

/**
 * DEPLOYMENT OPTIMIZATION DEFINITIONS
 */
export const DEPLOYMENT_OPTIMIZATIONS = {
  compressAssets: true,
  enableTreeShaking: true,
  lazyLoadRoutes: true,
  errorFallbacks: {
    useBackupFeedOnFailure: true,
    localCacheRetries: 3
  }
};
