import { ApiError, apiRequest } from '../http-client';
import { getCurrentSession } from '../session-service';
import { USERS_CHANGED_EVENT } from '../users/user-service';
import { toManagedUser, toUserRequest } from '../users/mappers';
import type { UserResponse } from '../users/contracts';
import type { ManagedUserData } from '@/types/users';

export const CLIENTS_CHANGED_EVENT = 'kanchaya:clients-changed';

function token() {
  const session = getCurrentSession();
  if (!session || !['Recepcionista', 'Administrador'].includes(session.user.role)) {
    throw new Error('Inicia sesión como personal para gestionar clientes.');
  }
  return session.token;
}

export async function listClients() {
  return (await apiRequest<UserResponse[]>('/api/clientes', { token: token() })).map(toManagedUser);
}

export async function lookupClient(dni: string) {
  if (!/^\d{8}$/.test(dni)) throw new Error('El DNI debe tener 8 dígitos.');
  try {
    return toManagedUser(
      await apiRequest<UserResponse>(`/api/clientes/buscar?dni=${dni}`, { token: token() })
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function createClient(data: Omit<ManagedUserData, 'id' | 'role' | 'password'>) {
  const user = await apiRequest<UserResponse>('/api/clientes', {
    method: 'POST',
    token: token(),
    body: toUserRequest({ ...data, role: 'Cliente' }),
  });
  window.dispatchEvent(new Event(CLIENTS_CHANGED_EVENT));
  window.dispatchEvent(new Event(USERS_CHANGED_EVENT));
  return toManagedUser(user);
}
