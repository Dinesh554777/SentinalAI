import { dashboardApi, alertsApi, usersApi, logsApi, predictionApi } from './api';

// Central API export used by all pages/components
export const api = {
  getDashboard: dashboardApi.getStats,
  getUsers: usersApi.getUsers,
  getUser: usersApi.getUserById,
  getAlerts: alertsApi.getAlerts,
  getActivities: logsApi.getLogs,
  getRiskAnalysis: async (userId: string) => {
    // Fetch logs for user and predict risk
    const logs = await logsApi.getUserLogs(userId);
    const latest = logs[0];
    if (!latest) return null;

    const prediction = await predictionApi.predictRisk({
      new_device: latest.new_device,
      new_location: latest.new_location,
      failed_logins: latest.failed_logins,
      files_downloaded: latest.files_downloaded,
      commands_executed: latest.commands_executed,
      login_hour: latest.login_hour,
      weekend: latest.weekend_login,
    });

    // Build trend data from user's logs
    const trends = logs.slice(0, 7).map((l: { timestamp: string; risk_score: number }) => ({
      date: new Date(l.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: l.risk_score,
    }));

    return {
      userId,
      prediction: prediction.risk,
      confidence: prediction.risk_score,
      reason: prediction.reasons.join(', '),
      recommendedAction: prediction.risk === 'High'
        ? 'Immediately review and block this user session'
        : prediction.risk === 'Medium'
        ? 'Require additional verification'
        : 'Continue monitoring',
      trends,
    };
  },
};

