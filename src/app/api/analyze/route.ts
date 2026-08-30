import { NextRequest, NextResponse } from 'next/server';
import { generateDemoDataset, reviewsToCsv } from '@/data/demo-dataset';
import { sanitizeText } from '@/lib/privacy';
import { saveAnalysisRun } from '@/lib/database/local';
import { generateAnalysisInsight } from '@/lib/ai/gemini';
import { AnalysisResult } from '@/types';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  let tempCsvPath = '';
  
  try {
    const body = await request.json();
    const isDemo = body.isDemo === true;
    let csvData = body.csvData;

    // Handle demo dataset
    if (isDemo) {
      console.log('Generating demo dataset...');
      const reviews = generateDemoDataset();
      csvData = reviewsToCsv(reviews);
    } else if (!csvData) {
      return NextResponse.json({ error: true, message: 'No CSV data provided' }, { status: 400 });
    }

    // Write to a temporary file
    const tempDir = os.tmpdir();
    tempCsvPath = path.join(tempDir, `signallens_${Date.now()}.csv`);
    
    // Privacy sanitation happens here in a real scenario
    // For this MVP, we're assuming the file is already a string we can write
    await fs.writeFile(tempCsvPath, csvData, 'utf-8');
    
    console.log(`Saved CSV to ${tempCsvPath}, invoking Python pipeline...`);

    // Determine path to pipeline.py
    // Next.js runs from project root
    const pipelinePath = path.join(process.cwd(), 'analytics', 'pipeline.py');
    
    // Check if python is available
    let pythonCmd = 'python';
    try {
      await execAsync('python --version');
    } catch (e) {
      try {
        await execAsync('python3 --version');
        pythonCmd = 'python3';
      } catch (e2) {
        console.error('Python not found on system.');
        throw new Error('Python is not installed or available in PATH. The analytics pipeline requires Python.');
      }
    }

    // Run the pipeline
    const { stdout, stderr } = await execAsync(`"${pythonCmd}" "${pipelinePath}" "${tempCsvPath}"`);
    
    if (stderr && !stderr.includes('FutureWarning') && !stderr.includes('DeprecationWarning')) {
      console.warn("Python stderr:", stderr);
    }

    // Parse the result
    let result: AnalysisResult;
    try {
      result = JSON.parse(stdout);
      if (result.error) {
        throw new Error(result.message || 'Pipeline returned an error');
      }
    } catch (e) {
      console.error("Failed to parse Python output:", stdout.substring(0, 500) + "...");
      throw new Error('Failed to parse analytics pipeline output');
    }

    // Generate AI Insight
    console.log('Generating AI insights...');
    try {
      const insight = await generateAnalysisInsight(result, false);
      result.ai_insight = insight;
    } catch (e) {
      console.error('AI generation failed, using mock');
      const insight = await generateAnalysisInsight(result, true);
      result.ai_insight = insight;
      result.is_mock_ai = true;
    }
    
    result.is_demo = isDemo;

    // Save to database
    console.log('Saving to database...');
    const analysisId = await saveAnalysisRun(result);
    result.analysis_id = analysisId;

    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Analysis API Error:', error);
    return NextResponse.json({ 
      error: true, 
      message: error.message || 'An unexpected error occurred during analysis'
    }, { status: 500 });
  } finally {
    // Clean up temporary file
    if (tempCsvPath) {
      try {
        await fs.unlink(tempCsvPath);
      } catch (e) {
        console.error(`Failed to delete temporary file ${tempCsvPath}:`, e);
      }
    }
  }
}
