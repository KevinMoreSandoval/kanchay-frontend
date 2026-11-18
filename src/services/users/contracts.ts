import type { ApiRole } from '../auth-contracts';

export interface UserResponse {
  id: number;
  nombre: string;
  apellido: string | null;
  email: string;
  dni: string | null;
  telefono: string | null;
  fechaNacimiento: string | null;
  rol: ApiRole;
  activo: boolean;
}

export interface UserRequest {
  nombre: string;
  apellido: string;
  email: string;
  dni: string | null;
  telefono: string | null;
  fechaNacimiento: string | null;
  rol: ApiRole;
  password?: string;
}
