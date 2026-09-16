import { MarketCategory, TradingStyleMode, SignalType, SetupQuality, Timeframe, AssetAiProfile, MarketRankingItem } from '../types';

export const ASSET_AI_PROFILES: Record<string, AssetAiProfile> = {
  // 1. GOLD (XAU/USD)
  'xau-usd': {
    assetId: 'xau-usd',
    symbol: 'XAU/USD',
    name: 'Gold Spot',
    category: 'commodities',
    volatilityBehavior: {
      level: 'HIGH',
      adrText: 'ADR: $28.50 (180+ pips/day)',
      description: 'Violent liquidity sweeps at session opens, followed by high-velocity directional order block mitigation and macro trend continuation.',
      speedOfExpansion: 'Rapid / Impulsive'
    },
    bestTradingSessions: {
      primary: 'London & NY Overlap',
      secondary: 'London Open (07:00 UTC)',
      recommendedHoursUtc: '07:30 – 16:30 UTC',
      sessionNote: 'Highest volume liquidity grabs occur during early London fix and NY 13:30 UTC macro economic releases.'
    },
    strategyWeightAdjustment: {
      scalping: {
        smc: 25,
        trend: 15,
        liquidity: 35,
        momentum: 25,
        rationale: 'Micro-liquidity pool sweeps on M1/M5 drive Gold scalp reversals with sub-minute reaction times.'
      },
      intraday: {
        smc: 40,
        trend: 25,
        liquidity: 20,
        momentum: 15,
        rationale: 'H1 Order Block mitigation + Asian Session High/Low sweeps create dominant institutional intraday moves.'
      },
      swing: {
        smc: 45,
        trend: 35,
        liquidity: 10,
        momentum: 10,
        rationale: 'Macro real yield trends and central bank gold accumulation drive high-conviction 4H/Daily swings.'
      }
    },
    newsSensitivity: {
      level: 'ULTRA',
      keyCatalysts: ['US CPI & Core Inflation', 'Non-Farm Payrolls (NFP)', 'FOMC Interest Rate Decisions', 'Geopolitical Safe-Haven Events'],
      riskReaction: 'Extreme 15-40 point spikes. Enforce 15-min pre/post news freeze.',
      blackoutMinutesBefore: 15,
      blackoutMinutesAfter: 15
    },
    preferredTimeframe: {
      scalping: '5M',
      intraday: '1H',
      swing: '4H',
      primaryConfluence: 'M15 + 1H + 4H SMC Confluence'
    },
    institutionBehavior: 'Heavy institutional stop-hunting below round numbers ($2,630, $2,600) with rapid V-shape absorption.',
    defaultMode: 'INTRADAY'
  },

  // 2. NASDAQ 100 (NDX / US100)
  'nasdaq-100': {
    assetId: 'nasdaq-100',
    symbol: 'NASDAQ 100',
    name: 'NDX / US100',
    category: 'indices',
    volatilityBehavior: {
      level: 'HIGH',
      adrText: 'ADR: 240+ pts/day',
      description: 'Mega-cap tech weighted momentum. Exhibits clean staircase trend expansion once morning liquidity has been cleared.',
      speedOfExpansion: 'Rapid / Impulsive'
    },
    bestTradingSessions: {
      primary: 'New York Regular Session',
      secondary: 'US Market Open (13:30 – 16:00 UTC)',
      recommendedHoursUtc: '13:30 – 20:00 UTC',
      sessionNote: 'Initial 30-min NY open sets the Judas Swing high/low; sustained directional trends occur after 14:00 UTC.'
    },
    strategyWeightAdjustment: {
      scalping: {
        smc: 20,
        trend: 20,
        liquidity: 30,
        momentum: 30,
        rationale: 'High momentum and opening range breakout sweeps favor quick 5M FVG retest entries.'
      },
      intraday: {
        smc: 35,
        trend: 30,
        liquidity: 20,
        momentum: 15,
        rationale: 'Trend alignment with 15M/1H Fair Value Gaps generates consistent 1:3+ Risk/Reward trades.'
      },
      swing: {
        smc: 40,
        trend: 40,
        liquidity: 10,
        momentum: 10,
        rationale: 'Secular tech bull momentum and earnings cycle alignment dictate multi-day expansions.'
      }
    },
    newsSensitivity: {
      level: 'HIGH',
      keyCatalysts: ['US Tech Earnings (NVDA, AAPL, MSFT)', 'US CPI & PPI', 'Fed Rate Guidance', 'Initial Jobless Claims'],
      riskReaction: 'Wide 100-200 pt spreads at open; clean trend continuation once volatility settles.',
      blackoutMinutesBefore: 10,
      blackoutMinutesAfter: 15
    },
    preferredTimeframe: {
      scalping: '5M',
      intraday: '1H',
      swing: '4H',
      primaryConfluence: '5M + 15M + 1H EMA & SMC alignment'
    },
    institutionBehavior: 'Institutional algorithmic VWAP & Fair Value Gap balance runs during regular New York hours.',
    defaultMode: 'INTRADAY'
  },

  // 3. EUR/USD
  'eur-usd': {
    assetId: 'eur-usd',
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    category: 'forex',
    volatilityBehavior: {
      level: 'MEDIUM',
      adrText: 'ADR: 65 – 85 pips/day',
      description: 'High liquidity and structural respect. Very clean SMC order blocks, Fair Value Gap fills, and precise session range retests.',
      speedOfExpansion: 'Steady Trend'
    },
    bestTradingSessions: {
      primary: 'London & NY Overlap',
      secondary: 'London Open (07:00 – 11:00 UTC)',
      recommendedHoursUtc: '07:00 – 16:00 UTC',
      sessionNote: 'London session sets the daily high/low 70% of the time, followed by NY trend continuation or reversal.'
    },
    strategyWeightAdjustment: {
      scalping: {
        smc: 30,
        trend: 25,
        liquidity: 25,
        momentum: 20,
        rationale: 'Extremely tight spreads enable precision 1M/5M limit entries on Asian range sweep mitigations.'
      },
      intraday: {
        smc: 35,
        trend: 30,
        liquidity: 20,
        momentum: 15,
        rationale: 'H1 BOS structure + 15M FVG retest provides highest historical win-rate setups.'
      },
      swing: {
        smc: 35,
        trend: 40,
        liquidity: 15,
        momentum: 10,
        rationale: 'ECB vs Fed interest rate differentials create smooth multi-week trend waves.'
      }
    },
    newsSensitivity: {
      level: 'HIGH',
      keyCatalysts: ['ECB Rate Decision & Lagarde Speech', 'US Non-Farm Payrolls (NFP)', 'Eurozone CPI', 'US CPI'],
      riskReaction: 'Sharp 40-70 pip directional impulse, followed by textbook Order Block retests.',
      blackoutMinutesBefore: 10,
      blackoutMinutesAfter: 15
    },
    preferredTimeframe: {
      scalping: '5M',
      intraday: '1H',
      swing: '4H',
      primaryConfluence: '15M + 1H SMC High Confluence'
    },
    institutionBehavior: 'Central bank and tier-1 bank institutional order flow respects psychological round levels (1.0800, 1.0850).',
    defaultMode: 'INTRADAY'
  },

  // 4. GBP/USD (Cable)
  'gbp-usd': {
    assetId: 'gbp-usd',
    symbol: 'GBP/USD',
    name: 'British Pound / USD',
    category: 'forex',
    volatilityBehavior: {
      level: 'HIGH',
      adrText: 'ADR: 95 – 130 pips/day',
      description: 'Aggressive intraday range with deep liquidity sweeps. Notorious for "Judas Swings" during early London and NY sessions.',
      speedOfExpansion: 'Rapid / Impulsive'
    },
    bestTradingSessions: {
      primary: 'London Session',
      secondary: 'London & NY Overlap',
      recommendedHoursUtc: '07:30 – 15:30 UTC',
      sessionNote: 'London Open (08:00 UTC) frequently creates false breakouts before genuine institutional directional expansion.'
    },
    strategyWeightAdjustment: {
      scalping: {
        smc: 25,
        trend: 20,
        liquidity: 35,
        momentum: 20,
        rationale: 'Prioritizing liquidity sweep recognition prevents getting caught in premature Cable fakeouts.'
      },
      intraday: {
        smc: 35,
        trend: 25,
        liquidity: 25,
        momentum: 15,
        rationale: 'Wait for London liquidity sweep confirmation, then ride trend to New York session targets.'
      },
      swing: {
        smc: 35,
        trend: 40,
        liquidity: 15,
        momentum: 10,
        rationale: 'Bank of England monetary policy divergence provides expansive multi-week swing moves.'
      }
    },
    newsSensitivity: {
      level: 'HIGH',
      keyCatalysts: ['Bank of England (BoE) Rate Vote', 'UK CPI Inflation', 'UK GDP & Employment', 'US Fed Decisions'],
      riskReaction: 'Fast 60-100 pip initial candle; high slippage potential on market orders during news.',
      blackoutMinutesBefore: 15,
      blackoutMinutesAfter: 15
    },
    preferredTimeframe: {
      scalping: '5M',
      intraday: '1H',
      swing: '4H',
      primaryConfluence: '15M + 1H + 4H Liquidity Confluence'
    },
    institutionBehavior: 'City of London institutional desks target stops above Asian session highs before distributing lower.',
    defaultMode: 'INTRADAY'
  },

  // 5. USD/JPY (Ninja)
  'usd-jpy': {
    assetId: 'usd-jpy',
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    category: 'forex',
    volatilityBehavior: {
      level: 'HIGH',
      adrText: 'ADR: 110 – 150 pips/day',
      description: 'Powerful persistent trends influenced by US Treasury yields and Bank of Japan yield curve control interventions.',
      speedOfExpansion: 'Steady Trend'
    },
    bestTradingSessions: {
      primary: 'Tokyo & NY Overlap',
      secondary: 'Asian Session (00:00 – 06:00 UTC)',
      recommendedHoursUtc: '00:00 – 16:00 UTC',
      sessionNote: 'Active throughout Tokyo session, with major expansion acceleration during US bond market trading hours.'
    },
    strategyWeightAdjustment: {
      scalping: {
        smc: 20,
        trend: 35,
        liquidity: 25,
        momentum: 20,
        rationale: 'Trend continuation pullbacks on 5M EMA dynamic bands outperform counter-trend scalps.'
      },
      intraday: {
        smc: 30,
        trend: 40,
        liquidity: 15,
        momentum: 15,
        rationale: 'Respects multi-hour directional EMA stacks; minimal chop once a 1H breakout is confirmed.'
      },
      swing: {
        smc: 35,
        trend: 45,
        liquidity: 10,
        momentum: 10,
        rationale: 'US-Japan bond yield differential generates massive multi-month trending cycles.'
      }
    },
    newsSensitivity: {
      level: 'ULTRA',
      keyCatalysts: ['Bank of Japan (BoJ) Policy Decision & Gov Ueda Speeches', 'Ministry of Finance (MoF) Intervention Warnings', 'US 10Y Treasury Yields', 'US CPI'],
      riskReaction: 'Potential 100-300 pip intervention moves. Strict risk limits required near psychological 155.00/160.00.',
      blackoutMinutesBefore: 15,
      blackoutMinutesAfter: 20
    },
    preferredTimeframe: {
      scalping: '5M',
      intraday: '1H',
      swing: '4H',
      primaryConfluence: '1H + 4H Trend & EMA Stack'
    },
    institutionBehavior: 'Japanese institutional exporters and MoF algorithmic checks create strong resistance at big round figures.',
    defaultMode: 'SWING'
  },

  // 6. AUD/USD (Aussie)
  'aud-usd': {
    assetId: 'aud-usd',
    symbol: 'AUD/USD',
    name: 'Australian Dollar / USD',
    category: 'forex',
    volatilityBehavior: {
      level: 'MEDIUM',
      adrText: 'ADR: 55 – 75 pips/day',
      description: 'Risk-sentiment & commodity barometer. High sensitivity to Chinese economic data and global growth sentiment.',
      speedOfExpansion: 'Steady Trend'
    },
    bestTradingSessions: {
      primary: 'Asian & London Overlap',
      secondary: 'Sydney & Tokyo (00:00 – 06:00 UTC)',
      recommendedHoursUtc: '00:30 – 14:00 UTC',
      sessionNote: 'RBA rate statements and China PMI data at 01:30-03:00 UTC set directional bias for the next 24 hours.'
    },
    strategyWeightAdjustment: {
      scalping: {
        smc: 25,
        trend: 30,
        liquidity: 25,
        momentum: 20,
        rationale: 'Smooth micro trends during Asian session with clean 5M Order Block mitigations.'
      },
      intraday: {
        smc: 35,
        trend: 35,
        liquidity: 15,
        momentum: 15,
        rationale: 'Breakout retest of daily S&R levels with commodity-backed directional strength.'
      },
      swing: {
        smc: 35,
        trend: 40,
        liquidity: 15,
        momentum: 10,
        rationale: 'Global commodity supercycle alignment enables high-probability multi-week swings.'
      }
    },
    newsSensitivity: {
      level: 'MEDIUM',
      keyCatalysts: ['Reserve Bank of Australia (RBA) Rate Decisions', 'China PMI & Economic Releases', 'Iron Ore / Copper Prices', 'US FOMC'],
      riskReaction: 'Clean 35-50 pip impulses with high technical follow-through.',
      blackoutMinutesBefore: 10,
      blackoutMinutesAfter: 15
    },
    preferredTimeframe: {
      scalping: '15M',
      intraday: '1H',
      swing: '4H',
      primaryConfluence: '1H + 4H Structural Confluence'
    },
    institutionBehavior: 'Hedge funds utilize AUD/USD as primary proxy for Asian growth and commodity index sentiment.',
    defaultMode: 'INTRADAY'
  },

  // 7. USD/CAD (Loonie)
  'usd-cad': {
    assetId: 'usd-cad',
    symbol: 'USD/CAD',
    name: 'US Dollar / Canadian Dollar',
    category: 'forex',
    volatilityBehavior: {
      level: 'MEDIUM',
      adrText: 'ADR: 65 – 85 pips/day',
      description: 'Strong inverse correlation with Crude Oil prices. Frequent range contractions followed by high-volume North American session breakouts.',
      speedOfExpansion: 'Breakout Prone'
    },
    bestTradingSessions: {
      primary: 'New York Session',
      secondary: 'London / NY Overlap',
      recommendedHoursUtc: '12:00 – 19:00 UTC',
      sessionNote: 'Peak volatility occurs when US & Canadian economic data releases coincide at 12:30 UTC / 13:30 UTC.'
    },
    strategyWeightAdjustment: {
      scalping: {
        smc: 25,
        trend: 25,
        liquidity: 30,
        momentum: 20,
        rationale: 'Pre-NY session range sweeps provide high-confidence counter-trend scalp retests.'
      },
      intraday: {
        smc: 35,
        trend: 30,
        liquidity: 20,
        momentum: 15,
        rationale: 'Combine Crude Oil directional bias with H1 Bullish/Bearish Order Blocks for superior entry precision.'
      },
      swing: {
        smc: 35,
        trend: 35,
        liquidity: 15,
        momentum: 15,
        rationale: 'Bank of Canada vs Fed policy trajectories and WTI oil cycles drive major multi-month trend legs.'
      }
    },
    newsSensitivity: {
      level: 'HIGH',
      keyCatalysts: ['Bank of Canada (BoC) Policy Statement', 'US & Canada Dual Employment Reports', 'OPEC+ Meetings / EIA Oil Inventories', 'US CPI'],
      riskReaction: 'Dual-release volatility triggers rapid 50-90 pip directional spikes.',
      blackoutMinutesBefore: 10,
      blackoutMinutesAfter: 15
    },
    preferredTimeframe: {
      scalping: '5M',
      intraday: '1H',
      swing: '4H',
      primaryConfluence: '1H Structure + Oil Confluence'
    },
    institutionBehavior: 'Canadian institutional bank market-makers actively defend key parity and psychological whole figures (1.3500, 1.3800).',
    defaultMode: 'INTRADAY'
  },

  // 8. BITCOIN (BTC/USD)
  'btc-usd': {
    assetId: 'btc-usd',
    symbol: 'BTC/USD',
    name: 'Bitcoin / US Dollar',
    category: 'crypto',
    volatilityBehavior: {
      level: 'EXTREME',
      adrText: 'ADR: $2,400 – $4,200/day (4-6%)',
      description: 'Continuous 24/7 institutional and retail order flow. Highly prone to aggressive leverage liquidation cascades and massive Fair Value Gap reclaims.',
      speedOfExpansion: 'Rapid / Impulsive'
    },
    bestTradingSessions: {
      primary: 'US Session & Weekend Breakouts',
      secondary: '24/7 Global Liquidity Hours',
      recommendedHoursUtc: '13:00 – 21:00 UTC (Continuous)',
      sessionNote: 'US Spot ETF inflows between 14:00 – 19:00 UTC trigger large institutional spot market buy/sell programs.'
    },
    strategyWeightAdjustment: {
      scalping: {
        smc: 25,
        trend: 15,
        liquidity: 35,
        momentum: 25,
        rationale: 'Liquidation heatmaps and micro Fair Value Gap imbalances dominate M5/M15 crypto scalps.'
      },
      intraday: {
        smc: 40,
        trend: 25,
        liquidity: 20,
        momentum: 15,
        rationale: 'Institutional Spot ETF demand Order Blocks and funding rate balance create high-probability intraday setups.'
      },
      swing: {
        smc: 45,
        trend: 35,
        liquidity: 10,
        momentum: 10,
        rationale: 'Macro 4-year halving cycle and global liquidity expansion drive massive multi-month swing legs.'
      }
    },
    newsSensitivity: {
      level: 'HIGH',
      keyCatalysts: ['US Spot ETF Net Inflow/Outflow Data', 'Federal Reserve Rate Policy & US CPI', 'SEC / Global Crypto Regulatory Filings', 'Miner Capitulation & Halving Epochs'],
      riskReaction: 'Fast $1,500 – $3,500 liquidation wick sweeps clearing both long and short leverage.',
      blackoutMinutesBefore: 15,
      blackoutMinutesAfter: 20
    },
    preferredTimeframe: {
      scalping: '5M',
      intraday: '1H',
      swing: '4H',
      primaryConfluence: '15M + 1H + 4H Liquidation / SMC Confluence'
    },
    institutionBehavior: 'Institutional desks (BlackRock, Fidelity) accumulate inside 4H discount Order Blocks with iceberg spot orders.',
    defaultMode: 'SWING'
  },

  // 9. S&P 500 (SPX / US500)
  'sp-500': {
    assetId: 'sp-500',
    symbol: 'S&P 500',
    name: 'SPX / US500',
    category: 'indices',
    volatilityBehavior: {
      level: 'MEDIUM',
      adrText: 'ADR: 45 – 65 pts/day',
      description: 'Broadest benchmark of global equity capital. High structural stability with strong mean-reversion at institutional equilibrium bands.',
      speedOfExpansion: 'Steady Trend'
    },
    bestTradingSessions: {
      primary: 'New York Session',
      secondary: 'US Market Open (13:30 – 16:30 UTC)',
      recommendedHoursUtc: '13:30 – 20:00 UTC',
      sessionNote: 'Institutional pension rebalancing and 0DTE option hedging flows dominate the final 90 minutes of the NY session.'
    },
    strategyWeightAdjustment: {
      scalping: {
        smc: 25,
        trend: 25,
        liquidity: 25,
        momentum: 25,
        rationale: 'M5 opening range retests and Fair Value Gap fills provide reliable risk-controlled scalps.'
      },
      intraday: {
        smc: 35,
        trend: 30,
        liquidity: 20,
        momentum: 15,
        rationale: 'H1 Break of Structure alignment with macro sector breadth produces steady intraday trend days.'
      },
      swing: {
        smc: 40,
        trend: 40,
        liquidity: 10,
        momentum: 10,
        rationale: 'Corporate earnings growth and long-term monetary policy alignment drive multi-month secular bull trends.'
      }
    },
    newsSensitivity: {
      level: 'HIGH',
      keyCatalysts: ['FOMC Interest Rate Decisions', 'US CPI & PCE Inflation', 'Non-Farm Payrolls (NFP)', 'Quarterly Earnings Season'],
      riskReaction: '30-50 pt opening gap risk; high mean-reversion tendency once initial impulse absorbs.',
      blackoutMinutesBefore: 10,
      blackoutMinutesAfter: 15
    },
    preferredTimeframe: {
      scalping: '5M',
      intraday: '1H',
      swing: '4H',
      primaryConfluence: '1H + Daily S&P Confluence'
    },
    institutionBehavior: 'Systematic systematic funds (CTAs) execute multi-billion buy programs above the 50-day and 200-day moving averages.',
    defaultMode: 'INTRADAY'
  },

  // 10. CRUDE OIL (WTI)
  'crude-oil': {
    assetId: 'crude-oil',
    symbol: 'Oil WTI',
    name: 'Crude Oil',
    category: 'commodities',
    volatilityBehavior: {
      level: 'HIGH',
      adrText: 'ADR: $1.80 – $2.60/barrel',
      description: 'Physical commodity driven by geopolitical headlines, OPEC+ quota discipline, and weekly EIA inventory balance figures.',
      speedOfExpansion: 'Rapid / Impulsive'
    },
    bestTradingSessions: {
      primary: 'London & NY Overlap',
      secondary: 'EIA Report Window (Wednesdays 14:30 UTC)',
      recommendedHoursUtc: '08:00 – 18:00 UTC',
      sessionNote: 'Major trend accelerations follow the daily London fix and Wednesday official EIA inventory releases.'
    },
    strategyWeightAdjustment: {
      scalping: {
        smc: 20,
        trend: 25,
        liquidity: 30,
        momentum: 25,
        rationale: 'Quick reactions to session liquidity sweeps around $70, $75 key psychological levels.'
      },
      intraday: {
        smc: 35,
        trend: 30,
        liquidity: 20,
        momentum: 15,
        rationale: 'H1 Bearish/Bullish breaker blocks and session high/low sweeps deliver strong 1:2.5+ R:R setups.'
      },
      swing: {
        smc: 40,
        trend: 35,
        liquidity: 15,
        momentum: 10,
        rationale: 'Global supply/demand balance and geopolitical risk premiums drive multi-week swing expansions.'
      }
    },
    newsSensitivity: {
      level: 'HIGH',
      keyCatalysts: ['EIA Weekly Crude Oil Inventories', 'OPEC+ Ministerial Meetings', 'Middle East / Geopolitical Shipping Tensions', 'IEA Monthly Oil Report'],
      riskReaction: 'Instant $1.00 – $2.50 spike on inventory surprises. High slippage on breaking geopolitical news.',
      blackoutMinutesBefore: 10,
      blackoutMinutesAfter: 15
    },
    preferredTimeframe: {
      scalping: '5M',
      intraday: '1H',
      swing: '4H',
      primaryConfluence: '1H + 4H Order Block Retest'
    },
    institutionBehavior: 'Commercial energy hedgers and algorithmic commodity trading advisors (CTAs) trade heavily around key futures contract expiries.',
    defaultMode: 'INTRADAY'
  },

  // 11. SILVER (XAG/USD)
  'xag-usd': {
    assetId: 'xag-usd',
    symbol: 'XAG/USD',
    name: 'Silver Spot',
    category: 'commodities',
    volatilityBehavior: {
      level: 'HIGH',
      adrText: 'ADR: $0.65 – $1.10 (2.5-3.5%)',
      description: 'High-beta precious and industrial metal. Often lags Gold initially before exploding in high-momentum catch-up expansions.',
      speedOfExpansion: 'Rapid / Impulsive'
    },
    bestTradingSessions: {
      primary: 'London & NY Overlap',
      secondary: 'London Open (07:30 UTC)',
      recommendedHoursUtc: '07:30 – 16:30 UTC',
      sessionNote: 'Peak volatility tracks Gold moves with 1.5x - 2x relative percentage momentum.'
    },
    strategyWeightAdjustment: {
      scalping: {
        smc: 25,
        trend: 20,
        liquidity: 30,
        momentum: 25,
        rationale: 'High momentum and aggressive M5 order block bounces provide swift scalping targets.'
      },
      intraday: {
        smc: 35,
        trend: 30,
        liquidity: 20,
        momentum: 15,
        rationale: 'Gold correlation + H1 Fair Value Gap fills produce expansive intraday trend runs.'
      },
      swing: {
        smc: 40,
        trend: 40,
        liquidity: 10,
        momentum: 10,
        rationale: 'Industrial green energy demand and gold-silver ratio compression generate explosive multi-month bull runs.'
      }
    },
    newsSensitivity: {
      level: 'HIGH',
      keyCatalysts: ['US CPI & Inflation Metrics', 'Gold Price Velocity', 'Solar & Industrial Manufacturing PMI', 'Fed Interest Rate Policy'],
      riskReaction: 'Wide spreads and fast percentage moves. Requires wider stop-loss buffers than standard forex.',
      blackoutMinutesBefore: 15,
      blackoutMinutesAfter: 15
    },
    preferredTimeframe: {
      scalping: '5M',
      intraday: '1H',
      swing: '4H',
      primaryConfluence: '15M + 1H SMC with Gold Confluence'
    },
    institutionBehavior: 'Institutional physical bullion houses and COMEX futures market makers defend multi-year consolidation bases.',
    defaultMode: 'INTRADAY'
  }
};

export function getAssetAiProfile(assetId: string): AssetAiProfile {
  return ASSET_AI_PROFILES[assetId] || ASSET_AI_PROFILES['xau-usd'];
}

/**
 * AURUM MARKET RANKING ENGINE
 * Automatically evaluates and ranks the strongest setups available across all supported assets.
 */
export function getAurumMarketRankings(): MarketRankingItem[] {
  const rankingRaw: Omit<MarketRankingItem, 'rank'>[] = [
    {
      assetId: 'xau-usd',
      symbol: 'XAU/USD',
      name: 'Gold Spot',
      category: 'commodities',
      signal: 'BUY',
      confidence: 92,
      setupGrade: 'A+',
      bestTradingMode: 'INTRADAY',
      entryPrice: 2642.00,
      stopLoss: 2624.00,
      takeProfit: 2685.00,
      riskReward: '1:3.4',
      aiVerdictSummary: 'Sell-side liquidity swept below Asian low ($2,630) followed by H1 Order Block mitigation, FVG reclaim, and multi-timeframe alignment.',
      volatilityLevel: 'HIGH',
      bestSession: 'London & NY Overlap',
      keyCatalyst: 'US CPI & Safe-Haven Inflow',
      badge: 'TOP SETUP #1'
    },
    {
      assetId: 'eur-usd',
      symbol: 'EUR/USD',
      name: 'Euro / US Dollar',
      category: 'forex',
      signal: 'BUY',
      confidence: 89,
      setupGrade: 'A+',
      bestTradingMode: 'INTRADAY',
      entryPrice: 1.0845,
      stopLoss: 1.0815,
      takeProfit: 1.0920,
      riskReward: '1:2.5',
      aiVerdictSummary: 'H1 Bullish BOS confirmed at 1.0860 with clean 15M Fair Value Gap mitigation above 1.0830 institutional demand zone.',
      volatilityLevel: 'MEDIUM',
      bestSession: 'London Open & NY',
      keyCatalyst: 'ECB Rate Outlook / DXY Weakness',
      badge: 'HIGH CONFLUENCE'
    },
    {
      assetId: 'xag-usd',
      symbol: 'XAG/USD',
      name: 'Silver Spot',
      category: 'commodities',
      signal: 'BUY',
      confidence: 89,
      setupGrade: 'A+',
      bestTradingMode: 'INTRADAY',
      entryPrice: 31.30,
      stopLoss: 30.65,
      takeProfit: 32.80,
      riskReward: '1:3.2',
      aiVerdictSummary: 'Clean double bottom with high-volume rejection from $30.80 support. Bullish order block mitigation aligns with Gold momentum.',
      volatilityLevel: 'HIGH',
      bestSession: 'London & NY Overlap',
      keyCatalyst: 'Industrial Solar Demand / Gold Surge',
      badge: 'HIGH CONFLUENCE'
    },
    {
      assetId: 'nasdaq-100',
      symbol: 'NASDAQ 100',
      name: 'NDX / US100',
      category: 'indices',
      signal: 'BUY',
      confidence: 86,
      setupGrade: 'A',
      bestTradingMode: 'INTRADAY',
      entryPrice: 19820.00,
      stopLoss: 19680.00,
      takeProfit: 20250.00,
      riskReward: '1:3.1',
      aiVerdictSummary: 'Bullish FVG reclaim at 19,750 followed by tech mega-cap buy programs and 50-EMA dynamic bounce.',
      volatilityLevel: 'HIGH',
      bestSession: 'NY Session (13:30 UTC)',
      keyCatalyst: 'Semiconductor Earnings & AI Capital',
      badge: 'TECH MOMENTUM'
    },
    {
      assetId: 'usd-jpy',
      symbol: 'USD/JPY',
      name: 'US Dollar / Yen',
      category: 'forex',
      signal: 'SELL',
      confidence: 85,
      setupGrade: 'A',
      bestTradingMode: 'SWING',
      entryPrice: 154.60,
      stopLoss: 155.80,
      takeProfit: 151.20,
      riskReward: '1:2.8',
      aiVerdictSummary: 'Macro 4H Bearish Order Block rejection at 155.20 with MoF jawboning pressure and US 10Y yield softening.',
      volatilityLevel: 'HIGH',
      bestSession: 'Tokyo & NY Overlap',
      keyCatalyst: 'BoJ Intervention Warning & US Yields',
      badge: 'MACRO REVERSAL'
    },
    {
      assetId: 'btc-usd',
      symbol: 'BTC/USD',
      name: 'Bitcoin / USD',
      category: 'crypto',
      signal: 'BUY',
      confidence: 85,
      setupGrade: 'A',
      bestTradingMode: 'SWING',
      entryPrice: 63850.00,
      stopLoss: 61900.00,
      takeProfit: 68500.00,
      riskReward: '1:2.4',
      aiVerdictSummary: 'Spot ETF continuous net accumulation holding 4H discount order block with massive short liquidation cascade pool at $68K.',
      volatilityLevel: 'EXTREME',
      bestSession: 'US Regular Session (24/7)',
      keyCatalyst: 'Spot ETF Net Inflows & Halving Flow',
      badge: 'CRYPTO MOMENTUM'
    },
    {
      assetId: 'gbp-usd',
      symbol: 'GBP/USD',
      name: 'British Pound / USD',
      category: 'forex',
      signal: 'BUY',
      confidence: 84,
      setupGrade: 'A',
      bestTradingMode: 'SCALPING',
      entryPrice: 1.3120,
      stopLoss: 1.3080,
      takeProfit: 1.3210,
      riskReward: '1:2.2',
      aiVerdictSummary: 'London session low swept at 1.3075 with rapid V-shape recovery and M15 Fair Value Gap expansion.',
      volatilityLevel: 'HIGH',
      bestSession: 'London Session (08:00 UTC)',
      keyCatalyst: 'BoE Rate Stance & UK Services PMI',
      badge: 'SESSION BREAKOUT'
    },
    {
      assetId: 'crude-oil',
      symbol: 'Oil WTI',
      name: 'Crude Oil',
      category: 'commodities',
      signal: 'SELL',
      confidence: 84,
      setupGrade: 'A',
      bestTradingMode: 'INTRADAY',
      entryPrice: 71.60,
      stopLoss: 72.85,
      takeProfit: 68.50,
      riskReward: '1:2.8',
      aiVerdictSummary: 'Bearish breaker block rejection at $72.20 with institutional supply injection and weak global demand metrics.',
      volatilityLevel: 'HIGH',
      bestSession: 'London & NY Overlap',
      keyCatalyst: 'EIA Inventories & OPEC+ Supply',
      badge: 'SUPPLY INJECTION'
    },
    {
      assetId: 'aud-usd',
      symbol: 'AUD/USD',
      name: 'Australian Dollar / USD',
      category: 'forex',
      signal: 'BUY',
      confidence: 81,
      setupGrade: 'B+',
      bestTradingMode: 'INTRADAY',
      entryPrice: 0.6720,
      stopLoss: 0.6685,
      takeProfit: 0.6795,
      riskReward: '1:2.1',
      aiVerdictSummary: 'Commodity support bounce at 0.6690 with Chinese stimulus pricing and H1 EMA 50 dynamic hold.',
      volatilityLevel: 'MEDIUM',
      bestSession: 'Asian & London Sessions',
      keyCatalyst: 'China Stimulus & RBA Hawkish Hold',
      badge: 'COMMODITY CYCLE'
    },
    {
      assetId: 'usd-cad',
      symbol: 'USD/CAD',
      name: 'US Dollar / CAD',
      category: 'forex',
      signal: 'SELL',
      confidence: 79,
      setupGrade: 'B+',
      bestTradingMode: 'INTRADAY',
      entryPrice: 1.3580,
      stopLoss: 1.3630,
      takeProfit: 1.3480,
      riskReward: '1:2.0',
      aiVerdictSummary: 'Resistance rejection at 1.3620 aligned with Canadian employment stability and oil price rebound.',
      volatilityLevel: 'MEDIUM',
      bestSession: 'NY Session (13:30 UTC)',
      keyCatalyst: 'BoC Policy & US Dual Data',
      badge: 'CORRELATION PLAY'
    },
    {
      assetId: 'sp-500',
      symbol: 'S&P 500',
      name: 'SPX / US500',
      category: 'indices',
      signal: 'WAIT',
      confidence: 74,
      setupGrade: 'B+',
      bestTradingMode: 'SWING',
      entryPrice: 5695.00,
      stopLoss: 5650.00,
      takeProfit: 5780.00,
      riskReward: '1:2.4',
      aiVerdictSummary: 'Range compression between 5,665 support and 5,700 psychological barrier. Awaiting clean breakout confirmation above 5,700.',
      volatilityLevel: 'MEDIUM',
      bestSession: 'NY Session',
      keyCatalyst: 'Fed Interest Rate Release',
      badge: 'RANGE COMPRESSION'
    }
  ];

  // Sort strictly by confidence (descending) and setup grade (A+ before A before B+)
  const gradeWeight: Record<SetupQuality, number> = {
    'A+': 4,
    'A': 3,
    'B+': 2,
    'B': 1
  };

  const sorted = [...rankingRaw].sort((a, b) => {
    if (b.confidence !== a.confidence) {
      return b.confidence - a.confidence;
    }
    return gradeWeight[b.setupGrade] - gradeWeight[a.setupGrade];
  });

  return sorted.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
}

export function getRankedTopSetups(category?: MarketCategory | 'all'): MarketRankingItem[] {
  const allRanked = getAurumMarketRankings();
  if (!category || category === 'all') {
    return allRanked;
  }
  return allRanked.filter(item => item.category === category);
}
