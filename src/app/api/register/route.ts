import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import * as z from 'zod';
import { sendOtpEmail } from '@/lib/email';

// Input ko validate karne ke liye Zod schema definition
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Zod se check karein ki data sahi format mein hai ya nahi
    const validatedData = registerSchema.parse(body);
    const { name, email, password } = validatedData;

    // Check karein ki user email pehle se exist to nahi karta
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user exists but is not verified, we can overwrite their OTP and resend it
      if (!existingUser.isVerified) {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.user.update({
          where: { email },
          data: {
            name,
            password: hashedPassword,
            otpCode,
            otpExpires,
          },
        });

        await sendOtpEmail(email, otpCode, name);

        return NextResponse.json(
          { message: 'Verification code resent. Please verify your email.', email },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Password ko secure hashing format mein convert karein
    const hashedPassword = await bcrypt.hash(password, 10);

    // Database mein entry create karein (unverified by default)
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: false,
        otpCode,
        otpExpires,
      },
    });

    // Send OTP email
    await sendOtpEmail(email, otpCode, name);

    return NextResponse.json(
      { 
        message: 'Registration successful! Verification email sent.', 
        userId: user.id,
        email: user.email
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
