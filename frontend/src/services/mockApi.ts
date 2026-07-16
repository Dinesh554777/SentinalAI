import type { User, Alert, Activity, RiskAnalysis, DashboardStats } from '../types';
import { subDays, subHours, subMinutes, format } from 'date-fns';

const now = new Date();

export const mockUsers: User[] = [
  { id: 'usr_1', name: 'Admin01', email: 'admin01@sentinel.bank', role: 'System Admin', department: 'IT Infrastructure', location: 'Chennai', riskScore: 15, status: 'Active', lastLogin: subHours(now, 2).toISOString(), avatar: 'https://i.pravatar.cc/150?u=admin01', mfaEnabled: true },
  { id: 'usr_2', name: 'DBA02', email: 'dba02@sentinel.bank', role: 'Database Administrator', department: 'Data Services', location: 'Mumbai', riskScore: 45, status: 'Active', lastLogin: subHours(now, 5).toISOString(), avatar: 'https://i.pravatar.cc/150?u=dba02', mfaEnabled: true },
  { id: 'usr_3', name: 'Vendor01', email: 'vendor01@external.com', role: 'Vendor', department: 'Third-Party', location: 'Delhi', riskScore: 92, status: 'Active', lastLogin: subMinutes(now, 15).toISOString(), avatar: 'https://i.pravatar.cc/150?u=vendor01', mfaEnabled: false },
  { id: 'usr_4', name: 'ITSupport01', email: 'itsupport01@sentinel.bank', role: 'IT Support', department: 'Helpdesk', location: 'Bangalore', riskScore: 25, status: 'Active', lastLogin: subHours(now, 1).toISOString(), avatar: 'https://i.pravatar.cc/150?u=itsupport01', mfaEnabled: true },
  { id: 'usr_5', name: 'SOC01', email: 'soc01@sentinel.bank', role: 'SOC Analyst', department: 'Security', location: 'Chennai', riskScore: 5, status: 'Active', lastLogin: subMinutes(now, 5).toISOString(), avatar: 'https://i.pravatar.cc/150?u=soc01', mfaEnabled: true },
  { id: 'usr_6', name: 'Contractor01', email: 'contractor01@external.com', role: 'Contractor', department: 'Development', location: 'Remote', riskScore: 78, status: 'Suspended', lastLogin: subDays(now, 2).toISOString(), avatar: 'https://i.pravatar.cc/150?u=contractor01', mfaEnabled: false },
];

export const mockAlerts: Alert[] = [
  { id: 'alt_1', userId: 'usr_3', severity: 'High', description: 'Multiple failed logins followed by successful login from new IP.', time: subMinutes(now, 20).toISOString(), status: 'Open', ruleTriggered: 'Impossible Travel & Brute Force' },
  { id: 'alt_2', userId: 'usr_2', severity: 'Medium', description: 'Large volume of data exported from secure database.', time: subHours(now, 1).toISOString(), status: 'Investigating', ruleTriggered: 'Data Exfiltration Anomaly' },
  { id: 'alt_3', userId: 'usr_4', severity: 'Low', description: 'Login outside normal working hours.', time: subHours(now, 8).toISOString(), status: 'Resolved', ruleTriggered: 'Off-hours Access' },
  { id: 'alt_4', userId: 'usr_6', severity: 'High', description: 'Unauthorized access attempt to critical infrastructure.', time: subDays(now, 1).toISOString(), status: 'Ignored', ruleTriggered: 'Access Control Violation' },
  { id: 'alt_5', userId: 'usr_1', severity: 'Low', description: 'Password reset requested.', time: subDays(now, 2).toISOString(), status: 'Resolved', ruleTriggered: 'Credential Modification' },
];

export const mockActivities: Activity[] = [
  { id: 'act_1', userId: 'usr_3', action: 'Login Attempt', device: 'Windows', location: 'Delhi', ipAddress: '192.168.1.105', filesDownloaded: 0, commandsExecuted: 0, failedLogins: 5, riskScore: 90, time: subMinutes(now, 22).toISOString(), status: 'Failed' },
  { id: 'act_2', userId: 'usr_3', action: 'Login Success', device: 'Windows', location: 'Delhi', ipAddress: '192.168.1.105', filesDownloaded: 0, commandsExecuted: 0, failedLogins: 0, riskScore: 92, time: subMinutes(now, 20).toISOString(), status: 'Success' },
  { id: 'act_3', userId: 'usr_2', action: 'Database Query (Bulk Export)', device: 'Mac', location: 'Mumbai', ipAddress: '10.0.0.45', filesDownloaded: 120, commandsExecuted: 15, failedLogins: 0, riskScore: 45, time: subHours(now, 1).toISOString(), status: 'Success' },
  { id: 'act_4', userId: 'usr_1', action: 'Firewall Config Update', device: 'Linux', location: 'Chennai', ipAddress: '10.0.0.2', filesDownloaded: 0, commandsExecuted: 3, failedLogins: 0, riskScore: 15, time: subHours(now, 2).toISOString(), status: 'Success' },
  { id: 'act_5', userId: 'usr_4', action: 'Active Directory Sync', device: 'Windows', location: 'Bangalore', ipAddress: '10.0.0.88', filesDownloaded: 0, commandsExecuted: 1, failedLogins: 0, riskScore: 25, time: subHours(now, 8).toISOString(), status: 'Success' },
];

export const mockDashboardStats: DashboardStats = {
  totalUsers: 1450,
  activeSessions: 124,
  highRiskUsers: 12,
  todaysAlerts: 45,
};

export const mockRiskAnalysis: Record<string, RiskAnalysis> = {
  'usr_3': {
    userId: 'usr_3',
    prediction: 'High',
    confidence: 0.94,
    reason: 'Anomalous login pattern (5 failed attempts) followed by access from an unrecognized device/IP. Historical baseline indicates this vendor does not typically access during these hours.',
    recommendedAction: 'Suspend account immediately and enforce MFA reset. Audit all accessed files in the last hour.',
    trends: [
      { date: format(subDays(now, 6), 'MMM dd'), score: 12 },
      { date: format(subDays(now, 5), 'MMM dd'), score: 15 },
      { date: format(subDays(now, 4), 'MMM dd'), score: 14 },
      { date: format(subDays(now, 3), 'MMM dd'), score: 18 },
      { date: format(subDays(now, 2), 'MMM dd'), score: 25 },
      { date: format(subDays(now, 1), 'MMM dd'), score: 40 },
      { date: format(now, 'MMM dd'), score: 92 },
    ]
  },
  'usr_2': {
    userId: 'usr_2',
    prediction: 'Medium',
    confidence: 0.72,
    reason: 'Unusually large data export detected. While the user is a DBA, the volume exceeds their 30-day moving average by 400%.',
    recommendedAction: 'Verify business justification for data export. Monitor for subsequent external data transfers.',
    trends: [
      { date: format(subDays(now, 6), 'MMM dd'), score: 10 },
      { date: format(subDays(now, 5), 'MMM dd'), score: 11 },
      { date: format(subDays(now, 4), 'MMM dd'), score: 9 },
      { date: format(subDays(now, 3), 'MMM dd'), score: 10 },
      { date: format(subDays(now, 2), 'MMM dd'), score: 12 },
      { date: format(subDays(now, 1), 'MMM dd'), score: 15 },
      { date: format(now, 'MMM dd'), score: 45 },
    ]
  }
};

// API Mock Delays to simulate network
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
  getDashboard: async () => {
    await delay(600);
    return mockDashboardStats;
  },
  getUsers: async () => {
    await delay(500);
    return mockUsers;
  },
  getUser: async (id: string) => {
    await delay(300);
    return mockUsers.find(u => u.id === id);
  },
  getActivities: async () => {
    await delay(700);
    return mockActivities;
  },
  getAlerts: async () => {
    await delay(500);
    return mockAlerts;
  },
  getRiskAnalysis: async (userId?: string) => {
    await delay(800);
    if (userId) return mockRiskAnalysis[userId];
    return mockRiskAnalysis['usr_3']; // default to highest risk for general dashboard
  }
};
