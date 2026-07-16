import { mockUsers } from '../data';
import type { User } from '@/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const userService = {
  getUsers: async (): Promise<User[]> => {
    await delay(700);
    return mockUsers;
  },

  getUserById: async (id: string): Promise<User | undefined> => {
    await delay(400);
    return mockUsers.find(u => u.id === id);
  }
};
