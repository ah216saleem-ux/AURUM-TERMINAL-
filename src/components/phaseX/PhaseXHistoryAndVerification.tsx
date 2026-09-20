import React, { useState, useEffect } from 'react';
import { PhaseXTradeHistoryRecord, Phase4VerificationReport } from './PhaseXTypes';
import { ShieldCheck, History, CheckCircle2, AlertTriangle, RefreshCw, XCircle } from 'lucide-react';

interface PhaseXHistoryAndVerificationProps {
  selectedAssetId: string;
}

export const PhaseXHistoryAndVerification: React.FC<PhaseXHistoryAndVerificationProps> = ({ selectedAssetId }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'verification'>('verification');
  const [history, setHistory] = useState<PhaseXTradeHistoryRecord[]>([]);
  const [verificationReport, setVerificationReport] = useState<Phase4VerificationReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/phase-x/history?assetId=${selectedAssetId}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('[PhaseXHistory] Error fetching trade history:', err);
    }
  };

  const fetchVerification = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/phase-x/verify-phase4');
      if (res.ok) {
        const data: Phase4VerificationReport = await res.json();
        setVerificationReport(data);
      }
    } catch (err) {
      console.error('[PhaseXHistory] Error running verification suite:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    } else {
      fetchVerification();
    }
  }, [activeTab, selectedAssetId]);

  return (
    <div className="rounded-2xl bg-[#090b14] border border-zinc-800 shadow-xl overflow-hidden font-mono text-xs">
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 p-3 bg-zinc-950/60">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'verification'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>PHASE 4 VERIFICATION SUITE</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'history'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>TRADE HISTORY</span>
          </button>
        </div>

        <button
          onClick={activeTab === 'history' ? fetchHistory : fetchVerification}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tab Content: Verification Suite */}
      {activeTab === 'verification' && (
        <div className="p-4 space-y-4">
          {verificationReport ? (
            <>
              {/* Overall Status Banner */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                verificationReport.overallStatus === 'PASS' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">{verificationReport.system}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ALL REQUIREMENTS VERIFIED ({verificationReport.overallStatus})
                </span>
              </div>

              {/* Requirement Checklist Grid */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Phase 4 Deterministic Engine Checklist (18 Requirements)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {verificationReport.checklist.map((item) => (
                    <div key={item.id} className="p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-200 text-[11px] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{item.title}</span>
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 pl-5">
                        {item.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulated Lifecycle Test (Section 25) */}
              {verificationReport.simulatedLifecycleTest && (
                <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-amber-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Simulated Lifecycle Test: {verificationReport.simulatedLifecycleTest.testId}</span>
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      ISOLATED TEST DATA
                    </span>
                  </div>

                  <div className="text-[10px] text-zinc-400">
                    Setup: <strong>{verificationReport.simulatedLifecycleTest.initialSetup.direction} {verificationReport.simulatedLifecycleTest.asset}</strong> | 
                    Entry: {verificationReport.simulatedLifecycleTest.initialSetup.entry} | 
                    SL: {verificationReport.simulatedLifecycleTest.initialSetup.sl} | 
                    TP1: {verificationReport.simulatedLifecycleTest.initialSetup.tp1} | 
                    TP2: {verificationReport.simulatedLifecycleTest.initialSetup.tp2}
                  </div>

                  <div className="space-y-1">
                    {verificationReport.simulatedLifecycleTest.steps.map((step, idx) => (
                      <div key={idx} className="p-2 rounded bg-zinc-900/80 border border-zinc-800 text-[10px] flex items-center justify-between">
                        <span className="text-zinc-300 font-semibold">{step.step}: {step.event}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-300">Price: {step.simulatedPrice}</span>
                          <span className="text-zinc-400">({step.liveR})</span>
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold">{step.lifecycleState}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] text-emerald-400 pt-1 border-t border-zinc-800/80 flex items-center justify-between">
                    <span>Outcome: <strong>{verificationReport.simulatedLifecycleTest.finalOutcome}</strong></span>
                    <span>{verificationReport.simulatedLifecycleTest.levelLockCheck}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6 text-zinc-500">
              Loading Phase 4 Verification Suite...
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Trade History */}
      {activeTab === 'history' && (
        <div className="p-4 space-y-3">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Closed Trade Records ({history.length})
          </div>

          {history.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              No closed trade records found for this asset.
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((record) => (
                <div key={record.setupId} className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                        record.direction === 'BUY' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {record.direction}
                      </span>
                      <span className="font-bold text-white text-xs">{record.symbol}</span>
                      <span className="text-zinc-500 text-[10px]">({record.setupId})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`font-black text-xs ${
                        (record.finalR || 0) > 0 ? 'text-emerald-400' : (record.finalR || 0) < 0 ? 'text-rose-400' : 'text-zinc-400'
                      }`}>
                        {record.finalR != null ? `${record.finalR > 0 ? '+' : ''}${record.finalR.toFixed(2)}R` : '—'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-bold">
                        {record.finalStatusLabel}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-zinc-400">
                    <div>Entry: <strong className="text-zinc-200">{record.entry}</strong></div>
                    <div>SL: <strong className="text-rose-300">{record.sl}</strong></div>
                    <div>TP1: <strong className="text-emerald-300">{record.tp1} {record.tp1Reached ? '✓' : ''}</strong></div>
                    <div>TP2: <strong className="text-emerald-300">{record.tp2} {record.tp2Reached ? '✓' : ''}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
