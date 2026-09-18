import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('resolve_ai_token');
      const savedUser = localStorage.getItem('resolve_ai_user');
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          const res = await client.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('resolve_ai_user', JSON.stringify(res.data));
        } catch (e) {
          console.error("Token invalid or expired", e);
          localStorage.removeItem('resolve_ai_token');
          localStorage.removeItem('resolve_ai_user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await client.post('/auth/login', { email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('resolve_ai_token', access_token);
    localStorage.setItem('resolve_ai_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const signup = async (email, password, fullName, role = 'customer') => {
    const res = await client.post('/auth/signup', {
      email,
      password,
      full_name: fullName,
      role
    });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('resolve_ai_token', access_token);
    localStorage.setItem('resolve_ai_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('resolve_ai_token');
    localStorage.removeItem('resolve_ai_user');
    setUser(null);
  };

  // Quick Demo Account Switcher
  const switchAccount = async (targetEmail) => {
    return await login(targetEmail, 'password123');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, switchAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
