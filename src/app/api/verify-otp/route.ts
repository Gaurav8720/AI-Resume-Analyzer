import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as z from 'zod';

const verifySchema = z.object({
  email: z.string().email('Invalid email address'),
  otpCode: z.string().length(6, 'Verification code must be exactly 6 digits'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = verifySchema.parse(body);
    const { email, otpCode } = validatedData;

    // Find user in database
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: 'Email is already verified' }, { status: 200 });
    }

    // Verify OTP code
    if (!user.otpCode || user.otpCode !== otpCode) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Check expiration
    if (!user.otpExpires || new Date() > new Date(user.otpExpires)) {
      return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    // Update user status
    await db.user.update({
      where: { email },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpires: null,
      },
    });

    return NextResponse.json({ message: 'Email verified successfully! You can now log in.' }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('OTP Verification Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
