import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SidebarLayout from '../components/SidebarLayout';
import { User, MapPin, Globe, Camera, Star, Award, Edit, Check, X, Settings, Plane, TrendingUp } from 'lucide-react';

const ACHIEVEMENTS = [
  { id: 1, name: 'First Trip', desc: 'Planned your first trip', emoji: '🚀', earned: true },
  { id: 2, name: 'AI Explorer', desc: 'Used AI Planner 5 times', emoji: '🤖', earned: true },
  { id: 3, name: 'Globe Trotter', desc: 'Visited 5 countries', emoji: '🌍', earned: false },
  { id: 4, name: 'Budget Master', desc: 'Stayed under budget 3 times', emoji: '💰', earned: true },
  { id: 5, name: 'Photo Journaler', desc: 'Added 50+ photos to journal', emoji: '📸', earned: false },
  { id: 6, name: 'Social Planner', desc: 'Shared 3 trips with friends', emoji: '👥', earned: false },
];

const TRAVEL_STYLES = ['Adventure', 'Cultural', 'Food & Culinary', 'Photography', 'Relaxation'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || 'Passionate traveler exploring the world one destination at a time 🌍', location: user?.location || 'India', website: user?.website || '' });

  const handleSave = () => {
    updateUser(form);
    setEditing(false);
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'TR';

  return (
    <SidebarLayout>
      <div className="page-container" style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Profile Header */}
        <div className="glass-card p-8 mb-6 animate-fade-in">
          <div className="flex items-start gap-6 flex-wrap">
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: 'white', border: '3px solid rgba(124,58,237,0.3)', boxShadow: 'var(--shadow-violet)' }}>
                {initials}
              </div>
              <button style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, background: 'var(--gradient-violet)', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Camera size={12} />
              </button>
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              {editing ? (
                <div className="flex flex-col gap-3">
                  <div className="grid-2">
                    <div className="input-group"><label>Name</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                    <div className="input-group"><label>Location</label><input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
                  </div>
                  <div className="input-group"><label>Bio</label><textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={2} /></div>
                  <div className="flex gap-2">
                    <button className="btn btn-primary btn-sm" onClick={handleSave}><Check size={14} /> Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}><X size={14} /> Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{user?.name || 'Traveler'}</h2>
                    {user?.role === 'admin' && <span className="badge badge-orange">Admin</span>}
                    <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setEditing(true)}><Edit size={14} /></button>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-3)' }}>{form.bio}</p>
                  <div className="flex gap-4 flex-wrap">
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={12} /> {form.location}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>✉️ {user?.email}</span>
                  </div>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              {[{ label: 'Trips', value: 4 }, { label: 'Countries', value: 4 }, { label: 'Days Traveled', value: 28 }].map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-display)' }} className="gradient-text">{value}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid-2 gap-6">
          {/* Achievements */}
          <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="mb-4"><Award size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--orange)' }} />Achievements</h3>
            <div className="flex flex-col gap-3">
              {ACHIEVEMENTS.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: a.earned ? 'rgba(16,185,129,0.05)' : 'var(--bg-glass)', border: '1px solid', borderColor: a.earned ? 'rgba(16,185,129,0.2)' : 'var(--border)', borderRadius: 'var(--radius-md)', opacity: a.earned ? 1 : 0.5 }}>
                  <span style={{ fontSize: '1.5rem' }}>{a.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{a.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.desc}</div>
                  </div>
                  {a.earned && <Check size={16} style={{ color: 'var(--emerald)', flexShrink: 0 }} />}
                </div>
              ))}
            </div>
          </div>

          {/* Travel Preferences */}
          <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="mb-4"><Settings size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--cyan)' }} />Travel Preferences</h3>
            <div className="flex flex-col gap-4">
              <div className="input-group">
                <label>Favorite Travel Styles</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {TRAVEL_STYLES.map(s => (
                    <span key={s} className="tag active">{s}</span>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label>Currency Preference</label>
                <select defaultValue="INR">
                  <option value="INR">₹ INR (Indian Rupee)</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                </select>
              </div>
              <div className="input-group">
                <label>Notification Preferences</label>
                <div className="flex flex-col gap-2 mt-2">
                  {['Flight price alerts', 'Weather updates', 'AI recommendations', 'Trip reminders'].map(pref => (
                    <label key={pref} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: 'var(--violet)', width: 14, height: 14 }} />
                      {pref}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
