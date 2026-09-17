/**
 * AURUM TERMINAL - UNIFIED MARKET DATA SERVICE LAYER
 * Multi-source architecture routing queries by asset class:
 * - Crypto (BTC/USD): Binance API (real-time price, 24h change, volume)
 * - Gold (XAU/USD): Yahoo Finance API (live price, daily change, OHLC candles)
 * - Commodities (Silver, Oil): Yahoo Finance API (COMEX/NYMEX futures)
 * - Indices (NASDAQ 100, S&P 500): Yahoo Finance API (CME/NASDAQ)
 * - Forex (EUR, GBP, JPY, AUD, CAD): Yahoo Finance API with Open Exchange Rates fallback
 */

import { MarketItem, Candle, Timeframe } from '../types';

export type ProviderType = 'BINANCE' | 'YAHOO_FINANCE' | 'OPEN_EXCHANGE' | 'BIQUOTE';

export interface AssetProviderConfig {
  id: string;
  symbol: string;
  name: string;
  category: 'crypto' | 'commodities' | 'indices' | 'forex';
  primaryProvider: ProviderType;
  providerSymbol: string;
  exchangeName: string;
  decimals: number;
}

export const ASSET_PROVIDER_CONFIGS: Record<string, AssetProviderConfig> = {
  'btc-usd': {
    id: 'btc-usd',
    symbol: 'BTC/USD',
    name: 'Bitcoin',
    category: 'crypto',
    primaryProvider: 'BINANCE',
    providerSymbol: 'BTCUSDT',
    exchangeName: 'Binance Live Ticker',
    decimals: 2
  },
  'xau-usd': {
    id: 'xau-usd',
    symbol: 'XAU/USD',
    name: 'Gold Spot',
    category: 'commodities',
    primaryProvider: 'BIQUOTE',
    providerSymbol: 'XAUUSD',
    exchangeName: 'Biquote Gold Spot Feed',
    decimals: 2
  },
  'xag-usd': {
    id: 'xag-usd',
    symbol: 'XAG/USD',
    name: 'Silver',
    category: 'commodities',
    primaryProvider: 'BIQUOTE',
    providerSymbol: 'XAGUSD',
    exchangeName: 'Biquote Silver Spot Feed',
    decimals: 2
  },
  'crude-oil': {
    id: 'crude-oil',
    symbol: 'WTI Crude Oil',
    name: 'WTI Crude Oil',
    category: 'commodities',
    primaryProvider: 'YAHOO_FINANCE',
    providerSymbol: 'CL=F',
    exchangeName: 'NYMEX Energy Feed',
    decimals: 2
  },
  'nasdaq-100': {
    id: 'nasdaq-100',
    symbol: 'NASDAQ 100',
    name: 'NASDAQ 100',
    category: 'indices',
    primaryProvider: 'YAHOO_FINANCE',
    providerSymbol: '^NDX',
    exchangeName: 'NASDAQ / CME Globex',
    decimals: 2
  },
  'sp-500': {
    id: 'sp-500',
    symbol: 'S&P 500',
    name: 'S&P 500',
    category: 'indices',
    primaryProvider: 'YAHOO_FINANCE',
    providerSymbol: '^GSPC',
    exchangeName: 'S&P / CME Globex',
    decimals: 2
  },
  'eur-usd': {
    id: 'eur-usd',
    symbol: 'EUR/USD',
    name: 'EUR/USD',
    category: 'forex',
    primaryProvider: 'BIQUOTE',
    providerSymbol: 'EURUSD',
    exchangeName: 'Biquote Spot FX',
    decimals: 4
  },
  'gbp-usd': {
    id: 'gbp-usd',
    symbol: 'GBP/USD',
    name: 'GBP/USD',
    category: 'forex',
    primaryProvider: 'BIQUOTE',
    providerSymbol: 'GBPUSD',
    exchangeName: 'Biquote Spot FX',
    decimals: 4
  },
  'usd-jpy': {
    id: 'usd-jpy',
    symbol: 'USD/JPY',
    name: 'USD/JPY',
    category: 'forex',
    primaryProvider: 'BIQUOTE',
    providerSymbol: 'USDJPY',
    exchangeName: 'Biquote Spot FX',
    decimals: 2
  },
  'aud-usd': {
    id: 'aud-usd',
    symbol: 'AUD/USD',
    name: 'AUD/USD',
    category: 'forex',
    primaryProvider: 'BIQUOTE',
    providerSymbol: 'AUDUSD',
    exchangeName: 'Biquote Spot FX',
    decimals: 4
  },
  'usd-cad': {
    id: 'usd-cad',
    symbol: 'USD/CAD',
    name: 'USD/CAD',
    category: 'forex',
    primaryProvider: 'BIQUOTE',
    providerSymbol: 'USDCAD',
    exchangeName: 'Biquote Spot FX',
    decimals: 4
  }
};

export type ConnectionStatus = 'DATA CONNECTED' | 'CONNECTING' | 'ERROR';

export type MarketDataListener = (payload: {
  markets: Record<string, Partial<MarketItem>>;
  status: ConnectionStatus;
  lastUpdate: number;
}) => void;

class MarketDataService {
  private status: ConnectionStatus = 'CONNECTING';
  private lastUpdateTimestamp: number = 0;
  private listeners: Set<MarketDataListener> = new Set();
  private refreshIntervalTimer: any = null;
  private isFetching: boolean = false;
  private failureCount: number = 0;

  public latestPrices: Record<string, number> = {
    'btc-usd': 102450.00,
    'xau-usd': 4302.50,
    'xag-usd': 63.42,
    'nasdaq-100': 28945.06,
    'sp-500': 7551.81,
    'crude-oil': 102.02,
    'eur-usd': 1.1467,
    'gbp-usd': 1.3381,
    'usd-jpy': 155.98,
    'aud-usd': 0.7088,
    'usd-cad': 1.3992
  };

  constructor() {
    // Initial status
    this.status = 'CONNECTING';
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public getLastUpdate(): number {
    return this.lastUpdateTimestamp;
  }

  public subscribe(listener: MarketDataListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(markets: Record<string, Partial<MarketItem>>) {
    this.listeners.forEach(fn => {
      try {
        fn({
          markets,
          status: this.status,
          lastUpdate: this.lastUpdateTimestamp
        });
      } catch (e) {
        console.error('[MarketDataService] Listener error:', e);
      }
    });
  }

  /**
   * Primary unified fetch orchestrator:
   * 1. Attempts local high-speed backend route `/api/market-data/all`
   * 2. Fallbacks directly to public Binance API and Open Exchange Rates in case of backend isolation
   */
  public async fetchAllMarketPrices(): Promise<Record<string, Partial<MarketItem>>> {
    if (this.isFetching) return {};
    this.isFetching = true;

    try {
      // 1. Try local API route
      const res = await fetch('/api/market-data/all');
      if (res.ok) {
        const payload = await res.json();
        if (payload && payload.data && Object.keys(payload.data).length > 0) {
          this.status = 'DATA CONNECTED';
          this.lastUpdateTimestamp = Date.now();
          this.failureCount = 0;

          const mapped: Record<string, Partial<MarketItem>> = {};
          for (const [id, val] of Object.entries(payload.data as Record<string, any>)) {
            mapped[id] = {
              price: val.price,
              change: val.change,
              changePercent: val.changePercent,
              high24h: val.high24h,
              low24h: val.low24h,
              volume24h: val.volume24h,
              lastTickTimestamp: val.timestamp || Date.now()
            };
            this.latestPrices[id] = val.price;
          }

          this.notify(mapped);
          this.isFetching = false;
          return mapped;
        }
      }
    } catch (err) {
      // Local backend route unavailable, proceed to direct client fallback
    }

    // 2. Client-side direct fallback: Binance API directly for BTC/USD
    const fallbackResults: Record<string, Partial<MarketItem>> = {};
    try {
      const btcRes = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
      if (btcRes.ok) {
        const btcData = await btcRes.json();
        const price = parseFloat(btcData.lastPrice);
        const change = parseFloat(btcData.priceChange);
        const changePercent = parseFloat(btcData.priceChangePercent);
        const quoteVol = parseFloat(btcData.quoteVolume);
        const volume24h = '$' + (quoteVol / 1e9).toFixed(2) + 'B';

        fallbackResults['btc-usd'] = {
          price,
          change,
          changePercent,
          high24h: parseFloat(btcData.highPrice),
          low24h: parseFloat(btcData.lowPrice),
          volume24h,
          lastTickTimestamp: Date.now()
        };
        this.status = 'DATA CONNECTED';
        this.lastUpdateTimestamp = Date.now();
      }
    } catch (err) {
      console.warn('[MarketDataService] Direct Binance client fallback failed:', err);
    }

    // 2b. Client-side direct fallback: Biquote API for Gold, Silver & Forex pairs
    const biquoteAssets = [
      ['xau-usd', 'XAUUSD', 2],
      ['xag-usd', 'XAGUSD', 2],
      ['eur-usd', 'EURUSD', 4],
      ['gbp-usd', 'GBPUSD', 4],
      ['usd-jpy', 'USDJPY', 2],
      ['aud-usd', 'AUDUSD', 4],
      ['usd-cad', 'USDCAD', 4]
    ] as const;

    for (const [id, symbol, decimals] of biquoteAssets) {
      try {
        const biquoteRes = await fetch(`https://biquote.io/api/${symbol}`);
        if (biquoteRes.ok) {
          const d = await biquoteRes.json();
          const rawPrice = d.mid || d.bid || d.ask || d.last;
          if (rawPrice) {
            const price = +rawPrice.toFixed(decimals);
            const changePercent = d.dayDiffPercent != null ? +d.dayDiffPercent.toFixed(2) : 0;
            fallbackResults[id] = {
              price,
              changePercent,
              high24h: d.high ? +d.high.toFixed(decimals) : price,
              low24h: d.low ? +d.low.toFixed(decimals) : price,
              lastTickTimestamp: Date.now()
            };
            this.status = 'DATA CONNECTED';
            this.lastUpdateTimestamp = Date.now();
          }
        }
      } catch (err) {
        console.warn(`[MarketDataService] Direct Biquote client fallback failed for ${symbol}:`, err);
      }
    }

    // 3. Client-side direct fallback: Open Exchange Rates for Forex pairs
    try {
      const fxRes = await fetch('https://open.er-api.com/v6/latest/USD');
      if (fxRes.ok) {
        const fxData = await fxRes.json();
        const rates = fxData.rates || {};

        if (rates.EUR) {
          const eurPrice = +(1 / rates.EUR).toFixed(4);
          fallbackResults['eur-usd'] = { price: eurPrice, lastTickTimestamp: Date.now() };
        }
        if (rates.GBP) {
          const gbpPrice = +(1 / rates.GBP).toFixed(4);
          fallbackResults['gbp-usd'] = { price: gbpPrice, lastTickTimestamp: Date.now() };
        }
        if (rates.JPY) {
          fallbackResults['usd-jpy'] = { price: +rates.JPY.toFixed(2), lastTickTimestamp: Date.now() };
        }
        if (rates.AUD) {
          const audPrice = +(1 / rates.AUD).toFixed(4);
          fallbackResults['aud-usd'] = { price: audPrice, lastTickTimestamp: Date.now() };
        }
        if (rates.CAD) {
          fallbackResults['usd-cad'] = { price: +rates.CAD.toFixed(4), lastTickTimestamp: Date.now() };
        }
      }
    } catch (err) {
      console.warn('[MarketDataService] Direct FX client fallback failed:', err);
    }

    if (Object.keys(fallbackResults).length > 0) {
      this.status = 'DATA CONNECTED';
      this.lastUpdateTimestamp = Date.now();
      for (const [id, val] of Object.entries(fallbackResults)) {
        if (val.price != null) {
          this.latestPrices[id] = val.price;
        }
      }
      this.notify(fallbackResults);
    } else {
      this.failureCount++;
      if (this.failureCount > 3) {
        this.status = 'ERROR';
      }
    }

    this.isFetching = false;
    return fallbackResults;
  }

  /**
   * Fetches real OHLC candle data for Gold from Yahoo Finance
   */
  public async fetchGoldCandles(timeframe: Timeframe = '1H'): Promise<Candle[]> {
    const intervalMap: Record<Timeframe, { interval: string; range: string }> = {
      '1M': { interval: '1m', range: '1d' },
      '5M': { interval: '5m', range: '1d' },
      '15M': { interval: '15m', range: '5d' },
      '30M': { interval: '30m', range: '5d' },
      '1H': { interval: '1h', range: '5d' },
      '4H': { interval: '1h', range: '1mo' },
      '1D': { interval: '1d', range: '3mo' },
      '1W': { interval: '1wk', range: '1y' }
    };

    const conf = intervalMap[timeframe] || intervalMap['1H'];

    try {
      const res = await fetch(`/api/market-data/candles?symbol=GC=F&interval=${conf.interval}&range=${conf.range}`);
      if (res.ok) {
        const payload = await res.json();
        if (payload && Array.isArray(payload.candles) && payload.candles.length > 0) {
          return payload.candles;
        }
      }
    } catch (err) {
      console.warn('[MarketDataService] Gold candle fetch failed, using responsive fallback:', err);
    }

    return [];
  }

  /**
   * Start automatic polling refresh
   */
  public startAutoRefresh(intervalMs: number = 4000) {
    if (this.refreshIntervalTimer) return;
    this.fetchAllMarketPrices();
    this.refreshIntervalTimer = setInterval(() => {
      this.fetchAllMarketPrices();
    }, intervalMs);
  }

  /**
   * Stop automatic polling refresh
   */
  public stopAutoRefresh() {
    if (this.refreshIntervalTimer) {
      clearInterval(this.refreshIntervalTimer);
      this.refreshIntervalTimer = null;
    }
  }
}

export const marketDataService = new MarketDataService();
