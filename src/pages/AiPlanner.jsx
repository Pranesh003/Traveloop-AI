import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import { generateTripPlan } from '../services/aiService';
import { apiService } from '../services/apiService';
import {
  Sparkles, Mic, Send, MapPin, Calendar, DollarSign, Users,
  Utensils, Plane, Hotel, Activity, Package, ChevronDown,
  ChevronUp, CheckCircle, Clock, Star, ArrowRight, Download,
  RefreshCw, Save, Loader
} from 'lucide-react';
import './AiPlanner.css';

const AGENT_SEQUENCE = [
  { id: 'travel', name: 'Travel Agent', icon: '✈️', desc: 'Planning your itinerary...', color: 'var(--violet)' },
  { id: 'weather', name: 'Weather Agent', icon: '🌤️', desc: 'Checking weather conditions...', color: 'var(--cyan)' },
  { id: 'budget', name: 'Budget Agent', icon: '💰', desc: 'Calculating costs...', color: 'var(--orange)' },
  { id: 'hotel', name: 'Hotel Agent', icon: '🏨', desc: 'Finding accommodations...', color: 'var(--emerald)' },
  { id: 'food', name: 'Food Agent', icon: '🍜', desc: 'Curating restaurants...', color: 'var(--rose)' },
];

const EXAMPLE_PROMPTS = [
  '7-day Japan trip for ₹1.5 lakh in October, I love anime and street food',
  '10-day Europe backpacking from India with ₹2L budget',
  'Romantic 5-day Bali getaway for couples under ₹1 lakh',
  'Solo adventure in Manali for 4 days under ₹25,000',
  'Family trip to Goa for 5 days with kids, budget ₹80,000',
];

export default function AiPlanner() {
  const navigate = useNavigate();
  const location = useLocation();
  const [prompt, setPrompt] = useState(location.state?.prompt || '');
  const [loading, setLoading] = useState(false);
  const [tripData, setTripData] = useState(null);
  const [activeAgents, setActiveAgents] = useState([]);
  const [expandedDays, setExpandedDays] = useState({});
  const [saved, setSaved] = useState(false);
  const resultRef = useRef(null);

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setTripData(null);
    setSaved(false);
    setActiveAgents([]);

    // Simulate agents activating one by one
    for (let i = 0; i < AGENT_SEQUENCE.length; i++) {
      await new Promise(r => setTimeout(r, 400));
      setActiveAgents(prev => [...prev, AGENT_SEQUENCE[i].id]);
    }

    try {
      const data = await generateTripPlan(prompt);
      setTripData(data);
      setExpandedDays({ 0: true }); // expand first day
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.prompt) handleGenerate();
  }, []);

  const toggleDay = (idx) => setExpandedDays(p => ({ ...p, [idx]: !p[idx] }));

  const handleSave = async () => {
    if (!tripData) return;
    try {
      await apiService.trips.create({
        name: tripData.tripTitle || 'AI Trip',
        description: tripData.destination || '',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + (tripData.duration || 1) * 86400000).toISOString(),
        visibility: 'PRIVATE',
        aiData: { ...tripData, prompt }
      });
      setSaved(true);
      setTimeout(() => navigate('/my-trips'), 1500);
    } catch (e) {
      console.error('Failed to save trip', e);
    }
  };

  const formatINR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

  return (
    <SidebarLayout>
      <div className="page-container ai-planner-page">

        {/* ─── Header ─── */}
        <div className="planner-header animate-fade-in">
          <div>
            <h1><Sparkles size={28} className="text-violet" /> AI Trip Planner</h1>
            <p className="text-secondary">Describe your dream trip and let AI handle everything.</p>
          </div>
        </div>

        {/* ─── Input Card ─── */}
        <div className="planner-input-card animate-fade-in glass-card" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleGenerate}>
            <div className="planner-textarea-wrap">
              <Sparkles size={20} className="planner-textarea-icon" />
              <textarea
                className="planner-textarea"
                placeholder="Describe your dream trip... e.g. 'Plan a 10-day Japan trip for me in October with ₹1,50,000 budget. I love anime, street food, and photography.'"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={3}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
              />
            </div>

            {/* Example prompts */}
            <div className="example-prompts">
              <span className="text-xs text-muted">Try: </span>
              {EXAMPLE_PROMPTS.slice(0, 3).map(ex => (
                <button
                  key={ex}
                  type="button"
                  className="example-chip"
                  onClick={() => setPrompt(ex)}
                >
                  {ex.length > 50 ? ex.slice(0, 50) + '…' : ex}
                </button>
              ))}
            </div>

            <div className="planner-form-footer">
              <p className="text-xs text-muted">Press Enter or click Generate — AI will create a complete itinerary, budget breakdown, and packing list.</p>
              <div className="planner-form-actions">
                {tripData && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTripData(null)}>
                    <RefreshCw size={14} /> Reset
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={loading || !prompt.trim()}>
                  {loading ? (
                    <><Loader size={16} className="spin" /> Generating...</>
                  ) : (
                    <><Sparkles size={16} /> Generate Trip Plan</>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ─── Agents Working ─── */}
        {loading && activeAgents.length > 0 && (
          <div className="agents-panel animate-fade-in glass-card">
            <h3 className="mb-4">🤖 AI Agents Working</h3>
            <div className="agents-grid">
              {AGENT_SEQUENCE.map(agent => {
                const isActive = activeAgents.includes(agent.id);
                return (
                  <div key={agent.id} className={`agent-card ${isActive ? 'agent-active' : 'agent-pending'}`}>
                    <div className="agent-icon-wrap" style={{ background: isActive ? agent.color : undefined }}>
                      {agent.icon}
                    </div>
                    <div>
                      <div className="agent-name">{agent.name}</div>
                      <div className="agent-desc">{isActive ? agent.desc : 'Waiting...'}</div>
                    </div>
                    <div className="agent-status">
                      {isActive ? <CheckCircle size={16} style={{ color: 'var(--emerald)' }} /> : <Clock size={16} style={{ color: 'var(--text-muted)' }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Result ─── */}
        {tripData && (
          <div ref={resultRef} className="trip-result animate-fade-in">

            {/* Trip Header Card */}
            <div className="trip-result-header glass-card">
              <div className="result-hero">
                <div className="result-hero-left">
                  <div className="result-badge badge badge-violet">
                    <Sparkles size={12} /> AI Generated
                  </div>
                  <h2 className="result-title">{tripData.tripTitle}</h2>
                  <p className="result-summary">{tripData.summary}</p>
                  <div className="result-meta-row">
                    <div className="result-meta-item">
                      <MapPin size={14} /> {tripData.destination}
                    </div>
                    <div className="result-meta-item">
                      <Calendar size={14} /> {tripData.duration} days
                    </div>
                    <div className="result-meta-item">
                      🌤️ {tripData.weather}
                    </div>
                    <div className="result-meta-item">
                      <DollarSign size={14} /> {formatINR(tripData.totalBudget)}
                    </div>
                  </div>
                </div>
                <div className="result-hero-right">
                  <div className="highlights-list">
                    <h4>✨ Highlights</h4>
                    {tripData.highlights?.map(h => (
                      <div key={h} className="highlight-item">
                        <CheckCircle size={14} style={{ color: 'var(--emerald)', flexShrink: 0 }} />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="result-actions">
                <button
                  className={`btn ${saved ? 'btn-ghost' : 'btn-primary'}`}
                  onClick={handleSave}
                  disabled={saved}
                >
                  {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save to My Trips</>}
                </button>
                <button className="btn btn-secondary" onClick={() => handleGenerate()}>
                  <RefreshCw size={16} /> Regenerate
                </button>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="result-content-grid">

              {/* Itinerary */}
              <div className="itinerary-section">
                <div className="section-header mb-4">
                  <h3><Calendar size={18} /> Day-by-Day Itinerary</h3>
                  <span className="badge badge-violet">{tripData.duration} days</span>
                </div>

                {tripData.itinerary?.map((day, i) => (
                  <div key={i} className="day-card glass-card">
                    <button className="day-header" onClick={() => toggleDay(i)}>
                      <div className="day-header-left">
                        <div className="day-number">Day {day.day}</div>
                        <div>
                          <div className="day-theme">{day.theme}</div>
                          <div className="day-city text-muted text-xs">{day.city}</div>
                        </div>
                      </div>
                      <div className="day-header-right">
                        <span className="day-cost">{formatINR(day.dailyCost)}</span>
                        {expandedDays[i] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </button>

                    {expandedDays[i] && (
                      <div className="day-content animate-fade-in">
                        {/* Activities */}
                        <div className="activities-list">
                          {day.activities?.map((act, j) => (
                            <div key={j} className="activity-item">
                              <div className="activity-time">{act.time}</div>
                              <div className="activity-dot" />
                              <div className="activity-info">
                                <div className="activity-header">
                                  <span className="activity-emoji">{act.emoji}</span>
                                  <span className="activity-name">{act.name}</span>
                                  <span className="badge badge-cyan">{act.category}</span>
                                  {act.cost > 0 && <span className="activity-cost">{formatINR(act.cost)}</span>}
                                </div>
                                <p className="activity-desc">{act.description}</p>
                                <span className="text-xs text-muted"><Clock size={10} /> {act.duration}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Meals & Hotel */}
                        <div className="day-extras">
                          {day.meals && (
                            <div className="day-extra-card">
                              <h5><Utensils size={14} /> Meals</h5>
                              <div className="meals-list">
                                {Object.entries(day.meals).map(([meal, place]) => (
                                  <div key={meal} className="meal-item">
                                    <span className="meal-type">{meal}</span>
                                    <span>{place}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {day.hotel && (
                            <div className="day-extra-card">
                              <h5><Hotel size={14} /> Accommodation</h5>
                              <p className="text-sm">{day.hotel}</p>
                            </div>
                          )}
                        </div>

                        {day.tips && (
                          <div className="day-tip">
                            <Star size={14} style={{ color: 'var(--orange)', flexShrink: 0 }} />
                            <span>{day.tips}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div className="result-right-col">

                {/* Budget Breakdown */}
                {tripData.budget && (
                  <div className="budget-card glass-card">
                    <h3><DollarSign size={18} /> Budget Breakdown</h3>
                    <div className="total-budget">
                      <span>Total</span>
                      <span>{formatINR(tripData.totalBudget)}</span>
                    </div>
                    {Object.entries(tripData.budget).map(([key, val]) => {
                      const pct = Math.round((val / tripData.totalBudget) * 100);
                      const labels = { flights: '✈️ Flights', accommodation: '🏨 Stay', food: '🍜 Food', transport: '🚌 Transport', activities: '🎭 Activities', shopping: '🛍️ Shopping', emergency: '🆘 Emergency' };
                      return (
                        <div key={key} className="budget-row">
                          <span className="budget-label">{labels[key] || key}</span>
                          <div className="budget-bar-wrap">
                            <div className="budget-bar-bg">
                              <div className="budget-bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <span className="budget-amount">{formatINR(val)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Packing List */}
                {tripData.packingList && (
                  <div className="packing-preview-card glass-card">
                    <h3><Package size={18} /> Packing Preview</h3>
                    {Object.entries(tripData.packingList).slice(0, 3).map(([cat, items]) => (
                      <div key={cat} className="pack-category">
                        <div className="pack-category-name">{cat}</div>
                        <div className="pack-items">
                          {items.slice(0, 3).map(item => (
                            <span key={item} className="pack-item">{item}</span>
                          ))}
                          {items.length > 3 && <span className="pack-more">+{items.length - 3} more</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Local Tips */}
                {tripData.localTips && (
                  <div className="tips-card glass-card">
                    <h3>💡 Local Tips</h3>
                    {tripData.localTips.map((tip, i) => (
                      <div key={i} className="tip-item">
                        <span className="tip-num">{i + 1}</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
