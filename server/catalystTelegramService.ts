import { getTelegramCredentials, sendRawTelegramMessage } from './phaseXTelegramService';

export interface CatalystSignalTelegramPayload {
  direction: 'BUY' | 'SELL';
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  asset?: string;
}

/**
 * Builds a beautiful premium structured Catalyst Telegram message format.
 */
export function buildCatalystSignalMessage(payload: CatalystSignalTelegramPayload): string {
  const dir = payload.direction;
  const dirBadge = dir === 'BUY' ? '🟢 BUY' : '🔴 SELL';
  const entryStr = payload.entry.toFixed(2);
  const slStr = payload.sl.toFixed(2);
  const tp1Str = payload.tp1.toFixed(2);
  const tp2Str = payload.tp2.toFixed(2);

  // Approximate pip distance (1 USD in Gold = 10 pips)
  const slPips = Math.round(Math.abs(payload.entry - payload.sl) * 10);
  const tp1Pips = Math.round(Math.abs(payload.tp1 - payload.entry) * 10);
  const tp2Pips = Math.round(Math.abs(payload.tp2 - payload.entry) * 10);

  return [
    `✨ *AURUM CATALYST • TRADE ALERT* ✨`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `${dirBadge}  |  *XAUUSD (GOLD)*`,
    ``,
    `📍 *Entry:* $${entryStr}`,
    `🛡️ *Stop Loss:* $${slStr} (-${slPips} pips)`,
    `🎯 *TP1 (Target 1):* $${tp1Str} (+${tp1Pips} pips)`,
    `🎯 *TP2 (Target 2):* $${tp2Str} (+${tp2Pips} pips)`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `⚖️ *Plan:* TP1: $7.00 (70 pips) | TP2: $11.00 (110 pips)`,
    `⏱️ *Validity:* 30-Minute Execution Window`,
    `Manage exactly ONE trade at a time.`
  ].join('\n');
}

export function buildCatalystLifecycleMessage(
  event: 'TP1_HIT' | 'TP2_HIT' | 'SL_HIT' | 'MISSED_ENTRY' | 'BREAK_EVEN',
  payload?: { direction?: 'BUY' | 'SELL'; entry?: number; price?: number }
): string {
  const dir = payload?.direction || 'BUY';
  const priceStr = payload?.price ? `$${payload.price.toFixed(2)}` : '';

  if (event === 'TP1_HIT') {
    return [
      `🎯 *CATALYST: TP1 HIT (+$7.00 / +70 pips) ✅*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `*XAUUSD (GOLD)* ${dir}`,
      priceStr ? `Live Price: ${priceStr}` : '',
      ``,
      `🛡️ *SL Moved to Break-Even (Risk-Free)*`,
      `💰 Secure 50% partial profit. Remaining runs to TP2!`,
      `━━━━━━━━━━━━━━━━━━━━━━`
    ].filter(Boolean).join('\n');
  }

  if (event === 'TP2_HIT') {
    return [
      `🎯🎯 *CATALYST: TP2 HIT (+$11.00 / +110 pips) 🚀*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `*XAUUSD (GOLD)* ${dir}`,
      priceStr ? `Live Price: ${priceStr}` : '',
      ``,
      `🏆 *Full Target achieved!* Trade completed successfully.`,
      `⏳ Cooldown active before next automated closed M30 scan.`,
      `━━━━━━━━━━━━━━━━━━━━━━`
    ].filter(Boolean).join('\n');
  }

  if (event === 'SL_HIT') {
    return [
      `🛑 *CATALYST: STOP LOSS HIT (-1R) ❌*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `*XAUUSD (GOLD)* ${dir}`,
      priceStr ? `Live Price: ${priceStr}` : '',
      ``,
      `Risk contained. Trade completed at Stop Loss.`,
      `⏳ Cooldown active before next automated closed M30 scan.`,
      `━━━━━━━━━━━━━━━━━━━━━━`
    ].filter(Boolean).join('\n');
  }

  if (event === 'MISSED_ENTRY') {
    return [
      `⚠️ *CATALYST: MISSED ENTRY ALERT*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `*XAUUSD (GOLD)* ${dir}`,
      ``,
      `Price moved away before activation. Setup expired.`,
      `Standing by for next closed M30 candle key level confirmation.`,
      `━━━━━━━━━━━━━━━━━━━━━━`
    ].join('\n');
  }

  return `*AURUM CATALYST — ${event}*`;
}

export async function dispatchCatalystTelegramSignal(
  payload: CatalystSignalTelegramPayload
): Promise<{ success: boolean; status: string; messageId?: number; error?: string }> {
  const messageText = buildCatalystSignalMessage(payload);
  const result = await sendRawTelegramMessage(messageText, undefined, undefined, undefined, 'Markdown');
  return {
    success: result.success,
    status: result.status,
    messageId: result.messageId,
    error: result.error
  };
}

export async function dispatchCatalystTelegramLifecycle(
  event: 'TP1_HIT' | 'TP2_HIT' | 'SL_HIT' | 'MISSED_ENTRY' | 'BREAK_EVEN',
  payload: { direction: 'BUY' | 'SELL'; entry: number; price?: number; replyToMessageId?: number }
): Promise<{ success: boolean; status: string; messageId?: number; error?: string }> {
  const messageText = buildCatalystLifecycleMessage(event, payload);
  const result = await sendRawTelegramMessage(messageText, undefined, undefined, payload.replyToMessageId, 'Markdown');
  return {
    success: result.success,
    status: result.status,
    messageId: result.messageId,
    error: result.error
  };
}

export function isCatalystTelegramConfigured(): boolean {
  const { botToken, chatId } = getTelegramCredentials();
  return !!(botToken && botToken.length > 5 && chatId && chatId.length > 1);
}
