import { mockDashboardStats, mockEnterpriseMetrics } from '../data';
import type { DashboardStats, EnterpriseMetrics } from '@/types';

// Simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    await delay(600);
    return mockDashboardStats;
  },
  
  getEnterpriseMetrics: async (): Promise<EnterpriseMetrics> => {
    await delay(700);
    return mockEnterpriseMetrics;
  }
};
