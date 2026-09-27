import React, { useState, useEffect } from 'react';
import {
  Sliders,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  RefreshCw,
  Compass,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Activity,
  History,
  Target,
  BarChart3,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Zap,
  Globe,
  Gauge
} from 'lucide-react';
import {
  ScenarioSimulationFullState,
  SimulationVariableInputs,
  SimulationVariableImpactResult
} from '../../server/scenarioSimulationRouter';

interface ScenarioSimulationLabViewProps {
  onSelectTab?: (tabId: string) => void;
}

export const ScenarioSimulationLabView: React.FC<ScenarioSimulationLabViewProps> = ({
  onSelectTab
}) => {
  const [data, setData] = useState<ScenarioSimulationFullState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTabSection, setActiveTabSection] = useState<'BUILDER' | 'VARIABLE_SIM' | 'PATHS' | 'NEWS_SIM' | 'HISTORY_SIM'>('BUILDER');

  // Interactive Variables State for Variable Impact Simulator
  const [simInputs, setSimInputs] = useState<SimulationVariableInputs>({
    dxyChangePercent: -1.0,
    bondYieldChangeBps: -8.0,
    interestRateExpectation: 'CUT_25BPS',
    cpiDeviationPercent: -0.2,
    fedTone: 'DOVISH',
    geopoliticalRisk: 'ELEVATED'
  });

  const [simResult, setSimResult] = useState<SimulationVariableImpactResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Active selected news preview in News Event Simulator
  const [selectedNewsSimIndex, setSelectedNewsSimIndex] = useState<number>(0);

  // Fetch full state from server
  const fetchState = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/scenario-lab');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json: ScenarioSimulationFullState = await res.json();
      setData(json);
      if (json.variableSimulator?.evaluatedDefault) {
        setSimResult(json.variableSimulator.evaluatedDefault);
        setSimInputs(json.variableSimulator.defaults);
      }
      setError(null);
    } catch (err: any) {
      console.error('[ScenarioLab] Fetch error:', err);
      setError(err?.message || 'Failed to connect to Scenario Lab server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  // Recalculate variable impact on user change
  const triggerSimulation = async (updatedInputs: SimulationVariableInputs) => {
    setSimInputs(updatedInputs);
    setIsSimulating(true);
    try {
      const res = await fetch('/api/scenario-lab/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedInputs)
      });
      if (res.ok) {
        const resJson: SimulationVariableImpactResult = await res.json();
        setSimResult(resJson);
      }
    } catch (e) {
      console.warn('[ScenarioLab] Simulation run error:', e);
    } finally {
      setIsSimulating(false);
    }
  };

  const currentPrice = data?.currentSituation.currentGoldPrice || 4285.50;

  return (
    <div className="space-y-6 text-zinc-100 font-sans animate-fade-in pb-12">
      {/* 1. TOP HEADER & SITUATION BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12161E] via-[#0E1116] to-[#0A0C0F] border border-[#D4AF37]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1E252E] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#D4AF37]/25 to-[#D4AF37]/5 border border-[#D4AF37]/40 text-[#D4AF37] shadow-lg shadow-[#D4AF37]/10">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-[#D4AF37] uppercase tracking-widest px-2 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/25">
                  FORWARD-LOOKING INTELLIGENCE
                </span>
                <span className="text-[10px] font-mono text-zinc-400">CMD: SCENARIO LAB</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-mono font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                SCENARIO SIMULATION LAB
              </h2>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => fetchState()}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Lab</span>
            </button>
            {onSelectTab && (
              <>
                <button
                  onClick={() => onSelectTab('STRATEGY_MEMORY')}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-300 text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>CMD: STRATEGY MEMORY</span>
                  <ArrowRight className="w-3 h-3 text-amber-400" />
                </button>
                <button
                  onClick={() => onSelectTab('DECISION_AUDIT')}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  <span>Audit Trail</span>
                  <ArrowRight className="w-3 h-3 text-zinc-400" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Current Situation Display Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
          <div className="p-3 rounded-xl bg-[#090B0E]/80 border border-zinc-800/80">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">CURRENT GOLD (XAU/USD)</div>
            <div className="text-xl font-mono font-black text-[#D4AF37] mt-0.5">
              ${currentPrice.toFixed(2)}
            </div>
            <div className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              Live Pricing Active
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#090B0E]/80 border border-zinc-800/80">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">MARKET REGIME</div>
            <div className="text-sm font-mono font-bold text-white mt-1 truncate">
              {data?.currentSituation.marketRegime || 'TRENDING MARKET'}
            </div>
            <div className="text-[10px] font-mono text-zinc-400">Structure: Bullish Bias</div>
          </div>

          <div className="p-3 rounded-xl bg-[#090B0E]/80 border border-zinc-800/80">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">MARKET BALANCE ADVANTAGE</div>
            <div className="text-sm font-mono font-black text-emerald-400 mt-1">
              {data?.riskMatrix.balanceAdvantage || 'Bullish Advantage 68%'}
            </div>
            <div className="text-[10px] font-mono text-zinc-400">Order Flow: Institutional Long</div>
          </div>

          <div className="p-3 rounded-xl bg-[#090B0E]/80 border border-zinc-800/80">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">DOMINANT TAIL RISK</div>
            <div className="text-xs font-mono font-bold text-amber-300 mt-1 truncate">
              FOMC Liquidity Gap
            </div>
            <div className="text-[10px] font-mono text-zinc-400">Yield Volatility High</div>
          </div>
        </div>
      </div>

      {/* 2. LAB SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
        {[
          { id: 'BUILDER', label: '1. Multi-Scenario Builder', icon: Layers },
          { id: 'VARIABLE_SIM', label: '2. Variable Impact Simulator', icon: Sliders },
          { id: 'PATHS', label: '3. Market Path Projection', icon: Target },
          { id: 'NEWS_SIM', label: '4. News Event Simulator', icon: Calendar },
          { id: 'HISTORY_SIM', label: '5. Historical Simulation Match', icon: History }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTabSection === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTabSection(t.id as any)}
              className={`py-2 px-3.5 rounded-xl border flex items-center gap-2 whitespace-nowrap cursor-pointer transition font-bold ${
                isActive
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black border-amber-300/40 shadow-md shadow-amber-500/20'
                  : 'bg-[#12161E] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. SECTION CONTENT */}

      {/* SECTION 1: MULTI-SCENARIO BUILDER (BASE CASE, BULLISH CASE, BEARISH CASE) */}
      {activeTabSection === 'BUILDER' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D4AF37]" />
                MULTI-SCENARIO PROBABILITY ARCHITECTURE
              </h3>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Institutional projection tri-split: Base case, aggressive upside expansion, and tail risk liquidation.
              </p>
            </div>
            {/* Probability Matrix Summary Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs">
              <span className="text-emerald-400 font-bold">Bullish 60%</span>
              <span className="text-zinc-600">•</span>
              <span className="text-amber-400 font-bold">Neutral 25%</span>
              <span className="text-zinc-600">•</span>
              <span className="text-rose-400 font-bold">Bearish 15%</span>
            </div>
          </div>

          {/* TRI-CARD GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* BASE CASE */}
            {data?.scenarios.baseCase && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#12161E] border border-amber-500/40 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-amber-400 transition">
                <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500/20 border-b border-l border-amber-500/30 rounded-bl-xl text-[10px] font-mono font-extrabold text-amber-300">
                  {data.scenarios.baseCase.badge} • {data.scenarios.baseCase.probability}% PROBABILITY
                </div>

                <div className="space-y-3.5">
                  <div className="pt-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/90 font-bold">
                      SCENARIO 1
                    </span>
                    <h4 className="text-sm font-mono font-black text-white">
                      BASE CASE
                    </h4>
                    <p className="text-xs text-zinc-300 font-sans mt-1 leading-relaxed">
                      {data.scenarios.baseCase.expectedGoldAction}
                    </p>
                  </div>

                  {/* Price Target & Impact */}
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5 font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Target Level</span>
                      <span className="text-base font-black text-amber-300 tabular-nums">
                        ${data.scenarios.baseCase.priceTarget.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Expected Delta</span>
                      <span className="font-bold text-emerald-400">
                        +{data.scenarios.baseCase.expectedMovePoints.toFixed(1)} pts
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Horizon</span>
                      <span className="text-zinc-300">{data.scenarios.baseCase.timeHorizon}</span>
                    </div>
                  </div>

                  {/* Event Trigger */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">EVENT TRIGGER</span>
                    <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-200">
                      {data.scenarios.baseCase.eventTrigger}
                    </div>
                  </div>

                  {/* Key Drivers */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">KEY CATALYSTS</span>
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {data.scenarios.baseCase.keyDrivers.map((d, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-400 mt-0.5">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Invalidation point */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500 uppercase text-[10.5px]">Invalidation</span>
                  <span className="text-rose-400 font-bold tabular-nums">
                    ${data.scenarios.baseCase.invalidationLevel.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* BULLISH CASE */}
            {data?.scenarios.bullishCase && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#12161E] border border-emerald-500/40 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-emerald-400 transition">
                <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500/20 border-b border-l border-emerald-500/30 rounded-bl-xl text-[10px] font-mono font-extrabold text-emerald-300">
                  {data.scenarios.bullishCase.badge} • {data.scenarios.bullishCase.probability}% PROBABILITY
                </div>

                <div className="space-y-3.5">
                  <div className="pt-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/90 font-bold">
                      SCENARIO 2
                    </span>
                    <h4 className="text-sm font-mono font-black text-emerald-300">
                      BULLISH EXPANSION CASE
                    </h4>
                    <p className="text-xs text-zinc-300 font-sans mt-1 leading-relaxed">
                      {data.scenarios.bullishCase.expectedGoldAction}
                    </p>
                  </div>

                  {/* Price Target & Impact */}
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5 font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Target Level</span>
                      <span className="text-base font-black text-emerald-400 tabular-nums">
                        ${data.scenarios.bullishCase.priceTarget.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Expected Delta</span>
                      <span className="font-bold text-emerald-400">
                        +{data.scenarios.bullishCase.expectedMovePoints.toFixed(1)} pts
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Horizon</span>
                      <span className="text-zinc-300">{data.scenarios.bullishCase.timeHorizon}</span>
                    </div>
                  </div>

                  {/* Event Trigger */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">EVENT TRIGGER</span>
                    <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-200">
                      {data.scenarios.bullishCase.eventTrigger}
                    </div>
                  </div>

                  {/* Key Drivers */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">KEY CATALYSTS</span>
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {data.scenarios.bullishCase.keyDrivers.map((d, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 mt-0.5">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Invalidation point */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500 uppercase text-[10.5px]">Invalidation</span>
                  <span className="text-rose-400 font-bold tabular-nums">
                    ${data.scenarios.bullishCase.invalidationLevel.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* BEARISH CASE */}
            {data?.scenarios.bearishCase && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#12161E] border border-rose-500/40 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-rose-400 transition">
                <div className="absolute top-0 right-0 px-3 py-1 bg-rose-500/20 border-b border-l border-rose-500/30 rounded-bl-xl text-[10px] font-mono font-extrabold text-rose-300">
                  {data.scenarios.bearishCase.badge} • {data.scenarios.bearishCase.probability}% PROBABILITY
                </div>

                <div className="space-y-3.5">
                  <div className="pt-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400/90 font-bold">
                      SCENARIO 3
                    </span>
                    <h4 className="text-sm font-mono font-black text-rose-300">
                      BEARISH REVERSAL CASE
                    </h4>
                    <p className="text-xs text-zinc-300 font-sans mt-1 leading-relaxed">
                      {data.scenarios.bearishCase.expectedGoldAction}
                    </p>
                  </div>

                  {/* Price Target & Impact */}
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5 font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Target Level</span>
                      <span className="text-base font-black text-rose-400 tabular-nums">
                        ${data.scenarios.bearishCase.priceTarget.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Expected Delta</span>
                      <span className="font-bold text-rose-400">
                        {data.scenarios.bearishCase.expectedMovePoints.toFixed(1)} pts
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Horizon</span>
                      <span className="text-zinc-300">{data.scenarios.bearishCase.timeHorizon}</span>
                    </div>
                  </div>

                  {/* Event Trigger */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">EVENT TRIGGER</span>
                    <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-200">
                      {data.scenarios.bearishCase.eventTrigger}
                    </div>
                  </div>

                  {/* Key Drivers */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">KEY CATALYSTS</span>
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {data.scenarios.bearishCase.keyDrivers.map((d, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-400 mt-0.5">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Invalidation point */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500 uppercase text-[10.5px]">Invalidation</span>
                  <span className="text-emerald-400 font-bold tabular-nums">
                    ${data.scenarios.bearishCase.invalidationLevel.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: VARIABLE IMPACT SIMULATOR */}
      {activeTabSection === 'VARIABLE_SIM' && (
        <div className="space-y-5">
          <div>
            <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#D4AF37]" />
              VARIABLE IMPACT SIMULATOR — SENSITIVITY TESTING
            </h3>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Simulate macro & market variable shifts before taking execution decisions. Answers: "What happens if this variable changes?"
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* CONTROLS COLUMN (7 COLS) */}
            <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-[#12161E] border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-xs font-mono font-bold text-zinc-300 uppercase">
                  SIMULATION INPUT PARAMETERS
                </span>
                <button
                  onClick={() => {
                    const reset = {
                      dxyChangePercent: -1.0,
                      bondYieldChangeBps: -8.0,
                      interestRateExpectation: 'CUT_25BPS' as const,
                      cpiDeviationPercent: -0.2,
                      fedTone: 'DOVISH' as const,
                      geopoliticalRisk: 'ELEVATED' as const
                    };
                    triggerSimulation(reset);
                  }}
                  className="text-[11px] font-mono text-[#D4AF37] hover:underline cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>

              {/* SLIDER 1: US DOLLAR INDEX (DXY) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-300 font-semibold">1. US Dollar Index (DXY) Movement:</span>
                  <span className={`font-black ${simInputs.dxyChangePercent < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {simInputs.dxyChangePercent > 0 ? `+${simInputs.dxyChangePercent.toFixed(1)}%` : `${simInputs.dxyChangePercent.toFixed(1)}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-3.0"
                  max="3.0"
                  step="0.1"
                  value={simInputs.dxyChangePercent}
                  onChange={(e) => {
                    triggerSimulation({
                      ...simInputs,
                      dxyChangePercent: parseFloat(e.target.value)
                    });
                  }}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>-3.0% (Weak Dollar = Bullish Gold)</span>
                  <span>0%</span>
                  <span>+3.0% (Strong Dollar = Bearish Gold)</span>
                </div>
              </div>

              {/* SLIDER 2: 10Y BOND YIELDS */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-300 font-semibold">2. US 10-Year Bond Yield Delta:</span>
                  <span className={`font-black ${simInputs.bondYieldChangeBps < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {simInputs.bondYieldChangeBps > 0 ? `+${simInputs.bondYieldChangeBps} bps` : `${simInputs.bondYieldChangeBps} bps`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={simInputs.bondYieldChangeBps}
                  onChange={(e) => {
                    triggerSimulation({
                      ...simInputs,
                      bondYieldChangeBps: parseInt(e.target.value)
                    });
                  }}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>-30 bps (Yield Collapse)</span>
                  <span>0 bps</span>
                  <span>+30 bps (Yield Surge)</span>
                </div>
              </div>

              {/* SLIDER 3: CPI DEVIATION */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-300 font-semibold">3. Inflation / CPI Surprise vs Consensus:</span>
                  <span className={`font-black ${simInputs.cpiDeviationPercent < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {simInputs.cpiDeviationPercent > 0 ? `+${simInputs.cpiDeviationPercent.toFixed(1)}% (Hot)` : `${simInputs.cpiDeviationPercent.toFixed(1)}% (Cool)`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-0.8"
                  max="0.8"
                  step="0.1"
                  value={simInputs.cpiDeviationPercent}
                  onChange={(e) => {
                    triggerSimulation({
                      ...simInputs,
                      cpiDeviationPercent: parseFloat(e.target.value)
                    });
                  }}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>-0.8% Cooler</span>
                  <span>Consensus Match</span>
                  <span>+0.8% Hotter</span>
                </div>
              </div>

              {/* SELECT 4: INTEREST RATE EXPECTATIONS */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-mono font-semibold text-zinc-300 block">
                  4. Central Bank Interest Rate Expectation:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  {[
                    { id: 'CUT_50BPS', label: '50 bps Cut' },
                    { id: 'CUT_25BPS', label: '25 bps Cut' },
                    { id: 'HOLD', label: 'Hold Steady' },
                    { id: 'HIKE_25BPS', label: '25 bps Hike' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => triggerSimulation({ ...simInputs, interestRateExpectation: opt.id as any })}
                      className={`p-2 rounded-lg border text-center transition cursor-pointer font-bold ${
                        simInputs.interestRateExpectation === opt.id
                          ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SELECT 5: FED TONE */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-mono font-semibold text-zinc-300 block">
                  5. Federal Reserve Stance / Rhetoric:
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  {[
                    { id: 'DOVISH', label: 'DOVISH (Pivot)' },
                    { id: 'NEUTRAL', label: 'NEUTRAL (Balanced)' },
                    { id: 'HAWKISH', label: 'HAWKISH (Restrictive)' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => triggerSimulation({ ...simInputs, fedTone: opt.id as any })}
                      className={`p-2 rounded-lg border text-center transition cursor-pointer font-bold ${
                        simInputs.fedTone === opt.id
                          ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SELECT 6: GEOPOLITICAL RISK */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-mono font-semibold text-zinc-300 block">
                  6. Geopolitical Tensions & Conflict Radar:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  {[
                    { id: 'DE_ESCALATION', label: 'De-Escalation' },
                    { id: 'STABLE', label: 'Stable' },
                    { id: 'ELEVATED', label: 'Elevated' },
                    { id: 'EXTREME', label: 'Extreme Tension' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => triggerSimulation({ ...simInputs, geopoliticalRisk: opt.id as any })}
                      className={`p-2 rounded-lg border text-center transition cursor-pointer font-bold ${
                        simInputs.geopoliticalRisk === opt.id
                          ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RESULTS COLUMN (5 COLS) */}
            <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12161E] via-[#0E1116] to-[#0A0C0F] border border-[#D4AF37]/40 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-wider">
                    SIMULATION OUTCOME
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-zinc-300">
                    {isSimulating ? 'Recalculating...' : 'Ready'}
                  </span>
                </div>

                {/* Big Simulated Price & Delta */}
                <div className="pt-4 text-center space-y-1">
                  <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                    PROJECTED GOLD SPOT LEVEL
                  </div>
                  <div className="text-3xl sm:text-4xl font-mono font-black text-white tabular-nums tracking-tight">
                    ${simResult ? simResult.simulatedGoldPrice.toFixed(2) : currentPrice.toFixed(2)}
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <span
                      className={`text-sm font-mono font-extrabold px-3 py-1 rounded-lg border ${
                        (simResult?.deltaPoints || 0) >= 0
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {(simResult?.deltaPoints || 0) >= 0 ? '+' : ''}
                      {simResult?.deltaPoints.toFixed(2)} pts (
                      {(simResult?.deltaPercent || 0) >= 0 ? '+' : ''}
                      {simResult?.deltaPercent.toFixed(2)}%)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-mono font-bold text-zinc-300">
                      {simResult?.bias || 'BULLISH'}
                    </span>
                  </div>
                </div>

                {/* Contribution Breakdown */}
                {simResult?.breakdown && (
                  <div className="mt-5 space-y-2 p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 font-mono text-xs">
                    <div className="text-[10px] text-zinc-400 uppercase font-bold border-b border-zinc-800/80 pb-1">
                      FACTOR CONTRIBUTION BREAKDOWN
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-zinc-400">DXY Shift ({simInputs.dxyChangePercent}%):</span>
                      <span className={simResult.breakdown.dxyContributionPoints >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {simResult.breakdown.dxyContributionPoints >= 0 ? '+' : ''}{simResult.breakdown.dxyContributionPoints} pts
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-zinc-400">Yield Impact ({simInputs.bondYieldChangeBps} bps):</span>
                      <span className={simResult.breakdown.yieldContributionPoints >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {simResult.breakdown.yieldContributionPoints >= 0 ? '+' : ''}{simResult.breakdown.yieldContributionPoints} pts
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-zinc-400">Rate Policy ({simInputs.interestRateExpectation}):</span>
                      <span className={simResult.breakdown.rateContributionPoints >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {simResult.breakdown.rateContributionPoints >= 0 ? '+' : ''}{simResult.breakdown.rateContributionPoints} pts
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-zinc-400">Inflation Deviation ({simInputs.cpiDeviationPercent}%):</span>
                      <span className={simResult.breakdown.inflationContributionPoints >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {simResult.breakdown.inflationContributionPoints >= 0 ? '+' : ''}{simResult.breakdown.inflationContributionPoints} pts
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-zinc-400">Fed Rhetoric ({simInputs.fedTone}):</span>
                      <span className={simResult.breakdown.fedToneContributionPoints >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {simResult.breakdown.fedToneContributionPoints >= 0 ? '+' : ''}{simResult.breakdown.fedToneContributionPoints} pts
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-zinc-400">Geopolitical Tension:</span>
                      <span className={simResult.breakdown.geopoliticalContributionPoints >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {simResult.breakdown.geopoliticalContributionPoints >= 0 ? '+' : ''}{simResult.breakdown.geopoliticalContributionPoints} pts
                      </span>
                    </div>
                  </div>
                )}

                {/* Explanation text */}
                <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 font-sans leading-relaxed">
                  <strong>Intelligence Assessment:</strong> {simResult?.explanation}
                </div>
              </div>

              {/* Confidence rating */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Simulation Model Confidence</span>
                <span className="text-[#D4AF37] font-black">{simResult?.confidenceScore || 82}% Confidence</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: MARKET PATH PROJECTION (PATH A & PATH B) */}
      {activeTabSection === 'PATHS' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-[#D4AF37]" />
              MARKET PATH PROJECTION — SMART SCENARIO SEQUENCING
            </h3>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              High-resolution institutional sequence modeling: SMC order blocks, liquidity sweeps, and price targets.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* PATH A */}
            {data?.marketPaths.pathA && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#12161E] border border-emerald-500/40 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-extrabold uppercase text-emerald-400 tracking-wider">
                      PRIMARY PATHWAY
                    </span>
                    <h4 className="text-sm font-mono font-black text-white mt-0.5">
                      {data.marketPaths.pathA.name}
                    </h4>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-black text-xs">
                    {data.marketPaths.pathA.probability}% PROBABILITY
                  </span>
                </div>

                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  {data.marketPaths.pathA.summary}
                </p>

                {/* Target Levels Banner */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 font-mono text-center">
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase">Primary Target</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">
                      ${data.marketPaths.pathA.primaryTarget.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase">Secondary Target</div>
                    <div className="text-sm font-bold text-emerald-300 mt-0.5">
                      ${data.marketPaths.pathA.secondaryTarget.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase">Invalidation</div>
                    <div className="text-sm font-bold text-rose-400 mt-0.5">
                      ${data.marketPaths.pathA.invalidationPoint.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Step Sequence Timeline */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10.5px] font-mono uppercase text-zinc-400 font-bold block">
                    EXECUTION SEQUENCE PHASES
                  </span>
                  <div className="space-y-2">
                    {data.marketPaths.pathA.steps.map((step) => (
                      <div
                        key={step.stepNumber}
                        className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-mono font-black shrink-0 mt-0.5">
                          {step.stepNumber}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-zinc-200">{step.name}</span>
                            <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                              ${step.level.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 font-sans mt-0.5">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PATH B */}
            {data?.marketPaths.pathB && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#12161E] border border-rose-500/40 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-extrabold uppercase text-rose-400 tracking-wider">
                      ALTERNATIVE PATHWAY
                    </span>
                    <h4 className="text-sm font-mono font-black text-white mt-0.5">
                      {data.marketPaths.pathB.name}
                    </h4>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono font-black text-xs">
                    {data.marketPaths.pathB.probability}% PROBABILITY
                  </span>
                </div>

                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  {data.marketPaths.pathB.summary}
                </p>

                {/* Target Levels Banner */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 font-mono text-center">
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase">Primary Target</div>
                    <div className="text-sm font-bold text-rose-400 mt-0.5">
                      ${data.marketPaths.pathB.primaryTarget.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase">Secondary Target</div>
                    <div className="text-sm font-bold text-rose-300 mt-0.5">
                      ${data.marketPaths.pathB.secondaryTarget.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase">Invalidation</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">
                      ${data.marketPaths.pathB.invalidationPoint.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Step Sequence Timeline */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10.5px] font-mono uppercase text-zinc-400 font-bold block">
                    EXECUTION SEQUENCE PHASES
                  </span>
                  <div className="space-y-2">
                    {data.marketPaths.pathB.steps.map((step) => (
                      <div
                        key={step.stepNumber}
                        className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center text-xs font-mono font-black shrink-0 mt-0.5">
                          {step.stepNumber}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-zinc-200">{step.name}</span>
                            <span className="text-xs font-mono font-bold text-rose-400 tabular-nums">
                              ${step.level.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 font-sans mt-0.5">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: NEWS EVENT SIMULATOR */}
      {activeTabSection === 'NEWS_SIM' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              PRE-NEWS EVENT REACTION SIMULATOR
            </h3>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Simulate high-impact macroeconomic data releases (CPI, FOMC, NFP) before the candle prints.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* EVENT PRESET SELECTOR (4 COLS) */}
            <div className="lg:col-span-5 space-y-2.5">
              {data?.newsEventSimulations.map((evt, idx) => (
                <div
                  key={evt.eventId}
                  onClick={() => setSelectedNewsSimIndex(idx)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    selectedNewsSimIndex === idx
                      ? 'bg-[#12161E] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">{evt.scheduledTime}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.volatilityExpectedLevel === 'EXTREME'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {evt.volatilityExpectedLevel} VOLATILITY
                    </span>
                  </div>
                  <h4 className="text-sm font-mono font-bold text-white mt-1">
                    {evt.eventName}
                  </h4>
                  <div className="text-xs text-[#D4AF37] font-mono mt-1 font-semibold">
                    {evt.simulatedScenario}
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono mt-2 pt-2 border-t border-zinc-800/80">
                    <span className="text-zinc-500">Expected Move</span>
                    <span className={`font-black ${evt.goldExpectedMovePoints >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {evt.goldExpectedMovePoints >= 0 ? '+' : ''}{evt.goldExpectedMovePoints} Gold points
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* DETAIL INSPECTION OF SELECTED NEWS SIMULATION (7 COLS) */}
            {data?.newsEventSimulations[selectedNewsSimIndex] && (
              <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-[#12161E] border border-[#D4AF37]/40 shadow-xl space-y-4 flex flex-col justify-between">
                {(() => {
                  const sel = data.newsEventSimulations[selectedNewsSimIndex];
                  return (
                    <div className="space-y-4">
                      <div className="border-b border-zinc-800 pb-3">
                        <div className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold tracking-wider">
                          LIVE SIMULATION PREVIEW
                        </div>
                        <h4 className="text-base font-mono font-black text-white mt-0.5">
                          {sel.eventName} — Consensus: {sel.consensus}
                        </h4>
                        <div className="p-2.5 rounded-lg bg-[#090B0E] border border-amber-500/30 text-xs font-mono text-amber-300 mt-2">
                          ⚡ <strong className="text-white">Simulated Trigger:</strong> {sel.simulatedScenario}
                        </div>
                      </div>

                      {/* Expected Reactions Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
                          <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                            GOLD (XAU/USD) EXPECTED REACTION
                          </span>
                          <div className={`text-base font-black mt-1 ${sel.goldExpectedMovePoints >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {sel.goldExpectedMovePoints >= 0 ? '+' : ''}{sel.goldExpectedMovePoints} Points (${(currentPrice + sel.goldExpectedMovePoints).toFixed(2)})
                          </div>
                          <p className="text-xs text-zinc-300 font-sans mt-1">
                            {sel.goldExpectedReaction}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
                          <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                            US DOLLAR (DXY) EXPECTED REACTION
                          </span>
                          <div className="text-base font-black text-sky-400 mt-1">
                            USD Dynamic Shift
                          </div>
                          <p className="text-xs text-zinc-300 font-sans mt-1">
                            {sel.usdExpectedReaction}
                          </p>
                        </div>
                      </div>

                      {/* Actionable Trade Guidance */}
                      <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 space-y-1">
                        <span className="text-[10px] font-mono text-amber-300 uppercase font-bold flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          RECOMMENDED TRADER PROTOCOL
                        </span>
                        <p className="text-xs text-zinc-200 font-sans leading-relaxed">
                          {sel.recommendedTraderAction}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                <div className="pt-3 border-t border-zinc-800 text-[11px] font-mono text-zinc-500 flex items-center justify-between">
                  <span>Simulated by Aurum Macro Pre-News Engine</span>
                  <span className="text-zinc-300 font-bold">Standard Risk Controls Apply</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 5: HISTORICAL SIMULATION MATCH */}
      {activeTabSection === 'HISTORY_SIM' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-[#D4AF37]" />
                HISTORICAL SIMULATION MATCH — PRECEDENT ACCURACY
              </h3>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Comparing current conditions vs similar historical environments.
              </p>
            </div>

            {/* Stat Box */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#12161E] border border-zinc-800 font-mono text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase block">Similar Cases</span>
                <span className="text-sm font-bold text-white">
                  {data?.historicalSimulation.similarCasesCount || 12}
                </span>
              </div>
              <div className="h-6 w-px bg-zinc-800" />
              <div>
                <span className="text-[10px] text-zinc-400 uppercase block">Bullish Outcomes</span>
                <span className="text-sm font-bold text-emerald-400">
                  {data?.historicalSimulation.bullishOutcomesCount || 8}
                </span>
              </div>
              <div className="h-6 w-px bg-zinc-800" />
              <div>
                <span className="text-[10px] text-zinc-400 uppercase block">Match Accuracy</span>
                <span className="text-sm font-black text-[#D4AF37]">
                  {data?.historicalSimulation.accuracyPercent || 66}%
                </span>
              </div>
            </div>
          </div>

          {/* Commentary Banner */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-sans text-amber-200 leading-relaxed">
            <strong>Historical Pattern Memory:</strong> {data?.historicalSimulation.commentary}
          </div>

          {/* Precedents Table */}
          <div className="rounded-2xl bg-[#12161E] border border-zinc-800 overflow-hidden shadow-xl">
            <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
              <span className="text-xs font-mono font-bold text-zinc-300 uppercase">
                HISTORICAL EVENT SIMILARITY DATABASE
              </span>
              <span className="text-[10.5px] font-mono text-zinc-500">
                Sorted by Similarity Score
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-zinc-400 text-[11px] bg-zinc-950/60">
                    <th className="py-2.5 px-4 font-semibold">EVENT & DATE</th>
                    <th className="py-2.5 px-4 font-semibold">MACRO ENVIRONMENT</th>
                    <th className="py-2.5 px-4 font-semibold">ACTUAL OUTCOME</th>
                    <th className="py-2.5 px-4 font-semibold text-right">MOVE</th>
                    <th className="py-2.5 px-4 font-semibold text-right">SIMILARITY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {data?.historicalSimulation.historicalPrecedents.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-900/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{item.eventName}</div>
                        <div className="text-[10px] text-zinc-500">{item.date}</div>
                      </td>
                      <td className="py-3 px-4 text-zinc-300">
                        <div>{item.macroEnvironment}</div>
                        <div className="text-[10px] text-zinc-500">{item.initialCondition}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold mr-2 ${
                            item.direction === 'BULLISH'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {item.direction}
                        </span>
                        <span className="text-zinc-300 text-xs">{item.actualOutcome}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-black tabular-nums">
                        <span className={item.goldMovePoints >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {item.goldMovePoints >= 0 ? '+' : ''}{item.goldMovePoints} pts
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-0.5 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] font-black text-xs">
                          {item.similarityScorePercent}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
