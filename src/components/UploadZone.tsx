'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileText, AlertCircle, PlayCircle } from 'lucide-react';
import { AnalysisResult } from '@/types';

export default function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File is too large. Maximum size is 5MB.');
      return;
    }

    setIsLoading(true);
    
    try {
      const text = await file.text();
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: text, isDemo: false })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      const result = await response.json();
      
      // Store result in sessionStorage to pass to dashboard
      sessionStorage.setItem('signallens_result', JSON.stringify(result));
      router.push('/dashboard');
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during processing.');
      setIsLoading(false);
    }
  };

  const handleDemoClick = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDemo: true })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Demo analysis failed');
      }

      const result = await response.json();
      
      // Store result in sessionStorage
      sessionStorage.setItem('signallens_result', JSON.stringify(result));
      router.push('/dashboard');
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred loading the demo.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 px-4">
      
      {error && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-500/50 rounded-lg flex items-start text-red-200">
          <AlertCircle className="w-5 h-5 mr-3 mt-0.5 text-red-400 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-12 text-center shadow-xl backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-medium text-slate-200 mb-2">Analyzing Customer Feedback</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Our data science pipeline is processing reviews, analyzing sentiment, extracting topics, and finding temporal anomalies...
          </p>
        </div>
      ) : (
        <>
          <div 
            className={`
              relative bg-slate-900/40 border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
              ${isDragging ? 'border-emerald-500 bg-slate-800/60' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/40'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              accept=".csv" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileInput}
              disabled={isLoading}
            />
            
            <div className="flex flex-col items-center justify-center pointer-events-none">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <UploadCloud className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-200 mb-3">Upload Review Dataset</h3>
              <p className="text-slate-400 mb-6 max-w-md">
                Drag and drop your CSV file here, or click to browse. Must contain 'date', 'rating', and 'review_text' columns.
              </p>
              
              <div className="flex items-center text-xs text-slate-500 bg-slate-950/50 px-4 py-2 rounded-full border border-slate-800">
                <FileText className="w-4 h-4 mr-2" />
                CSV files up to 5MB (max 5000 rows)
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center">
            <div className="flex items-center w-full max-w-md mb-8">
              <div className="flex-1 border-t border-slate-800"></div>
              <span className="px-4 text-sm text-slate-500">OR</span>
              <div className="flex-1 border-t border-slate-800"></div>
            </div>

            <button 
              onClick={handleDemoClick}
              disabled={isLoading}
              className="group flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40"
            >
              <PlayCircle className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              Try Demo Dataset
            </button>
            <p className="mt-4 text-sm text-slate-500 text-center max-w-md">
              <span className="text-slate-400 font-medium">Privacy Notice:</span> This is a privacy-safe demo. The pipeline automatically redacts PII before processing. Do not upload sensitive personal information.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
