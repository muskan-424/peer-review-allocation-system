import { useEffect, useState } from 'react';
import { FileText, ChevronsUpDown } from 'lucide-react';
import Topbar from '../components/Topbar';
import api from '../api';

const STATUS_COLORS: Record<string, string> = {
  PENDING:      'badge-team',
  UNDER_REVIEW: 'badge-active',
  COMPLETE:     'badge-passing',
};

export default function Submissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    api.get('/submissions')
      .then(r => setSubmissions(r.data.data ?? []))
      .catch(() => {
        setSubmissions([
          { id: 'SUB001', assignmentId: 'assignment-001', owner: { name: 'Emily Smith'   }, status: 'PENDING',      reviewCount: 0, submittedAt: new Date().toISOString() },
          { id: 'SUB002', assignmentId: 'assignment-001', owner: { name: 'Daniel Garcia'  }, status: 'UNDER_REVIEW', reviewCount: 1, submittedAt: new Date().toISOString() },
          { id: 'SUB003', assignmentId: 'assignment-001', owner: { name: 'Ava Hernandez'  }, status: 'COMPLETE',     reviewCount: 2, submittedAt: new Date().toISOString() },
          { id: 'SUB004', assignmentId: 'assignment-001', owner: { name: 'Ethan Thomas'   }, status: 'PENDING',      reviewCount: 0, submittedAt: new Date().toISOString() },
          { id: 'SUB005', assignmentId: 'assignment-001', owner: { name: 'Charlotte Lee'  }, status: 'UNDER_REVIEW', reviewCount: 1, submittedAt: new Date().toISOString() },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Topbar title="Submissions" breadcrumb="Submissions" />
      <div className="page-body">
        <div className="page-header">
          <h1>Submissions</h1>
          <p>Track all student assignment submissions and their review allocation status.</p>
        </div>
        <div className="card">
          {loading ? (
            <div className="loading"><div className="spinner" /><span>Loading submissions…</span></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th><span className="sort-header">Submission ID <ChevronsUpDown size={12}/></span></th>
                  <th><span className="sort-header">Owner <ChevronsUpDown size={12}/></span></th>
                  <th>Assignment</th>
                  <th><span className="sort-header">Status <ChevronsUpDown size={12}/></span></th>
                  <th>Reviews</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s, i) => (
                  <tr key={s.id ?? i}>
                    <td style={{ fontWeight: 600, fontSize: 12, color: 'var(--primary)' }}>
                      {s.id?.slice(0, 8).toUpperCase()}
                    </td>
                    <td>
                      <div className="avatar-cell">
                        <div className="avatar-circle" style={{ background: '#7C3AED' }}>
                          {s.owner?.name?.charAt(0) ?? '?'}
                        </div>
                        {s.owner?.name ?? '—'}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{s.assignmentId}</td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[s.status] ?? 'badge-inactive'}`}>
                        {s.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{s.reviewCount ?? 0} / 2</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {new Date(s.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
