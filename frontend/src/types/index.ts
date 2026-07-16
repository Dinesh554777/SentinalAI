export type RiskLevel = 'Low' | 'Medium' | 'High';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';
export type AlertSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type AlertStatus = 'Open' | 'Investigating' | 'Resolved' | 'Ignored';
export type Role = 'System Admin' | 'Database Administrator' | 'IT Support' | 'Vendor' | 'Contractor' | 'SOC Analyst';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  location: string;
  riskScore: number;
  status: UserStatus;
  lastLogin: string;
  avatar: string;
  mfaEnabled: boolean;
  recentDevices: string[];
}

export interface Alert {
  id: string;
  userId: string;
  severity: AlertSeverity;
  description: string;
  time: string;
  status: AlertStatus;
  ruleTriggered: string;
  mitreTechnique?: string;
  affectedSystems?: string[];
  aiRecommendation?: string;
  assignedAnalyst?: string;
}

export interface Activity {
  id: string;
  userId: string;
  action: string;
  device: string;
  location: string;
  ipAddress: string;
  filesDownloaded: number;
  commandsExecuted: number;
  failedLogins: number;
  riskScore: number;
  time: string;
  status: 'Success' | 'Failed' | 'Denied';
}

export interface RiskTrend {
  date: string;
  score: number;
}

export interface AIReason {
  feature: string;
  impact: number;
  description: string;
}

export interface RiskAnalysis {
  userId: string;
  prediction: RiskLevel;
  confidence: number;
  reason: string;
  recommendedAction: string;
  trends: RiskTrend[];
  topFactors?: AIReason[];
}

export interface DashboardStats {
  totalUsers: number;
  activeSessions: number;
  highRiskUsers: number;
  todaysAlerts: number;
  protectedServers?: number;
  protectedEndpoints?: number;
  connectedSensors?: number;
  threatLevel?: RiskLevel;
  aiStatus?: 'Online' | 'Degraded' | 'Offline';
}

export interface SecurityHealth {
  overallScore: number;
  protectedAccounts: number;
  openIncidents: number;
  blockedThreats: number;
  mfaCoverage: number;
  privilegedAccounts: number;
  aiDetectionCoverage: number;
}

export interface ThreatIntelligence {
  id: string;
  type: string;
  severity: AlertSeverity;
  mitreTechnique: string;
  affectedUser: string;
  status: 'Mitigated' | 'Active' | 'Investigating';
  time: string;
}

export interface EnterpriseMetrics {
  averageRiskScore: number;
  openIncidents: number;
  resolvedIncidents: number;
  mttd: string; // Mean time to detect
  mttr: string; // Mean time to respond
  detectionAccuracy: number;
  securityCoverage: number;
}

export interface SimulationEvent {
  id: string;
  type: 'Login' | 'Action' | 'Alert' | 'Block';
  description: string;
  time: string;
  riskDelta?: number;
  isMalicious?: boolean;
}
