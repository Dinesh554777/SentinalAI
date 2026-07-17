import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sentinel_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sentinel_token');
      localStorage.removeItem('sentinel_role');
      localStorage.removeItem('sentinel_user_id');
      localStorage.removeItem('sentinel_user_name');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (username: string, password: string) => {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data;
  },

  register: async (name: string, email: string, password: string, role: string) => {
    const response = await apiClient.post('/auth/register', { name, email, password, role });
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('sentinel_token');
      localStorage.removeItem('sentinel_role');
      localStorage.removeItem('sentinel_user_id');
      localStorage.removeItem('sentinel_user_name');
    }
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  getSessions: async () => {
    const response = await apiClient.get('/auth/sessions');
    return response.data;
  },

  revokeSession: async (sessionId: number) => {
    const response = await apiClient.delete(`/auth/sessions/${sessionId}`);
    return response.data;
  },

  revokeAllSessions: async () => {
    const response = await apiClient.post('/auth/sessions/revoke-all');
    return response.data;
  },
};

export const dashboardApi = {
  getStats: async () => {
    const response = await apiClient.get('/dashboard');
    const data = response.data;
    return {
      totalUsers: data.total_users,
      activeSessions: data.active_sessions,
      highRiskUsers: data.high_risk,
      todaysAlerts: data.high_risk,
      threatLevel: data.high_risk > 5 ? 'High' : data.medium_risk > 10 ? 'Medium' : 'Low',
      aiStatus: 'Online' as const,
    };
  },
};

export const alertsApi = {
  getAlerts: async () => {
    const response = await apiClient.get('/alerts');
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
      lastLogin: u.last_login || new Date().toISOString(),
      avatar: '',
      mfaEnabled: true,
      recentDevices: ['Windows PC'],
    };
  },
};

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
    return response.data;
  },

  getFeatureImportance: async () => {
    const response = await apiClient.get('/feature-importance');
    return response.data;
  },
};

export const reportsApi = {
  getReport: async () => {
    const response = await apiClient.get('/reports');
    return response.data;
  },

  downloadReport: () => {
    const token = localStorage.getItem('sentinel_token');
    window.open(`/api/reports/download?token=${token}`, '_blank');
  },
};

export default apiClient;
