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
 * Builds the required simple Catalyst Telegram message format:
 * 
 * AURUM CATALYST
 * 
 * GOLD — BUY / SELL
 * 
 * Entry: XXXX
 * SL: XXXX
 * TP1: XXXX
 * TP2: XXXX
 */
export function buildCatalystSignalMessage(payload: CatalystSignalTelegramPayload): string {
  const dir = payload.direction;
  const entryStr = payload.entry.toFixed(2);
  const slStr = payload.sl.toFixed(2);
  const tp1Str = payload.tp1.toFixed(2);
  const tp2Str = payload.tp2.toFixed(2);

  return [
    `AURUM CATALYST`,
    ``,
    `GOLD — ${dir}`,
    ``,
    `Entry: ${entryStr}`,
    `SL: ${slStr}`,
    `TP1: ${tp1Str}`,
    `TP2: ${tp2Str}`
  ].join('\n');
}

export function buildCatalystLifecycleMessage(
  event: 'TP1_HIT' | 'TP2_HIT' | 'SL_HIT' | 'MISSED_ENTRY' | 'BREAK_EVEN',
  payload?: { direction?: 'BUY' | 'SELL'; entry?: number; price?: number }
): string {
  if (event === 'TP1_HIT') {
    return [
      `AURUM CATALYST`,
      ``,
      `TP1 HIT ✅`,
      `SL moved to Entry.`
    ].join('\n');
  }

  if (event === 'TP2_HIT') {
    return [
      `AURUM CATALYST`,
      ``,
      `TP2 HIT ✅`,
      `Trade Complete.`
    ].join('\n');
  }

  if (event === 'SL_HIT') {
    return [
      `AURUM CATALYST`,
      ``,
      `SL HIT ❌`,
      `Trade Complete.`
    ].join('\n');
  }

  if (event === 'MISSED_ENTRY') {
    return [
      `AURUM CATALYST`,
      ``,
      `MISSED ENTRY ⚠️`,
      `Price moved away before entry. Standby.`
    ].join('\n');
  }

  return `AURUM CATALYST — ${event}`;
}

export async function dispatchCatalystTelegramSignal(
  payload: CatalystSignalTelegramPayload
): Promise<{ success: boolean; status: string; messageId?: number; error?: string }> {
  const messageText = buildCatalystSignalMessage(payload);
  const result = await sendRawTelegramMessage(messageText);
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
  const result = await sendRawTelegramMessage(messageText, undefined, undefined, payload.replyToMessageId);
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
