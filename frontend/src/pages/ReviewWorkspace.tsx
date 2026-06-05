import { useState } from 'react';
import { BookOpen, Star, Send } from 'lucide-react';
import Topbar from '../components/Topbar';
import api from '../api';

export default function ReviewWorkspace() {
  const [rating, setRating]     = useState(0);
  const [hovered, setHovered]   = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState('');

  async function submitReview() {
    if (!rating || !feedback.trim()) {
      setToast('⚠️ Please provide a rating and feedback!');
      setTimeout(() => setToast(''), 3000);
      return;
    }
    setSubmitting(true);
    try {
      await api.patch('/reviews/RT001/submit', { rating, feedback });
      setToast('✅ Review submitted successfully!');
      setRating(0); setFeedback('');
    } catch {
      setToast('✅ Review saved (demo mode)!');
      setRating(0); setFeedback('');
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(''), 3000);
    }
  }

  return (
    <>
      <Topbar title="Review Workspace" breadcrumb="Workspace" />
      <div className="page-body">
        <div className="page-header">
          <h1>Review Workspace</h1>
          <p>Submit your peer review feedback and rating for the assigned submission.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>
          {/* Submission Preview */}
          <div className="card">
            <div className="card-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="stat-icon" style={{ width: 38, height: 38 }}>
                  <BookOpen size={16} />
                </div>
                <div>
                  <div className="card-title">Submission Preview</div>
                  <div className="card-subtitle">Peer Project Report — Read Only</div>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 24, minHeight: 360, border: '1px dashed var(--border)' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>High Throughput Telemetry Pipeline</h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Submitted by: Emily Smith • Team Alpha • May 1, 2024</p>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  This report presents a distributed telemetry pipeline capable of ingesting
                  over 1 million events per second using Apache Kafka as the message broker,
                  with Apache Flink for real-time stream processing. The system achieves
                  end-to-end latency of under 50 ms at 99th percentile...
                </p>
                <br />
                <div style={{ background: '#F3F4F6', borderRadius: 6, padding: '8px 14px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                  📄 Full PDF report would be embedded here
                </div>
              </div>
            </div>
          </div>

          {/* Review Form */}
          <div className="card" style={{ height: 'fit-content' }}>
            <div className="card-header">
              <div className="card-title">Submit Your Review</div>
              <div className="card-subtitle">Task RT001 • Emily Smith's Submission</div>
            </div>
            <div className="card-body">
              {/* Star Rating */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Overall Rating
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1,2,3,4,5].map(n => (
                    <Star
                      key={n}
                      size={28}
                      fill={n <= (hovered || rating) ? '#F59E0B' : 'none'}
                      color={n <= (hovered || rating) ? '#F59E0B' : 'var(--border)'}
                      style={{ cursor: 'pointer', transition: 'all 0.1s' }}
                      onMouseEnter={() => setHovered(n)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(n)}
                    />
                  ))}
                  {rating > 0 && (
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#F59E0B', alignSelf: 'center', marginLeft: 4 }}>
                      {rating}/5
                    </span>
                  )}
                </div>
              </div>

              {/* Categories */}
              {['Clarity & Structure', 'Technical Depth', 'Originality'].map(cat => (
                <div key={cat} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {cat}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} size={18} fill="none" color="var(--border)" style={{ cursor: 'pointer' }}
                        onClick={() => {}} />
                    ))}
                  </div>
                </div>
              ))}

              {/* Feedback */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Written Feedback
                </div>
                <textarea
                  style={{
                    width: '100%', minHeight: 120,
                    border: '1px solid var(--border)', borderRadius: 8,
                    padding: '10px 12px', fontSize: 13,
                    fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)',
                    resize: 'vertical', outline: 'none', background: 'var(--bg)',
                  }}
                  placeholder="Provide detailed, constructive feedback to help the author improve their work..."
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                />
              </div>

              <button className="run-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={submitReview} disabled={submitting}>
                <Send size={14} />
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.startsWith('✅') ? 'success' : 'error'}`}>
          {toast}
        </div>
      )}
    </>
  );
}
