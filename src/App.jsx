import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PERMISSIONS } from './constants/permissions';
import SidebarLayout from './components/SidebarLayout';
import './App.css';

// Lazy-loaded basic pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AiPlanner = lazy(() => import('./pages/AiPlanner'));
const MyTrips = lazy(() => import('./pages/MyTrips'));
const CreateTrip = lazy(() => import('./pages/CreateTrip'));
const TripDetails = lazy(() => import('./pages/TripDetails'));
const ItineraryBuilder = lazy(() => import('./pages/ItineraryBuilder'));
const Budget = lazy(() => import('./pages/Budget'));
const PackingChecklist = lazy(() => import('./pages/PackingChecklist'));
const Explore = lazy(() => import('./pages/Explore'));
const AiChat = lazy(() => import('./pages/AiChat'));
const Journal = lazy(() => import('./pages/Journal'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Profile = lazy(() => import('./pages/Profile'));

// Lazy-loaded admin modules
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const Destinations = lazy(() => import('./pages/admin/Destinations'));
const Activities = lazy(() => import('./pages/admin/Activities'));
const AiManagement = lazy(() => import('./pages/admin/AiManagement'));
const Packages = lazy(() => import('./pages/admin/Packages'));
const CommunityModeration = lazy(() => import('./pages/admin/CommunityModeration'));
const Subscriptions = lazy(() => import('./pages/admin/Subscriptions'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const Notifications = lazy(() => import('./pages/admin/Notifications'));
const Support = lazy(() => import('./pages/admin/Support'));
const SuperAdminSettings = lazy(() => import('./pages/admin/SuperAdminSettings'));

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div className="loading-spinner" style={{ width: 40, height: 40 }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading Traveloop AI…</p>
      </div>
    </div>
  );
}

// Protected route wrapper with permission support
function ProtectedRoute({ children, requiredPermission, requiredRole, requiredPlan }) {
  const { user, loading, hasPermission, hasAnyRole } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole && !hasAnyRole([requiredRole])) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredPlan) {
    const plansHierarchy = { free: 1, premium: 2, pro: 3 };
    const userPlanLevel = plansHierarchy[user.plan || 'free'] || 1;
    const requiredPlanLevel = plansHierarchy[requiredPlan] || 1;
    if (userPlanLevel < requiredPlanLevel) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

// Wrapper for Admin pages that automatically includes the SidebarLayout
function AdminRoute({ children, requiredPermission }) {
  return (
    <ProtectedRoute requiredPermission={requiredPermission}>
      <SidebarLayout>
        {children}
      </SidebarLayout>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? (user.role === 'super_admin' || user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />) : <Login />} />

        {/* Protected - Base Level */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/ai-planner" element={<ProtectedRoute requiredPlan="premium"><AiPlanner /></ProtectedRoute>} />
        <Route path="/my-trips" element={<ProtectedRoute><MyTrips /></ProtectedRoute>} />
        <Route path="/create-trip" element={<ProtectedRoute><CreateTrip /></ProtectedRoute>} />
        <Route path="/trip/:tripId" element={<ProtectedRoute><TripDetails /></ProtectedRoute>} />
        <Route path="/builder/:tripId" element={<ProtectedRoute><ItineraryBuilder /></ProtectedRoute>} />
        <Route path="/budget/:tripId" element={<ProtectedRoute><Budget /></ProtectedRoute>} />
        <Route path="/checklist/:tripId" element={<ProtectedRoute><PackingChecklist /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="/ai-chat" element={<ProtectedRoute requiredPlan="premium"><AiChat /></ProtectedRoute>} />
        <Route path="/journal/:tripId" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute requiredPlan="pro"><Calendar /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Admin Modules wrapped in AdminRoute */}
        <Route path="/admin" element={<AdminRoute requiredPermission={PERMISSIONS.VIEW_ANALYTICS}><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute requiredPermission={PERMISSIONS.MANAGE_USERS}><UserManagement /></AdminRoute>} />
        <Route path="/admin/destinations" element={<AdminRoute requiredPermission={PERMISSIONS.MANAGE_DESTINATIONS}><Destinations /></AdminRoute>} />
        <Route path="/admin/activities" element={<AdminRoute requiredPermission={PERMISSIONS.MANAGE_ACTIVITIES}><Activities /></AdminRoute>} />
        <Route path="/admin/ai" element={<AdminRoute requiredPermission={PERMISSIONS.MANAGE_AI}><AiManagement /></AdminRoute>} />
        <Route path="/admin/packages" element={<AdminRoute requiredPermission={PERMISSIONS.MANAGE_PACKAGES}><Packages /></AdminRoute>} />
        <Route path="/admin/community" element={<AdminRoute requiredPermission={PERMISSIONS.MODERATE_COMMUNITY}><CommunityModeration /></AdminRoute>} />
        <Route path="/admin/subscriptions" element={<AdminRoute requiredPermission={PERMISSIONS.MANAGE_SUBSCRIPTIONS}><Subscriptions /></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute requiredPermission={PERMISSIONS.VIEW_ANALYTICS}><Analytics /></AdminRoute>} />
        <Route path="/admin/notifications" element={<AdminRoute requiredPermission={PERMISSIONS.MANAGE_SUPPORT}><Notifications /></AdminRoute>} />
        <Route path="/admin/support" element={<AdminRoute requiredPermission={PERMISSIONS.MANAGE_SUPPORT}><Support /></AdminRoute>} />
        <Route path="/admin/super" element={<AdminRoute requiredPermission={PERMISSIONS.MANAGE_PLATFORM}><SuperAdminSettings /></AdminRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
