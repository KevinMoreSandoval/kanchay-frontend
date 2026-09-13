// src/app/hooks/use-auth.js

import { useState, useEffect, useCallback } from "react";
// Cambia "authService" por "auth-service"
import { loginApi, setSession, clearSession, getStoredUser } from "../services/auth-service";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const activeUser = getStoredUser();
    if (activeUser) {
      setUser(activeUser);
    }
    setLoading(false);
  }, []);

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