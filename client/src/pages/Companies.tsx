import { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Building2, MapPin, Briefcase, X, Search } from 'lucide-react';
import { companiesApi } from '../api/companies';
import { Company, CreateCompanyInput, WorkMode } from '../types';

const WORK_MODES: WorkMode[] = ['ONSITE', 'REMOTE', 'HYBRID'];

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState<CreateCompanyInput>({
    name: '',
    role: '',
    ctc: '',
    description: '',
    eligibility: '',
    eligibleBranches: [],
    location: '',
    workMode: 'ONSITE',
    notes: '',
    logoUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const res = await companiesApi.getAll();
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await companiesApi.create(formData);
      setShowModal(false);
      setFormData({ name: '', role: '', ctc: '', description: '', eligibility: '', eligibleBranches: [], location: '', workMode: 'ONSITE', notes: '', logoUrl: '' });
      loadCompanies();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create company');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="page-title">Companies</h1>
          <p className="page-subtitle">Track companies you've applied to through your placement portal</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Company
        </button>
      </div>

      {companies.length > 0 && (
        <div style={{ marginBottom: 'var(--space-6)', position: 'relative', maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 36 }}
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="grid-3">
          {filtered.map((company) => (
            <Link to={`/companies/${company.id}`} key={company.id} className="card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, var(--color-primary-light), #e0e7ff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'var(--color-primary)',
                  flexShrink: 0,
                }}>
                  {company.logoUrl ? (
                    <img src={company.logoUrl} alt={company.name} style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', objectFit: 'cover' }} />
                  ) : (
                    company.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {company.name}
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{company.role}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {company.ctc && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    <Briefcase size={14} /> {company.ctc}
                  </div>
                )}
                {company.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    <MapPin size={14} /> {company.location}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'var(--space-2)' }}>
                  <span className="badge badge-other" style={{ fontSize: '0.625rem' }}>{company.workMode}</span>
                  {company._count && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                      {company._count.events} event{company._count.events !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Building2 className="empty-state-icon" size={56} />
            <p className="empty-state-title">No companies added yet</p>
            <p className="empty-state-description">
              After applying through your college placement portal, add the company here to start tracking your placement process.
            </p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Add Company
            </button>
          </div>
        </div>
      ) : (
        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--space-8)' }}>
          No companies match your search.
        </p>
      )}

      {/* Add Company Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Company</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="auth-error">{error}</div>}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Company Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Google"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Software Engineer"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">CTC</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 12 LPA"
                      value={formData.ctc}
                      onChange={(e) => setFormData({ ...formData, ctc: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Work Mode</label>
                    <select
                      className="form-select"
                      value={formData.workMode}
                      onChange={(e) => setFormData({ ...formData, workMode: e.target.value as WorkMode })}
                    >
                      {WORK_MODES.map((mode) => (
                        <option key={mode} value={mode}>{mode}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Bangalore"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Company or role description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Eligibility</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. CGPA > 7.0"
                    value={formData.eligibility}
                    onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Notes</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Any additional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <div className="spinner" /> : 'Add Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
