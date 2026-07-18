import { useQuery } from "@tanstack/react-query";
import { dashboardApi, alertsApi, usersApi, logsApi, predictionApi, reportsApi } from "@/services/api";
import { dashboardService, securityHealthService, threatService } from "@/mock/services";
import type { AIReason } from "@/types";

function buildTopFactors(data: {
  new_device: number; new_location: number; failed_logins: number;
  files_downloaded: number; commands_executed: number; login_hour: number; weekend: number;
}, risk: string): AIReason[] {
  const factors: AIReason[] = [];
  if (data.new_device) factors.push({ feature: 'New Device', impact: 35, description: 'Login from an unrecognized device increases risk significantly' });
  if (data.new_location) factors.push({ feature: 'New Location', impact: 30, description: 'Login from an unfamiliar geographic location' });
  if (data.failed_logins >= 3) factors.push({ feature: 'Failed Logins', impact: 25, description: `${data.failed_logins} failed login attempts detected` });
  if (data.files_downloaded > 1000) factors.push({ feature: 'File Downloads', impact: 40, description: `${data.files_downloaded} files downloaded - unusual volume` });
  if (data.commands_executed > 30) factors.push({ feature: 'Command Volume', impact: 20, description: `${data.commands_executed} commands executed in session` });
  if (data.login_hour < 5 || data.login_hour >= 22) factors.push({ feature: 'Unusual Hours', impact: 15, description: `Activity at ${data.login_hour}:00 outside business hours` });
  if (data.weekend) factors.push({ feature: 'Weekend Access', impact: 10, description: 'Activity on weekend indicates off-schedule behavior' });
  if (factors.length === 0 && risk === 'High') factors.push({ feature: 'Pattern Anomaly', impact: 50, description: 'AI detected abnormal behavioral patterns' });
  return factors.sort((a, b) => b.impact - a.impact);
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: dashboardApi.getStats,
  });
}

export function useRecentAlerts() {
  return useQuery({
    queryKey: ["recentAlerts"],
    queryFn: alertsApi.getAlerts,
  });
}

export function useRiskAnalysis(userId: string) {
  return useQuery({
    queryKey: ["riskAnalysis", userId],
    queryFn: async () => {
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

      const trends = logs.slice(0, 7).map((l: { timestamp: string; risk_score: number }) => ({
        date: new Date(l.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        score: l.risk_score,
      }));

      return {
        userId,
        prediction: prediction.risk,
        confidence: prediction.risk_score,
        reason: prediction.reasons.join(", "),
        recommendedAction:
          prediction.risk === "High"
            ? "Immediately review and block this user session"
            : prediction.risk === "Medium"
            ? "Require additional verification"
            : "Continue monitoring",
        trends,
        topFactors: buildTopFactors({
          new_device: latest.new_device,
          new_location: latest.new_location,
          failed_logins: latest.failed_logins,
          files_downloaded: latest.files_downloaded,
          commands_executed: latest.commands_executed,
          login_hour: latest.login_hour,
          weekend: latest.weekend_login,
        }, prediction.risk),
      };
    },
    enabled: !!userId,
  });
}

export function useEnterpriseMetrics() {
  return useQuery({
    queryKey: ["enterpriseMetrics"],
    queryFn: dashboardService.getEnterpriseMetrics,
  });
}

export function useSecurityHealth() {
  return useQuery({
    queryKey: ["securityHealth"],
    queryFn: securityHealthService.getHealth,
  });
}

export function useThreats() {
  return useQuery({
    queryKey: ["threats"],
    queryFn: threatService.getLatestThreats,
  });
}

export function useActivities() {
  return useQuery({
    queryKey: ["activities"],
    queryFn: logsApi.getLogs,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: usersApi.getUsers,
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => usersApi.getUserById(id!),
    enabled: !!id,
  });
}

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: alertsApi.getAlerts,
  });
}

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: reportsApi.getReport,
  });
}
