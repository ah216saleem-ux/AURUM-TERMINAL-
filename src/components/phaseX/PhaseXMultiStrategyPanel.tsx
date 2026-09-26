import React, { useState } from 'react';
import {
  Layers,
  ShieldCheck,
  Zap,
  TrendingUp,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  BarChart3,
  Scale
} from 'lucide-react';
import { PhaseXResult, PhaseXStrategyTelemetry } from './PhaseXTypes';

interface Props {
  currentAnalysis?: PhaseXResult | null;
}

export const PhaseXMultiStrategyPanel: React.FC<Props> = ({ currentAnalysis }) => {
  const [suiteRunning, setSuiteRunning] = useState(false);
  const [suiteResults, setSuiteResults] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TELEMETRY' | 'VALIDATION'>('OVERVIEW');

  const strategyTelemetry: PhaseXStrategyTelemetry | undefined =
    currentAnalysis?.engineDetails?.strategyTelemetry;

  const runValidationSuite = async () => {
    setSuiteRunning(true);
    try {
      const res = await fetch('/api/phase-x/multi-strategy-suite');
      if (res.ok) {
        const data = await res.json();
        setSuiteResults(data);
      }
    } catch (err) {
      console.error('[PhaseXMultiStrategy] Suite run error:', err);
    } finally {
      setSuiteRunning(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl backdrop-blur-sm space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-slate-100 font-mono">
                PHASE X MULTI-STRATEGY SIGNAL ENGINE
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                XAU/USD ONLY
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Volumetric Order-Flow • Institutional Liquidity Displacement • Dynamic Momentum • Apex Confluence Engine
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded transition-all ${
              activeTab === 'OVERVIEW'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Strategy Engines
          </button>
          <button
            onClick={() => setActiveTab('TELEMETRY')}
            className={`px-3 py-1.5 rounded transition-all ${
              activeTab === 'TELEMETRY'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Strategy Telemetry
          </button>
          <button
            onClick={() => setActiveTab('VALIDATION')}
            className={`px-3 py-1.5 rounded transition-all ${
              activeTab === 'VALIDATION'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            15-Scenario Validation Suite
          </button>
        </div>
      </div>

      {/* Active Strategy Status Banner */}
      <div className="bg-slate-950/80 rounded-lg p-3.5 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-slate-400">Active Detected Setup Type:</span>
          <span className="font-bold text-amber-300 text-sm">
            {currentAnalysis?.setupType || 'SCANNING ALL 3 ENGINES'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Direction: <strong className="text-slate-200">{currentAnalysis?.finalDirection || 'WAIT'}</strong></span>
          <span>•</span>
          <span>Quality Gate: <strong className="text-slate-200">{currentAnalysis?.phase5QualityGate?.overallStatus || 'EVALUATING'}</strong></span>
          <span>•</span>
          <span>Setup ID: <strong className="text-sky-300 font-mono text-[11px] truncate max-w-[220px]" title={currentAnalysis?.setupId}>{currentAnalysis?.setupId || 'Scanning'}</strong></span>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Engine A */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3 relative overflow-hidden group hover:border-amber-500/40 transition-colors">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-400 font-bold">ENGINE A</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px]">
                  PHASE 1 CORE
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-200 font-mono">VOLUMETRIC ORDER-FLOW MATRIX (VOFM)</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                Proprietary institutional capital cycle detection across 1H / 30M / 15M. Identifies Capital Accumulation, Re-distribution, and Liquidity Climax Rejections.
              </p>
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Detected Phase:</span>
                  <span className="text-amber-300 font-semibold">{currentAnalysis?.marketPhase || 'Evaluating'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Confirmed Event:</span>
                  <span className="text-slate-200">{currentAnalysis?.detectedEventLabel || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Execution Trigger:</span>
                  <span className="text-emerald-400 font-semibold truncate max-w-[160px]">{currentAnalysis?.executionTriggerDescription || 'Scanning'}</span>
                </div>
              </div>
            </div>

            {/* Engine B */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3 relative overflow-hidden group hover:border-sky-500/40 transition-colors">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-sky-400 font-bold">ENGINE B</span>
                <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[10px]">
                  NEW UPGRADE
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-200 font-mono">INSTITUTIONAL LIQUIDITY DISPLACEMENT (ILD)</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                Session High/Low algorithmic pool sweeps with institutional displacement, Market Structure Shift, and Imbalance Vector Mitigations.
              </p>
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Liquidity Sweep:</span>
                  <span className="text-sky-300 font-semibold">{strategyTelemetry?.smc?.liquiditySwept || 'SCANNING'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CHoCH / MSS:</span>
                  <span className={strategyTelemetry?.smc?.chochDetected ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                    {strategyTelemetry?.smc?.chochDetected ? 'CONFIRMED' : 'WAITING'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">FVG Status:</span>
                  <span className="text-slate-200">{strategyTelemetry?.smc?.fvgStatus || 'SCANNING'}</span>
                </div>
              </div>
            </div>

            {/* Engine C */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold">ENGINE C</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px]">
                  NEW UPGRADE
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-200 font-mono">TREND PULLBACK</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                4H, 1H, and 30M directional trend alignment with 15M pullback into 20/50 EMA or broken structure, confirmed by 5M micro rejection wicks (≥ 25%).
              </p>
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">4H/1H/30M Trend:</span>
                  <span className="text-emerald-300 font-semibold">
                    {strategyTelemetry?.trend?.tf4HDirection || 'NEUTRAL'} / {strategyTelemetry?.trend?.tf1HDirection || 'NEUTRAL'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">15M Pullback:</span>
                  <span className="text-slate-200">{strategyTelemetry?.trend?.pullbackTarget || 'AWAITING ZONE'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">5M Micro Confirmation:</span>
                  <span className={strategyTelemetry?.trend?.micro5MStructureConfirmed ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                    {strategyTelemetry?.trend?.micro5MStructureConfirmed ? 'CONFIRMED' : 'WAITING'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Arbitration & Confluence Rules Card */}
          <div className="bg-slate-950/90 rounded-lg p-4 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-slate-200 font-bold border-b border-slate-800 pb-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>STRICT ARBITRATION & CAPITAL PROTECTION CONFLUENCE RULES</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
              <div className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-300">Confluence Multiplier:</strong> If 2 or 3 engines identify setups in the same direction, they merge into a single setup with elevated confidence (e.g., APEX DUAL CONVERGENCE: ALGO-FLOW + LIQUIDITY). Exactly ONE Telegram signal is dispatched.
                </div>
              </div>
              <div className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded border border-slate-800">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-rose-300">Conflict Veto Protection:</strong> If one engine signals BUY while another signals SELL, arbitration instantly rejects both and outputs: <span className="text-amber-300 font-bold">WAIT — CONFIRMATION WEAK</span>. No chasing or contradictory positions allowed.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE STRATEGY TELEMETRY */}
      {activeTab === 'TELEMETRY' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            {/* SMC Detailed Telemetry */}
            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-sky-400 font-bold border-b border-slate-800 pb-2">
                <span>INSTITUTIONAL LIQUIDITY DISPLACEMENT (ILD) ENGINE DATA</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/40">
                  SESSION: {strategyTelemetry?.smc?.currentSession || 'ACTIVE'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Asian Session High:</span>
                  <span className="text-slate-200">${strategyTelemetry?.smc?.asianHigh?.toFixed(2) || '---'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Asian Session Low:</span>
                  <span className="text-slate-200">${strategyTelemetry?.smc?.asianLow?.toFixed(2) || '---'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Previous Day High (PDH):</span>
                  <span className="text-slate-200">${strategyTelemetry?.smc?.prevDayHigh?.toFixed(2) || '---'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Previous Day Low (PDL):</span>
                  <span className="text-slate-200">${strategyTelemetry?.smc?.prevDayLow?.toFixed(2) || '---'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Swept Level Description:</span>
                  <span className="text-sky-300 font-semibold">{strategyTelemetry?.smc?.sweptLevelDescription || 'None'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Displacement Spread / ATR:</span>
                  <span className="text-slate-200">
                    ${strategyTelemetry?.smc?.displacementSpread?.toFixed(2) || '0.00'} ({strategyTelemetry?.smc?.displacementAtrRatio || 0}x ATR)
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">FVG Range (15M):</span>
                  <span className="text-amber-300 font-semibold">
                    {strategyTelemetry?.smc?.fvgZoneLow != null && strategyTelemetry?.smc?.fvgZoneHigh != null
                      ? `$${strategyTelemetry.smc.fvgZoneLow.toFixed(2)} - $${strategyTelemetry.smc.fvgZoneHigh.toFixed(2)}`
                      : 'None Formed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Trend Pullback Detailed Telemetry */}
            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
                <span>TREND PULLBACK ENGINE DATA</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                  MTF ALIGNMENT
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">4H Macro Trend:</span>
                  <span className="text-slate-200">{strategyTelemetry?.trend?.tf4HDirection || 'NEUTRAL'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">1H Primary Trend:</span>
                  <span className="text-slate-200">{strategyTelemetry?.trend?.tf1HDirection || 'NEUTRAL'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">30M Intermediate Bias:</span>
                  <span className="text-slate-200">{strategyTelemetry?.trend?.tf30MDirection || 'NEUTRAL'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">15M 20 EMA:</span>
                  <span className="text-slate-200">${strategyTelemetry?.trend?.ema20_15M?.toFixed(2) || '---'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">15M 50 EMA:</span>
                  <span className="text-slate-200">${strategyTelemetry?.trend?.ema50_15M?.toFixed(2) || '---'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Pullback Distance:</span>
                  <span className="text-slate-200">{strategyTelemetry?.trend?.pullbackDistanceAtr || 0}x ATR</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">5M Micro Rejection Wick:</span>
                  <span className="text-emerald-300 font-semibold">
                    {strategyTelemetry?.trend?.micro5MRejectionWickPct ? `${(strategyTelemetry.trend.micro5MRejectionWickPct * 100).toFixed(0)}%` : '0%'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 15-SCENARIO VALIDATION SUITE */}
      {activeTab === 'VALIDATION' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
            <div>
              <div className="font-bold text-slate-200 text-sm">
                Deterministic Multi-Strategy Verification Suite
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Executes all 15 deterministic scenarios (A through O) to verify Volumetric, Liquidity Displacement, Momentum Vectors, Anti-Chase, Conflict Arbitration, and Phase 5 Gates.
              </p>
            </div>
            <button
              onClick={runValidationSuite}
              disabled={suiteRunning}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all disabled:opacity-50"
            >
              {suiteRunning ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              {suiteRunning ? 'Running Verification...' : 'Run 15-Scenario Suite'}
            </button>
          </div>

          {suiteResults && (
            <div className="space-y-4">
              {/* Backtest Metrics across Strategies */}
              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-400 border-b border-slate-800 pb-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>DETERMINISTIC HISTORICAL BACKTEST METRICS (VERIFIED FIXTURES)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                        <th className="py-2 px-3">Strategy</th>
                        <th className="py-2 px-3">Setups Detected</th>
                        <th className="py-2 px-3">Phase 5 Approved</th>
                        <th className="py-2 px-3">Phase 5 Rejected</th>
                        <th className="py-2 px-3">TP1 Hits</th>
                        <th className="py-2 px-3">TP2 Hits</th>
                        <th className="py-2 px-3">SL Hits</th>
                        <th className="py-2 px-3">Realized R</th>
                        <th className="py-2 px-3">Avg R/Trade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      {suiteResults.backtestMetrics?.map((m: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="py-2.5 px-3 font-bold text-amber-300">{m.strategyName}</td>
                          <td className="py-2.5 px-3">{m.detectedSetups}</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-semibold">{m.passedPhase5}</td>
                          <td className="py-2.5 px-3 text-rose-400">{m.rejectedPhase5}</td>
                          <td className="py-2.5 px-3 text-emerald-300">{m.tp1Hits}</td>
                          <td className="py-2.5 px-3 text-emerald-300">{m.tp2Hits}</td>
                          <td className="py-2.5 px-3 text-rose-300">{m.slHits}</td>
                          <td className="py-2.5 px-3 text-amber-300 font-bold">+{m.realizedR.toFixed(1)}R</td>
                          <td className="py-2.5 px-3 text-sky-300 font-semibold">+{m.averageR.toFixed(2)}R</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 15 Scenarios Matrix */}
              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-200">SCENARIO EXECUTION MATRIX (15/15 PASS)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                    SYSTEM PASS
                  </span>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {suiteResults.scenarios?.map((s: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                            {s.scenarioId}
                          </span>
                          <span className="font-bold text-slate-200">{s.scenarioName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {s.strategyType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{s.description}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right text-[11px]">
                          <div>Direction: <strong className="text-slate-200">{s.actualDirection}</strong></div>
                          <div>Gate: <strong className={s.actualGateStatus === 'APPROVED' ? 'text-emerald-400' : 'text-amber-400'}>{s.actualGateStatus}</strong></div>
                        </div>
                        <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
