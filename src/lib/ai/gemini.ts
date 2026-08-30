import { AIInsight, InvestigationResult, AnalysisResult } from '@/types';
import { mockAiInsight, mockInvestigationResult } from './mock-results';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

export async function generateAnalysisInsight(evidenceData: Partial<AnalysisResult>, useMock = false): Promise<AIInsight> {
  if (useMock || !GEMINI_API_KEY) {
    console.log("Using mock AI insight (demo mode or missing API key)");
    return mockAiInsight;
  }

  const prompt = `
You are an evidence-first business analyst for a restaurant.
I am providing you with statistical evidence from a data science pipeline analyzing recent customer reviews.

EVIDENCE DATA:
${JSON.stringify(evidenceData, null, 2)}

TASK:
Analyze the provided evidence and generate a structured JSON report.
Do not invent facts. Do not claim correlation is causation.
Clearly distinguish observed findings from hypotheses.

Respond ONLY with a valid JSON object matching exactly this structure, with no markdown formatting or code blocks around it:
{
  "what_changed": "A brief 1-2 sentence summary of the most significant changes observed in the data.",
  "why_hypothesis": "Your hypothesis for WHY these changes might have occurred, based ONLY on the evidence provided.",
  "evidence_citations": ["List", "of", "3-4", "specific data points from the evidence that support your hypothesis"],
  "supporting_evidence": [
    {"metric": "Name of metric", "detail": "Specific change in metric"}
  ],
  "recommended_investigation": ["List", "of", "3-4", "actionable things the business should investigate internally (e.g., check staff schedules, review kitchen ticket times)"],
  "confidence_level": "high or medium or low",
  "disclaimer": "AI-generated hypothesis based on statistical text analysis. Not confirmed causation."
}
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API returned ${response.status}`);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error("Empty response from Gemini");
    }

    // Try to parse the JSON response
    try {
      const insight = JSON.parse(textResponse) as AIInsight;
      return insight;
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", textResponse);
      // Fallback to mock if parsing fails
      return mockAiInsight;
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return mockAiInsight;
  }
}

export async function generateInvestigation(
  analysisData: Partial<AnalysisResult>,
  topic: string,
  useMock = false
): Promise<InvestigationResult> {
  if (useMock || !GEMINI_API_KEY) {
    return {
      ...mockInvestigationResult,
      topic: topic || mockInvestigationResult.topic
    };
  }

  const prompt = `
You are an evidence-first business analyst for a restaurant.
I am providing you with statistical evidence from a data science pipeline analyzing recent customer reviews.

EVIDENCE DATA:
${JSON.stringify(analysisData.evidence, null, 2)}
TRENDS:
${JSON.stringify(analysisData.trends, null, 2)}

TASK:
The user has asked to investigate the topic: "${topic}".
Look through the evidence and generate a focused investigation report.
Do not invent facts.

Respond ONLY with a valid JSON object matching exactly this structure, with no markdown formatting or code blocks around it:
{
  "topic": "${topic}",
  "possible_explanation": "A 1-2 sentence explanation of what might be happening regarding this specific topic.",
  "evidence": [
    {"metric": "Name of metric", "value": "Value or change (e.g. '+187%')"}
  ],
  "hypothesis": "Your specific operational hypothesis.",
  "hypothesis_disclaimer": "This is an AI-generated hypothesis derived from text patterns and should be validated with internal operational data.",
  "recommended_actions": ["List", "of", "2-3", "specific actionable investigations"],
  "confidence": "high or medium or low"
}
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned ${response.status}`);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    try {
      const result = JSON.parse(textResponse) as InvestigationResult;
      return result;
    } catch (e) {
      return mockInvestigationResult;
    }
  } catch (error) {
    console.error("Error in generateInvestigation:", error);
    return mockInvestigationResult;
  }
}
