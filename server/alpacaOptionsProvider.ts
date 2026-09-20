/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AURUM TERMINAL — REAL-TIME SPY OPTIONS DATA PROVIDER (ALPACA + CBOE FALLBACK)
 * Primary Provider: Alpaca Market Data Options API (v1beta1)
 * Primary Preferred Feed: OPRA (with genuine entitlement check)
 * Fallback: Alpaca Indicative Feed
 * Secondary Fallback: CBOE Delayed (CBOE_DELAYED_FALLBACK)
 * 
 * Strict Security: Server-side only, secrets never exposed to client or logs.
 * Zero Synthetic Greeks, Zero Math.random().
 */

import WebSocket from 'ws';
import { encode, decode } from '@msgpack/msgpack';

export type OptionsFeedClassification =
  | 'REALTIME_OPRA'
  | 'INDICATIVE'
  | 'DELAYED'
  | 'STALE'
  | 'OFFLINE'
  | 'UNKNOWN';

export type OptionsFeedType = 'opra' | 'indicative' | 'cboe_delayed' | 'none';

export type OptionsSubscriptionPermission =
  | 'ENTITLED_OPRA'
  | 'INDICATIVE_ONLY'
  | 'UNAUTHENTICATED'
  | 'UNKNOWN';

export interface AlpacaParsedOptionContract {
  contractSymbol: string;
  type: 'CALL' | 'PUT';
  strike: number;
  expirationDate: string;
  dte: number;
  bid: number;
  ask: number;
  mid: number;
  last: number;
  volume: number;
  openInterest: number;
  iv: number | null;
  delta: number | null;
  gamma: number | null;
  theta: number | null;
  vega: number | null;
  quoteTimestamp: string;
  tradeTimestamp: string;
  source: string;
  latencySeconds: number;
}

export interface SpyProviderHealth {
  primaryProvider: 'ALPACA';
  requestedFeed: string;
  actualFeed: OptionsFeedType;
  classification: OptionsFeedClassification;
  connected: boolean;
  lastQuoteTimestamp: string;
  latencySeconds: number;
  websocketConnected: boolean;
  streamDegraded: boolean;
  restAvailable: boolean;
  fallbackActive: boolean;
  activeContractSymbol: string | null;
  subscriptionPermission: OptionsSubscriptionPermission;
  sourceBadge: 'ALPACA OPRA' | 'ALPACA INDICATIVE' | 'CBOE DELAYED' | 'OFFLINE';
  lastError: string | null;
  maxAcceptableLatencySeconds: number;
}

export class AlpacaOptionsProvider {
  private apiKey: string = '';
  private apiSecret: string = '';
  private requestedFeed: string = 'opra';
  private maxLatencySeconds: number = 180;

  // Actual status
  private actualFeed: OptionsFeedType = 'cboe_delayed';
  private subscriptionPermission: OptionsSubscriptionPermission = 'UNKNOWN';
  private classification: OptionsFeedClassification = 'UNKNOWN';
  private lastQuoteTimestamp: string = '';
  private latencySeconds: number = 0;
  private lastError: string | null = null;
  private lastEntitlementCheckTime: number = 0;

  // Real-time WebSocket streaming for active contract
  private ws: WebSocket | null = null;
  private wsConnected: boolean = false;
  private wsAuthenticated: boolean = false;
  private streamDegraded: boolean = false;
  private activeMonitoredSymbol: string | null = null;
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  // Streaming latest quote cache for active monitored contract
  private latestActiveQuote: {
    symbol: string;
    bid: number;
    ask: number;
    mid: number;
    last: number;
    timestamp: string;
    latencySeconds: number;
  } | null = null;

  constructor() {
    this.reloadEnvConfig();
    this.checkEntitlement().catch(err => {
      console.warn('[Alpaca Provider] Initial entitlement check note:', err?.message || err);
    });
  }

  public reloadEnvConfig() {
    this.apiKey = (process.env.ALPACA_API_KEY || '').trim();
    this.apiSecret = (process.env.ALPACA_API_SECRET || '').trim();
    this.requestedFeed = (process.env.ALPACA_OPTIONS_FEED || 'opra').toLowerCase().trim();
    const lat = parseInt(process.env.SPY_OPTIONS_MAX_LATENCY_SECONDS || '180', 10);
    this.maxLatencySeconds = isNaN(lat) || lat <= 0 ? 180 : lat;
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      'APCA-API-KEY-ID': this.apiKey,
      'APCA-API-SECRET-KEY': this.apiSecret,
      'Accept': 'application/json'
    };
  }

  public hasCredentials(): boolean {
    return Boolean(this.apiKey && this.apiSecret);
  }

  /**
   * Probes Alpaca Market Data Options API to test real account entitlement
   * Never assumes OPRA access.
   */
  public async checkEntitlement(force: boolean = false): Promise<OptionsSubscriptionPermission> {
    const now = Date.now();
    // Cache check for 60 seconds unless forced
    if (!force && this.subscriptionPermission !== 'UNKNOWN' && (now - this.lastEntitlementCheckTime < 60000)) {
      return this.subscriptionPermission;
    }

    this.lastEntitlementCheckTime = now;
    this.reloadEnvConfig();

    if (!this.hasCredentials()) {
      this.subscriptionPermission = 'UNAUTHENTICATED';
      this.actualFeed = 'cboe_delayed';
      this.classification = 'DELAYED';
      this.lastError = 'ALPACA_API_KEY / ALPACA_API_SECRET not configured. Using CBOE_DELAYED_FALLBACK.';
      return this.subscriptionPermission;
    }

    // Step 1: Probe OPRA feed
    try {
      const probeUrl = `https://data.alpaca.markets/v1beta1/options/snapshots/SPY?feed=opra&limit=1`;
      const res = await fetch(probeUrl, {
        headers: this.getAuthHeaders()
      });

      if (res.ok) {
        this.subscriptionPermission = 'ENTITLED_OPRA';
        this.actualFeed = 'opra';
        this.classification = 'REALTIME_OPRA';
        this.lastError = null;
        console.log('[Alpaca Provider] Verified OPRA feed entitlement: ACTIVE & REAL-TIME.');
        this.initWebSocket();
        return this.subscriptionPermission;
      }

      const bodyText = await res.text().catch(() => '');
      // Check if 403 Forbidden or 422 indicates OPRA subscription not entitled
      if (res.status === 403 || res.status === 422 || bodyText.toLowerCase().includes('subscription') || bodyText.toLowerCase().includes('opra')) {
        console.warn('[Alpaca Provider] Account is authenticated, but not entitled to OPRA. Testing INDICATIVE feed...');
        
        // Step 2: Probe Indicative feed
        const indUrl = `https://data.alpaca.markets/v1beta1/options/snapshots/SPY?feed=indicative&limit=1`;
        const indRes = await fetch(indUrl, {
          headers: this.getAuthHeaders()
        });

        if (indRes.ok) {
          this.subscriptionPermission = 'INDICATIVE_ONLY';
          this.actualFeed = 'indicative';
          this.classification = 'INDICATIVE';
          this.lastError = 'OPRA not entitled on account. Operating on Alpaca Indicative feed (Paper/Testing).';
          console.log('[Alpaca Provider] Alpaca Indicative feed verified.');
          this.initWebSocket();
          return this.subscriptionPermission;
        }
      }

      // Authentication failed or unauthorized
      this.subscriptionPermission = 'UNAUTHENTICATED';
      this.actualFeed = 'cboe_delayed';
      this.classification = 'DELAYED';
      this.lastError = `Alpaca authentication rejected (Status ${res.status}). Falling back to CBOE.`;
    } catch (err: any) {
      this.subscriptionPermission = 'UNAUTHENTICATED';
      this.actualFeed = 'cboe_delayed';
      this.classification = 'DELAYED';
      this.lastError = `Alpaca probe connection failed: ${err?.message || 'Network error'}. Falling back to CBOE.`;
    }

    return this.subscriptionPermission;
  }

  /**
   * Parse OCC Option Symbol: SPY260920C00600000
   */
  public parseOccSymbol(symbol: string): {
    underlying: string;
    expiration: string;
    type: 'CALL' | 'PUT';
    strike: number;
  } | null {
    // Standard OCC regex: root + 6 digits date (YYMMDD) + C/P + 8 digits strike
    const match = symbol.match(/^([A-Z]{1,6})(\d{2})(\d{2})(\d{2})([CP])(\d{8})$/);
    if (!match) return null;

    const root = match[1];
    const yy = match[2];
    const mm = match[3];
    const dd = match[4];
    const typeChar = match[5];
    const strikeRaw = parseInt(match[6], 10);

    const year = `20${yy}`;
    const expiration = `${year}-${mm}-${dd}`;
    const strike = strikeRaw / 1000;

    return {
      underlying: root,
      expiration,
      type: typeChar === 'C' ? 'CALL' : 'PUT',
      strike
    };
  }

  /**
   * Fetch 0DTE SPY Options Chain via Alpaca Market Data Snapshots
   * Returns empty array if Alpaca is unavailable so caller can fall back to CBOE.
   */
  public async fetchAlpaca0DTEChain(todayDateET: string): Promise<AlpacaParsedOptionContract[]> {
    if (this.subscriptionPermission === 'UNKNOWN') {
      await this.checkEntitlement();
    }

    if (this.subscriptionPermission === 'UNAUTHENTICATED' || this.actualFeed === 'cboe_delayed' || this.actualFeed === 'none') {
      return [];
    }

    const feedToUse = this.actualFeed === 'opra' ? 'opra' : 'indicative';
    const contracts: AlpacaParsedOptionContract[] = [];

    try {
      // Query snapshots for SPY with active feed
      const url = `https://data.alpaca.markets/v1beta1/options/snapshots/SPY?feed=${feedToUse}&limit=100`;
      const res = await fetch(url, {
        headers: this.getAuthHeaders()
      });

      if (!res.ok) {
        throw new Error(`Alpaca options snapshots failed with HTTP ${res.status}`);
      }

      const data = await res.json();
      const snapshots = data.snapshots || {};
      const symbols = Object.keys(snapshots);

      if (symbols.length === 0) {
        return [];
      }

      // Collect all available expiration dates to locate nearest / today's 0DTE
      const parsedList: { symbol: string; parsed: ReturnType<typeof this.parseOccSymbol>; snap: any }[] = [];
      for (const sym of symbols) {
        const parsed = this.parseOccSymbol(sym);
        if (parsed && parsed.underlying === 'SPY') {
          parsedList.push({ symbol: sym, parsed, snap: snapshots[sym] });
        }
      }

      if (parsedList.length === 0) return [];

      const availableDates = Array.from(new Set(parsedList.map(p => p.parsed!.expiration))).sort();
      // Look for today's date first, else closest upcoming or closest available
      const targetExp = availableDates.includes(todayDateET) ? todayDateET : availableDates[0];

      const nowMs = Date.now();
      let newestTimestampMs = 0;

      for (const item of parsedList) {
        if (item.parsed!.expiration !== targetExp) continue;

        const snap = item.snap || {};
        const quote = snap.latestQuote || {};
        const trade = snap.latestTrade || {};
        const greeks = snap.greeks || null;

        const bid = typeof quote.bp === 'number' ? quote.bp : 0;
        const ask = typeof quote.ap === 'number' ? quote.ap : 0;
        const last = typeof trade.p === 'number' ? trade.p : 0;
        const mid = bid > 0 && ask > 0 ? +((bid + ask) / 2).toFixed(2) : (last || bid || ask);

        const quoteTime = quote.t || '';
        const tradeTime = trade.t || '';

        let quoteMs = 0;
        if (quoteTime) {
          quoteMs = Date.parse(quoteTime);
          if (!isNaN(quoteMs) && quoteMs > newestTimestampMs) {
            newestTimestampMs = quoteMs;
          }
        }

        const latSec = quoteMs > 0 ? Math.max(0, Math.round((nowMs - quoteMs) / 1000)) : 0;

        // Greeks extraction — NEVER fabricate missing Greeks
        const delta = greeks && typeof greeks.delta === 'number' ? +greeks.delta.toFixed(4) : null;
        const gamma = greeks && typeof greeks.gamma === 'number' ? +greeks.gamma.toFixed(4) : null;
        const theta = greeks && typeof greeks.theta === 'number' ? +greeks.theta.toFixed(4) : null;
        const vega = greeks && typeof greeks.vega === 'number' ? +greeks.vega.toFixed(4) : null;
        const iv = greeks && typeof greeks.implied_volatility === 'number'
          ? +greeks.implied_volatility.toFixed(4)
          : (typeof snap.impliedVolatility === 'number' ? +snap.impliedVolatility.toFixed(4) : null);

        contracts.push({
          contractSymbol: item.symbol,
          type: item.parsed!.type,
          strike: item.parsed!.strike,
          expirationDate: targetExp,
          dte: 0,
          bid,
          ask,
          mid,
          last,
          volume: typeof trade.s === 'number' ? trade.s : 0,
          openInterest: 0, // Options snapshot does not contain OI, left strictly at 0
          iv,
          delta,
          gamma,
          theta,
          vega,
          quoteTimestamp: quoteTime,
          tradeTimestamp: tradeTime,
          source: feedToUse === 'opra' ? 'ALPACA_OPRA' : 'ALPACA_INDICATIVE',
          latencySeconds: latSec
        });
      }

      if (newestTimestampMs > 0) {
        this.lastQuoteTimestamp = new Date(newestTimestampMs).toISOString();
        this.latencySeconds = Math.max(0, Math.round((nowMs - newestTimestampMs) / 1000));
        
        // Update classification based on feed and freshness
        if (this.actualFeed === 'opra') {
          this.classification = this.latencySeconds > this.maxLatencySeconds ? 'STALE' : 'REALTIME_OPRA';
        } else if (this.actualFeed === 'indicative') {
          this.classification = this.latencySeconds > this.maxLatencySeconds ? 'STALE' : 'INDICATIVE';
        }
      }

      return contracts;
    } catch (err: any) {
      console.warn('[Alpaca Provider] Error fetching Alpaca chain:', err?.message || err);
      this.lastError = err?.message || 'Failed to fetch Alpaca snapshots';
      return [];
    }
  }

  /**
   * Monitor Selected Single Contract via REST Fallback
   */
  public async fetchContractSnapshot(symbol: string): Promise<{
    bid: number;
    ask: number;
    mid: number;
    last: number;
    timestamp: string;
    latencySeconds: number;
    greeks?: any;
  } | null> {
    if (!this.hasCredentials() || this.subscriptionPermission === 'UNAUTHENTICATED') {
      return null;
    }

    try {
      const feedToUse = this.actualFeed === 'opra' ? 'opra' : 'indicative';
      const url = `https://data.alpaca.markets/v1beta1/options/snapshots?symbols=${encodeURIComponent(symbol)}&feed=${feedToUse}`;
      const res = await fetch(url, { headers: this.getAuthHeaders() });
      if (!res.ok) return null;

      const data = await res.json();
      const snap = data.snapshots?.[symbol];
      if (!snap) return null;

      const q = snap.latestQuote || {};
      const t = snap.latestTrade || {};
      const bid = typeof q.bp === 'number' ? q.bp : 0;
      const ask = typeof q.ap === 'number' ? q.ap : 0;
      const last = typeof t.p === 'number' ? t.p : 0;
      const mid = bid > 0 && ask > 0 ? +((bid + ask) / 2).toFixed(2) : (last || bid);

      const timestamp = q.t || t.t || new Date().toISOString();
      const quoteMs = Date.parse(timestamp);
      const latencySeconds = !isNaN(quoteMs) ? Math.max(0, Math.round((Date.now() - quoteMs) / 1000)) : 0;

      return {
        bid,
        ask,
        mid,
        last,
        timestamp,
        latencySeconds,
        greeks: snap.greeks || null
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Initialize Real-time Options WebSocket Stream
   */
  public initWebSocket() {
    if (this.ws || !this.hasCredentials() || this.subscriptionPermission === 'UNAUTHENTICATED') {
      return;
    }

    const feed = this.actualFeed === 'opra' ? 'opra' : 'indicative';
    const wsUrl = `wss://stream.data.alpaca.markets/v1beta1/${feed}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.on('open', () => {
        this.wsConnected = true;
        this.streamDegraded = false;
        this.reconnectAttempts = 0;
        console.log(`[Alpaca WebSocket] Connected to options stream (${feed}). Authenticating...`);

        // Authenticate with MessagePack binary payload
        const authPayload = encode({
          action: 'auth',
          key: this.apiKey,
          secret: this.apiSecret
        });
        this.ws?.send(authPayload);

        // Keep-alive heartbeat every 20s
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.ping();
          }
        }, 20000);
      });

      this.ws.on('message', (data: WebSocket.RawData) => {
        try {
          const decoded: any = decode(data as Uint8Array);
          const messages = Array.isArray(decoded) ? decoded : [decoded];

          for (const msg of messages) {
            // Check auth status
            if (msg.T === 'success' && msg.msg === 'authenticated') {
              this.wsAuthenticated = true;
              console.log('[Alpaca WebSocket] Successfully authenticated on options feed.');
              // Restore subscription if we were tracking an active contract
              if (this.activeMonitoredSymbol) {
                this.subscribeContract(this.activeMonitoredSymbol);
              }
            } else if (msg.T === 'error') {
              console.warn('[Alpaca WebSocket] Error message received:', msg.msg || msg);
              this.streamDegraded = true;
            } else if (msg.T === 'q') {
              // Quote message: { T: 'q', sym: '...', bp: 1.25, ap: 1.30, t: '...' }
              if (this.activeMonitoredSymbol && msg.sym === this.activeMonitoredSymbol) {
                const nowMs = Date.now();
                const quoteMs = msg.t ? Date.parse(msg.t) : nowMs;
                const lat = !isNaN(quoteMs) ? Math.max(0, Math.round((nowMs - quoteMs) / 1000)) : 0;

                const bid = typeof msg.bp === 'number' ? msg.bp : (this.latestActiveQuote?.bid ?? 0);
                const ask = typeof msg.ap === 'number' ? msg.ap : (this.latestActiveQuote?.ask ?? 0);
                const mid = bid > 0 && ask > 0 ? +((bid + ask) / 2).toFixed(2) : bid;

                this.latestActiveQuote = {
                  symbol: msg.sym,
                  bid,
                  ask,
                  mid,
                  last: this.latestActiveQuote?.last ?? mid,
                  timestamp: msg.t || new Date().toISOString(),
                  latencySeconds: lat
                };
              }
            } else if (msg.T === 't') {
              // Trade message: { T: 't', sym: '...', p: 1.28, s: 10, t: '...' }
              if (this.activeMonitoredSymbol && msg.sym === this.activeMonitoredSymbol) {
                if (this.latestActiveQuote) {
                  this.latestActiveQuote.last = typeof msg.p === 'number' ? msg.p : this.latestActiveQuote.last;
                }
              }
            }
          }
        } catch (decErr) {
          // Ignore binary frame decode anomalies
        }
      });

      this.ws.on('close', (code, reason) => {
        this.wsConnected = false;
        this.wsAuthenticated = false;
        this.streamDegraded = true;
        this.ws = null;
        if (this.pingInterval) clearInterval(this.pingInterval);

        // Exponential backoff reconnect
        this.reconnectAttempts = Math.min(6, this.reconnectAttempts + 1);
        const delayMs = Math.min(30000, 1000 * Math.pow(2, this.reconnectAttempts));
        console.warn(`[Alpaca WebSocket] Stream disconnected (${code}). Reconnecting in ${delayMs / 1000}s...`);

        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          this.initWebSocket();
        }, delayMs);
      });

      this.ws.on('error', (err) => {
        console.warn('[Alpaca WebSocket] Socket error:', err.message);
        this.streamDegraded = true;
      });
    } catch (e: any) {
      this.streamDegraded = true;
      console.warn('[Alpaca WebSocket] Initialization error:', e?.message || e);
    }
  }

  /**
   * Subscribe to Active Contract for Real-Time Streaming
   */
  public subscribeContract(symbol: string) {
    this.activeMonitoredSymbol = symbol;
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.wsAuthenticated) {
      const subPayload = encode({
        action: 'subscribe',
        quotes: [symbol]
      });
      this.ws.send(subPayload);
      console.log(`[Alpaca WebSocket] Subscribed to active options contract: ${symbol}`);
    }
  }

  /**
   * Unsubscribe / Clear Active Contract
   */
  public unsubscribeContract() {
    if (this.activeMonitoredSymbol && this.ws && this.ws.readyState === WebSocket.OPEN && this.wsAuthenticated) {
      const unsubPayload = encode({
        action: 'unsubscribe',
        quotes: [this.activeMonitoredSymbol]
      });
      this.ws.send(unsubPayload);
    }
    this.activeMonitoredSymbol = null;
    this.latestActiveQuote = null;
  }

  public getLatestActiveQuote() {
    return this.latestActiveQuote;
  }

  /**
   * Safe Non-Secret Health Telemetry
   */
  public getHealth(): SpyProviderHealth {
    let badge: 'ALPACA OPRA' | 'ALPACA INDICATIVE' | 'CBOE DELAYED' | 'OFFLINE' = 'CBOE DELAYED';
    if (this.actualFeed === 'opra') {
      badge = 'ALPACA OPRA';
    } else if (this.actualFeed === 'indicative') {
      badge = 'ALPACA INDICATIVE';
    } else if (this.actualFeed === 'cboe_delayed') {
      badge = 'CBOE DELAYED';
    } else {
      badge = 'OFFLINE';
    }

    return {
      primaryProvider: 'ALPACA',
      requestedFeed: this.requestedFeed,
      actualFeed: this.actualFeed,
      classification: this.classification,
      connected: this.hasCredentials() && this.subscriptionPermission !== 'UNAUTHENTICATED',
      lastQuoteTimestamp: this.lastQuoteTimestamp,
      latencySeconds: this.latencySeconds,
      websocketConnected: this.wsConnected && this.wsAuthenticated,
      streamDegraded: this.streamDegraded,
      restAvailable: true,
      fallbackActive: this.actualFeed === 'cboe_delayed' || this.actualFeed === 'indicative',
      activeContractSymbol: this.activeMonitoredSymbol,
      subscriptionPermission: this.subscriptionPermission,
      sourceBadge: badge,
      lastError: this.lastError,
      maxAcceptableLatencySeconds: this.maxLatencySeconds
    };
  }
}

export const alpacaOptionsProvider = new AlpacaOptionsProvider();
