import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || '',
  },
});

export async function sendOtpEmail(to: string, otpCode: string, name: string) {
  // Development mode fallback: If SMTP is not set up, print OTP to console
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.log('\n=========================================');
    console.log('📨 [DEV SMTP NOT CONFIGURED] OTP EMAIL FALLBACK');
    console.log(`To: ${to}`);
    console.log(`Name: ${name}`);
    console.log(`OTP Code: ${otpCode}`);
    console.log('=========================================\n');
    return;
  }

  try {
    const mailOptions = {
      from: `"AI Resume Analyzer" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Verify Your Email Address - AI Resume Analyzer',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #2563eb; text-align: center;">AI Resume Analyzer</h2>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p>Dear ${name},</p>
          <p>Thank you for registering. Please use the following One-Time Password (OTP) to verify your email address and activate your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; background-color: #f1f5f9; padding: 10px 20px; border-radius: 6px; border: 1px solid #cbd5e1;">
              ${otpCode}
            </span>
          </div>
          <p style="color: #64748b; font-size: 14px;">This OTP code is valid for 10 minutes. Please do not share this code with anyone.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send OTP email via SMTP. Printing to console instead:', error);
    console.log('\n=========================================');
    console.log('📨 [SMTP ERROR] OTP EMAIL FALLBACK');
    console.log(`To: ${to}`);
    console.log(`Name: ${name}`);
    console.log(`OTP Code: ${otpCode}`);
    console.log('=========================================\n');
  }
}
