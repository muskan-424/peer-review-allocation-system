import { useEffect, useState } from 'react';
import { Users, FileText, ClipboardList, ShieldCheck, CheckCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Topbar from '../components/Topbar';
import api from '../api';

const MOCK_WORKLOAD = [
  { team: 'Team Alpha', assigned: 45, completed: 28 },
  { team: 'Team Beta',  assigned: 38, completed: 20 },
  { team: 'Team Gamma', assigned: 60, completed: 42 },
  { team: 'Team Delta', assigned: 62, completed: 44 },
  { team: 'Team Epsilon', assigned: 50, completed: 35 },
  { team: 'Team Zeta', assigned: 47, completed: 30 },
  { team: 'Team Eta',  assigned: 40, completed: 22 },
];

const MOCK_ACTIVITY = [
  { id: 1, type: 'completed', msg: 'Review Completed', sub: 'Benjamin White finalized review RT011 for Logan Sanchez (Rating: 5/5).', time: 'Just now' },
  { id: 2, type: 'completed', msg: 'Review Completed', sub: 'William Ramirez finalized review RT001 for Emily Smith (Rating: 4/5).', time: 'Just now' },
  { id: 3, type: 'allocated', msg: 'Review Allocated',  sub: 'System auto-assigned reviewer for submission SUB047.', time: '2 min ago' },
  { id: 4, type: 'completed', msg: 'Review Completed', sub: 'Ava Hernandez finalized review RT032 for Daniel Garcia (Rating: 5/5).', time: '5 min ago' },
];

export default function Dashboard() {
  const [stats, setStats] = useState({ students: 120, submissions: 114, tasks: 228, fairness: 98 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/students').catch(() => null),
      api.get('/submissions').catch(() => null),
      api.get('/reviews/workload').catch(() => null),
    ]).then(([stuRes, subRes, wlRes]) => {
      setStats({
        students:    stuRes?.data?.data?.length    ?? 120,
        submissions: subRes?.data?.data?.length    ?? 114,
        tasks:       wlRes?.data?.data?.reduce((s: number, r: any) => s + r.reviewCount, 0) ?? 228,
        fairness:    98,
      });
    }).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Topbar title="Dashboard Overview" breadcrumb="Dashboard" />
      <div className="page-body">
        <div className="page-header">
          <h1>Dashboard Overview</h1>
          <p>Real-time analytics and constraints status for Peer Review Allocation.</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <StatCard icon={<Users size={18}/>}        label="TOTAL STUDENTS"    value={stats.students}    badge="+4 new this week" sub="Enrolled in course" />
          <StatCard icon={<FileText size={18}/>}      label="TOTAL SUBMISSIONS" value={stats.submissions}  badge="95% submission rate" sub="PDF Project Reports uploaded" />
          <StatCard icon={<ClipboardList size={18}/>} label="REVIEW TASKS"      value={stats.tasks}        badge="2 per submission" badgeClass="purple" sub="Review allocations generated" />
          <StatCard icon={<ShieldCheck size={18}/>}   label="FAIRNESS SCORE"    value={`${stats.fairness}%`} badge="Optimal allocation" sub="Workload balance index" />
        </div>

        <div className="grid-2">
          {/* Workload Chart */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Workload Distribution by Team</div>
              <div className="card-subtitle">Assigned vs. Completed Reviews</div>
            </div>
            <div className="card-body" style={{ paddingTop: 8 }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={MOCK_WORKLOAD} barSize={12} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="team" tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                    tickFormatter={(v) => v.replace('Team ', '')} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="assigned"  name="Assigned Reviews"  fill="#7C3AED" radius={[4,4,0,0]} />
                  <Bar dataKey="completed" name="Completed Reviews" fill="#10B981" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Log */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Recent Activity Log</div>
              <div className="card-subtitle">System actions & updates</div>
            </div>
            <div className="card-body">
              <div className="activity-list">
                {MOCK_ACTIVITY.map((a) => (
                  <div className="activity-item" key={a.id}>
                    <div className="activity-icon">
                      <CheckCircle size={14} />
                    </div>
                    <div className="activity-content" style={{ flex: 1 }}>
                      <h4>{a.msg}</h4>
                      <p>{a.sub}</p>
                    </div>
                    <div className="activity-time">{a.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ icon, label, value, badge, badgeClass = '', sub }: any) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className="stat-label">{label}</div>
        <div className="stat-icon">{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      {badge && <div className={`stat-badge ${badgeClass}`}>{badge}</div>}
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
