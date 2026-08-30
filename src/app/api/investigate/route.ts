import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisRun } from '@/lib/database/local';
import { generateInvestigation } from '@/lib/ai/gemini';
import { AnalysisResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysis_id, topic, is_demo } = body;

    if (!analysis_id || !topic) {
      return NextResponse.json(
        { error: true, message: 'Missing analysis_id or topic' },
        { status: 400 }
      );
    }

    // Fetch the analysis run from Local Storage
    const analysisData = await getAnalysisRun(analysis_id);
    
    if (!analysisData) {
      return NextResponse.json(
        { error: true, message: 'Analysis run not found' },
        { status: 404 }
      );
    }

    console.log(`Generating investigation for topic: ${topic}`);
    
    // Check if we should use mock AI
    // We use mock if explicitly asked (demo mode usually doesn't mean mock AI, 
    // but we can pass a flag, or if the original analysis used mock AI)
    const useMock = is_demo || analysisData.is_mock_ai || !process.env.GEMINI_API_KEY;

    // Generate the focused investigation
    const investigation = await generateInvestigation(
      analysisData as Partial<AnalysisResult>, 
      topic,
      useMock
    );

    return NextResponse.json(investigation);
    
  } catch (error: any) {
    console.error('Investigation API Error:', error);
    return NextResponse.json({ 
      error: true, 
      message: error.message || 'An unexpected error occurred during investigation'
    }, { status: 500 });
  }
}
