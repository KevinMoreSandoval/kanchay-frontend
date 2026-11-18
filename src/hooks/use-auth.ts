import { useState, useCallback, useEffect } from 'react';
import {
  loginUser,
  setSession,
  clearSession,
  getCurrentUser,
  restoreAuthenticatedSession,
  endAuthenticatedSession,
  type LoginCredentials,
} from '@/services/auth-service';
import type { AuthSession, User } from '@/types';
import { toast } from '@/services/toast-service';
import {
  getCurrentSession,
  getTokenExpiration,
  getSessionVersion,
  broadcastSessionChange,
  SESSION_CHANGED_EVENT,
} from '@/services/session-service';

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthSession>;
  logout: () => Promise<void>;
  acceptSession: (session: AuthSession) => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    const version = getSessionVersion();
    void restoreAuthenticatedSession()
      .then((session) => {
        if (!active || version !== getSessionVersion()) return;
        if (session) setSession(session.token, session.user);
        else clearSession();
        setUser(session?.user ?? null);
      })
      .catch((error: unknown) => {
        if (active)
          toast.error(error instanceof Error ? error.message : 'No se pudo restaurar la sesión.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let timer: number | undefined;
    const syncSession = () => {
      window.clearTimeout(timer);
      const session = getCurrentSession();
      setUser(session?.user ?? null);
      if (session) {
        const remaining = (getTokenExpiration(session.token) ?? 0) - Date.now();
        timer = window.setTimeout(syncSession, Math.min(Math.max(remaining, 0), 2_147_483_647));
      }
    };
    const channel =
      typeof window.BroadcastChannel === 'function'
        ? new window.BroadcastChannel('kanchaya:auth')
        : null;
    let active = true;
    if (channel)
      channel.onmessage = (event: MessageEvent) => {
        if (event.data === 'logout') {
          clearSession();
          return;
        }
        if (event.data !== 'refresh') return;
        const version = getSessionVersion();
        void restoreAuthenticatedSession()
          .then((session) => {
            if (!active || version !== getSessionVersion()) return;
            if (session) setSession(session.token, session.user);
            else clearSession();
          })
          .catch(() => {
            /* La siguiente solicitud conserva el error de conexión original. */
          });
      };
    window.addEventListener(SESSION_CHANGED_EVENT, syncSession);
    // Programar la caducidad inicial sin cambiar el estado durante el efecto.
    const session = getCurrentSession();
    if (session) {
      timer = window.setTimeout(
        syncSession,
        Math.min(Math.max((getTokenExpiration(session.token) ?? 0) - Date.now(), 0), 2_147_483_647)
      );
    }
    return () => {
      window.clearTimeout(timer);
      active = false;
      channel?.close();
      window.removeEventListener(SESSION_CHANGED_EVENT, syncSession);
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthSession> => {
    const data = await loginUser(credentials);
    setSession(data.token, data.user);
    setUser(data.user);
    broadcastSessionChange('refresh');
    return data;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await endAuthenticatedSession();
    clearSession();
    setUser(null);
    broadcastSessionChange('logout');
  }, []);

  const acceptSession = useCallback(({ token, user: sessionUser }: AuthSession): void => {
    setSession(token, sessionUser);
    setUser(sessionUser);
    broadcastSessionChange('refresh');
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
