import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import { Plus, MapPin, Calendar, MoreVertical, Sparkles, Search, Filter, Trash2, Edit, Eye, Share2 } from 'lucide-react';
import { apiService } from '../services/apiService';
import './MyTrips.css';

const ALL_TRIPS = [
  { id: 1, title: 'Japan Discovery', destination: 'Tokyo & Kyoto, Japan', startDate: '2026-10-15', endDate: '2026-10-25', status: 'upcoming', emoji: '🗾', budget: 150000, stops: 5, progress: 72, cover: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)' },
  { id: 2, title: 'Bali Retreat', destination: 'Ubud & Seminyak, Indonesia', startDate: '2026-12-20', endDate: '2026-12-28', status: 'upcoming', emoji: '🌴', budget: 80000, stops: 3, progress: 35, cover: 'linear-gradient(135deg,#0a3d0a,#1a5c1a,#0d7a0d)' },
  { id: 3, title: 'Manali Snow Trip', destination: 'Manali, Himachal Pradesh', startDate: '2026-08-01', endDate: '2026-08-07', status: 'completed', emoji: '🏔️', budget: 30000, stops: 4, progress: 100, cover: 'linear-gradient(135deg,#1e3a5f,#2d5a8e,#1a2f4f)' },
  { id: 4, title: 'Dubai Luxury', destination: 'Dubai, UAE', startDate: '2027-01-10', endDate: '2027-01-17', status: 'planning', emoji: '🏙️', budget: 120000, stops: 6, progress: 15, cover: 'linear-gradient(135deg,#3d1a0a,#7a2d0d,#b8420f)' },
];

const STATUS_COLORS = { upcoming: 'badge-violet', completed: 'badge-emerald', planning: 'badge-cyan' };

export default function MyTrips() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [openMenu, setOpenMenu] = useState(null);

  const [tripsList, setTripsList] = useState([]);

  useEffect(() => {
    const loadTrips = async () => {
      try {
        const apiTrips = await apiService.trips.getAll();
        
        const mappedTrips = apiTrips.map(t => {
          let progress = 15;
          let budget = 0;
          let stops = t.stops?.length || 1;
          let emoji = '🗺️';
          let cover = 'linear-gradient(135deg,#0a3d0a,#1a5c1a,#0d7a0d)';
          let destination = t.description || 'Unknown Destination';
          
          if (t.aiData) {
            progress = 100;
            emoji = '✨';
            cover = 'linear-gradient(135deg,#7c3aed,#4c1d95,#2e1065)';
            if (t.aiData.destination) destination = t.aiData.destination;
            if (t.aiData.totalBudget) budget = t.aiData.totalBudget;
            if (t.aiData.itinerary) stops = t.aiData.itinerary.length;
          }

          return {
            id: t.id,
            title: t.name || 'Untitled Trip',
            destination: destination,
            startDate: t.startDate || t.createdAt,
            endDate: t.endDate || new Date(new Date(t.createdAt).getTime() + 86400000).toISOString(),
            status: t.status === 'DRAFT' ? 'planning' : t.status.toLowerCase(),
            emoji,
            budget,
            stops,
            progress,
            cover,
            isAi: !!t.aiData,
            isStatic: false
          };
        });
        
        setTripsList(mappedTrips);
      } catch (e) {
        console.error("Failed to load trips", e);
      }
    };
    loadTrips();
  }, []);

  const handleDeleteTrip = async (tripId, isAi = false, isStatic = false) => {
    if (window.confirm("Are you sure you want to delete this trip plan?")) {
      try {
        if (!isStatic) {
          await apiService.trips.delete(tripId);
        }
        setTripsList(prev => prev.filter(t => t.id !== tripId));
        setOpenMenu(null);
      } catch (e) {
        console.error('Failed to delete trip:', e);
      }
    }
  };

  const filtered = tripsList.filter(t => {
    const titleStr = String(t.title || '');
    const destStr = String(t.destination || '');
    const searchStr = String(search || '').toLowerCase();
    const matchSearch = titleStr.toLowerCase().includes(searchStr) || destStr.toLowerCase().includes(searchStr);
    const matchFilter = filter === 'all' || t.status === filter;
    return matchSearch && matchFilter;
  });

  const safeDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'TBD';
      return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    } catch { return 'TBD'; }
  };

  const safeYear = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.getFullYear();
    } catch { return ''; }
  };

  return (
    <SidebarLayout>
      <div className="page-container">
        {/* Header */}
        <div className="section-header animate-fade-in">
          <div>
            <h1 className="section-title" style={{ fontSize: '2rem' }}>My Trips</h1>
            <p className="section-subtitle">{tripsList.length} trips total</p>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/ai-planner')}>
              <Sparkles size={14} /> AI Plan
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/create-trip')}>
              <Plus size={14} /> New Trip
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="trips-filters animate-fade-in glass-card">
          <div className="input-wrapper" style={{ flex: 1 }}>
            <Search size={16} className="input-icon" />
            <input type="text" placeholder="Search trips..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filter-chips">
            {['all', 'upcoming', 'completed', 'planning'].map(f => (
              <button key={f} className={`tag ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Trips Grid */}
        <div className="trips-grid stagger animate-fade-in" style={{ animationDelay: '0.15s' }}>
          {filtered.map((trip) => (
            <div key={trip.id || Math.random()} className="trip-full-card glass-card" onClick={() => navigate(`/builder/${trip.id}`)}>
              <div className="trip-full-cover" style={{ background: trip.cover || '#333' }}>
                <span className="trip-full-emoji">{trip.emoji || '✈️'}</span>
                <div className="trip-full-cover-overlay">
                  <span className={`badge ${STATUS_COLORS[trip.status] || 'badge-cyan'}`}>{trip.status || 'planning'}</span>
                  <button
                    className="trip-menu-btn"
                    onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === trip.id ? null : trip.id); }}
                  >
                    <MoreVertical size={16} />
                  </button>
                  {openMenu === trip.id && (
                    <div className="trip-menu" onClick={e => e.stopPropagation()}>
                      <button onClick={() => navigate(`/builder/${trip.id}`)}><Edit size={14} /> Edit</button>
                      <button onClick={() => navigate(`/builder/${trip.id}`)}><Eye size={14} /> View</button>
                      <button><Share2 size={14} /> Share</button>
                      <button className="danger" onClick={() => handleDeleteTrip(trip.id, trip.isAi, trip.isStatic)}><Trash2 size={14} /> Delete</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="trip-full-info">
                <h3>{String(trip.title || 'Untitled')}</h3>
                <p className="trip-full-dest"><MapPin size={12} /> {String(trip.destination || 'Unknown')}</p>
                <div className="trip-full-meta">
                  <span><Calendar size={12} /> {safeDate(trip.startDate)} – {safeDate(trip.endDate)} {safeYear(trip.endDate)}</span>
                </div>
                <div className="trip-full-footer">
                  <span className="trip-full-budget">₹{Number(trip.budget) ? (Number(trip.budget) / 1000).toFixed(0) : '0'}K budget</span>
                  <span className="trip-full-stops">{Number(trip.stops) || 1} stops</span>
                </div>
                <div className="progress-bar mt-3">
                  <div className="progress-fill" style={{ width: `${Number(trip.progress) || 0}%` }} />
                </div>
                <span className="text-xs text-muted">{Number(trip.progress) || 0}% planned</span>
              </div>
            </div>
          ))}

          {/* Add Card */}
          <div className="trip-add-card glass-card" onClick={() => navigate('/create-trip')}>
            <Plus size={36} style={{ color: 'var(--text-muted)' }} />
            <h3>Plan a New Trip</h3>
            <p>Start planning your next adventure</p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-3)' }}>Get Started</button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
