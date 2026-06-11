'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
interface Analysis {
  id: string;
  score: number; // Added score property
}
interface Resume {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
  analyses: Analysis[];
}
interface User {
  name: string;
  email: string;
  resumes: Resume[];
}
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  // User ka data aur uploads fetch karne ka function
  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/user/me');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user data');
      }
      setUser(data.user);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast.error(message);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);
  // File Select handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed!');
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };
  // Upload handler
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file first!');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      toast.success('Resume uploaded successfully!');
      setFile(null);
      
      // Reset input element
      const fileInput = document.getElementById('resume-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      // Re-fetch data to show the new resume in list
      fetchUserData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };
  // AI Analysis trigger handler
  const handleAnalyze = async (resumeId: string) => {
    setAnalyzingId(resumeId);
    toast.loading('Analyzing resume with Gemini AI...', { id: 'analyze-loading' });
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }
      toast.success('Analysis complete!', { id: 'analyze-loading' });
      // Redirect to the dynamic result page
      router.push(`/result/${data.analysisId}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Analysis failed';
      toast.error(message, { id: 'analyze-loading' });
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume and all its analyses? This action cannot be undone.')) {
      return;
    }

    toast.loading('Deleting resume...', { id: 'delete-loading' });

    try {
      const response = await fetch(`/api/resume/${resumeId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete resume');
      }

      toast.success('Resume deleted successfully!', { id: 'delete-loading' });
      fetchUserData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Delete failed';
      toast.error(message, { id: 'delete-loading' });
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      toast.error(message);
    }
  };
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
        <h2>Loading user dashboard...</h2>
      </div>
    );
  }
  // Calculate dynamic Average Score
  const analyzedResumes = user?.resumes.filter(r => r.analyses && r.analyses.length > 0) || [];
  const averageScore = analyzedResumes.length > 0
    ? Math.round(analyzedResumes.reduce((acc, curr) => acc + curr.analyses[0].score, 0) / analyzedResumes.length)
    : 0;
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      color: '#f8fafc',
      fontFamily: 'sans-serif',
      padding: '2rem 1.5rem'
    }}>
      {/* Header Area */}
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
            Welcome, {user?.name}!
          </h1>
          <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            {user?.email}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={() => router.push('/history')}
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
            History
          </button>
          <button 
            onClick={handleLogout}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '6px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#dc2626'}
            onMouseOut={(e) => e.currentTarget.style.background = '#ef4444'}
          >
            Log Out
          </button>
        </div>
      </div>
      {/* Main Content Dashboard */}
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Statistics Cards */}
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ flex: 1, background: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
            <h3 style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Total Resumes</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0 0 0', color: '#3b82f6' }}>
              {user?.resumes.length || 0}
            </p>
          </div>
          <div style={{ flex: 1, background: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
            <h3 style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Average Score</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0 0 0', color: '#10b981' }}>
              {averageScore}%
            </p>
          </div>
        </div>
        {/* Upload Form Box */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '2rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#cbd5e1' }}>Upload Resume</h2>
          <form onSubmit={handleUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input 
              id="resume-file-input"
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#0f172a',
                border: '1px dashed #475569',
                borderRadius: '8px',
                color: '#cbd5e1',
                cursor: 'pointer'
              }}
            />
            <button
              type="submit"
              disabled={uploading || !file}
              style={{
                padding: '0.8rem 1.5rem',
                borderRadius: '8px',
                background: file ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#475569',
                color: 'white',
                border: 'none',
                cursor: file ? 'pointer' : 'not-allowed',
                fontWeight: '600',
                transition: 'opacity 0.2s'
              }}
            >
              {uploading ? 'Uploading...' : 'Upload PDF'}
            </button>
          </form>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
            * Supported format: PDF only (Max 5MB)
          </p>
        </div>
        {/* Uploaded Resumes List */}
        <div style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '2rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#cbd5e1' }}>Your Resumes</h2>
          
          {!user?.resumes || user.resumes.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', margin: '2rem 0' }}>
              No resumes uploaded yet. Upload your first resume above!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {user.resumes.map((resume) => {
                const hasAnalysis = resume.analyses && resume.analyses.length > 0;
                const latestAnalysisId = hasAnalysis ? resume.analyses[0].id : null;
                return (
                  <div 
                    key={resume.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#0f172a',
                      padding: '1rem 1.5rem',
                      borderRadius: '10px',
                      border: '1px solid #334155'
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: '600', color: '#f8fafc', margin: 0 }}>
                        {resume.fileName}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                        Uploaded on: {new Date(resume.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <a 
                        href={resume.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.875rem',
                          color: '#94a3b8',
                          fontWeight: '500',
                          textDecoration: 'none',
                          border: '1px solid #475569',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '6px',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        View PDF
                      </a>
                      {hasAnalysis ? (
                        <button
                          onClick={() => router.push(`/result/${latestAnalysisId}`)}
                          style={{
                            fontSize: '0.875rem',
                            color: '#10b981',
                            fontWeight: '600',
                            background: 'transparent',
                            border: '1px solid #10b981',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          View Report
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAnalyze(resume.id)}
                          disabled={analyzingId !== null}
                          style={{
                            fontSize: '0.875rem',
                            color: '#60a5fa',
                            fontWeight: '600',
                            background: 'transparent',
                            border: '1px solid #3b82f6',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            cursor: analyzingId ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            if (!analyzingId) e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                          }}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          {analyzingId === resume.id ? 'Analyzing...' : 'Analyze'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(resume.id)}
                        style={{
                          fontSize: '0.875rem',
                          color: '#ef4444',
                          fontWeight: '600',
                          background: 'transparent',
                          border: '1px solid #ef4444',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}