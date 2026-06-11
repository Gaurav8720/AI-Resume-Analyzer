import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as z from 'zod';
import { sendOtpEmail } from '@/lib/email';

const resendSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = resendSchema.parse(body);
    const { email } = validatedData;

    // Find user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ error: 'Email is already verified' }, { status: 400 });
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update in database
    await db.user.update({
      where: { email },
      data: {
        otpCode,
        otpExpires,
      },
    });

    // Send email
    await sendOtpEmail(email, otpCode, user.name);

    return NextResponse.json({ message: 'Verification code resent successfully!' }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Resend OTP Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
