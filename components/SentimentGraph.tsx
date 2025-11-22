import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { SentimentPoint } from '../types';
import { Activity } from 'lucide-react';

interface SentimentGraphProps {
  data: SentimentPoint[];
}

const SentimentGraph: React.FC<SentimentGraphProps> = ({ data }) => {
  return (
    <div className="bg-zinc-900/40 backdrop-blur-sm p-6 rounded-xl border border-white/5 relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
          <Activity className="text-cyan-500 w-4 h-4" />
          Engagement Telemetry
        </h3>
        <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div> HIGH</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div> LOW</span>
        </div>
      </div>
      
      <div className="h-[250px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
            <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }} 
                dy={10}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                domain={[0, 100]}
            />
            <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#09090b', 
                  borderRadius: '8px', 
                  border: '1px solid #27272a', 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)' 
                }}
                itemStyle={{ color: '#22d3ee', fontWeight: 500, fontSize: '12px', fontFamily: 'monospace' }}
                formatter={(value: number) => [`${value}`, 'SCORE']}
                labelFormatter={(label) => `T: ${label}`}
                labelStyle={{ color: '#a1a1aa', marginBottom: '4px', fontSize: '10px' }}
            />
            <Area 
                type="monotone" 
                dataKey="engagementScore" 
                stroke="#06b6d4" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorEngagement)" 
                animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SentimentGraph;