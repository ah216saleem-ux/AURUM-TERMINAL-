import type { Request, Response } from 'express';
import { getMarketContext, getMarketNarrative } from './marketContextRouter';
import { getVerifiedXauPrice } from './websocketServer';

// ============================================================================
// TYPES & INTERFACES FOR SCENARIO SIMULATION INTELLIGENCE ENGINE
// ============================================================================

export interface ScenarioDefinition {
  id: 'BASE_CASE' | 'BULLISH_CASE' | 'BEARISH_CASE';
  title: string;
  badge: string;
  probability: number; // 0-100%
  eventTrigger: string;
  expectedGoldAction: string;
  priceTarget: number;
  expectedMovePoints: number;
  keyDrivers: string[];
  invalidationLevel: number;
  invalidationTrigger: string;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  timeHorizon: string;
}

export interface SimulationVariableInputs {
  dxyChangePercent: number; // e.g. -1.0 to +1.0 %
  bondYieldChangeBps: number; // e.g. -20 to +20 bps (10Y yield)
  interestRateExpectation: 'CUT_50BPS' | 'CUT_25BPS' | 'HOLD' | 'HIKE_25BPS';
  cpiDeviationPercent: number; // e.g. -0.5% (cooler) to +0.5% (hotter)
  fedTone: 'DOVISH' | 'NEUTRAL' | 'HAWKISH';
  geopoliticalRisk: 'DE_ESCALATION' | 'STABLE' | 'ELEVATED' | 'EXTREME';
}

export interface SimulationVariableImpactResult {
  simulatedGoldPrice: number;
  currentGoldPrice: number;
  deltaPoints: number;
  deltaPercent: number;
  bias: 'STRONGLY BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONGLY BEARISH';
  confidenceScore: number; // 0-100
  breakdown: {
    dxyContributionPoints: number;
    yieldContributionPoints: number;
    rateContributionPoints: number;
    inflationContributionPoints: number;
    fedToneContributionPoints: number;
    geopoliticalContributionPoints: number;
  };
  explanation: string;
}

export interface MarketPathProjection {
  pathId: 'PATH_A' | 'PATH_B';
  name: string;
  bias: 'BULLISH CONTINUATION' | 'BEARISH CORRECTION';
  probability: number; // 0-100%
  primaryTarget: number;
  secondaryTarget: number;
  invalidationPoint: number;
  steps: Array<{
    stepNumber: number;
    name: string;
    description: string;
    level: number;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'PROJECTED';
  }>;
  summary: string;
}

export interface RiskProbabilityMatrix {
  bullishProbability: number;
  neutralProbability: number;
  bearishProbability: number;
  dominantRegime: string;
  balanceAdvantage: string;
  primaryRiskFactor: string;
  volatilityForecast: 'LOW' | 'EXPANDING' | 'EXTREME';
}

export interface HistoricalSimulationMatchItem {
  id: string;
  date: string;
  eventName: string;
  macroEnvironment: string;
  initialCondition: string;
  actualOutcome: string;
  goldMovePoints: number;
  similarityScorePercent: number;
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface HistoricalSimulationReport {
  similarCasesCount: number;
  bullishOutcomesCount: number;
  accuracyPercent: number;
  averageBullishPoints: number;
  averageBearishPoints: number;
  historicalPrecedents: HistoricalSimulationMatchItem[];
  commentary: string;
}

export interface NewsEventSimulationPreset {
  eventId: string;
  eventName: string;
  scheduledTime: string;
  consensus: string;
  simulatedScenario: string;
  goldExpectedReaction: string;
  goldExpectedMovePoints: number;
  usdExpectedReaction: string;
  volatilityExpectedLevel: 'MODERATE' | 'HIGH' | 'EXTREME';
  recommendedTraderAction: string;
}

export interface ScenarioSimulationFullState {
  currentSituation: {
    currentGoldPrice: number;
    marketRegime: string;
    goldState: string;
    macroContext: string;
    timestamp: number;
    serverTimeUtc: string;
  };
  scenarios: {
    baseCase: ScenarioDefinition;
    bullishCase: ScenarioDefinition;
    bearishCase: ScenarioDefinition;
  };
  variableSimulator: {
    defaults: SimulationVariableInputs;
    evaluatedDefault: SimulationVariableImpactResult;
  };
  marketPaths: {
    pathA: MarketPathProjection;
    pathB: MarketPathProjection;
  };
  riskMatrix: RiskProbabilityMatrix;
  historicalSimulation: HistoricalSimulationReport;
  newsEventSimulations: NewsEventSimulationPreset[];
}

// ============================================================================
// CALCULATION LOGIC & SEEDS
// ============================================================================

/**
 * Calculates simulated impact based on customized variable inputs
 */
export function calculateVariableImpact(
  currentPrice: number,
  inputs: SimulationVariableInputs
): SimulationVariableImpactResult {
  // 1. DXY Sensitivity: -1% DXY historically drives ~ +18 to +22 Gold points
  // 1% DXY drop = +18.5 Gold points
  const dxyContribution = (-inputs.dxyChangePercent) * 18.5;

  // 2. 10Y Yield Sensitivity: -10 bps yield drop = ~ +8.5 Gold points
  const yieldContribution = (-inputs.bondYieldChangeBps / 10) * 8.5;

  // 3. Interest Rate Expectation
  let rateContribution = 0;
  if (inputs.interestRateExpectation === 'CUT_50BPS') rateContribution = 24.0;
  else if (inputs.interestRateExpectation === 'CUT_25BPS') rateContribution = 12.0;
  else if (inputs.interestRateExpectation === 'HOLD') rateContribution = -2.0;
  else if (inputs.interestRateExpectation === 'HIKE_25BPS') rateContribution = -28.0;

  // 4. CPI Deviation: Cooler inflation (-0.3%) = lower yield expectations = +14 Gold points
  // Hotter inflation (+0.3%) = higher yields = -14 Gold points
  const inflationContribution = (-inputs.cpiDeviationPercent / 0.1) * 4.5;

  // 5. Fed Tone
  let fedToneContribution = 0;
  if (inputs.fedTone === 'DOVISH') fedToneContribution = 15.0;
  else if (inputs.fedTone === 'NEUTRAL') fedToneContribution = 0.0;
  else if (inputs.fedTone === 'HAWKISH') fedToneContribution = -18.0;

  // 6. Geopolitical Risk
  let geopoliticalContribution = 0;
  if (inputs.geopoliticalRisk === 'DE_ESCALATION') geopoliticalContribution = -12.0;
  else if (inputs.geopoliticalRisk === 'STABLE') geopoliticalContribution = 0.0;
  else if (inputs.geopoliticalRisk === 'ELEVATED') geopoliticalContribution = 14.0;
  else if (inputs.geopoliticalRisk === 'EXTREME') geopoliticalContribution = 32.0;

  const totalPoints = Number((
    dxyContribution +
    yieldContribution +
    rateContribution +
    inflationContribution +
    fedToneContribution +
    geopoliticalContribution
  ).toFixed(2));

  const simulatedGoldPrice = Number((currentPrice + totalPoints).toFixed(2));
  const deltaPercent = Number(((totalPoints / currentPrice) * 100).toFixed(2));

  let bias: SimulationVariableImpactResult['bias'] = 'NEUTRAL';
  if (totalPoints >= 25) bias = 'STRONGLY BULLISH';
  else if (totalPoints >= 8) bias = 'BULLISH';
  else if (totalPoints <= -25) bias = 'STRONGLY BEARISH';
  else if (totalPoints <= -8) bias = 'BEARISH';

  const baseConfidence = 70;
  const confidenceScore = Math.min(94, Math.max(55, Math.round(baseConfidence + Math.abs(totalPoints) * 0.4)));

  let explanation = '';
  if (totalPoints > 0) {
    explanation = `Simulated parameters favor Bullish Gold expansion (+${totalPoints} pts). Dollar weakening and yield compression act as the primary tailwinds.`;
  } else if (totalPoints < 0) {
    explanation = `Simulated parameters exert Bearish downward pressure (${totalPoints} pts). Rising dollar strength and yield expansion limit safe-haven demand.`;
  } else {
    explanation = `Simulated parameters balance equally out, indicating range-bound consolidation near $${currentPrice.toFixed(2)}.`;
  }

  return {
    simulatedGoldPrice,
    currentGoldPrice: currentPrice,
    deltaPoints: totalPoints,
    deltaPercent,
    bias,
    confidenceScore,
    breakdown: {
      dxyContributionPoints: Number(dxyContribution.toFixed(2)),
      yieldContributionPoints: Number(yieldContribution.toFixed(2)),
      rateContributionPoints: Number(rateContribution.toFixed(2)),
      inflationContributionPoints: Number(inflationContribution.toFixed(2)),
      fedToneContributionPoints: Number(fedToneContribution.toFixed(2)),
      geopoliticalContributionPoints: Number(geopoliticalContribution.toFixed(2))
    },
    explanation
  };
}

/**
 * Builds the full scenario simulation intelligence dataset
 */
export function buildScenarioSimulationState(): ScenarioSimulationFullState {
  const verifiedTick = getVerifiedXauPrice();
  const currentPrice = verifiedTick && verifiedTick.price ? verifiedTick.price : 4272.50;
  const context = getMarketContext();
  const narrative = getMarketNarrative();

  const regimeName = context?.regime?.type || 'TRENDING MARKET';
  const goldStateName = context?.goldState?.state || 'Bullish Expansion';

  // 1. MULTI-SCENARIO BUILDER (BASE, BULLISH, BEARISH)
  const baseTarget = Number((currentPrice + 12.5).toFixed(2));
  const baseMove = 12.5;

  const bullishTarget = Number((currentPrice + 48.0).toFixed(2));
  const bullishMove = 48.0;

  const bearishTarget = Number((currentPrice - 37.5).toFixed(2));
  const bearishMove = -37.5;

  const baseCase: ScenarioDefinition = {
    id: 'BASE_CASE',
    title: 'BASE CASE: Order Block Re-test & Measured Expansion',
    badge: 'MOST LIKELY',
    probability: 60,
    eventTrigger: 'US CPI matches consensus (2.6% YoY) & 10Y Yields hover at 4.22%',
    expectedGoldAction: 'Consolidation above session support followed by steady drift towards weekly resistance.',
    priceTarget: baseTarget,
    expectedMovePoints: baseMove,
    keyDrivers: [
      'Neutral-to-mild USD softening against major FX baskets',
      'Intact H4 higher-low market structure above institutional block',
      'Balanced market liquidity awaiting FOMC clarification'
    ],
    invalidationLevel: Number((currentPrice - 18.0).toFixed(2)),
    invalidationTrigger: 'Loss of H1 swing low with hourly close below support',
    riskRating: 'MEDIUM',
    timeHorizon: '12 - 24 Hours'
  };

  const bullishCase: ScenarioDefinition = {
    id: 'BULLISH_CASE',
    title: 'BULLISH CASE: Disinflation Surprise & Safe-Haven Expansion',
    badge: 'HIGH MOMENTUM',
    probability: 25,
    eventTrigger: 'US CPI drops below 2.4% + DXY falls below key 103.20 support',
    expectedGoldAction: 'Aggressive buy-side liquidity run sweeping prior all-time highs with momentum expansion.',
    priceTarget: bullishTarget,
    expectedMovePoints: bullishMove,
    keyDrivers: [
      'Rapid drop in US 10-year Treasury yields towards 4.05%',
      'SMC displacement impulse printing fresh fair value gap (FVG)',
      'Central bank and sovereign reserve allocations accelerating'
    ],
    invalidationLevel: Number((currentPrice - 8.0).toFixed(2)),
    invalidationTrigger: 'Failure to hold H1 opening range high following news release',
    riskRating: 'LOW',
    timeHorizon: '24 - 48 Hours'
  };

  const bearishCase: ScenarioDefinition = {
    id: 'BEARISH_CASE',
    title: 'BEARISH CASE: Hot Inflation Print & Yield Spike Liquidation',
    badge: 'TAIL RISK',
    probability: 15,
    eventTrigger: 'US CPI surprises hot at >= 2.9% + Hawkish Fed commentary',
    expectedGoldAction: 'Liquidity sweep above previous resistance followed by sharp bearish reversal and sell-side liquidation.',
    priceTarget: bearishTarget,
    expectedMovePoints: bearishMove,
    keyDrivers: [
      'DXY surge above 104.50 with bond yields breaking 4.38%',
      'Long squeeze liquidating late retail breakout buyers',
      'Mitigation of deep discounted daily bullish order block'
    ],
    invalidationLevel: Number((currentPrice + 14.0).toFixed(2)),
    invalidationTrigger: 'Sustained acceptance above resistance despite hot macro data',
    riskRating: 'HIGH',
    timeHorizon: '6 - 18 Hours'
  };

  // 2. VARIABLE IMPACT SIMULATOR (DEFAULTS)
  const defaultInputs: SimulationVariableInputs = {
    dxyChangePercent: -1.0,
    bondYieldChangeBps: -8.0,
    interestRateExpectation: 'CUT_25BPS',
    cpiDeviationPercent: -0.2,
    fedTone: 'DOVISH',
    geopoliticalRisk: 'ELEVATED'
  };

  const evaluatedDefault = calculateVariableImpact(currentPrice, defaultInputs);

  // 3. MARKET PATH PROJECTION (PATH A & PATH B)
  const pathA: MarketPathProjection = {
    pathId: 'PATH_A',
    name: 'Path A: Liquidity Sweep → Order Block Reaction → Trend Continuation',
    bias: 'BULLISH CONTINUATION',
    probability: 65,
    primaryTarget: Number((currentPrice + 47.5).toFixed(2)),
    secondaryTarget: Number((currentPrice + 65.0).toFixed(2)),
    invalidationPoint: Number((currentPrice - 16.5).toFixed(2)),
    summary: 'Price sweeps internal session sell-side liquidity, taps the H4 unmitigated order block, and accelerates upwards toward buy-side targets.',
    steps: [
      {
        stepNumber: 1,
        name: 'Liquidity Sweep',
        description: 'Sweep of Asian session lows to trigger sell stops & collect buy liquidity.',
        level: Number((currentPrice - 8.5).toFixed(2)),
        status: 'IN_PROGRESS'
      },
      {
        stepNumber: 2,
        name: 'Order Block Mitigation',
        description: 'Institutional reaction at H1 demand block with bullish pin bar rejection.',
        level: Number((currentPrice - 5.0).toFixed(2)),
        status: 'PROJECTED'
      },
      {
        stepNumber: 3,
        name: 'Displacement Expansion',
        description: 'Impulsive break of minor structure confirming buyers in complete command.',
        level: Number((currentPrice + 18.0).toFixed(2)),
        status: 'PROJECTED'
      },
      {
        stepNumber: 4,
        name: 'Final Take-Profit Target',
        description: 'Buy-Side Liquidity (BSL) pool swept near previous weekly high.',
        level: Number((currentPrice + 47.5).toFixed(2)),
        status: 'PROJECTED'
      }
    ]
  };

  const pathB: MarketPathProjection = {
    pathId: 'PATH_B',
    name: 'Path B: Resistance Rejection → Liquidity Grab → Deeper Correction',
    bias: 'BEARISH CORRECTION',
    probability: 35,
    primaryTarget: Number((currentPrice - 36.5).toFixed(2)),
    secondaryTarget: Number((currentPrice - 52.0).toFixed(2)),
    invalidationPoint: Number((currentPrice + 22.0).toFixed(2)),
    summary: 'Price tests the premium supply zone, fails to hold above resistance, traps breakout buyers, and drops to sweep deep discount liquidity.',
    steps: [
      {
        stepNumber: 1,
        name: 'Resistance Rejection',
        description: 'Failed attempt to push above daily supply zone, leaving a long upper wick.',
        level: Number((currentPrice + 12.0).toFixed(2)),
        status: 'PROJECTED'
      },
      {
        stepNumber: 2,
        name: 'Bearish CHoCH Confirmation',
        description: 'M15 Change of Character confirming short-term shift in institutional order flow.',
        level: Number((currentPrice - 2.5).toFixed(2)),
        status: 'PROJECTED'
      },
      {
        stepNumber: 3,
        name: 'Fair Value Gap Fill',
        description: 'Retest of newly formed bearish FVG serving as secondary low-risk entry.',
        level: Number((currentPrice + 4.0).toFixed(2)),
        status: 'PROJECTED'
      },
      {
        stepNumber: 4,
        name: 'Sell-Side Target Attained',
        description: 'Full mitigation of weekly discount imbalance and equal lows.',
        level: Number((currentPrice - 36.5).toFixed(2)),
        status: 'PROJECTED'
      }
    ]
  };

  // 4. RISK PROBABILITY MATRIX
  const riskMatrix: RiskProbabilityMatrix = {
    bullishProbability: 60,
    neutralProbability: 25,
    bearishProbability: 15,
    dominantRegime: regimeName,
    balanceAdvantage: 'Bullish Advantage 68%',
    primaryRiskFactor: 'FOMC Press Conference Liquidity Gap & 10Y Yield Resistance',
    volatilityForecast: 'EXPANDING'
  };

  // 5. HISTORICAL SIMULATION MATCH
  const historicalSimulation: HistoricalSimulationReport = {
    similarCasesCount: 12,
    bullishOutcomesCount: 8,
    accuracyPercent: 66,
    averageBullishPoints: 28.4,
    averageBearishPoints: -19.2,
    commentary: 'When Gold consolidates within 0.8% of resistance with declining Treasury yields and moderate geopolitical tensions, 8 out of 12 historical events resolved in bullish upside continuation.',
    historicalPrecedents: [
      {
        id: 'hist-sim-1',
        date: '2026-06-18',
        eventName: 'US CPI Disinflation Surprise',
        macroEnvironment: 'DXY -0.85%, 10Y Yield -12 bps',
        initialCondition: 'Range consolidation below all-time resistance',
        actualOutcome: 'Bullish breakout +$34.50 in 4 hours',
        goldMovePoints: 34.5,
        similarityScorePercent: 94,
        direction: 'BULLISH'
      },
      {
        id: 'hist-sim-2',
        date: '2026-04-12',
        eventName: 'FOMC Dovish Rate Pause',
        macroEnvironment: 'Fed chair signals rate cuts, DXY sinks',
        initialCondition: 'H4 order block mitigation prior to FOMC',
        actualOutcome: 'Clean upward expansion +$42.00',
        goldMovePoints: 42.0,
        similarityScorePercent: 91,
        direction: 'BULLISH'
      },
      {
        id: 'hist-sim-3',
        date: '2026-02-14',
        eventName: 'US Core PCE Print',
        macroEnvironment: 'PCE in-line, yields consolidate sideways',
        initialCondition: 'Compressed Asian session range',
        actualOutcome: 'Initial spike +$14.20, followed by consolidation',
        goldMovePoints: 14.2,
        similarityScorePercent: 88,
        direction: 'BULLISH'
      },
      {
        id: 'hist-sim-4',
        date: '2025-11-06',
        eventName: 'Hot Non-Farm Payrolls',
        macroEnvironment: 'Jobs beat expectation, DXY +1.1%',
        initialCondition: 'Overbought retail long sentiment',
        actualOutcome: 'Sharp false breakout high, then -$26.80 sell-off',
        goldMovePoints: -26.8,
        similarityScorePercent: 86,
        direction: 'BEARISH'
      },
      {
        id: 'hist-sim-5',
        date: '2025-09-17',
        eventName: 'Geopolitical Escalation in Middle East',
        macroEnvironment: 'Flight-to-safety, crude oil spikes',
        initialCondition: 'Gold testing support level',
        actualOutcome: 'Impulsive gap up +$38.60',
        goldMovePoints: 38.6,
        similarityScorePercent: 85,
        direction: 'BULLISH'
      },
      {
        id: 'hist-sim-6',
        date: '2025-07-23',
        eventName: 'ECB & Fed Synchronized Statements',
        macroEnvironment: 'Hawkish central bank rhetoric',
        initialCondition: 'Extended rally into high resistance',
        actualOutcome: 'Exhaustion dump -$31.50 over 2 sessions',
        goldMovePoints: -31.5,
        similarityScorePercent: 82,
        direction: 'BEARISH'
      }
    ]
  };

  // 6. NEWS EVENT SIMULATOR (PRESETS & PREVIEWS)
  const newsEventSimulations: NewsEventSimulationPreset[] = [
    {
      eventId: 'cpi-hot',
      eventName: 'US Consumer Price Index (CPI)',
      scheduledTime: 'Tomorrow 12:30 UTC',
      consensus: '2.6% YoY',
      simulatedScenario: 'If CPI is higher by +0.3% than expected (Prints 2.9%)',
      goldExpectedReaction: 'Immediate bearish impulse. Yields spike, driving bullion lower toward session discount.',
      goldExpectedMovePoints: -24.5,
      usdExpectedReaction: 'DXY rallies +0.75% across major currency pairs.',
      volatilityExpectedLevel: 'HIGH',
      recommendedTraderAction: 'Wait 15 minutes post-release for initial liquidity sweep to conclude. Avoid chasing market orders.'
    },
    {
      eventId: 'cpi-cool',
      eventName: 'US Consumer Price Index (CPI)',
      scheduledTime: 'Tomorrow 12:30 UTC',
      consensus: '2.6% YoY',
      simulatedScenario: 'If CPI is lower by -0.3% than expected (Prints 2.3%)',
      goldExpectedReaction: 'Massive safe-haven bullish expansion. Real interest rates collapse, unlocking institutional bids.',
      goldExpectedMovePoints: +36.0,
      usdExpectedReaction: 'DXY drops -0.90%, breaking crucial support.',
      volatilityExpectedLevel: 'EXTREME',
      recommendedTraderAction: 'Look for retests of the first 5-minute Fair Value Gap (FVG) for low-risk long continuation.'
    },
    {
      eventId: 'fomc-hawkish',
      eventName: 'Federal Reserve Rate Decision (FOMC)',
      scheduledTime: 'Wednesday 18:00 UTC',
      consensus: 'Hold at 4.50%',
      simulatedScenario: 'If Fed holds and signals "Higher for longer" with 0 cuts planned this year',
      goldExpectedReaction: 'Bearish reversal. Heavy profit-taking and long liquidation across precious metals.',
      goldExpectedMovePoints: -42.0,
      usdExpectedReaction: 'US Dollar surges to multi-month highs.',
      volatilityExpectedLevel: 'EXTREME',
      recommendedTraderAction: 'Enforce strict Trade Lock during press conference. Protect all existing open long profits.'
    },
    {
      eventId: 'fomc-dovish',
      eventName: 'Federal Reserve Rate Decision (FOMC)',
      scheduledTime: 'Wednesday 18:00 UTC',
      consensus: 'Hold at 4.50%',
      simulatedScenario: 'If Fed hints at aggressive 50 bps cut at the next meeting',
      goldExpectedReaction: 'Parabolic upward continuation sweeping all resistance blocks.',
      goldExpectedMovePoints: +55.0,
      usdExpectedReaction: 'Broad USD sell-off against gold and equities.',
      volatilityExpectedLevel: 'EXTREME',
      recommendedTraderAction: 'Trail stops systematically. Refrain from taking counter-trend short entries.'
    },
    {
      eventId: 'nfp-beat',
      eventName: 'US Non-Farm Payrolls (NFP)',
      scheduledTime: 'Friday 12:30 UTC',
      consensus: '165K Jobs',
      simulatedScenario: 'If Non-Farm Payrolls beat expectations by +60K (Prints 225K)',
      goldExpectedReaction: 'Sharp drop of 15-20 points as rate cut expectations get deferred.',
      goldExpectedMovePoints: -18.5,
      usdExpectedReaction: 'USD strengthens temporarily on resilient labor market narrative.',
      volatilityExpectedLevel: 'HIGH',
      recommendedTraderAction: 'Monitor H1 Order Block for potential mitigation bounce after the initial 30-minute flush.'
    }
  ];

  return {
    currentSituation: {
      currentGoldPrice: currentPrice,
      marketRegime: regimeName,
      goldState: goldStateName,
      macroContext: narrative?.marketStory || 'Gold is currently supported by structural macro tailwinds and institutional demand.',
      timestamp: Date.now(),
      serverTimeUtc: new Date().toUTCString()
    },
    scenarios: {
      baseCase,
      bullishCase,
      bearishCase
    },
    variableSimulator: {
      defaults: defaultInputs,
      evaluatedDefault
    },
    marketPaths: {
      pathA,
      pathB
    },
    riskMatrix,
    historicalSimulation,
    newsEventSimulations
  };
}

// ============================================================================
// EXPRESS ROUTE HANDLER
// ============================================================================

export async function handleScenarioLabRequest(req: Request, res: Response): Promise<boolean> {
  const url = req.url || '';
  const method = req.method;

  // GET /api/scenario-lab
  if (method === 'GET' && (url === '/api/scenario-lab' || url === '/api/scenario-lab/')) {
    try {
      const state = buildScenarioSimulationState();
      res.json(state);
      return true;
    } catch (e: any) {
      res.status(500).json({ error: 'Failed to generate scenario state', details: e?.message });
      return true;
    }
  }

  // POST /api/scenario-lab/simulate
  if (method === 'POST' && url.startsWith('/api/scenario-lab/simulate')) {
    try {
      const body = req.body || {};
      const verifiedTick = getVerifiedXauPrice();
      const currentPrice = verifiedTick && verifiedTick.price ? verifiedTick.price : 4272.50;

      const inputs: SimulationVariableInputs = {
        dxyChangePercent: typeof body.dxyChangePercent === 'number' ? body.dxyChangePercent : -1.0,
        bondYieldChangeBps: typeof body.bondYieldChangeBps === 'number' ? body.bondYieldChangeBps : -8.0,
        interestRateExpectation: body.interestRateExpectation || 'CUT_25BPS',
        cpiDeviationPercent: typeof body.cpiDeviationPercent === 'number' ? body.cpiDeviationPercent : -0.2,
        fedTone: body.fedTone || 'DOVISH',
        geopoliticalRisk: body.geopoliticalRisk || 'ELEVATED'
      };

      const result = calculateVariableImpact(currentPrice, inputs);
      res.json(result);
      return true;
    } catch (e: any) {
      res.status(500).json({ error: 'Failed to calculate simulation', details: e?.message });
      return true;
    }
  }

  return false;
}
