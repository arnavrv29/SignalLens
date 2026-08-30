import { Star, TrendingUp, TrendingDown, MessageSquare, BarChart2 } from 'lucide-react';
import { AnalysisResult } from '@/types';

interface MetricsBarProps {
  result: AnalysisResult;
}

export default function MetricsBar({ result }: MetricsBarProps) {
  const { dataset_summary, sentiment, reputation_momentum } = result;

  const isMomentumPositive = reputation_momentum > 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Average Rating */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center text-slate-400 mb-2">
          <Star className="w-4 h-4 mr-2 text-yellow-500" />
          <span className="text-sm font-medium">Average Rating</span>
        </div>
        <div className="flex items-end">
          <span className="text-3xl font-bold text-white">{sentiment.avg_rating?.toFixed(1) || 'N/A'}</span>
          <span className="text-slate-500 ml-1 mb-1 text-sm">/ 5.0</span>
        </div>
      </div>

      {/* Overall Sentiment */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center text-slate-400 mb-2">
          <BarChart2 className="w-4 h-4 mr-2 text-emerald-400" />
          <span className="text-sm font-medium">Net Sentiment</span>
        </div>
        <div className="flex items-end">
          <span className="text-3xl font-bold text-white">{sentiment.overall_avg.toFixed(2)}</span>
          <span className="text-slate-500 ml-2 mb-1 text-xs">
            ({sentiment.positive_pct.toFixed(0)}% Pos)
          </span>
        </div>
      </div>

      {/* Review Count */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center text-slate-400 mb-2">
          <MessageSquare className="w-4 h-4 mr-2 text-cyan-400" />
          <span className="text-sm font-medium">Total Reviews</span>
        </div>
        <div className="flex items-end">
          <span className="text-3xl font-bold text-white">{dataset_summary.total_reviews}</span>
          <span className="text-slate-500 ml-2 mb-1 text-xs">Analyzed</span>
        </div>
      </div>

      {/* Reputation Momentum */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center text-slate-400 mb-2">
          {isMomentumPositive ? (
            <TrendingUp className="w-4 h-4 mr-2 text-emerald-400" />
          ) : (
            <TrendingDown className="w-4 h-4 mr-2 text-red-400" />
          )}
          <span className="text-sm font-medium">Reputation Momentum</span>
        </div>
        <div className="flex items-end">
          <span className={`text-3xl font-bold ${isMomentumPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isMomentumPositive ? '+' : ''}{reputation_momentum.toFixed(1)}%
          </span>
          <span className="text-slate-500 ml-2 mb-1 text-xs">Recent vs Overall</span>
        </div>
      </div>
    </div>
  );
}
