/**
 * AURUM CATALYST — API ROUTER (PHASE 4)
 * 
 * Endpoints:
 * Public (Clean status only):
 * - GET /api/catalyst/state
 * 
 * Admin / Performance & Risk Reporting (Protected/Backend):
 * - GET /api/catalyst/performance
 * - GET /api/catalyst/daily-stats
 * - GET /api/catalyst/risk-status
 * - GET /api/catalyst/trades
 * - GET /api/catalyst/audit-logs
 * - POST /api/catalyst/admin/reset-risk
 * - POST /api/catalyst/admin/update-config
 * - POST /api/catalyst/force-scan
 * - POST /api/catalyst/reset
 * - POST /api/catalyst/test-signal
 */

import { Request, Response } from 'express';
import {
  getCatalystPublicState,
  executeCatalystScanCycle,
  resetCatalystActiveTrade,
  getCatalystAuditLogs
} from './catalystBackgroundScanner';
import {
  calculateCatalystPerformanceStats,
  getCatalystDailyState,
  getCatalystRiskConfig,
  getCatalystCompletedTrades,
  resetCatalystRiskStatusManual,
  updateCatalystRiskConfig,
  getFeedHealthMetrics
} from './catalystRiskService';
import {
  generateCompleteAnalyticsReport,
  getDirectionAnalytics,
  getQualityBandAnalytics,
  getTimeOfDayAnalytics,
  getWeeklyPerformanceAnalytics
} from './catalystAnalyticsService';
import {
  getCatalystHealthSummary,
  recalculateValidationSession,
  getMonthlyValidationReport,
  runDataIntegrityAudit
} from './catalystValidationHealthService';
import {
  getOperationsSummary,
  pauseCatalystEmergency,
  resumeCatalystEmergency,
  setMaintenanceMode,
  evaluateMasterSafetyGate
} from './catalystOperationsService';
import { getCloudLogs } from './cloudLoggingService';
import { dispatchCatalystTelegramSignal } from './catalystTelegramService';
import { getVerifiedXauPrice } from './websocketServer';

export async function handleCatalystRequest(req: Request, res: Response): Promise<boolean> {
  const url = req.url || '';
  if (!url.startsWith('/api/catalyst')) {
    return false;
  }

  const pathname = url.split('?')[0];

  try {
    // 1. GET State (Clean minimal state for public/normal UI)
    if (pathname === '/api/catalyst/state' && req.method === 'GET') {
      const state = getCatalystPublicState();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(state));
      return true;
    }

    // Phase 7 Live Operations & Production Status Endpoints (Admin)
    if (pathname === '/api/catalyst/production-status' && req.method === 'GET') {
      const ops = getOperationsSummary();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ productionStatus: ops.productionStatus, safetyGate: ops.safetyGate }));
      return true;
    }

    if (pathname === '/api/catalyst/operations' && req.method === 'GET') {
      const ops = getOperationsSummary();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(ops));
      return true;
    }

    if (pathname === '/api/catalyst/operations/daily' && req.method === 'GET') {
      const ops = getOperationsSummary();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ dailySummary: ops }));
      return true;
    }

    if (pathname === '/api/catalyst/cloud-logs' && req.method === 'GET') {
      const logs = getCloudLogs();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ cloudLogsCount: logs.length, logs }));
      return true;
    }

    if (pathname === '/api/catalyst/pause' && req.method === 'POST') {
      const body = req.body || {};
      const reason = body.reason || 'Admin Emergency Pause';
      const updated = pauseCatalystEmergency(reason);
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, message: 'Catalyst Emergency Pause Activated', state: updated }));
      return true;
    }

    if (pathname === '/api/catalyst/resume' && req.method === 'POST') {
      const result = resumeCatalystEmergency();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(result.success ? 200 : 400);
      res.end(JSON.stringify(result));
      return true;
    }

    if (pathname === '/api/catalyst/maintenance' && req.method === 'POST') {
      const body = req.body || {};
      const enabled = body.enabled !== false;
      const reason = body.reason || 'System Maintenance';
      const updated = setMaintenanceMode(enabled, reason);
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, message: `Maintenance mode ${enabled ? 'ENABLED' : 'DISABLED'}`, state: updated }));
      return true;
    }

    // Phase 6 System Health & Validation Endpoints (Admin)
    if (pathname === '/api/catalyst/health' && req.method === 'GET') {
      const health = getCatalystHealthSummary();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(health));
      return true;
    }

    if (pathname === '/api/catalyst/validation' && req.method === 'GET') {
      const session = recalculateValidationSession();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ validationSession: session }));
      return true;
    }

    if (pathname === '/api/catalyst/validation/daily' && req.method === 'GET') {
      const report = generateCompleteAnalyticsReport();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ dailyHistory: report.dailyHistory }));
      return true;
    }

    if (pathname === '/api/catalyst/validation/weekly' && req.method === 'GET') {
      const weekly = getWeeklyPerformanceAnalytics();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ weeklyPerformance: weekly }));
      return true;
    }

    if (pathname === '/api/catalyst/validation/monthly' && req.method === 'GET') {
      const monthly = getMonthlyValidationReport();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(monthly));
      return true;
    }

    if (pathname === '/api/catalyst/integrity' && req.method === 'GET') {
      const integrity = runDataIntegrityAudit();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(integrity));
      return true;
    }

    if (pathname === '/api/catalyst/telegram-health' && req.method === 'GET') {
      const health = getCatalystHealthSummary();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ telegramHealth: health.telegram }));
      return true;
    }

    if (pathname === '/api/catalyst/feed-health' && req.method === 'GET') {
      const feed = getFeedHealthMetrics();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ feedHealth: feed }));
      return true;
    }

    // Phase 5 Analytics Endpoints (Protected/Admin)
    if (pathname === '/api/catalyst/analytics' && req.method === 'GET') {
      const report = generateCompleteAnalyticsReport();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(report));
      return true;
    }

    if (pathname === '/api/catalyst/analytics/direction' && req.method === 'GET') {
      const direction = getDirectionAnalytics();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(direction));
      return true;
    }

    if (pathname === '/api/catalyst/analytics/quality' && req.method === 'GET') {
      const quality = getQualityBandAnalytics();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(quality));
      return true;
    }

    if (pathname === '/api/catalyst/analytics/time' && req.method === 'GET') {
      const timeData = getTimeOfDayAnalytics();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(timeData));
      return true;
    }

    if (pathname === '/api/catalyst/analytics/daily' && req.method === 'GET') {
      const report = generateCompleteAnalyticsReport();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ dailyHistory: report.dailyHistory }));
      return true;
    }

    if (pathname === '/api/catalyst/analytics/weekly' && req.method === 'GET') {
      const weekly = getWeeklyPerformanceAnalytics();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ weeklyPerformance: weekly }));
      return true;
    }

    // 2. GET Performance Statistics (Admin / Forward-Validation reporting)
    if (pathname === '/api/catalyst/performance' && req.method === 'GET') {
      const stats = calculateCatalystPerformanceStats();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(stats));
      return true;
    }

    // 3. GET Daily Stats (Admin)
    if (pathname === '/api/catalyst/daily-stats' && req.method === 'GET') {
      const daily = getCatalystDailyState();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(daily));
      return true;
    }

    // 4. GET Risk Status & Config (Admin)
    if (pathname === '/api/catalyst/risk-status' && req.method === 'GET') {
      const config = getCatalystRiskConfig();
      const daily = getCatalystDailyState();
      const feed = getFeedHealthMetrics();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ config, daily, feed }));
      return true;
    }

    // 5. GET Completed Forward-Validation Trades (Admin)
    if (pathname === '/api/catalyst/trades' && req.method === 'GET') {
      const limit = parseInt(String(req.query?.limit || '100'), 10) || 100;
      const trades = getCatalystCompletedTrades(limit);
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ count: trades.length, trades }));
      return true;
    }

    // 6. GET Audit Logs (Admin)
    if (pathname === '/api/catalyst/audit-logs' && req.method === 'GET') {
      const logs = getCatalystAuditLogs();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ module: 'AURUM CATALYST AUDIT TRAIL', count: logs.length, logs }));
      return true;
    }

    // 7. POST Admin Reset Risk Lock / Pause
    if (pathname === '/api/catalyst/admin/reset-risk' && req.method === 'POST') {
      const body = req.body || {};
      const resetType = body.resetType || 'ALL';
      resetCatalystRiskStatusManual(resetType);
      const daily = getCatalystDailyState();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, message: `Reset performed (${resetType})`, dailyState: daily }));
      return true;
    }

    // 8. POST Admin Update Risk Config
    if (pathname === '/api/catalyst/admin/update-config' && req.method === 'POST') {
      const body = req.body || {};
      const updated = updateCatalystRiskConfig(body);
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, config: updated }));
      return true;
    }

    // 9. Force Scan
    if (pathname === '/api/catalyst/force-scan' && (req.method === 'POST' || req.method === 'GET')) {
      await executeCatalystScanCycle(true);
      const state = getCatalystPublicState();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, state }));
      return true;
    }

    // 10. Reset Active Trade
    if (pathname === '/api/catalyst/reset' && req.method === 'POST') {
      resetCatalystActiveTrade();
      const state = getCatalystPublicState();
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, state }));
      return true;
    }

    // 11. Test Telegram Signal Dispatch
    if (pathname === '/api/catalyst/test-signal' && req.method === 'POST') {
      const liveXau = getVerifiedXauPrice(45000);
      const entry = liveXau && liveXau.price > 0 ? +liveXau.price.toFixed(2) : 4150.00;
      const tgRes = await dispatchCatalystTelegramSignal({
        direction: 'BUY',
        entry,
        sl: +(entry - 10.00).toFixed(2),
        tp1: +(entry + 7.00).toFixed(2),
        tp2: +(entry + 11.00).toFixed(2)
      });
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ success: tgRes.success, status: tgRes.status, error: tgRes.error }));
      return true;
    }

    res.setHeader('Content-Type', 'application/json');
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Catalyst endpoint not found' }));
    return true;
  } catch (err: any) {
    console.error('[CatalystRouter] Error handling request:', err);
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(500);
    res.end(JSON.stringify({ error: err?.message || 'Internal Catalyst server error' }));
    return true;
  }
}
