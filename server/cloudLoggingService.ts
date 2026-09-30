/**
 * AURUM TERMINAL — GOOGLE CLOUD STRUCTURED LOGGING & TELEMETRY SERVICE
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const CLOUD_LOGS_FILE = path.join(DATA_DIR, 'catalyst_cloud_logs.json');

export type CloudLogSeverity = 'DEFAULT' | 'DEBUG' | 'INFO' | 'NOTICE' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface GoogleCloudStructuredLog {
  timestamp: string;
  severity: CloudLogSeverity;
  component: 'CATALYST_ENGINE' | 'LIVE_FEED' | 'TELEGRAM_BOT' | 'RISK_SYSTEM' | 'PWA_NOTIFICATIONS' | 'WEBSOCKET_STREAM';
  message: string;
  latencyMs?: number;
  metadata?: Record<string, any>;
  httpRequest?: {
    requestMethod: string;
    requestUrl: string;
    status: number;
    latency: string;
  };
}

let cloudLogs: GoogleCloudStructuredLog[] = [];

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {}
}

export function loadCloudLogs(): void {
  ensureDataDir();
  try {
    if (fs.existsSync(CLOUD_LOGS_FILE)) {
      const raw = fs.readFileSync(CLOUD_LOGS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        cloudLogs = parsed.slice(0, 300);
      }
    }
  } catch {}
}

export function logCloudTelemetry(
  severity: CloudLogSeverity,
  component: GoogleCloudStructuredLog['component'],
  message: string,
  latencyMs?: number,
  metadata?: Record<string, any>
): void {
  ensureDataDir();
  const entry: GoogleCloudStructuredLog = {
    timestamp: new Date().toISOString(),
    severity,
    component,
    message,
    latencyMs,
    metadata
  };

  // Print structured JSON format for GCP Cloud Logging stdout
  console.log(JSON.stringify(entry));

  cloudLogs.unshift(entry);
  if (cloudLogs.length > 300) {
    cloudLogs = cloudLogs.slice(0, 300);
  }

  try {
    fs.writeFileSync(CLOUD_LOGS_FILE, JSON.stringify(cloudLogs, null, 2), 'utf-8');
  } catch {}
}

export function getCloudLogs(limit = 100): GoogleCloudStructuredLog[] {
  return cloudLogs.slice(0, limit);
}

// Initial load
loadCloudLogs();
