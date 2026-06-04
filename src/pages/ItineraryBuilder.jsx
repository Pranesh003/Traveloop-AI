import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import { Plus, Trash2, Edit, Check, X, MapPin, Clock, DollarSign, Sparkles, GripVertical } from 'lucide-react';

const INITIAL_STOPS = [
  { id: 1, city: 'Tokyo', country: 'Japan', startDate: '2026-10-15', endDate: '2026-10-18', order: 0, activities: [
    { id: 1, name: 'Senso-ji Temple', time: '09:00', cost: 0, category: 'Culture', emoji: '⛩️' },
    { id: 2, name: 'Harajuku Street', time: '14:00', cost: 500, category: 'Shopping', emoji: '🛍️' },
  ]},
  { id: 2, city: 'Kyoto', country: 'Japan', startDate: '2026-10-18', endDate: '2026-10-22', order: 1, activities: [
    { id: 3, name: 'Fushimi Inari', time: '08:00', cost: 0, category: 'Sightseeing', emoji: '⛩️' },
    { id: 4, name: 'Arashiyama Bamboo', time: '11:00', cost: 0, category: 'Nature', emoji: '🎋' },
  ]},
  { id: 3, city: 'Osaka', country: 'Japan', startDate: '2026-10-22', endDate: '2026-10-25', order: 2, activities: [
    { id: 5, name: 'Dotonbori Food Tour', time: '18:00', cost: 2000, category: 'Food', emoji: '🍜' },
  ]},
];

export default function ItineraryBuilder() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [stops, setStops] = useState(INITIAL_STOPS);
  const [addingActivity, setAddingActivity] = useState(null);
  const [newActivity, setNewActivity] = useState({ name: '', time: '09:00', cost: '', category: 'Sightseeing', emoji: '🗺️' });

  const handleAddActivity = (stopId) => {
    if (!newActivity.name) return;
    setStops(p => p.map(s => s.id === stopId ? { ...s, activities: [...s.activities, { ...newActivity, id: Date.now(), cost: parseFloat(newActivity.cost) || 0 }] } : s));
    setNewActivity({ name: '', time: '09:00', cost: '', category: 'Sightseeing', emoji: '🗺️' });
    setAddingActivity(null);
  };

  const removeActivity = (stopId, actId) => {
    setStops(p => p.map(s => s.id === stopId ? { ...s, activities: s.activities.filter(a => a.id !== actId) } : s));
  };

  const totalCost = stops.flatMap(s => s.activities).reduce((sum, a) => sum + (a.cost || 0), 0);

  return (
    <SidebarLayout>
      <div className="page-container">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3 animate-fade-in">
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>🗺️ Itinerary Builder</h1>
            <p className="text-secondary">Trip #{tripId} · {stops.length} stops · ₹{totalCost.toLocaleString('en-IN')} activities</p>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/ai-planner')}>
              <Sparkles size={14} /> AI Optimize
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/budget/${tripId}`)}>
              💰 Budget
            </button>
          </div>
        </div>

        {/* Route Overview */}
        <div className="glass-card p-5 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h3 className="mb-4">Route Overview</h3>
          <div className="flex items-center gap-3 flex-wrap">
            {stops.map((stop, i) => (
              <React.Fragment key={stop.id}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 40, height: 40, background: 'var(--gradient-violet)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: 'white' }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{stop.city}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{stop.activities.length} activities</span>
                </div>
                {i < stops.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, var(--violet), var(--cyan))', borderRadius: 1, minWidth: 40 }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Stops */}
        <div className="flex flex-col gap-5 stagger animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {stops.map((stop, stopIdx) => (
            <div key={stop.id} className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
              {/* Stop Header */}
              <div style={{ padding: 'var(--space-4) var(--space-5)', background: 'rgba(124,58,237,0.07)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 36, height: 36, background: 'var(--gradient-violet)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>
                    {stopIdx + 1}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      <MapPin size={14} style={{ display: 'inline', marginRight: 6, color: 'var(--violet-light)' }} />
                      {stop.city}, {stop.country}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(stop.startDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })} → {new Date(stop.endDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <span className="badge badge-cyan">{stop.activities.length} activities</span>
              </div>

              {/* Activities */}
              <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
                <div className="flex flex-col gap-3">
                  {stop.activities.map((act, actIdx) => (
                    <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                      <GripVertical size={16} style={{ color: 'var(--text-muted)', flexShrink: 0, cursor: 'grab' }} />
                      <div style={{ width: 36, height: 36, background: 'rgba(124,58,237,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                        {act.emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 2 }}>{act.name}</div>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} /> {act.time}</span>
                          <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{act.category}</span>
                          {act.cost > 0 && <span style={{ fontSize: '0.72rem', color: 'var(--orange-light)', fontWeight: 600 }}>₹{act.cost.toLocaleString('en-IN')}</span>}
                        </div>
                      </div>
                      <button onClick={() => removeActivity(stop.id, act.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Activity */}
                {addingActivity === stop.id ? (
                  <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-4)', background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div className="grid-2 mb-3">
                      <div className="input-group">
                        <label>Activity Name</label>
                        <input type="text" placeholder="e.g. Senso-ji Temple" value={newActivity.name} onChange={e => setNewActivity(p => ({ ...p, name: e.target.value }))} />
                      </div>
                      <div className="input-group">
                        <label>Time</label>
                        <input type="time" value={newActivity.time} onChange={e => setNewActivity(p => ({ ...p, time: e.target.value }))} />
                      </div>
                      <div className="input-group">
                        <label>Cost (₹)</label>
                        <input type="number" placeholder="0" value={newActivity.cost} onChange={e => setNewActivity(p => ({ ...p, cost: e.target.value }))} />
                      </div>
                      <div className="input-group">
                        <label>Category</label>
                        <select value={newActivity.category} onChange={e => setNewActivity(p => ({ ...p, category: e.target.value }))}>
                          {['Sightseeing', 'Food', 'Culture', 'Shopping', 'Nature', 'Adventure', 'Photography', 'Entertainment'].map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-primary btn-sm" onClick={() => handleAddActivity(stop.id)}><Check size={14} /> Add</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setAddingActivity(null)}><X size={14} /> Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="btn btn-ghost btn-sm mt-3"
                    style={{ width: '100%', borderStyle: 'dashed' }}
                    onClick={() => setAddingActivity(stop.id)}
                  >
                    <Plus size={14} /> Add Activity
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SidebarLayout>
  );
}
