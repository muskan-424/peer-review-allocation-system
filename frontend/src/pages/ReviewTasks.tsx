import { useEffect, useState } from 'react';
import { ClipboardList, ChevronsUpDown } from 'lucide-react';
import Topbar from '../components/Topbar';
import api from '../api';

const STATUS_COLOR: Record<string, string> = {
  PENDING:   'badge-team',
  CLAIMED:   'badge-active',
  SUBMITTED: 'badge-passing',
};

export default function ReviewTasks() {
  const [tasks, setTasks]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reviews/my-tasks')
      .then(r => setTasks(r.data.data ?? []))
      .catch(() => {
        setTasks([
          { id: 'RT001', submission: { owner: { name: 'Emily Smith' }  }, reviewer: { name: 'William Ramirez' }, status: 'SUBMITTED', rating: 4, feedback: 'Good structure.', submittedAt: '2024-05-01' },
          { id: 'RT002', submission: { owner: { name: 'Daniel Garcia' } }, reviewer: { name: 'Olivia Clark'    }, status: 'PENDING',   rating: null, feedback: null, submittedAt: null },
          { id: 'RT003', submission: { owner: { name: 'Ava Hernandez'  } }, reviewer: { name: 'Ethan Thomas'   }, status: 'CLAIMED',   rating: null, feedback: null, submittedAt: null },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Topbar title="Review Tasks" breadcrumb="Review Tasks" />
      <div className="page-body">
        <div className="page-header">
          <h1>Review Tasks</h1>
          <p>Track all allocated review tasks, their status, ratings, and feedback.</p>
        </div>
        <div className="card">
          {loading ? (
            <div className="loading"><div className="spinner" /><span>Loading tasks…</span></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th><span className="sort-header">Task ID <ChevronsUpDown size={12}/></span></th>
                  <th>Submission Owner</th>
                  <th>Reviewer</th>
                  <th><span className="sort-header">Status <ChevronsUpDown size={12}/></span></th>
                  <th>Rating</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t, i) => (
                  <tr key={t.id ?? i}>
                    <td style={{ fontWeight: 700, fontSize: 12, color: 'var(--primary)' }}>{t.id}</td>
                    <td>{t.submission?.owner?.name ?? '—'}</td>
                    <td>
                      <div className="avatar-cell">
                        <div className="avatar-circle" style={{ background: '#059669' }}>
                          {t.reviewer?.name?.charAt(0) ?? '?'}
                        </div>
                        {t.reviewer?.name ?? '—'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_COLOR[t.status] ?? 'badge-inactive'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {t.rating ? (
                        <span style={{ fontWeight: 700 }}>{'⭐'.repeat(t.rating)} {t.rating}/5</span>
                      ) : '—'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12, maxWidth: 200 }}>
                      {t.feedback ?? '—'}
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
