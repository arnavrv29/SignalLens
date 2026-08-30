'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendsData } from '@/types';

interface TrendChartProps {
  trends: TrendsData;
}

export default function TrendChart({ trends }: TrendChartProps) {
  if (!trends || !trends.monthly_trends || trends.monthly_trends.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 h-80 flex items-center justify-center text-slate-500">
        Insufficient data for trend analysis
      </div>
    );
  }

  // Format data for chart
  const chartData = trends.monthly_trends.map(t => ({
    name: t.period,
    rating: t.avg_rating,
    sentiment: t.avg_sentiment * 5, // Scale sentiment for visualization on similar axis
    reviews: t.review_count
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          <p className="text-emerald-400 text-sm">
            Avg Rating: <span className="font-semibold">{payload[0]?.value.toFixed(2)}</span>
          </p>
          <p className="text-cyan-400 text-sm">
            Reviews: <span className="font-semibold">{payload[1]?.payload.reviews}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-medium text-slate-200 mb-6">Rating Trends Over Time</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#475569" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              stroke="#475569"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickMargin={10}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="rating" 
              name="Avg Rating"
              stroke="#34d399" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#34d399', strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
