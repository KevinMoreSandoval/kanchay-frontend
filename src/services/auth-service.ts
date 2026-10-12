import { readStoredValue, removeStoredValue, writeStoredValue } from './storage-service';
import type { AuthSession, User, UserRole, UserWithCredentials } from '@/types';

const USERS_KEY = 'kanchaya.users';
const SESSION_KEY = 'kanchaya.session';
const PASSWORD_HASH_ITERATIONS = 120_000;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIXED_ACCOUNTS: Record<
  string,
  { password: string; firstName: string; lastName: string; role: 'Recepcionista' | 'Administrador' }
> = {
  'recepcion@kancha.com': {
    password: 'Recepcionista2026!',
    firstName: 'Equipo',
    lastName: 'Recepción',
    role: 'Recepcionista',
  },
  'admin@kancha.com': {
    password: 'CanchaYaAdmin2026!',
    firstName: 'Administrador',
    lastName: 'CanchaYa',
    role: 'Administrador',
  },
};

function getUsers(): UserWithCredentials[] {
  const users = readStoredValue<UserWithCredentials[]>(USERS_KEY, []);
  return Array.isArray(users) ? users : [];
}

export function getRegisteredUsers(): User[] {
  return getUsers().map(({ passwordHash: _hash, passwordSalt: _salt, ...safeUser }) => safeUser);
}

export function getManagedUsers(): User[] {
  return getRegisteredUsers();
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

export async function saveManagedUser(data: ManagedUserData): Promise<User[]> {
  const users = getUsers();
  const email = data.email.trim().toLowerCase();
  const existingUser = data.id ? users.find((item) => item.id === data.id) : undefined;
  const firstName = data.firstName.trim();
  const lastName = data.lastName.trim();
  const dni = data.dni?.trim() || undefined;
  const phone = data.phone?.trim() || undefined;
  const password = data.password?.trim() || undefined;

  if (data.id?.startsWith('fixed-')) {
    throw new Error('Las cuentas fijas del sistema no se pueden editar.');
  }
  if (data.id && !existingUser) {
    throw new Error('No se encontró el usuario que intentas editar.');
  }
  if (!['Cliente', 'Recepcionista', 'Administrador'].includes(data.role)) {
    throw new Error('Selecciona un rol válido.');
  }
  if (!firstName || !lastName) {
    throw new Error('El nombre y el apellido son obligatorios.');
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new Error('Ingresa un correo válido.');
  }
  if (
    Object.hasOwn(FIXED_ACCOUNTS, email) ||
    users.some((item) => item.id !== data.id && item.email === email)
  ) {
    throw new Error('Ya existe una cuenta con ese correo electrónico.');
  }
  if (dni && !/^\d{8}$/.test(dni)) {
    throw new Error('El DNI debe tener 8 dígitos.');
  }
  if (existingUser && (existingUser.dni ?? '') !== (dni ?? '')) {
    throw new Error('El DNI no se puede modificar después de crear el usuario.');
  }
  if (dni && users.some((item) => item.id !== data.id && item.dni === dni)) {
    throw new Error('Ya existe una cuenta con ese DNI.');
  }

  const isNewUser = !existingUser;
  const roleChanged = existingUser?.role !== data.role;
  let nextPassword = password;

  if (data.role === 'Cliente' && (isNewUser || roleChanged)) {
    if (!dni) {
      throw new Error('El DNI es obligatorio para una cuenta de cliente.');
    }
    nextPassword = dni;
  }

  if (data.role !== 'Cliente' && (isNewUser || roleChanged) && !nextPassword) {
    throw new Error('Define una contraseña para la cuenta de personal.');
  }
  if (data.role !== 'Cliente' && nextPassword && !PASSWORD_REGEX.test(nextPassword)) {
    throw new Error(
      'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.'
    );
  }

  const user: UserWithCredentials = {
    id: data.id ?? createToken(),
    firstName,
    lastName,
    email,
    role: data.role,
    dni,
    birthDate: data.birthDate,
    phone,
  };

  const credentials = nextPassword
    ? await (async () => {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        return {
          passwordSalt: toHex(salt),
          passwordHash: await hashPassword(nextPassword, salt),
        };
      })()
    : {
        passwordSalt: existingUser?.passwordSalt,
        passwordHash: existingUser?.passwordHash,
      };

  const savedUser: UserWithCredentials = { ...user, ...credentials };
  const updated = existingUser
    ? users.map((item) => (item.id === user.id ? savedUser : item))
    : [...users, savedUser];

  writeStoredValue(USERS_KEY, updated);
  return getManagedUsers();
}

export function deleteManagedUser(id: string): User[] {
  if (id.startsWith('fixed-')) {
    throw new Error('Las cuentas fijas del sistema no se pueden eliminar.');
  }
  if (getStoredUser()?.id === id) {
    throw new Error('No puedes eliminar la cuenta con la que iniciaste sesión.');
  }
  if (!getUsers().some((user) => user.id === id)) {
    throw new Error('No se encontró el usuario que intentas eliminar.');
  }

  writeStoredValue(
    USERS_KEY,
    getUsers().filter((user) => user.id !== id)
  );
  return getManagedUsers();
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function fromHex(value: string): Uint8Array {
  if (!value) return new Uint8Array();
  const matches = value.match(/.{2}/g);
  if (!matches) return new Uint8Array();
  return new Uint8Array(matches.map((byte) => Number.parseInt(byte, 16)));
}

async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as unknown as ArrayBuffer,
      iterations: PASSWORD_HASH_ITERATIONS,
      hash: 'SHA-256',
    },
    key,
    256
  );

  return toHex(new Uint8Array(hash));
}

function createToken(): string {
  return crypto.randomUUID();
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

export async function registerUser(userData: RegisterUserData): Promise<AuthSession> {
  const email = userData.email.trim().toLowerCase();
  const users = getUsers();

  if (FIXED_ACCOUNTS[email]) {
    throw new Error('Este correo está reservado para el acceso de personal.');
  }

  if (users.some((user) => user.email === email)) {
    throw new Error('Ya existe una cuenta con ese correo electrónico.');
  }

  if (users.some((user) => user.dni === userData.dni)) {
    throw new Error('Ya existe una cuenta con ese DNI.');
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const user: User = {
    id: createToken(),
    firstName: userData.firstName,
    lastName: userData.lastName,
    dni: userData.dni,
    birthDate: userData.birthDate,
    phone: userData.phone,
    email,
    role: 'Cliente',
  };

  const savedUser: UserWithCredentials = {
    ...user,
    passwordSalt: toHex(salt),
    passwordHash: await hashPassword(userData.password, salt),
  };

  writeStoredValue(USERS_KEY, [...users, savedUser]);
  return { token: createToken(), user };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export async function loginUser(credentials: LoginCredentials): Promise<AuthSession> {
  const email = credentials.email.trim().toLowerCase();

  const fixedAccount = FIXED_ACCOUNTS[email];
  if (fixedAccount) {
    if (credentials.password !== fixedAccount.password) {
      throw new Error('Correo electrónico o contraseña incorrectos.');
    }

    return {
      token: createToken(),
      user: {
        id: `fixed-${fixedAccount.role.toLowerCase()}`,
        email,
        firstName: fixedAccount.firstName,
        lastName: fixedAccount.lastName,
        role: fixedAccount.role,
      },
    };
  }

  const savedUser = getUsers().find((user) => user.email === email);

  if (!savedUser || !savedUser.passwordSalt || !savedUser.passwordHash) {
    throw new Error('Correo electrónico o contraseña incorrectos.');
  }

  const submittedHash = await hashPassword(credentials.password, fromHex(savedUser.passwordSalt));

  if (submittedHash !== savedUser.passwordHash) {
    throw new Error('Correo electrónico o contraseña incorrectos.');
  }

  const { passwordHash: _hash, passwordSalt: _salt, ...safeUser } = savedUser;
  return { token: createToken(), user: safeUser };
}

export function setSession(token: string, user: User): void {
  writeStoredValue(SESSION_KEY, { token, user });
  removeStoredValue('token');
  removeStoredValue('user');
}

export function clearSession(): void {
  removeStoredValue(SESSION_KEY);
  removeStoredValue('token');
  removeStoredValue('user');
}

export function getStoredUser(): User | null {
  const session = readStoredValue<AuthSession | null>(SESSION_KEY, null);
  return session?.user ?? null;
}
