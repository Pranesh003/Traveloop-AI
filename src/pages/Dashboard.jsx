import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SidebarLayout from '../components/SidebarLayout';
import { getWeather } from '../services/weatherService';
import { apiService } from '../services/apiService';
import {
  Sparkles, Plus, MapPin, Calendar, TrendingUp, Globe,
  ArrowRight, Compass, Zap, Star, Clock, Users
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import './Dashboard.css';

const GREETINGS = [
  { range: [5, 11], text: 'Good Morning', emoji: '🌅' },
  { range: [11, 17], text: 'Good Afternoon', emoji: '☀️' },
  { range: [17, 21], text: 'Good Evening', emoji: '🌆' },
  { range: [21, 24], text: 'Good Night', emoji: '🌙' },
  { range: [0, 5], text: 'Still up?', emoji: '🦉' },
];

const MOCK_TRIPS = [
  { id: 1, title: 'Japan Discovery', destination: 'Tokyo & Kyoto', startDate: '2026-10-15', endDate: '2026-10-25', status: 'upcoming', progress: 72, cover: 'trip-japan', stops: 5, budget: 150000, spent: 48000, emoji: '🗾' },
  { id: 2, title: 'Bali Retreat', destination: 'Ubud & Seminyak', startDate: '2026-12-20', endDate: '2026-12-28', status: 'upcoming', progress: 35, cover: 'trip-bali', stops: 3, budget: 80000, spent: 0, emoji: '🌴' },
  { id: 3, title: 'Manali Snow Trip', destination: 'Manali, Himachal', startDate: '2026-08-01', endDate: '2026-08-07', status: 'completed', progress: 100, cover: 'trip-manali', stops: 4, budget: 30000, spent: 28500, emoji: '🏔️' },
];

const QUICK_ACTIONS = [
  { icon: Sparkles, label: 'AI Plan Trip', desc: 'Describe and generate', path: '/ai-planner', gradient: 'var(--gradient-violet)' },
  { icon: Plus, label: 'New Trip', desc: 'Create manually', path: '/create-trip', gradient: 'linear-gradient(135deg,#0891b2,#06b6d4)' },
  { icon: Compass, label: 'Explore', desc: 'Discover destinations', path: '/explore', gradient: 'linear-gradient(135deg,#ea580c,#f97316)' },
  { icon: Globe, label: 'AI Chat', desc: 'Ask your travel AI', path: '/ai-chat', gradient: 'linear-gradient(135deg,#047857,#10b981)' },
];

const ACTIVITY_DATA = [
  { month: 'Jan', trips: 1 }, { month: 'Feb', trips: 0 }, { month: 'Mar', trips: 2 },
  { month: 'Apr', trips: 1 }, { month: 'May', trips: 3 }, { month: 'Jun', trips: 1 },
];

const STATIC_INSPIRATION = [
  { name: 'Santorini', country: 'Greece', emoji: '🏛️', tag: 'Romantic', color: '#1d4ed8' },
  { name: 'Maldives', country: 'Maldives', emoji: '🏝️', tag: 'Luxury', color: '#0891b2' },
  { name: 'Patagonia', country: 'Argentina', emoji: '🏔️', tag: 'Adventure', color: '#047857' },
  { name: 'Kyoto', country: 'Japan', emoji: '⛩️', tag: 'Cultural', color: '#be123c' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [weather, setWeather] = useState(null);
  const [aiInput, setAiInput] = useState('');
  const [dbInspiration, setDbInspiration] = useState([]);
  const [dbTrips, setDbTrips] = useState([]);

  const hour = new Date().getHours();
  const greeting = GREETINGS.find(g => hour >= g.range[0] && hour < g.range[1]) || GREETINGS[0];
  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Traveler';

  useEffect(() => {
    // Request location permission from browser
    if (navigator.geolocation && (!user?.location || user?.location === 'India')) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
              headers: { 'Accept-Language': 'en' }
            });
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || 'Coimbatore';
            const country = data.address?.country || 'India';
            updateUser({ location: `${city}, ${country}` });
          } catch (e) {
            console.error("Reverse geocoding failed", e);
            updateUser({ location: 'Coimbatore, India' });
          }
        },
        (error) => {
          console.error("Geolocation request denied or failed:", error);
          if (!user?.location) {
            updateUser({ location: 'Coimbatore, India' });
          }
        }
      );
    }

    // Load from API
    const loadDestinations = async () => {
      const items = (await apiService.destinations.getAll()).filter(d => d.status === 'Active');
      const mapped = items.slice(0, 4).map((d, i) => {
        const existing = STATIC_INSPIRATION.find(f => f.name === d.city);
        return {
          name: d.city,
          country: d.country,
          emoji: existing?.emoji || ['📍','🗺️','🏔️','🏖️'][i % 4],
          tag: existing?.tag || 'Explore',
          color: existing?.color || ['#1d4ed8', '#0891b2', '#047857', '#be123c'][i % 4]
        };
      });
      setDbInspiration(mapped.length > 0 ? mapped : STATIC_INSPIRATION);
    };
    loadDestinations();

    const loadTrips = async () => {
      try {
        const apiTrips = await apiService.trips.getAll();
        
        // Map backend trips to the format expected by Dashboard
        const mappedTrips = apiTrips.map(t => {
          let progress = 15;
          let budget = 0;
          let stops = t.stops?.length || 1;
          let emoji = '🗺️';
          let cover = 'trip-japan';
          let destination = t.description || 'Unknown Destination';
          
          if (t.aiData) {
            progress = 100;
            emoji = '✨';
            cover = 'trip-bali';
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
            status: t.status === 'DRAFT' ? 'upcoming' : t.status.toLowerCase(),
            emoji,
            budget,
            stops,
            progress,
            cover,
          };
        });
        
        setDbTrips(mappedTrips);
      } catch (e) {
        console.error("Failed to load trips", e);
      }
    };
    loadTrips();
  }, []);

  useEffect(() => {
    const userCity = user?.location?.split(',')[0]?.trim() || 'Coimbatore';
    getWeather(userCity).then(setWeather).catch(() => {});
  }, [user?.location]);

  const handleAiPlan = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    navigate('/ai-planner', { state: { prompt: aiInput } });
  };

  const upcomingTrips = dbTrips.filter(t => t.status === 'upcoming');
  const completedTrips = dbTrips.filter(t => t.status === 'completed');

  const totalSpent = completedTrips.reduce((acc, t) => acc + (Number(t.budget) || 0), 0);
  const formattedSpent = totalSpent > 0 ? `₹${(totalSpent / 1000).toFixed(1)}K` : '₹0';
  
  const uniqueCountries = new Set(
    completedTrips.map(t => {
      const parts = String(t.destination || '').split(',');
      return parts[parts.length - 1].trim();
    }).filter(Boolean)
  );
  const countriesVisitedCount = uniqueCountries.size;

  const safeDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'TBD';
      return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    } catch { return 'TBD'; }
  };

  return (
    <SidebarLayout>
      <div className="page-container dashboard-page">

        {/* ─── Header ─── */}
        <header className="dash-header animate-fade-in">
          <div className="dash-greeting">
            <div className="greeting-row">
              <span className="greeting-emoji">{greeting.emoji}</span>
              <div>
                <h1 className="greeting-text">{greeting.text}, {firstName}!</h1>
                <div className="flex items-center gap-4 flex-wrap mt-1">
                  <p className="greeting-sub">Ready for your next adventure?</p>
                  <span className="text-xs text-violet font-semibold flex items-center gap-1 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                    <MapPin size={10} /> {user?.location || 'Coimbatore, India'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="dash-header-right">
            {weather && (
              <div className="weather-chip">
                <span className="weather-icon">{weather.icon}</span>
                <div>
                  <div className="weather-temp">{weather.temp}°C</div>
                  <div className="weather-city">{weather.city}</div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ─── AI Prompt / Upgrade Banner ─── */}
        {user?.plan !== 'free' ? (
          <div className="ai-prompt-banner animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="ai-banner-left">
              <Sparkles size={20} className="text-violet" />
              <div>
                <p className="ai-banner-title">Where do you want to go?</p>
                <p className="ai-banner-sub text-xs text-muted">Describe any trip and AI plans it in seconds</p>
              </div>
            </div>
            <form className="ai-banner-form" onSubmit={handleAiPlan}>
              <input
                type="text"
                placeholder="e.g. 7-day Japan trip for ₹1.5L in October..."
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                className="ai-banner-input"
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <Sparkles size={14} /> Generate
              </button>
            </form>
          </div>
        ) : (
          <div className="ai-prompt-banner animate-fade-in" style={{ animationDelay: '0.1s', background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(167,139,250,0.05))', border: '1px dashed var(--violet)' }}>
            <div className="ai-banner-left">
              <Sparkles size={20} className="text-violet" />
              <div>
                <p className="ai-banner-title">Unlock Premium AI Features</p>
                <p className="ai-banner-sub text-xs text-muted">Upgrade to Premium to get unlimited trips, advanced AI models, and real-time planning.</p>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => {
              const updated = { ...user, plan: 'premium' };
              localStorage.setItem('tl_user', JSON.stringify(updated));
              window.location.reload();
            }}>
              ⭐ Upgrade to Premium
            </button>
          </div>
        )}

        {/* ─── Stats Row ─── */}
        <div className="stats-row stagger animate-fade-in" style={{ animationDelay: '0.15s' }}>
          {[
            { label: 'Trips Planned', value: dbTrips.length, icon: MapPin, color: 'var(--violet)', bg: 'rgba(124,58,237,0.1)' },
            { label: 'Countries Visited', value: countriesVisitedCount, icon: Globe, color: 'var(--cyan)', bg: 'rgba(6,182,212,0.1)' },
            { label: 'Total Spent', value: formattedSpent, icon: TrendingUp, color: 'var(--orange)', bg: 'rgba(249,115,22,0.1)' },
            { label: 'Upcoming Trips', value: upcomingTrips.length, icon: Calendar, color: 'var(--emerald)', bg: 'rgba(16,185,129,0.1)' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="stat-card">
              <div className="stat-icon" style={{ background: bg, color }}><Icon size={20} /></div>
              <div className="stat-label">{label}</div>
              <div className="stat-value">{value}</div>
            </div>
          ))}
        </div>

        {/* ─── Main Grid ─── */}
        <div className="dash-grid animate-fade-in" style={{ animationDelay: '0.2s' }}>

          {/* Upcoming Trips */}
          <div className="dash-trips-section">
            <div className="section-header">
              <div>
                <div className="section-title">Upcoming Trips</div>
                <div className="section-subtitle">{upcomingTrips.length} planned</div>
              </div>
              <span className="view-all" onClick={() => navigate('/my-trips')}>View all <ArrowRight size={14} /></span>
            </div>

            <div className="trip-cards-list">
              {upcomingTrips.map((trip, i) => (
                <div
                  key={trip.id || Math.random()}
                  className={`trip-card-item ${trip.cover || 'trip-japan'}`}
                  onClick={() => navigate(`/builder/${trip.id}`)}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="trip-card-overlay">
                    <div className="trip-card-top">
                      <span className="trip-emoji">{trip.emoji || '✈️'}</span>
                      <span className="badge badge-violet">{trip.status || 'upcoming'}</span>
                    </div>
                    <div className="trip-card-info">
                      <h3>{String(trip.title || 'Untitled')}</h3>
                      <p><MapPin size={12} /> {String(trip.destination || 'Unknown')}</p>
                      <div className="trip-meta">
                        <span><Calendar size={12} /> {safeDate(trip.startDate)}</span>
                        <span><Users size={12} /> {Number(trip.stops) || 1} stops</span>
                      </div>
                      <div className="trip-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${Number(trip.progress) || 0}%` }} />
                        </div>
                        <span className="progress-label">{Number(trip.progress) || 0}% planned</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="trip-card-item trip-create-card" onClick={() => navigate('/create-trip')}>
                <div className="create-trip-inner">
                  <Plus size={32} style={{ color: 'var(--text-muted)' }} />
                  <span>Plan New Trip</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="dash-right-col">
            {/* Quick Actions */}
            <div className="quick-actions-card glass-card">
              <h3 className="mb-4">Quick Actions</h3>
              <div className="quick-actions-grid">
                {QUICK_ACTIONS.filter(action => {
                  if (user?.plan !== 'free') return true;
                  return ['New Trip', 'Explore'].includes(action.label);
                }).map(({ icon: Icon, label, desc, path, gradient }) => (
                  <button key={label} className="quick-action-btn" onClick={() => navigate(path)}>
                    <div className="quick-action-icon" style={{ background: gradient }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="quick-action-label">{label}</div>
                      <div className="quick-action-desc">{desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Chart */}
            <div className="activity-chart-card glass-card">
              <div className="section-header mb-4">
                <h3>Trip Activity</h3>
                <span className="badge badge-emerald">2026</span>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={ACTIVITY_DATA}>
                  <defs>
                    <linearGradient id="tripGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--violet)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--violet)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: 'var(--text-muted)' }}
                  />
                  <Area type="monotone" dataKey="trips" stroke="var(--violet)" fill="url(#tripGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ─── Inspiration ─── */}
        <section className="inspiration-section animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="section-header">
            <div>
              <div className="section-title">Travel Inspiration</div>
              <div className="section-subtitle">Curated destinations to spark your wanderlust</div>
            </div>
            <span className="view-all" onClick={() => navigate('/explore')}>Explore more <ArrowRight size={14} /></span>
          </div>
          <div className="inspiration-grid stagger">
            {dbInspiration.map(({ name, country, emoji, tag, color }) => (
              <div
                key={name}
                className="inspiration-card"
                style={{ '--card-color': color }}
                onClick={() => navigate('/explore')}
              >
                <span className="inspiration-emoji">{emoji}</span>
                <div className="inspiration-info">
                  <h4>{name}</h4>
                  <span>{country}</span>
                </div>
                <span className="inspiration-tag">{tag}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </SidebarLayout>
  );
}
