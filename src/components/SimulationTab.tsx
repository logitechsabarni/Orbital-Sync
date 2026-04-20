import React from 'react';
import { Satellite, GlobalStats } from '../types/orbital';
import { cn } from '../lib/utils';
import { Rocket, Trash2, Zap, AlertTriangle, Play, Pause, FastForward } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SimulationTabProps {
  stats?: GlobalStats;
  updateScenario: (scenario: string) => void;
  setAutoPilot: (enabled: boolean) => void;
  isAutoPilot?: boolean;
  logs: string[];
}

export function SimulationTab({ stats, updateScenario, setAutoPilot, isAutoPilot, logs }: SimulationTabProps) {
  return (
    <div className="flex h-full gap-6 animate-in fade-in duration-500">
      {/* Left: Scenario Controls */}
      <div className="w-80 glass-panel border-cyan-400/10 p-5 flex flex-col gap-6">
        <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Scenario Selection</h3>
        
        <div className="space-y-3">
          <ScenarioButton 
            active={stats?.scenario === 'nominal'}
            label="NOMINAL OPERATIONS"
            desc="Standard orbital maintenance"
            icon={Rocket}
            color="cyan"
            onClick={() => updateScenario('nominal')}
          />
          <ScenarioButton 
            active={stats?.scenario === 'debris_storm'}
            label="DEBRIS STORM"
            desc="Sudden fragment field impact"
            icon={Trash2}
            color="orange"
            onClick={() => updateScenario('debris_storm')}
          />
          <ScenarioButton 
            active={stats?.scenario === 'solar_flare'}
            label="SOLAR FLARE"
            desc="EM disturbance & drag index spike"
            icon={Zap}
            color="yellow"
            onClick={() => updateScenario('solar_flare')}
          />
          <ScenarioButton 
            active={stats?.scenario === 'launch_window'}
            label="MASS LAUNCH"
            desc="50+ new node insertion"
            icon={FastForward}
            color="emerald"
            onClick={() => updateScenario('launch_window')}
          />
        </div>

        <div className="mt-auto border-t border-white/5 pt-6 space-y-4">
           <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest">Simulation Speed</h3>
           <div className="flex gap-2">
              <button className="flex-1 py-3 glass-panel border-white/5 hover:bg-white/10 text-xs font-bold transition-all">1X</button>
              <button className="flex-1 py-3 glass-panel border-white/5 bg-cyan-500/20 text-cyan-400 border-cyan-400/50 text-xs font-bold transition-all">2X</button>
              <button className="flex-1 py-3 glass-panel border-white/5 hover:bg-white/10 text-xs font-bold transition-all">5X</button>
           </div>
        </div>
      </div>

      {/* Center: Prediction Visualization */}
      <div className="flex-1 glass-panel border-cyan-400/10 rounded-2xl relative overflow-hidden bg-[#02040a]">
        {/* Scenario-Specific Visualization Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[500px] h-[500px]">
               {/* Base Spinning Orbits */}
               <div className="absolute inset-0 rounded-full border-2 border-cyan-400/5 animate-spin duration-[20s]" />
               <div className="absolute inset-4 rounded-full border border-cyan-400/10 animate-spin duration-[30s] reverse" />
               
               <AnimatePresence mode="wait">
                  {stats?.scenario === 'debris_storm' && (
                     <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0"
                     >
                        {[...Array(20)].map((_, i) => (
                           <motion.div 
                              key={i}
                              className="absolute w-1 h-1 bg-pink-500 rounded-full"
                              initial={{ x: Math.random() * 500, y: Math.random() * 500 }}
                              animate={{ 
                                 x: [null, Math.random() * 500], 
                                 y: [null, Math.random() * 500],
                                 scale: [1, 1.5, 1] 
                              }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                           />
                        ))}
                     </motion.div>
                  )}

                  {stats?.scenario === 'solar_flare' && (
                     <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                     >
                        <motion.div 
                           className="w-[400px] h-[400px] rounded-full bg-yellow-500/10 blur-3xl"
                           animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                           transition={{ duration: 1, repeat: Infinity }}
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.1)_0%,transparent_70%)]" />
                     </motion.div>
                  )}

                  {stats?.scenario === 'launch_window' && (
                     <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0"
                     >
                        {[...Array(8)].map((_, i) => (
                           <motion.div 
                              key={i}
                              className="absolute w-px h-12 bg-emerald-400"
                              initial={{ x: 250, y: 250, opacity: 0 }}
                              animate={{ y: [250, -50], opacity: [0, 1, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                              style={{ left: 250 + Math.sin(i) * 150 }}
                           />
                        ))}
                     </motion.div>
                  )}
               </AnimatePresence>

               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-32 h-32 rounded-full bg-cyan-400/10 border border-cyan-400/40 flex items-center justify-center">
                     <AlertTriangle className={cn(
                        "w-12 h-12 animate-pulse",
                        stats?.scenario === 'debris_storm' ? 'text-pink-500' : 
                        stats?.scenario === 'solar_flare' ? 'text-yellow-500' : 'text-cyan-400'
                     )} />
                  </div>
               </div>
               
               <svg className="absolute inset-0 w-full h-full opacity-30">
                  <circle cx="250" cy="250" r="100" fill="none" stroke="cyan" strokeWidth="1" strokeDasharray="5,10" />
                  <circle cx="250" cy="250" r="160" fill="none" stroke={stats?.scenario === 'debris_storm' ? 'red' : 'cyan'} strokeWidth="1" strokeDasharray="2,5" />
                  <motion.line 
                     x1="250" y1="250" x2="350" y2="150" 
                     stroke={stats?.scenario === 'nominal' ? 'cyan' : 'orange'} 
                     strokeWidth="2" strokeDasharray="4"
                     animate={{ x2: [350, 360, 350], y2: [150, 140, 150] }}
                     transition={{ duration: 2, repeat: Infinity }}
                  />
               </svg>
            </div>
        </div>
        
        <div className="absolute top-8 left-8">
           <h2 className="text-4xl font-black text-white uppercase tracking-tighter mix-blend-difference">PREDICTIVE_STRESS_TEST</h2>
           <div className="flex gap-4 mt-2">
              <p className="text-[10px] text-cyan-400 font-mono tracking-[0.2em]">CALCULATING_PROBABILITY_VECTORS // TIME_HORIZON: +120M</p>
              <div className="h-px flex-1 bg-cyan-400/20 translate-y-2" />
           </div>
           
           <AnimatePresence mode="wait">
              <motion.div 
                 key={stats?.scenario}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="mt-6 space-y-2"
              >
                  <div className="flex items-center gap-2">
                     <div className={cn("w-1 h-3", stats?.scenario === 'nominal' ? 'bg-emerald-400' : 'bg-pink-500')} />
                     <span className="text-xs font-black text-white uppercase">MODE: {stats?.scenario?.replace('_', ' ') || 'INITIALIZING'}</span>
                  </div>
                  <div className="text-[9px] font-mono text-gray-500 uppercase">
                     {stats?.scenario === 'debris_storm' ? 'Targeting high-density debris intersection clusters...' :
                      stats?.scenario === 'solar_flare' ? 'Analyzing atmospheric drag expansion coefficients...' :
                      stats?.scenario === 'launch_window' ? 'Optimizing insertion slots for 42 new nodes...' :
                      'Monitoring standard constellation stability parameters...'}
                  </div>
              </motion.div>
           </AnimatePresence>
        </div>

        <div className="absolute bottom-8 right-8 flex gap-4">
           <div className="p-4 glass-panel border-white/10 bg-black/40 backdrop-blur-xl rounded-xl min-w-[120px]">
              <span className="text-[9px] text-gray-500 font-bold block mb-1 uppercase">Risk Index</span>
              <span className={cn("text-2xl font-black neon-text", (parseFloat(stats?.congestionIndex || "0") > 80) ? "text-pink-500" : "text-cyan-400")}>
                 {stats?.congestionIndex || "0"}%
              </span>
           </div>
           <div className="p-4 glass-panel border-white/10 bg-black/40 backdrop-blur-xl rounded-xl min-w-[120px]">
              <span className="text-[9px] text-gray-500 font-bold block mb-1 uppercase">Prob. Mass</span>
              <span className="text-2xl font-black text-emerald-400 neon-text">
                 {stats?.avgCollisionProb || "0.000"}
              </span>
           </div>
        </div>
      </div>

      {/* Right: AI Output Panel */}
      <div className="w-96 flex flex-col gap-6">
        <div className="glass-panel border-cyan-400/10 p-5 rounded-2xl flex flex-col gap-4">
           <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">AI_AUTOPILOT_CONTROL</h3>
           <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
              <div>
                 <span className="text-xs font-bold text-white block">Auto-Stabilization</span>
                 <span className="text-[10px] text-gray-500">AI manages collision loops</span>
              </div>
              <button 
                onClick={() => setAutoPilot(!isAutoPilot)}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-all duration-500",
                  isAutoPilot ? "bg-emerald-500" : "bg-white/10"
                )}
              >
                <motion.div 
                  className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" 
                  animate={{ x: isAutoPilot ? 24 : 0 }}
                />
              </button>
           </div>
           <div className="grid grid-cols-2 gap-4 mt-2">
              <PredictionMetric label="Confidence" value="98.2%" />
              <PredictionMetric label="CPU Usage" value="14.2%" />
           </div>
        </div>

        <div className="flex-1 glass-panel border-cyan-400/10 p-5 rounded-2xl flex flex-col overflow-hidden">
           <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4">Integrity Prediction Logs</h3>
           <div className="flex-1 overflow-y-auto scroll-hide space-y-3 font-mono text-[9px]">
              {logs.slice(0, 15).map((log, i) => (
                <div key={i} className="flex gap-2 border-b border-white/5 pb-2">
                   <span className="text-cyan-400/50 shrink-0">[{log.split(']')[0].replace('[', '')}]</span>
                   <span className={cn(
                      "leading-relaxed",
                      log.includes('CRITICAL') || log.includes('DANGER') ? 'text-pink-500' :
                      log.includes('WARN') || log.includes('SCENARIO') ? 'text-yellow-400' : 'text-zinc-400'
                   )}>
                      {log.split(']')[1]}
                   </span>
                </div>
              ))}
              {logs.length === 0 && <p className="opacity-30">Waiting for system telemetry...</p>}
           </div>
        </div>
      </div>
    </div>
  );
}

function ScenarioButton({ active, label, desc, icon: Icon, color, onClick }: { active: boolean, label: string, desc: string, icon: any, color: string, onClick: () => void }) {
   const colors: any = {
      cyan: active ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-400' : 'hover:bg-white/5',
      orange: active ? 'bg-orange-500/20 border-orange-400/50 text-orange-400' : 'hover:bg-white/5',
      yellow: active ? 'bg-yellow-500/20 border-yellow-400/50 text-yellow-400' : 'hover:bg-white/5',
      emerald: active ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-400' : 'hover:bg-white/5',
   };

   return (
      <button 
        onClick={onClick}
        className={cn("w-full p-4 rounded-xl border border-white/5 flex gap-4 text-left transition-all", colors[color])}
      >
         <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center shrink-0 border border-white/5">
            <Icon className="w-5 h-5" />
         </div>
         <div>
            <span className="text-xs font-black block uppercase tracking-tight">{label}</span>
            <span className="text-[9px] opacity-50 uppercase font-mono">{desc}</span>
         </div>
      </button>
   );
}

function PredictionMetric({ label, value }: { label: string, value: string }) {
   return (
      <div className="bg-black/20 border border-white/5 p-3 rounded-lg">
         <span className="text-[8px] text-gray-500 font-bold uppercase block mb-1">{label}</span>
         <span className="text-xs font-black text-white">{value}</span>
      </div>
   );
}
