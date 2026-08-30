import { InvestigationResult } from '@/types';
import { X, Search, Lightbulb, Activity, CheckSquare, AlertTriangle } from 'lucide-react';

interface InvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: InvestigationResult | null;
  isLoading: boolean;
}

export default function InvestigationModal({ isOpen, onClose, result, isLoading }: InvestigationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center mr-4">
              <Search className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Root-Cause Investigation</h2>
              {result && (
                <p className="text-sm text-slate-400">Focus Topic: <span className="text-slate-200">{result.topic}</span></p>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-300 font-medium">AI Analyst investigating...</p>
              <p className="text-slate-500 text-sm mt-2 max-w-xs text-center">Synthesizing statistical evidence into operational hypotheses.</p>
            </div>
          ) : result ? (
            <div className="space-y-8">
              
              {/* Hypothesis */}
              <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center mb-4">
                  <Lightbulb className="w-5 h-5 mr-3 text-amber-400" />
                  <h3 className="text-lg font-medium text-slate-200">AI Hypothesis</h3>
                </div>
                <p className="text-slate-300 leading-relaxed text-lg mb-4">
                  {result.hypothesis}
                </p>
                <div className="flex items-start p-3 bg-amber-950/20 border border-amber-500/20 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-200/70 italic">
                    {result.hypothesis_disclaimer}
                  </p>
                </div>
              </div>

              {/* Evidence */}
              <div>
                <div className="flex items-center mb-4">
                  <Activity className="w-5 h-5 mr-3 text-emerald-400" />
                  <h3 className="text-lg font-medium text-slate-200">Supporting Evidence</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.evidence.map((item, idx) => (
                    <div key={idx} className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-lg flex flex-col justify-between">
                      <span className="text-slate-400 text-sm mb-2">{item.metric}</span>
                      <span className="text-xl font-bold text-slate-200">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <div className="flex items-center mb-4">
                  <CheckSquare className="w-5 h-5 mr-3 text-cyan-400" />
                  <h3 className="text-lg font-medium text-slate-200">Recommended Investigation Steps</h3>
                </div>
                <ul className="space-y-3">
                  {result.recommended_actions.map((action, idx) => (
                    <li key={idx} className="flex items-start p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                      <div className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 mr-3 mt-0.5 flex-shrink-0">
                        {idx + 1}
                      </div>
                      <span className="text-slate-300">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
            </div>
          ) : (
            <div className="flex items-center justify-center py-20 text-slate-500">
              No investigation results available.
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-700"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
