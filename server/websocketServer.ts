import { WebSocketServer, WebSocket } from 'ws';
import { fetchAllMarketData, ASSET_CONFIGS } from './marketDataRouter';

interface LivePriceData {
  assetId: string;
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume24h?: string;
  timestamp: number;
}

const DEFAULT_BASES: Record<string, { price: number; changePercent: number }> = {
  'btc-usd': { price: 102450.00, changePercent: 1.45 },
  'xau-usd': { price: 4302.50, changePercent: -0.32 },
  'xag-usd': { price: 63.42, changePercent: 0.85 },
  'nasdaq-100': { price: 28945.06, changePercent: 1.12 },
  'sp-500': { price: 7551.81, changePercent: 0.58 },
  'crude-oil': { price: 102.02, changePercent: -1.20 },
  'eur-usd': { price: 1.1467, changePercent: -0.15 },
  'gbp-usd': { price: 1.3381, changePercent: 0.22 },
  'usd-jpy': { price: 155.98, changePercent: 0.45 },
  'aud-usd': { price: 0.7088, changePercent: -0.08 },
  'usd-cad': { price: 1.3992, changePercent: 0.10 }
};

const latestPrices: Record<string, LivePriceData> = {};
const clients = new Set<WebSocket>();

function getAssetTickSize(id: string): number {
  switch (id) {
    case 'btc-usd': return 2.50;
    case 'xau-usd': return 0.12;
    case 'xag-usd': return 0.02;
    case 'nasdaq-100': return 0.85;
    case 'sp-500': return 0.22;
    case 'crude-oil': return 0.03;
    case 'eur-usd':
    case 'gbp-usd':
    case 'aud-usd':
    case 'usd-cad': return 0.0001;
    case 'usd-jpy': return 0.01;
    default: return 0.01;
  }
}

function getAssetSpread(id: string): number {
  switch (id) {
    case 'btc-usd': return 6.00;
    case 'xau-usd': return 0.25;
    case 'xag-usd': return 0.03;
    case 'nasdaq-100': return 1.50;
    case 'sp-500': return 0.40;
    case 'crude-oil': return 0.04;
    case 'eur-usd': return 0.0001;
    case 'gbp-usd': return 0.0002;
    case 'aud-usd': return 0.0001;
    case 'usd-cad': return 0.0002;
    case 'usd-jpy': return 0.02;
    default: return 0.02;
  }
}

// Initialize prices with default base values
for (const config of ASSET_CONFIGS) {
  const id = config.id;
  const def = DEFAULT_BASES[id] || { price: 100, changePercent: 0 };
  const spread = getAssetSpread(id);
  const decimals = config.decimals;
  latestPrices[id] = {
    assetId: id,
    symbol: config.symbol,
    price: def.price,
    bid: +(def.price - spread / 2).toFixed(decimals),
    ask: +(def.price + spread / 2).toFixed(decimals),
    change: +(def.price * (def.changePercent / 100)).toFixed(decimals),
    changePercent: def.changePercent,
    high24h: +(def.price * 1.01).toFixed(decimals),
    low24h: +(def.price * 0.99).toFixed(decimals),
    timestamp: Date.now()
  };
}

async function refreshBaselinePrices() {
  try {
    const apiData = await fetchAllMarketData();
    if (apiData && apiData.data) {
      for (const config of ASSET_CONFIGS) {
        const id = config.id;
        const val = apiData.data[id];
        if (val) {
          const decimals = config.decimals;
          const spread = getAssetSpread(id);
          const price = val.price;
          
          latestPrices[id] = {
            assetId: id,
            symbol: config.symbol,
            price: price,
            bid: +(price - spread / 2).toFixed(decimals),
            ask: +(price + spread / 2).toFixed(decimals),
            change: val.change || 0,
            changePercent: val.changePercent || 0,
            high24h: val.high24h || price,
            low24h: val.low24h || price,
            volume24h: val.volume24h,
            timestamp: Date.now()
          };
        }
      }
    }
  } catch (err) {
    console.error('[WebSocketServer] Failed to refresh baseline prices:', err);
  }
}

export function initWebSocketServer(httpServer: any) {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request: any, socket: any, head: any) => {
    try {
      const url = request.url || '';
      const pathname = url.split('?')[0];
      if (pathname === '/api/streaming') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      }
    } catch (err) {
      console.error('[WebSocketServer] Upgrade error:', err);
      try {
        socket.destroy();
      } catch (e) {}
    }
  });

  wss.on('connection', (ws) => {
    clients.add(ws);
    
    // Send initial cached price payload immediately
    ws.send(JSON.stringify({ type: 'init', data: latestPrices }));

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', (err) => {
      console.error('[WebSocketServer] Connection error:', err);
    });
  });

  // Start background ticker routines
  startTickBroadcaster();
}

function startTickBroadcaster() {
  // Poll real REST APIs every 12 seconds to keep baseline prices accurate
  refreshBaselinePrices();
  setInterval(refreshBaselinePrices, 12000);

  // Broadcast micro-ticks every 350ms
  setInterval(() => {
    if (clients.size === 0) return;

    // Tick a random subset of assets (3 to 6) each tick cycle for organic streaming feel
    const count = 3 + Math.floor(Math.random() * 4);
    const shuffled = [...ASSET_CONFIGS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    for (const config of selected) {
      const id = config.id;
      const current = latestPrices[id];
      if (!current) continue;

      const decimals = config.decimals;
      const tickSize = getAssetTickSize(id);
      const spread = getAssetSpread(id);

      // Random-walk price delta
      const changeAmount = (Math.random() - 0.5) * tickSize;
      let newPrice = +(current.price + changeAmount).toFixed(decimals);

      // Clamp price within 8% variance of original baseline defaults
      const basePrice = DEFAULT_BASES[id]?.price || 100;
      if (newPrice < basePrice * 0.92) {
        newPrice = +(basePrice * 0.92).toFixed(decimals);
      } else if (newPrice > basePrice * 1.08) {
        newPrice = +(basePrice * 1.08).toFixed(decimals);
      }

      current.price = newPrice;
      current.bid = +(newPrice - spread / 2).toFixed(decimals);
      current.ask = +(newPrice + spread / 2).toFixed(decimals);
      current.timestamp = Date.now();

      if (newPrice > current.high24h) current.high24h = newPrice;
      if (newPrice < current.low24h) current.low24h = newPrice;

      const tickMessage = JSON.stringify({
        type: 'tick',
        data: current
      });

      clients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(tickMessage);
        }
      });
    }
  }, 350);
}
