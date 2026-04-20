import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Satellite, Debris } from '../types/orbital';
import { AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface OrbitalMapProps {
  satellites: Satellite[];
  debris: Debris[];
  onSelect?: (sat: Satellite) => void;
}

export const OrbitalMap: React.FC<OrbitalMapProps & { stats?: any, selectedSatId?: string | null }> = ({ satellites, debris, onSelect, stats, selectedSatId }) => {
  const size = 600;
  const center = size / 2;
  const orbitBase = 70;

  // Calculate unique orbits for dynamic rings
  const uniqueOrbits = useMemo(() => {
    const orbits = new Set<number>();
    satellites.forEach(s => orbits.add(parseFloat(s.orbit.toFixed(1))));
    return Array.from(orbits).sort((a, b) => a - b);
  }, [satellites]);

  // Check if any satellite is in danger for global strobe
  const isGlobalDanger = useMemo(() => satellites.some(s => s.status === 'danger'), [satellites]);

  // Calculate rotation speed multiplier based on congestion index
  const speedScale = useMemo(() => {
    const congestion = parseFloat(stats?.congestionIndex || "70");
    return (congestion / 70) * 1.5;
  }, [stats?.congestionIndex]);

  const getPosition = (orbit: number, angle: number) => {
    const radius = orbit * orbitBase + 50;
    const rad = (angle * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
      radius
    };
  };

  return (
    <div className={cn(
      "relative w-full aspect-square max-w-[600px] mx-auto bg-[#02040a] rounded-full border shadow-[0_0_50px_rgba(0,243,255,0.05)] overflow-hidden transition-all duration-500",
      isGlobalDanger ? "border-pink-500/50 shadow-[0_0_80px_rgba(236,72,153,0.15)]" : "border-cyan-400/10"
    )}>
      {/* Background Stars/Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,243,255,0.01)_0%,transparent_70%)]" />
      
      {/* Red Alert Strobe */}
      <AnimatePresence>
        {isGlobalDanger && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="absolute inset-0 bg-pink-500 z-0 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full relative z-10">
        {/* Orbital Rings - Dynamic based on active orbits */}
        {uniqueOrbits.map((orbit) => {
          const radius = orbit * orbitBase + 50;
          const isSelectedPath = satellites.find(s => s.id === selectedSatId && parseFloat(s.orbit.toFixed(1)) === orbit);
          return (
            <circle
              key={orbit}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={isSelectedPath ? "rgba(34, 211, 238, 0.4)" : "rgba(0, 243, 255, 0.1)"}
              strokeWidth={isSelectedPath ? "2" : "1"}
              strokeDasharray={isSelectedPath ? "none" : "4 4"}
              className="transition-all duration-500"
            />
          );
        })}

        {/* Earth Center Component */}
        <defs>
          <radialGradient id="earthGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="30%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0891b2" />
          </radialGradient>
        </defs>
        <circle
          cx={center}
          cy={center}
          r="12"
          fill="url(#earthGradient)"
          className="animate-pulse shadow-[0_0_20px_rgba(34,211,238,0.6)]"
        />
        <circle
          cx={center}
          cy={center}
          r="30"
          fill="none"
          stroke="rgba(34,211,238,0.1)"
          strokeWidth="1"
        />

        {/* Global Risk Intersect Lines */}
        <g opacity="0.3">
           {satellites.filter(s => s.status === 'danger').map(s => {
              const sPos = getPosition(s.orbit, s.angle);
              // Find closest debris or satellite in danger range
              const targetDebris = debris.find(d => Math.abs(d.orbit - s.orbit) < 0.5 && Math.abs(d.angle - s.angle) < 15);
              if (targetDebris) {
                 const dPos = getPosition(targetDebris.orbit, targetDebris.angle);
                 return (
                    <motion.line 
                       key={`line-${s.id}-${targetDebris.id}`}
                       x1={sPos.x} y1={sPos.y} x2={dPos.x} y2={dPos.y}
                       stroke="#ec4899" strokeWidth="1" strokeDasharray="2 2"
                       animate={{ opacity: [0.2, 0.8, 0.2] }}
                       transition={{ duration: 1, repeat: Infinity }}
                    />
                 );
              }
              return null;
           })}
        </g>

        {/* Debris Entities */}
        {debris.map((d) => {
          const pos = getPosition(d.orbit, d.angle);
          return (
            <motion.g
              key={d.id}
              initial={false}
              animate={{ x: pos.x, y: pos.y }}
              transition={{ type: 'spring', damping: 20, stiffness: 300, mass: 0.5 }}
            >
              <circle r="2" fill="#ec4899" className="animate-ping opacity-40" />
              <circle r="1.5" fill="#f472b6" />
            </motion.g>
          );
        })}

        {/* Satellite Entities */}
        {satellites.map((s) => {
          const pos = getPosition(s.orbit, s.angle);
          const isManeuvering = (s as any).status === 'maneuvering';
          const color = isManeuvering ? '#10b981' : s.status === 'danger' ? '#ec4899' : s.status === 'warning' ? '#facc15' : '#22d3ee';
          const glowClass = isManeuvering ? 'drop-shadow-[0_0_12px_#10b981]' : s.status === 'danger' ? 'drop-shadow-[0_0_10px_#ec4899]' : s.status === 'warning' ? 'drop-shadow-[0_0_8px_#facc15]' : 'drop-shadow-[0_0_8px_#22d3ee]';

          return (
            <motion.g
              key={s.id}
              initial={false}
              animate={{ x: pos.x, y: pos.y }}
              transition={{ 
                type: isManeuvering ? 'tween' : 'spring', 
                duration: isManeuvering ? 1 : 0.4,
                damping: 25, 
                stiffness: 200 
              }}
              className="cursor-pointer group"
              onClick={() => onSelect?.(s)}
            >
              {/* Maneuvering Thruster Pulse */}
              {isManeuvering && (
                <motion.circle
                  r="10"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="0.5"
                  animate={{ r: [6, 12, 6], opacity: [0.6, 0.1, 0.6] }}
                  transition={{ duration: 1 / speedScale, repeat: Infinity }}
                />
              )}

              {/* Collision Warning Arc */}
              {s.status === 'danger' && (
                <motion.circle
                  r="12"
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2 / speedScale, repeat: Infinity, ease: 'linear' }}
                />
              )}

              {/* Satellite Body */}
              <circle
                r={isManeuvering ? "4" : "3"}
                fill={color}
                className={glowClass}
              />
              
              {/* Ownership ID Tag */}
              <g className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${s.status === 'danger' || s.status === 'warning' ? 'opacity-100' : ''}`}>
                <rect
                  x="8"
                  y="-10"
                  width={s.status !== 'stable' ? "85" : "65"}
                  height={s.status !== 'stable' ? "24" : "16"}
                  rx="2"
                  fill="rgba(2, 4, 10, 0.95)"
                  stroke={color}
                  strokeWidth="0.5"
                />
                <text
                  x="12"
                  y="2"
                  fill={color}
                  fontSize="7"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {s.id} {isManeuvering ? '>> MOV' : ''}
                </text>
                {(s.distance || s.timeToImpact) && (
                   <text
                     x="12"
                     y="10"
                     fill={color}
                     fontSize="6"
                     opacity="0.7"
                     fontFamily="monospace"
                   >
                     {s.distance}km / {s.timeToImpact}s
                   </text>
                )}
              </g>
            </motion.g>
          );
        })}
      </svg>

      {/* Map Legend / HUD Elements */}
      <div className="absolute top-4 left-4 font-mono text-[9px] text-cyan-400 bg-[#0a0f1e]/80 p-3 rounded-lg border border-cyan-400/20 backdrop-blur-md uppercase tracking-wider">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 glow-emerald" />
          <span>Nominal</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 glow-amber" />
          <span>Warning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-pink-500 glow-red animate-pulse" />
          <span className="text-pink-400">Critical</span>
        </div>
      </div>
    </div>
  );
};
