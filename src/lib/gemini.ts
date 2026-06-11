import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface AnalysisResult {
  score: number;
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export async function analyzeResume(resumeText: string): Promise<AnalysisResult> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash-lite',
    generationConfig: {
      responseMimeType: 'application/json', // Yeh model ko strictly JSON format mein answer dene par majboor karta hai
    }
  });

  const prompt = `
    You are an expert recruiter and Applicant Tracking System (ATS) professional.
    Analyze the following resume text and provide a structured review in JSON format.
    Your evaluation must strictly follow this JSON schema:
    {
      "score": number (Overall Resume Score out of 100 based on formatting, language, and content),
      "atsScore": number (ATS compatibility score out of 100 based on standard tracking system rules),
      "strengths": string[] (List of 3-5 main professional strengths),
      "weaknesses": string[] (List of 3-5 key areas needing improvement),
      "suggestions": string[] (List of actionable steps to improve the resume)
    }

    Resume text:
    """
    ${resumeText}
    """
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  
  return JSON.parse(responseText) as AnalysisResult;
}
