import React from 'react';
import { CoachingAnalysis } from '../types';
import { CheckCircle2, AlertTriangle, Trophy, TrendingUp } from 'lucide-react';

interface CoachingCardProps {
  data: CoachingAnalysis;
}

const CoachingCard: React.FC<CoachingCardProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Strengths */}
      <div className="bg-zinc-900/40 backdrop-blur-sm rounded-xl border border-emerald-900/30 overflow-hidden">
        <div className="bg-emerald-950/20 p-4 border-b border-emerald-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="text-emerald-500 w-4 h-4" />
            <h3 className="font-semibold text-emerald-100 tracking-wide text-sm uppercase">Performance Highlights</h3>
          </div>
        </div>
        <div className="p-5">
          <ul className="space-y-4">
            {data.strengths.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3 group">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0 group-hover:text-emerald-400 transition-colors" />
                <span className="text-zinc-300 text-sm font-light leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Missed Opportunities */}
      <div className="bg-zinc-900/40 backdrop-blur-sm rounded-xl border border-orange-900/30 overflow-hidden">
        <div className="bg-orange-950/20 p-4 border-b border-orange-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <TrendingUp className="text-orange-500 w-4 h-4" />
             <h3 className="font-semibold text-orange-100 tracking-wide text-sm uppercase">Optimization Required</h3>
          </div>
        </div>
        <div className="p-5">
          <ul className="space-y-4">
            {data.missedOpportunities.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3 group">
                <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0 group-hover:text-orange-400 transition-colors" />
                <span className="text-zinc-300 text-sm font-light leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CoachingCard;