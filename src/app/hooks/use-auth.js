// src/app/hooks/use-auth.js

import { useState, useCallback } from 'react';
// Cambia "authService" por "auth-service"
import { loginApi, setSession, clearSession, getStoredUser } from '../services/auth-service';

export function useAuth() {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading] = useState(false);

  const login = useCallback(async (credentials) => {
    const data = await loginApi(credentials);
    setSession(data.token, data.user);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
