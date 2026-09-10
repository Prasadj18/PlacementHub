import { useState, useEffect, FormEvent } from 'react';
import {
  BookOpen, Plus, X, Building2,
} from 'lucide-react';
import { experiencesApi } from '../api/experiences';
import { companiesApi } from '../api/companies';
import {
  Experience, Company, ExperienceRound, Difficulty, CreateExperienceInput,
} from '../types';

const ROUNDS: { value: ExperienceRound; label: string }[] = [
  { value: 'OA', label: 'Online Assessment' },
  { value: 'TECHNICAL_INTERVIEW', label: 'Technical Interview' },
  { value: 'HR_INTERVIEW', label: 'HR Interview' },
  { value: 'PPT', label: 'Pre-Placement Talk' },
  { value: 'OTHER', label: 'Other' },
];

const DIFFICULTIES: Difficulty[] = ['EASY', 'MEDIUM', 'HARD'];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Experiences() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterCompany, setFilterCompany] = useState('');
  const [formData, setFormData] = useState<CreateExperienceInput>({
    companyId: '',
    round: 'OA',
    content: '',
    difficulty: 'MEDIUM',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      experiencesApi.getAll(),
      companiesApi.getAll(),
    ])
      .then(([expRes, compRes]) => {
        setExperiences(expRes.data);
        setCompanies(compRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await experiencesApi.create(formData);
      setShowModal(false);
      setFormData({ companyId: '', round: 'OA', content: '', difficulty: 'MEDIUM' });
      const res = await experiencesApi.getAll();
      setExperiences(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filterCompany
    ? experiences.filter((e) => e.company.id === filterCompany)
    : experiences;

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
          <h1 className="page-title">Experiences</h1>
          <p className="page-subtitle">Shared placement experiences from students</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Share Experience
        </button>
      </div>

      {/* Company filter */}
      {companies.length > 0 && (
        <div style={{ marginBottom: 'var(--space-6)', maxWidth: 300 }}>
          <select
            className="form-select"
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
          >
            <option value="">All Companies</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {filtered.map((exp) => (
            <div key={exp.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
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
                  }}>
                    {exp.company.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{exp.company.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      by {exp.user.name} · {exp.user.branch} · {formatDate(exp.createdAt)}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <span className={`badge badge-${exp.round === 'OA' ? 'event-oa' : exp.round === 'TECHNICAL_INTERVIEW' ? 'interview' : exp.round === 'HR_INTERVIEW' ? 'shortlisted' : exp.round === 'PPT' ? 'ppt' : 'other'}`}>
                    {ROUNDS.find((r) => r.value === exp.round)?.label || exp.round}
                  </span>
                  <span className={`badge badge-${exp.difficulty.toLowerCase()}`}>
                    {exp.difficulty}
                  </span>
                </div>
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--color-text)',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}>
                {exp.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <BookOpen className="empty-state-icon" size={56} />
            <p className="empty-state-title">No experiences shared yet</p>
            <p className="empty-state-description">
              Share your placement experience to help other students prepare better.
            </p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Share Experience
            </button>
          </div>
        </div>
      )}

      {/* Share Experience Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Share Experience</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Company *</label>
                  <select
                    className="form-select"
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    required
                  >
                    <option value="">Select company</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Round *</label>
                    <select
                      className="form-select"
                      value={formData.round}
                      onChange={(e) => setFormData({ ...formData, round: e.target.value as ExperienceRound })}
                    >
                      {ROUNDS.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Difficulty *</label>
                    <select
                      className="form-select"
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                    >
                      {DIFFICULTIES.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Your Experience *</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Share your experience, questions asked, tips, etc..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <div className="spinner" /> : 'Share Experience'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
