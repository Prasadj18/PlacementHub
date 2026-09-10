import { useState, useEffect, FormEvent } from 'react';
import {
  UserCircle, Mail, BookOpen, GraduationCap, Calendar, Edit2, Check, X,
} from 'lucide-react';
import { profileApi } from '../api/profile';
import { Profile as ProfileType } from '../types';
import { useAuth } from '../context/AuthContext';

const BRANCHES = [
  'Computer Science', 'Information Science', 'Electronics & Communication',
  'Electrical & Electronics', 'Mechanical', 'Civil', 'Chemical',
  'Biotechnology', 'Industrial Engineering', 'Medical Electronics',
  'Telecommunication', 'Architecture',
];

export default function Profile() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', branch: '', graduationYear: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await profileApi.get();
      setProfile(res.data);
      setEditData({
        name: res.data.name,
        branch: res.data.branch,
        graduationYear: res.data.graduationYear,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileApi.update(editData);
      await loadProfile();
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account information</p>
        </div>
      </div>

      <div style={{ maxWidth: 640 }}>
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--color-primary), #818cf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{profile.name}</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{profile.email}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                Member since {new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-4)',
            padding: 'var(--space-4)',
            background: 'var(--color-bg)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <div style={{ textAlign: 'center', padding: 'var(--space-3)' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{profile._count.applications}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Applications</p>
            </div>
            <div style={{ textAlign: 'center', padding: 'var(--space-3)' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{profile._count.experiences}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Experiences Shared</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Personal Information</h3>
            {!editing ? (
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                <Edit2 size={14} /> Edit
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
                  <X size={14} /> Cancel
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">College Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={profile.email}
                  disabled
                  style={{ opacity: 0.6 }}
                />
                <span className="form-error" style={{ color: 'var(--color-text-tertiary)' }}>Email cannot be changed</span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Branch</label>
                  <select
                    className="form-select"
                    value={editData.branch}
                    onChange={(e) => setEditData({ ...editData, branch: e.target.value })}
                  >
                    {BRANCHES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Graduation Year</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editData.graduationYear}
                    onChange={(e) => setEditData({ ...editData, graduationYear: parseInt(e.target.value, 10) })}
                    min={2020}
                    max={2035}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                {saving ? <div className="spinner" /> : <><Check size={14} /> Save Changes</>}
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <UserCircle size={18} style={{ color: 'var(--color-text-tertiary)' }} />
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Full Name</p>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{profile.name}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <Mail size={18} style={{ color: 'var(--color-text-tertiary)' }} />
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>College Email</p>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{profile.email}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <BookOpen size={18} style={{ color: 'var(--color-text-tertiary)' }} />
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Branch</p>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{profile.branch}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <GraduationCap size={18} style={{ color: 'var(--color-text-tertiary)' }} />
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Graduation Year</p>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{profile.graduationYear}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          className="btn btn-danger"
          onClick={logout}
          style={{ marginTop: 'var(--space-6)' }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
