import { mockRiskAnalysis } from '../data';
import type { RiskAnalysis } from '@/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const riskAnalysisService = {
  getAnalysisByUserId: async (userId: string): Promise<RiskAnalysis | undefined> => {
    await delay(1000);
    return mockRiskAnalysis[userId];
  }
};
