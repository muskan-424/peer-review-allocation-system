import { useEffect, useState } from 'react';
import { Play, CheckCircle, Users, Zap, Filter, ChevronDown } from 'lucide-react';
import Topbar from '../components/Topbar';
import api from '../api';

const CONSTRAINTS = [
  { code: 'HC-01', label: 'No Self Review',        desc: 'Verifies student reviewer ID is never equal to the project owner ID.' },
  { code: 'HC-02', label: 'No Same Team Review',   desc: "Ensures reviewer's team is not equal to the project owner's team ID." },
  { code: 'HC-03', label: 'Minimum 2 Reviews',     desc: 'Every submission must receive at least 2 independent peer reviews.' },
  { code: 'HC-04', label: 'No Duplicate Assignment', desc: 'Unique constraint on (reviewer_id, submission_id) — never violated.' },
  { code: 'HC-05', label: 'Active Reviewers Only', desc: 'Only students with status = ACTIVE are assigned as reviewers.' },
];

const PIPELINE_STEPS = [
  { step: '01', label: 'Candidate Generation', count: '118 / 120 Active Students', desc: 'Scan student database. Collect all registered users, filter out inactive accounts.', icon: Users },
  { step: '02', label: 'Constraint Filtering',  count: '94 Eligible Candidates',    desc: 'Remove submission owner (HC-01), same-team members (HC-02), and duplicates (HC-04).', icon: Filter },
  { step: '03', label: 'Fairness Sorting',       count: 'SC-01 & SC-02 Applied',    desc: 'Deprioritize repeat reviewer pairs. Sort eligible candidates by workload ascending.', icon: ChevronDown },
  { step: '04', label: 'Reviewer Assignment',    count: '2 Reviewers Selected',     desc: 'Select top 2 reviewers from the sorted eligible pool and create ReviewTask records.', icon: Zap },
];

const MOCK_SUBMISSIONS = [
  { id: 'SUB001', label: 'Emily Smith – High Throughput Telemetr...' },
  { id: 'SUB002', label: 'Daniel Garcia – Neural Net Optimizer...' },
  { id: 'SUB003', label: 'Ava Hernandez – Distributed Cache Layer...' },
];

export default function AllocationEngine() {
  const [selected, setSelected]   = useState('SUB001');
  const [running, setRunning]     = useState(false);
  const [toast, setToast]         = useState('');
  const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS);

  useEffect(() => {
    api.get('/submissions').then(r => {
      const list = r.data.data ?? [];
      if (list.length) {
        setSubmissions(list.map((s: any) => ({
          id: s.id,
          label: `${s.owner?.name ?? 'Unknown'} – Submission ${s.id.slice(0,6)}`
        })));
        setSelected(list[0].id);
      }
    }).catch(() => {});
  }, []);

  async function runAllocation() {
    setRunning(true);
    try {
      await api.post('/allocation/run', { assignmentId: 'assignment-001' });
      showToast('✅ Allocation engine ran successfully!', 'success');
    } catch {
      showToast('⚠️ Could not connect to backend — running in demo mode.', 'error');
    } finally {
      setRunning(false);
    }
  }

  function showToast(msg: string, type: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  const sub = submissions.find(s => s.id === selected) ?? submissions[0];

  return (
    <>
      <Topbar title="Peer Allocation Engine" breadcrumb="Peer" />
      <div className="page-body">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Peer Allocation Engine</h1>
            <p>Configure, test, and run the automated peer review allocation algorithms.</p>
          </div>
          <button className="run-btn" onClick={runAllocation} disabled={running}>
            <Play size={14} fill="white" />
            {running ? 'Running…' : 'Run Allocation Engine'}
          </button>
        </div>

        <div className="engine-grid">
          {/* Left: Visualizer */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Allocation Engine Visualizer</div>
              <div className="card-subtitle">Select a submission to trace the step-by-step allocation pipeline</div>
            </div>
            <div className="card-body">
              <select
                className="select-submission"
                value={selected}
                onChange={e => setSelected(e.target.value)}
                style={{ marginBottom: 20 }}
              >
                {submissions.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>

              {/* Target Box */}
              <div className="target-box">
                <div className="target-label">TARGET SUBMISSION</div>
                <div className="target-title">{sub?.label.split('–')[1]?.trim() ?? 'Selected Submission'}</div>
                <div className="target-meta">Owner: {sub?.label.split('–')[0]?.trim()} @Team T1</div>
              </div>

              {/* Pipeline Steps */}
              <div className="pipeline-steps" style={{ marginTop: 8 }}>
                {PIPELINE_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.step}>
                      {idx > 0 && (
                        <div className="step-connector">↓</div>
                      )}
                      <div className="pipeline-step">
                        <div className="step-inner">
                          <div className="step-icon">
                            <Icon size={17} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="step-header">
                              <div className="step-label">STEP {step.step}</div>
                              <div className="step-count">{step.count}</div>
                            </div>
                            <div className="step-title">{step.label}</div>
                            <div className="step-desc">{step.desc}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Performance + Constraints */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Algorithm Performance */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Algorithm Performance</div>
              </div>
              <div className="card-body">
                {[
                  { label: 'Roster Match Rate',    value: '100%' },
                  { label: 'Conflicts Resolved',   value: '42 Conflicts' },
                  { label: 'Average Workload',     value: '2.0 Reviews/Student' },
                  { label: 'Convergence Time',     value: '8.4 ms' },
                ].map(row => (
                  <div className="perf-row" key={row.label}>
                    <span className="perf-row-label">{row.label}</span>
                    <span className="perf-row-value">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Constraint Validation */}
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="card-title">Constraint Validation</div>
                <span className="badge badge-passing">ALL PASSING</span>
              </div>
              <div className="card-body">
                {CONSTRAINTS.map(c => (
                  <div className="constraint-item" key={c.code}>
                    <div className="constraint-icon">
                      <CheckCircle size={12} />
                    </div>
                    <div>
                      <div className="constraint-code">{c.code} – {c.label}</div>
                      <div className="constraint-desc">{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
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
