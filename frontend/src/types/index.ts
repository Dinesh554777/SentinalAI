export type RiskLevel = 'Low' | 'Medium' | 'High';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';
export type AlertSeverity = 'Low' | 'Medium' | 'High';
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
}

export interface Alert {
  id: string;
  userId: string;
  severity: AlertSeverity;
  description: string;
  time: string;
  status: AlertStatus;
  ruleTriggered: string;
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

export interface RiskAnalysis {
  userId: string;
  prediction: RiskLevel;
  confidence: number;
  reason: string;
  recommendedAction: string;
  trends: RiskTrend[];
}

export interface DashboardStats {
  totalUsers: number;
  activeSessions: number;
  highRiskUsers: number;
  todaysAlerts: number;
}
