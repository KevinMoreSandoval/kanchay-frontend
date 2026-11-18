import type { AuthSession, User } from '@/types';
import { clearDraft } from './courts/court-draft-service';
// El JWT solo vive en memoria. El backend restaura la sesión con su cookie HttpOnly.
let currentSession: AuthSession | null = null;
let version = 0;
export const SESSION_CHANGED_EVENT = 'kanchaya:session-changed';

export function getTokenExpiration(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    const claims: unknown = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return claims &&
      typeof claims === 'object' &&
      'exp' in claims &&
      typeof claims.exp === 'number' &&
      Number.isFinite(claims.exp)
      ? claims.exp * 1000
      : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  clearDraft();
  currentSession = null;
  version++;
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export function getCurrentSession(): AuthSession | null {
  const session = currentSession;
  if (!session) return null;
  const expiration = typeof session.token === 'string' ? getTokenExpiration(session.token) : null;
  if (
    !expiration ||
    expiration <= Date.now() ||
    !session.user ||
    typeof session.user.id !== 'string' ||
    !['Cliente', 'Recepcionista', 'Administrador'].includes(session.user.role)
  ) {
    currentSession = null;
    return null;
  }
  return session;
}

export function setSession(token: string, user: User): void {
  if (currentSession?.user.id !== user.id) clearDraft();
  currentSession = { token, user };
  version++;
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export function getSessionVersion(): number {
  return version;
}

export function getCurrentUser(): User | null {
  return getCurrentSession()?.user ?? null;
}

export function broadcastSessionChange(kind: 'refresh' | 'logout'): void {
  if (typeof window.BroadcastChannel !== 'function') return;
  const channel = new window.BroadcastChannel('kanchaya:auth');
  channel.postMessage(kind);
  channel.close();
}
