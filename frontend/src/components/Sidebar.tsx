import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCog, FileText,
  Cpu, ClipboardList, BarChart2, BookOpen
} from 'lucide-react';

const navItems = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/students',    icon: Users,           label: 'Students' },
  { to: '/teams',       icon: UserCog,         label: 'Teams' },
  { to: '/submissions', icon: FileText,        label: 'Submissions' },
  { to: '/allocation',  icon: Cpu,             label: 'Allocation Engine' },
  { to: '/reviews',     icon: ClipboardList,   label: 'Review Tasks' },
  { to: '/fairness',    icon: BarChart2,       label: 'Fairness Analytics' },
  { to: '/workspace',   icon: BookOpen,        label: 'Review Workspace' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">P</div>
        PeerFlow
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="lms-badge">
          <span style={{ width: 7, height: 7, background: '#10B981', borderRadius: '50%', display: 'inline-block' }} />
          LMS Module Active
        </div>
      </div>
    </aside>
  );
}
