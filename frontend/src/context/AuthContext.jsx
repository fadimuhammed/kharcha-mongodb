import { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kharcha_user')); }
    catch { return null; }
  });

  const persist = (token, user) => {
    localStorage.setItem('kharcha_token', token);
    localStorage.setItem('kharcha_user',  JSON.stringify(user));
    setUser(user);
  };

  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    persist(data.token, data.user);
  }, []);

  const register = useCallback(async (username, name, password) => {
    const { data } = await api.post('/auth/register', { username, name, password });
    persist(data.token, data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('kharcha_token');
    localStorage.removeItem('kharcha_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
