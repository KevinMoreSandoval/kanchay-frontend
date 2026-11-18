import { apiRequest } from '../http-client';
import { getCurrentSession } from '../session-service';
import type { ManagedUserData } from '@/types/users';
import type { UserResponse } from './contracts';
import { toManagedUser, toUserRequest } from './mappers';

export const USERS_CHANGED_EVENT = 'kanchaya:users-changed';

function token(id?: string) {
  const session = getCurrentSession();
  if (!session) throw new Error('Inicia sesión para gestionar los usuarios.');
  if (session.user.role !== 'Administrador')
    throw new Error('Solo el administrador puede gestionar los usuarios.');
  if (id && session.user.id === id)
    throw new Error('Tu cuenta está protegida en la administración de usuarios.');
  return session.token;
}

function path(id: string) {
  if (!/^[1-9]\d*$/.test(id)) throw new Error('El identificador del usuario no es válido.');
  return `/admin/usuarios/${id}`;
}

export async function listUsers() {
  const users = await apiRequest<UserResponse[]>('/admin/usuarios', { token: token() });
  return users.map(toManagedUser);
}

export async function saveManagedUser(user: ManagedUserData) {
  const saved = await apiRequest<UserResponse>(user.id ? path(user.id) : '/admin/usuarios', {
    method: user.id ? 'PUT' : 'POST',
    token: token(user.id),
    body: toUserRequest(user),
  });
  window.dispatchEvent(new Event(USERS_CHANGED_EVENT));
  return toManagedUser(saved);
}

export async function deleteManagedUser(id: string) {
  await apiRequest<void>(path(id), { method: 'DELETE', token: token(id) });
  window.dispatchEvent(new Event(USERS_CHANGED_EVENT));
}

export async function setUserActive(id: string, active: boolean) {
  await apiRequest<string>(`${path(id)}/${active ? 'activar' : 'desactivar'}`, {
    method: 'PATCH',
    token: token(id),
  });
  window.dispatchEvent(new Event(USERS_CHANGED_EVENT));
}
