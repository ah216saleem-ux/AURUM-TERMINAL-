import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { handleMarketDataRequest } from './server/marketDataRouter';
import { handleNewsRequest } from './server/newsRouter';
import { handleQwenRequest, handleQwenStatus } from './server/qwenRouter';
import { handleSpySniperRequest } from './server/spySniperRouter';
import { handleTerminalSignalsRequest } from './server/terminalSignalsRouter';
import { handlePhaseXRequest } from './server/phaseXRouter';
import { handleAdminAuthRequest } from './server/adminAuthRouter';
import { initWebSocketServer } from './server/websocketServer';
import { initExecutionIntelligence, handleExecutionIntelligenceRequest } from './server/executionIntelligenceRouter';
import { handleMarketContextRequest } from './server/marketContextRouter';
import { initDecisionJournal, handleDecisionAuditRequest } from './server/decisionAuditRouter';
import { handleScenarioLabRequest } from './server/scenarioSimulationRouter';
import { handleStrategyMemoryRequest } from './server/strategyMemoryRouter';
import { handleGoldDataIntegrityRequest } from './server/goldDataIntegrityRouter';
import { handleGoldNewsIntelligenceRequest } from './server/goldNewsEngine';
import { startPhaseXBackgroundScanner } from './server/phaseXBackgroundScanner';
import { handleCatalystRequest } from './server/catalystRouter';
import { startCatalystBackgroundScanner } from './server/catalystBackgroundScanner';
import { startTelegramBotPolling } from './server/telegramBotCommandsService';
import { handleAiAgentRequest } from './server/aiAgentRouter';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Boot Phase X Continuous Automated Background Scanner
  startPhaseXBackgroundScanner();

  // Boot Aurum Catalyst Continuous Automated Background Scanner
  startCatalystBackgroundScanner();

  // Boot 2-Way Interactive Telegram Bot Command Listener
  startTelegramBotPolling();

  // Initialize Execution Intelligence Module Data Store
  initExecutionIntelligence();
  initDecisionJournal();

  // Body parser is already mounted
  app.use(express.json());

  // Gemini Institutional AI Agent Router
  app.all('/api/ai-agent*', async (req, res) => {
    const handled = await handleAiAgentRequest(req, res);
    if (!handled && !res.headersSent) {
      res.status(404).json({ error: 'AI Agent route not found' });
    }
  });

  // Admin Security & Protected Module Routes
  app.all(['/api/auth/admin*', '/api/admin*'], async (req, res) => {
    const handled = await handleAdminAuthRequest(req, res);
    if (!handled && !res.headersSent) {
      res.status(404).json({ error: 'Admin route not found' });
    }
  });

  // Qwen AI analysis routes
  app.get('/api/qwen-status', async (req, res) => {
    await handleQwenStatus(req, res);
  });
  app.post('/api/qwen-analysis', async (req, res) => {
    await handleQwenRequest(req, res);
  });

  // News API route
  app.get('/api/news', async (req, res) => {
    await handleNewsRequest(req, res);
  });

  // Dedicated Gold News Intelligence Engine route
  app.all('/api/gold-news-intelligence*', async (req, res) => {
    const handled = await handleGoldNewsIntelligenceRequest(req, res);
    if (!handled && !res.headersSent) {
      res.status(404).json({ error: 'Gold news intelligence route not found' });
    }
  });

  // Market Data API routes
  app.all('/api/market-data*', async (req, res) => {
    const handled = await handleMarketDataRequest(req, res);
    if (!handled && !res.headersSent) {
      res.status(404).json({ error: 'Market data route not found' });
    }
  });

  // SPY Options Sniper API routes (Server-authoritative engine)
  app.all('/api/spy-sniper*', async (req, res) => {
    const handled = await handleSpySniperRequest(req, res);
    if (!handled && !res.headersSent) {
      res.status(404).json({ error: 'SPY sniper route not found' });
    }
  });

  // AURUM Terminal Non-SPY Signals & Trade Lock API routes
  app.all('/api/terminal-signals*', async (req, res) => {
    const handled = await handleTerminalSignalsRequest(req, res);
    if (!handled && !res.headersSent) {
      res.status(404).json({ error: 'Terminal signals route not found' });
    }
  });

  // AURUM PHASE X — Market Cycle Intelligence (Wyckoff Engine) API routes
  app.all('/api/phase-x*', async (req, res) => {
    const handled = await handlePhaseXRequest(req, res);
    if (!handled && !res.headersSent) {
      res.status(404).json({ error: 'Phase X route not found' });
    }
  });

  // AURUM CATALYST — STRATEGY MODULE API routes
  app.all('/api/catalyst*', async (req, res) => {
    const handled = await handleCatalystRequest(req, res);
    if (!handled && !res.headersSent) {
      res.status(404).json({ error: 'Catalyst route not found' });
    }
  });

  // AURUM EXECUTION INTELLIGENCE SYSTEM
  app.all('/api/execution-intelligence*', async (req, res) => {
    const handled = await handleExecutionIntelligenceRequest(req, res);
    if (!handled && !res.headersSent) {
      res.status(404).json({ error: 'Execution Intelligence route not found' });
    }
  });

  // AURUM MARKET CONTEXT INTELLIGENCE BRAIN
  app.all('/api/market-context*', async (req, res) => {
    const handled = await handleMarketContextRequest(req, res);
    if (!handled && !res.headersSent) {
      res.status(404).json({ error: 'Market Context route not found' });
    }
  });

  // AURUM DECISION AUDIT & EXPLAINABILITY ENGINE
  app.all('/api/decision-audit*', async (req, res) => {
    const handled = await handleDecisionAuditRequest(req, res);
    if (!handled && !res.headersSent) {
      res.status(404).json({ error: 'Decision Audit route not found' });
    }
  });

  // AURUM SCENARIO SIMULATION INTELLIGENCE ENGINE (SCENARIO LAB)
  app.all('/api/scenario-lab*', async (req, res) => {
    const handled = await handleScenarioLabRequest(req, res);
    if (!handled && !res.headersSent) {
      res.status(404).json({ error: 'Scenario Lab route not found' });
    }
  });

  // AURUM ADAPTIVE STRATEGY MEMORY ENGINE
  app.all('/api/strategy-memory*', async (req, res) => {
    const handled = await handleStrategyMemoryRequest(req, res);
    if (!handled && !res.headersSent) {
      res.status(404).json({ error: 'Strategy Memory route not found' });
    }
  });

  // AURUM XAU/USD GOLD DATA INTEGRITY & LIVE FEED ENGINE
  app.all('/api/gold-data-integrity*', async (req, res) => {
    const handled = await handleGoldDataIntegrityRequest(req, res);
    if (!handled && !res.headersSent) {
      res.status(404).json({ error: 'Gold data integrity route not found' });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: Date.now() });
  });

  // Vite middleware in development vs Static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aurum Terminal server running on port ${PORT}`);
  });

  initWebSocketServer(server);
}

startServer();
