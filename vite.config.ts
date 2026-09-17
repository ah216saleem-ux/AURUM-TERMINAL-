import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { handleMarketDataRequest } from './server/marketDataRouter';
import { handleNewsRequest } from './server/newsRouter';
import { initWebSocketServer } from './server/websocketServer';

function marketDataBackendPlugin(): Plugin {
  return {
    name: 'aurum-market-data-backend',
    configureServer(server) {
      if (server.httpServer) {
        initWebSocketServer(server.httpServer);
      }
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/market-data')) {
          const handled = await handleMarketDataRequest(req, res);
          if (!handled) next();
        } else if (req.url && req.url.startsWith('/api/news')) {
          await handleNewsRequest(req, res as any);
        } else {
          next();
        }
      });
    },
    configurePreviewServer(server) {
      if (server.httpServer) {
        initWebSocketServer(server.httpServer);
      }
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/market-data')) {
          const handled = await handleMarketDataRequest(req, res);
          if (!handled) next();
        } else if (req.url && req.url.startsWith('/api/news')) {
          await handleNewsRequest(req, res as any);
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), marketDataBackendPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
