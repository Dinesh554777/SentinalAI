import { useQuery } from "@tanstack/react-query";
import { dashboardApi, alertsApi, usersApi, logsApi, predictionApi, reportsApi } from "@/services/api";
import { dashboardService, securityHealthService, threatService } from "@/mock/services";

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
