import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useOrbitalSimulation } from './hooks/useOrbitalSimulation';
import { OrbitalMap } from './components/OrbitalMap';
import { AIAssistant } from './components/AIAssistant';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { 
  Globe, Radar, ShieldAlert, Cpu, 
  BarChart3, Settings, Database, 
  Activity, Radio, AlertCircle,
  Zap, Trash2, AlertTriangle, ShieldCheck, Search
} from 'lucide-react';
import { Satellite } from './types/orbital';
import { cn } from './lib/utils';
import { ControlTab } from './components/ControlTab';
import { SimulationTab } from './components/SimulationTab';

export default function App() {
  const { 
    state, 
    logs, 
    toggleDebris, 
    triggerManeuver, 
    triggerGlobalOverride, 
    runDiagnostics,
    setAutoPilot,
    updateScenario,
    updateSatellite
  } = useOrbitalSimulation();
  const [activeTab, setActiveTab] = useState<'overview' | 'control' | 'analytics' | 'simulation' | 'ai'>('overview');
  const [selectedSatId, setSelectedSatId] = useState<string | null>(null);
  const [debrisActive, setDebrisActive] = useState(false);
  const [notification, setNotification] = useState<{ msg: string, type: 'info' | 'warn' | 'success' } | null>(null);
  const operatorId = "OP_8235";

  // Derive the active selected satellite from the state array
  const activeSelectedSat = React.useMemo(() => {
    return state.satellites.find(s => s.id === selectedSatId) || null;
  }, [state.satellites, selectedSatId]);

  const lastProcessedLogRef = React.useRef<string>("");

  // Effect to handle notifications from logs
  React.useEffect(() => {
    if (logs.length > 0) {
      const lastLog = logs[0];
      // Extract the message part to avoid re-triggering on timestamp changes only
      const msgPart = lastLog.split(']')[1]?.trim() || "";
      
      if (msgPart !== lastProcessedLogRef.current && (msgPart.includes('MANUAL OVERRIDE') || msgPart.includes('DIAGNOSTICS') || msgPart.includes('SUCCESS'))) {
        lastProcessedLogRef.current = msgPart;
        setNotification({ 
          msg: msgPart, 
          type: msgPart.includes('DIAGNOSTICS') ? 'info' : 'success' 
        });
        const timer = setTimeout(() => {
          setNotification(null);
          // We reset the ref only after a while if we want to allow the same message again later, 
          // but for now keeping it cached is safer to prevent loops.
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [logs]);

  const handleToggleDebris = () => {
    const newState = !debrisActive;
    setDebrisActive(newState);
    toggleDebris(newState);
  };

  return (
    <div className="flex h-screen bg-[#02040a] text-zinc-100 font-mono selection:bg-cyan-500/30 overflow-hidden">
      {/* Side Navigation Rail */}
      <nav className="w-16 flex flex-col items-center py-6 border-r border-[#00f3ff]/20 bg-[#0a0f1e]/70 backdrop-blur-xl z-50">
        <div className="w-10 h-10 rounded-lg bg-[#0a0f1e] border border-cyan-400/30 flex items-center justify-center mb-12 shadow-[0_0_15px_rgba(34,211,238,0.2)] neon-border">
          <Globe className="text-cyan-400 w-6 h-6 neon-text" />
        </div>
        
        <div className="flex-1 flex flex-col gap-8">
          <NavIcon icon={Radar} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" />
          <NavIcon icon={Activity} active={activeTab === 'control'} onClick={() => setActiveTab('control')} label="Monitoring" />
          <NavIcon icon={BarChart3} active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} label="Analytics" />
          <NavIcon icon={Database} active={activeTab === 'simulation'} onClick={() => setActiveTab('simulation')} label="Simulation" />
          <NavIcon icon={Cpu} active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} label="AI Assistant" />
        </div>

        <NavIcon icon={Settings} active={false} onClick={() => {}} label="Settings" />
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Global Tactical Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div 
               initial={{ opacity: 0, y: 50, x: 50 }}
               animate={{ opacity: 1, y: 0, x: 0 }}
               exit={{ opacity: 0, y: 50, x: 50 }}
               className="absolute bottom-8 right-8 z-[100] min-w-[360px]"
            >
               <div className={cn(
                 "p-4 glass-panel border shadow-[0_0_30px_rgba(34,211,238,0.15)] rounded-xl flex items-center gap-4 bg-[#0a0f1e]/95 backdrop-blur-2xl",
                 notification.type === 'success' ? 'border-cyan-400/50' : 'border-emerald-400/50'
               )}>
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg",
                    notification.type === 'success' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                  )}>
                    {notification.type === 'success' ? <Zap className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                     <div className="text-[10px] font-black opacity-50 uppercase tracking-[0.2em] mb-1">Tactical Update</div>
                     <div className="text-xs font-bold text-white tracking-widest leading-tight">{notification.msg}</div>
                  </div>
                  <button onClick={() => setNotification(null)} className="p-2 -mr-2 text-white/20 hover:text-white transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Bar */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-cyan-400/10 bg-[#0a0f1e]/40 backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
            <h1 className="font-mono text-xl font-bold tracking-tighter text-cyan-400 neon-text">ORBITAL<span className="text-zinc-100">SYNC</span></h1>
            <div className="h-4 w-px bg-cyan-400/20" />
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse glow-emerald" />
              SYSTEM_READY // NODES_ACTIVE: {state.satellites.length}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-cyan-400/50 uppercase tracking-widest">Global Status</span>
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-bold text-emerald-400">OPERATOR: ACTIVE</span>
                 <div className="flex gap-1">
                    <div className="w-4 h-1 bg-cyan-400" />
                    <div className="w-4 h-1 bg-cyan-400" />
                    <div className="w-4 h-1 bg-white/20" />
                 </div>
              </div>
            </div>
            <button 
              onClick={triggerGlobalOverride}
              className="px-6 py-2 bg-pink-500/10 border border-pink-500/50 text-pink-500 font-black text-xs tracking-widest rounded flex items-center justify-center gap-2 hover:bg-pink-500/20 transition-all uppercase shadow-[0_0_15px_#ec489920]"
            >
              Emergency Override
            </button>
          </div>
        </header>

        {/* Content Workspace */}
        <div className="flex-1 flex overflow-hidden p-6 gap-6">
          {activeTab === 'analytics' ? (
            <section className="flex-1 overflow-y-auto scroll-hide">
               <AnalyticsPanel satellites={state.satellites} stats={state.stats} />
            </section>
          ) : activeTab === 'control' ? (
             <section className="flex-1 overflow-hidden">
                <ControlTab 
                  satellites={state.satellites}
                  selectedSat={activeSelectedSat}
                  setSelectedSat={(sat) => setSelectedSatId(sat?.id || null)}
                  triggerManeuver={triggerManeuver}
                  runDiagnostics={runDiagnostics}
                  updateSatellite={updateSatellite}
                  logs={logs}
                />
             </section>
          ) : activeTab === 'simulation' ? (
             <section className="flex-1 overflow-hidden">
                <SimulationTab 
                  stats={state.stats}
                  updateScenario={updateScenario}
                  setAutoPilot={setAutoPilot}
                  isAutoPilot={state.isAutoPilot}
                  logs={logs}
                />
             </section>
          ) : activeTab === 'ai' ? (
             <section className="flex-1 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(0,243,255,0.05)_0%,transparent_70%)]">
                <div className="w-full h-full max-w-2xl"><AIAssistant satellites={state.satellites} /></div>
             </section>
          ) : (
            <>
              {/* Left Column: Map & Console */}
              <div className="flex-1 flex flex-col gap-6">
                {/* Stats Ribbon */}
                <div className="grid grid-cols-5 gap-4">
                  <MonitorStat 
                    label="Active Satellites" 
                    value={state.stats?.activeSatellites || 4527} 
                    delta={state.stats?.activeSatellites ? (state.stats.activeSatellites > 4500 ? "↑" : "↓") : "+2"} 
                  />
                  <MonitorStat 
                    label="High-Risk Trajectories" 
                    value={state.stats?.highRiskTrajectories || 28} 
                    delta={state.stats?.highRiskTrajectories && state.stats.highRiskTrajectories > 40 ? "CRITICAL" : "STABLE"} 
                    color={state.stats?.highRiskTrajectories && state.stats.highRiskTrajectories > 40 ? "text-pink-500 animate-pulse" : "text-pink-500"} 
                  />
                  <MonitorStat 
                    label="Orbit Congestion Index" 
                    value={`${state.stats?.congestionIndex || "76.5"}%`} 
                    delta={state.stats?.congestionIndex && parseFloat(state.stats.congestionIndex) > 80 ? "↑ HIGH" : "NOMINAL"} 
                  />
                  <MonitorStat 
                    label="Avg Collision Prob" 
                    value={`${(parseFloat(state.stats?.avgCollisionProb || '0') * 100).toFixed(3)}%`} 
                    delta="SCANNING" 
                    color="text-orange-400" 
                  />
                  <MonitorStat 
                    label="System Status" 
                    value={state.stats?.congestionIndex && parseFloat(state.stats.congestionIndex) > 90 ? "CRITICAL" : "STABLE"} 
                    delta="AI_ACTIVE" 
                    color={state.stats?.congestionIndex && parseFloat(state.stats.congestionIndex) > 90 ? "text-pink-500" : "text-emerald-400"} 
                  />
                </div>

                {/* Map Area */}
                <div className="flex-1 relative glass-panel rounded-2xl overflow-hidden border-cyan-400/10">
                   <OrbitalMap satellites={state.satellites} debris={state.debris} onSelect={(sat) => setSelectedSatId(sat.id)} stats={state.stats} selectedSatId={selectedSatId} />
                   
                   {/* Overlay: Imminent Collision */}
                   <AnimatePresence>
                     {state.satellites.some(s => s.status === 'danger') && (
                       <motion.div 
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: 20 }}
                         className="absolute bottom-8 right-8 w-64 glass-panel border-pink-500/50 p-4 rounded-xl bg-pink-500/5 backdrop-blur-md z-30"
                       >
                         <div className="flex items-center gap-3 mb-2">
                            <ShieldAlert className="w-5 h-5 text-pink-500 animate-pulse" />
                            <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Imminent Collision</span>
                         </div>
                         {state.satellites.filter(s => s.status === 'danger').slice(0, 1).map(s => (
                           <div key={s.id}>
                              <div className="text-xs font-bold text-white mb-1">{s.name}</div>
                              <div className="flex justify-between text-[9px] font-mono text-pink-400/70">
                                 <span>{s.distance} km</span>
                                 <span>IN {s.timeToImpact}s</span>
                              </div>
                           </div>
                         ))}
                       </motion.div>
                     )}
                   </AnimatePresence>

                   {/* Status Console Overlay (Bottom Left) */}
                   <div className="absolute bottom-8 left-8 flex gap-4">
                      <div className="glass-panel p-4 rounded-xl border-white/5 bg-black/40 backdrop-blur-md">
                         <span className="text-[8px] font-bold text-gray-500 uppercase mb-2 block">Orbital Status Console</span>
                         <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                               <span className="text-[9px] text-pink-500 font-black">THREAT LEVEL</span>
                               <span className="text-xl font-black text-pink-500 neon-text">HIGH</span>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="flex flex-col">
                               <span className="text-[9px] text-gray-500">CONGESTED ORBITS</span>
                               <span className="text-xl font-bold flex items-center gap-2">9 <span className="w-2 h-2 rounded-full bg-orange-500" /></span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Right Column: Alerts, Logs & Mini Charts */}
              <div className="w-96 flex flex-col gap-6">
                 {/* Collision Alerts */}
                 <div className="glass-panel rounded-2xl flex flex-col border-cyan-400/10 h-1/3 p-5 overflow-hidden">
                    <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                       <span>Collision Alerts</span>
                       <span className="text-[8px] opacity-40 font-mono">SEQ_08235 // REC</span>
                    </h3>
                    <div className="flex-1 overflow-y-auto scroll-hide space-y-2">
                       {state.satellites.filter(s => s.status !== 'stable').map(s => (
                         <div key={s.id} className={cn("p-3 rounded-lg border flex items-center justify-between", s.status === 'danger' ? 'bg-pink-500/10 border-pink-500/30' : 'bg-yellow-500/5 border-yellow-500/20')}>
                             <div className="flex items-center gap-3">
                                <Radar className={cn("w-4 h-4", s.status === 'danger' ? 'text-pink-500' : 'text-yellow-400')} />
                                <div className="flex flex-col">
                                   <span className="text-[11px] font-bold">{s.name}</span>
                                   <span className="text-[8px] opacity-50 font-mono uppercase">{s.id}</span>
                                </div>
                             </div>
                             <div className="flex flex-col items-end">
                                <span className={cn("text-[9px] font-black", s.status === 'danger' ? 'text-pink-400' : 'text-yellow-400')}>{s.distance} km</span>
                                <span className="text-[8px] opacity-40 font-mono">IN {s.timeToImpact}s</span>
                             </div>
                         </div>
                       ))}
                       {state.satellites.filter(s => s.status !== 'stable').length === 0 && (
                         <div className="h-full flex flex-col items-center justify-center opacity-20 py-8">
                            <ShieldCheck className="w-8 h-8 mb-2" />
                            <span className="text-[10px] font-black">ALL CLEAR</span>
                         </div>
                       )}
                    </div>
                 </div>

                 {/* Maneuver Log */}
                 <div className="glass-panel rounded-2xl flex flex-col border-cyan-400/10 h-1/3 p-5 overflow-hidden">
                    <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4">Maneuver Log</h3>
                    <div className="flex-1 overflow-y-auto scroll-hide space-y-3">
                       {state.maneuvers?.map(m => (
                         <div key={m.id} className="flex gap-3 border-b border-white/5 pb-3">
                            <div className="w-8 h-8 rounded bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20 text-cyan-400 shrink-0">
                               <Zap className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                               <div className="flex justify-between items-baseline mb-0.5">
                                  <span className="text-[10px] font-bold text-zinc-200">{m.satName}</span>
                                  <span className="text-[8px] text-gray-500 font-mono">{m.timestamp}</span>
                               </div>
                               <p className="text-[9px] text-gray-400 leading-tight">{m.action}</p>
                            </div>
                         </div>
                       ))}
                       {(!state.maneuvers || state.maneuvers.length === 0) && (
                         <div className="flex-1 flex flex-col items-center justify-center opacity-10">
                            <Activity className="w-8 h-8" />
                         </div>
                       )}
                    </div>
                 </div>

                 {/* Mini Density Map / Inspector Integration */}
                 <div className="flex-1 glass-panel rounded-2xl p-5 border-cyan-400/10 overflow-hidden relative">
                    {activeSelectedSat ? (
                       <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                          <div className="flex justify-between items-start mb-4">
                             <div>
                                <h4 className="text-cyan-400 font-black text-lg">{activeSelectedSat.name}</h4>
                                <span className="text-[9px] text-gray-500 uppercase">{activeSelectedSat.id} // {activeSelectedSat.country}</span>
                             </div>
                             <button onClick={() => setSelectedSatId(null)} className="text-gray-600 hover:text-white transition-colors">×</button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 mb-6">
                             <div className="p-2 rounded bg-white/5 border border-white/5">
                                <span className="text-[8px] text-gray-500 uppercase block mb-1">Status</span>
                                <span className={cn("text-[10px] font-black", activeSelectedSat.status === 'danger' ? 'text-pink-500' : 'text-emerald-400')}>{activeSelectedSat.status.toUpperCase()}</span>
                             </div>
                             <div className="p-2 rounded bg-white/5 border border-white/5">
                                <span className="text-[8px] text-gray-500 uppercase block mb-1">Velocity</span>
                                <span className="text-[10px] font-black text-cyan-400">{(activeSelectedSat.speed * 7.5).toFixed(2)} km/s</span>
                             </div>
                          </div>

                          <div className="mt-auto space-y-2">
                             <button 
                                onClick={() => triggerManeuver(activeSelectedSat.id)}
                                disabled={activeSelectedSat.status === 'maneuvering'}
                                className="w-full py-2 bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 text-[10px] font-black rounded hover:bg-cyan-500/30 transition-all uppercase"
                             >
                                Execute Shift
                             </button>
                             <button 
                                onClick={() => runDiagnostics(activeSelectedSat.id)}
                                className="w-full py-2 border border-white/10 text-gray-400 text-[10px] font-black rounded hover:bg-white/5 transition-all uppercase"
                             >
                                Signal Diagnostics
                             </button>
                          </div>
                       </div>
                    ) : (
                       <div className="h-full flex flex-col">
                          <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4">Orbit Density Monitor</h3>
                          <div className="flex-1 flex items-center justify-center p-4">
                             {/* Mini chart here */}
                             <div className="flex items-end h-24 gap-1.5 w-full">
                                {[30, 60, 45, 90, 70, 40, 85, 50, 100, 65, 80, 40, 75].map((h, i) => (
                                   <div key={i} className="flex-1 rounded-t-sm transition-all duration-1000" style={{ height: `${h}%`, backgroundColor: `rgba(34, 211, 238, ${0.1 + (i / 15)})` }} />
                                ))}
                             </div>
                          </div>
                          <div className="flex justify-between text-[8px] text-gray-600 font-mono mt-4">
                             <span>LEO</span>
                             <span>MEO</span>
                             <span>GEO</span>
                          </div>
                       </div>
                    )}
                 </div>
              </div>
            </>
          )}
        </div>
        {/* Bottom Status Strip */}
        <div className="h-8 border-t border-cyan-400/10 bg-black/80 flex items-center px-6 justify-between shrink-0 select-none">
           <div className="flex gap-6 items-center">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                 <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">System_Online</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-2">
                 <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Active_Nodes:</span>
                 <span className="text-[9px] font-mono text-cyan-400">{state.satellites.length}</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                 <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">AI_Buffer:</span>
                 <span className="text-[9px] font-mono text-zinc-400">{state.isAutoPilot ? 'AUTOPILOT_ENGAGED' : 'MANUAL_CONTROL'}</span>
              </div>
           </div>
           
           <div className="flex-1 max-w-xl mx-12 overflow-hidden relative">
              <div className="flex gap-8 animate-[marquee_20s_linear_infinite] whitespace-nowrap">
                 {logs.slice(-5).map((log, i) => (
                    <span key={i} className="text-[9px] font-mono text-gray-500 uppercase">
                       <span className="text-cyan-400/50">{log.split(']')[0]}]</span> 
                       {log.split(']')[1]}
                    </span>
                 ))}
              </div>
              <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black to-transparent" />
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black to-transparent" />
           </div>

           <div className="flex gap-4 items-center">
              <div className="text-[9px] font-mono text-gray-600">LATENCY: 14ms</div>
              <div className="text-[9px] font-mono text-cyan-400/50 uppercase">OPERATOR: {operatorId}</div>
           </div>
        </div>

        <style>{`
           @keyframes marquee {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
           }
        `}</style>
      </main>

      {/* Scanline Overlay */}
      <div className="scan-line" />
    </div>
  );
}

interface NavIconProps {
  key?: React.Key;
  icon: any;
  active: boolean;
  onClick: () => void;
  label: string;
}

function MonitorStat({ label, value, delta, color = "text-cyan-400" }: { label: string, value: string | number, delta: string, color?: string }) {
  return (
    <div className="glass-panel p-4 rounded-xl flex flex-col items-start gap-1">
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className={cn("text-xl font-black neon-text", color)}>{value}</span>
        <span className="text-[9px] text-gray-600 font-mono tracking-tighter">{delta}</span>
      </div>
    </div>
  );
}

function NavIcon({ icon: Icon, active, onClick, label }: NavIconProps) {
  return (
    <div className="relative group">
      <button 
        onClick={onClick}
        className={cn(
          "p-3 rounded-xl transition-all duration-300 relative",
          active ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/40" : "text-gray-500 hover:text-cyan-400 hover:bg-white/5"
        )}
      >
        <Icon className={cn("w-5 h-5", active && "neon-text")} />
        {active && (
          <motion.div 
            layoutId="nav-active"
            className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_10px_#22d3ee] neon-border"
          />
        )}
      </button>
      <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-2 py-1 glass-panel text-cyan-400 text-[10px] font-mono rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
        {label}
      </div>
    </div>
  );
}

interface SatelliteCardProps {
  key?: React.Key;
  sat: Satellite;
  selected: boolean;
  onClick: () => void;
}

function SatelliteCard({ sat, selected, onClick }: SatelliteCardProps) {
  const isManeuvering = sat.status === 'maneuvering';
  const statusColor = (isManeuvering ? 'text-emerald-400' : sat.status === 'stable' ? 'text-cyan-400' : sat.status === 'warning' ? 'text-yellow-400' : 'text-pink-400');
  const bgColor = (isManeuvering ? 'bg-emerald-500/10' : sat.status === 'stable' ? 'bg-cyan-500/5' : sat.status === 'warning' ? 'bg-yellow-500/5' : 'bg-pink-500/5');

  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-3 rounded border cursor-pointer transition-all active:scale-[0.98] flex flex-col gap-2 group relative overflow-hidden",
        selected ? "bg-cyan-500/20 border-cyan-400/50" : `${bgColor} border-white/5`,
        isManeuvering && "animate-pulse"
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className={cn("text-[11px] font-black uppercase tracking-tighter", statusColor)}>{sat.name}</span>
          <span className="text-[9px] opacity-40 uppercase font-mono">{sat.id} • {sat.country}</span>
        </div>
        <div className={cn("px-1.5 py-0.5 rounded-sm text-[8px] font-black uppercase border", 
          isManeuvering ? 'border-emerald-400/30 text-emerald-400' : sat.status === 'stable' ? 'border-cyan-400/30 text-cyan-400' : sat.status === 'warning' ? 'border-yellow-400/30 text-yellow-400' : 'border-pink-500/30 text-pink-400'
        )}>
          {sat.status}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-2">
        <div className="text-[8px] font-mono text-cyan-400/60 uppercase">V:{(sat.speed * 7.5).toFixed(2)}km/s</div>
        <div className="text-[8px] font-mono text-emerald-400/60 uppercase">A:{(sat.orbit * 400).toFixed(0)}km</div>
      </div>
      {isManeuvering && <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />}
      {selected && <div className="absolute right-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />}
    </div>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  icon: any;
}

function Toggle({ label, checked, onChange, icon: Icon }: ToggleProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded">
      <div className="flex items-center gap-3">
        <Icon className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#e2e8f0] opacity-80">{label}</span>
      </div>
      <button 
        onClick={onChange}
        className={cn(
          "w-8 h-4 rounded-full relative transition-colors duration-300",
          checked ? "bg-cyan-500" : "bg-white/10"
        )}
      >
        <motion.div 
          animate={{ x: checked ? 18 : 2 }}
          className="absolute top-0.5 left-0 w-3 h-3 bg-white rounded-full shadow-sm"
        />
      </button>
    </div>
  );
}

interface StatProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function Stat({ label, value, highlight }: StatProps) {
  return (
    <div className="flex flex-col">
      <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</span>
      <span className={cn("text-[10px] tracking-tight font-bold", highlight ? "text-pink-400 neon-text" : "text-cyan-400")}>{value}</span>
    </div>
  );
}


