import { mockAlerts } from '../data';
import type { Alert } from '@/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const alertService = {
  getAlerts: async (): Promise<Alert[]> => {
    await delay(800);
    return mockAlerts;
  },

  getAlertById: async (id: string): Promise<Alert | undefined> => {
    await delay(500);
    return mockAlerts.find(a => a.id === id);
  }
};
