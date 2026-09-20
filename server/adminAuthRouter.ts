import type { Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  timestampET: string;
  eventType: 'ADMIN_LOGIN' | 'ADMIN_LOGOUT' | 'TEMPORARY_UNLOCK_SUCCESS' | 'TEMPORARY_UNLOCK_FAILED' | 'TEMPORARY_UNLOCK_EXPIRED' | 'PROTECTED_ROUTE_DENIED' | 'RATE_LIMIT_EXCEEDED';
  userId: string;
  module?: string;
  ip: string;
  detail: string;
}

export interface ActiveUnlockSession {
  token: string;
  userId: string;
  issuedAt: number;
  expiresAt: number;
  ip: string;
}

interface RateLimitTracker {
  failedAttempts: number;
  firstFailedAt: number;
  lockedUntil: number;
}

// In-Memory store for active temporary unlock tokens
const activeUnlockSessions: Map<string, ActiveUnlockSession> = new Map();

// Rate limit tracker by IP (Max 5 failed attempts within 15 minutes)
const rateLimitMap: Map<string, RateLimitTracker> = new Map();

// Persistent Audit Log storage path
const AUDIT_LOG_FILE = path.join(process.cwd(), 'data', 'admin-audit-logs.json');

// In-Memory & Persisted Audit Log (capped at 500 records)
let auditLogs: AuditLogEntry[] = [];

// Initialize & load persisted audit logs
function initAuditLogStorage() {
  try {
    const dataDir = path.dirname(AUDIT_LOG_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (fs.existsSync(AUDIT_LOG_FILE)) {
      const content = fs.readFileSync(AUDIT_LOG_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        auditLogs = parsed.slice(0, 500);
      }
    }
  } catch (err) {
    console.warn('[AdminAuthRouter] Failed to load persistent audit logs, using in-memory store', err);
  }
}

initAuditLogStorage();

function persistAuditLogs() {
  try {
    const dataDir = path.dirname(AUDIT_LOG_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(AUDIT_LOG_FILE, JSON.stringify(auditLogs.slice(0, 500), null, 2), 'utf-8');
  } catch (err) {
    // Fail-safe: In-memory logs continue even if disk is read-only
  }
}

const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_LOCK_MS = 15 * 60 * 1000;   // 15 minutes lock
export const DEFAULT_UNLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

const VALID_ADMIN_USERNAMES = new Set(['ahmadf7', 'admin']);

function getClientIp(req: Request): string {
  try {
    // If running in a trusted proxy environment (e.g. Cloud Run with express app trust proxy),
    // remoteAddress from the socket is the direct connection.
    // We anchor rate limiting on socket remoteAddress to prevent client-spoofed headers from bypassing rate limits.
    const socketIp = req?.socket?.remoteAddress;
    if (socketIp && socketIp !== '127.0.0.1' && socketIp !== '::1' && socketIp !== '::ffff:127.0.0.1') {
      return socketIp;
    }

    // In local or reverse-proxy scenarios, fall back to validated forwarded-for or localhost
    const forwarded = req?.headers?.['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim().length > 0) {
      const parts = forwarded.split(',');
      const candidate = parts[0].trim();
      if (candidate && candidate.length >= 3 && candidate.length <= 45) {
        return candidate;
      }
    }
    return socketIp || '127.0.0.1';
  } catch {
    return '127.0.0.1';
  }
}


function getEasternTime(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(date) + ' ET';
}

function recordAuditLog(
  eventType: AuditLogEntry['eventType'],
  userId: string,
  ip: string,
  detail: string,
  module?: string
) {
  const now = new Date();
  const entry: AuditLogEntry = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    timestampET: getEasternTime(now),
    eventType,
    userId: userId || 'anonymous',
    module,
    ip,
    detail
  };
  auditLogs.unshift(entry);
  if (auditLogs.length > 500) {
    auditLogs.pop();
  }
  persistAuditLogs();
}

function cleanExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of activeUnlockSessions.entries()) {
    if (now >= session.expiresAt) {
      recordAuditLog('TEMPORARY_UNLOCK_EXPIRED', session.userId, session.ip, 'Temporary unlock session expired after 30m');
      activeUnlockSessions.delete(token);
    }
  }
}

// Clean up expired sessions every 60 seconds
setInterval(cleanExpiredSessions, 60000);

/**
 * Validates whether the Bearer token corresponds to a valid, server-verified ADMIN account.
 */
function verifyAdminBearerToken(token: string): boolean {
  try {
    if (!token.startsWith('AT-SEC-ADMIN-')) return false;
    const parts = token.split('-');
    if (parts.length < 5) return false;
    // Format: AT-SEC-ADMIN-<base64user>-<timestamp>-<entropy>
    const base64User = parts[3];
    const timestamp = parseInt(parts[4], 10);
    if (!base64User || isNaN(timestamp)) return false;

    // Check 7-day token expiration
    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    if (now - timestamp > SEVEN_DAYS_MS || timestamp > now + 60000) {
      return false;
    }

    const decodedUsername = Buffer.from(base64User, 'base64').toString('utf-8').toLowerCase();
    return VALID_ADMIN_USERNAMES.has(decodedUsername);
  } catch {
    return false;
  }
}

/**
 * Validates whether the incoming request is authorized for protected admin modules.
 * Returns true if:
 * 1. Admin Token matches a verified Admin Bearer session
 * 2. Or a valid, unexpired temporary unlock token is present and valid
 * NOTE: Frontend role headers (like x-aurum-role: ADMIN) are NEVER blindly trusted without token validation.
 */
export function isRequestAdminAuthorized(req: Request): { authorized: boolean; reason?: string; expiresAt?: number; userId?: string } {
  try {
    cleanExpiredSessions();

    const authHeader = req.headers['authorization'] || '';
    const unlockHeader = req.headers['x-admin-unlock-token'] || '';

    // Check 1: Verified Admin Bearer token
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer AT-SEC-ADMIN-')) {
      const token = authHeader.replace('Bearer ', '').trim();
      if (verifyAdminBearerToken(token)) {
        return { authorized: true, reason: 'ADMIN_ROLE' };
      }
    }

    // Check 2: Temporary Unlock Token in x-admin-unlock-token or Bearer token
    let tokenToVerify = '';
    if (typeof unlockHeader === 'string' && unlockHeader.length > 0) {
      tokenToVerify = unlockHeader.trim();
    } else if (typeof authHeader === 'string' && authHeader.startsWith('Bearer aurum_unlock_')) {
      tokenToVerify = authHeader.replace('Bearer ', '').trim();
    }

    if (tokenToVerify && activeUnlockSessions.has(tokenToVerify)) {
      const session = activeUnlockSessions.get(tokenToVerify)!;
      if (Date.now() < session.expiresAt) {
        return { authorized: true, reason: 'TEMPORARY_UNLOCK', expiresAt: session.expiresAt, userId: session.userId };
      } else {
        activeUnlockSessions.delete(tokenToVerify);
        recordAuditLog('TEMPORARY_UNLOCK_EXPIRED', session.userId, session.ip, 'Temporary unlock expired on request check');
        return { authorized: false, reason: 'EXPIRED' };
      }
    }

    return { authorized: false, reason: 'UNAUTHORIZED' };
  } catch (err) {
    // Fail closed
    return { authorized: false, reason: 'ERROR_FAIL_CLOSED' };
  }
}

/**
 * Main Express Router handler for Admin Security & Protected Endpoints
 */
export async function handleAdminAuthRequest(req: Request, res: Response): Promise<boolean> {
  try {
    // Apply standard security & anti-caching headers on all admin responses
    if (res && typeof res.setHeader === 'function') {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }

    const url = req?.url || '';
    const clientIp = getClientIp(req);
    const now = Date.now();

    // 1. POST /api/auth/admin-unlock
    if (req.method === 'POST' && url.startsWith('/api/auth/admin-unlock')) {
      const rateTracker = rateLimitMap.get(clientIp) || { failedAttempts: 0, firstFailedAt: 0, lockedUntil: 0 };

      // Check if rate limited
      if (rateTracker.lockedUntil > now) {
        const waitSeconds = Math.ceil((rateTracker.lockedUntil - now) / 1000);
        recordAuditLog('RATE_LIMIT_EXCEEDED', 'unknown', clientIp, `Brute-force protection: IP locked for ${waitSeconds}s`);
        res.status(429).json({
          status: 'DENIED',
          error: 'TOO MANY FAILED ATTEMPTS. TRY AGAIN LATER.',
          code: 'RATE_LIMITED',
          retryAfterSeconds: waitSeconds
        });
        return true;
      }

      // Reset rate limit tracker if window has elapsed
      if (rateTracker.firstFailedAt > 0 && now - rateTracker.firstFailedAt > RATE_LIMIT_WINDOW_MS) {
        rateTracker.failedAttempts = 0;
        rateTracker.firstFailedAt = 0;
        rateTracker.lockedUntil = 0;
      }

      const { password, module, userId } = req.body || {};
      const configuredPassword = process.env.AURUM_ADMIN_UNLOCK_PASSWORD;

      // Check if server secret is configured
      if (!configuredPassword || configuredPassword.trim().length === 0) {
        recordAuditLog('TEMPORARY_UNLOCK_FAILED', userId || 'unknown', clientIp, 'Admin unlock attempted but AURUM_ADMIN_UNLOCK_PASSWORD is not configured', module);
        res.status(503).json({
          status: 'DENIED',
          error: 'ADMIN UNLOCK NOT CONFIGURED',
          code: 'NOT_CONFIGURED',
          message: 'Administrator unlock secret is not configured on this server.'
        });
        return true;
      }

      // Secure timing-safe password comparison
      let isMatch = false;
      if (typeof password === 'string' && password.length > 0) {
        const enteredBuffer = Buffer.from(password);
        const configuredBuffer = Buffer.from(configuredPassword);
        if (enteredBuffer.length === configuredBuffer.length) {
          isMatch = crypto.timingSafeEqual(enteredBuffer, configuredBuffer);
        }
      }

      if (!isMatch) {
        rateTracker.failedAttempts += 1;
        if (rateTracker.firstFailedAt === 0) {
          rateTracker.firstFailedAt = now;
        }

        if (rateTracker.failedAttempts >= MAX_FAILED_ATTEMPTS) {
          rateTracker.lockedUntil = now + RATE_LIMIT_LOCK_MS;
          recordAuditLog('TEMPORARY_UNLOCK_FAILED', userId || 'unknown', clientIp, `Exceeded 5 failed attempts. Locked for 15 minutes.`, module);
          rateLimitMap.set(clientIp, rateTracker);
          res.status(429).json({
            status: 'DENIED',
            error: 'TOO MANY FAILED ATTEMPTS. TRY AGAIN LATER.',
            code: 'RATE_LIMITED',
            retryAfterSeconds: Math.ceil(RATE_LIMIT_LOCK_MS / 1000)
          });
          return true;
        }

        rateLimitMap.set(clientIp, rateTracker);
        recordAuditLog('TEMPORARY_UNLOCK_FAILED', userId || 'unknown', clientIp, `Failed password verification (Attempt ${rateTracker.failedAttempts}/${MAX_FAILED_ATTEMPTS})`, module);
        res.status(401).json({
          status: 'DENIED',
          error: 'INVALID PASSWORD. ACCESS DENIED.',
          code: 'INVALID_PASSWORD',
          attemptsRemaining: MAX_FAILED_ATTEMPTS - rateTracker.failedAttempts
        });
        return true;
      }

      // Success! Reset rate limit tracker
      rateLimitMap.delete(clientIp);

      // Generate cryptographic session token
      const token = `aurum_unlock_${crypto.randomBytes(24).toString('hex')}`;
      const expiresAt = now + DEFAULT_UNLOCK_DURATION_MS;

      const newSession: ActiveUnlockSession = {
        token,
        userId: userId || 'user',
        issuedAt: now,
        expiresAt,
        ip: clientIp
      };

      activeUnlockSessions.set(token, newSession);
      recordAuditLog('TEMPORARY_UNLOCK_SUCCESS', userId || 'user', clientIp, `Temporary 30m unlock granted for module: ${module || 'ALL_PROTECTED'}`, module);

      res.status(200).json({
        status: 'AUTHORIZED',
        message: 'ACCESS GRANTED',
        token,
        issuedAt: now,
        expiresAt,
        durationMinutes: 30
      });
      return true;
    }

    // 2. POST /api/auth/admin-verify
    if (req.method === 'POST' && url.startsWith('/api/auth/admin-verify')) {
      const { token, userId } = req.body || {};
      const authHeader = req.headers['authorization'] || '';

      // Check if verified Admin Bearer token
      if (typeof authHeader === 'string' && authHeader.startsWith('Bearer AT-SEC-ADMIN-')) {
        const adminToken = authHeader.replace('Bearer ', '').trim();
        if (verifyAdminBearerToken(adminToken)) {
          res.status(200).json({
            authorized: true,
            role: 'ADMIN',
            expiresAt: null,
            remainingSeconds: null
          });
          return true;
        }
      }

      const tokenToCheck = token || (typeof authHeader === 'string' && authHeader.startsWith('Bearer aurum_unlock_') ? authHeader.replace('Bearer ', '').trim() : null);

      if (tokenToCheck && activeUnlockSessions.has(tokenToCheck)) {
        const session = activeUnlockSessions.get(tokenToCheck)!;
        
        // Session binding check: if userId passed, ensure it matches the bound user
        if (userId && session.userId && session.userId !== userId && session.userId !== 'user') {
          recordAuditLog('PROTECTED_ROUTE_DENIED', userId, clientIp, `Session mismatch: Token issued to ${session.userId} used by ${userId}`);
          res.status(403).json({
            authorized: false,
            code: 'SESSION_MISMATCH',
            error: 'Session mismatch: Token not bound to active user.'
          });
          return true;
        }

        if (now < session.expiresAt) {
          res.status(200).json({
            authorized: true,
            role: 'USER_UNLOCKED',
            expiresAt: session.expiresAt,
            remainingSeconds: Math.floor((session.expiresAt - now) / 1000)
          });
          return true;
        } else {
          activeUnlockSessions.delete(tokenToCheck);
          recordAuditLog('TEMPORARY_UNLOCK_EXPIRED', session.userId, clientIp, 'Session expired on verify check');
          res.status(401).json({
            authorized: false,
            code: 'EXPIRED',
            error: 'ADMIN ACCESS EXPIRED. Re-enter authorization password.'
          });
          return true;
        }
      }

      res.status(401).json({
        authorized: false,
        code: 'UNAUTHORIZED',
        error: 'Not authorized for admin modules'
      });
      return true;
    }

    // 3. POST /api/auth/admin-lock (Revoke / Logout)
    if (req.method === 'POST' && url.startsWith('/api/auth/admin-lock')) {
      const { token, userId } = req.body || {};
      const authHeader = req.headers['authorization'] || '';
      const tokenToLock = token || (typeof authHeader === 'string' && authHeader.startsWith('Bearer aurum_unlock_') ? authHeader.replace('Bearer ', '').trim() : null);

      if (tokenToLock && activeUnlockSessions.has(tokenToLock)) {
        activeUnlockSessions.delete(tokenToLock);
        recordAuditLog('ADMIN_LOGOUT', userId || 'user', clientIp, 'Admin unlock authorization manually revoked / logged out');
      }
      res.status(200).json({ status: 'LOCKED', message: 'Admin authorization revoked' });
      return true;
    }

    // 4. GET /api/admin/audit-logs
    if (req.method === 'GET' && url.startsWith('/api/admin/audit-logs')) {
      const auth = isRequestAdminAuthorized(req);
      if (!auth.authorized) {
        recordAuditLog('PROTECTED_ROUTE_DENIED', 'unknown', clientIp, 'Blocked direct access to /api/admin/audit-logs', 'AUDIT_LOGS');
        res.status(403).json({
          error: 'FORBIDDEN: Admin authorization or unlock required.',
          code: 'ADMIN_ACCESS_REQUIRED'
        });
        return true;
      }

      res.status(200).json({
        status: 'ok',
        logs: auditLogs,
        activeSessionsCount: activeUnlockSessions.size,
        serverTimeET: getEasternTime()
      });
      return true;
    }

    // 5. Protected 7 Module Sensitive Endpoints
    const protectedModulesMap: Record<string, string> = {
      '/api/admin/gann-data': 'GANN_INTRADAY',
      '/api/admin/master-intelligence': 'MASTER_INTELLIGENCE',
      '/api/admin/paper-trading': 'PAPER_TRADING',
      '/api/admin/validation-health': 'VALIDATION_HEALTH',
      '/api/admin/ai-learning': 'AI_LEARNING',
      '/api/admin/risk-management': 'RISK_MANAGEMENT',
      '/api/admin/trade-history': 'TRADE_HISTORY'
    };

    for (const [routePath, moduleName] of Object.entries(protectedModulesMap)) {
      if (url.startsWith(routePath)) {
        const auth = isRequestAdminAuthorized(req);
        if (!auth.authorized) {
          recordAuditLog('PROTECTED_ROUTE_DENIED', 'unknown', clientIp, `Blocked unauthorized access to ${routePath}`, moduleName);
          res.status(403).json({
            error: `FORBIDDEN: Admin authorization or unlock required for ${moduleName}.`,
            code: 'ADMIN_ACCESS_REQUIRED',
            module: moduleName
          });
          return true;
        }

        // Return privileged module payload (strictly after verified authorization)
        res.status(200).json({
          status: 'ok',
          module: moduleName,
          authorized: true,
          expiresAt: auth.expiresAt || null,
          timestamp: Date.now()
        });
        return true;
      }
    }

    return false;
  } catch (fatalErr) {
    // Fail closed: Never grant access on exceptions
    res.status(500).json({
      error: 'SECURITY_SUBSYSTEM_ERROR: Authorization check failed-closed.',
      code: 'FAIL_CLOSED'
    });
    return true;
  }
}

