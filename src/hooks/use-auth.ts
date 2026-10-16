import { useState, useCallback } from 'react';
import {
  loginUser,
  setSession,
  clearSession,
  getStoredUser,
  type LoginCredentials,
} from '@/services/auth-service';
import type { AuthSession, User } from '@/types';

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthSession>;
  logout: () => void;
  acceptSession: (session: AuthSession) => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [loading] = useState<boolean>(false);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthSession> => {
    const data = await loginUser(credentials);
    setSession(data.token, data.user);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback((): void => {
    clearSession();
    setUser(null);
  }, []);

  const acceptSession = useCallback(({ token, user: sessionUser }: AuthSession): void => {
    setSession(token, sessionUser);
    setUser(sessionUser);
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    acceptSession,
  };
}
