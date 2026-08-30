'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, ArrowLeft } from 'lucide-react';
import { AnalysisResult, InvestigationResult } from '@/types';

// Components
import MetricsBar from '@/components/MetricsBar';
import TrendChart from '@/components/TrendChart';
import TopicChanges from '@/components/TopicChanges';
import TopicSentiment from '@/components/TopicSentiment';
import AIAlert from '@/components/AIAlert';
import EvidencePanel from '@/components/EvidencePanel';
import SegmentComparison from '@/components/SegmentComparison';
import AnomalyList from '@/components/AnomalyList';
import InvestigationModal from '@/components/InvestigationModal';

export default function Dashboard() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [investigationResult, setInvestigationResult] = useState<InvestigationResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load result from session storage
    const stored = sessionStorage.getItem('signallens_result');
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored result', e);
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [router]);

  const handleInvestigate = async () => {
    if (!result?.analysis_id) {
      alert("Cannot investigate without a saved analysis ID.");
      return;
    }

    setIsInvestigating(true);
    setShowModal(true);
    setInvestigationResult(null);

    try {
      const response = await fetch('/api/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_id: result.analysis_id,
          topic: "Identify the root cause behind the most significant negative changes",
          is_demo: result.is_demo
        })
      });

      if (!response.ok) {
        throw new Error('Investigation failed');
      }

      const data = await response.json();
      setInvestigationResult(data);
    } catch (error) {
      console.error(error);
      setInvestigationResult(null);
    } finally {
      setIsInvestigating(false);
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-200">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="w-6 h-6 text-emerald-400 mr-2" />
            <span className="text-xl font-bold tracking-tight text-white">SignalLens <span className="text-emerald-400">AI</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            {result.is_demo && (
              <span className="px-3 py-1 bg-cyan-900/40 text-cyan-400 border border-cyan-800/60 rounded-full text-xs font-medium uppercase tracking-wider">
                Demo Mode
              </span>
            )}
            <button 
              onClick={() => router.push('/')}
              className="text-slate-400 hover:text-white flex items-center text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> New Analysis
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Top level metrics */}
        <MetricsBar result={result} />

        {/* AI Alert Banner */}
        <AIAlert insight={result.ai_insight} onInvestigate={handleInvestigate} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <TrendChart trends={result.trends} />
          </div>
          <div className="lg:col-span-1">
            <TopicChanges beforeAfter={result.before_after} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <TopicSentiment topics={result.topic_sentiment} />
          </div>
          <div className="lg:col-span-1">
            <SegmentComparison comparisons={result.segment_comparisons} />
          </div>
          <div className="lg:col-span-1">
            <AnomalyList anomalies={result.anomalies} />
          </div>
        </div>

        {/* Evidence Section */}
        <div className="mt-12">
          <EvidencePanel evidence={result.evidence} />
        </div>

      </main>

      {/* Investigation Modal */}
      <InvestigationModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        result={investigationResult}
        isLoading={isInvestigating}
      />
    </div>
  );
}
