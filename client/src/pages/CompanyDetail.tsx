import { useState, useEffect, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Briefcase, CheckCircle2, Plus, X,
  Clock, Video, MapPinIcon, Calendar,
  Building2,
} from 'lucide-react';
import { companiesApi } from '../api/companies';
import { applicationsApi } from '../api/applications';
import { eventsApi } from '../api/events';
import { CompanyDetail as CompanyDetailType, ApplicationStatus, EventType, CreateEventInput } from '../types';

const STATUSES: ApplicationStatus[] = ['APPLIED', 'OA', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'];
const EVENT_TYPES: EventType[] = ['PPT', 'OA', 'INTERVIEW', 'RESULT', 'OTHER'];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getStatusBadgeClass(status: ApplicationStatus): string {
  return `badge badge-${status.toLowerCase()}`;
}

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<CompanyDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState<CreateEventInput>({
    companyId: id!,
    type: 'PPT',
    title: '',
    dateTime: '',
    venue: '',
    isOnline: false,
    meetingUrl: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadCompany();
  }, [id]);

  const loadCompany = async () => {
    try {
      const res = await companiesApi.getById(id!);
      setCompany(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!company?.userApplication) return;
    setUpdatingStatus(true);
    try {
      await applicationsApi.updateStatus(company.userApplication.id, newStatus);
      loadCompany();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEventSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await eventsApi.create({ ...eventForm, companyId: id! });
      setShowEventModal(false);
      setEventForm({ companyId: id!, type: 'PPT', title: '', dateTime: '', venue: '', isOnline: false, meetingUrl: '', description: '' });
      loadCompany();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="page-container">
        <p>Company not found</p>
        <Link to="/companies" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Companies</Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Link to="/companies" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-4)' }}>
        <ArrowLeft size={16} /> Back to Companies
      </Link>

      {/* Company Header */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, var(--color-primary-light), #e0e7ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1.25rem',
            color: 'var(--color-primary)',
            flexShrink: 0,
          }}>
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} style={{ width: 56, height: 56, borderRadius: 'var(--radius-xl)', objectFit: 'cover' }} />
            ) : (
              company.name.charAt(0).toUpperCase()
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{company.name}</h1>
            <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', marginBottom: 12 }}>{company.role}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              {company.ctc && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  <Briefcase size={14} /> {company.ctc}
                </span>
              )}
              {company.location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  <MapPin size={14} /> {company.location}
                </span>
              )}
              <span className="badge badge-other">{company.workMode}</span>
            </div>
          </div>
        </div>

        {company.description && (
          <p style={{ marginTop: 'var(--space-4)', fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            {company.description}
          </p>
        )}

        {company.eligibility && (
          <p style={{ marginTop: 'var(--space-3)', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            <strong>Eligibility:</strong> {company.eligibility}
          </p>
        )}

        {company.notes && (
          <p style={{ marginTop: 'var(--space-3)', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
            {company.notes}
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
        {/* Application Status */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={18} style={{ color: 'var(--color-selected)' }} />
              Application Status
            </h3>
          </div>
          {company.userApplication ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <span className={getStatusBadgeClass(company.userApplication.status)} style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
                  ✓ {company.userApplication.status}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                  since {formatDate(company.userApplication.appliedAt)}
                </span>
              </div>
              <div className="form-group">
                <label className="form-label">Update Status</label>
                <select
                  className="form-select"
                  value={company.userApplication.status}
                  onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
                  disabled={updatingStatus}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>No application found</p>
          )}
        </div>

        {/* Quick Info */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={18} style={{ color: 'var(--color-primary)' }} />
              Quick Info
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Added by</span>
              <span style={{ fontWeight: 500 }}>{company.createdBy.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Total Events</span>
              <span style={{ fontWeight: 500 }}>{company.events.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Total Applicants</span>
              <span style={{ fontWeight: 500 }}>{company._count?.applications || 0}</span>
            </div>
            {company.eligibleBranches.length > 0 && (
              <div style={{ fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Eligible Branches:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                  {company.eligibleBranches.map((b) => (
                    <span key={b} className="badge badge-other" style={{ fontSize: '0.625rem' }}>{b}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Placement Process Timeline */}
      <div className="card" style={{ marginTop: 'var(--space-6)' }}>
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={18} style={{ color: 'var(--color-primary)' }} />
            Placement Process
          </h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowEventModal(true)}>
            <Plus size={14} /> Add Event
          </button>
        </div>

        {company.events.length > 0 ? (
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            {/* Timeline line */}
            <div style={{
              position: 'absolute',
              left: 10,
              top: 4,
              bottom: 4,
              width: 2,
              background: 'var(--color-border)',
            }} />

            {company.events.map((event, index) => (
              <div key={event.id} style={{
                position: 'relative',
                paddingBottom: index < company.events.length - 1 ? 'var(--space-6)' : 0,
              }}>
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: -22,
                  top: 4,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: event.type === 'RESULT' ? 'var(--color-selected)' :
                    event.type === 'INTERVIEW' ? 'var(--color-interview)' :
                      event.type === 'OA' ? 'var(--color-oa)' : 'var(--color-primary)',
                  border: '2px solid white',
                  boxShadow: '0 0 0 2px var(--color-border)',
                }} />

                <div style={{
                  background: 'var(--color-bg)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                      {formatDate(event.dateTime)}
                    </span>
                    <span className={`badge badge-${event.type === 'OA' ? 'event-oa' : event.type.toLowerCase()}`}>
                      {event.type}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 6 }}>{event.title}</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                      <Clock size={13} /> {formatTime(event.dateTime)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                      {event.isOnline ? <Video size={13} /> : <MapPinIcon size={13} />}
                      {event.isOnline ? 'Online' : (event.venue || 'Venue TBD')}
                    </span>
                  </div>
                  {event.isOnline && event.meetingUrl && (
                    <a href={event.meetingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
                      Join Meeting
                    </a>
                  )}
                  {event.description && (
                    <p style={{ marginTop: 8, fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: 'var(--space-8) var(--space-4)' }}>
            <Calendar className="empty-state-icon" size={40} />
            <p className="empty-state-title">No events yet</p>
            <p className="empty-state-description">
              Add placement events as your college announces PPTs, OAs, interviews, and results.
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowEventModal(true)}>
              <Plus size={14} /> Add Event
            </button>
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Event</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowEventModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEventSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Event Type *</label>
                    <select
                      className="form-select"
                      value={eventForm.type}
                      onChange={(e) => setEventForm({ ...eventForm, type: e.target.value as EventType })}
                    >
                      {EVENT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date & Time *</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={eventForm.dateTime}
                      onChange={(e) => setEventForm({ ...eventForm, dateTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`e.g. ${company.name} Pre-Placement Talk`}
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={eventForm.isOnline}
                      onChange={(e) => setEventForm({ ...eventForm, isOnline: e.target.checked })}
                    />
                    Online Event
                  </label>
                </div>

                {eventForm.isOnline ? (
                  <div className="form-group">
                    <label className="form-label">Meeting URL</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://meet.google.com/..."
                      value={eventForm.meetingUrl}
                      onChange={(e) => setEventForm({ ...eventForm, meetingUrl: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Venue</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Seminar Hall"
                      value={eventForm.venue}
                      onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Event details..."
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEventModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <div className="spinner" /> : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
