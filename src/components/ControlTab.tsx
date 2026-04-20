import React from 'react';
import { Satellite } from '../types/orbital';
import { cn } from '../lib/utils';
import { Activity, Zap, Shield, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ControlTabProps {
  satellites: Satellite[];
  selectedSat: Satellite | null;
  setSelectedSat: (sat: Satellite | null) => void;
  triggerManeuver: (id: string) => void;
  runDiagnostics: (id: string) => void;
  updateSatellite: (params: { id: string, orbit?: number, speed?: number }) => void;
  logs: string[];
}

export function ControlTab({ 
  satellites, 
  selectedSat, 
  setSelectedSat, 
  triggerManeuver, 
  runDiagnostics, 
  updateSatellite,
  logs 
}: ControlTabProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [isDiagnostic, setIsDiagnostic] = React.useState(false);
  const [tacticalOutput, setTacticalOutput] = React.useState<{ type: 'shift' | 'diag', data: any } | null>(null);

  const filteredSatellites = satellites.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExecute = () => {
    if (!selectedSat) return;
    setIsExecuting(true);
    setTacticalOutput(null);
    triggerManeuver(selectedSat.id);
    setTimeout(() => {
      setIsExecuting(false);
      setTacticalOutput({
        type: 'shift',
        data: {
          id: selectedSat.id,
          name: selectedSat.name,
          newOrbit: selectedSat.orbit.toFixed(2),
          timestamp: new Date().toLocaleTimeString(),
          integrity: (98.5 + Math.random() * 1.2).toFixed(1)
        }
      });
    }, 2000);
  };

  const handleDiagnostic = () => {
    if (!selectedSat) return;
    setIsDiagnostic(true);
    setTacticalOutput(null);
    runDiagnostics(selectedSat.id);
    setTimeout(() => {
      setIsDiagnostic(false);
      setTacticalOutput({
        type: 'diag',
        data: {
          id: selectedSat.id,
          signal: (96.4 + Math.random() * 3.2).toFixed(1),
          cpu: (12 + Math.random() * 18).toFixed(0),
          temp: (34 + Math.random() * 4).toFixed(1),
          status: 'OPTIMAL'
        }
      });
    }, 3000);
  };

  return (
    <div className="flex h-full gap-6 animate-in fade-in duration-500">
      {/* Left: Satellite List */}
      <div className="w-80 flex flex-col gap-4 glass-panel p-4 border-cyan-400/10 overflow-hidden">
        <div className="flex items-center gap-2 mb-2 bg-white/5 p-2 rounded-lg border border-white/5 focus-within:border-cyan-400/40 transition-all">
          <Search className="w-4 h-4 text-cyan-400" />
          <input 
            type="text" 
            placeholder="SEARCH NODES..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-[10px] uppercase font-mono focus:ring-0 text-cyan-400 placeholder:text-cyan-400/30 w-full"
          />
        </div>
        <div className="flex-1 overflow-y-auto scroll-hide space-y-2">
          {filteredSatellites.map(sat => (
            <div 
              key={sat.id}
              onClick={() => setSelectedSat(sat)}
              className={cn(
                "p-3 rounded border cursor-pointer transition-all hover:bg-white/5",
                selectedSat?.id === sat.id ? "bg-cyan-500/20 border-cyan-400/50 shadow-[inset_0_0_15px_rgba(34,211,238,0.1)]" : "bg-black/20 border-white/5"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-black text-cyan-400">{sat.name}</span>
                <span className={cn(
                  "text-[8px] px-1.5 py-0.5 rounded border uppercase font-black",
                  sat.status === 'danger' ? 'border-pink-500/50 text-pink-500 bg-pink-500/10' : 
                  sat.status === 'warning' ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10' : 
                  isExecuting && sat.id === selectedSat?.id ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10 animate-pulse' :
                  'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
                )}>{isExecuting && sat.id === selectedSat?.id ? 'shifting' : sat.status}</span>
              </div>
              <div className="flex justify-between text-[9px] opacity-40 uppercase font-mono">
                <span>{sat.id}</span>
                <span>{sat.country}</span>
              </div>
            </div>
          ))}
          {filteredSatellites.length === 0 && (
            <div className="text-center py-12 opacity-20 font-mono text-[10px]">NO NODES FOUND</div>
          )}
        </div>
      </div>

      {/* Center: Orbit Adjustment Panel */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex-1 glass-panel border-cyan-400/10 p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <AnimatePresence>
            {isExecuting && (
               <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-cyan-500/5 backdrop-blur-[2px] z-50 flex items-center justify-center"
               >
                  <div className="text-center space-y-4">
                     <div className="flex gap-1 items-end justify-center h-12">
                        {[...Array(12)].map((_, i) => (
                           <motion.div 
                              key={i}
                              className="w-1 bg-cyan-400"
                              animate={{ height: [10, 40, 10] }}
                              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                           />
                        ))}
                     </div>
                     <span className="text-[10px] font-black text-cyan-400 tracking-[0.5em] uppercase">Recalculating Vector Paths...</span>
                  </div>
               </motion.div>
            )}

            {isDiagnostic && (
               <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-emerald-500/5 backdrop-blur-[2px] z-50 flex items-center justify-center"
               >
                  <div className="text-center space-y-4 w-full px-20">
                     <svg className="w-full h-24 stroke-emerald-400 fill-none" viewBox="0 0 400 100">
                        <motion.path 
                           d="M 0 50 Q 50 10 100 50 T 200 50 T 300 50 T 400 50" 
                           strokeWidth="2"
                           animate={{ d: [
                             "M 0 50 Q 50 10 100 50 T 200 50 T 300 50 T 400 50",
                             "M 0 50 Q 50 90 100 50 T 200 50 T 300 50 T 400 50"
                           ]}}
                           transition={{ duration: 0.2, repeat: Infinity }}
                        />
                     </svg>
                     <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase">Deep Signal Sweep in Progress...</span>
                  </div>
               </motion.div>
            )}
          </AnimatePresence>

          {selectedSat ? (
              <div className="w-full max-w-lg space-y-12">
                 <div>
                    <h2 className="text-3xl font-black text-cyan-400 neon-text mb-2 uppercase">{selectedSat.name}</h2>
                    <p className="text-xs text-gray-400 font-mono tracking-widest">TACTICAL INTERFACE // OPERATOR_OVERRIDE_ENABLED</p>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <ControlSlider 
                          label="ORBITAL_ALTITUDE" 
                          value={selectedSat.orbit} 
                          min={0.5} 
                          max={3.5} 
                          step={0.01}
                          onChange={(v) => updateSatellite({ id: selectedSat.id, orbit: v })}
                          unit="AU"
                       />
                       <ControlSlider 
                          label="ORBITAL_VELOCITY" 
                          value={selectedSat.speed} 
                          min={0.01} 
                          max={0.2} 
                          step={0.005}
                          onChange={(v) => updateSatellite({ id: selectedSat.id, speed: v })}
                          unit="km/s"
                       />
                    </div>
                    
                    <div className="flex flex-col gap-4 justify-center">
                       <button 
                          onClick={handleExecute}
                          disabled={selectedSat.status === 'maneuvering' || isExecuting || isDiagnostic}
                          className="py-6 bg-cyan-500/10 border border-cyan-400/50 text-cyan-400 font-black text-sm tracking-widest rounded-xl hover:bg-cyan-500/20 transition-all uppercase flex flex-col items-center gap-2 disabled:opacity-30"
                       >
                          <Zap className={cn("w-6 h-6", isExecuting && "animate-bounce")} />
                          {isExecuting ? 'Executing...' : 'Execute Vector Shift'}
                       </button>
                       <button 
                          onClick={handleDiagnostic}
                          disabled={isExecuting || isDiagnostic}
                          className="py-4 border border-white/10 text-gray-400 font-bold text-xs tracking-widest rounded-xl hover:bg-white/5 transition-all uppercase flex items-center justify-center gap-2 disabled:opacity-30"
                       >
                          <Shield className={cn("w-4 h-4", isDiagnostic && "animate-spin")} />
                          {isDiagnostic ? 'Running...' : 'Run Diagnostics'}
                       </button>
                    </div>
                 </div>

                 {/* Ghost Path Preview Indicator */}
                 <div className="h-2 w-full bg-cyan-900/20 rounded-full overflow-hidden relative border border-white/5">
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,rgba(34,211,238,0.1)_10px,rgba(34,211,238,0.1)_20px)]" />
                    <motion.div 
                      className="h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" 
                      initial={false}
                      animate={{ width: `${(selectedSat.orbit / 3.5) * 100}%` }} 
                    />
                 </div>
              </div>
          ) : (
            <div className="text-center space-y-4 opacity-20">
               <Activity className="w-16 h-16 mx-auto animate-pulse" />
               <p className="text-xl font-bold tracking-widest uppercase">Select a node to adjust parameters</p>
            </div>
          )}
        </div>

        {/* Dedicated Tactical Output Section */}
        <AnimatePresence>
          {tacticalOutput && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="glass-panel border-cyan-400/20 p-6 rounded-2xl bg-cyan-500/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2">
                <button onClick={() => setTacticalOutput(null)} className="text-cyan-400/40 hover:text-cyan-400 text-[10px] font-black">CLOSE [X]</button>
              </div>

              {tacticalOutput.type === 'shift' ? (
                <div className="flex gap-8 items-center">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-400/40 text-cyan-400">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <span className="text-[8px] text-gray-500 uppercase font-black block">Operation Status</span>
                      <span className="text-xs font-black text-emerald-400">VECTOR_SHIFT_COMPLETE</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] text-gray-500 uppercase font-black block">New Delta-V Altitude</span>
                      <span className="text-xs font-black text-white">{tacticalOutput.data.newOrbit} AU</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] text-gray-500 uppercase font-black block">System Integrity</span>
                      <span className="text-xs font-black text-cyan-400">{tacticalOutput.data.integrity}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-8 items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-400/40 text-emerald-400">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div className="flex-1 grid grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <span className="text-[8px] text-gray-500 uppercase font-black block">Signal Strength</span>
                      <span className="text-xs font-black text-emerald-400">{tacticalOutput.data.signal}%</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] text-gray-500 uppercase font-black block">CPU Load</span>
                      <span className="text-xs font-black text-white">{tacticalOutput.data.cpu}%</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] text-gray-500 uppercase font-black block">Core Temp</span>
                      <span className="text-xs font-black text-white">{tacticalOutput.data.temp}°C</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] text-gray-500 uppercase font-black block">Health Index</span>
                      <span className="text-xs font-black text-emerald-400">{tacticalOutput.data.status}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Action Logs */}
      <div className="w-80 glass-panel border-cyan-400/10 p-5 flex flex-col overflow-hidden">
        <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4">Command History</h3>
        <div className="flex-1 overflow-y-auto scroll-hide space-y-4">
           {logs.map((log, i) => (
             <div key={i} className="text-[10px] font-mono leading-relaxed border-b border-white/5 pb-2">
                <span className="text-cyan-400/50">{log.split(']')[0]}]</span>
                <span className="text-zinc-200"> {log.split(']')[1]}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}

function ControlSlider({ label, value, min, max, step, onChange, unit }: { label: string, value: number, min: number, max: number, step: number, onChange: (v: number) => void, unit: string }) {
   return (
      <div className="space-y-3">
         <div className="flex justify-between items-baseline">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
            <span className="text-sm font-black text-cyan-400">{(value * (unit === 'km/s' ? 7.5 : 1)).toFixed(2)} {unit}</span>
         </div>
         <input 
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 bg-white/5 rounded-lg appearance-none h-1 h-hover:h-2 transition-all"
         />
      </div>
   );
}
