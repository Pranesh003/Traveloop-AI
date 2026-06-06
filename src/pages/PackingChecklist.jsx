import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import { generatePackingList } from '../services/aiService';
import { Package, Sparkles, CheckSquare, Square, Plus, Trash2, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

const DEFAULT_CATEGORIES = {
  Clothing: ['T-shirts (5)', 'Jeans/Pants (2)', 'Comfortable walking shoes', 'Light jacket', 'Socks & underwear (7 sets)'],
  Electronics: ['Smartphone + charger', 'Power bank (20,000mAh)', 'Camera', 'Universal adapter'],
  Documents: ['Passport', 'Travel insurance', 'Hotel bookings', 'Flight tickets', 'Emergency contacts'],
  Medicines: ['First aid kit', 'Personal medications', 'Sunscreen SPF 50+', 'Insect repellent'],
  Toiletries: ['Toothbrush & toothpaste', 'Shampoo & conditioner', 'Deodorant', 'Hand sanitizer'],
  Miscellaneous: ['Reusable water bottle', 'Neck pillow', 'Travel umbrella', 'Ziplock bags'],
};

const CATEGORY_ICONS = { Clothing: '👔', Electronics: '📱', Documents: '📄', Medicines: '💊', Toiletries: '🧴', Miscellaneous: '🎒' };

export default function PackingChecklist() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem(`tl_packing_${tripId}`);
    if (saved) return JSON.parse(saved);
    const initial = {};
    Object.entries(DEFAULT_CATEGORIES).forEach(([cat, list]) => {
      initial[cat] = list.map(name => ({ id: Date.now() + Math.random(), name, packed: false }));
    });
    return initial;
  });
  const [collapsed, setCollapsed] = useState({});
  const [newItem, setNewItem] = useState({});
  const [aiLoading, setAiLoading] = useState(false);

  const [trip, setTrip] = useState(null);

  useEffect(() => {
    async function loadTrip() {
      try {
        const data = await apiService.trips.getById(tripId);
        setTrip(data);
        
        // If there's no saved localStorage checklist yet, but the trip has AI-generated packingList, initialize from it
        const saved = localStorage.getItem(`tl_packing_${tripId}`);
        if (!saved) {
          const aiData = data?.aiData ? (typeof data.aiData === 'string' ? JSON.parse(data.aiData) : data.aiData) : {};
          if (aiData?.packingList) {
            const initial = {};
            Object.entries(aiData.packingList).forEach(([cat, list]) => {
              initial[cat] = list.map(name => ({ id: Date.now() + Math.random(), name, packed: false }));
            });
            setItems(initial);
          }
        }
      } catch (err) {
        console.error('Failed to load trip info for packing list:', err);
      }
    }
    loadTrip();
  }, [tripId]);

  useEffect(() => {
    localStorage.setItem(`tl_packing_${tripId}`, JSON.stringify(items));
  }, [items, tripId]);

  const toggle = (cat, id) => {
    setItems(p => ({ ...p, [cat]: p[cat].map(i => i.id === id ? { ...i, packed: !i.packed } : i) }));
  };

  const addItem = (cat) => {
    const val = newItem[cat]?.trim();
    if (!val) return;
    setItems(p => ({ ...p, [cat]: [...(p[cat] || []), { id: Date.now(), name: val, packed: false }] }));
    setNewItem(p => ({ ...p, [cat]: '' }));
  };

  const removeItem = (cat, id) => {
    setItems(p => ({ ...p, [cat]: p[cat].filter(i => i.id !== id) }));
  };

  const resetAll = () => {
    setItems(p => {
      const reset = {};
      Object.entries(p).forEach(([cat, list]) => {
        reset[cat] = list.map(i => ({ ...i, packed: false }));
      });
      return reset;
    });
  };

  const generateAI = async () => {
    if (!trip) return;
    setAiLoading(true);
    const aiData = trip.aiData || {};
    const list = await generatePackingList({
      destination: trip.description || 'Unknown Destination',
      duration: aiData.duration || 7,
      weather: aiData.weather || 'Pleasant 22°C',
      travelStyle: aiData.travelStyle || 'Leisure'
    });
    const converted = {};
    Object.entries(list).forEach(([cat, names]) => {
      converted[cat] = names.map(name => ({ id: Date.now() + Math.random(), name, packed: false }));
    });
    setItems(converted);
    setAiLoading(false);
  };

  const allItems = Object.values(items).flat();
  const packedCount = allItems.filter(i => i.packed).length;
  const totalCount = allItems.length;
  const progress = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  return (
    <SidebarLayout>
      <div className="page-container">
        <div className="flex justify-between items-center mb-6 animate-fade-in flex-wrap gap-3">
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>🧳 Packing Assistant</h1>
            <p className="text-secondary">Trip #{tripId} · {packedCount}/{totalCount} items packed</p>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-secondary btn-sm" onClick={resetAll}><RotateCcw size={14} /> Reset</button>
            <button className="btn btn-primary btn-sm" onClick={generateAI} disabled={aiLoading}>
              <Sparkles size={14} /> {aiLoading ? 'Generating...' : 'AI Generate'}
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="glass-card p-6 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold">Packing Progress</span>
            <span className="font-display text-2xl font-bold gradient-text">{progress}%</span>
          </div>
          <div className="progress-bar" style={{ height: 12, borderRadius: 6 }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex gap-6 mt-3">
            <span className="text-sm text-muted">✅ {packedCount} packed</span>
            <span className="text-sm text-muted">⬜ {totalCount - packedCount} remaining</span>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-4 stagger animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {Object.entries(items).map(([cat, catItems]) => {
            const catPacked = catItems.filter(i => i.packed).length;
            const isCollapsed = collapsed[cat];
            return (
              <div key={cat} className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
                <button
                  className="flex items-center justify-between w-full p-5"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                  onClick={() => setCollapsed(p => ({ ...p, [cat]: !p[cat] }))}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '1.4rem' }}>{CATEGORY_ICONS[cat] || '📦'}</span>
                    <span style={{ fontWeight: 700 }}>{cat}</span>
                    <span className="badge badge-violet">{catPacked}/{catItems.length}</span>
                  </div>
                  {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </button>
                {!isCollapsed && (
                  <div style={{ padding: '0 var(--space-5) var(--space-5)', borderTop: '1px solid var(--border)' }}>
                    <div className="flex flex-col gap-2 mt-4">
                      {catItems.map(item => (
                        <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg"
                          style={{ background: item.packed ? 'rgba(16,185,129,0.05)' : 'var(--bg-glass)', border: '1px solid', borderColor: item.packed ? 'rgba(16,185,129,0.2)' : 'var(--border)', borderRadius: 'var(--radius-md)', transition: 'all 0.2s' }}>
                          <button onClick={() => toggle(cat, item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: item.packed ? 'var(--emerald)' : 'var(--text-muted)', display: 'flex', flexShrink: 0 }}>
                            {item.packed ? <CheckSquare size={20} /> : <Square size={20} />}
                          </button>
                          <span style={{ flex: 1, fontSize: '0.875rem', color: item.packed ? 'var(--text-muted)' : 'var(--text-secondary)', textDecoration: item.packed ? 'line-through' : 'none' }}>{item.name}</span>
                          <button onClick={() => removeItem(cat, item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', opacity: 0, transition: 'opacity 0.2s' }}
                            onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <input
                        type="text"
                        placeholder={`Add item to ${cat}...`}
                        value={newItem[cat] || ''}
                        onChange={e => setNewItem(p => ({ ...p, [cat]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addItem(cat)}
                        style={{ flex: 1, fontSize: '0.8rem', padding: '6px 12px' }}
                      />
                      <button className="btn btn-primary btn-sm" onClick={() => addItem(cat)}><Plus size={14} /></button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </SidebarLayout>
  );
}
