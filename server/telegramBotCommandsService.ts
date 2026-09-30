/**
 * AURUM TERMINAL — 2-WAY INTERACTIVE TELEGRAM BOT COMMANDS SERVICE
 * 
 * Commands Supported:
 * - /status  : Live XAU/USD spot price, Catalyst status, active trade details, feed status.
 * - /stats   : Today's win rate, TP1 hits, TP2 hits, SL hits, and risk lock state.
 * - /trades  : Latest 5 closed forward-validation trade outcomes.
 * - /pause   : (Admin Only) Triggers Emergency Pause.
 * - /resume  : (Admin Only) Runs Master Safety Gate and resumes operations if safe.
 * - /help    : Lists all available commands.
 */

import { getTelegramCredentials, sendRawTelegramMessage } from './phaseXTelegramService';
import { getCatalystPublicState } from './catalystBackgroundScanner';
import { getCatalystDailyState, getCatalystCompletedTrades } from './catalystRiskService';
import { getCatalystHealthSummary } from './catalystValidationHealthService';
import { pauseCatalystEmergency, resumeCatalystEmergency } from './catalystOperationsService';

let lastUpdateId = 0;
let isPollingActive = false;
let pollingIntervalId: NodeJS.Timeout | null = null;

export async function processTelegramBotCommand(text: string, fromChatId: string): Promise<string> {
  const cmd = text.trim().split(' ')[0].toLowerCase();
  const creds = getTelegramCredentials();
  const isAdmin = String(fromChatId) === String(creds.chatId);

  if (cmd === '/status' || cmd === '/status@aurum_bot') {
    const state = getCatalystPublicState();
    const health = getCatalystHealthSummary();

    let msg = [
      `🌟 *AURUM CATALYST STATUS* 🌟`,
      ``,
      `*Asset:* GOLD / XAUUSD`,
      `*Live Price:* $${state.livePrice.toFixed(2)}`,
      `*Status:* \`${state.status}\``,
      `*Feed Status:* ${state.feedStatus} (${state.tickAgeSeconds}s age)`,
      `*System Health:* ${health.overallSystemStatus}`,
      ``
    ];

    if (state.signal) {
      msg.push(
        `*ACTIVE SIGNAL:* ${state.signal.direction}`,
        `• Entry: $${state.signal.entry}`,
        `• SL: $${state.signal.sl}`,
        `• TP1: $${state.signal.tp1}`,
        `• TP2: $${state.signal.tp2}`
      );
    } else {
      msg.push(`_No active trade. Scanning closed M30 setups._`);
    }

    return msg.join('\n');
  }

  if (cmd === '/stats' || cmd === '/stats@aurum_bot') {
    const daily = getCatalystDailyState();
    const health = getCatalystHealthSummary();
    const resolved = daily.tp2HitsToday + daily.slHitsToday;
    const winRate = resolved > 0 ? +((daily.tp2HitsToday / resolved) * 100).toFixed(1) : 0;

    return [
      `📊 *AURUM CATALYST TODAY STATS*`,
      ``,
      `*Date (UTC):* ${daily.dateStr}`,
      `*Signals Today:* ${daily.signalsCreatedToday} / ${health.risk.maxDailySignals}`,
      `*TP1 Hits:* ${daily.tp1HitsToday}`,
      `*TP2 Hits:* ${daily.tp2HitsToday}`,
      `*SL Hits:* ${daily.slHitsToday} / ${health.risk.maxDailySlTrades}`,
      `*Missed Entries:* ${daily.missedEntriesToday}`,
      `*Today Win Rate:* ${winRate}%`,
      `*Risk Status:* \`${daily.riskStatus}\``,
      `*Consecutive SL:* ${daily.consecutiveSlCount}`
    ].join('\n');
  }

  if (cmd === '/trades' || cmd === '/trades@aurum_bot') {
    const trades = getCatalystCompletedTrades(5);
    if (trades.length === 0) {
      return `📜 *AURUM CATALYST RECENT TRADES*\n\n_No forward-validation trades completed yet._`;
    }

    let msg = [`📜 *RECENT CATALYST FORWARD TRADES*`, ``];
    for (const t of trades) {
      msg.push(
        `• *${t.direction} @ $${t.entry.toFixed(2)}* → \`${t.finalOutcome}\` (${t.pnlDistance > 0 ? '+' : ''}${t.pnlDistance.toFixed(2)})`
      );
    }
    return msg.join('\n');
  }

  if (cmd === '/pause' || cmd === '/pause@aurum_bot') {
    if (!isAdmin) {
      return `🛑 *ACCESS DENIED:* Only authorized admin chat can trigger emergency pause.`;
    }
    const state = pauseCatalystEmergency('Emergency Pause triggered via Telegram Command /pause');
    return `🚨 *EMERGENCY PAUSE ACTIVATED VIA TELEGRAM*\n\nNew signal creation halted immediately. Active trade monitoring preserved.\nStatus: \`${state.productionStatus}\``;
  }

  if (cmd === '/resume' || cmd === '/resume@aurum_bot') {
    if (!isAdmin) {
      return `🛑 *ACCESS DENIED:* Only authorized admin chat can trigger operations resume.`;
    }
    const res = resumeCatalystEmergency();
    if (res.success) {
      return `✅ *CATALYST OPERATIONS RESUMED VIA TELEGRAM*\n\nMaster safety gate passed. Live scanning reactivated.`;
    } else {
      return `⚠️ *CANNOT RESUME:* ${res.message}`;
    }
  }

  if (cmd === '/help' || cmd === '/help@aurum_bot' || cmd === '/start') {
    return [
      `🤖 *AURUM CATALYST TELEGRAM COMMANDS*`,
      ``,
      `/status - Live spot price, Catalyst state & active trade`,
      `/stats - Today's signals, TP1/TP2 hits & win rate`,
      `/trades - Last 5 forward-validation completed trades`,
      `/pause - (Admin) Trigger Emergency Pause`,
      `/resume - (Admin) Run Safety Check & Resume`,
      `/help - View command list`
    ].join('\n');
  }

  return `❓ Unknown command \`${cmd}\`. Send /help for available commands.`;
}

export async function pollTelegramBotUpdates(): Promise<void> {
  const creds = getTelegramCredentials();
  if (!creds.botToken || creds.botToken.length < 10) return;

  try {
    const url = `https://api.telegram.org/bot${creds.botToken}/getUpdates?offset=${lastUpdateId + 1}&timeout=2`;
    const res = await fetch(url, { method: 'GET' });

    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          lastUpdateId = update.update_id;
          const msg = update.message || update.edited_message;
          if (msg && msg.text && msg.text.startsWith('/')) {
            const chatId = String(msg.chat.id);
            const reply = await processTelegramBotCommand(msg.text, chatId);
            await sendRawTelegramMessage(reply);
          }
        }
      }
    }
  } catch (err) {
    // Graceful poll failure logging
  }
}

export function startTelegramBotPolling(): void {
  if (isPollingActive) return;
  isPollingActive = true;

  pollingIntervalId = setInterval(() => {
    pollTelegramBotUpdates().catch(() => {});
  }, 3500);

  console.log('[TelegramBot] Aurum Catalyst 2-Way Interactive Telegram Bot Command Listener started.');
}

export function stopTelegramBotPolling(): void {
  if (pollingIntervalId) clearInterval(pollingIntervalId);
  pollingIntervalId = null;
  isPollingActive = false;
}
