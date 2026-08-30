import { Evidence } from '@/types';
import { AlertCircle, TrendingDown, TrendingUp, CheckCircle, Database } from 'lucide-react';

interface EvidencePanelProps {
  evidence: Evidence[];
}

export default function EvidencePanel({ evidence }: EvidencePanelProps) {
  if (!evidence || evidence.length === 0) {
    return null;
  }

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold border border-emerald-500/30">High Confidence</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] uppercase font-bold border border-amber-500/30">Medium Confidence</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 text-[10px] uppercase font-bold border border-slate-500/30">Low Confidence</span>;
    }
  };

  const getIcon = (type: string, change: number | null) => {
    if (type === 'anomaly') return <AlertCircle className="w-5 h-5 text-purple-400" />;
    if (change === null) return <Database className="w-5 h-5 text-blue-400" />;
    if (change > 0) return <TrendingUp className="w-5 h-5 text-amber-400" />;
    return <TrendingDown className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-medium text-slate-200 mb-6 flex items-center">
        <CheckCircle className="w-5 h-5 mr-2 text-cyan-500" />
        Data Science Evidence
      </h3>
      
      <div className="space-y-4">
        {evidence.map((item) => (
          <div key={item.id} className="p-4 bg-slate-800/30 border border-slate-800/80 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <div className="mr-3 mt-0.5">
                  {getIcon(item.type, item.change)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                {getConfidenceBadge(item.confidence)}
              </div>
            </div>
            
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-900/50 p-3 rounded border border-slate-800/50">
              <div>
                <span className="block text-slate-500 mb-1">Metric</span>
                <span className="font-mono text-slate-300">{item.metric}</span>
              </div>
              
              {item.baseline !== null && (
                <div>
                  <span className="block text-slate-500 mb-1">Baseline</span>
                  <span className="font-mono text-slate-300">{typeof item.baseline === 'number' ? item.baseline.toFixed(2) : item.baseline}</span>
                </div>
              )}
              
              {item.current !== null && (
                <div>
                  <span className="block text-slate-500 mb-1">Current</span>
                  <span className="font-mono text-slate-300">{typeof item.current === 'number' ? item.current.toFixed(2) : item.current}</span>
                </div>
              )}
              
              {item.pct_change !== null && (
                <div>
                  <span className="block text-slate-500 mb-1">% Change</span>
                  <span className={`font-mono ${item.pct_change > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {item.pct_change > 0 ? '+' : ''}{item.pct_change.toFixed(1)}%
                  </span>
                </div>
              )}

              {item.sample_size > 0 && (
                <div>
                  <span className="block text-slate-500 mb-1">Sample Size</span>
                  <span className="font-mono text-slate-300">{item.sample_size}</span>
                </div>
              )}
            </div>
            
            {item.time_range && (
              <div className="mt-3 text-[11px] text-slate-500 flex justify-end">
                Period: {item.time_range}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
