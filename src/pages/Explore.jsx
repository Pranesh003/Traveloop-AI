import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import { discoverDestinations } from '../services/aiService';
import { getWeather } from '../services/weatherService';
import { db } from '../services/mockDatabase';
import { apiService } from '../services/apiService';
import { Search, Sparkles, MapPin, Star, TrendingUp, Globe, Filter } from 'lucide-react';

const STATIC_FEATURED = [
  { name: 'Tokyo', country: 'Japan', emoji: '🗾', score: 98, budget: 'From ₹1.2L', tag: 'Trending', color: '#7c3aed', desc: 'Futuristic metropolis meets ancient temples' },
  { name: 'Bali', country: 'Indonesia', emoji: '🌴', score: 96, budget: 'From ₹55K', tag: 'Popular', color: '#10b981', desc: 'Spiritual retreats, beaches, and rice terraces' },
  { name: 'Paris', country: 'France', emoji: '🗼', score: 95, budget: 'From ₹1.5L', tag: 'Iconic', color: '#f97316', desc: 'City of love, art, and world-class cuisine' },
  { name: 'Manali', country: 'India', emoji: '🏔️', score: 93, budget: 'From ₹18K', tag: 'Budget-Friendly', color: '#06b6d4', desc: 'Snow-capped peaks and adventure sports' },
  { name: 'Dubai', country: 'UAE', emoji: '🏙️', score: 91, budget: 'From ₹80K', tag: 'Luxury', color: '#f43f5e', desc: 'World records, shopping malls, and desert safari' },
  { name: 'Santorini', country: 'Greece', emoji: '🏛️', score: 97, budget: 'From ₹1.8L', tag: 'Romantic', color: '#1d4ed8', desc: 'Blue-domed churches and stunning sunsets' },
];

export default function Explore() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [aiResults, setAiResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [weather, setWeather] = useState({});
  const [dbDestinations, setDbDestinations] = useState([]);

  useEffect(() => {
    // Merge real database items with rich mock data
    const fetchAndMap = async () => {
      const rawItems = await apiService.destinations.getAll();
      const items = rawItems.filter(d => {
        // Support both PostgreSQL (isPublished) and mock DB (status)
        const isPublished = d.isPublished !== undefined ? d.isPublished : (d.status === 'Active');
        return isPublished;
      });
      const mapped = items.map((d, i) => {
        // Support both d.city (mock) and d.city.name (PostgreSQL)
        const cityName = d.city && typeof d.city === 'object' ? d.city.name : (d.city || d.name || 'Unknown');
        const countryName = d.city && d.city.country && typeof d.city.country === 'object' ? d.city.country.name : (d.country || 'Unknown');
        
        const existing = STATIC_FEATURED.find(f => f.name === cityName);
        return {
          name: cityName,
          country: countryName,
          emoji: existing?.emoji || ['📍','🗺️','🏔️','🏖️','🏙️', '🚂'][i % 6],
          score: existing?.score || (90 + (i % 10)),
          budget: existing?.budget || 'From ₹50K',
          tag: existing?.tag || 'New',
          color: existing?.color || ['#7c3aed', '#10b981', '#f97316', '#06b6d4', '#f43f5e', '#1d4ed8'][i % 6],
          desc: existing?.desc || `Explore the beautiful city of ${cityName}, ${countryName}.`
        };
      });
      setDbDestinations(mapped);
    };
    fetchAndMap();
  }, []);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const results = await discoverDestinations(query);
      setAiResults(results);
    } catch {}
    setLoading(false);
  };

  const handleSelect = async (dest) => {
    setSelected(dest);
    if (!weather[dest.name]) {
      const w = await getWeather(dest.name);
      setWeather(p => ({ ...p, [dest.name]: w }));
    }
  };

  const displayList = aiResults || dbDestinations;

  return (
    <SidebarLayout>
      <div className="page-container">
        <div className="animate-fade-in mb-6">
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>🌍 Explore Destinations</h1>
          <p className="text-secondary">Discover your next adventure with AI-powered recommendations</p>
        </div>

        {/* AI Search */}
        <form onSubmit={handleSearch} className="glass-card p-5 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex gap-3 flex-wrap">
            <div className="input-wrapper" style={{ flex: 1, minWidth: 260 }}>
              <Sparkles size={16} className="input-icon" style={{ color: 'var(--violet-light)' }} />
              <input
                type="text"
                placeholder='Ask AI: "cold places under ₹40K" or "romantic beach destinations"'
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ paddingLeft: '44px' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Sparkles size={16} /> {loading ? 'Searching...' : 'AI Discover'}
            </button>
            {aiResults && <button type="button" className="btn btn-ghost" onClick={() => { setAiResults(null); setQuery(''); }}>Clear</button>}
          </div>
        </form>

        {/* Destination Grid */}
        <div>
          <div className="section-header mb-4">
            <h2 className="section-title">{aiResults ? `AI Results for "${query}"` : '✨ Featured Destinations'}</h2>
            {aiResults && <span className="badge badge-violet"><Sparkles size={10} /> AI Powered</span>}
          </div>

          <div className="grid-3 stagger">
            {displayList.map((dest, i) => (
              <div
                key={i}
                className="glass-card"
                style={{ cursor: 'pointer', overflow: 'hidden', padding: 0, transition: 'all 0.3s' }}
                onClick={() => handleSelect(dest)}
              >
                {/* Cover */}
                <div style={{ height: 160, background: `linear-gradient(135deg, ${dest.color || '#7c3aed'}22, ${dest.color || '#7c3aed'}88)`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '4rem' }}>{dest.emoji}</span>
                  <div style={{ position: 'absolute', top: 12, left: 12 }}>
                    <span className="badge badge-violet">{dest.tag || 'Destination'}</span>
                  </div>
                  <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={10} fill="gold" stroke="gold" /> {dest.score || 95}
                  </div>
                </div>

                <div style={{ padding: 'var(--space-4)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{dest.name}</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={10} /> {dest.country}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-light)' }}>{dest.budget}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)', lineHeight: 1.5 }}>{dest.desc || dest.vibe}</p>

                  {/* Weather if selected */}
                  {selected?.name === dest.name && weather[dest.name] && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: 'rgba(6,182,212,0.1)', borderRadius: 8, marginBottom: 'var(--space-3)' }}>
                      <span>{weather[dest.name].icon}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--cyan-light)' }}>{weather[dest.name].temp}°C · {weather[dest.name].description}</span>
                    </div>
                  )}

                  {dest.highlights && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {dest.highlights.slice(0, 2).map(h => <span key={h} className="tag">{h}</span>)}
                    </div>
                  )}

                  <button
                    className="btn btn-primary btn-sm w-full"
                    onClick={e => { e.stopPropagation(); navigate('/ai-planner', { state: { prompt: `Plan a trip to ${dest.name}, ${dest.country}` } }); }}
                  >
                    <Sparkles size={12} /> Plan with AI
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
