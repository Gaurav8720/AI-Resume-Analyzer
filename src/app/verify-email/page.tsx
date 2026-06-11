'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import styles from '../login/page.module.css';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    } else {
      toast.error('Email parameter missing. Please register first.');
      router.push('/register');
    }
  }, [emailParam, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code.');
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      toast.success('Email verified successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const response = await fetch('/api/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }

      toast.success('New verification code sent! Check your inbox.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Resend failed';
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Verify Your Email</h1>
      <p className={styles.subtitle}>
        We sent a 6-digit verification code to <br />
        <strong style={{ color: '#60a5fa' }}>{email}</strong>
      </p>

      <form onSubmit={handleVerify} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="otpCode">6-Digit Verification Code</label>
          <input
            id="otpCode"
            type="text"
            maxLength={6}
            value={otpCode}
            onChange={(e) => {
              // Only allow numbers
              const val = e.target.value.replace(/[^0-9]/g, '');
              setOtpCode(val);
            }}
            placeholder="123456"
            style={{
              textAlign: 'center',
              letterSpacing: '12px',
              fontSize: '1.5rem',
              fontWeight: 'bold',
            }}
            required
            disabled={verifying}
          />
        </div>

        <button type="submit" disabled={verifying || otpCode.length !== 6} className={styles.button}>
          {verifying ? 'Verifying...' : 'Verify Code'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#94a3b8' }}>
        Didn&apos;t receive the code?{' '}
        <button
          onClick={handleResend}
          disabled={resending}
          style={{
            background: 'none',
            border: 'none',
            color: '#60a5fa',
            cursor: 'pointer',
            fontWeight: '600',
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          {resending ? 'Sending...' : 'Resend OTP'}
        </button>
      </div>

      <p className={styles.footerText}>
        Back to <Link href="/login">Login</Link> or <Link href="/register">Register</Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={
        <div className={styles.card}>
          <h2 style={{ textAlign: 'center', color: '#60a5fa' }}>Loading verification...</h2>
        </div>
      }>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
