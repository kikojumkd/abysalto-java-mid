import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.me();
      setUser(res.data);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    if (res.data.twoFactorRequired) return res.data;
    localStorage.setItem('token', res.data.accessToken);
    await fetchUser();
    return res.data;
  };

  const verify2fa = async (twoFactorToken, code) => {
    const res = await authApi.verify2fa(twoFactorToken, code);
    localStorage.setItem('token', res.data.accessToken);
    await fetchUser();
    return res.data;
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    localStorage.setItem('token', res.data.accessToken);
    await fetchUser();
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verify2fa, register, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
