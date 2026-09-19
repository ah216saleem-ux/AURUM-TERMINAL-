/**
 * AURUM TERMINAL - UNIFIED MARKET DATA SERVICE LAYER
 * Multi-source architecture routing queries by asset class:
 * - Gold (XAU/USD), Silver (XAG/USD), Forex (EUR, GBP, JPY, AUD, CAD): BIQUOTE Live API & WebSocket Feed
 * - Crypto (BTC/USD): Binance Live Feed
 * - Indices (NASDAQ 100, S&P 500) & Commodities (WTI Crude Oil): Yahoo Finance / CME Feed
 */

import { MarketItem, Candle, Timeframe } from '../types';

export type ProviderType = 'BINANCE' | 'YAHOO_FINANCE' | 'OPEN_EXCHANGE' | 'BIQUOTE';

export interface AssetProviderConfig {
  id: string;
  symbol: string;
  providerSymbol: string;
  name: string;
  category: 'crypto' | 'commodities' | 'indices' | 'forex';
  primaryProvider: ProviderType;
  exchangeName: string;
  decimals: number;
}

export const ASSET_PROVIDER_CONFIGS: Record<string, AssetProviderConfig> = {
  'xau-usd': {
    id: 'xau-usd',
    symbol: 'XAU/USD',
    providerSymbol: 'XAUUSD',
    name: 'Gold Spot',
    category: 'commodities',
    primaryProvider: 'BIQUOTE',
    exchangeName: 'Biquote Gold Spot Feed',
    decimals: 2
  },
  'xag-usd': {
    id: 'xag-usd',
    symbol: 'XAG/USD',
    providerSymbol: 'XAGUSD',
    name: 'Silver',
    category: 'commodities',
    primaryProvider: 'BIQUOTE',
    exchangeName: 'Biquote Silver Spot Feed',
    decimals: 2
  },
  'eur-usd': {
    id: 'eur-usd',
    symbol: 'EUR/USD',
    providerSymbol: 'EURUSD',
    name: 'EUR/USD',
    category: 'forex',
    primaryProvider: 'BIQUOTE',
    exchangeName: 'Biquote Spot FX',
    decimals: 4
  },
  'gbp-usd': {
    id: 'gbp-usd',
    symbol: 'GBP/USD',
    providerSymbol: 'GBPUSD',
    name: 'GBP/USD',
    category: 'forex',
    primaryProvider: 'BIQUOTE',
    exchangeName: 'Biquote Spot FX',
    decimals: 4
  },
  'usd-jpy': {
    id: 'usd-jpy',
    symbol: 'USD/JPY',
    providerSymbol: 'USDJPY',
    name: 'USD/JPY',
    category: 'forex',
    primaryProvider: 'BIQUOTE',
    exchangeName: 'Biquote Spot FX',
    decimals: 2
  },
  'aud-usd': {
    id: 'aud-usd',
    symbol: 'AUD/USD',
    providerSymbol: 'AUDUSD',
    name: 'AUD/USD',
    category: 'forex',
    primaryProvider: 'BIQUOTE',
    exchangeName: 'Biquote Spot FX',
    decimals: 4
  },
  'usd-cad': {
    id: 'usd-cad',
    symbol: 'USD/CAD',
    providerSymbol: 'USDCAD',
    name: 'USD/CAD',
    category: 'forex',
    primaryProvider: 'BIQUOTE',
    exchangeName: 'Biquote Spot FX',
    decimals: 4
  },
  'sp-500': {
    id: 'sp-500',
    symbol: 'S&P 500',
    providerSymbol: '^GSPC',
    name: 'S&P 500',
    category: 'indices',
    primaryProvider: 'YAHOO_FINANCE',
    exchangeName: 'S&P / CME Globex',
    decimals: 2
  },
  'nasdaq-100': {
    id: 'nasdaq-100',
    symbol: 'NASDAQ 100',
    providerSymbol: '^NDX',
    name: 'NASDAQ 100',
    category: 'indices',
    primaryProvider: 'YAHOO_FINANCE',
    exchangeName: 'NASDAQ / CME Globex',
    decimals: 2
  },
  'btc-usd': {
    id: 'btc-usd',
    symbol: 'BTC/USD',
    providerSymbol: 'BTCUSDT',
    name: 'Bitcoin',
    category: 'crypto',
    primaryProvider: 'BINANCE',
    exchangeName: 'Binance Live Ticker',
    decimals: 2
  },
  'crude-oil': {
    id: 'crude-oil',
    symbol: 'WTI Crude Oil',
    providerSymbol: 'CL=F',
    name: 'WTI Crude Oil',
    category: 'commodities',
    primaryProvider: 'YAHOO_FINANCE',
    exchangeName: 'NYMEX Energy Feed',
    decimals: 2
  }
};

export type ConnectionStatus = 'LIVE' | 'STALE' | 'CONNECTING' | 'RECONNECTING' | 'ERROR';

export type StreamStatus = 'LIVE' | 'STALE' | 'RECONNECTING' | 'FALLBACK';

export interface TickDebugInfo {
  symbol: string;
  assetId: string;
  lastTickTimestamp: number;
  lastTickTimeFormatted: string;
  previousPrice: number;
  currentPrice: number;
  priceDirection: 'up' | 'down' | 'flat';
  messageReceived: 'YES' | 'NO';
  totalTicksReceived: number;
  ageSeconds: number;
  source: string;
  isLive: boolean;
}

export type MarketDataListener = (payload: {
  markets: Record<string, Partial<MarketItem>>;
  status: ConnectionStatus;
  lastUpdate: number;
  streamStatus: StreamStatus;
  debugMap: Record<string, TickDebugInfo>;
}) => void;

class MarketDataService {
  private status: ConnectionStatus = 'CONNECTING';
  private streamStatus: StreamStatus = 'RECONNECTING';
  private lastUpdateTimestamp: number = 0;
  private listeners: Set<MarketDataListener> = new Set();
  private refreshIntervalTimer: any = null;
  private isFetching: boolean = false;
  private totalMessagesReceived: number = 0;
  private lastMessageTimestamp: number = 0;

  // Tracking for live prices, previous prices, and ticks
  public latestPrices: Record<string, number> = {
    'xau-usd': 4358.50,
    'xag-usd': 65.65,
    'eur-usd': 1.1479,
    'gbp-usd': 1.3358,
    'usd-jpy': 156.20,
    'aud-usd': 0.7114,
    'usd-cad': 1.3991,
    'sp-500': 7637.76,
    'nasdaq-100': 29446.98,
    'btc-usd': 76420.00,
    'crude-oil': 100.86
  };

  public previousPrices: Record<string, number> = {
    'xau-usd': 4358.50,
    'xag-usd': 65.65,
    'eur-usd': 1.1479,
    'gbp-usd': 1.3358,
    'usd-jpy': 156.20,
    'aud-usd': 0.7114,
    'usd-cad': 1.3991,
    'sp-500': 7637.76,
    'nasdaq-100': 29446.98,
    'btc-usd': 76420.00,
    'crude-oil': 100.86
  };

  public lastTickTimestamps: Record<string, number> = {};
  public tickCounts: Record<string, number> = {};
  public assetSources: Record<string, string> = {};

  // WebSocket Client support
  private ws: WebSocket | null = null;
  private wsConnected: boolean = false;
  private reconnectTimer: any = null;
  private pingIntervalTimer: any = null;

  constructor() {
    this.status = 'CONNECTING';
    this.streamStatus = 'RECONNECTING';
  }

  public getStatus(): ConnectionStatus {
    this.recalculateLiveStatus();
    return this.status;
  }

  public getStreamStatus(): StreamStatus {
    this.recalculateLiveStatus();
    return this.streamStatus;
  }

  public isWebSocketStreaming(): boolean {
    return this.wsConnected;
  }

  public getTotalMessagesReceived(): number {
    return this.totalMessagesReceived;
  }

  /**
   * Recalculates LIVE vs STALE connection status strictly based on real received ticks
   */
  private recalculateLiveStatus() {
    const now = Date.now();
    const isRecent = this.lastMessageTimestamp > 0 && (now - this.lastMessageTimestamp) < 12000;
    const hasTicks = this.totalMessagesReceived > 0;

    if (isRecent && hasTicks) {
      this.status = 'LIVE';
      this.streamStatus = 'LIVE';
    } else {
      this.status = 'STALE';
      this.streamStatus = 'STALE';
    }
  }

  /**
   * Generates debug metadata for a given symbol or assetId
   */
  public getDebugInfo(symbolOrId: string): TickDebugInfo {
    const assetKey = Object.keys(ASSET_PROVIDER_CONFIGS).find(
      key => key === symbolOrId || 
             ASSET_PROVIDER_CONFIGS[key].symbol.toLowerCase().replace(/[^a-z0-9]/g, '') === symbolOrId.toLowerCase().replace(/[^a-z0-9]/g, '') ||
             ASSET_PROVIDER_CONFIGS[key].providerSymbol.toLowerCase() === symbolOrId.toLowerCase()
    ) || 'xau-usd';

    const config = ASSET_PROVIDER_CONFIGS[assetKey];
    const currPrice = this.latestPrices[assetKey] || 0;
    const prevPrice = this.previousPrices[assetKey] || currPrice;
    const lastTick = this.lastTickTimestamps[assetKey] || 0;
    const count = this.tickCounts[assetKey] || 0;
    const now = Date.now();
    const ageSeconds = lastTick > 0 ? Math.max(0, Math.floor((now - lastTick) / 1000)) : 0;
    const isLive = count > 0 && lastTick > 0 && ageSeconds < 10;

    const priceDirection: 'up' | 'down' | 'flat' = 
      currPrice > prevPrice ? 'up' : currPrice < prevPrice ? 'down' : 'flat';

    const formattedTime = lastTick > 0 
      ? new Date(lastTick).toLocaleTimeString([], { hour12: false }) 
      : 'Waiting for tick...';

    return {
      symbol: config?.providerSymbol || symbolOrId.toUpperCase(),
      assetId: assetKey,
      lastTickTimestamp: lastTick,
      lastTickTimeFormatted: formattedTime,
      previousPrice: prevPrice,
      currentPrice: currPrice,
      priceDirection,
      messageReceived: count > 0 ? 'YES' : 'NO',
      totalTicksReceived: count,
      ageSeconds,
      source: this.assetSources[assetKey] || config?.exchangeName || 'BIQUOTE Live Feed',
      isLive
    };
  }

  public getAllDebugInfo(): Record<string, TickDebugInfo> {
    const result: Record<string, TickDebugInfo> = {};
    for (const id of Object.keys(ASSET_PROVIDER_CONFIGS)) {
      result[id] = this.getDebugInfo(id);
    }
    return result;
  }

  private connectWebSocket() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/streaming`;

    this.streamStatus = 'RECONNECTING';

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.wsConnected = true;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }

        // Start ping heartbeat every 15s to keep connection alive
        if (this.pingIntervalTimer) clearInterval(this.pingIntervalTimer);
        this.pingIntervalTimer = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            try {
              this.ws.send(JSON.stringify({ type: 'ping' }));
            } catch (e) {}
          }
        }, 15000);
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const now = Date.now();
          this.totalMessagesReceived++;
          this.lastMessageTimestamp = now;

          if (payload.type === 'init' && payload.data) {
            const mapped: Record<string, Partial<MarketItem>> = {};
            for (const [id, val] of Object.entries(payload.data as Record<string, any>)) {
              if (val && val.price != null) {
                const oldPrice = this.latestPrices[id] || val.price;
                this.previousPrices[id] = oldPrice;
                this.latestPrices[id] = val.price;
                this.lastTickTimestamps[id] = val.timestamp || now;
                this.tickCounts[id] = (this.tickCounts[id] || 0) + 1;
                if (val.source) this.assetSources[id] = val.source;

                mapped[id] = {
                  price: val.price,
                  change: val.change,
                  changePercent: val.changePercent,
                  high24h: val.high24h,
                  low24h: val.low24h,
                  volume24h: val.volume24h,
                  lastTickTimestamp: val.timestamp || now,
                  bid: val.bid,
                  ask: val.ask
                };
              }
            }
            this.status = 'LIVE';
            this.streamStatus = 'LIVE';
            this.lastUpdateTimestamp = now;
            this.notify(mapped);
          } else if (payload.type === 'tick' && payload.data) {
            const val = payload.data;
            const id = val.assetId;
            if (id && val.price != null) {
              const oldPrice = this.latestPrices[id] || val.price;
              this.previousPrices[id] = val.previousPrice != null ? val.previousPrice : oldPrice;
              this.latestPrices[id] = val.price;
              this.lastTickTimestamps[id] = val.timestamp || now;
              this.tickCounts[id] = (this.tickCounts[id] || 0) + 1;
              if (val.source) this.assetSources[id] = val.source;

              const mapped: Record<string, Partial<MarketItem>> = {
                [id]: {
                  price: val.price,
                  change: val.change,
                  changePercent: val.changePercent,
                  high24h: val.high24h,
                  low24h: val.low24h,
                  volume24h: val.volume24h,
                  lastTickTimestamp: val.timestamp || now,
                  bid: val.bid,
                  ask: val.ask
                }
              };

              this.status = 'LIVE';
              this.streamStatus = 'LIVE';
              this.lastUpdateTimestamp = now;
              this.notify(mapped);
            }
          }
        } catch (e) {
          console.warn('[MarketDataService] Error parsing WebSocket frame:', e);
        }
      };

      this.ws.onclose = () => {
        this.wsConnected = false;
        this.ws = null;
        this.streamStatus = 'RECONNECTING';
        if (this.pingIntervalTimer) clearInterval(this.pingIntervalTimer);
        this.triggerWSReconnect();
        this.notify({});
      };

      this.ws.onerror = (err) => {
        console.warn('[MarketDataService] WebSocket connection notification (reconnecting):', err);
        this.wsConnected = false;
        this.ws = null;
        this.streamStatus = 'RECONNECTING';
        if (this.pingIntervalTimer) clearInterval(this.pingIntervalTimer);
        this.triggerWSReconnect();
        this.notify({});
      };
    } catch (err) {
      console.warn('[MarketDataService] WebSocket instantiation error:', err);
      this.streamStatus = 'RECONNECTING';
      this.triggerWSReconnect();
      this.notify({});
    }
  }

  private triggerWSReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connectWebSocket();
    }, 2000);
  }

  public disconnectWebSocket() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }
    this.wsConnected = false;
    this.streamStatus = 'STALE';
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.pingIntervalTimer) {
      clearInterval(this.pingIntervalTimer);
      this.pingIntervalTimer = null;
    }
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
    this.recalculateLiveStatus();
    const debugMap = this.getAllDebugInfo();

    this.listeners.forEach(fn => {
      try {
        fn({
          markets,
          status: this.status,
          lastUpdate: this.lastUpdateTimestamp,
          streamStatus: this.streamStatus,
          debugMap
        });
      } catch (e) {
        console.error('[MarketDataService] Listener error:', e);
      }
    });
  }

  /**
   * Primary fallback REST poll if WebSocket is ever disconnected
   */
  public async fetchAllMarketPrices(): Promise<Record<string, Partial<MarketItem>>> {
    if (this.isFetching) return {};
    this.isFetching = true;

    try {
      const res = await fetch('/api/market-data/all', {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        const payload = await res.json();
        if (payload && payload.data && Object.keys(payload.data).length > 0) {
          const now = Date.now();
          this.totalMessagesReceived++;
          this.lastMessageTimestamp = now;
          this.status = 'LIVE';
          this.streamStatus = 'LIVE';
          this.lastUpdateTimestamp = now;

          const mapped: Record<string, Partial<MarketItem>> = {};
          for (const [id, val] of Object.entries(payload.data as Record<string, any>)) {
            if (val && val.price != null) {
              const oldPrice = this.latestPrices[id] || val.price;
              this.previousPrices[id] = oldPrice;
              this.latestPrices[id] = val.price;
              this.lastTickTimestamps[id] = val.timestamp || now;
              this.tickCounts[id] = (this.tickCounts[id] || 0) + 1;
              if (val.provider) this.assetSources[id] = val.provider;

              mapped[id] = {
                price: val.price,
                change: val.change,
                changePercent: val.changePercent,
                high24h: val.high24h,
                low24h: val.low24h,
                volume24h: val.volume24h,
                lastTickTimestamp: val.timestamp || now
              };
            }
          }

          this.notify(mapped);
          this.isFetching = false;
          return mapped;
        }
      }
    } catch {
      // Endpoint fallback
    }

    this.isFetching = false;
    return {};
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
   * Start automatic streaming and refresh
   */
  public startAutoRefresh(intervalMs: number = 3000) {
    this.connectWebSocket();

    if (this.refreshIntervalTimer) return;
    this.fetchAllMarketPrices();
    
    this.refreshIntervalTimer = setInterval(() => {
      // Use REST fetch as active sync / fallback
      if (!this.wsConnected || (Date.now() - this.lastMessageTimestamp > 5000)) {
        this.fetchAllMarketPrices();
      }
    }, intervalMs);
  }

  /**
   * Stop automatic streaming
   */
  public stopAutoRefresh() {
    this.disconnectWebSocket();
    if (this.refreshIntervalTimer) {
      clearInterval(this.refreshIntervalTimer);
      this.refreshIntervalTimer = null;
    }
  }
}

export const marketDataService = new MarketDataService();
