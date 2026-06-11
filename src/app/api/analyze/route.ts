import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { analyzeResume } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // JWT token decode karein
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key-fallback') as {
      userId: string;
      email: string;
    };

    const body = await req.json();
    const { resumeId } = body;

    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    // Database se resume load karein aur verify karein ki yeh usi user ka hai
    const resume = await db.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume || resume.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    if (!resume.resumeText) {
      return NextResponse.json({ error: 'Resume text is empty. Cannot analyze.' }, { status: 400 });
    }

    // Gemini AI helper function ko call karein
    const analysis = await analyzeResume(resume.resumeText);

    // Analysis ko database mein save karein
    const savedAnalysis = await db.analysis.create({
      data: {
        score: analysis.score,
        atsScore: analysis.atsScore,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        suggestions: analysis.suggestions,
        resumeId: resumeId,
      },
    });

    return NextResponse.json({ analysisId: savedAnalysis.id }, { status: 200 });
  } catch (error) {
    console.error('Analysis API Error:', error);
    return NextResponse.json({ error: 'Failed to analyze resume' }, { status: 500 });
  }
}