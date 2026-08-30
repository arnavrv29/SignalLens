'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { TopicSentiment as TopicSentimentType } from '@/types';

interface TopicSentimentProps {
  topics: TopicSentimentType[];
}

export default function TopicSentiment({ topics }: TopicSentimentProps) {
  if (!topics || topics.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 h-80 flex items-center justify-center text-slate-500">
        Insufficient data for topic sentiment
      </div>
    );
  }

  // Sort by sentiment (lowest first) and format
  const chartData = [...topics]
    .sort((a, b) => a.avg_sentiment - b.avg_sentiment)
    .slice(0, 8)
    .map(t => ({
      name: t.topic,
      sentiment: t.avg_sentiment,
      sampleSize: t.sample_size
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          <p className="text-slate-300 text-sm">
            Avg Sentiment: <span className="font-semibold text-white">{payload[0].value.toFixed(2)}</span>
          </p>
          <p className="text-slate-400 text-xs mt-1">
            ({payload[0].payload.sampleSize} reviews)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-medium text-slate-200 mb-6">Sentiment by Topic</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
            <XAxis 
              type="number" 
              domain={[-1, 1]} 
              stroke="#475569"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              stroke="#475569"
              tick={{ fill: '#cbd5e1', fontSize: 12 }}
              width={100}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
            <Bar dataKey="sentiment" radius={[0, 4, 4, 0]} barSize={20}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.sentiment < 0 ? '#f87171' : '#34d399'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
