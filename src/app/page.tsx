import Link from 'next/link';
export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top, #1e293b, #0f172a)',
      color: '#f8fafc',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{
        fontSize: '3.5rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        background: 'linear-gradient(to right, #60a5fa, #3b82f6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        AI Resume Analyzer
      </h1>
      <p style={{
        fontSize: '1.2rem',
        color: '#94a3b8',
        maxWidth: '600px',
        marginBottom: '2.5rem',
        lineHeight: '1.6'
      }}>
        Upload your PDF resume, receive immediate ATS compatibility scores, highlight key strengths, identify weaknesses, and get AI-powered improvement suggestions.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link href="/login" style={{
          padding: '0.8rem 2rem',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          color: '#ffffff',
          fontWeight: '600',
          boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
          transition: 'transform 0.2s'
        }}>
          Log In
        </Link>
        <Link href="/register" style={{
          padding: '0.8rem 2rem',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          color: '#cbd5e1',
          fontWeight: '600',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          transition: 'background 0.2s'
        }}>
          Register
        </Link>
      </div>
    </div>
  );
}