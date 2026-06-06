import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plane, Sparkles, Map, Shield, Zap, Globe, Star, ChevronRight, ArrowRight, Check, CreditCard, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const HERO_WORDS = ['Dream Trip', 'Adventure', 'Honeymoon', 'Backpack Tour', 'Family Vacation', 'Solo Journey'];

const FEATURES = [
  { icon: Sparkles, title: 'AI Trip Generator', desc: 'Just describe your dream trip and AI builds a full itinerary, budget, and packing list in seconds.', color: 'var(--violet)', bg: 'rgba(124,58,237,0.1)' },
  { icon: Map, title: 'Smart Itinerary Builder', desc: 'Drag-and-drop builder with AI route optimization. Never backtrack unnecessarily again.', color: 'var(--cyan)', bg: 'rgba(6,182,212,0.1)' },
  { icon: Zap, title: 'Budget Intelligence', desc: 'Real-time budget tracking with AI predictions. Know before you overspend.', color: 'var(--orange)', bg: 'rgba(249,115,22,0.1)' },
  { icon: Globe, title: 'Destination Discovery', desc: 'AI recommends destinations based on your budget, travel style, and season.', color: 'var(--emerald)', bg: 'rgba(16,185,129,0.1)' },
  { icon: Shield, title: 'Real-Time Alerts', desc: 'Flight delays, weather alerts, visa updates — stay informed at every step.', color: 'var(--rose)', bg: 'rgba(244,63,94,0.1)' },
  { icon: Star, title: 'Collaborative Planning', desc: 'Plan trips with friends in real-time. Vote on activities, split budgets, share itineraries.', color: 'var(--violet-light)', bg: 'rgba(167,139,250,0.1)' },
];

const PRICING = [
  { name: 'Free', price: '₹0', period: 'forever', features: ['Max 3 active trips', 'Basic AI planner', 'Public itineraries', 'Community support'], cta: 'Get Started', highlight: false },
  { name: 'Premium', price: '₹299', period: '/month', features: ['Unlimited trips', 'Full AI planner', 'Collaboration', 'Budget tracking', 'Travel journal', 'Priority support'], cta: 'Start Free Trial', highlight: true },
  { name: 'Pro', price: '₹799', period: '/month', features: ['Everything in Premium', 'AI agents', 'Price prediction', 'Advanced analytics', 'API access', 'White-label options'], cta: 'Go Pro', highlight: false },
  { name: 'Enterprise', price: 'Custom', period: '', features: ['Agency Dashboard', 'CRM & Lead tracking', 'Vendor management', 'White Label', 'Dedicated manager'], cta: 'Contact Sales', highlight: false },
];

const STATS = [
  { value: '50K+', label: 'Trips Planned' },
  { value: '120+', label: 'Countries Covered' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '10x', label: 'Faster Planning' },
];

export default function Landing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();
  const [wordIdx, setWordIdx] = useState(0);
  const [demoPrompt, setDemoPrompt] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);

  // Payment Gateway states
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlanName, setSelectedPlanName] = useState('');
  const [selectedPlanPrice, setSelectedPlanPrice] = useState('');

  useEffect(() => {
    if (location.state?.openPayment) {
      const planName = location.state.openPayment;
      const plan = PRICING.find(p => p.name.toLowerCase() === planName.toLowerCase());
      if (plan) {
        setSelectedPlanName(plan.name);
        setSelectedPlanPrice(plan.price);
        setPaymentModalOpen(true);
      }
    }
  }, [location]);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setWordIdx(i => (i + 1) % HERO_WORDS.length), 2500);
    return () => clearInterval(timer);
  }, []);

  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    if (!demoPrompt.trim()) return;
    setDemoLoading(true);
    setTimeout(() => {
      navigate('/login', { state: { prompt: demoPrompt } });
    }, 1200);
  };

  return (
    <div className="landing">
      {/* ─── Navbar ─── */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <div className="nav-brand-icon"><Plane size={18} /></div>
          <span>Traveloop <strong>AI</strong></span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#about">About</a>
        </div>
        <div className="nav-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login', { state: { mode: 'login' } })}>Log In</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/login', { state: { mode: 'signup' } })}>Sign In</button>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="hero-section">
        {/* Animated background */}
        <div className="hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-orb orb-3" />
          <div className="hero-grid" />
        </div>

        <div className="hero-content">
          <div className="hero-badge animate-fade-in">
            <Sparkles size={14} />
            <span>Powered by Gemini AI</span>
          </div>

          <h1 className="hero-title animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Plan Your Perfect
            <br />
            <span className="hero-word gradient-text">{HERO_WORDS[wordIdx]}</span>
          </h1>

          <p className="hero-subtitle animate-fade-in" style={{ animationDelay: '0.2s' }}>
            The world's first AI travel agent that creates complete itineraries, optimizes budgets, and manages your entire journey — from a single sentence.
          </p>

          {/* Demo prompt */}
          <form className="hero-prompt animate-fade-in" style={{ animationDelay: '0.3s' }} onSubmit={handleDemoSubmit}>
            <div className="prompt-input-wrap">
              <Sparkles size={18} className="prompt-icon" />
              <input
                type="text"
                placeholder='Try: "Plan a 7-day Japan trip for ₹1.5 lakh in October"'
                value={demoPrompt}
                onChange={e => setDemoPrompt(e.target.value)}
                className="prompt-input"
              />
              <button type="submit" className="prompt-btn" disabled={demoLoading}>
                {demoLoading ? <div className="loading-spinner" style={{width:18,height:18}} /> : <><ArrowRight size={18} /> Generate</>}
              </button>
            </div>
            <p className="prompt-hint">✨ Free forever · No credit card required</p>
          </form>

          {/* Stats */}
          <div className="hero-stats animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {STATS.map(({ value, label }) => (
              <div key={label} className="stat-pill">
                <span className="stat-pill-value">{value}</span>
                <span className="stat-pill-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual */}
        <div className="hero-visual animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="dashboard-mockup">
            <div className="mockup-header">
              <div className="mockup-dot" style={{background:'var(--rose)'}} />
              <div className="mockup-dot" style={{background:'var(--orange)'}} />
              <div className="mockup-dot" style={{background:'var(--emerald)'}} />
              <span style={{marginLeft:'auto',fontSize:'0.7rem',color:'var(--text-muted)'}}>Traveloop AI</span>
            </div>
            <div className="mockup-body">
              <div className="mockup-ai-msg">
                <Sparkles size={14} style={{color:'var(--violet-light)'}} />
                <span>Generating your Japan itinerary...</span>
              </div>
              {['🗼 Day 1: Tokyo Arrival & Shinjuku', '⛩️ Day 2: Senso-ji & Harajuku', '🗻 Day 3: Mt. Fuji Excursion', '🌸 Day 4: Kyoto Temples', '🍣 Day 5: Osaka Food Tour'].map((item, i) => (
                <div key={i} className="mockup-day" style={{ animationDelay: `${i * 0.1}s` }}>
                  <span className="mockup-day-dot" />
                  <span>{item}</span>
                </div>
              ))}
              <div className="mockup-budget">
                <span>💰 Total Budget</span>
                <span style={{color:'var(--emerald-light)',fontWeight:700}}>₹1,42,000</span>
              </div>
            </div>
          </div>

          {/* Floating cards */}
          <div className="float-card float-card-1">
            <span>✈️</span>
            <div>
              <div style={{fontSize:'0.7rem',fontWeight:700,color:'var(--text-primary)'}}>Best Price Found</div>
              <div style={{fontSize:'0.65rem',color:'var(--emerald-light)'}}>₹34,500 · Save 18%</div>
            </div>
          </div>
          <div className="float-card float-card-2">
            <span>🌤️</span>
            <div>
              <div style={{fontSize:'0.7rem',fontWeight:700,color:'var(--text-primary)'}}>Tokyo Weather</div>
              <div style={{fontSize:'0.65rem',color:'var(--cyan-light)'}}>22°C · Perfect!</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="features-section" id="features">
        <div className="section-badge">
          <Sparkles size={14} />
          <span>AI-Powered Features</span>
        </div>
        <h2 className="section-heading text-center">Everything you need to plan <span className="gradient-text">the perfect trip</span></h2>
        <p className="section-desc text-center">Stop juggling 10 apps. Traveloop AI is your all-in-one intelligent travel companion.</p>

        <div className="features-grid stagger">
          {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="feature-card glass-card">
              <div className="feature-icon" style={{ background: bg, color }}>
                <Icon size={24} />
              </div>
              <h3 className="feature-title">{title}</h3>
              <p className="feature-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="how-section">
        <h2 className="section-heading text-center">Plan a trip in <span className="gradient-text">3 simple steps</span></h2>
        <div className="steps-grid">
          {[
            { step: '01', title: 'Describe Your Trip', desc: 'Tell AI where you want to go, your budget, dates, and travel style in plain English.', emoji: '💬' },
            { step: '02', title: 'AI Plans Everything', desc: 'Our multi-agent AI creates itineraries, calculates budgets, and optimizes your route.', emoji: '🤖' },
            { step: '03', title: 'Travel Stress-Free', desc: 'Get real-time alerts, packing lists, and travel tips throughout your journey.', emoji: '✈️' },
          ].map(({ step, title, desc, emoji }) => (
            <div key={step} className="step-card">
              <div className="step-number">{step}</div>
              <div className="step-emoji">{emoji}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section className="pricing-section" id="pricing">
        <h2 className="section-heading text-center">Simple, transparent <span className="gradient-text">pricing</span></h2>
        <p className="section-desc text-center">Start free, upgrade when you love it.</p>

        <div className="pricing-grid stagger">
          {PRICING.map(({ name, price, period, features, cta, highlight }) => (
            <div key={name} className={`pricing-card glass-card ${highlight ? 'pricing-highlight' : ''}`}>
              {highlight && <div className="pricing-popular">Most Popular</div>}
              <div className="pricing-name">{name}</div>
              <div className="pricing-price">
                <span className="price-amount">{price}</span>
                <span className="price-period">{period}</span>
              </div>
              <ul className="pricing-features">
                {features.map(f => (
                  <li key={f}><Check size={14} style={{color:'var(--emerald)',flexShrink:0}} /> {f}</li>
                ))}
              </ul>
              <button
                className={`btn ${highlight ? 'btn-primary' : 'btn-secondary'} w-full`}
                onClick={() => {
                  if (user) {
                    if (user.role === 'super_admin' || user.role === 'admin') {
                      localStorage.removeItem('tl_token');
                      localStorage.removeItem('tl_user');
                      window.location.href = '/login';
                    } else {
                      if (name.toLowerCase() === 'free') {
                        updateUser({ plan: 'free' }).then(() => {
                          window.location.href = '/dashboard';
                        });
                      } else if (name.toLowerCase() === 'enterprise') {
                        window.location.href = 'mailto:sales@traveloop.com';
                      } else {
                        setSelectedPlanName(name);
                        setSelectedPlanPrice(price);
                        setPaymentModalOpen(true);
                      }
                    }
                  } else {
                    if (name.toLowerCase() === 'free') {
                      navigate('/login', { state: { selectedPlan: 'free' } });
                    } else if (name.toLowerCase() === 'enterprise') {
                      window.location.href = 'mailto:sales@traveloop.com';
                    } else {
                      setSelectedPlanName(name);
                      setSelectedPlanPrice(price);
                      setPaymentModalOpen(true);
                    }
                  }
                }}
              >
                {cta} <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section">
        <div className="cta-orb" />
        <h2>Ready to travel smarter?</h2>
        <p>Join thousands of travelers planning better trips with AI.</p>
        <button 
          className="btn btn-primary btn-lg" 
          onClick={() => {
            if (user) {
              if (user.role === 'super_admin' || user.role === 'admin') {
                localStorage.removeItem('tl_token');
                localStorage.removeItem('tl_user');
                window.location.href = '/login';
              } else {
                window.location.href = '/dashboard';
              }
            } else {
              navigate('/login');
            }
          }}
        >
          <Sparkles size={20} />
          Start Planning for Free
        </button>
      </section>

      {/* ─── Footer ─── */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <Plane size={20} />
          <span>Traveloop <strong>AI</strong></span>
        </div>
        <p>© 2026 Traveloop AI. Your personal AI travel agent.</p>
      </footer>

      {/* ─── Payment Modal ─── */}
      {paymentModalOpen && (
        <div className="modal-backdrop" onClick={() => setPaymentModalOpen(false)}>
          <div className="modal glass-card" style={{ maxWidth: 440, padding: 32 }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                <CreditCard className="text-violet" size={20} />
                Secure Checkout
              </h3>
              <button 
                onClick={() => setPaymentModalOpen(false)} 
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 8, borderRadius: '50%' }}
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
                  {user ? "Your account is being upgraded. Redirecting to your dashboard..." : "Please log in or create an account to activate your new plan. Redirecting..."}
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
                      window.location.href = '/dashboard';
                    }, 1500);
                  } else {
                    setTimeout(() => {
                      navigate('/login', { state: { selectedPlan: targetPlan, paid: true } });
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
                  <input required type="text" placeholder="John Doe" value={cardName} onChange={e => setCardName(e.target.value)} />
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
                  />
                </div>

                <div className="grid-2">
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
                    />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CVV</label>
                    <input required type="password" placeholder="•••" maxLength={3} value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))} />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full mt-4" disabled={paymentProcessing}>
                  {paymentProcessing ? (
                    <div className="flex items-center gap-2">
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
    </div>
  );
}
