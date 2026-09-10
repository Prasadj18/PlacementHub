import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Users,
  CalendarClock,
  ArrowRight,
  Video,
  MapPin,
  Clock,
  Trophy,
  Briefcase,
} from 'lucide-react';
import { dashboardApi } from '../api/dashboard';
import { DashboardData, ApplicationStatus } from '../types';

function getStatusBadgeClass(status: ApplicationStatus): string {
  return `badge badge-${status.toLowerCase()}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.get()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    { label: 'Companies Applied', value: data.stats.totalApplied, icon: Building2, color: '#3b82f6' },
    { label: 'Shortlisted', value: data.stats.shortlisted, icon: CheckCircle2, color: '#8b5cf6' },
    { label: 'Interviews', value: data.stats.interviews, icon: Users, color: '#6366f1' },
    { label: 'Selected', value: data.stats.selected, icon: Trophy, color: '#10b981' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your placement command center</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        {statCards.map((stat) => (
          <div className="card" key={stat.label} style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              top: -10,
              right: -10,
              width: 70,
              height: 70,
              borderRadius: '50%',
              background: stat.color,
              opacity: 0.07,
            }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: 4 }}>{stat.label}</p>
                <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>{stat.value}</p>
              </div>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-lg)',
                background: stat.color + '15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: stat.color,
              }}>
                <stat.icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
        {/* Next Upcoming Event */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CalendarClock size={18} style={{ color: 'var(--color-primary)' }} />
              Next Upcoming Event
            </h3>
          </div>
          {data.nextEvent ? (
            <div style={{
              background: 'linear-gradient(135deg, #eff6ff, #f0f0ff)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className={`badge badge-${data.nextEvent.type === 'OA' ? 'event-oa' : data.nextEvent.type.toLowerCase()}`}>
                  {data.nextEvent.type}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{data.nextEvent.company.name}</span>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>{data.nextEvent.title}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                  <Clock size={14} />
                  {formatDate(data.nextEvent.dateTime)} at {formatTime(data.nextEvent.dateTime)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                  {data.nextEvent.isOnline ? <Video size={14} /> : <MapPin size={14} />}
                  {data.nextEvent.isOnline ? 'Online' : (data.nextEvent.venue || 'Venue TBD')}
                </div>
              </div>
              {data.nextEvent.isOnline && data.nextEvent.meetingUrl && (
                <a
                  href={data.nextEvent.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: 12 }}
                >
                  Join Meeting <ArrowRight size={14} />
                </a>
              )}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-8) var(--space-4)' }}>
              <CalendarClock className="empty-state-icon" size={40} />
              <p className="empty-state-title">No upcoming events</p>
              <p className="empty-state-description">
                Events will appear here when you add them to your tracked companies.
              </p>
            </div>
          )}
        </div>

        {/* Upcoming Events List */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CalendarClock size={18} style={{ color: 'var(--color-primary)' }} />
              Upcoming Events
            </h3>
            <Link to="/calendar" className="btn btn-ghost btn-sm">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {data.upcomingEvents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {data.upcomingEvents.map((event) => (
                <div key={event.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-light)',
                  transition: 'background var(--transition-fast)',
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-primary-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1 }}>
                      {new Date(event.dateTime).getDate()}
                    </span>
                    <span style={{ fontSize: '0.5625rem', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                      {new Date(event.dateTime).toLocaleDateString('en', { month: 'short' })}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {event.title}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      {event.company.name} · {formatTime(event.dateTime)}
                    </p>
                  </div>
                  <span className={`badge badge-${event.type === 'OA' ? 'event-oa' : event.type.toLowerCase()}`}>
                    {event.type}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--space-8) 0' }}>
              No upcoming events
            </p>
          )}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="card" style={{ marginTop: 'var(--space-6)' }}>
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Briefcase size={18} style={{ color: 'var(--color-primary)' }} />
            My Applications
          </h3>
          <Link to="/applications" className="btn btn-ghost btn-sm">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {data.recentApplications.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-border)' }}>Company</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-border)' }}>Role</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-border)' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-border)' }}>Applied</th>
                </tr>
              </thead>
              <tbody>
                {data.recentApplications.map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    <td style={{ padding: '12px', fontSize: '0.875rem', fontWeight: 500 }}>
                      <Link to={`/companies/${app.companyId}`} style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                        {app.company.name}
                      </Link>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{app.company.role}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={getStatusBadgeClass(app.status)}>{app.status}</span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{formatDate(app.appliedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: 'var(--space-8) var(--space-4)' }}>
            <Briefcase className="empty-state-icon" size={40} />
            <p className="empty-state-title">No applications yet</p>
            <p className="empty-state-description">
              After applying through your college placement portal, add the company here to start tracking.
            </p>
            <Link to="/companies" className="btn btn-primary">
              <Building2 size={16} /> Add Company
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
