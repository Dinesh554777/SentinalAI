import type { SimulationEvent } from '@/types';

// The simulation service doesn't need static mock data because it generates a live stream.
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const simulationService = {
  // A generator or a streaming response simulation could go here.
  // For the UI, we can just return a sequence of events that the UI will stagger.
  getSimulationSequence: async (): Promise<SimulationEvent[]> => {
    await delay(500);
    return [
      { id: 'sim_1', type: 'Login', description: 'User Login (Valid Credentials)', time: new Date().toISOString(), riskDelta: +2 },
      { id: 'sim_2', type: 'Action', description: 'New Device Registration (Unknown OS)', time: new Date().toISOString(), riskDelta: +15 },
      { id: 'sim_3', type: 'Action', description: 'New Location (Outside working bounds)', time: new Date().toISOString(), riskDelta: +25 },
      { id: 'sim_4', type: 'Action', description: 'Multiple Failed Logins on DB-01', time: new Date().toISOString(), riskDelta: +18, isMalicious: true },
      { id: 'sim_5', type: 'Action', description: 'Sensitive Database Access (Success)', time: new Date().toISOString(), riskDelta: +20, isMalicious: true },
      { id: 'sim_6', type: 'Action', description: 'Mass File Download (4,500 files)', time: new Date().toISOString(), riskDelta: +35, isMalicious: true },
      { id: 'sim_7', type: 'Alert', description: 'AI Detection: Insider Threat Profile matched', time: new Date().toISOString() },
      { id: 'sim_8', type: 'Block', description: 'Automatic Account Block Executed', time: new Date().toISOString() }
    ];
  }
};
