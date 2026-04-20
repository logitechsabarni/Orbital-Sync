import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Loader2, Cpu } from 'lucide-react';
import { Satellite } from '../types/orbital';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  satellites: Satellite[];
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ satellites }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'OrbitalSync AI online. Traffic matrix monitored. How can I assist with trajectory optimization today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const context = `You are the OrbitalSync AI Orchestrator. 
      Current Orbit Data: ${JSON.stringify(satellites)}.
      Objective: Monitor traffic, predict collisions, and optimize paths.
      Be concise, technical, and slightly futuristic. If there are 'danger' status satellites, highlight them first.
      Use markdown for lists or technical codes.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: context
        }
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.text || 'Error processing request.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Subsystem failure. Check neural link (API Key).' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full gap-6 animate-in fade-in duration-500">
      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-[#0a0f1e]/70 border border-cyan-400/20 rounded-xl overflow-hidden glass-panel">
        <div className="p-4 border-b border-cyan-400/10 flex items-center gap-2 bg-black/30">
          <Cpu className="w-4 h-4 text-cyan-400 neon-text" />
          <span className="font-bold text-xs tracking-widest uppercase text-cyan-400">AI Orchestrator v4.2</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-hide">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[90%] p-3 rounded-lg flex gap-3 ${
                m.role === 'user' ? 'bg-cyan-500/10 border border-cyan-400/30' : 'bg-black/40 border border-white/5'
              }`}>
                <div className="mt-1 flex-shrink-0">
                  {m.role === 'user' ? <User className="w-3 h-3 text-cyan-400" /> : <Bot className="w-3 h-3 text-purple-400" />}
                </div>
                <div className={`text-[11px] font-mono leading-relaxed ${m.role === 'user' ? 'text-cyan-100' : 'text-cyan-200/80'}`}>
                  {m.content}
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-black/40 border border-white/5 p-3 rounded-lg flex items-center gap-2">
                <Loader2 className="w-3 h-3 text-purple-400 animate-spin" />
                <span className="text-[10px] font-mono text-purple-400">SYNCING_VECTORS...</span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <div className="p-4 bg-black/40 border-t border-cyan-400/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="INPUT COMMAND..."
              className="flex-1 bg-[#02040a] border border-cyan-400/20 rounded px-3 py-2 text-[10px] font-mono text-cyan-400 focus:outline-none focus:border-cyan-400/50 transition-colors uppercase placeholder:opacity-30"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="p-2 bg-cyan-500/20 hover:bg-cyan-500/40 disabled:opacity-30 text-cyan-400 border border-cyan-400/50 rounded transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Actions & Insights */}
      <div className="w-80 flex flex-col gap-6">
         <div className="glass-panel p-5 border-cyan-400/10 rounded-xl space-y-4">
            <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Suggested Actions</h3>
            <div className="space-y-2">
               <SuggestionCard 
                  label="Reroute Vector Delta-A" 
                  priority="High" 
                  desc="LEO Cluster 3 showing significant congestion index spike."
               />
               <SuggestionCard 
                  label="Altitude Shift: LEO -> MEO" 
                  priority="Medium" 
                  desc="Starlink-1 transition recommended for 0.04% risk reduction."
               />
            </div>
         </div>

         <div className="flex-1 glass-panel p-5 border-cyan-400/10 rounded-xl space-y-4">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">System Insights</h3>
            <div className="space-y-4 font-mono text-[10px]">
               <div className="p-3 bg-white/5 rounded border-l-2 border-emerald-500">
                  <span className="text-emerald-400 font-bold block mb-1">STABILITY_NOMINAL</span>
                  <p className="text-gray-400 leading-tight">AI intervention has stabilized 4 potentially hazardous trajectories in the last 60 seconds.</p>
               </div>
               <div className="p-3 bg-white/5 rounded border-l-2 border-yellow-500">
                  <span className="text-yellow-400 font-bold block mb-1">CONGESTION_WARNING</span>
                  <p className="text-gray-400 leading-tight">Sector LEO-4 approaching critical density. Limit future node insertions.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

function SuggestionCard({ label, priority, desc }: { label: string, priority: string, desc: string }) {
   return (
      <div className="p-3 bg-black/40 border border-white/5 rounded hover:bg-white/5 transition-all cursor-pointer group">
         <div className="flex justify-between items-baseline mb-1">
            <span className="text-[11px] font-black text-white group-hover:text-cyan-400">{label}</span>
            <span className={cn(
              "text-[8px] uppercase font-bold",
              priority === 'High' ? 'text-pink-500' : 'text-yellow-500'
            )}>{priority}</span>
         </div>
         <p className="text-[9px] text-gray-500 leading-tight">{desc}</p>
      </div>
   );
}
