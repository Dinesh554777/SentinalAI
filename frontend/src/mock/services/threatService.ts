import { mockThreats } from '../data';
import type { ThreatIntelligence } from '@/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const threatService = {
  getLatestThreats: async (): Promise<ThreatIntelligence[]> => {
    await delay(600);
    return mockThreats;
  }
};
