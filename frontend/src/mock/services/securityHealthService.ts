import { mockSecurityHealth } from '../data';
import type { SecurityHealth } from '@/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const securityHealthService = {
  getHealth: async (): Promise<SecurityHealth> => {
    await delay(500);
    return mockSecurityHealth;
  }
};
