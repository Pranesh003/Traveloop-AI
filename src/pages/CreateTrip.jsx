import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SidebarLayout from '../components/SidebarLayout';
import { Sparkles, MapPin, Calendar, DollarSign, Users, Compass, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import './CreateTrip.css';

const TRAVEL_STYLES = ['Adventure', 'Relaxation', 'Cultural', 'Food & Culinary', 'Photography', 'Backpacking', 'Luxury', 'Family', 'Romantic', 'Business'];
const COMPANIONS = ['Solo', 'Couple', 'Friends', 'Family with Kids', 'Group Tour'];

const STEPS = ['Trip Basics', 'Destinations', 'Preferences'];

export default function CreateTrip() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', startDate: '', endDate: '',
    destinations: [''], budget: '', travelStyle: '', companions: 'Solo', privacy: 'private',
  });

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const setDest = (idx, val) => {
    const d = [...form.destinations];
    d[idx] = val;
    setForm(p => ({ ...p, destinations: d }));
  };
  const addDest = () => setForm(p => ({ ...p, destinations: [...p.destinations, ''] }));
  const removeDest = (idx) => setForm(p => ({ ...p, destinations: p.destinations.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 2) { setStep(s => s + 1); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const newTrip = { id: Date.now(), ...form, userId: user?.id || 1, createdAt: new Date().toISOString() };
    const existing = JSON.parse(localStorage.getItem('tl_trips') || '[]');
    localStorage.setItem('tl_trips', JSON.stringify([...existing, newTrip]));
    navigate('/my-trips');
  };

  return (
    <SidebarLayout>
      <div className="page-container">
        <div className="create-trip-container animate-fade-in">
          {/* Header */}
          <div className="create-header">
            <h1>Create New Trip</h1>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/ai-planner')}>
              <Sparkles size={14} /> Use AI Planner Instead
            </button>
          </div>

          {/* Step Indicator */}
          <div className="step-indicator glass-card">
            {STEPS.map((s, i) => (
              <div key={s} className={`step-item ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                <div className="step-dot">
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span>{s}</span>
                {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'done' : ''}`} />}
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="create-form glass-card">
            {step === 0 && (
              <div className="form-step animate-fade-in">
                <h2>Trip Basics</h2>
                <div className="form-grid">
                  <div className="input-group" style={{ gridColumn: '1/-1' }}>
                    <label>Trip Title *</label>
                    <input type="text" placeholder="e.g. Summer in Japan 2026" value={form.title} onChange={e => set('title', e.target.value)} required />
                  </div>
                  <div className="input-group" style={{ gridColumn: '1/-1' }}>
                    <label>Description</label>
                    <textarea placeholder="What's this trip about?" value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
                  </div>
                  <div className="input-group">
                    <label><Calendar size={14} /> Start Date *</label>
                    <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label><Calendar size={14} /> End Date *</label>
                    <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} required min={form.startDate} />
                  </div>
                  <div className="input-group">
                    <label><DollarSign size={14} /> Budget (₹)</label>
                    <input type="number" placeholder="150000" value={form.budget} onChange={e => set('budget', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Privacy</label>
                    <select value={form.privacy} onChange={e => set('privacy', e.target.value)}>
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                      <option value="shared">Shared Link</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="form-step animate-fade-in">
                <h2>Destinations</h2>
                <p className="text-secondary mb-4">Add cities or places you plan to visit. You can add more later.</p>
                {form.destinations.map((dest, idx) => (
                  <div key={idx} className="dest-row">
                    <div className="dest-num">{idx + 1}</div>
                    <div className="input-wrapper" style={{ flex: 1 }}>
                      <MapPin size={16} className="input-icon" />
                      <input type="text" placeholder={`Destination ${idx + 1} (e.g. Tokyo, Japan)`} value={dest} onChange={e => setDest(idx, e.target.value)} />
                    </div>
                    {form.destinations.length > 1 && (
                      <button type="button" className="btn btn-icon btn-ghost" onClick={() => removeDest(idx)}>✕</button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn btn-secondary btn-sm" onClick={addDest}>
                  + Add Another Destination
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="form-step animate-fade-in">
                <h2>Your Preferences</h2>
                <div className="input-group">
                  <label>Travel Style</label>
                  <div className="style-grid">
                    {TRAVEL_STYLES.map(style => (
                      <button
                        key={style}
                        type="button"
                        className={`style-chip ${form.travelStyle === style ? 'active' : ''}`}
                        onClick={() => set('travelStyle', style)}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="input-group">
                  <label><Users size={14} /> Who's going?</label>
                  <div className="companions-grid">
                    {COMPANIONS.map(c => (
                      <button
                        key={c}
                        type="button"
                        className={`companion-chip ${form.companions === c ? 'active' : ''}`}
                        onClick={() => set('companions', c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="form-nav">
              {step > 0 && (
                <button type="button" className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>
                  <ChevronLeft size={16} /> Back
                </button>
              )}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : step < 2 ? <>Next <ChevronRight size={16} /></> : <><Check size={16} /> Create Trip</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  );
}
