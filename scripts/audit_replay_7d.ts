import { fetchYahooCandles } from '../server/marketDataRouter';
import { analyzePhaseX } from '../server/phaseXEngine';

async function run7DayReplayAudit() {
  console.log('===============================================================');
  console.log('PHASE X — 7-DAY HISTORICAL AUDIT & PIPELINE REPLAY');
  console.log('Strict read-only evaluation: No signals sent, zero side-effects');
  console.log('===============================================================\n');

  console.log('[1/4] Fetching historical market data for GC=F (XAU/USD)...');
  const [candles5m, candles15m, candles30m, candles1h] = await Promise.all([
    fetchYahooCandles('GC=F', '5m', '7d'),
    fetchYahooCandles('GC=F', '15m', '7d'),
    fetchYahooCandles('GC=F', '30m', '7d'),
    fetchYahooCandles('GC=F', '1h', '30d')
  ]);

  console.log(`Fetched:
  - 5M Candles: ${candles5m.length}
  - 15M Candles: ${candles15m.length}
  - 30M Candles: ${candles30m.length}
  - 1H Candles: ${candles1h.length}
  `);

  if (candles15m.length === 0) {
    console.error('ERROR: No 15M candles retrieved for GC=F.');
    process.exit(1);
  }

  const startTime = new Date(candles15m[0].time).toISOString();
  const endTime = new Date(candles15m[candles15m.length - 1].time).toISOString();
  console.log(`Historical Period: ${startTime} to ${endTime} (${(candles15m.length * 15 / 60 / 24).toFixed(1)} trading days)\n`);

  // Trackers
  let totalStepsEvaluated = 0;
  let totalSetupsDetected = 0;
  let totalApproved = 0;

  // Specific Engine Trigger Counts
  let wyckoffTriggerCount = 0;
  let smcTriggerCount = 0;
  let trendTriggerCount = 0;
  let confluenceCount = 0;

  // Rejection by Phase 5 Priority Tier (Priority 1 - 11)
  const priorityRejections: Record<number, number> = {
    1: 0, // Market Data Integrity & Freshness
    2: 0, // Multi-Timeframe Alignment & Setup Formation
    3: 0, // Stop Loss & Noise Protection
    4: 0, // TP1/TP2 & R:R Viability
    5: 0, // Volatility Envelope
    6: 0, // Spread Safety
    7: 0, // News / Event Risk
    8: 0, // Entry Validity
    9: 0, // Anti-Chase Gate
    10: 0, // Trade Confidence (< 75%)
    11: 0  // Expiration / Duplicates
  };

  // Counts by specific rejection reason string
  const rejectionReasons: Record<string, number> = {};

  // Counts by wait reason code
  const waitReasonCodes: Record<string, number> = {};

  // Detected Setups Log
  const detectedSetupsLog: any[] = [];

  // Minimum warmup candles so 1H has >= 15 bars, 15M has >= 10 bars
  const minWarmupIndex = 25;

  console.log(`[2/4] Replaying ${candles15m.length - minWarmupIndex} closed 15M candle intervals through Phase X pipeline...`);

  for (let i = minWarmupIndex; i < candles15m.length; i++) {
    const current15mCandle = candles15m[i];
    const simTime = current15mCandle.time;
    const simPrice = current15mCandle.close;

    // Slice history up to current simulation time
    const slice5m = candles5m.filter(c => c.time <= simTime);
    const slice15m = candles15m.slice(0, i + 1);
    const slice30m = candles30m.filter(c => c.time <= simTime);
    const slice1h = candles1h.filter(c => c.time <= simTime);

    // Run full Phase X pipeline
    try {
      const result = await analyzePhaseX('xau-usd', simPrice, {
        candles5mRaw: slice5m,
        candles15mRaw: slice15m,
        candles30mRaw: slice30m,
        candles1hRaw: slice1h,
        simulatedNow: simTime,
        skipSideEffects: true
      });

      totalStepsEvaluated++;

      const strategyTelem = result.strategyTelemetry;
      const isWyckoff = strategyTelem?.wyckoff?.setupQualified;
      const isSmc = strategyTelem?.smc?.setupQualified;
      const isTrend = strategyTelem?.trend?.setupQualified;

      if (isWyckoff) wyckoffTriggerCount++;
      if (isSmc) smcTriggerCount++;
      if (isTrend) trendTriggerCount++;

      const anySetupQualified = isWyckoff || isSmc || isTrend;
      if (anySetupQualified) {
        totalSetupsDetected++;
        if ((isWyckoff && isSmc) || (isWyckoff && isTrend) || (isSmc && isTrend)) {
          confluenceCount++;
        }

        detectedSetupsLog.push({
          time: new Date(simTime).toISOString(),
          price: simPrice,
          direction: result.finalDirection,
          setupType: result.setupType,
          confidence: result.tradeConfidence,
          gateStatus: result.phase5QualityGate?.finalGateStatus,
          primaryRejectionReason: result.phase5QualityGate?.primaryRejectionReason,
          waitReasonCode: result.waitReasonCode,
          tp1R: result.tp1RMultiple,
          tp2R: result.tp2RMultiple,
          activeEngines: [
            isWyckoff ? 'WYCKOFF' : null,
            isSmc ? 'SMC' : null,
            isTrend ? 'TREND' : null
          ].filter(Boolean).join(' + ')
        });
      }

      // Track gate outcome
      const gate = result.phase5QualityGate;
      if (gate) {
        if (gate.finalGateStatus === 'APPROVED') {
          totalApproved++;
        } else {
          if (gate.rejectionPriority) {
            priorityRejections[gate.rejectionPriority] = (priorityRejections[gate.rejectionPriority] || 0) + 1;
          }
          const reason = gate.primaryRejectionReason || 'UNKNOWN_REJECTION';
          rejectionReasons[reason] = (rejectionReasons[reason] || 0) + 1;
        }
      }

      // Track wait reason code
      const code = result.waitReasonCode || 'NONE';
      waitReasonCodes[code] = (waitReasonCodes[code] || 0) + 1;

    } catch (err) {
      // ignore or log
    }
  }

  console.log('\n===============================================================');
  console.log('AUDIT REPLAY RESULTS: LAST 7 DAYS XAU/USD (GC=F)');
  console.log('===============================================================\n');

  console.log(`Total 15M Intervals Replayed: ${totalStepsEvaluated}`);
  console.log(`Total Setups Detected Across All 3 Engines: ${totalSetupsDetected}`);
  console.log(`  ├─ Wyckoff Engine Triggers: ${wyckoffTriggerCount}`);
  console.log(`  ├─ SMC / ICT Liquidity Triggers: ${smcTriggerCount}`);
  console.log(`  ├─ Trend Pullback Triggers: ${trendTriggerCount}`);
  console.log(`  └─ Multi-Strategy Confluences: ${confluenceCount}`);
  console.log(`Total Setups Approved by ALL 17 Gates: ${totalApproved}`);
  console.log(`Total Rejections / Waits: ${totalStepsEvaluated - totalApproved}\n`);

  console.log('---------------------------------------------------------------');
  console.log('REJECTIONS BY PRIORITY TIER (Phase 5 Deterministic Gates)');
  console.log('---------------------------------------------------------------');
  const priorityDescriptions: Record<number, string> = {
    1: 'Priority 1: Live Market Data Integrity & Freshness',
    2: 'Priority 2: Multi-Timeframe Alignment & Structural Formation',
    3: 'Priority 3: Stop Loss & Noise Protection',
    4: 'Priority 4: TP1 / TP2 & R:R Viability Gate (Min 2.0R / 3.0R)',
    5: 'Priority 5: Volatility & ATR Expansion Envelope',
    6: 'Priority 6: Spread Safety Threshold',
    7: 'Priority 7: Event Risk / High-Impact News Buffer',
    8: 'Priority 8: Precision Entry Zone Validity',
    9: 'Priority 9: Anti-Chase Gate (Live Price Extension)',
    10: 'Priority 10: Trade Confidence Score Threshold (>= 75%)',
    11: 'Priority 11: Setup Expiration & Duplicate Position Protection'
  };

  for (let p = 1; p <= 11; p++) {
    const count = priorityRejections[p] || 0;
    const pct = totalStepsEvaluated > 0 ? ((count / totalStepsEvaluated) * 100).toFixed(1) : '0';
    console.log(`  Tier ${p.toString().padStart(2, ' ')} (${priorityDescriptions[p]}): ${count} (${pct}%)`);
  }

  console.log('\n---------------------------------------------------------------');
  console.log('TOP PRIMARY REJECTION REASONS:');
  console.log('---------------------------------------------------------------');
  const sortedReasons = Object.entries(rejectionReasons).sort((a, b) => b[1] - a[1]);
  for (const [reason, count] of sortedReasons) {
    const pct = totalStepsEvaluated > 0 ? ((count / totalStepsEvaluated) * 100).toFixed(1) : '0';
    console.log(`  • [${count}x - ${pct}%] ${reason}`);
  }

  console.log('\n---------------------------------------------------------------');
  console.log('WAIT REASON CODES DISTRIBUTION:');
  console.log('---------------------------------------------------------------');
  const sortedCodes = Object.entries(waitReasonCodes).sort((a, b) => b[1] - a[1]);
  for (const [code, count] of sortedCodes) {
    const pct = totalStepsEvaluated > 0 ? ((count / totalStepsEvaluated) * 100).toFixed(1) : '0';
    console.log(`  • ${code}: ${count} (${pct}%)`);
  }

  if (detectedSetupsLog.length > 0) {
    console.log('\n---------------------------------------------------------------');
    console.log('DETAILED LOG OF DETECTED SETUPS:');
    console.log('---------------------------------------------------------------');
    detectedSetupsLog.forEach((s, idx) => {
      console.log(`[Setup #${idx + 1}] ${s.time} | Price: $${s.price} | Eng: ${s.activeEngines} | Dir: ${s.direction} | Conf: ${s.confidence}% | Gate: ${s.gateStatus}`);
      console.log(`       Rejection Reason: ${s.primaryRejectionReason}`);
      console.log(`       Wait Code: ${s.waitReasonCode} | TP1: ${s.tp1R}R | TP2: ${s.tp2R}R\n`);
    });
  } else {
    console.log('\nNo intermediate setups crossed the initial entry trigger across all 3 engines.');
  }

  console.log('===============================================================\n');
}

run7DayReplayAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
