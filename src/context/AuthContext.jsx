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
      if (data.token) {
        localStorage.setItem('tl_token', data.token);
        localStorage.setItem('tl_user', JSON.stringify(data.user));
        setUser(data.user);
        setToken(data.token);
        return { success: true, user: data.user };
      }
    } catch {
      // Fallback mock auth
    }
    
    // Check if the user exists in our mock DB
    let mockUser = db.getUserByEmail(email);
    
    if (!mockUser) {
      // Create a default FREE_USER if they don't exist
      mockUser = db.addUser({
        email,
        name: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        role: ROLES.USER,
      });
    }

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
      logout, 
      updateUser, 
      hasPermission,
      hasAnyRole,
      isSuperAdmin: user?.role === ROLES.SUPER_ADMIN,
      isAdmin: user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN
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
