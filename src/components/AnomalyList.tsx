import { Anomaly } from '@/types';
import { AlertTriangle, TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface AnomalyListProps {
  anomalies: Anomaly[];
}

export default function AnomalyList({ anomalies }: AnomalyListProps) {
  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 h-full flex flex-col">
        <h3 className="text-lg font-medium text-slate-200 mb-6 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-purple-400" />
          Detected Anomalies
        </h3>
        <div className="flex-1 flex items-center justify-center text-slate-500">
          No statistical anomalies detected.
        </div>
      </div>
    );
  }

  // Sort by severity (high first) and limit to 4
  const displayAnomalies = [...anomalies]
    .sort((a, b) => {
      if (a.severity === 'high' && b.severity !== 'high') return -1;
      if (a.severity !== 'high' && b.severity === 'high') return 1;
      return Math.abs(b.z_score) - Math.abs(a.z_score);
    })
    .slice(0, 4);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-medium text-slate-200 mb-6 flex items-center">
        <Zap className="w-5 h-5 mr-2 text-purple-400" />
        Detected Anomalies
      </h3>
      
      <div className="space-y-4 flex-1">
        {displayAnomalies.map((anomaly, idx) => {
          const isHigh = anomaly.severity === 'high';
          const isSpike = anomaly.direction === 'spike' || anomaly.direction === 'unusually_high';
          
          return (
            <div 
              key={idx} 
              className={`
                p-4 rounded-lg border flex items-start
                ${isHigh 
                  ? 'bg-red-950/20 border-red-900/30' 
                  : 'bg-amber-950/10 border-amber-900/20'}
              `}
            >
              <div className="mr-3 mt-1 flex-shrink-0">
                {isHigh ? (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                ) : isSpike ? (
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-slate-200">{anomaly.period}</h4>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isHigh ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                    Z: {anomaly.z_score > 0 ? '+' : ''}{anomaly.z_score}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{anomaly.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
