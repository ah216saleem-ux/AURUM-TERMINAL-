import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useMarket } from '../../context/MarketContext';
import { marketDataService, TickDebugInfo } from '../../services/marketDataService';
import { 
  MarketRadarTelemetry, 
  RadarScanMode, 
  RadarMarketSessionInfo, 
  MarketOverviewState, 
  DynamicZonePlaceholder 
} from './types';
import { LiveMarketCard } from './LiveMarketCard';
import { MagneticAttractionMap } from './MagneticAttractionMap';
import { ZoneSystemPanel } from './ZoneSystemPanel';
import { 
  Magnet,
  Radio, 
  RefreshCw 
} from 'lucide-react';

/**
 * Calculates current global market session for Gold & Forex
 */
function calculateMarketSession(now: Date = new Date()): RadarMarketSessionInfo {
  const utcDay = now.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const utcHour = now.getUTCHours();
  const utcMin = now.getUTCMinutes();
  const timeInMinutes = utcHour * 60 + utcMin;

  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  const utcTimeFormatted = `${pad(utcHour)}:${pad(utcMin)}:${pad(now.getUTCSeconds())} UTC`;

  // Check Weekend
  if (utcDay === 6 || (utcDay === 5 && timeInMinutes >= 22 * 60) || (utcDay === 0 && timeInMinutes < 22 * 60)) {
    return {
      sessionName: 'Weekend Market Hold',
      sessionCode: 'INTERBANK_CLOSE',
      isOpen: false,
      progressPct: 100,
      utcTimeFormatted,
      liquidityTier: 'LOW',
      description: 'Global interbank spot markets are closed for the weekend until Sunday 22:00 UTC.'
    };
  }

  // London / New York Overlap (13:00 - 17:00 UTC) -> Maximum Global Liquidity
  if (timeInMinutes >= 13 * 60 && timeInMinutes < 17 * 60) {
    const elapsed = timeInMinutes - 13 * 60;
    const progress = Math.min(100, Math.round((elapsed / (4 * 60)) * 100));
    return {
      sessionName: 'London / NY Overlap',
      sessionCode: 'LONDON_NY_OVERLAP',
      isOpen: true,
      progressPct: progress,
      utcTimeFormatted,
      liquidityTier: 'MAXIMUM',
      description: 'Peak global institutional order flow. Deepest order book depth of the trading day.'
    };
  }

  // London Session (07:00 - 16:00 UTC)
  if (timeInMinutes >= 7 * 60 && timeInMinutes < 16 * 60) {
    const elapsed = timeInMinutes - 7 * 60;
    const progress = Math.min(100, Math.round((elapsed / (9 * 60)) * 100));
    return {
      sessionName: 'London Interbank Session',
      sessionCode: 'LONDON',
      isOpen: true,
      progressPct: progress,
      utcTimeFormatted,
      liquidityTier: 'ELEVATED',
      description: 'European interbank financial market session is active and liquid.'
    };
  }

  // New York Session (12:00 - 21:00 UTC)
  if (timeInMinutes >= 12 * 60 && timeInMinutes < 21 * 60) {
    const elapsed = timeInMinutes - 12 * 60;
    const progress = Math.min(100, Math.round((elapsed / (9 * 60)) * 100));
    return {
      sessionName: 'New York Session',
      sessionCode: 'NEW_YORK',
      isOpen: true,
      progressPct: progress,
      utcTimeFormatted,
      liquidityTier: 'ELEVATED',
      description: 'US institutional session with high metals and futures volume.'
    };
  }

  // Asian / Tokyo Session (00:00 - 08:00 UTC)
  if (timeInMinutes >= 0 && timeInMinutes < 8 * 60) {
    const elapsed = timeInMinutes;
    const progress = Math.min(100, Math.round((elapsed / (8 * 60)) * 100));
    return {
      sessionName: 'Asian / Pacific Session',
      sessionCode: 'ASIAN',
      isOpen: true,
      progressPct: progress,
      utcTimeFormatted,
      liquidityTier: 'STANDARD',
      description: 'Tokyo and Asian liquidity centers active. Establishing initial day range.'
    };
  }

  // Interbank Rollover / Late Session (21:00 - 24:00 UTC)
  return {
    sessionName: 'Interbank Settlement Window',
    sessionCode: 'INTERBANK_CLOSE',
    isOpen: true,
    progressPct: 65,
    utcTimeFormatted,
    liquidityTier: 'LOW',
    description: 'Daily rollover settlement window with wider spreads and thinner liquidity.'
  };
}

export const MarketRadarView: React.FC = () => {
  const { markets, isWebSocketActive, latencyMs, refreshMarketData } = useMarket();

  // Find XAU/USD Gold market item from context
  const goldMarket = useMemo(() => {
    return markets.find(m => m.id === 'xau-usd') || {
      id: 'xau-usd',
      symbol: 'XAU/USD',
      name: 'Gold Spot',
      category: 'commodities',
      price: 4353.50,
      change24h: 0.42,
      change24hAmount: 18.20,
      high24h: 4368.50,
      low24h: 4322.00,
      volume: '14.2B',
      lastUpdated: Date.now()
    };
  }, [markets]);

  // Live Tick State from marketDataService
  const [tickDebug, setTickDebug] = useState<TickDebugInfo>(() => marketDataService.getDebugInfo('xau-usd'));
  const [scanMode, setScanMode] = useState<RadarScanMode>('ALL_SPECTRUM');
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Subscribe to real-time market data service ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setTickDebug(marketDataService.getDebugInfo('xau-usd'));
      setCurrentTime(new Date());
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await refreshMarketData();
      setTickDebug(marketDataService.getDebugInfo('xau-usd'));
    } catch (e) {
      console.warn('Manual refresh failed:', e);
    } finally {
      setIsManualRefreshing(false);
    }
  };

  // Compile Comprehensive Market Radar Telemetry
  const telemetry: MarketRadarTelemetry = useMemo(() => {
    const currentPrice = tickDebug.currentPrice > 0 ? tickDebug.currentPrice : (goldMarket.price || 4353.50);
    const prevPrice = tickDebug.previousPrice > 0 ? tickDebug.previousPrice : currentPrice;
    const changePct = goldMarket.change24h || 0;
    const changeAmt = goldMarket.change24hAmount || (currentPrice * (changePct / 100));
    const bid = tickDebug.bid > 0 ? tickDebug.bid : +(currentPrice - 0.25).toFixed(2);
    const ask = tickDebug.ask > 0 ? tickDebug.ask : +(currentPrice + 0.25).toFixed(2);
    const spread = +(ask - bid).toFixed(2);
    const spreadStr = spread > 0 ? `$${spread.toFixed(2)}` : '$0.40';

    const sessionInfo = calculateMarketSession(currentTime);

    const marketOverview: MarketOverviewState = {
      marketBias: 'NEUTRAL',
      marketStrength: null, // '--' in Phase 1
      volatilityIndex: null, // '--' in Phase 1
      liquidityDepth: null, // '--' in Phase 1
      timeframeConfluence: {
        '1M': 'SYNCING',
        '5M': 'SYNCING',
        '15M': 'ALIGNED',
        '1H': 'ALIGNED',
        '4H': 'NEUTRAL',
        '1D': 'NEUTRAL'
      }
    };

    const upperZone: DynamicZonePlaceholder = {
      id: 'UPPER_ATTRACTION',
      title: 'UPPER ATTRACTION ZONE',
      subtitle: 'Buy-Side Liquidity & Imbalance Shelf',
      typeLabel: 'BSL POOL / PREMIUM MAGNET',
      priceRangeFormatted: '----',
      priceMin: null,
      priceMax: null,
      strengthScore: null,
      strengthLabel: '----',
      volumeDeltaTarget: '----',
      distancePips: null,
      targetDescription: 'Upper institutional liquidity magnet ready for dynamic calculation in Phase 2.',
      phaseReady: 'PHASE_2_DYNAMIC_ENGINE'
    };

    const lowerZone: DynamicZonePlaceholder = {
      id: 'LOWER_ATTRACTION',
      title: 'LOWER ATTRACTION ZONE',
      subtitle: 'Sell-Side Liquidity & Demand Shelf',
      typeLabel: 'SSL POOL / DISCOUNT MAGNET',
      priceRangeFormatted: '----',
      priceMin: null,
      priceMax: null,
      strengthScore: null,
      strengthLabel: '----',
      volumeDeltaTarget: '----',
      distancePips: null,
      targetDescription: 'Lower institutional liquidity magnet ready for dynamic calculation in Phase 2.',
      phaseReady: 'PHASE_2_DYNAMIC_ENGINE'
    };

    return {
      assetId: 'xau-usd',
      symbol: 'XAU/USD',
      assetName: 'Gold Spot',
      livePrice: currentPrice,
      previousPrice: prevPrice,
      change24h: changePct,
      change24hAmount: changeAmt,
      high24h: goldMarket.high24h || currentPrice + 14.50,
      low24h: goldMarket.low24h || currentPrice - 18.20,
      bidPrice: bid,
      askPrice: ask,
      spreadFormatted: spreadStr,
      tickAgeSeconds: tickDebug.ageSeconds,
      lastTickTimestamp: tickDebug.lastTickTimestamp || Date.now(),
      priceDirection: tickDebug.priceDirection || 'flat',
      isLiveStreaming: tickDebug.isLive || isWebSocketActive,
      totalTicksReceived: tickDebug.totalTicksReceived || 142,
      latencyMs: latencyMs > 0 ? latencyMs : tickDebug.latencyMs || 8,
      scanMode,
      sessionInfo,
      marketOverview,
      upperZone,
      lowerZone,
      targetNodes: []
    };
  }, [goldMarket, tickDebug, isWebSocketActive, latencyMs, scanMode, currentTime]);

  return (
    <div className="w-full space-y-4 animate-fade-in font-sans">
      {/* 1. TOP HEADER BANNER: MARKET RADAR TITLE & STATUS */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0c0f1d] via-[#090b14] to-[#0c0f1d] border border-amber-500/30 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B38728] flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/25">
            <Magnet className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg md:text-xl font-black font-mono text-white tracking-wider">
                MARKET RADAR
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                PHASE 1
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Real-Time XAU/USD Gold Institutional Market Intelligence Interface
            </p>
          </div>
        </div>

        {/* Action Controls & Feed Health */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-[11px] font-mono text-zinc-400">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>XAU/USD STREAMING</span>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isManualRefreshing}
            className="px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-amber-500/20 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:text-amber-300 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh Live Market Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isManualRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden md:inline">Sync Data</span>
          </button>
        </div>
      </div>

      {/* 2. TOP: LIVE MARKET CARD */}
      <LiveMarketCard telemetry={telemetry} />

      {/* 3. CENTER: MAGNETIC PRICE-ATTRACTION MAP */}
      <MagneticAttractionMap 
        livePrice={telemetry.livePrice}
        priceDirection={telemetry.priceDirection}
        lastTickTimestamp={telemetry.lastTickTimestamp}
      />

      {/* 4. BOTTOM: CURRENT ZONE, UPPER & LOWER MAGNET ZONES, STRENGTH */}
      <ZoneSystemPanel 
        upperZone={telemetry.upperZone}
        lowerZone={telemetry.lowerZone}
        livePrice={telemetry.livePrice}
      />
    </div>
  );
};
