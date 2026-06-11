import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key-fallback') as {
      userId: string;
      email: string;
    };

    // All analyses for this user's resumes
    const analyses = await db.analysis.findMany({
      where: {
        resume: {
          userId: decoded.userId,
        },
      },
      select: {
        id: true,
        score: true,
        atsScore: true,
        createdAt: true,
        resume: {
          select: {
            fileName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ analyses }, { status: 200 });
  } catch (error) {
    console.error('History API Error:', error);
    return NextResponse.json({ error: 'Unauthorized or failed to fetch history' }, { status: 401 });
  }
}