import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { PDFParse } from 'pdf-parse';

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

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // File type check
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // File to Buffer conversion
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // PDF se text extract karein (using pdf-parse)
    let extractedText = '';
    try {
      const parser = new PDFParse({ data: buffer });
      const textResult = await parser.getText();
      extractedText = textResult.text || '';
    } catch (parseError) {
      console.error('PDF Parse Error:', parseError);
      return NextResponse.json({ error: 'Failed to extract text from PDF' }, { status: 400 });
    }

    // Convert PDF file buffer to base64 string
    const base64Data = buffer.toString('base64');

    // Create the resume entry in database first to get the ID
    const resume = await db.resume.create({
      data: {
        fileName: file.name,
        fileUrl: '', // Will update in next step with dynamic id
        fileData: base64Data,
        resumeText: extractedText,
        userId: decoded.userId,
      },
    });

    // Update the fileUrl to point to our view API route dynamically
    const fileUrl = `/api/resume/${resume.id}/view`;
    
    const updatedResume = await db.resume.update({
      where: { id: resume.id },
      data: { fileUrl },
    });

    return NextResponse.json(
      { message: 'Resume uploaded and text extracted successfully!', resume: updatedResume },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to process upload' }, { status: 500 });
  }
}
