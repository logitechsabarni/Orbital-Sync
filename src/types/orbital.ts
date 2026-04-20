export interface Satellite {
  id: string;
  name: string;
  orbit: number;
  angle: number;
  speed: number;
  status: 'stable' | 'warning' | 'danger' | 'maneuvering';
  country: string;
  distance?: number; // km
  timeToImpact?: number; // seconds
}

export interface Maneuver {
  id: string;
  satName: string;
  action: string;
  timestamp: string;
}

export interface Debris {
  id: string;
  name: string;
  orbit: number;
  angle: number;
  speed: number;
}

export interface GlobalStats {
  activeSatellites: number;
  highRiskTrajectories: number;
  congestionIndex: string;
  avgCollisionProb: string;
  orbitTemp: string;
  aiAccuracy: number;
  aiResponseTime: number;
  interventionsCount: number;
  scenario: 'nominal' | 'debris_storm' | 'solar_flare' | 'launch_window' | 'emergency';
}

export interface SimulationState {
  satellites: Satellite[];
  debris: Debris[];
  stats?: GlobalStats;
  log?: string;
  maneuvers?: Maneuver[];
  isAutoPilot?: boolean;
}
