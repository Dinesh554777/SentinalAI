import { dashboardApi, alertsApi, usersApi, logsApi, predictionApi } from './api';
import type { AIReason } from '@/types';

const FEATURE_LABELS: Record<string, string> = {
  files_downloaded: 'File Downloads',
  commands_executed: 'Command Volume',
  failed_logins: 'Failed Logins',
  new_location: 'Location Anomaly',
  new_device: 'Device Anomaly',
  session_duration: 'Session Duration',
  login_hour: 'Time Anomaly',
  weekend_login: 'Weekend Access',
};

export const api = {
  getDashboard: dashboardApi.getStats,
  getUsers: usersApi.getUsers,
  getUser: usersApi.getUserById,
  getAlerts: alertsApi.getAlerts,
  getActivities: logsApi.getLogs,
  getRecentLogs: logsApi.getRecentLogs,
  getRiskAnalysis: async (userId: string) => {
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
      session_duration: latest.session_duration ?? 30,
    });

    const trends = logs.slice(0, 7).map((l: { timestamp: string; risk_score: number }) => ({
      date: new Date(l.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: l.risk_score,
    }));

    const topFactors: AIReason[] = prediction.reasons.map((reason: string, i: number) => {
      const featureKey = Object.keys(FEATURE_LABELS).find(
        k => reason.toLowerCase().includes(k.replace('_', ' '))
      ) || Object.keys(FEATURE_LABELS)[0];
      return {
        feature: FEATURE_LABELS[featureKey] || reason.split(' ')[0],
        impact: Math.round((1 - i * 0.15) * 100 * (prediction.confidence || 0.5)),
        description: reason,
      };
    });

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
      topFactors,
      featureImportance: prediction.feature_importance,
    };
  },
};
