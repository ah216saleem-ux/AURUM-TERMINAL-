import type { IncomingMessage, ServerResponse } from 'http';

interface CachedData {
  timestamp: number;
  data: any;
}

const memoryCache: Record<string, CachedData> = {};
const CACHE_TTL_MS = 1000; // 1s TTL for batch quotes
const CANDLE_CACHE_TTL_MS = 15000; // 15s TTL for candles

// In-memory cache for Biquote quotes per symbol
const biquoteSymbolCache: Record<string, { data: any; timestamp: number }> = {};
const BIQUOTE_CACHE_TTL_MS = 1000;

export interface AssetConfigItem {
  id: string;
  symbol: string;
  name: string;
  category: 'crypto' | 'commodities' | 'indices' | 'forex';
  primaryProvider: 'BINANCE' | 'GOLD_API' | 'FINNHUB' | 'TWELVE_DATA' | 'YAHOO_FINANCE' | 'BIQUOTE';
  providerSymbol: string;
  fallbackSymbol?: string;
  decimals: number;
}

// Asset configuration mapping
export const ASSET_CONFIGS: AssetConfigItem[] = [
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
    primaryProvider: 'BIQUOTE' as const,
    providerSymbol: 'XAUUSD',
    fallbackSymbol: 'GC=F',
    decimals: 2
  },
  {
    id: 'xag-usd',
    symbol: 'XAG/USD',
    name: 'Silver',
    category: 'commodities',
    primaryProvider: 'BIQUOTE' as const,
    providerSymbol: 'XAGUSD',
    fallbackSymbol: 'SI=F',
    decimals: 2
  },
  {
    id: 'crude-oil',
    symbol: 'WTI Crude Oil',
    name: 'WTI Crude Oil',
    category: 'commodities',
    primaryProvider: 'TWELVE_DATA' as const,
    providerSymbol: 'WTI/USD',
    fallbackSymbol: 'CL=F',
    decimals: 2
  },
  {
    id: 'nasdaq-100',
    symbol: 'NASDAQ 100',
    name: 'NASDAQ 100',
    category: 'indices',
    primaryProvider: 'FINNHUB' as const,
    providerSymbol: '^NDX',
    fallbackSymbol: '^NDX',
    decimals: 2
  },
  {
    id: 'sp-500',
    symbol: 'S&P 500',
    name: 'S&P 500',
    category: 'indices',
    primaryProvider: 'FINNHUB' as const,
    providerSymbol: '^GSPC',
    fallbackSymbol: '^GSPC',
    decimals: 2
  },
  {
    id: 'eur-usd',
    symbol: 'EUR/USD',
    name: 'EUR/USD',
    category: 'forex',
    primaryProvider: 'BIQUOTE' as const,
    providerSymbol: 'EURUSD',
    fallbackSymbol: 'EURUSD=X',
    decimals: 4
  },
  {
    id: 'gbp-usd',
    symbol: 'GBP/USD',
    name: 'GBP/USD',
    category: 'forex',
    primaryProvider: 'BIQUOTE' as const,
    providerSymbol: 'GBPUSD',
    fallbackSymbol: 'GBPUSD=X',
    decimals: 4
  },
  {
    id: 'usd-jpy',
    symbol: 'USD/JPY',
    name: 'USD/JPY',
    category: 'forex',
    primaryProvider: 'BIQUOTE' as const,
    providerSymbol: 'USDJPY',
    fallbackSymbol: 'JPY=X',
    decimals: 2
  },
  {
    id: 'aud-usd',
    symbol: 'AUD/USD',
    name: 'AUD/USD',
    category: 'forex',
    primaryProvider: 'BIQUOTE' as const,
    providerSymbol: 'AUDUSD',
    fallbackSymbol: 'AUDUSD=X',
    decimals: 4
  },
  {
    id: 'usd-cad',
    symbol: 'USD/CAD',
    name: 'USD/CAD',
    category: 'forex',
    primaryProvider: 'BIQUOTE' as const,
    providerSymbol: 'USDCAD',
    fallbackSymbol: 'CAD=X',
    decimals: 4
  }
];

// Fetch Biquote public quote for Gold Spot, Silver Spot & Forex pairs
export async function fetchBiquoteQuote(symbol: string = 'XAUUSD') {
  const cached = biquoteSymbolCache[symbol];
  const now = Date.now();
  if (cached && now - cached.timestamp < BIQUOTE_CACHE_TTL_MS) {
    return cached.data;
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`https://biquote.io/api/${encodeURIComponent(symbol)}`, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(4000)
      });
      if (!res.ok) {
        continue;
      }
      const d = await res.json();
      if (!d) continue;

      const rawPrice = d.mid || d.bid || d.ask || d.last;
      if (rawPrice == null || rawPrice === 0) continue;

      const isJpyOrMetal = symbol.includes('JPY') || symbol.includes('XAU') || symbol.includes('XAG');
      const decimals = isJpyOrMetal ? 2 : 4;

      const price = +rawPrice.toFixed(decimals);
      const changePercent = d.dayDiffPercent != null ? +d.dayDiffPercent.toFixed(2) : 0;
      const change = +(price * (changePercent / 100)).toFixed(decimals);
      const high24h = d.high ? +d.high.toFixed(decimals) : price;
      const low24h = d.low ? +d.low.toFixed(decimals) : price;
      const timestamp = d.timestamp ? new Date(d.timestamp).getTime() : Date.now();

      const quoteData = {
        price,
        change,
        changePercent,
        high24h,
        low24h,
        provider: 'BIQUOTE',
        providerSymbol: symbol,
        timestamp
      };

      biquoteSymbolCache[symbol] = { data: quoteData, timestamp: now };
      return quoteData;
    } catch {
      if (attempt === 0) {
        await new Promise(r => setTimeout(r, 200));
      }
    }
  }

  // Gracefully fallback to cached price if available, otherwise null
  if (cached?.data) {
    return cached.data;
  }
  return null;
}

// Fetch GoldAPI quote for precious metals (XAU, XAG) using x-access-token header
async function fetchGoldApiQuote(metal: string = 'XAU') {
  const apiKey = process.env.GOLDAPI_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  try {
    const res = await fetch(`https://www.goldapi.io/api/${metal}/USD`, {
      headers: {
        'x-access-token': apiKey,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) {
      if (res.status !== 401 && res.status !== 403) {
        console.warn(`[GoldAPI] status ${res.status} for ${metal}`);
      }
      return null;
    }
    const d = await res.json();
    if (!d || d.price == null) {
      return null;
    }

    const price = d.price;
    const prevClose = d.prev_close_price || d.open_price || price;
    const change = d.ch != null ? d.ch : +(price - prevClose).toFixed(4);
    const changePercent = d.chp != null ? d.chp : (prevClose ? +(((price - prevClose) / prevClose) * 100).toFixed(2) : 0);
    const high24h = d.high_price || price;
    const low24h = d.low_price || price;
    const timestamp = d.timestamp ? d.timestamp * 1000 : Date.now();

    return {
      price,
      change,
      changePercent,
      high24h,
      low24h,
      provider: 'GOLD_API',
      providerSymbol: metal,
      timestamp
    };
  } catch (err: any) {
    return null;
  }
}

// Fetch Finnhub quote for forex and indices
async function fetchFinnhubQuote(symbol: string) {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  try {
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`);
    if (!res.ok) {
      if (res.status !== 401 && res.status !== 403) {
        console.warn(`[Finnhub] status ${res.status} for ${symbol}`);
      }
      return null;
    }
    const d = await res.json();
    if (d.c == null || d.c === 0) {
      return null;
    }

    const price = d.c;
    const prevClose = d.pc || price;
    const change = +(price - prevClose).toFixed(4);
    const changePercent = prevClose ? +(((price - prevClose) / prevClose) * 100).toFixed(2) : 0;
    const high24h = d.h || price;
    const low24h = d.l || price;
    const timestamp = d.t ? d.t * 1000 : Date.now();

    return {
      price,
      change,
      changePercent,
      high24h,
      low24h,
      provider: 'FINNHUB',
      providerSymbol: symbol,
      timestamp
    };
  } catch (err: any) {
    return null;
  }
}

// Fetch Twelve Data quote for Crude Oil (WTI)
async function fetchTwelveDataQuote(symbol: string = 'WTI/USD') {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  try {
    const res = await fetch(`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`);
    if (!res.ok) {
      return null;
    }
    const d = await res.json();
    if (!d || d.close == null) {
      return null;
    }
    const price = parseFloat(d.close);
    const prevClose = parseFloat(d.previous_close || price);
    const change = +(price - prevClose).toFixed(4);
    const changePercent = prevClose ? +(((price - prevClose) / prevClose) * 100).toFixed(2) : 0;
    const high24h = parseFloat(d.high || price);
    const low24h = parseFloat(d.low || price);
    const timestamp = d.datetime ? new Date(d.datetime).getTime() : Date.now();

    return {
      price,
      change,
      changePercent,
      high24h,
      low24h,
      provider: 'TWELVE_DATA',
      providerSymbol: symbol,
      timestamp
    };
  } catch (err) {
    return null;
  }
}

// Fetch crypto ticker from Binance API
async function fetchBinanceTicker(symbol: string = 'BTCUSDT') {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`, {
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) {
      return null;
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
  } catch {
    return null;
  }
}

// Fetch single market from Yahoo Finance with query1/query2 fallback
export async function fetchYahooQuote(symbol: string) {
  try {
    const encoded = encodeURIComponent(symbol);
    const path = `/v8/finance/chart/${encoded}?interval=1d&range=2d`;
    const hosts = ['https://query1.finance.yahoo.com', 'https://query2.finance.yahoo.com'];

    for (const host of hosts) {
      try {
        const res = await fetch(`${host}${path}`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          signal: AbortSignal.timeout(3500)
        });
        if (!res.ok) continue;
        const d = await res.json();
        const meta = d.chart?.result?.[0]?.meta;
        if (!meta || meta.regularMarketPrice == null) continue;

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
      } catch {
        // Try secondary host
      }
    }
    return null;
  } catch {
    return null;
  }
}

// Fetch OHLC candles from Yahoo Finance with query1/query2 fallback
export async function fetchYahooCandles(symbol: string, interval: string = '1h', range: string = '5d') {
  const cacheKey = `candles_${symbol}_${interval}_${range}`;
  const now = Date.now();
  if (memoryCache[cacheKey] && now - memoryCache[cacheKey].timestamp < CANDLE_CACHE_TTL_MS) {
    return memoryCache[cacheKey].data;
  }

  try {
    const encoded = encodeURIComponent(symbol);
    const path = `/v8/finance/chart/${encoded}?interval=${interval}&range=${range}`;
    const hosts = ['https://query1.finance.yahoo.com', 'https://query2.finance.yahoo.com'];

    for (const host of hosts) {
      try {
        const res = await fetch(`${host}${path}`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          signal: AbortSignal.timeout(3500)
        });
        if (!res.ok) continue;
        const d = await res.json();
        const result = d.chart?.result?.[0];
        if (!result || !result.timestamp) continue;

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

        if (candles.length > 0) {
          memoryCache[cacheKey] = {
            timestamp: now,
            data: candles
          };
          return candles;
        }
      } catch {
        // Try next host
      }
    }
  } catch {
    // Fall through to cache fallback
  }

  if (memoryCache[cacheKey]?.data && memoryCache[cacheKey].data.length > 0) {
    return memoryCache[cacheKey].data;
  }
  return [];
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

  // Fetch Biquote for Gold Spot (XAU/USD), Silver (XAG/USD) & Forex pairs
  const biquotePromises = ASSET_CONFIGS
    .filter(c => c.primaryProvider === 'BIQUOTE')
    .map(async (config) => {
      let quote = await fetchBiquoteQuote(config.providerSymbol);
      if (!quote) {
        if (config.category === 'commodities') {
          if (process.env.GOLDAPI_KEY) {
            const metal = config.id === 'xag-usd' ? 'XAG' : 'XAU';
            quote = await fetchGoldApiQuote(metal);
          }
          if (!quote && config.fallbackSymbol) {
            quote = await fetchYahooQuote(config.fallbackSymbol);
          }
        } else if (config.category === 'forex') {
          if (process.env.FINNHUB_API_KEY) {
            quote = await fetchFinnhubQuote(config.fallbackSymbol ? `OANDA:${config.fallbackSymbol.replace('=X', '').replace('USDJPY', 'USD_JPY').replace('EURUSD', 'EUR_USD').replace('GBPUSD', 'GBP_USD').replace('AUDUSD', 'AUD_USD').replace('USDCAD', 'USD_CAD')}` : config.providerSymbol);
          }
          if (!quote && config.fallbackSymbol) {
            quote = await fetchYahooQuote(config.fallbackSymbol);
          }
        }
      }
      return { assetId: config.id, quote };
    });

  // Fetch GoldAPI for precious metals (XAG) if API key is provided, otherwise fallback to Yahoo Finance
  const goldApiPromises = ASSET_CONFIGS
    .filter(c => c.primaryProvider === 'GOLD_API')
    .map(async (config) => {
      let quote = null;
      if (process.env.GOLDAPI_KEY) {
        quote = await fetchGoldApiQuote(config.providerSymbol);
      }
      if (!quote && config.fallbackSymbol) {
        quote = await fetchYahooQuote(config.fallbackSymbol);
      }
      return { assetId: config.id, quote };
    });

  // Fetch Finnhub for forex and indices if API key is provided, otherwise fallback to Yahoo Finance
  const finnhubPromises = ASSET_CONFIGS
    .filter(c => c.primaryProvider === 'FINNHUB')
    .map(async (config) => {
      let quote = null;
      if (process.env.FINNHUB_API_KEY) {
        quote = await fetchFinnhubQuote(config.providerSymbol);
      }
      if (!quote && config.fallbackSymbol) {
        quote = await fetchYahooQuote(config.fallbackSymbol);
      }
      return { assetId: config.id, quote };
    });

  // Fetch Twelve Data for Crude Oil if API key is provided, otherwise fallback to Yahoo Finance
  const twelveDataPromises = ASSET_CONFIGS
    .filter(c => c.primaryProvider === 'TWELVE_DATA')
    .map(async (config) => {
      let quote = null;
      if (process.env.TWELVE_DATA_API_KEY) {
        quote = await fetchTwelveDataQuote(config.providerSymbol);
      }
      if (!quote && config.fallbackSymbol) {
        quote = await fetchYahooQuote(config.fallbackSymbol);
      }
      return { assetId: config.id, quote };
    });

  // Fetch Yahoo quotes for other assets if any
  const yahooPromises = ASSET_CONFIGS
    .filter(c => c.primaryProvider === 'YAHOO_FINANCE')
    .map(async (config) => {
      const quote = await fetchYahooQuote(config.providerSymbol);
      return { assetId: config.id, quote };
    });

  const [binanceData, biquoteResults, goldApiResults, finnhubResults, twelveDataResults, yahooResults] = await Promise.all([
    binancePromise,
    Promise.all(biquotePromises),
    Promise.all(goldApiPromises),
    Promise.all(finnhubPromises),
    Promise.all(twelveDataPromises),
    Promise.all(yahooPromises)
  ]);

  const results: Record<string, any> = {};

  if (binanceData) {
    results['btc-usd'] = {
      assetId: 'btc-usd',
      ...binanceData
    };
  }

  biquoteResults.forEach(item => {
    if (item.quote) {
      results[item.assetId] = {
        assetId: item.assetId,
        ...item.quote
      };
    }
  });

  goldApiResults.forEach(item => {
    if (item.quote) {
      results[item.assetId] = {
        assetId: item.assetId,
        ...item.quote
      };
    }
  });

  finnhubResults.forEach(item => {
    if (item.quote) {
      results[item.assetId] = {
        assetId: item.assetId,
        ...item.quote
      };
    }
  });

  twelveDataResults.forEach(item => {
    if (item.quote) {
      results[item.assetId] = {
        assetId: item.assetId,
        ...item.quote
      };
    }
  });

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

      // Map Biquote symbols back to Yahoo equivalents for historical candles
      let yahooSymbol = symbol;
      if (symbol === 'XAUUSD') yahooSymbol = 'GC=F';
      else if (symbol === 'XAGUSD') yahooSymbol = 'SI=F';
      else if (symbol === 'EURUSD') yahooSymbol = 'EURUSD=X';
      else if (symbol === 'GBPUSD') yahooSymbol = 'GBPUSD=X';
      else if (symbol === 'USDJPY') yahooSymbol = 'JPY=X';
      else if (symbol === 'AUDUSD') yahooSymbol = 'AUDUSD=X';
      else if (symbol === 'USDCAD') yahooSymbol = 'CAD=X';

      const candles = await fetchYahooCandles(yahooSymbol, interval, range);
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

    if (pathname === '/api/market-data/biquote') {
      const symbol = parsedUrl.searchParams.get('symbol') || 'XAUUSD';
      const data = await fetchBiquoteQuote(symbol);
      res.statusCode = data ? 200 : 502;
      res.end(JSON.stringify(data || { error: 'Failed to fetch from Biquote' }));
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
          gold: { provider: 'Biquote Public API', endpoint: 'biquote.io/api/XAUUSD' },
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
