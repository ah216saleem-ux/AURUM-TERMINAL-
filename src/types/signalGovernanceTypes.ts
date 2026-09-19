export type SignalGovernanceStatus = 'APPROVED' | 'WAIT' | 'BLOCKED';

export type SignalLifecycleStage = 
  | 'GENERATED'
  | 'VALIDATED'
  | 'APPROVED'
  | 'ACTIVE'
  | 'TP1_HIT'
  | 'TP2_HIT'
  | 'SL_HIT'
  | 'EXPIRED';

export type SignalTradingMode = 'SCALPING' | 'INTRADAY' | 'SWING';

export type SignalRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ApprovalGateCheck {
  name: string;
  passed: boolean;
  value: string;
  detail: string;
}

export interface SignalApprovalGates {
  marketRegime: ApprovalGateCheck;
  engineRecommendation: ApprovalGateCheck;
  aiValidation: ApprovalGateCheck;
  riskLevel: ApprovalGateCheck;
  newsStatus: ApprovalGateCheck;
  qualityScore: ApprovalGateCheck;
  exposureLimits: ApprovalGateCheck;
}

export interface AdminAuditPayload {
  gannAlignment: string;
  smcConfirmation: string;
  liquidityAnalysis: string;
  aiAgreement: string;
  marketRegime: string;
  riskCalculations: {
    rrRatio: string;
    riskDollars: string;
    lotSize: string;
    maxLossR: string;
  };
  historicalComparison: string;
}

export interface PortfolioRiskState {
  openPositionsCount: number;
  maxOpenPositions: number;
  correlatedExposure: {
    usdPairs: number;
    metals: number;
    indices: number;
    energy: number;
  };
  consecutiveLosses: number;
  maxConsecutiveLosses: number;
  currentDrawdownPercent: number;
  maxDrawdownPercent: number;
  riskLimitsReached: boolean;
  limitViolationReason?: string;
}

export interface GovernedSignal {
  id: string;
  assetId: string;
  symbol: string;
  assetName: string;
  direction: 'BUY' | 'SELL';
  entryZone: string;
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  timeframe: string;
  tradingMode: SignalTradingMode;
  confidence: number;
  riskLevel: SignalRiskLevel;
  status: SignalGovernanceStatus;
  statusLabel: string;
  lifecycleStage: SignalLifecycleStage;
  lifecycleStageLabel: string;
  qualityScore: number;
  approvalGates: SignalApprovalGates;
  allGatesPassed: boolean;
  blockedReason?: string;
  waitReason?: string;
  adminAudit: AdminAuditPayload;
  formattedOutput: string;
  timestamp: number;
  currentPrice: number;
  pnlR?: number;
}
