import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Coins, 
  Clock, 
  BrainCircuit, 
  Sliders, 
  Terminal, 
  LineChart, 
  Eye, 
  Globe, 
  Volume2, 
  Cpu, 
  Layers,
  RefreshCw
} from 'lucide-react';

interface MarketRegime {
  type: 'TRENDING MARKET' | 'RANGING MARKET' | 'ACCUMULATION' | 'DISTRIBUTION' | 'HIGH VOLATILITY' | 'LOW LIQUIDITY' | 'NEWS DRIVEN MARKET';
  confidence: number;
  explanation: string;
}

interface GoldState {
  state: 'Bullish Expansion' | 'Bearish Expansion' | 'Correction' | 'Accumulation' | 'Manipulation Risk';
  structure: string;
  trendDirection: 'UP' | 'DOWN' | 'SIDEWAYS';
  volatility: string;
  momentum: string;
  liquidity: string;
  volumeBehaviour: string;
  riskFactor: string;
}

interface SmcEnvironmentMap {
  liquidityAccumulation: string;
  stopHuntProbability: 'LOW' | 'MEDIUM' | 'HIGH';
  orderBlockReaction: string;
  fairValueGapBehaviour: string;
  marketStructureShifts: string;
  institutionalActivity: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface VolatilityIntelligence {
  atr: number;
  historicalVolatility: number;
  newsRisk: 'LOW' | 'ELEVATED' | 'EXTREME';
  sessionVolatility: 'LOW' | 'ELEVATED' | 'EXTREME';
  level: 'Normal' | 'Elevated' | 'Extreme';
  expectedBehaviour: 'Cleaner trends' | 'False breakout environment';
}

interface SessionInfo {
  name: 'Asian Session' | 'London Session' | 'New York Session' | 'London-New York overlap';
  status: 'ACTIVE' | 'CLOSED' | 'OPENING';
  liquidity: 'LOW' | 'MEDIUM' | 'HIGH';
  bestConditions: string;
}

interface MarketEnvironmentScore {
  totalScore: number;
  breakdown: {
    trend: number;
    liquidity: number;
    volatility: number;
    news: number;
  };
}

interface MarketContextResponse {
  timestamp: number;
  serverTime: string;
  regime: MarketRegime;
  goldState: GoldState;
  smcMap: SmcEnvironmentMap;
  volatility: VolatilityIntelligence;
  session: SessionInfo;
  score: MarketEnvironmentScore;
  executionSafety: {
    isSafe: boolean;
    reason: string;
    restrictedReason?: string;
  };
}

export const MarketContextStateView: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<MarketContextResponse | null>(null);

  const fetchLiveContext = async (showRefIndicator = false) => {
    if (showRefIndicator) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/market-context/live');
      if (!response.ok) throw new Error('Failed to retrieve live market context brain stats.');
      const data = await response.json();
      setContext(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error communicating with Market Context service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveContext();
    // Refresh every 8 seconds to reflect real-time price state sweeps
    const interval = setInterval(() => {
      fetchLiveContext(true);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center space-y-4 font-mono">
        <Compass className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
        <p className="text-xs text-zinc-400">LOADING LIVE MARKET CONTEXT INTELLIGENCE BRAIN...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono text-zinc-300">
      
      {/* HEADER BAR */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0a1122] to-[#04060d] border border-sky-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:10px_10px] opacity-20" />
        
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-sky-500/10 text-sky-400">
              <Compass className="w-4 h-4 animate-spin-slow text-sky-400" />
            </span>
            <h2 className="text-sm font-black text-white tracking-wider uppercase flex items-center gap-2">
              MARKET CONTEXT INTELLIGENCE BRAIN
            </h2>
          </div>
          <p className="text-[10.5px] text-zinc-400 leading-normal max-w-2xl">
            This module determines the primary market environment *prior* to parsing news parameters, running Smart Money Concepts (SMC) calculations, or enabling trade execution.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <button 
            onClick={() => fetchLiveContext(true)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-sky-300 transition cursor-pointer flex items-center justify-center gap-1.5 text-[11px] font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
            <span>{refreshing ? 'Refreshing context...' : 'Sync Brain'}</span>
          </button>
          
          <div className="px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[11px] font-bold">
            Scanner Live
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {context && (
        <>
          {/* TOP DOCK: REAL-TIME ENVIRONMENT BIAS & QUALITY SCORE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Market Regime Classifier (Col 5) */}
            <div className="lg:col-span-5 p-4 rounded-2xl bg-[#080b13] border border-zinc-900 shadow-lg relative overflow-hidden flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">REGIME DETECTION</span>
                  <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 text-[10px] font-bold">
                    Confidence: {context.regime.confidence}%
                  </span>
                </div>
                
                <h3 className="text-xl font-black text-white tracking-tight flex items-baseline gap-2">
                  <span className="text-sky-400">#</span>
                  {context.regime.type}
                </h3>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900/80 text-[11px] leading-relaxed text-zinc-300">
                {context.regime.explanation}
              </div>

              {/* Live Session HUD */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold border-b border-zinc-900 pb-1.5">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-sky-400" /> Current Session:
                  </span>
                  <span className="text-white">{context.session.name}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                  <div>
                    <span className="text-zinc-500 block">Session Status:</span>
                    <span className="text-emerald-400 font-bold">{context.session.status}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Session Volatility:</span>
                    <span className="text-sky-400 font-bold">{context.session.liquidity} LIQUIDITY</span>
                  </div>
                </div>

                <div className="p-2 rounded bg-zinc-900 text-[10px] text-zinc-400 font-sans leading-normal">
                  <span className="font-bold text-amber-400 font-mono">Best Conditions:</span> {context.session.bestConditions}
                </div>
              </div>
            </div>

            {/* Environment Score Meter & Breakdowns (Col 7) */}
            <div className="lg:col-span-7 p-4 rounded-2xl bg-[#080b13] border border-zinc-900 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <span className="text-[11px] font-black text-white uppercase flex items-center gap-1">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Aurum Market Environment Score
                </span>
                <span className={`text-base font-black ${
                  context.score.totalScore >= 80 ? 'text-emerald-400' :
                  context.score.totalScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {context.score.totalScore}/100 Quality
                </span>
              </div>

              {/* Split Bar Meter */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 pt-1">
                
                {/* Trend Score */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-500 font-sans">Trend Quality Index:</span>
                    <span className="text-zinc-200 font-bold font-mono-num">{context.score.breakdown.trend}/30</span>
                  </div>
                  <div className="h-1.5 bg-zinc-950 rounded overflow-hidden">
                    <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: `${(context.score.breakdown.trend / 30) * 100}%` }} />
                  </div>
                </div>

                {/* Liquidity Score */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-500 font-sans">Liquidity Volume Score:</span>
                    <span className="text-zinc-200 font-bold font-mono-num">{context.score.breakdown.liquidity}/25</span>
                  </div>
                  <div className="h-1.5 bg-zinc-950 rounded overflow-hidden">
                    <div className="h-full bg-sky-400 transition-all duration-500" style={{ width: `${(context.score.breakdown.liquidity / 25) * 100}%` }} />
                  </div>
                </div>

                {/* Volatility score */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-500 font-sans">Volatility Consistency Score:</span>
                    <span className="text-zinc-200 font-bold font-mono-num">{context.score.breakdown.volatility}/20</span>
                  </div>
                  <div className="h-1.5 bg-zinc-950 rounded overflow-hidden">
                    <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${(context.score.breakdown.volatility / 20) * 100}%` }} />
                  </div>
                </div>

                {/* News Stability Score */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-500 font-sans">Macro News Safety Index:</span>
                    <span className="text-zinc-200 font-bold font-mono-num">{context.score.breakdown.news}/25</span>
                  </div>
                  <div className="h-1.5 bg-zinc-950 rounded overflow-hidden">
                    <div className="h-full bg-sky-300 transition-all duration-500" style={{ width: `${(context.score.breakdown.news / 25) * 100}%` }} />
                  </div>
                </div>

              </div>

              {/* Safety Integration Check Connector (Checks Market Environment + News Risk + SMC Structure) */}
              <div className={`p-3 rounded-xl border ${
                context.executionSafety.isSafe
                  ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/5 border-rose-500/30 text-rose-300 animate-pulse'
              }`}>
                <div className="flex items-center gap-1.5 text-xs font-black mb-1">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>INTEGRATED SYSTEM EXECUTION GATE</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {context.executionSafety.reason}
                </p>
                {context.executionSafety.restrictedReason && (
                  <div className="mt-2 text-[10px] text-rose-400 font-bold uppercase tracking-wider bg-rose-500/10 p-2 rounded">
                    ⚠️ {context.executionSafety.restrictedReason}
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* LOWER GRID: GOLD-SPECIFIC ANALYSIS & VOLATILITY HUD */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Gold Market State Analysis (Col 6) */}
            <div className="lg:col-span-6 p-4 rounded-2xl bg-[#080b13] border border-zinc-900 shadow-lg space-y-3">
              <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                <span className="p-1 rounded bg-amber-400/10 text-amber-400">
                  <Coins className="w-4 h-4 text-amber-400" />
                </span>
                <span className="text-[11px] font-black text-white uppercase tracking-wider">
                  Gold (XAU/USD) Dedicated State Analysis
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-1">
                <span className="text-[10px] text-zinc-500 font-sans">Active Gold Environment State:</span>
                <span className="text-base font-black text-amber-400 bg-amber-400/5 px-2 py-0.5 border border-amber-400/20 rounded">
                  {context.goldState.state}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-900">
                  <span className="text-zinc-500 block text-[9.5px]">Price Structure:</span>
                  <span className="text-zinc-200 font-bold leading-tight block">{context.goldState.structure}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-900">
                  <span className="text-zinc-500 block text-[9.5px]">Trend Direction:</span>
                  <span className={`font-black flex items-center gap-1 ${
                    context.goldState.trendDirection === 'UP' ? 'text-emerald-400' :
                    context.goldState.trendDirection === 'DOWN' ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {context.goldState.trendDirection === 'UP' ? '📈 BULLISH' : '📉 BEARISH'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-900">
                  <span className="text-zinc-500 block text-[9.5px]">Volatility State:</span>
                  <span className="text-zinc-300 font-bold block">{context.goldState.volatility}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-900">
                  <span className="text-zinc-500 block text-[9.5px]">Volume Behaviour:</span>
                  <span className="text-zinc-300 font-bold block">{context.goldState.volumeBehaviour}</span>
                </div>

              </div>
            </div>

            {/* Smart Money Concept Environment Map & Volatility (Col 6) */}
            <div className="lg:col-span-6 p-4 rounded-2xl bg-[#080b13] border border-zinc-900 shadow-lg space-y-3.5">
              <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <span className="text-[11px] font-black text-white uppercase tracking-wider">
                  SMC Environment map & Institutional Footprints
                </span>
              </div>

              {/* Parameter Table */}
              <div className="space-y-2 text-[11px]">
                
                <div className="flex justify-between items-center bg-zinc-950 p-2 rounded">
                  <span className="text-zinc-500">Liquidity Accumulation:</span>
                  <span className="text-zinc-300 font-bold">{context.smcMap.liquidityAccumulation}</span>
                </div>

                <div className="flex justify-between items-center bg-zinc-950 p-2 rounded">
                  <span className="text-zinc-500">Stop Hunt Probability:</span>
                  <span className={`font-black ${
                    context.smcMap.stopHuntProbability === 'HIGH' ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {context.smcMap.stopHuntProbability}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-zinc-950 p-2 rounded">
                  <span className="text-zinc-500">Order Block Mitigation Reaction:</span>
                  <span className="text-zinc-300 font-bold">{context.smcMap.orderBlockReaction}</span>
                </div>

                <div className="flex justify-between items-center bg-zinc-950 p-2 rounded">
                  <span className="text-zinc-500">Institutional Activity Rating:</span>
                  <span className={`font-black ${
                    context.smcMap.institutionalActivity === 'HIGH' ? 'text-amber-400' : 'text-zinc-400'
                  }`}>
                    {context.smcMap.institutionalActivity} ACTIVE
                  </span>
                </div>

              </div>

              {/* Volatility block */}
              <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl space-y-2">
                <div className="flex justify-between text-[10.5px]">
                  <span className="text-zinc-500">Atr Deviation:</span>
                  <span className="text-white font-bold font-mono-num">${context.volatility.atr} ATR</span>
                </div>
                <div className="flex justify-between text-[10.5px]">
                  <span className="text-zinc-500">Expected Market Movement:</span>
                  <span className="text-sky-300 font-bold font-mono-num">{context.volatility.expectedBehaviour}</span>
                </div>
              </div>

            </div>

          </div>

          {/* COMMAND TERMINAL HUD CMD: MARKET STATE */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-sky-500/20 shadow-2xl space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full filter blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-[11px] font-black text-sky-400 uppercase tracking-wider flex items-center gap-1">
                <Terminal className="w-4 h-4 animate-pulse text-sky-400" />
                CMD: MARKET STATE OUTPUT
              </span>
              <span className="text-[9px] text-zinc-600">Institutional Feed Mode</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 text-[11px]">
              
              <div className="p-2 rounded-xl bg-zinc-900/50 border border-zinc-850">
                <span className="text-zinc-500 block text-[9px] uppercase">Current Regime</span>
                <span className="text-white font-black">{context.regime.type}</span>
              </div>

              <div className="p-2 rounded-xl bg-zinc-900/50 border border-zinc-850">
                <span className="text-zinc-500 block text-[9px] uppercase">Gold State</span>
                <span className="text-amber-400 font-black">{context.goldState.state}</span>
              </div>

              <div className="p-2 rounded-xl bg-zinc-900/50 border border-zinc-850">
                <span className="text-zinc-500 block text-[9px] uppercase">Liquidity Condition</span>
                <span className="text-sky-400 font-black">{context.smcMap.liquidityAccumulation}</span>
              </div>

              <div className="p-2 rounded-xl bg-zinc-900/50 border border-zinc-850">
                <span className="text-zinc-500 block text-[9px] uppercase">Volatility</span>
                <span className="text-amber-400 font-black">{context.volatility.level}</span>
              </div>

              <div className="p-2 rounded-xl bg-zinc-900/50 border border-zinc-850">
                <span className="text-zinc-500 block text-[9px] uppercase">Session Active</span>
                <span className="text-emerald-400 font-black">{context.session.name}</span>
              </div>

              <div className="p-2 rounded-xl bg-zinc-900/50 border border-zinc-850">
                <span className="text-zinc-500 block text-[9px] uppercase">Market Quality</span>
                <span className="text-white font-black">{context.score.totalScore}/100</span>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
};
