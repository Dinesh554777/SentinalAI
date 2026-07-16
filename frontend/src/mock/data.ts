import { format, subDays, subHours, subMinutes } from 'date-fns';
import type { 
  User, Alert, Activity, RiskAnalysis, DashboardStats, 
  SecurityHealth, ThreatIntelligence, EnterpriseMetrics 
} from '@/types';

const now = new Date();

export const mockUsers: User[] = [
  {
    id: 'usr_1',
    name: 'Alice System',
    email: 'admin01@sentinel.bank',
    role: 'System Admin',
    department: 'IT Operations',
    location: 'New York, US',
    riskScore: 12,
    status: 'Active',
    lastLogin: subHours(now, 2).toISOString(),
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    mfaEnabled: true,
    recentDevices: ['MacBook Pro 16" (NY)', 'iPhone 14 Pro']
  },
  {
    id: 'usr_2',
    name: 'Bob Database',
    email: 'dba01@sentinel.bank',
    role: 'Database Administrator',
    department: 'Data Engineering',
    location: 'London, UK',
    riskScore: 28,
    status: 'Active',
    lastLogin: subMinutes(now, 45).toISOString(),
    avatar: 'https://i.pravatar.cc/150?u=a04258a2462d826712d',
    mfaEnabled: true,
    recentDevices: ['Dell XPS 15 (LDN)', 'Pixel 7']
  },
  {
    id: 'usr_3',
    name: 'Charlie Vendor',
    email: 'vendor01@sentinel.bank',
    role: 'Vendor',
    department: 'External',
    location: 'Moscow, RU',
    riskScore: 94,
    status: 'Suspended',
    lastLogin: subHours(now, 12).toISOString(),
    avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d',
    mfaEnabled: false,
    recentDevices: ['Unknown Windows PC (RU)', 'Unknown Linux Device']
  },
  {
    id: 'usr_4',
    name: 'David Support',
    email: 'support01@sentinel.bank',
    role: 'IT Support',
    department: 'Helpdesk',
    location: 'Austin, US',
    riskScore: 45,
    status: 'Active',
    lastLogin: subMinutes(now, 5).toISOString(),
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
    mfaEnabled: true,
    recentDevices: ['Lenovo ThinkPad (AUS)', 'iPad Pro']
  },
  {
    id: 'usr_5',
    name: 'Eve Analyst',
    email: 'soc01@sentinel.bank',
    role: 'SOC Analyst',
    department: 'Security',
    location: 'San Francisco, US',
    riskScore: 5,
    status: 'Active',
    lastLogin: subMinutes(now, 1).toISOString(),
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026302d',
    mfaEnabled: true,
    recentDevices: ['MacBook Air M2 (SF)']
  }
];

export const mockAlerts: Alert[] = [
  {
    id: 'alt_001',
    userId: 'usr_3',
    severity: 'Critical',
    description: 'Multiple failed logins followed by successful login from new geolocation, immediately accessing sensitive customer databases.',
    time: subMinutes(now, 15).toISOString(),
    status: 'Investigating',
    ruleTriggered: 'Impossible Travel & DB Access',
    mitreTechnique: 'T1078 - Valid Accounts',
    affectedSystems: ['Customer DB-01', 'Auth Service'],
    aiRecommendation: 'Suspend account immediately and enforce global password reset. Isolate Customer DB-01 network interface.',
    assignedAnalyst: 'Eve Analyst'
  },
  {
    id: 'alt_002',
    userId: 'usr_2',
    severity: 'High',
    description: 'Mass file download (4,500 files) detected from classified internal SharePoint outside normal working hours.',
    time: subHours(now, 2).toISOString(),
    status: 'Open',
    ruleTriggered: 'Mass Data Exfiltration Anomaly',
    mitreTechnique: 'T1048 - Exfiltration Over Alternative Protocol',
    affectedSystems: ['Internal SharePoint (Finance)'],
    aiRecommendation: 'Require step-up MFA challenge. If failed, block session.'
  },
  {
    id: 'alt_003',
    userId: 'usr_4',
    severity: 'Medium',
    description: 'Unusual PowerShell commands executed on an endpoint that rarely runs administrative scripts.',
    time: subHours(now, 5).toISOString(),
    status: 'Resolved',
    ruleTriggered: 'Suspicious PowerShell Execution',
    mitreTechnique: 'T1059.001 - PowerShell',
    affectedSystems: ['Endpoint-AUS-042'],
    aiRecommendation: 'Quarantine endpoint and run deep malware scan.'
  },
  {
    id: 'alt_004',
    userId: 'usr_1',
    severity: 'Low',
    description: 'Login from a new device (iPhone 14 Pro), but from a known geolocation.',
    time: subDays(now, 1).toISOString(),
    status: 'Ignored',
    ruleTriggered: 'New Device Registration',
    mitreTechnique: 'None',
    affectedSystems: ['Auth Service'],
    aiRecommendation: 'Send new device notification email to user.'
  }
];

export const mockActivities: Activity[] = [
  {
    id: 'act_001', userId: 'usr_3', action: 'Mass File Download', device: 'Unknown Windows PC', location: 'Moscow, RU', ipAddress: '185.17.203.44', filesDownloaded: 4300, commandsExecuted: 0, failedLogins: 0, riskScore: 94, time: subMinutes(now, 18).toISOString(), status: 'Success'
  },
  {
    id: 'act_002', userId: 'usr_3', action: 'Sensitive Database Access', device: 'Unknown Windows PC', location: 'Moscow, RU', ipAddress: '185.17.203.44', filesDownloaded: 0, commandsExecuted: 5, failedLogins: 0, riskScore: 85, time: subMinutes(now, 20).toISOString(), status: 'Success'
  },
  {
    id: 'act_003', userId: 'usr_3', action: 'Login Success', device: 'Unknown Windows PC', location: 'Moscow, RU', ipAddress: '185.17.203.44', filesDownloaded: 0, commandsExecuted: 0, failedLogins: 0, riskScore: 75, time: subMinutes(now, 22).toISOString(), status: 'Success'
  },
  {
    id: 'act_004', userId: 'usr_3', action: 'Login Failed', device: 'Unknown Windows PC', location: 'Moscow, RU', ipAddress: '185.17.203.44', filesDownloaded: 0, commandsExecuted: 0, failedLogins: 5, riskScore: 60, time: subMinutes(now, 25).toISOString(), status: 'Denied'
  },
  {
    id: 'act_005', userId: 'usr_1', action: 'Admin Command Executed', device: 'MacBook Pro 16"', location: 'New York, US', ipAddress: '192.168.1.55', filesDownloaded: 0, commandsExecuted: 1, failedLogins: 0, riskScore: 12, time: subHours(now, 1).toISOString(), status: 'Success'
  },
  {
    id: 'act_006', userId: 'usr_5', action: 'SOC Dashboard Access', device: 'MacBook Air M2', location: 'San Francisco, US', ipAddress: '10.0.0.14', filesDownloaded: 0, commandsExecuted: 0, failedLogins: 0, riskScore: 5, time: subMinutes(now, 5).toISOString(), status: 'Success'
  }
];

export const mockRiskAnalysis: Record<string, RiskAnalysis> = {
  'usr_3': {
    userId: 'usr_3',
    prediction: 'High',
    confidence: 0.98,
    reason: 'Anomalous login from a new country followed by immediate access to sensitive databases and mass file exfiltration. Behavior deviates 99% from the user\'s historical baseline.',
    recommendedAction: 'Automatically suspend account and isolate affected database instances.',
    topFactors: [
      { feature: 'Location Anomaly', impact: 45, description: 'Login from RU (historically US/UK only)' },
      { feature: 'Data Volume', impact: 35, description: '4,300 files downloaded (avg is 12/day)' },
      { feature: 'Failed Logins', impact: 15, description: '5 consecutive failed attempts prior to success' }
    ],
    trends: [
      { date: format(subDays(now, 6), 'MMM dd'), score: 12 },
      { date: format(subDays(now, 5), 'MMM dd'), score: 15 },
      { date: format(subDays(now, 4), 'MMM dd'), score: 14 },
      { date: format(subDays(now, 3), 'MMM dd'), score: 18 },
      { date: format(subDays(now, 2), 'MMM dd'), score: 12 },
      { date: format(subDays(now, 1), 'MMM dd'), score: 22 },
      { date: format(now, 'MMM dd'), score: 94 },
    ]
  },
  'usr_2': {
    userId: 'usr_2',
    prediction: 'Medium',
    confidence: 0.82,
    reason: 'User is downloading a large volume of files outside of their normal working hours.',
    recommendedAction: 'Require step-up MFA for further access.',
    topFactors: [
      { feature: 'Time Anomaly', impact: 60, description: 'Activity at 2:00 AM local time' },
      { feature: 'Data Volume', impact: 40, description: 'Large sequential downloads from SharePoint' }
    ],
    trends: [
      { date: format(subDays(now, 6), 'MMM dd'), score: 20 },
      { date: format(subDays(now, 5), 'MMM dd'), score: 18 },
      { date: format(subDays(now, 4), 'MMM dd'), score: 25 },
      { date: format(subDays(now, 3), 'MMM dd'), score: 22 },
      { date: format(subDays(now, 2), 'MMM dd'), score: 35 },
      { date: format(subDays(now, 1), 'MMM dd'), score: 45 },
      { date: format(now, 'MMM dd'), score: 68 },
    ]
  }
};

export const mockDashboardStats: DashboardStats = {
  totalUsers: 14502,
  activeSessions: 842,
  highRiskUsers: 14,
  todaysAlerts: 128,
  protectedServers: 3450,
  protectedEndpoints: 12800,
  connectedSensors: 45,
  threatLevel: 'Medium',
  aiStatus: 'Online'
};

export const mockSecurityHealth: SecurityHealth = {
  overallScore: 92,
  protectedAccounts: 98,
  openIncidents: 4,
  blockedThreats: 1450,
  mfaCoverage: 95,
  privilegedAccounts: 120,
  aiDetectionCoverage: 100
};

export const mockThreats: ThreatIntelligence[] = [
  { id: 'th_1', type: 'Credential Stuffing', severity: 'High', mitreTechnique: 'T1110', affectedUser: 'Multiple', status: 'Mitigated', time: subHours(now, 1).toISOString() },
  { id: 'th_2', type: 'Privilege Escalation', severity: 'Critical', mitreTechnique: 'T1068', affectedUser: 'Vendor01', status: 'Active', time: subMinutes(now, 15).toISOString() },
  { id: 'th_3', type: 'Impossible Travel', severity: 'High', mitreTechnique: 'T1078', affectedUser: 'Admin02', status: 'Investigating', time: subHours(now, 3).toISOString() },
  { id: 'th_4', type: 'Suspicious PowerShell', severity: 'Medium', mitreTechnique: 'T1059.001', affectedUser: 'Support04', status: 'Mitigated', time: subDays(now, 1).toISOString() },
  { id: 'th_5', type: 'Lateral Movement', severity: 'High', mitreTechnique: 'T1570', affectedUser: 'System Account', status: 'Active', time: subMinutes(now, 45).toISOString() },
];

export const mockEnterpriseMetrics: EnterpriseMetrics = {
  averageRiskScore: 18,
  openIncidents: 12,
  resolvedIncidents: 432,
  mttd: '4m 12s',
  mttr: '18m 45s',
  detectionAccuracy: 99.4,
  securityCoverage: 98.2
};
