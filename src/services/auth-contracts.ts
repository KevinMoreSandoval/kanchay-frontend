export type ApiRole = 'CLIENTE' | 'RECEPCIONISTA' | 'ADMIN';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterUserData {
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  phone: string;
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  telefono: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  rol: ApiRole;
  nombre: string;
  apellido: string;
  email: string | null;
}

export interface ProfileResponse {
  id: number;
  nombre: string;
  apellido: string;
  dni: string | null;
  email: string | null;
  telefono: string | null;
  rol: ApiRole;
  activo: boolean;
}
