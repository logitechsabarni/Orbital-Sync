import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Satellite } from './src/types/orbital';

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  const PORT = 3000;

  // Simulation Logic
  let satellites: Satellite[] = [
    { id: 'S-001', name: 'Starlink-1', orbit: 1, angle: 0, speed: 0.1, status: 'stable', country: 'USA' },
    { id: 'S-002', name: 'GLONASS-K', orbit: 2, angle: 90, speed: 0.08, status: 'stable', country: 'RUS' },
    { id: 'S-003', name: 'Sentinel-2', orbit: 1, angle: 180, speed: 0.09, status: 'stable', country: 'ESA' },
    { id: 'S-004', name: 'Beidou-G3', orbit: 3, angle: 270, speed: 0.05, status: 'stable', country: 'CHN' },
    { id: 'S-005', name: 'Nova-Prime', orbit: 2, angle: 45, speed: 0.12, status: 'stable', country: 'USA' },
  ];

  let debris: any[] = [];
  let maneuvers: any[] = [];
  let isSimulationActive = true;
  let debrisActive = false;
  let isAutoPilot = true;
  let currentScenario: 'nominal' | 'debris_storm' | 'solar_flare' | 'launch_window' | 'emergency' = 'nominal';
  let interventionsCount = 142;

  const systemLogs = [
    "ADJUSTED INCLINATION TO RECOVER FROM MICRO-DEBRIS",
    "MANEUVER SUCCESS: STARLINK-1 EVASIVE BURN COMPLETE",
    "NOVA-PRIME SIGNAL LATENCY WITHIN NOMINAL BOUNDS",
    "ATMOSPHERIC DRAG COMPENSATION ACTIVE FOR LEO NODES",
    "THREAT NEUTRALIZED: DEBRIS-ALPHA PATH DIVERTED",
    "CONGESTION SPIKE DETECTED IN SECTOR-7",
    "EMERGENCY COOLING INITIATED ON BEIDOU-G3 HEAT-SHIELD"
  ];

  const generateGlobalStats = () => ({
    activeSatellites: 4527 + Math.floor(Math.random() * 20),
    highRiskTrajectories: Math.floor(Math.random() * 30) + (currentScenario === 'nominal' ? 5 : 45),
    congestionIndex: (currentScenario === 'nominal' ? 70 + Math.random() * 15 : 92 + Math.random() * 5).toFixed(1),
    avgCollisionProb: (currentScenario === 'nominal' ? 0.001 + Math.random() * 0.005 : 0.045 + Math.random() * 0.02).toFixed(3),
    orbitTemp: (8200 + Math.random() * 200).toFixed(0),
    aiAccuracy: 98.4 + (Math.random() * 1.5),
    aiResponseTime: 42 + Math.floor(Math.random() * 120),
    interventionsCount,
    scenario: currentScenario
  });

  setInterval(() => {
    if (!isSimulationActive) return;

    satellites = satellites.map(s => ({
      ...s,
      angle: (s.angle + s.speed) % 360,
    }));

    debris = debris.map(d => ({
      ...d,
      angle: (d.angle + d.speed) % 360,
    }));

    // Autopilot Auto-maneuver
    if (isAutoPilot) {
      satellites.forEach(s => {
        if (s.status === 'danger' && Math.random() > 0.95) {
          interventionsCount++;
          s.status = 'maneuvering';
          s.orbit += (Math.random() > 0.5 ? 0.2 : -0.2);
          maneuvers.push({
             id: `M-AUTO-${Date.now()}-${s.id}`,
             satName: s.name,
             action: "AI AUTO-PILOT: Evasive orbital shift executed",
             timestamp: new Date().toLocaleTimeString()
          });
          const satId = s.id;
          setTimeout(() => {
            const currentSat = satellites.find(node => node.id === satId);
            if (currentSat) currentSat.status = 'stable';
          }, 3000);
        }
      });
    }

    // Collision Detection & Telemetry
    let totalRiskPotential = 0;
    
    satellites.forEach(s => {
      let minDistance = 999;
      let minTime = 999;
      
      // Check vs Debris
      debris.forEach(d => {
        if (Math.abs(d.orbit - s.orbit) < 0.3) {
          const angleDiff = Math.abs(d.angle - s.angle);
          const dist = (angleDiff / 30) * 5; 
          if (dist < minDistance) minDistance = dist;
          if (dist < 10) {
             const time = dist / (Math.abs(s.speed - d.speed) * 10 || 1);
             if (time < minTime) minTime = time;
          }
        }
      });

      // Check vs Other Satellites
      satellites.forEach(other => {
        if (s.id === other.id) return;
        if (Math.abs(other.orbit - s.orbit) < 0.2) {
          const angleDiff = Math.abs(other.angle - s.angle);
          const dist = (angleDiff / 30) * 5;
          if (dist < minDistance) minDistance = dist;
          if (dist < 10) {
            const time = dist / (Math.abs(s.speed - other.speed) * 10 || 1);
            if (time < minTime) minTime = time;
          }
        }
      });

      if (s.status !== 'maneuvering') {
        if (minDistance < 1.5) {
          s.status = 'danger';
          s.distance = Number(minDistance.toFixed(2));
          s.timeToImpact = Math.max(1, Math.floor(minTime));
          totalRiskPotential += 10;
        } else if (minDistance < 6) {
          s.status = 'warning';
          s.distance = Number(minDistance.toFixed(2));
          s.timeToImpact = Math.max(1, Math.floor(minTime));
          totalRiskPotential += 2;
        } else {
          s.status = 'stable';
          s.distance = undefined;
          s.timeToImpact = undefined;
        }
      }
    });

    const scenarioLogs = {
      nominal: ["Nominal state projected for next 15 minutes.", "Checking vector intersection for Starlink constellation.", "Recursive pathfinding initiated...", "No critical failures in T+60 horizon."],
      debris_storm: ["CRITICAL: High-velocity fragment field detected.", "EMERGENCY: Recalculating all LEO trajectories.", "WARN: Kinetic impact probability > 42%.", "SHIELDING FAILURE: Sector 4G compromised."],
      solar_flare: ["WARN: EM disturbance spiking in upper atmosphere.", "ATMOSPHERIC DRAG index at critical high.", "GPS SIGNAL degradation detected in polar orbits.", "SOLAR STORM: IONIZING radiation interfering with node S-4."],
      launch_window: ["NEW NODE: Heavy-Lift-Alpha insertion sequence active.", "TRAJECTORY LOCK: Deploying Starlink-X batch.", "ORBITAL SLOT: LEO-34 capacity reaching limit.", "SYNC COMPLETE: New clusters registered."],
      emergency: ["CYBER THREAT: Unauthorized command attempt detected.", "HEARTBEAT FAILURE: Node lost in Shadow Zone.", "TOTAL RECALL: Constellation drift detected.", "ALPHA CLEAR: Countermeasures deployed."]
    };

    const currentLogs = scenarioLogs[currentScenario];
    const randomLog = currentLogs[Math.floor(Math.random() * currentLogs.length)];

    io.emit('state-update', { 
      satellites, 
      debris,
      maneuvers: maneuvers.slice(-5),
      stats: generateGlobalStats(),
      log: randomLog
    });
  }, 400); // Increased from 100ms to 400ms for stability

  io.on('connection', (socket) => {
    console.log('Client connected');
    socket.emit('initial-state', { satellites, debris, maneuvers: maneuvers.slice(-5) });

    socket.on('toggle-debris', (active: boolean) => {
      debrisActive = active;
      if (active) {
        debris = [
          { id: 'D-1', name: 'Bolt-88', orbit: 1.5, angle: Math.random() * 360, speed: 0.15 },
          { id: 'D-2', name: 'Panel-X', orbit: 2.5, angle: Math.random() * 360, speed: 0.1 },
          { id: 'D-3', name: 'Screw-Z', orbit: 1.0, angle: Math.random() * 360, speed: 0.12 },
          { id: 'D-4', name: 'Fragment-A', orbit: 1.2, angle: Math.random() * 360, speed: 0.18 },
        ];
      } else {
        debris = [];
      }
    });

    socket.on('emergency-maneuver', (satId: string) => {
      const sat = satellites.find(s => s.id === satId);
      if (sat) {
        sat.status = 'maneuvering' as any;
        const orbitShift = (Math.random() > 0.5 ? 0.35 : -0.35);
        sat.orbit += orbitShift;
        
        const maneuver = {
          id: `M-${Date.now()}`,
          satName: sat.name,
          action: orbitShift > 0 ? "Increased altitude to maximize safety margin" : "Lowered altitude to minimize collision risk",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        maneuvers.push(maneuver);

        setTimeout(() => {
          const currentSat = satellites.find(s => s.id === satId);
          if (currentSat) {
            currentSat.status = 'stable';
            io.emit('system-log', `MANEUVER SUCCESS: ${currentSat.name} ORBITAL STABILITY RECOVERED`);
          }
        }, 3500);
        io.emit('system-log', `MANUAL OVERRIDE: ${sat.name} EXECUTING VECTOR SHIFT`);
      }
    });

    socket.on('global-emergency-override', () => {
      satellites.forEach(sat => {
        if (sat.status !== 'stable') {
          sat.status = 'maneuvering' as any;
          sat.orbit += (Math.random() > 0.5 ? 0.4 : -0.4);
          
          maneuvers.push({
            id: `M-${Date.now()}-${sat.id}`,
            satName: sat.name,
            action: "Global emergency constellation shift executed",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          });

          const satId = sat.id;
          setTimeout(() => {
            const currentSat = satellites.find(node => node.id === satId);
            if (currentSat) currentSat.status = 'stable';
          }, 4000);
        }
      });
      io.emit('system-log', 'CRITICAL ALPHA: EXECUTING GLOBAL EMERGENCY CONSTELLATION SHIFT');
    });

    socket.on('signal-diagnostics', (satId: string) => {
      const sat = satellites.find(s => s.id === satId);
      if (sat) {
        const report = {
          snr: (98.4 - Math.random() * 5).toFixed(1),
          latency: (124 + Math.random() * 50).toFixed(0),
          temp: (32 + Math.random() * 8).toFixed(1),
          packetLoss: (Math.random() * 0.1).toFixed(3)
        };
        io.emit('system-log', `DIAGNOSTICS: ${sat.name} // SNR: ${report.snr}dB // LATENCY: ${report.latency}ms // TEMP: ${report.temp}°C // STATUS: OPTIMAL`);
      }
    });

    socket.on('set-autopilot', (enabled: boolean) => {
      isAutoPilot = enabled;
      io.emit('system-log', `AI AUTO-PILOT ${enabled ? 'ENABLED' : 'DISABLED'}`);
    });

    socket.on('update-scenario', (scenario: any) => {
      currentScenario = scenario;
      if (scenario === 'debris_storm') {
        debris = Array.from({ length: 15 }, (_, i) => ({
          id: `DS-${i}`, name: `Debris-${i}`, orbit: 1 + Math.random() * 2, angle: Math.random() * 360, speed: 0.12 + Math.random() * 0.1
        }));
      } else if (scenario === 'launch_window') {
        satellites.push({ id: `NEW-${Date.now()}`, name: 'Heavy-Lift-Alpha', orbit: 1, angle: 0, speed: 0.12, status: 'stable', country: 'USA' });
      }
      io.emit('system-log', `SCENARIO CHANGED: ${scenario.toUpperCase()}`);
    });

    socket.on('update-satellite', ({ id, orbit, speed }: any) => {
      const sat = satellites.find(s => s.id === id);
      if (sat) {
        if (orbit !== undefined) sat.orbit = orbit;
        if (speed !== undefined) sat.speed = speed;
        io.emit('system-log', `MANUAL PARAMETER SHIFT: ${sat.name}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'operational' });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
