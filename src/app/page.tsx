import UploadZone from '@/components/UploadZone';
import { Activity } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 lg:py-20 flex flex-col items-center">
        {/* Header/Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-slate-900 border border-slate-800 rounded-2xl mb-6 shadow-xl shadow-black/50">
            <Activity className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
            SignalLens <span className="text-emerald-400">AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Find what changed. Understand why. Know what to investigate next.
          </p>
        </div>

        {/* Upload Zone */}
        <UploadZone />
        
        {/* Features minimal footer */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-slate-800/50 pt-12 max-w-4xl w-full">
          <div>
            <h4 className="text-slate-300 font-medium mb-2">Temporal Analytics</h4>
            <p className="text-slate-500 text-sm">Automatically detects when satisfaction changes and isolates the specific time period.</p>
          </div>
          <div>
            <h4 className="text-slate-300 font-medium mb-2">Topic Segmentation</h4>
            <p className="text-slate-500 text-sm">Breaks down feedback into granular topics to find exactly what's driving the change.</p>
          </div>
          <div>
            <h4 className="text-slate-300 font-medium mb-2">AI Root-Cause</h4>
            <p className="text-slate-500 text-sm">Generates evidence-backed hypotheses and recommends specific operational investigations.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
