/**
 * AURUM TERMINAL — INSTITUTIONAL GEMINI AI AGENT API ROUTER
 */

import { Request, Response } from 'express';
import { generateGeminiMarketBriefing, analyzeTradeSetupWithGemini } from './geminiAiAgentService';
import { getVerifiedXauPrice } from './websocketServer';

export async function handleAiAgentRequest(req: Request, res: Response): Promise<boolean> {
  const url = req.url || '';
  if (!url.startsWith('/api/ai-agent')) {
    return false;
  }

  const pathname = url.split('?')[0];

  try {
    if (pathname === '/api/ai-agent/market-briefing' && req.method === 'GET') {
      const verified = getVerifiedXauPrice(30000);
      const price = verified ? verified.price : 2650.00;
      const briefing = await generateGeminiMarketBriefing('XAU/USD', price);
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(briefing));
      return true;
    }

    if (pathname === '/api/ai-agent/analyze-setup' && req.method === 'POST') {
      const body = req.body || {};
      const direction = body.direction || 'BUY';
      const entry = body.entry || 2650.00;
      const sl = body.sl || 2640.00;
      const tp1 = body.tp1 || 2657.00;
      const tp2 = body.tp2 || 2661.00;
      const qualityScore = body.qualityScore || 85;

      const analysis = await analyzeTradeSetupWithGemini(direction, entry, sl, tp1, tp2, qualityScore);
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(analysis));
      return true;
    }

    return false;
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'AI Agent analysis failed' }));
    return true;
  }
}
