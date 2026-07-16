import axios from 'axios';

// Base URL pointing to the FastAPI backend
const BASE_URL = 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token from localStorage to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sentinel_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -----------------------------------------------
// Auth API
// -----------------------------------------------
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data; // { access_token, role }
  },

  register: async (name: string, email: string, password: string, role: string) => {
    const response = await apiClient.post('/auth/register', { name, email, password, role });
    return response.data;
  },
};

// -----------------------------------------------
// Dashboard API
// -----------------------------------------------
export const dashboardApi = {
  getStats: async () => {
    const response = await apiClient.get('/dashboard');
    const data = response.data;
    // Map backend shape -> frontend DashboardStats shape
    return {
      totalUsers: data.total_users,
      activeSessions: data.total_logs,
      highRiskUsers: data.high_risk,
      todaysAlerts: data.high_risk,
      threatLevel: data.high_risk > 5 ? 'High' : data.medium_risk > 10 ? 'Medium' : 'Low',
      aiStatus: 'Online' as const,
    };
  },
};

// -----------------------------------------------
// Alerts API
// -----------------------------------------------
export const alertsApi = {
  getAlerts: async () => {
    const response = await apiClient.get('/alerts');
    // Map backend alerts to frontend Alert shape
    return response.data.map((a: {
      id: number; user: string; risk: string; time: string; status: string;
    }) => ({
      id: String(a.id),
      userId: a.user,
      severity: a.risk as 'Low' | 'Medium' | 'High',
      description: `${a.risk} risk activity detected for ${a.user}`,
      time: a.time,
      status: a.status === 'Active' ? 'Open' : 'Resolved',
      ruleTriggered: `${a.risk} Risk Threshold Exceeded`,
      mitreTechnique: 'T1078 - Valid Accounts',
    }));
  },

  acknowledgeAlert: async (id: string) => {
    const response = await apiClient.post(`/alerts/${id}/acknowledge`);
    return response.data;
  },
};

// -----------------------------------------------
// Users API
// -----------------------------------------------
export const usersApi = {
  getUsers: async () => {
    const response = await apiClient.get('/users');
    return response.data.map((u: { id: number; name: string; role: string }) => ({
      id: String(u.id),
      name: u.name,
      email: `${u.name.toLowerCase().replace(' ', '')}@bank.com`,
      role: u.role,
      department: 'Banking',
      location: 'HQ',
      riskScore: Math.floor(Math.random() * 100),
      status: 'Active' as const,
      lastLogin: new Date().toISOString(),
      avatar: '',
      mfaEnabled: true,
      recentDevices: ['Windows PC'],
    }));
  },

  getUserById: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    const u = response.data;
    return {
      id: String(u.id),
      name: u.name,
      email: u.email,
      role: u.role,
      department: 'Banking',
      location: 'HQ',
      riskScore: 50,
      status: 'Active' as const,
      lastLogin: new Date().toISOString(),
      avatar: '',
      mfaEnabled: true,
      recentDevices: ['Windows PC'],
    };
  },
};

// -----------------------------------------------
// Logs / Activity API
// -----------------------------------------------
export const logsApi = {
  getLogs: async () => {
    const response = await apiClient.get('/logs');
    return response.data.map((l: {
      id: number; user_id: number; risk: string; risk_score: number;
      files_downloaded: number; commands_executed: number; failed_logins: number;
      timestamp: string;
    }) => ({
      id: String(l.id),
      userId: String(l.user_id),
      action: `Session recorded - ${l.risk} risk`,
      device: 'Windows',
      location: 'Internal',
      ipAddress: '192.168.1.1',
      filesDownloaded: l.files_downloaded,
      commandsExecuted: l.commands_executed,
      failedLogins: l.failed_logins,
      riskScore: l.risk_score,
      time: l.timestamp,
      status: 'Success' as const,
    }));
  },

  getUserLogs: async (userId: string) => {
    const response = await apiClient.get(`/logs/${userId}`);
    return response.data;
  },

  storeLog: async (logData: {
    user_id: number;
    new_device: number;
    new_location: number;
    failed_logins: number;
    files_downloaded: number;
    commands_executed: number;
    login_hour: number;
    weekend: number;
  }) => {
    const response = await apiClient.post('/logs', logData);
    return response.data;
  },
};

// -----------------------------------------------
// ML Prediction API
// -----------------------------------------------
export const predictionApi = {
  predictRisk: async (data: {
    new_device: number;
    new_location: number;
    failed_logins: number;
    files_downloaded: number;
    commands_executed: number;
    login_hour: number;
    weekend: number;
  }) => {
    const response = await apiClient.post('/predict-risk', data);
    return response.data; // { risk, risk_score, reasons }
  },

  getFeatureImportance: async () => {
    const response = await apiClient.get('/feature-importance');
    return response.data;
  },
};

// -----------------------------------------------
// Reports API
// -----------------------------------------------
export const reportsApi = {
  getReport: async () => {
    const response = await apiClient.get('/reports');
    return response.data;
  },

  downloadReport: () => {
    window.open(`${BASE_URL}/reports/download`, '_blank');
  },
};

export default apiClient;
