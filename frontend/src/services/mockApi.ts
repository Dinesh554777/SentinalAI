import { 
  dashboardService, 
  userService, 
  alertService, 
  activityService, 
  riskAnalysisService 
} from '../mock/services';

// Re-exporting as `api` to maintain backwards compatibility with existing hooks
export const api = {
  getDashboard: dashboardService.getStats,
  getUsers: userService.getUsers,
  getUser: userService.getUserById,
  getAlerts: alertService.getAlerts,
  getActivities: activityService.getActivities,
  getRiskAnalysis: riskAnalysisService.getAnalysisByUserId
};
