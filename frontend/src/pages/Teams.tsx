import { useEffect, useState } from 'react';
import { UserCog } from 'lucide-react';
import Topbar from '../components/Topbar';
import api from '../api';

export default function Teams() {
  const [teams, setTeams]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/students')
      .then(r => {
        const students = r.data.data ?? [];
        const map: Record<string, any> = {};
        students.forEach((s: any) => {
          const tid  = s.team?.id ?? s.teamId;
          const name = s.team?.name ?? 'Unknown';
          if (!map[tid]) map[tid] = { id: tid, name, members: [] };
          map[tid].members.push(s);
        });
        setTeams(Object.values(map));
      })
      .catch(() => {
        setTeams([
          { id: 'T1', name: 'Team Alpha', members: [{ name: 'Alice' }, { name: 'Bob' }] },
          { id: 'T2', name: 'Team Beta',  members: [{ name: 'Carol' }, { name: 'David' }] },
          { id: 'T3', name: 'Team Gamma', members: [{ name: 'Eva' },   { name: 'Frank' }] },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Topbar title="Teams" breadcrumb="Teams" />
      <div className="page-body">
        <div className="page-header">
          <h1>Teams</h1>
          <p>View all course teams and their member composition for allocation rules.</p>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /><span>Loading teams…</span></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {teams.map(team => (
              <div key={team.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div className="stat-icon" style={{ width: 40, height: 40 }}>
                    <UserCog size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{team.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{team.members.length} members</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {team.members.map((m: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar-circle" style={{ background: '#7C3AED', width: 26, height: 26, fontSize: 11 }}>
                        {m.name?.charAt(0)}
                      </div>
                      <span style={{ fontSize: 13 }}>{m.name}</span>
                      <span className="badge badge-active" style={{ marginLeft: 'auto', fontSize: 10 }}>ACTIVE</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
