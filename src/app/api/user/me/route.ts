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

    // Token decode karein
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key-fallback') as {
      userId: string;
      email: string;
    };

    // Database se user, email aur unke uploaded resumes select karein
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        name: true,
        email: true,
        resumes: {
          select: {
            id: true,
            fileName: true,
            fileUrl: true,
            createdAt: true,
            analyses: {
              select: {
                id: true,
                score: true, // Selected score to calculate average
              },
              take: 1,
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized or invalid token' }, { status: 401 });
  }
}
