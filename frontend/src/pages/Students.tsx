import { useEffect, useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ChevronsUpDown } from 'lucide-react';
import Topbar from '../components/Topbar';
import api from '../api';

const AVATAR_COLORS = [
  '#7C3AED','#2563EB','#059669','#D97706','#DC2626','#7C3AED','#0891B2'
];

function getColor(name: string) {
  const i = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[i];
}

export default function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [teamFilter, setTeamFilter] = useState('All Teams');

  useEffect(() => {
    api.get('/students')
      .then(r => setStudents(r.data.data ?? []))
      .catch(() => {
        // Fallback mock data if backend not running
        setStudents([
          { id: 'S001', name: 'Emily Smith',    team: { name: 'Team Alpha' }, status: 'ACTIVE',   reviewCount: 0, completedReviews: 0 },
          { id: 'S002', name: 'Daniel Garcia',  team: { name: 'Team Alpha' }, status: 'ACTIVE',   reviewCount: 0, completedReviews: 0 },
          { id: 'S003', name: 'Ava Hernandez',  team: { name: 'Team Alpha' }, status: 'ACTIVE',   reviewCount: 2, completedReviews: 1 },
          { id: 'S004', name: 'Ethan Thomas',   team: { name: 'Team Beta'  }, status: 'ACTIVE',   reviewCount: 2, completedReviews: 2 },
          { id: 'S005', name: 'Charlotte Lee',  team: { name: 'Team Beta'  }, status: 'ACTIVE',   reviewCount: 1, completedReviews: 0 },
          { id: 'S006', name: 'James Wilson',   team: { name: 'Team Gamma' }, status: 'ACTIVE',   reviewCount: 3, completedReviews: 2 },
          { id: 'S007', name: 'Mia Martinez',   team: { name: 'Team Gamma' }, status: 'INACTIVE', reviewCount: 0, completedReviews: 0 },
          { id: 'S008', name: 'Benjamin White', team: { name: 'Team Delta' }, status: 'ACTIVE',   reviewCount: 2, completedReviews: 2 },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const teams   = useMemo(() => ['All Teams', ...new Set(students.map(s => s.team?.name).filter(Boolean))], [students]);
  const statuses = ['All Statuses', 'ACTIVE', 'INACTIVE'];

  const filtered = useMemo(() => students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All Statuses' || s.status === statusFilter;
    const matchTeam   = teamFilter   === 'All Teams'    || s.team?.name === teamFilter;
    return matchSearch && matchStatus && matchTeam;
  }), [students, search, statusFilter, teamFilter]);

  return (
    <>
      <Topbar title="Student Management" breadcrumb="Student" />
      <div className="page-body">
        <div className="page-header">
          <h1>Student Management</h1>
          <p>Search, filter, and track peer review workload and status across active courses.</p>
        </div>

        <div className="card">
          {/* Toolbar */}
          <div className="table-toolbar">
            <div className="search-box">
              <Search size={15} color="var(--text-muted)" />
              <input
                placeholder="Search by student name or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="filter-btn"
              style={{ border: '1px solid var(--border)', appearance: 'none', paddingRight: 28 }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
            <select
              className="filter-btn"
              style={{ border: '1px solid var(--border)', appearance: 'none', paddingRight: 28 }}
              value={teamFilter}
              onChange={e => setTeamFilter(e.target.value)}
            >
              {teams.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="loading"><div className="spinner" /><span>Loading students…</span></div>
          ) : filtered.length === 0 ? (
            <div className="empty"><h3>No students found</h3><p>Try adjusting your search or filters.</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th><span className="sort-header">Student ID <ChevronsUpDown size={12} /></span></th>
                  <th><span className="sort-header">Name <ChevronsUpDown size={12} /></span></th>
                  <th><span className="sort-header">Team <ChevronsUpDown size={12} /></span></th>
                  <th><span className="sort-header">Status <ChevronsUpDown size={12} /></span></th>
                  <th><span className="sort-header">Assigned Reviews <ChevronsUpDown size={12} /></span></th>
                  <th><span className="sort-header">Completed Reviews <ChevronsUpDown size={12} /></span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id ?? i}>
                    <td style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: 12 }}>
                      {s.id ?? `S${String(i+1).padStart(3,'0')}`}
                    </td>
                    <td>
                      <div className="avatar-cell">
                        <div
                          className="avatar-circle"
                          style={{ background: getColor(s.name) }}
                        >
                          {s.name.charAt(0)}
                        </div>
                        {s.name}
                      </div>
                    </td>
                    <td><span className="badge badge-team">{s.team?.name ?? '—'}</span></td>
                    <td>
                      <span className={`badge ${s.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                        ✦ {s.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>{s.reviewCount ?? 0}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>
                      {s.reviewTasks?.filter((t: any) => t.status === 'SUBMITTED').length ?? s.completedReviews ?? 0}
                      {' / '}
                      {s.reviewCount ?? 0}
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
