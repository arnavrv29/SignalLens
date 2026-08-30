import { AIInsight } from '@/types';
import { Bot, AlertTriangle, HelpCircle } from 'lucide-react';

interface AIAlertProps {
  insight?: AIInsight;
  onInvestigate: () => void;
}

export default function AIAlert({ insight, onInvestigate }: AIAlertProps) {
  if (!insight) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden shadow-lg shadow-emerald-900/10 mb-8">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
        
        <div className="flex-shrink-0 bg-emerald-950/50 p-4 rounded-xl border border-emerald-500/20">
          <Bot className="w-8 h-8 text-emerald-400" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold text-slate-100">AI Analyst Alert</h3>
            {insight.confidence_level === 'high' && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                High Confidence
              </span>
            )}
          </div>
          <p className="text-slate-300 mb-4 leading-relaxed text-lg">
            {insight.what_changed}
          </p>
        </div>

        <div className="flex-shrink-0 w-full md:w-auto">
          <button 
            onClick={onInvestigate}
            className="w-full md:w-auto group relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-emerald-900/40 flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <HelpCircle className="w-5 h-5 mr-2 relative z-10" />
            <span className="relative z-10 tracking-wider">WHY?</span>
          </button>
        </div>
      </div>
    </div>
  );
}
