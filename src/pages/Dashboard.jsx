import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SidebarLayout from '../components/SidebarLayout';
import { getWeather } from '../services/weatherService';
import { apiService } from '../services/apiService';
import {
  Sparkles, Plus, MapPin, Calendar, TrendingUp, Globe,
  ArrowRight, Compass, Zap, Star, Clock, Users, Lock, CreditCard, X
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
  const [packages, setPackages] = useState([]);

  // Payment Gateway states
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlanName, setSelectedPlanName] = useState('');
  const [selectedPlanPrice, setSelectedPlanPrice] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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

    const loadPackages = async () => {
      try {
        const data = await apiService.packages.getAll();
        setPackages(data.slice(0, 4));
      } catch (e) {
        console.error("Failed to load packages", e);
      }
    };
    loadPackages();
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
              setSelectedPlanName('Premium');
              setSelectedPlanPrice('₹299');
              setPaymentModalOpen(true);
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

        {/* ─── New Packages ─── */}
        {packages.length > 0 && (
          <section className="inspiration-section animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <div className="section-header">
              <div>
                <div className="section-title">New Packages</div>
                <div className="section-subtitle">Exclusively curated travel packages for you</div>
              </div>
            </div>
            
            <div className="relative mt-4">
              <div className={`packages-grid ${user?.plan === 'free' ? 'filter blur-sm select-none pointer-events-none' : ''}`}>
                {packages.map((pkg) => (
                  <div key={pkg.id} className="package-card">
                    <div className="package-card-glow" />
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-semibold bg-violet-500/10 text-violet-400 px-2.5 py-1 rounded-md">{pkg.duration}</span>
                        <div className="flex items-center gap-1 text-sm text-yellow-400 font-bold">
                          <Star size={14} className="fill-yellow-400" /> {pkg.rating || '5.0'}
                        </div>
                      </div>
                      <h4 className="text-base font-bold text-white mb-2 leading-snug">{pkg.name}</h4>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5 relative z-10">
                      <span className="text-lg font-black text-white">{pkg.price}</span>
                      <button className="text-xs font-bold text-violet-400 hover:text-white bg-violet-500/10 hover:bg-violet-500 px-3 py-1.5 rounded-lg transition-all" onClick={() => navigate('/ai-planner', { state: { packageId: pkg.id } })}>
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {user?.plan === 'free' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center z-10">
                  <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 mb-3">
                    <Lock size={24} />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-1">Unlock Premium Curated Packages</h4>
                  <p className="text-sm text-gray-400 max-w-sm mb-4">Upgrade to Pro or Premium Planner to access and book these exclusive travel itineraries.</p>
                  <button className="btn btn-primary btn-sm" style={{ background: 'var(--gradient-violet)' }} onClick={() => {
                    setSelectedPlanName('Premium');
                    setSelectedPlanPrice('₹299');
                    setPaymentModalOpen(true);
                  }}>
                    ⭐ Upgrade to Plan
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

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

      {/* ─── Payment Modal ─── */}
      {paymentModalOpen && (
        <div className="modal-backdrop" onClick={() => setPaymentModalOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="modal glass-card" style={{ maxWidth: 440, padding: 32, width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'white' }}>
                <CreditCard className="text-violet" size={20} />
                Secure Checkout
              </h3>
              <button 
                onClick={() => setPaymentModalOpen(false)} 
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 8, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="text-center py-6 flex flex-col items-center gap-4 animate-scale-in">
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto' }}>
                  ✓
                </div>
                <h4 className="text-lg font-bold text-white">Payment Successful!</h4>
                <p className="text-sm text-gray-400">
                  Your account is being upgraded. Unlocking premium features...
                </p>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setPaymentProcessing(true);
                setTimeout(async () => {
                  setPaymentProcessing(false);
                  setPaymentSuccess(true);
                  const targetPlan = selectedPlanName.toLowerCase() === 'premium' ? 'premium' : 'pro';
                  if (user) {
                    await updateUser({ plan: targetPlan });
                    setTimeout(() => {
                      setPaymentModalOpen(false);
                      setPaymentSuccess(false);
                      window.location.reload();
                    }, 1500);
                  }
                }, 2000);
              }} className="flex flex-col gap-4">
                <div style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', padding: '12px 16px', borderRadius: 12, marginBottom: 8 }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--violet-light)', fontWeight: 700 }}>Selected Tier</div>
                  <div className="flex justify-between items-center mt-1">
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>{selectedPlanName} Plan</span>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--emerald-light)' }}>{selectedPlanPrice}/mo</span>
                  </div>
                </div>

                <div className="input-group">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cardholder Name</label>
                  <input required type="text" placeholder="John Doe" value={cardName} onChange={e => setCardName(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: 10, color: 'white', outline: 'none' }} />
                </div>

                <div className="input-group">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Card Number</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="4111 2222 3333 4444" 
                    maxLength={19} 
                    value={cardNumber} 
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                      setCardNumber(val);
                    }} 
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: 10, color: 'white', outline: 'none' }}
                  />
                </div>

                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="input-group">
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Expiry Date</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="MM/YY" 
                      maxLength={5} 
                      value={cardExpiry} 
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length >= 2) {
                          setCardExpiry(val.slice(0, 2) + '/' + val.slice(2, 4));
                        } else {
                          setCardExpiry(val);
                        }
                      }} 
                      style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: 10, color: 'white', outline: 'none' }}
                    />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CVV</label>
                    <input required type="password" placeholder="•••" maxLength={3} value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))} style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: 10, color: 'white', outline: 'none' }} />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full mt-4" disabled={paymentProcessing} style={{ width: '100%' }}>
                  {paymentProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="loading-spinner" style={{ width: 16, height: 16 }} />
                      <span>Processing Transaction...</span>
                    </div>
                  ) : (
                    <span>Pay {selectedPlanPrice}</span>
                  )}
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  🔒 256-Bit SSL Encrypted Connection
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
