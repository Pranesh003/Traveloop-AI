import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../services/mockDatabase';
import { ROLE_PERMISSIONS, ROLES } from '../constants/permissions';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('tl_user');
    const savedToken = localStorage.getItem('tl_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      const token = data.token || data.data?.accessToken;
      const userObj = data.user || data.data?.user;
      
      if (token && userObj) {
        // Map backend uppercase roles to frontend lowercase roles
        if (userObj.role === 'SUPER_ADMIN') {
          userObj.role = ROLES.SUPER_ADMIN;
        } else if (userObj.role === 'ADMIN') {
          userObj.role = ROLES.ADMIN;
        } else if (userObj.role === 'USER') {
          userObj.role = ROLES.USER;
        }
        
        // Map backend subscription plan if it exists
        let backendPlan = userObj.subscriptions?.[0]?.plan?.toLowerCase();
        if (backendPlan === 'enterprise') backendPlan = 'pro';
        
        let inferredPlan = 'free';
        if (userObj.role === 'PREMIUM_USER') inferredPlan = 'premium';
        if (['SUPER_ADMIN', 'ADMIN', 'TRAVEL_EXPERT', 'CONTENT_MANAGER'].includes(userObj.role)) inferredPlan = 'pro';
        
        userObj.plan = userObj.plan || backendPlan || inferredPlan;
        
        localStorage.setItem('tl_token', token);
        localStorage.setItem('tl_user', JSON.stringify(userObj));
        setUser(userObj);
        setToken(token);
        return { success: true, user: userObj };
      }
      if (!res.ok) {
        // Try to register if login failed (for seamless testing)
        if (res.status === 401 || res.status === 404) {
          const name = email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          const regRes = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          });
          const regData = await regRes.json();
          if (regRes.ok) {
            const token = regData.token || regData.data?.accessToken;
            const userObj = regData.user || regData.data?.user;
            if (token && userObj) {
              let backendPlan = userObj.subscriptions?.[0]?.plan?.toLowerCase();
              if (backendPlan === 'enterprise') backendPlan = 'pro';
              
              let inferredPlan = 'free';
              if (userObj.role === 'PREMIUM_USER') inferredPlan = 'premium';
              if (['SUPER_ADMIN', 'ADMIN', 'TRAVEL_EXPERT', 'CONTENT_MANAGER'].includes(userObj.role)) inferredPlan = 'pro';
              
              userObj.plan = userObj.plan || backendPlan || inferredPlan;
              localStorage.setItem('tl_token', token);
              localStorage.setItem('tl_user', JSON.stringify(userObj));
              setUser(userObj);
              setToken(token);
              return { success: true, user: userObj };
            }
          }
        }
        return { success: false, error: data.message || 'Invalid credentials' };
      }
    } catch (err) {
      console.error("Login API error:", err);
      return { success: false, error: 'Network error. Backend might be down.' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        // Automatically log in after registration
        return await login(email, password);
      } else {
        let errorMsg = data.message || 'Registration failed';
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          errorMsg = data.errors.map(e => e.message).join('; ');
        }
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error("Register API error:", err);
      return { success: false, error: 'Network error. Backend might be down.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('tl_token');
    localStorage.removeItem('tl_user');
    setUser(null);
    setToken(null);
  };

  const updateUser = async (updates) => {
    const currentUser = user || JSON.parse(localStorage.getItem('tl_user') || '{}');
    const updated = { ...currentUser, ...updates };
    // Also update in mock DB if it exists
    if (currentUser && currentUser.id) {
       db.updateUser(currentUser.id, updates);
    }
    
    const token = localStorage.getItem('tl_token');
    if (token && !token.startsWith('mock_')) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/users/me`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updates),
        });
        if (res.ok) {
          const resData = await res.json();
          const updatedUserObj = resData.data ?? resData;
          if (updatedUserObj) {
            let backendPlan = updatedUserObj.subscriptions?.[0]?.plan?.toLowerCase();
            if (backendPlan === 'enterprise') backendPlan = 'pro';
            updated.plan = backendPlan || updated.plan;
          }
        }
      } catch (err) {
        console.error("Failed to update user in backend database:", err);
      }
    }
    
    localStorage.setItem('tl_user', JSON.stringify(updated));
    setUser(updated);
  };

  const hasPermission = useCallback((permission) => {
    if (!user || !user.role) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
  }, [user]);

  const hasAnyRole = useCallback((roles = []) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      register,
      logout, 
      updateUser, 
      hasPermission,
      hasAnyRole,
      isSuperAdmin: user?.role === ROLES.SUPER_ADMIN,
      isAdmin: user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN,
      isPremium: user?.plan && user.plan !== 'free'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
