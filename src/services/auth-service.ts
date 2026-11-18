import { ApiError, apiRequest } from './http-client';
import type { AuthSession, User, UserRole } from '@/types';
import type {
  ApiRole,
  AuthResponse,
  LoginCredentials,
  ProfileResponse,
  RegisterRequest,
  RegisterUserData,
} from './auth-contracts';

export type { LoginCredentials, RegisterUserData } from './auth-contracts';
export { clearSession, getCurrentUser, setSession } from './session-service';

const ROLE_MAP: Record<ApiRole, UserRole> = {
  CLIENTE: 'Cliente',
  RECEPCIONISTA: 'Recepcionista',
  ADMIN: 'Administrador',
};

export async function getAuthenticatedUser(token: string): Promise<User> {
  const profile = await apiRequest<ProfileResponse>('/perfil', { token });
  const role = ROLE_MAP[profile.rol];
  if (!role || !profile.activo || !Number.isSafeInteger(profile.id)) {
    throw new Error('El servidor devolvió un perfil de usuario inválido.');
  }
  return {
    id: String(profile.id),
    firstName: profile.nombre,
    lastName: profile.apellido,
    email: profile.email ?? '',
    role,
    dni: profile.dni ?? undefined,
    phone: profile.telefono ?? undefined,
  };
}

export async function restoreAuthenticatedSession(): Promise<AuthSession | null> {
  try {
    const response = await apiRequest<AuthResponse>('/auth/session');
    const user = await getAuthenticatedUser(response.token);
    return { token: response.token, user };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export async function endAuthenticatedSession(): Promise<void> {
  await apiRequest<string>('/auth/logout', { method: 'POST' });
}

async function authenticate(
  path: string,
  body: LoginCredentials | RegisterRequest
): Promise<AuthSession> {
  const response = await apiRequest<AuthResponse>(path, { method: 'POST', body });
  if (!response.token || !ROLE_MAP[response.rol]) {
    throw new Error('El servidor devolvió una respuesta de autenticación inválida.');
  }
  const user = await getAuthenticatedUser(response.token);
  return { token: response.token, user };
}

export function loginUser(credentials: LoginCredentials): Promise<AuthSession> {
  return authenticate('/auth/login', {
    email: credentials.email.trim().toLowerCase(),
    password: credentials.password,
  });
}

export function registerUser(data: RegisterUserData): Promise<AuthSession> {
  return authenticate('/auth/register', {
    nombre: data.firstName.trim(),
    apellido: data.lastName.trim(),
    dni: data.dni.trim(),
    fechaNacimiento: data.birthDate,
    telefono: data.phone.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password,
  });
}
