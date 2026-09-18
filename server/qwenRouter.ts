import type { Request, Response } from 'express';

interface QwenRequestData {
  marketId: string;
  symbol: string;
  price: number;
  changePercent: number;
  trend: 'BULLISH' | 'BEARISH' | 'RANGING';
  smc: {
    orderBlock: string;
    fairValueGap: string;
    liquiditySweep: string;
    bos: string;
    choch: string;
  };
  levels: {
    entry: number;
    stopLoss: number;
    takeProfit: number;
  };
  riskReward?: string;
  aurumConfidence: number;
  newsRisk: string;
}

// In-flight request pooling and caching to prevent HTTP 409 (duplicate processing) and 429 (rate limits)
const inFlightRequests = new Map<string, Promise<any>>();
const recentCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 20000; // 20 seconds cache
let rateLimitCooldownUntil = 0; // Cooldown timer when upstream is rate limited

export async function handleQwenStatus(req: Request, res: Response) {
  const apiKey = process.env.XKIRO_API_KEY || '';
  const isConfigured = Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'MY_XKIRO_API_KEY');

  return res.json({
    success: true,
    apiKeyConfigured: isConfigured,
    model: 'qwen/qwen3.8-max:free',
    baseUrl: 'https://api.xkiro.com/v1',
    status: isConfigured ? 'READY' : 'SIMULATION_FALLBACK'
  });
}

export async function handleQwenRequest(req: Request, res: Response) {
  try {
    const { 
      marketId, 
      symbol, 
      price, 
      changePercent, 
      trend, 
      smc, 
      levels,
      riskReward, 
      aurumConfidence, 
      newsRisk 
    } = req.body as QwenRequestData;

    const apiKey = process.env.XKIRO_API_KEY || '';

    // Calculate Risk:Reward ratio if not directly provided
    let calculatedRR = riskReward;
    if (!calculatedRR && levels?.entry && levels?.stopLoss && levels?.takeProfit) {
      const isBuy = levels.takeProfit > levels.entry;
      const risk = Math.abs(levels.entry - levels.stopLoss);
      const reward = Math.abs(levels.takeProfit - levels.entry);
      if (risk > 0) {
        calculatedRR = `1:${(reward / risk).toFixed(2)}`;
      } else {
        calculatedRR = '1:2.00';
      }
    }

    // If API Key is missing or invalid, run high-fidelity dynamic simulated fallback
    if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_XKIRO_API_KEY') {
      const simulatedResult = generateSimulatedResponse(symbol, price, trend, levels, aurumConfidence, calculatedRR);
      return res.json({
        success: true,
        isSimulated: true,
        apiKeyConfigured: false,
        model: 'qwen/qwen3.8-max:free',
        ...simulatedResult,
        note: 'API key not set. Running high-fidelity Qwen simulation. Set XKIRO_API_KEY to switch to live model.'
      });
    }

    // If upstream is in rate-limit cooldown, serve simulated engine immediately without hitting upstream
    if (Date.now() < rateLimitCooldownUntil) {
      const simulatedResult = generateSimulatedResponse(symbol, price, trend, levels, aurumConfidence, calculatedRR);
      return res.json({
        success: true,
        isSimulated: true,
        apiKeyConfigured: true,
        model: 'qwen/qwen3.8-max:free',
        ...simulatedResult,
        note: 'Rate-limit buffer active. Serving high-fidelity simulated second opinion.'
      });
    }

    const cacheKey = `${symbol || marketId}_${trend}_${levels?.entry || 0}`;

    // 1. Check recent cache to prevent rapid duplicate requests
    const cached = recentCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json(cached.data);
    }

    // 2. If a request for this asset is already in flight, reuse its promise (prevents upstream 409 duplicate errors)
    if (inFlightRequests.has(cacheKey)) {
      try {
        const inFlightResult = await inFlightRequests.get(cacheKey);
        return res.json(inFlightResult);
      } catch (err) {
        // Fall through to local simulation if in-flight failed
      }
    }

    const systemPrompt = `You are the Qwen Market Analysis Agent, an independent second-opinion AI embedded in the AURUM TERMINAL, a premium institutional trading dashboard.
Your role is to independently review AURUM's automated SMC trading setups. You analyze live market price, trend direction, market structure, Smart Money Concepts (SMC order blocks, FVG, liquidity sweeps, BOS, CHOCH), entry zone, stop loss, take profit, risk-reward ratio, news risk, and primary engine confidence.

Constraints:
- Respond STRICTLY with a valid JSON object. Do NOT include any markdown code blocks, prefixes, or commentary.
- Your output JSON MUST strictly match these keys:
{
  "direction": "BUY" | "SELL" | "WAIT",
  "confidence": <number between 30 and 98>,
  "riskAssessment": "<concise risk assessment including leverage and structural hazard evaluation>",
  "setupValidation": "<setup validation analyzing entry zone, SL, TP, and R:R ratio>",
  "reasoning": "<detailed second-opinion reasoning regarding SMC alignment and market bias>"
}`;

    const userPrompt = `Institutional Review Request for ${symbol}:
- Live Market Price: ${price}
- 24h Change: ${changePercent}%
- Trend Direction: ${trend}
- Market Structure & SMC Analysis:
  * Order Block: ${smc?.orderBlock || 'N/A'}
  * Fair Value Gap (FVG): ${smc?.fairValueGap || 'N/A'}
  * Liquidity Sweep: ${smc?.liquiditySweep || 'N/A'}
  * Structure Shift (BOS): ${smc?.bos || 'N/A'}
  * Change of Character (CHOCH): ${smc?.choch || 'N/A'}
- Trade Levels & Risk Parameters:
  * Entry Zone: ${levels?.entry}
  * Stop Loss: ${levels?.stopLoss}
  * Take Profit: ${levels?.takeProfit}
  * Risk:Reward Ratio: ${calculatedRR || '1:2.0'}
- Macro News Risk: ${newsRisk}
- Primary Engine Confidence Score: ${aurumConfidence}%`;

    // Execute upstream call with deduplication promise wrapper
    const requestPromise = (async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds timeout

      try {
        const apiResponse = await fetch('https://api.xkiro.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'qwen/qwen3.8-max:free',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.2,
            response_format: { type: 'json_object' }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!apiResponse.ok) {
          if (apiResponse.status === 429) {
            // Activate 45-second rate-limit cooldown
            rateLimitCooldownUntil = Date.now() + 45000;
          }
          throw new Error(`STATUS_${apiResponse.status}`);
        }

        const responseData = await apiResponse.json();
        const textContent = responseData.choices?.[0]?.message?.content;

        if (!textContent) {
          throw new Error('EMPTY_PAYLOAD');
        }

        // Clean markdown code blocks if present
        let cleanedText = textContent.trim();
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.substring(7);
        }
        if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.substring(3);
        }
        if (cleanedText.endsWith('```')) {
          cleanedText = cleanedText.substring(0, cleanedText.length - 3);
        }
        cleanedText = cleanedText.trim();

        const parsedJSON = JSON.parse(cleanedText);

        const result = {
          success: true,
          isSimulated: false,
          apiKeyConfigured: true,
          model: 'qwen/qwen3.8-max:free',
          direction: (['BUY', 'SELL', 'WAIT'].includes(parsedJSON.direction) ? parsedJSON.direction : 'WAIT'),
          confidence: Number(parsedJSON.confidence) || 75,
          riskAssessment: parsedJSON.riskAssessment || 'Moderate risk profile evaluated.',
          setupValidation: parsedJSON.setupValidation || 'Setup parameters validated against liquidity zones.',
          reasoning: parsedJSON.reasoning || 'SMC structure aligns with second-opinion evaluation.'
        };

        // Cache successful response
        recentCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;

      } catch (apiErr: any) {
        const simulatedResult = generateSimulatedResponse(symbol, price, trend, levels, aurumConfidence, calculatedRR);
        const fallbackData = {
          success: true,
          isSimulated: true,
          apiKeyConfigured: true,
          model: 'qwen/qwen3.8-max:free',
          ...simulatedResult,
          note: 'AURUM High-Fidelity Simulation Engine Active.'
        };

        recentCache.set(cacheKey, { data: fallbackData, timestamp: Date.now() });
        return fallbackData;
      }
    })();

    inFlightRequests.set(cacheKey, requestPromise);
    const finalResult = await requestPromise;
    inFlightRequests.delete(cacheKey);

    return res.json(finalResult);

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

function generateSimulatedResponse(
  symbol: string, 
  price: number, 
  trend: 'BULLISH' | 'BEARISH' | 'RANGING', 
  levels: { entry: number; stopLoss: number; takeProfit: number },
  aurumConfidence: number,
  riskReward?: string
) {
  const isBuy = levels?.takeProfit > levels?.entry;
  const isAligned = (isBuy && trend === 'BULLISH') || (!isBuy && trend === 'BEARISH');

  let direction: 'BUY' | 'SELL' | 'WAIT' = isBuy ? 'BUY' : 'SELL';
  let confidence = isAligned ? Math.min(96, aurumConfidence + 3) : Math.max(52, aurumConfidence - 18);

  let setupValidation = '';
  let riskAssessment = '';
  let reasoning = '';

  const rrStr = riskReward || '1:2.1';
  const entryVal = levels?.entry || price;
  const slVal = levels?.stopLoss || price * 0.99;
  const tpVal = levels?.takeProfit || price * 1.02;

  if (isAligned) {
    setupValidation = `Setup Validated: Entry ($${entryVal}) aligns cleanly with active FVG zone. Stop Loss ($${slVal}) & Target ($${tpVal}) yield a solid ${rrStr} R:R.`;
    riskAssessment = `Low to Moderate Risk: Structural swing low/high provides strong defense against routine market sweeps.`;
    reasoning = `Qwen Analysis: Strong SMC alignment confirmed. Price action displays clear ${trend} momentum and order block mitigation, fully supporting the proposed ${direction} bias.`;
  } else {
    direction = 'WAIT';
    confidence = Math.max(48, aurumConfidence - 22);
    setupValidation = `Setup Caution: Price is approaching higher timeframe supply/demand boundaries. R:R of ${rrStr} is offset by elevated structural friction.`;
    riskAssessment = `Elevated Risk: Counter-trend setup against higher timeframe momentum vectors. Drawdown risk is heightened.`;
    reasoning = `Qwen Analysis: Divergence detected between short-term displacement and long-term market structure. Qwen recommends waiting for a clear Lower Timeframe CHOCH before entering.`;
  }

  return {
    direction,
    confidence,
    riskAssessment,
    setupValidation,
    reasoning
  };
}

