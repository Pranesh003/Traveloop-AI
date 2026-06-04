import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS, ROLES } from '../constants/permissions';
import {
  LayoutDashboard, Sparkles, Map, Plus, Calendar, Compass,
  MessageSquare, BookOpen, User, Settings, LogOut, Menu, X,
  Shield, ChevronLeft, ChevronRight, Plane, Users, MapPin, 
  Activity, Package, MessageCircle, CreditCard, BarChart2, Bell, HelpCircle
} from 'lucide-react';
import './SidebarLayout.css';

export default function SidebarLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission, hasAnyRole } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleNav = (path) => {
    navigate(path);
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

  // Core App Navigation
  const coreNav = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/ai-planner', icon: Sparkles, label: 'AI Planner', badge: 'AI', badgeClass: 'badge-violet' },
    { path: '/my-trips', icon: Map, label: 'My Trips' },
    { path: '/create-trip', icon: Plus, label: 'New Trip' },
    { path: '/explore', icon: Compass, label: 'Explore' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/ai-chat', icon: MessageSquare, label: 'AI Chat', badge: 'AI', badgeClass: 'badge-cyan' },
  ];

  // Admin SaaS Navigation dynamically rendered based on permissions
  const adminNav = [
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
  ].filter(item => hasPermission(item.permission));

  const bottomNav = [
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="layout-wrapper">
      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand" onClick={() => handleNav('/dashboard')}>
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
          {coreNav.map(({ path, icon: Icon, label, badge, badgeClass }) => (
            <button
              key={path}
              className={`nav-item ${isActive(path) ? 'active' : ''}`}
              onClick={() => handleNav(path)}
              title={collapsed ? label : undefined}
            >
              <span className="nav-icon"><Icon size={20} /></span>
              {!collapsed && <span className="nav-label">{label}</span>}
              {!collapsed && badge && <span className={`badge ${badgeClass}`}>{badge}</span>}
              {isActive(path) && <span className="active-indicator" />}
            </button>
          ))}

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
    </div>
  );
}
