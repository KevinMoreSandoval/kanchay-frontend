import type { User, UserRole } from './index';

export interface ManagedUser extends User {
  active: boolean;
}

export interface ManagedUserData {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  dni?: string;
  birthDate?: string;
  phone?: string;
  password?: string;
}
