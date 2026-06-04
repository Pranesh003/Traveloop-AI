import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plane, Mail, Lock, User, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';
import './Login.css';

const TRAVEL_QUOTES = [
  { quote: "The world is a book, and those who do not travel read only one page.", author: "Saint Augustine" },
  { quote: "Travel makes one modest. You see what a tiny place you occupy in the world.", author: "Gustave Flaubert" },
  { quote: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  { quote: "To travel is to live.", author: "Hans Christian Andersen" },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const quoteIdx = Math.floor(Date.now() / 10000) % TRAVEL_QUOTES.length;
  const { quote, author } = TRAVEL_QUOTES[quoteIdx];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Please fill in all fields.');
    setLoading(true);
    setError('');
    try {
      const result = await login(email, password);
      if (result.success) {
        const dest = location.state?.from || '/dashboard';
        navigate(dest, { replace: true });
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    const emails = { user: 'demo@traveloop.com', admin: 'admin@traveloop.com' };
    await login(emails[role], 'demo123');
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="login-page">
      {/* Left Panel */}
      <div className="login-left">
        <div className="login-left-bg">
          <div className="login-orb login-orb-1" />
          <div className="login-orb login-orb-2" />
        </div>

        <div className="login-left-content">
          {/* Brand */}
          <div className="login-brand" onClick={() => navigate('/')}>
            <div className="login-brand-icon"><Plane size={22} /></div>
            <span className="login-brand-name">Traveloop <strong>AI</strong></span>
          </div>

          {/* Quote */}
          <div className="login-quote">
            <div className="quote-marks">"</div>
            <p className="quote-text">{quote}</p>
            <span className="quote-author">— {author}</span>
          </div>

          {/* Feature pills */}
          <div className="login-features">
            {['✈️ AI Trip Planner', '💰 Smart Budget', '🗺️ Route Optimizer', '🤖 AI Chat Assistant'].map(f => (
              <span key={f} className="login-feature-pill">{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="login-right">
        <div className="login-form-wrap animate-scale-in">
          {/* Header */}
          <div className="login-form-header">
            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p>{isLogin ? 'Sign in to continue your travel journey.' : 'Join thousands of smart travelers.'}</p>
          </div>

          {/* Demo Login */}
          <div className="demo-btns">
            <button className="demo-btn" onClick={() => handleDemoLogin('user')} disabled={loading}>
              <Sparkles size={14} />
              Try as User
            </button>
            <button className="demo-btn demo-btn-admin" onClick={() => handleDemoLogin('admin')} disabled={loading}>
              🛡️ Try as Admin
            </button>
          </div>

          <div className="divider">
            <span>or continue with email</span>
          </div>

          {/* Error */}
          {error && <div className="login-error">{error}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {!isLogin && (
              <div className="input-group animate-fade-in">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="input-group">
              <div className="flex justify-between items-center">
                <label>Password</label>
                {isLogin && <a href="#" className="forgot-link">Forgot password?</a>}
              </div>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '44px' }}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="pass-toggle"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
              {loading ? (
                <div className="loading-spinner" style={{ width: 18, height: 18 }} />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="toggle-text">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button className="toggle-btn" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
              {isLogin ? 'Sign up free' : 'Sign in'}
            </button>
          </p>

          <p className="terms-text">
            By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
