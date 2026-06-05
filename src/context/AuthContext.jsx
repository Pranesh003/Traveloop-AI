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
        userObj.plan = userObj.plan || (userObj.subscriptions && userObj.subscriptions[0]?.plan?.toLowerCase()) || (userObj.email === 'premium@traveloop.com' ? 'premium' : 'free');
        
        localStorage.setItem('tl_token', token);
        localStorage.setItem('tl_user', JSON.stringify(userObj));
        setUser(userObj);
        setToken(token);
        return { success: true, user: userObj };
      }
    } catch (err) {
      console.error("Login API error:", err);
    }
    
    // Check if the user exists in our mock DB
    let mockUser = db.getUserByEmail(email);
    
    if (!mockUser) {
      // Create a default FREE_USER if they don't exist
      mockUser = db.addUser({
        email,
        name: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        role: ROLES.USER,
        plan: email === 'premium@traveloop.com' ? 'premium' : 'free'
      });
    }

    const mockToken = 'mock_token_' + Date.now();
    localStorage.setItem('tl_token', mockToken);
    localStorage.setItem('tl_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setToken(mockToken);
    return { success: true, user: mockUser };
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
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (err) {
      console.error("Register API error:", err);
    }

    // Mock DB registration fallback
    let mockUser = db.getUserByEmail(email);
    if (mockUser) {
      return { success: false, error: 'User already exists.' };
    }
    mockUser = db.addUser({
      email,
      name,
      role: ROLES.USER,
      status: 'active',
      createdAt: new Date().toISOString()
    });
    
    const mockToken = 'mock_token_' + Date.now();
    localStorage.setItem('tl_token', mockToken);
    localStorage.setItem('tl_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setToken(mockToken);
    return { success: true, user: mockUser };
  };

  const logout = () => {
    localStorage.removeItem('tl_token');
    localStorage.removeItem('tl_user');
    setUser(null);
    setToken(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    // Also update in mock DB if it exists
    if (user && user.id) {
       db.updateUser(user.id, updates);
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
      isPremium: user?.plan === 'premium'
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
