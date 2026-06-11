'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Analysis {
  id: string;
  score: number;
  atsScore: number;
  createdAt: string;
  resume: {
    fileName: string;
  };
}

export default function HistoryPage() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/history');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch history');
        }

        setAnalyses(data.analyses);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to load history';
        toast.error(message);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [router]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        color: '#f8fafc',
        fontFamily: 'sans-serif'
      }}>
        <h2>Loading history...</h2>
      </div>
    );
  }

  // Stats calculation
  const totalAnalyses = analyses.length;
  const avgScore = totalAnalyses > 0 
    ? Math.round(analyses.reduce((acc, curr) => acc + curr.score, 0) / totalAnalyses) 
    : 0;
  const avgAtsScore = totalAnalyses > 0 
    ? Math.round(analyses.reduce((acc, curr) => acc + curr.atsScore, 0) / totalAnalyses) 
    : 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      color: '#f8fafc',
      fontFamily: 'sans-serif',
      padding: '2rem 1.5rem'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #334155',
        paddingBottom: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0, color: '#60a5fa' }}>
            Analysis History
          </h1>
          <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Track your resume optimization progress over time
          </p>
        </div>
        <button 
          onClick={() => router.push('/dashboard')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '6px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
          onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
        >
          Back to Dashboard
        </button>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ flex: 1, background: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
            <h3 style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Total Analyzed</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0 0 0', color: '#3b82f6' }}>
              {totalAnalyses}
            </p>
          </div>
          <div style={{ flex: 1, background: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
            <h3 style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Average Score</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0 0 0', color: '#10b981' }}>
              {avgScore}%
            </p>
          </div>
          <div style={{ flex: 1, background: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
            <h3 style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Average ATS Score</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0 0 0', color: '#f59e0b' }}>
              {avgAtsScore}%
            </p>
          </div>
        </div>

        {/* History Table/List */}
        <div style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '2rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#cbd5e1' }}>Past Reviews</h2>

          {analyses.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', margin: '2rem 0' }}>
              No analyses found. Head back to the dashboard to analyze a resume!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analyses.map((analysis) => (
                <div 
                  key={analysis.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#0f172a',
                    padding: '1rem 1.5rem',
                    borderRadius: '10px',
                    border: '1px solid #334155',
                    transition: 'transform 0.2s, border-color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = '#475569';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#334155';
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', color: '#f8fafc', margin: 0 }}>
                      {analysis.resume.fileName}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                      Analyzed on: {new Date(analysis.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    {/* Score Badges */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ textAlign: 'center', minWidth: '45px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Score</span>
                        <span style={{ 
                          fontSize: '1.1rem', 
                          fontWeight: 'bold', 
                          color: analysis.score >= 70 ? '#10b981' : analysis.score >= 50 ? '#f59e0b' : '#ef4444' 
                        }}>
                          {analysis.score}
                        </span>
                      </div>
                      <div style={{ textAlign: 'center', minWidth: '45px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>ATS</span>
                        <span style={{ 
                          fontSize: '1.1rem', 
                          fontWeight: 'bold', 
                          color: analysis.atsScore >= 70 ? '#10b981' : analysis.atsScore >= 50 ? '#f59e0b' : '#ef4444' 
                        }}>
                          {analysis.atsScore}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/result/${analysis.id}`)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        background: 'transparent',
                        border: '1px solid #60a5fa',
                        color: '#60a5fa',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(96, 165, 250, 0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      View Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
