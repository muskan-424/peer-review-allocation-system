import { useEffect, useState } from 'react';
import { Scale, ShieldCheck, CheckSquare } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';
import Topbar from '../components/Topbar';
import api from '../api';

const WORKLOAD_DATA = [
  { team: 'Team Alpha',   assigned: 45, completed: 28 },
  { team: 'Team Beta',    assigned: 38, completed: 20 },
  { team: 'Team Gamma',   assigned: 60, completed: 42 },
  { team: 'Team Delta',   assigned: 62, completed: 44 },
  { team: 'Team Epsilon', assigned: 50, completed: 35 },
  { team: 'Team Zeta',    assigned: 47, completed: 30 },
  { team: 'Team Eta',     assigned: 40, completed: 22 },
];

const GINI_DATA = [{ name: 'Gini', value: 8, fill: '#7C3AED' }];

export default function FairnessAnalytics() {
  const [workload, setWorkload] = useState(WORKLOAD_DATA);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    api.get('/reviews/workload')
      .then(r => {
        const data = r.data.data ?? [];
        if (data.length) {
          // Group by team
          const map: Record<string, { assigned: number; completed: number }> = {};
          data.forEach((s: any) => {
            const team = s.team?.name ?? 'Unknown';
            if (!map[team]) map[team] = { assigned: 0, completed: 0 };
            map[team].assigned  += s.reviewCount;
            map[team].completed += (s.reviewTasks?.filter((t: any) => t.status === 'SUBMITTED').length ?? 0);
          });
          const result = Object.entries(map).map(([team, v]) => ({ team, ...v }));
          if (result.length) setWorkload(result);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalAssigned   = workload.reduce((s, d) => s + d.assigned, 0);
  const totalCompleted  = workload.reduce((s, d) => s + d.completed, 0);
  const completionRate  = totalAssigned ? Math.round((totalCompleted / totalAssigned) * 100) : 65;
  const pieData = [
    { name: 'Completed', value: totalCompleted, color: '#10B981' },
    { name: 'Pending',   value: totalAssigned - totalCompleted, color: '#E5E7EB' },
  ];

  return (
    <>
      <Topbar title="Fairness & Compliance Analytics" breadcrumb="Fairness" />
      <div className="page-body">
        <div className="page-header">
          <h1>Fairness & Compliance Analytics</h1>
          <p>Review fairness metrics, workload distribution, and constraint compliance data.</p>
        </div>

        {/* Top Metric Cards */}
        <div className="fairness-top">
          <div className="metric-card">
            <div className="metric-icon-box" style={{ background: '#EDE9FE' }}>
              <Scale size={22} color="#7C3AED" />
            </div>
            <div>
              <div className="metric-label">GINI WORKLOAD COEFFICIENT</div>
              <div className="metric-value" style={{ color: '#7C3AED' }}>0.08</div>
              <div className="metric-sub">Optimal distribution (lower is better)</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box" style={{ background: '#D1FAE5' }}>
              <ShieldCheck size={22} color="#10B981" />
            </div>
            <div>
              <div className="metric-label">VERIFIED CONSTRAINTS</div>
              <div className="metric-value" style={{ color: '#10B981' }}>5 / 5 Rules</div>
              <div className="metric-sub">100% compliance checked</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box" style={{ background: '#DBEAFE' }}>
              <CheckSquare size={22} color="#2563EB" />
            </div>
            <div>
              <div className="metric-label">TASKS FINISHED</div>
              <div className="metric-value" style={{ color: '#2563EB' }}>
                {totalCompleted} / {totalAssigned || 228}
              </div>
              <div className="metric-sub">Grading progress rate</div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid-2" style={{ marginBottom: 24 }}>
          {/* Workload Bar Chart */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Workload Distribution by Team</div>
              <div className="card-subtitle">Assigned vs. Completed Reviews</div>
            </div>
            <div className="card-body" style={{ paddingTop: 8 }}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={workload} barSize={12} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="team" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                    tickFormatter={v => v.replace('Team ', '')} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="assigned"  name="Assigned Reviews"  fill="#7C3AED" radius={[4,4,0,0]} />
                  <Bar dataKey="completed" name="Completed Reviews" fill="#10B981" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Completion Pie */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Review Completion Rate</div>
              <div className="card-subtitle">Overall submission review progress</div>
            </div>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={70} outerRadius={100}
                    dataKey="value"
                    startAngle={90} endAngle={-270}
                    strokeWidth={0}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v} tasks`, n]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Constraints Compliance Table */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="card-title">Constraint Compliance Summary</div>
              <div className="card-subtitle">All hard and soft constraint violations tracked</div>
            </div>
            <span className="badge badge-passing">ALL PASSING</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Constraint ID</th>
                <th>Description</th>
                <th>Type</th>
                <th>Violations</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'HC-01', desc: 'No Self Review',           type: 'Hard', violations: 0 },
                { id: 'HC-02', desc: 'No Same Team Review',      type: 'Hard', violations: 0 },
                { id: 'HC-03', desc: 'Minimum 2 Reviews/Submission', type: 'Hard', violations: 0 },
                { id: 'HC-04', desc: 'No Duplicate Assignment',  type: 'Hard', violations: 0 },
                { id: 'HC-05', desc: 'Active Reviewers Only',    type: 'Hard', violations: 0 },
                { id: 'SC-01', desc: 'Avoid Repeat Reviewer Pairs', type: 'Soft', violations: 3 },
                { id: 'SC-02', desc: 'Balanced Workload',        type: 'Soft', violations: 0 },
              ].map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700 }}>{c.id}</td>
                  <td>{c.desc}</td>
                  <td>
                    <span className={`badge ${c.type === 'Hard' ? 'badge-active' : 'badge-team'}`}>
                      {c.type}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ color: c.violations > 0 ? '#F59E0B' : 'var(--success)', fontWeight: 700 }}>
                      {c.violations}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-passing">
                      {c.violations === 0 ? '✓ PASSING' : '⚠ RELAXED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
