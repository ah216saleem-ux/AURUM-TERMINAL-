import type { IncomingMessage, ServerResponse } from 'http';

interface CachedData {
  timestamp: number;
  data: any;
}

const memoryCache: Record<string, CachedData> = {};
const CACHE_TTL_MS = 2500; // 2.5s TTL for quotes
const CANDLE_CACHE_TTL_MS = 15000; // 15s TTL for candles

// Asset configuration mapping
export const ASSET_CONFIGS = [
  {
    id: 'btc-usd',
    symbol: 'BTC/USD',
    name: 'Bitcoin',
    category: 'crypto',
    primaryProvider: 'BINANCE' as const,
    providerSymbol: 'BTCUSDT',
    decimals: 2
  },
  {
    id: 'xau-usd',
    symbol: 'XAU/USD',
    name: 'Gold Spot',
    category: 'commodities',
    primaryProvider: 'YAHOO_FINANCE' as const,
    providerSymbol: 'GC=F',
    decimals: 2
  },
  {
    id: 'xag-usd',
    symbol: 'XAG/USD',
    name: 'Silver',
    category: 'commodities',
    primaryProvider: 'YAHOO_FINANCE' as const,
    providerSymbol: 'SI=F',
    decimals: 2
  },
  {
    id: 'crude-oil',
    symbol: 'WTI Crude Oil',
    name: 'WTI Crude Oil',
    category: 'commodities',
    primaryProvider: 'YAHOO_FINANCE' as const,
    providerSymbol: 'CL=F',
    decimals: 2
  },
  {
    id: 'nasdaq-100',
    symbol: 'NASDAQ 100',
    name: 'NASDAQ 100',
    category: 'indices',
    primaryProvider: 'YAHOO_FINANCE' as const,
    providerSymbol: '^NDX',
    fallbackSymbol: 'QQQ',
    decimals: 2
  },
  {
    id: 'sp-500',
    symbol: 'S&P 500',
    name: 'S&P 500',
    category: 'indices',
    primaryProvider: 'YAHOO_FINANCE' as const,
    providerSymbol: '^GSPC',
    fallbackSymbol: 'SPY',
    decimals: 2
  },
  {
    id: 'eur-usd',
    symbol: 'EUR/USD',
    name: 'EUR/USD',
    category: 'forex',
    primaryProvider: 'YAHOO_FINANCE' as const,
    providerSymbol: 'EURUSD=X',
    decimals: 4
  },
  {
    id: 'gbp-usd',
    symbol: 'GBP/USD',
    name: 'GBP/USD',
    category: 'forex',
    primaryProvider: 'YAHOO_FINANCE' as const,
    providerSymbol: 'GBPUSD=X',
    decimals: 4
  },
  {
    id: 'usd-jpy',
    symbol: 'USD/JPY',
    name: 'USD/JPY',
    category: 'forex',
    primaryProvider: 'YAHOO_FINANCE' as const,
    providerSymbol: 'JPY=X',
    decimals: 2
  },
  {
    id: 'aud-usd',
    symbol: 'AUD/USD',
    name: 'AUD/USD',
    category: 'forex',
    primaryProvider: 'YAHOO_FINANCE' as const,
    providerSymbol: 'AUDUSD=X',
    decimals: 4
  },
  {
    id: 'usd-cad',
    symbol: 'USD/CAD',
    name: 'USD/CAD',
    category: 'forex',
    primaryProvider: 'YAHOO_FINANCE' as const,
    providerSymbol: 'CAD=X',
    decimals: 4
  }
];

// Fetch crypto ticker from Binance API
async function fetchBinanceTicker(symbol: string = 'BTCUSDT') {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
    if (!res.ok) {
      throw new Error(`Binance error status ${res.status}`);
    }
    const d = await res.json();
    const price = parseFloat(d.lastPrice);
    const change = parseFloat(d.priceChange);
    const changePercent = parseFloat(d.priceChangePercent);
    const high24h = parseFloat(d.highPrice);
    const low24h = parseFloat(d.lowPrice);
    const quoteVolume = parseFloat(d.quoteVolume);
    
    // Format quote volume as $B or $M
    let volume24h = '$' + (quoteVolume / 1e9).toFixed(2) + 'B';
    if (quoteVolume < 1e9) {
      volume24h = '$' + (quoteVolume / 1e6).toFixed(1) + 'M';
    }

    return {
      price,
      change,
      changePercent,
      high24h,
      low24h,
      volume24h,
      provider: 'BINANCE',
      providerSymbol: symbol,
      timestamp: Date.now()
    };
  } catch (err: any) {
    console.warn(`[Binance] Fetch failed for ${symbol}:`, err?.message || err);
    return null;
  }
}

// Fetch single market from Yahoo Finance
async function fetchYahooQuote(symbol: string) {
  try {
    const encoded = encodeURIComponent(symbol);
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=1d&range=2d`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }
    );
    if (!res.ok) {
      throw new Error(`Yahoo status ${res.status}`);
    }
    const d = await res.json();
    const meta = d.chart?.result?.[0]?.meta;
    if (!meta || meta.regularMarketPrice == null) {
      throw new Error('Missing meta or regularMarketPrice');
    }

    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose || meta.previousClose || price;
    const change = +(price - prevClose).toFixed(4);
    const changePercent = meta.regularMarketChangePercent != null 
      ? +meta.regularMarketChangePercent.toFixed(2) 
      : +((change / prevClose) * 100).toFixed(2);
    const high24h = meta.regularMarketDayHigh || price;
    const low24h = meta.regularMarketDayLow || price;

    return {
      price,
      change,
      changePercent,
      high24h,
      low24h,
      volume24h: meta.regularMarketVolume ? '$' + (meta.regularMarketVolume / 1e9).toFixed(1) + 'B' : undefined,
      provider: 'YAHOO_FINANCE',
      providerSymbol: symbol,
      timestamp: (meta.regularMarketTime ? meta.regularMarketTime * 1000 : Date.now())
    };
  } catch (err: any) {
    console.warn(`[YahooFinance] Fetch quote failed for ${symbol}:`, err?.message || err);
    return null;
  }
}

// Fetch OHLC candles from Yahoo Finance
export async function fetchYahooCandles(symbol: string, interval: string = '1h', range: string = '5d') {
  const cacheKey = `candles_${symbol}_${interval}_${range}`;
  const now = Date.now();
  if (memoryCache[cacheKey] && now - memoryCache[cacheKey].timestamp < CANDLE_CACHE_TTL_MS) {
    return memoryCache[cacheKey].data;
  }

  try {
    const encoded = encodeURIComponent(symbol);
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=${interval}&range=${range}`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }
    );
    if (!res.ok) {
      throw new Error(`Yahoo chart status ${res.status}`);
    }
    const d = await res.json();
    const result = d.chart?.result?.[0];
    if (!result || !result.timestamp) {
      throw new Error('No timestamp in Yahoo chart result');
    }

    const timestamps: number[] = result.timestamp;
    const quote = result.indicators?.quote?.[0] || {};
    const opens = quote.open || [];
    const highs = quote.high || [];
    const lows = quote.low || [];
    const closes = quote.close || [];
    const volumes = quote.volume || [];

    const candles = timestamps.map((t, idx) => {
      const open = opens[idx];
      const high = highs[idx];
      const low = lows[idx];
      const close = closes[idx];
      const volume = volumes[idx] || 0;

      return {
        time: t * 1000,
        timeLabel: new Date(t * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        open: open != null ? +open.toFixed(4) : 0,
        high: high != null ? +high.toFixed(4) : 0,
        low: low != null ? +low.toFixed(4) : 0,
        close: close != null ? +close.toFixed(4) : 0,
        volume: volume || 0
      };
    }).filter(c => c.close > 0 && !isNaN(c.close));

    memoryCache[cacheKey] = {
      timestamp: now,
      data: candles
    };

    return candles;
  } catch (err: any) {
    console.warn(`[YahooFinance] Failed to fetch candles for ${symbol}:`, err?.message || err);
    return [];
  }
}

// Batch fetch all markets across providers
export async function fetchAllMarketData() {
  const cacheKey = 'all_markets';
  const now = Date.now();
  if (memoryCache[cacheKey] && now - memoryCache[cacheKey].timestamp < CACHE_TTL_MS) {
    return memoryCache[cacheKey].data;
  }

  // Fetch Binance BTC
  const binancePromise = fetchBinanceTicker('BTCUSDT');

  // Fetch Yahoo quotes in parallel
  const yahooPromises = ASSET_CONFIGS
    .filter(c => c.primaryProvider === 'YAHOO_FINANCE')
    .map(async (config) => {
      const quote = await fetchYahooQuote(config.providerSymbol);
      return {
        assetId: config.id,
        quote
      };
    });

  const [binanceData, ...yahooResults] = await Promise.all([
    binancePromise,
    ...yahooPromises
  ]);

  const results: Record<string, any> = {};

  if (binanceData) {
    results['btc-usd'] = {
      assetId: 'btc-usd',
      ...binanceData
    };
  }

  yahooResults.forEach(item => {
    if (item.quote) {
      results[item.assetId] = {
        assetId: item.assetId,
        ...item.quote
      };
    }
  });

  const payload = {
    status: 'DATA CONNECTED',
    timestamp: now,
    data: results,
    connectedCount: Object.keys(results).length,
    totalAssets: ASSET_CONFIGS.length
  };

  memoryCache[cacheKey] = {
    timestamp: now,
    data: payload
  };

  return payload;
}

// HTTP middleware handler compatible with Connect/Express/Vite
export async function handleMarketDataRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || '';
  if (!url.startsWith('/api/market-data')) {
    return false;
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  try {
    const parsedUrl = new URL(url, 'http://localhost');
    const pathname = parsedUrl.pathname;

    if (pathname === '/api/market-data/all') {
      const data = await fetchAllMarketData();
      res.statusCode = 200;
      res.end(JSON.stringify(data));
      return true;
    }

    if (pathname === '/api/market-data/candles') {
      let rawSymbol = parsedUrl.searchParams.get('symbol') || 'GC=F';
      // Map asset ID or pair symbol to provider symbol
      const config = ASSET_CONFIGS.find(c => c.id === rawSymbol || c.symbol === rawSymbol || c.providerSymbol === rawSymbol);
      const symbol = config ? config.providerSymbol : rawSymbol;

      const interval = parsedUrl.searchParams.get('interval') || '1h';
      const range = parsedUrl.searchParams.get('range') || '5d';

      const candles = await fetchYahooCandles(symbol, interval, range);
      res.statusCode = 200;
      res.end(JSON.stringify({
        status: 'DATA CONNECTED',
        symbol,
        assetId: config?.id || rawSymbol,
        interval,
        range,
        count: candles.length,
        candles
      }));
      return true;
    }

    if (pathname === '/api/market-data/binance') {
      const symbol = parsedUrl.searchParams.get('symbol') || 'BTCUSDT';
      const data = await fetchBinanceTicker(symbol);
      res.statusCode = data ? 200 : 502;
      res.end(JSON.stringify(data || { error: 'Failed to fetch from Binance' }));
      return true;
    }

    if (pathname === '/api/market-data/yahoo') {
      const symbol = parsedUrl.searchParams.get('symbol') || 'GC=F';
      const data = await fetchYahooQuote(symbol);
      res.statusCode = data ? 200 : 502;
      res.end(JSON.stringify(data || { error: 'Failed to fetch from Yahoo Finance' }));
      return true;
    }

    if (pathname === '/api/market-data/status') {
      res.statusCode = 200;
      res.end(JSON.stringify({
        status: 'DATA CONNECTED',
        engine: 'AURUM Multi-Source Oracle',
        providers: {
          crypto: { provider: 'Binance API', endpoint: 'api.binance.com' },
          gold: { provider: 'Yahoo Finance API', endpoint: 'query1.finance.yahoo.com' },
          commodities: { provider: 'Yahoo Finance API (COMEX/NYMEX)', endpoint: 'query1.finance.yahoo.com' },
          indices: { provider: 'Yahoo Finance API (CME/NASDAQ)', endpoint: 'query1.finance.yahoo.com' },
          forex: { provider: 'Yahoo Finance / Spot FX', endpoint: 'query1.finance.yahoo.com' }
        },
        timestamp: Date.now()
      }));
      return true;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Endpoint not found in market data API' }));
    return true;
  } catch (err: any) {
    console.error('[MarketDataRouter] Error processing request:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal Server Error', message: err?.message }));
    return true;
  }
}
