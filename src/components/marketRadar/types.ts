/**
 * AURUM TERMINAL — MARKET RADAR (XAU/USD GOLD)
 * Types & Telemetry Models for Live Market Visual Engine
 */

export type RadarScanMode = 'ALL_SPECTRUM' | 'LIQUIDITY_DEPTH' | 'ORDER_FLOW' | 'VOLATILITY_PULSE';

export type DistanceTier = 'NEAR' | 'MEDIUM' | 'STRETCH';
export type StrengthTier = 'STRONG' | 'MEDIUM' | 'WEAK' | 'VERY_WEAK';

export interface MagneticZoneItem {
  id: string;
  price: number;
  deltaPrice: number;
  distanceR: number; // e.g. +1.33R or -0.74R
  distanceTier: DistanceTier;
  strengthTier: StrengthTier;
  chainAgreement: number; // 0 to 4
  channelLabel: string; // e.g. '4ch' | '1ch'
  isFirstTouchTarget?: boolean;
  type: 'UPPER' | 'LOWER';
}

export interface FirstTouchSignal {
  targetPrice: number;
  direction: 'UP' | 'DOWN';
  probabilityPct: number;
  distancePts: number;
  distanceR: number;
  strengthLabel: string;
  rejectFlipTarget: number;
  breakContinueTarget: number;
  breakChain: number[];
  rejectChain: number[];
}

export interface PullBalanceState {
  downPullPct: number;
  upPullPct: number;
  dominantSide: 'UP' | 'DOWN' | 'BALANCED';
  nearestUpMagnet: {
    price: number;
    distanceR: number;
    distanceTier: DistanceTier;
    strengthTier: StrengthTier;
  };
  nearestDownMagnet: {
    price: number;
    distanceR: number;
    distanceTier: DistanceTier;
    strengthTier: StrengthTier;
  };
  invalidationPrice: number;
}

export interface RadarTargetNode {
  id: string;
  x: number;
  y: number;
  z: number;
  priceLevel: number;
  label: string;
  type: 'LIQUIDITY_POOL' | 'ORDER_BLOCK' | 'IMBALANCE_GAP' | 'SESSION_HIGH_LOW' | 'VOLATILITY_BURST';
  intensity: number; // 0 to 1
  size: number;
  distanceAtr: number;
}

export interface RadarMarketSessionInfo {
  sessionName: string;
  sessionCode: 'ASIAN' | 'LONDON' | 'NEW_YORK' | 'LONDON_NY_OVERLAP' | 'INTERBANK_CLOSE';
  isOpen: boolean;
  progressPct: number;
  utcTimeFormatted: string;
  liquidityTier: 'MAXIMUM' | 'ELEVATED' | 'STANDARD' | 'LOW';
  description: string;
}

export interface DynamicZonePlaceholder {
  id: 'UPPER_ATTRACTION' | 'LOWER_ATTRACTION';
  title: string;
  subtitle: string;
  typeLabel: string;
  priceRangeFormatted: string;
  priceMin: number | null;
  priceMax: number | null;
  strengthScore: number | null;
  strengthLabel: string;
  volumeDeltaTarget: string;
  distancePips: number | null;
  targetDescription: string;
  phaseReady: 'PHASE_2_DYNAMIC_ENGINE';
}

export interface MarketOverviewState {
  marketBias: 'NEUTRAL' | 'BULLISH' | 'BEARISH';
  marketStrength: number | null;
  volatilityIndex: number | null;
  liquidityDepth: number | null;
  timeframeConfluence: {
    '1M': 'SYNCING' | 'ALIGNED' | 'NEUTRAL';
    '5M': 'SYNCING' | 'ALIGNED' | 'NEUTRAL';
    '15M': 'SYNCING' | 'ALIGNED' | 'NEUTRAL';
    '1H': 'SYNCING' | 'ALIGNED' | 'NEUTRAL';
    '4H': 'SYNCING' | 'ALIGNED' | 'NEUTRAL';
    '1D': 'SYNCING' | 'ALIGNED' | 'NEUTRAL';
  };
}

export interface MarketRadarTelemetry {
  assetId: 'xau-usd';
  symbol: 'XAU/USD';
  assetName: 'Gold Spot';
  livePrice: number;
  previousPrice: number;
  change24h: number;
  change24hAmount: number;
  high24h: number;
  low24h: number;
  bidPrice: number;
  askPrice: number;
  spreadFormatted: string;
  tickAgeSeconds: number;
  lastTickTimestamp: number;
  priceDirection: 'up' | 'down' | 'flat';
  isLiveStreaming: boolean;
  totalTicksReceived: number;
  latencyMs: number;
  scanMode: RadarScanMode;
  sessionInfo: RadarMarketSessionInfo;
  marketOverview: MarketOverviewState;
  upperZone: DynamicZonePlaceholder;
  lowerZone: DynamicZonePlaceholder;
  targetNodes: RadarTargetNode[];
}
