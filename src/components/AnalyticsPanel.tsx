import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Satellite, GlobalStats } from '../types/orbital';
import { cn } from '../lib/utils';

interface AnalyticsPanelProps {
  satellites: Satellite[];
  stats?: GlobalStats;
}

const COLORS = ['#22d3ee', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];

// Sub-component to isolate live trend re-renders
const CollisionRiskIndex = React.memo(({ dynamicTrend }: { dynamicTrend: any[] }) => (
  <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col border-cyan-400/10 min-h-[350px]">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xs font-black text-white uppercase tracking-widest">Real-Time Collision Risk Index</h3>
      <div className="flex gap-4">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-pink-500" /><span className="text-[8px] text-gray-500">AGGREGATE RISK</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-400" /><span className="text-[8px] text-gray-500">SYSTEM DENSITY</span></div>
      </div>
    </div>
    <div className="flex-1">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dynamicTrend}>
          <CartesianGrid strokeDasharray="1 10" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
          <XAxis dataKey="time" hide />
          <YAxis hide />
          <Tooltip contentStyle={{ backgroundColor: '#02040a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }} />
          <Line type="monotone" dataKey="risk" stroke="#ec4899" strokeWidth={3} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="density" stroke="#22d3ee" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
));

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ satellites, stats }) => {
  const [timeFilter, setTimeFilter] = React.useState('LIVE');

  // Live trend data generation
  const [dynamicTrend, setDynamicTrend] = React.useState<any[]>([]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const newPoint = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        risk: 15 + Math.random() * 30 + (satellites.filter(s => s.status !== 'stable').length * 5),
        density: 40 + Math.random() * 10 + (satellites.length * 0.1),
        accuracy: 97 + Math.random() * 2,
      };
      setDynamicTrend(prev => [...prev, newPoint].slice(-15));
    }, 1000); // Increased frequency from 2000 to 1000
    return () => clearInterval(interval);
  }, [satellites.length]);

  const orbitDensity = React.useMemo(() => [
    { orbit: 'LEO', count: satellites.filter(s => s.orbit <= 1.5).length },
    { orbit: 'MEO', count: satellites.filter(s => s.orbit > 1.5 && s.orbit <= 2.5).length },
    { orbit: 'GEO', count: satellites.filter(s => s.orbit > 2.5).length },
  ], [satellites]);

  const congestionDist = React.useMemo(() => [
    { name: 'STABLE', value: satellites.filter(s => s.status === 'stable').length },
    { name: 'WARNING', value: satellites.filter(s => s.status === 'warning').length },
    { name: 'DANGER', value: satellites.filter(s => s.status === 'danger').length },
  ], [satellites]);

  const countryDist = React.useMemo(() => [
    { name: 'USA', value: satellites.filter(s => s.country === 'USA').length || 1 },
    { name: 'EUR', value: satellites.filter(s => s.country === 'ESA' || s.country === 'EUR').length || 1 },
    { name: 'RUS', value: satellites.filter(s => s.country === 'RUS').length || 1 },
    { name: 'CHN', value: satellites.filter(s => s.country === 'CHN').length || 1 },
    { name: 'OTH', value: satellites.filter(s => !['USA', 'RUS', 'ESA', 'EUR', 'CHN'].includes(s.country)).length || 1 },
  ], [satellites]);

  const featureImportance = React.useMemo(() => [
    { name: 'Orbital Velocity', importance: 85 },
    { name: 'Atmospheric Drag', importance: 72 },
    { name: 'Solar Radiation', importance: 64 },
    { name: 'Lunar Gravity', importance: 41 },
    { name: 'Node Congestion', importance: 89 },
  ].sort((a, b) => b.importance - a.importance), []);

  const clusterDist = React.useMemo(() => [
    { name: 'Active Nodes', value: 75 },
    { name: 'Standby Nodes', value: 15 },
    { name: 'Calibration', value: 10 },
  ], []);

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500">
      {/* Top Bar: Filters */}
      <div className="flex justify-between items-center glass-panel p-4 border-white/5">
         <div className="flex gap-4">
            {['LIVE', '5 MIN', '1 HR', '24 HR'].map(f => (
               <button 
                  key={f}
                  onClick={() => setTimeFilter(f)}
                  className={cn(
                    "px-4 py-1.5 rounded text-[10px] font-black transition-all",
                    timeFilter === f ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/40" : "text-gray-500 hover:text-gray-300"
                  )}
               >
                  {f}
               </button>
            ))}
         </div>
         <div className="text-[10px] font-mono text-cyan-400/50 uppercase tracking-widest">Analytics_Engine_V4.2 // CLUSTER_ALPHA</div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-hide grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
        
        {/* Row 1: Main Line Chart */}
        <CollisionRiskIndex dynamicTrend={dynamicTrend} />

        {/* Row 1 Side: AI Performance */}
        <div className="glass-panel p-6 rounded-2xl border-cyan-400/10 flex flex-col gap-6">
           <h3 className="text-xs font-black text-white uppercase tracking-widest">AI Performance Metrics</h3>
           <div className="grid grid-cols-1 gap-4">
              <AIMetricCard label="Prediction Accuracy" value={`${stats?.aiAccuracy?.toFixed(1) || "99.4"}%`} sub="±0.2% variance" color="emerald" />
              <AIMetricCard label="Avg Response Time" value={`${stats?.aiResponseTime || "124"}ms`} sub="Real-time threshold" color="cyan" />
              <AIMetricCard label="Interventions" value={(stats?.interventionsCount || 1842).toLocaleString()} sub="Automatic evasions" color="emerald" />
           </div>
        </div>

        {/* Row 2: Density & Congestion Distribution */}
        <div className="glass-panel p-6 rounded-2xl border-cyan-400/10 min-h-[300px] flex flex-col">
           <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Orbital Density Breakdown</h3>
           <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orbitDensity} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="orbit" stroke="rgba(255,255,255,0.4)" fontSize={9} axisLine={false} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                    contentStyle={{ backgroundColor: '#02040a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }} 
                  />
                  <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-cyan-400/10 min-h-[300px] flex flex-col">
           <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6">Congestion Distribution</h3>
           <div className="flex-1 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={congestionDist} 
                    dataKey="value" 
                    cx="50%" cy="50%" 
                    innerRadius={60} outerRadius={80} 
                    paddingAngle={5}
                    isAnimationActive={false}
                  >
                     <Cell fill="#10b981" />
                     <Cell fill="#f59e0b" />
                     <Cell fill="#ec4899" />
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#02040a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-2xl font-black text-white">{satellites.length}</span>
                 <span className="text-[8px] text-gray-500 font-bold uppercase">NODES</span>
              </div>
           </div>
           <div className="flex justify-center gap-3 mt-4">
              {congestionDist.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.name === 'STABLE' ? '#10b981' : d.name === 'WARNING' ? '#f59e0b' : '#ec4899' }} />
                  <span className="text-[8px] text-gray-500 font-black">{d.name} ({d.value})</span>
                </div>
              ))}
           </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-cyan-400/10 min-h-[300px] flex flex-col">
           <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6">Regional Domain Ownership</h3>
           <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={countryDist} 
                    dataKey="value" 
                    cx="50%" cy="50%" 
                    innerRadius={50} outerRadius={75} 
                    paddingAngle={2}
                    isAnimationActive={false}
                  >
                    {countryDist.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#02040a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="grid grid-cols-3 gap-2 mt-4 px-2">
              {countryDist.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 overflow-hidden">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[8px] text-gray-500 font-black truncate">{d.name}: {d.value}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Row 3: New Charts */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border-cyan-400/10 min-h-[300px] flex flex-col">
           <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6">Model Feature Importance</h3>
           <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureImportance} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={10} width={100} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#02040a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }} />
                  <Bar dataKey="importance" fill="#8b5cf6" radius={[0, 4, 4, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-cyan-400/10 min-h-[300px] flex flex-col">
           <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6">Node Cluster Status</h3>
           <div className="flex-1 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={clusterDist} 
                    dataKey="value" 
                    cx="50%" cy="50%" 
                    innerRadius={0} outerRadius={80}
                    isAnimationActive={false}
                  >
                    {clusterDist.map((_, i) => (
                      <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#02040a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="flex justify-center gap-4 mt-4">
              {clusterDist.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[(i + 2) % COLORS.length] }} />
                  <span className="text-[8px] text-gray-500 font-black">{d.name}</span>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};

function AIMetricCard({ label, value, sub, color }: { label: string, value: string, sub: string, color: string }) {
   const colors: any = {
      emerald: "text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
      cyan: "text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]",
   };
   return (
      <div className="p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all cursor-crosshair">
         <span className="text-[9px] text-gray-500 font-bold uppercase block mb-1">{label}</span>
         <div className="flex justify-between items-baseline">
            <span className={cn("text-2xl font-black neon-text", colors[color])}>{value}</span>
            <span className="text-[8px] text-gray-600 font-mono italic">{sub}</span>
         </div>
      </div>
   );
}
