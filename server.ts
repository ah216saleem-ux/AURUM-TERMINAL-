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

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser is already mounted
  app.use(express.json());

  // Admin Security & Protected Module Routes
  app.all(['/api/auth/admin*', '/api/admin*'], async (req, res) => {
    const handled = await handleAdminAuthRequest(req, res);
    if (!handled) {
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

  // Market Data API routes
  app.all('/api/market-data*', async (req, res) => {
    const handled = await handleMarketDataRequest(req, res);
    if (!handled) {
      res.status(404).json({ error: 'Market data route not found' });
    }
  });

  // SPY Options Sniper API routes (Server-authoritative engine)
  app.all('/api/spy-sniper*', async (req, res) => {
    const handled = await handleSpySniperRequest(req, res);
    if (!handled) {
      res.status(404).json({ error: 'SPY sniper route not found' });
    }
  });

  // AURUM Terminal Non-SPY Signals & Trade Lock API routes
  app.all('/api/terminal-signals*', async (req, res) => {
    const handled = await handleTerminalSignalsRequest(req, res);
    if (!handled) {
      res.status(404).json({ error: 'Terminal signals route not found' });
    }
  });

  // AURUM PHASE X — Market Cycle Intelligence (Wyckoff Engine) API routes
  app.all('/api/phase-x*', async (req, res) => {
    const handled = await handlePhaseXRequest(req, res);
    if (!handled) {
      res.status(404).json({ error: 'Phase X route not found' });
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
