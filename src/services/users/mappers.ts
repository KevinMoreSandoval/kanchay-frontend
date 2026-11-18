import type { UserRole } from '@/types';
import type { ManagedUser, ManagedUserData } from '@/types/users';
import type { ApiRole } from '../auth-contracts';
import type { UserRequest, UserResponse } from './contracts';

const roles: Record<ApiRole, UserRole> = {
  CLIENTE: 'Cliente',
  RECEPCIONISTA: 'Recepcionista',
  ADMIN: 'Administrador',
};
const apiRoles: Record<UserRole, ApiRole> = {
  Cliente: 'CLIENTE',
  Recepcionista: 'RECEPCIONISTA',
  Administrador: 'ADMIN',
};

export function toManagedUser(user: UserResponse): ManagedUser {
  return {
    id: String(user.id),
    firstName: user.nombre,
    lastName: user.apellido ?? '',
    email: user.email,
    role: roles[user.rol],
    dni: user.dni ?? '',
    phone: user.telefono ?? '',
    birthDate: user.fechaNacimiento ?? '',
    active: user.activo,
  };
}

export function toUserRequest(user: ManagedUserData): UserRequest {
  return {
    nombre: user.firstName.trim(),
    apellido: user.lastName.trim(),
    email: user.email.trim().toLowerCase(),
    rol: apiRoles[user.role],
    dni: user.dni?.trim() || null,
    telefono: user.phone?.trim() || null,
    fechaNacimiento: user.birthDate || null,
    ...(user.password ? { password: user.password } : {}),
  };
}
