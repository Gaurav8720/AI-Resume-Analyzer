import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params;

  // Database se direct analysis record fetch karein (including resume details)
  const analysis = await db.analysis.findUnique({
    where: { id },
    include: {
      resume: true,
    },
  });

  if (!analysis) {
    notFound();
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, #1e293b, #0f172a)',
      color: '#f8fafc',
      fontFamily: 'sans-serif',
      padding: '3rem 1.5rem'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', margin: 0, color: '#3b82f6' }}>
              Analysis Report
            </h1>
            <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>
              File: {analysis.resume.fileName}
            </p>
          </div>
          <Link href="/dashboard" style={{
            padding: '0.6rem 1.2rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#cbd5e1',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'background 0.2s'
          }}>
            Back to Dashboard
          </Link>
        </div>

        {/* Scores Grid */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {/* Overall Score */}
          <div style={{
            flex: 1,
            background: 'rgba(30, 41, 59, 0.5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '2rem',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Overall Score
            </h3>
            <p style={{ fontSize: '3.5rem', fontWeight: 'bold', margin: '0.5rem 0', color: '#60a5fa' }}>
              {analysis.score}/100
            </p>
            <div style={{ background: '#334155', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ background: '#3b82f6', width: `${analysis.score}%`, height: '100%' }}></div>
            </div>
          </div>

          {/* ATS Score */}
          <div style={{
            flex: 1,
            background: 'rgba(30, 41, 59, 0.5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '2rem',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ATS Compatibility
            </h3>
            <p style={{ fontSize: '3.5rem', fontWeight: 'bold', margin: '0.5rem 0', color: '#10b981' }}>
              {analysis.atsScore}/100
            </p>
            <div style={{ background: '#334155', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ background: '#10b981', width: `${analysis.atsScore}%`, height: '100%' }}></div>
            </div>
          </div>
        </div>

        {/* Detailed Feedback Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Strengths */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '2rem', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>✔</span> Key Strengths
            </h2>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {analysis.strengths.map((strength, index) => (
                <li key={index} style={{ color: '#cbd5e1', lineHeight: '1.5' }}>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '2rem', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>✖</span> Areas for Improvement
            </h2>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {analysis.weaknesses.map((weakness, index) => (
                <li key={index} style={{ color: '#cbd5e1', lineHeight: '1.5' }}>
                  {weakness}
                </li>
              ))}
            </ul>
          </div>

          {/* Suggestions */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '2rem', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>💡</span> Actionable Suggestions
            </h2>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} style={{ color: '#cbd5e1', lineHeight: '1.5' }}>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
