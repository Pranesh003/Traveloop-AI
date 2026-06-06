import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS, ROLES } from '../constants/permissions';
import {
  LayoutDashboard, Sparkles, Map, Plus, Calendar, Compass,
  MessageSquare, BookOpen, User, Settings, LogOut, Menu, X,
  Shield, ChevronLeft, ChevronRight, Plane, Users, MapPin, 
  Activity, Package, MessageCircle, CreditCard, BarChart2, Bell, HelpCircle, Lock
} from 'lucide-react';
import './SidebarLayout.css';

export default function SidebarLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission, hasAnyRole, isPremium, updateUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Payment states for Sidebar layout
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlanName, setSelectedPlanName] = useState('Premium');
  const [selectedPlanPrice, setSelectedPlanPrice] = useState('₹299');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const isLocked = (item) => {
    if (user?.role === 'admin' || user?.role === 'super_admin') return false;
    if (!item.requiredPlan) return false;
    
    const plansHierarchy = { free: 1, premium: 2, pro: 3 };
    const userPlanLevel = plansHierarchy[user?.plan || 'free'] || 1;
    
    let requiredPlanLevel = 1;
    if (item.requiredPlan === 'premium') requiredPlanLevel = 2;
    if (item.requiredPlan === 'pro') requiredPlanLevel = 3;
    
    return userPlanLevel < requiredPlanLevel;
  };

  const handleNav = (item) => {
    let targetItem = item;
    if (typeof item === 'string') {
      targetItem = coreNav.find(n => n.path === item) || bottomNav.find(n => n.path === item) || { path: item };
    }
    if (isLocked(targetItem)) {
      const planName = targetItem.requiredPlan === 'pro' ? 'Pro' : 'Premium';
      const planPrice = targetItem.requiredPlan === 'pro' ? '₹799' : '₹299';
      setSelectedPlanName(planName);
      setSelectedPlanPrice(planPrice);
      setPaymentModalOpen(true);
      return;
    }
    navigate(targetItem.path || targetItem);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  // Core App Navigation (show all features, check logic inline via isLocked)
  const coreNav = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/ai-planner', icon: Sparkles, label: 'AI Planner', badge: 'AI', badgeClass: 'badge-violet', requiredPlan: 'premium' },
    { path: '/my-trips', icon: Map, label: 'My Trips' },
    { path: '/create-trip', icon: Plus, label: 'New Trip' },
    { path: '/explore', icon: Compass, label: 'Explore' },
    { path: '/calendar', icon: Calendar, label: 'Calendar', requiredPlan: 'pro' },
    { path: '/ai-chat', icon: MessageSquare, label: 'AI Chat', badge: 'AI', badgeClass: 'badge-cyan', requiredPlan: 'premium' },
  ].filter(item => {
    // Admins/Super Admins see adminNav ONLY (no core user features)
    if (user?.role === 'admin' || user?.role === 'super_admin') return false;
    return true;
  });

  // Admin SaaS Navigation dynamically rendered based on permissions
  const adminNav = [
    { path: '/dashboard', icon: Compass, label: 'Switch to App', isAppSwitch: true },
    { path: '/admin', icon: LayoutDashboard, label: 'Admin Hub', permission: PERMISSIONS.VIEW_ANALYTICS },
    { path: '/admin/users', icon: Users, label: 'Users', permission: PERMISSIONS.MANAGE_USERS },
    { path: '/admin/destinations', icon: MapPin, label: 'Destinations', permission: PERMISSIONS.MANAGE_DESTINATIONS },
    { path: '/admin/activities', icon: Activity, label: 'Activities', permission: PERMISSIONS.MANAGE_ACTIVITIES },
    { path: '/admin/packages', icon: Package, label: 'Packages', permission: PERMISSIONS.MANAGE_PACKAGES },
    { path: '/admin/ai', icon: Sparkles, label: 'AI Knowledge', permission: PERMISSIONS.MANAGE_AI },
    { path: '/admin/community', icon: MessageCircle, label: 'Moderation', permission: PERMISSIONS.MODERATE_COMMUNITY },
    { path: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions', permission: PERMISSIONS.MANAGE_SUBSCRIPTIONS },
    { path: '/admin/analytics', icon: BarChart2, label: 'Analytics', permission: PERMISSIONS.VIEW_ANALYTICS },
    { path: '/admin/notifications', icon: Bell, label: 'Notifications', permission: PERMISSIONS.MANAGE_SUPPORT },
    { path: '/admin/support', icon: HelpCircle, label: 'Support', permission: PERMISSIONS.MANAGE_SUPPORT },
    { path: '/admin/super', icon: Shield, label: 'Super Admin', permission: PERMISSIONS.MANAGE_PLATFORM },
  ].filter(item => item.isAppSwitch || hasPermission(item.permission));

  const bottomNav = [
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="layout-wrapper">
      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand" onClick={() => handleNav(user?.role === 'super_admin' || user?.role === 'admin' ? '/admin' : '/dashboard')}>
          <div className="brand-icon-wrap">
            <Plane size={20} />
          </div>
          {!collapsed && <span className="brand-name">Traveloop <span className="brand-ai">AI</span></span>}
        </div>

        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <nav className="sidebar-nav">
          <div className="nav-section-title">{!collapsed && "Travel"}</div>
          {coreNav.map((item) => {
            const Icon = item.icon;
            const locked = isLocked(item);
            return (
              <button
                key={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''} ${locked ? 'nav-item-locked' : ''}`}
                onClick={() => handleNav(item)}
                title={collapsed ? item.label : undefined}
              >
                <span className="nav-icon"><Icon size={20} /></span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
                {!collapsed && item.badge && !locked && <span className={`badge ${item.badgeClass}`}>{item.badge}</span>}
                {locked && !collapsed && (
                  <span className="ml-auto" style={{ display: 'flex', alignItems: 'center', color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '2px 6px', borderRadius: 6, fontSize: '0.65rem', gap: 4, fontWeight: 700, border: '1px solid rgba(167,139,250,0.2)' }}>
                    <Lock size={10} /> Lock
                  </span>
                )}
                {isActive(item.path) && <span className="active-indicator" />}
              </button>
            );
          })}

          {adminNav.length > 0 && (
            <>
              <div className="nav-section-title mt-4">{!collapsed && "Management"}</div>
              {adminNav.map(({ path, icon: Icon, label }) => (
                <button
                  key={path}
                  className={`nav-item ${isActive(path) ? 'active' : ''}`}
                  onClick={() => handleNav(path)}
                  title={collapsed ? label : undefined}
                >
                  <span className="nav-icon"><Icon size={20} /></span>
                  {!collapsed && <span className="nav-label">{label}</span>}
                  {isActive(path) && <span className="active-indicator" />}
                </button>
              ))}
            </>
          )}
        </nav>

        <div className="sidebar-bottom">
          {bottomNav.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              className={`nav-item ${isActive(path) ? 'active' : ''}`}
              onClick={() => handleNav(path)}
              title={collapsed ? label : undefined}
            >
              <span className="nav-icon"><Icon size={20} /></span>
              {!collapsed && <span className="nav-label">{label}</span>}
            </button>
          ))}

          <div className="user-section">
            <div className="user-avatar">{initials}</div>
            {!collapsed && (
              <div className="user-info">
                <span className="user-name">{user?.name || 'Traveler'}</span>
                <span className="user-role-text text-xs text-primary">{user?.role?.replace('_', ' ').toUpperCase()}</span>
              </div>
            )}
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <div className={`main-area ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="mobile-header">
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="mobile-brand">
            <Plane size={18} />
            <span>Traveloop <strong>AI</strong></span>
          </div>
          <button className="mobile-chat-btn" onClick={() => handleNav('/ai-chat')}>
            <MessageSquare size={20} />
          </button>
        </header>

        <main className="main-content">
          {children}
        </main>
      </div>

      <button className="fab-chat" onClick={() => handleNav('/ai-chat')} title="Ask AI">
        <Sparkles size={22} />
      </button>

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
    </div>
  );
}
