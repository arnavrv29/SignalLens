import { BeforeAfterComparison, TopicChange } from '@/types';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface TopicChangesProps {
  beforeAfter: BeforeAfterComparison;
}

export default function TopicChanges({ beforeAfter }: TopicChangesProps) {
  if (!beforeAfter.change_detected || !beforeAfter.topic_changes) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-medium text-slate-200 mb-2">Topic Changes</h3>
        <p className="text-slate-500 text-sm">No significant change period detected in the data.</p>
      </div>
    );
  }

  // Get top 4 most changed topics
  const topChanges = [...beforeAfter.topic_changes]
    .sort((a, b) => Math.abs(b.frequency_change_pct) - Math.abs(a.frequency_change_pct))
    .slice(0, 4);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-lg font-medium text-slate-200">Top Topic Changes</h3>
          <p className="text-xs text-slate-500 mt-1">
            After change point: <span className="text-slate-400 font-medium">{beforeAfter.change_point}</span>
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {topChanges.map((topic, idx) => {
          const isIncrease = topic.frequency_change_pct > 0;
          const isSignificant = Math.abs(topic.frequency_change_pct) > 50;
          
          return (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-800/80 hover:bg-slate-800/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${isIncrease 
                    ? isSignificant ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400' 
                    : 'bg-emerald-500/20 text-emerald-400'}
                `}>
                  {isIncrease ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-200">{topic.topic}</h4>
                  <p className="text-xs text-slate-500">
                    {topic.before_frequency_pct.toFixed(1)}% → {topic.after_frequency_pct.toFixed(1)}% of reviews
                  </p>
                </div>
              </div>
              <div className={`text-right font-bold ${
                isIncrease 
                  ? isSignificant ? 'text-red-400' : 'text-amber-400'
                  : 'text-emerald-400'
              }`}>
                {isIncrease ? '+' : ''}{topic.frequency_change_pct.toFixed(0)}%
              </div>
            </div>
          );
        })}

        {topChanges.length === 0 && (
          <div className="text-center py-6 text-slate-500 text-sm">
            No significant topic shifts detected.
          </div>
        )}
      </div>
    </div>
  );
}
