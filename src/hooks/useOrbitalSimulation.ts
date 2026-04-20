import { useEffect, useState, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { SimulationState } from '../types/orbital';

export function useOrbitalSimulation() {
  const [state, setState] = useState<SimulationState>({ 
    satellites: [], 
    debris: [],
    maneuvers: [],
    stats: {
      activeSatellites: 0,
      highRiskTrajectories: 0,
      congestionIndex: "0.0",
      avgCollisionProb: "0.000",
      orbitTemp: "0",
      aiAccuracy: 0,
      aiResponseTime: 0,
      interventionsCount: 0,
      scenario: 'nominal'
    },
    isAutoPilot: true
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('initial-state', (data: SimulationState) => {
      setState(prev => ({ ...prev, ...data }));
    });

    newSocket.on('state-update', (data: SimulationState) => {
      setState(prev => ({ ...prev, ...data }));
      if (data.log) {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${data.log!}`, ...prev].slice(0, 50));
      }
    });

    newSocket.on('system-log', (msg: string) => {
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const toggleDebris = useCallback((active: boolean) => {
    socket?.emit('toggle-debris', active);
  }, [socket]);

  const triggerManeuver = useCallback((satId: string) => {
    socket?.emit('emergency-maneuver', satId);
  }, [socket]);

  const triggerGlobalOverride = useCallback(() => {
    socket?.emit('global-emergency-override');
  }, [socket]);

  const runDiagnostics = useCallback((satId: string) => {
    socket?.emit('signal-diagnostics', satId);
  }, [socket]);

  const setAutoPilot = useCallback((enabled: boolean) => {
    socket?.emit('set-autopilot', enabled);
  }, [socket]);

  const updateScenario = useCallback((scenario: string) => {
    socket?.emit('update-scenario', scenario);
  }, [socket]);

  const updateSatellite = useCallback((params: { id: string, orbit?: number, speed?: number }) => {
    socket?.emit('update-satellite', params);
  }, [socket]);

  return useMemo(() => ({ 
    state, 
    logs, 
    toggleDebris, 
    triggerManeuver, 
    triggerGlobalOverride, 
    runDiagnostics,
    setAutoPilot,
    updateScenario,
    updateSatellite
  }), [state, logs, toggleDebris, triggerManeuver, triggerGlobalOverride, runDiagnostics, setAutoPilot, updateScenario, updateSatellite]);
}
