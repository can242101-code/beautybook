'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bb-token');
    if (!token) { setLoading(false); return; }
    api.get('/me')
      .then(res => setUser(res.data))
      .catch(() => localStorage.removeItem('bb-token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/login', { email, password });
    localStorage.setItem('bb-token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await api.post('/logout');
    localStorage.removeItem('bb-token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
