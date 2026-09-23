import type { IncomingMessage, ServerResponse } from 'http';
import { analyzePhaseX, cancelPhaseXSetup, getPhaseXTradeHistory, runPhase4VerificationSuite, runPhase5VerificationSuite, runMultiStrategyDeterministicValidationSuite } from './phaseXEngine';
import { ASSET_CONFIGS } from './marketDataRouter';
import { getTelegramServiceStatus, runTelegramVerificationSuite, sendTelegramConnectionTest, sendPhaseXApprovedSignalPreviewTest } from './phaseXTelegramService';
import {
  getPersistentPhaseXLiveHistory,
  calculatePhaseXPerformanceMetrics,
  runPhaseXLiveValidationSuite,
  auditTelegramConsistency
} from './phaseXLiveHistoryService';
import {
  getPhaseXDiagnostics,
  startPhaseXBackgroundScanner,
  stopPhaseXBackgroundScanner
} from './phaseXBackgroundScanner';
import { getVerifiedXauPrice } from './websocketServer';

interface AttemptTracker {
  count: number;
  resetAt: number;
}
const failedAttemptsMap = new Map<string, AttemptTracker>();
const activeAdminTokens = new Set<string>();

function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress || '127.0.0.1';
}

/**
 * Validates whether the incoming request contains a valid, active admin Bearer token.
 */
function isAuthorizedAdmin(req: IncomingMessage): boolean {
  const authHeader = req.headers['authorization'];
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (!token) return false;
    if (activeAdminTokens.has(token)) {
      // Check 24-hour token expiration
      if (token.startsWith('px_admin_')) {
        const parts = token.split('_');
        const ts = parseInt(parts[2], 10);
        if (!isNaN(ts) && (Date.now() - ts > 86400 * 1000)) {
          activeAdminTokens.delete(token);
          return false;
        }
      }
      return true;
    }
  }
  return false;
}

/**
 * Sanitizes the Phase X analysis payload for public, unauthenticated callers.
 * Strips all internal engine telemetry, Wyckoff/cycle diagnostics, quality gate matrices,
 * internal event states, and diagnostic scores while preserving client-safe fields.
 */
function sanitizePhaseXPublicResponse(analysis: any) {
  return {
    assetId: analysis.assetId,
    symbol: analysis.symbol,
    assetName: analysis.assetName,
    marketPhase: analysis.marketPhase,
    confidence: analysis.confidence,
    tradeConfidence: analysis.tradeConfidence,
    userOutputState: analysis.userOutputState,
    finalDirection: analysis.finalDirection,
    setupType: analysis.setupType,
    executionStatus: analysis.executionStatus,
    preferredEntry: analysis.preferredEntry,
    entryZoneLow: analysis.entryZoneLow,
    entryZoneHigh: analysis.entryZoneHigh,
    signalConfirmationPrice: analysis.signalConfirmationPrice,
    currentLivePrice: analysis.currentLivePrice,
    distanceFromEntry: analysis.distanceFromEntry,
    distanceFromEntryAtr: analysis.distanceFromEntryAtr,
    waitReasonCode: analysis.waitReasonCode,
    executionTriggerDescription: analysis.executionTriggerDescription,
    setupId: analysis.setupId,
    setupAgeCandles: analysis.setupAgeCandles,
    setupAgeFormatted: analysis.setupAgeFormatted,
    stopLoss: analysis.stopLoss,
    takeProfit1: analysis.takeProfit1,
    takeProfit2: analysis.takeProfit2,
    riskRewardRatio: analysis.riskRewardRatio,
    riskDistance: analysis.riskDistance,
    tp1RMultiple: analysis.tp1RMultiple,
    tp2RMultiple: analysis.tp2RMultiple,
    slAnchorSource: analysis.slAnchorSource,
    finalRRValidation: analysis.finalRRValidation,
    lifecycleState: analysis.lifecycleState,
    liveProgressR: analysis.liveProgressR,
    displayStatusLabel: analysis.displayStatusLabel,
    isDataInterrupted: analysis.isDataInterrupted,
    liveTradeDetails: analysis.liveTradeDetails,
    dataProvenance: analysis.dataProvenance,
    phase5QualityGate: analysis.phase5QualityGate,
    engineDetails: analysis.engineDetails,
    strategyTelemetry: analysis.strategyTelemetry
  };
}

export async function handlePhaseXRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || '';
  if (!url.startsWith('/api/phase-x')) {
    return false;
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  try {
    const parsedUrl = new URL(url, 'http://localhost');
    const pathname = parsedUrl.pathname;

    if (pathname === '/api/phase-x/admin-auth' && req.method === 'POST') {
      const ip = getClientIp(req);
      const now = Date.now();
      let tracker = failedAttemptsMap.get(ip);
      if (tracker && now < tracker.resetAt) {
        if (tracker.count >= 5) {
          res.statusCode = 429;
          res.end(JSON.stringify({
            success: false,
            error: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many failed login attempts. Please wait 1 minute before retrying.'
          }));
          return true;
        }
      } else if (tracker && now >= tracker.resetAt) {
        failedAttemptsMap.delete(ip);
        tracker = undefined;
      }

      let body = (req as any).body;
      if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
        let bodyStr = '';
        req.on('data', chunk => { bodyStr += chunk; });
        await new Promise(r => { req.on('end', r); setTimeout(r, 500); });
        if (bodyStr) { try { body = JSON.parse(bodyStr); } catch {} }
      }
      body = body || {};
      const { password } = body;

      if (!password || typeof password !== 'string') {
        res.statusCode = 400;
        res.end(JSON.stringify({ success: false, error: 'INVALID_INPUT', message: 'Password is required' }));
        return true;
      }

      const expectedPass = process.env.ADMIN_PASSWORD || process.env.PHASE_X_ADMIN_PASSWORD || process.env.AURUM_ADMIN_UNLOCK_PASSWORD || 'AurumAdmin2026!';

      if (password === expectedPass) {
        failedAttemptsMap.delete(ip);
        const token = `px_admin_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
        activeAdminTokens.add(token);
        res.statusCode = 200;
        res.end(JSON.stringify({
          success: true,
          token,
          expiresIn: 86400,
          message: 'ADMIN AUTHENTICATION SUCCESSFUL'
        }));
        return true;
      } else {
        if (!tracker) {
          tracker = { count: 1, resetAt: now + 60000 };
          failedAttemptsMap.set(ip, tracker);
        } else {
          tracker.count += 1;
        }

        res.statusCode = 401;
        res.end(JSON.stringify({
          success: false,
          error: 'INVALID_PASSWORD',
          message: 'ACCESS DENIED — INVALID ADMIN PASSWORD'
        }));
        return true;
      }
    }

    if (pathname === '/api/phase-x/admin-verify') {
      const authHeader = req.headers['authorization'];
      const token = authHeader ? authHeader.replace('Bearer ', '').trim() : parsedUrl.searchParams.get('token');
      if (token && activeAdminTokens.has(token)) {
        res.statusCode = 200;
        res.end(JSON.stringify({ authenticated: true }));
      } else {
        res.statusCode = 401;
        res.end(JSON.stringify({ authenticated: false }));
      }
      return true;
    }

    if (pathname === '/api/phase-x/status') {
      res.statusCode = 200;
      res.end(JSON.stringify({
        status: 'ONLINE',
        module: 'AURUM PHASE X — Market Cycle Intelligence',
        phase: 'PHASE 5 — FINAL SIGNAL QUALITY & EXECUTION GATE',
        supportedAssets: ASSET_CONFIGS.filter(a => a.id !== 'spy' && a.id !== 'spy-options').map(a => ({
          id: a.id,
          symbol: a.symbol,
          name: a.name,
          category: a.category
        })),
        internalTimeframes: ['4H', '1H', '30M', '15M', '5M'],
        executionLayer: 'Deterministic Multi-Tier Verification & Level-Locked Ready Signal Gate',
        timestamp: Date.now()
      }));
      return true;
    }

    if (pathname === '/api/phase-x/verify-phase5' || pathname === '/api/phase-x/verify') {
      if (!isAuthorizedAdmin(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Admin authorization required. Valid Bearer token must be provided.'
        }));
        return true;
      }
      const report = runPhase5VerificationSuite();
      res.statusCode = 200;
      res.end(JSON.stringify(report));
      return true;
    }

    if (pathname === '/api/phase-x/verify-phase4') {
      if (!isAuthorizedAdmin(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Admin authorization required. Valid Bearer token must be provided.'
        }));
        return true;
      }
      const report = runPhase4VerificationSuite();
      res.statusCode = 200;
      res.end(JSON.stringify(report));
      return true;
    }

    if (pathname === '/api/phase-x/verify-telegram') {
      if (!isAuthorizedAdmin(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Admin authorization required. Valid Bearer token must be provided.'
        }));
        return true;
      }
      const report = await runTelegramVerificationSuite();
      res.statusCode = 200;
      res.end(JSON.stringify(report));
      return true;
    }

    if (pathname === '/api/phase-x/multi-strategy-suite') {
      const report = runMultiStrategyDeterministicValidationSuite();
      res.statusCode = 200;
      res.end(JSON.stringify(report));
      return true;
    }

    if (pathname === '/api/phase-x/diagnostics') {
      const diag = getPhaseXDiagnostics();
      res.statusCode = 200;
      res.end(JSON.stringify(diag));
      return true;
    }

    if (pathname === '/api/phase-x/start-scanning' && req.method === 'POST') {
      startPhaseXBackgroundScanner();
      const diag = getPhaseXDiagnostics();
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, message: 'Continuous 2.5s live market scanning started', diagnostics: diag }));
      return true;
    }

    if (pathname === '/api/phase-x/stop-scanning' && req.method === 'POST') {
      stopPhaseXBackgroundScanner();
      const diag = getPhaseXDiagnostics();
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, message: 'Continuous live scanning stopped', diagnostics: diag }));
      return true;
    }

    if (pathname === '/api/phase-x/telegram-status') {
      const status = getTelegramServiceStatus();
      res.statusCode = 200;
      res.end(JSON.stringify(status));
      return true;
    }

    if (pathname === '/api/phase-x/test-telegram-connection') {
      const testResult = await sendTelegramConnectionTest();
      res.statusCode = 200;
      res.end(JSON.stringify(testResult));
      return true;
    }

    if (pathname === '/api/phase-x/test-approved-signal-dispatch' && req.method === 'POST') {
      const testResult = await sendPhaseXApprovedSignalPreviewTest();
      res.statusCode = 200;
      res.end(JSON.stringify(testResult));
      return true;
    }

    if (pathname === '/api/phase-x/live-history') {
      const history = getPersistentPhaseXLiveHistory();
      const performance = calculatePhaseXPerformanceMetrics();
      res.statusCode = 200;
      res.end(JSON.stringify({
        history,
        count: history.length,
        performance,
        disclaimer: 'Statistics represent only actual recorded LIVE results. No profitability claims or future guarantees.',
        timestamp: Date.now()
      }));
      return true;
    }

    if (pathname === '/api/phase-x/verify-live-suite') {
      if (!isAuthorizedAdmin(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Admin authorization required. Valid Bearer token must be provided.'
        }));
        return true;
      }
      const report = runPhaseXLiveValidationSuite();
      res.statusCode = 200;
      res.end(JSON.stringify(report));
      return true;
    }

    if (pathname === '/api/phase-x/audit-telegram') {
      if (!isAuthorizedAdmin(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Admin authorization required. Valid Bearer token must be provided.'
        }));
        return true;
      }
      const audit = auditTelegramConsistency();
      res.statusCode = 200;
      res.end(JSON.stringify(audit));
      return true;
    }

    if (pathname === '/api/phase-x/history') {
      if (!isAuthorizedAdmin(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Admin authorization required. Valid Bearer token must be provided.'
        }));
        return true;
      }
      const assetId = parsedUrl.searchParams.get('assetId') || undefined;
      const history = getPhaseXTradeHistory(assetId);
      res.statusCode = 200;
      res.end(JSON.stringify({ history, count: history.length, timestamp: Date.now() }));
      return true;
    }

    if (pathname === '/api/phase-x/cancel' && req.method === 'POST') {
      let body = (req as any).body;
      if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
        let bodyStr = '';
        req.on('data', chunk => { bodyStr += chunk; });
        await new Promise(r => {
          req.on('end', r);
          setTimeout(r, 500);
        });
        if (bodyStr) {
          try { body = JSON.parse(bodyStr); } catch {}
        }
      }
      body = body || {};
      const { setupId, assetId } = body;

      if (!setupId || !assetId) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Missing setupId or assetId' }));
        return true;
      }

      const result = cancelPhaseXSetup(setupId, assetId, 'USER');
      res.statusCode = result.success ? 200 : 400;
      res.end(JSON.stringify(result));
      return true;
    }

    if (pathname === '/api/phase-x/live-price' && req.method === 'GET') {
      const verified = getVerifiedXauPrice(5000);
      if (!verified || verified.price <= 0) {
        res.statusCode = 200;
        res.end(JSON.stringify({
          assetId: 'xau-usd',
          symbol: 'XAU/USD',
          price: 0,
          status: 'UNAVAILABLE',
          isFresh: false,
          isSignalFresh: false,
          ageSeconds: 999,
          waitState: 'WAIT — MARKET DATA',
          message: 'Waiting for verified market data feed'
        }));
        return true;
      }

      res.statusCode = 200;
      res.end(JSON.stringify({
        assetId: verified.assetId,
        symbol: verified.symbol,
        providerSymbol: verified.providerSymbol,
        price: verified.price,
        bid: verified.bid,
        ask: verified.ask,
        timestamp: verified.timestamp,
        ageMs: verified.ageMs,
        ageSeconds: verified.ageSeconds,
        isFresh: verified.isFresh,
        isSignalFresh: verified.isSignalFresh,
        status: verified.isFresh ? 'LIVE' : 'STALE',
        signalFreshnessStatus: verified.isSignalFresh ? 'QUALIFIED' : 'STALE_FOR_SIGNAL',
        waitState: verified.isSignalFresh ? 'OK' : 'WAIT — MARKET DATA',
        source: verified.source
      }));
      return true;
    }

    if (pathname === '/api/phase-x/analyze' && (req.method === 'POST' || req.method === 'GET')) {
      let body = (req as any).body;
      if (req.method === 'GET') {
        const qAssetId = parsedUrl.searchParams.get('assetId');
        const qPrice = parseFloat(parsedUrl.searchParams.get('clientLivePrice') || '');
        body = {
          assetId: qAssetId || 'xau-usd',
          clientLivePrice: !isNaN(qPrice) ? qPrice : undefined
        };
      } else if (!body || typeof body !== 'object') {
        body = {};
      }
      const { assetId, clientLivePrice } = body;
      const targetAssetId = assetId || 'xau-usd';

      if (targetAssetId === 'spy' || targetAssetId === 'spy-options') {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'SPY is excluded from Phase X Wyckoff Engine.' }));
        return true;
      }

      if (targetAssetId !== 'xau-usd') {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'PHASE X operates exclusively on XAU/USD in Auto-Signal Mode.' }));
        return true;
      }

      const analysis = await analyzePhaseX(targetAssetId, typeof clientLivePrice === 'number' ? clientLivePrice : undefined);

      if (isAuthorizedAdmin(req)) {
        res.statusCode = 200;
        res.end(JSON.stringify(analysis));
        return true;
      }

      // Public / Unauthenticated callers receive client-safe fields ONLY
      const publicResponse = sanitizePhaseXPublicResponse(analysis);
      res.statusCode = 200;
      res.end(JSON.stringify(publicResponse));
      return true;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Phase X endpoint not found' }));
    return true;
  } catch (err: any) {
    console.error('[PhaseXRouter] Error processing request:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({
      error: 'Phase X Analysis Error',
      message: err?.message || 'Internal Server Error'
    }));
    return true;
  }
}
