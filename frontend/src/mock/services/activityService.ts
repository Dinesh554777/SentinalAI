import { mockActivities } from '../data';
import type { Activity } from '@/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const activityService = {
  getActivities: async (): Promise<Activity[]> => {
    await delay(700);
    return mockActivities;
  }
};
