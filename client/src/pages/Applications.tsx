import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Building2, MapPin, Briefcase } from 'lucide-react';
import { applicationsApi } from '../api/applications';
import { Application, ApplicationStatus } from '../types';

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

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const res = await applicationsApi.getAll();
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      await applicationsApi.updateStatus(appId, newStatus);
      loadApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const statuses: ApplicationStatus[] = ['APPLIED', 'OA', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'];
  const filtered = filter === 'ALL' ? applications : applications.filter((a) => a.status === filter);

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Applications</h1>
          <p className="page-subtitle">Track your placement applications — visible only to you</p>
        </div>
      </div>

      {/* Filter Tabs */}
      {applications.length > 0 && (
        <div style={{
          display: 'flex',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-6)',
          overflowX: 'auto',
          paddingBottom: 4,
        }}>
          <button
            className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('ALL')}
          >
            All ({applications.length})
          </button>
          {statuses.map((s) => {
            const count = applications.filter((a) => a.status === s).length;
            if (count === 0) return null;
            return (
              <button
                key={s}
                className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(s)}
              >
                {s} ({count})
              </button>
            );
          })}
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CTC</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applied</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--color-border-light)', transition: 'background var(--transition-fast)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <Link to={`/companies/${app.companyId}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: 'var(--radius-md)',
                          background: 'linear-gradient(135deg, var(--color-primary-light), #e0e7ff)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                          color: 'var(--color-primary)',
                          flexShrink: 0,
                        }}>
                          {app.company.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--color-primary)' }}>
                          {app.company.name}
                        </span>
                      </Link>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{app.company.role}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{app.company.ctc || '—'}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                      {app.company.location ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={13} /> {app.company.location}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        className="form-select"
                        style={{ padding: '4px 28px 4px 8px', fontSize: '0.75rem', minWidth: 120 }}
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{formatDate(app.appliedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : applications.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FileText className="empty-state-icon" size={56} />
            <p className="empty-state-title">No applications yet</p>
            <p className="empty-state-description">
              After applying through your college placement portal, add the company here to start tracking your placement process.
            </p>
            <Link to="/companies" className="btn btn-primary">
              <Building2 size={16} /> Add Company
            </Link>
          </div>
        </div>
      ) : (
        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--space-8)' }}>
          No applications match this filter.
        </p>
      )}
    </div>
  );
}
