import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: resumeId } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return new Response('Unauthorized', { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key-fallback') as {
      userId: string;
      email: string;
    };

    // Find the resume in the database
    const resume = await db.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume || !resume.fileData) {
      return new Response('Resume file not found', { status: 404 });
    }

    // Verify ownership
    if (resume.userId !== decoded.userId) {
      return new Response('Unauthorized', { status: 403 });
    }

    // Convert base64 string back to binary buffer
    const pdfBuffer = Buffer.from(resume.fileData, 'base64');

    // Return the PDF directly with inline header to view in browser
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${encodeURIComponent(resume.fileName)}"`,
      },
    });
  } catch (error) {
    console.error('Error viewing resume PDF:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
