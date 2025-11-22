import React from 'react';
import { TranscriptSegment } from '../types';
import { User, Headphones } from 'lucide-react';

interface TranscriptProps {
  transcript: TranscriptSegment[];
}

const Transcript: React.FC<TranscriptProps> = ({ transcript }) => {
  return (
    <div className="bg-zinc-900/40 backdrop-blur-sm rounded-xl border border-white/5 h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-white/5 bg-zinc-900/60 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
          <span className="text-cyan-500">
            <Headphones size={16} />
          </span>
          Audio Log
        </h3>
        <span className="text-[10px] text-zinc-600 font-mono">REC_001</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {transcript.map((segment, index) => {
          // Check for Chinese "销售" (matches 销售顾问, 销售人员) or English "sales"
          const isSalesperson = segment.speaker.includes('销售') || segment.speaker.toLowerCase().includes('sales');
          
          return (
            <div 
              key={index} 
              className={`flex gap-4 ${isSalesperson ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${isSalesperson ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                <User size={14} />
              </div>
              <div className={`flex flex-col max-w-[85%] ${isSalesperson ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                   <span className={`text-[10px] uppercase tracking-wider font-bold ${isSalesperson ? 'text-cyan-500' : 'text-zinc-500'}`}>{segment.speaker}</span>
                   <span className="text-[10px] text-zinc-600 font-mono">{segment.timestamp}</span>
                </div>
                <div className={`p-3.5 rounded-lg text-sm leading-relaxed backdrop-blur-md ${
                  isSalesperson 
                    ? 'bg-cyan-950/20 border border-cyan-900/50 text-cyan-100 rounded-tr-none' 
                    : 'bg-zinc-800/40 border border-white/5 text-zinc-300 rounded-tl-none'
                }`}>
                  {segment.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Transcript;