import { Calendar } from 'lucide-react';

interface TopbarProps {
  title: string;
  breadcrumb: string;
}

export default function Topbar({ title, breadcrumb }: TopbarProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <header className="topbar">
      <div className="breadcrumb">
        <div className="breadcrumb-title">{title}</div>
        <div className="breadcrumb-path">
          Portal / <span>{breadcrumb}</span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="date-badge">
          <Calendar size={13} />
          {today}
        </div>
        <div className="live-badge">
          <div className="live-dot" />
          Live Engine
        </div>
        <div className="user-badge">
          <div className="user-avatar">IA</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 12 }}>Instructor Portal</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Lead Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
}
