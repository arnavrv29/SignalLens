import { SegmentComparison as SegmentComparisonType } from '@/types';
import { Users, Calendar, MapPin, Tag } from 'lucide-react';

interface SegmentComparisonProps {
  comparisons: SegmentComparisonType[];
}

export default function SegmentComparison({ comparisons }: SegmentComparisonProps) {
  if (!comparisons || comparisons.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 h-80 flex items-center justify-center text-slate-500">
        Insufficient data for segment comparison
      </div>
    );
  }

  const getIcon = (type: string) => {
    if (type.includes('day')) return <Calendar className="w-4 h-4" />;
    if (type.includes('location')) return <MapPin className="w-4 h-4" />;
    if (type.includes('visit')) return <Users className="w-4 h-4" />;
    return <Tag className="w-4 h-4" />;
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-medium text-slate-200 mb-6">Performance by Segment</h3>
      
      <div className="space-y-6">
        {comparisons.slice(0, 3).map((comp, idx) => (
          <div key={idx} className="bg-slate-800/20 rounded-lg border border-slate-800 p-4">
            <h4 className="flex items-center text-sm font-medium text-slate-300 mb-4 pb-2 border-b border-slate-800">
              <span className="bg-slate-800 p-1.5 rounded mr-2 text-cyan-400">
                {getIcon(comp.segment_type)}
              </span>
              {comp.segment_label} Comparison
            </h4>
            
            <div className="space-y-3">
              {comp.segments.map((seg, sIdx) => {
                // Calculate width relative to max rating (5.0)
                const widthPct = Math.max(10, (seg.avg_rating / 5.0) * 100);
                
                // Color based on rating
                let colorClass = "bg-emerald-500";
                if (seg.avg_rating < 3.0) colorClass = "bg-red-500";
                else if (seg.avg_rating < 4.0) colorClass = "bg-amber-500";
                else if (seg.avg_rating > 4.5) colorClass = "bg-emerald-400";
                
                return (
                  <div key={sIdx} className="relative">
                    <div className="flex justify-between items-end mb-1 text-xs">
                      <span className="font-medium text-slate-300 capitalize">{seg.segment_value}</span>
                      <span className="text-slate-400">
                        {seg.avg_rating.toFixed(2)} <span className="text-slate-600">({seg.count})</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colorClass} rounded-full`}
                        style={{ width: `${widthPct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
