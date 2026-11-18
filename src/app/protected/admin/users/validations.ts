import type { User } from '@/types';
import type { ManagedUserForm } from './hooks/use-admin-users';
import { passwordError, validateIdentity, type FieldErrors } from '@/lib/validation';

export function validateManagedUser(
  data: ManagedUserForm,
  original: User | null
): FieldErrors<ManagedUserForm> {
  const errors = validateIdentity(data, { requireDni: data.role === 'Cliente' });
  if (!['Cliente', 'Recepcionista', 'Administrador'].includes(data.role))
    errors.role = 'Selecciona un rol válido.';
  if (data.role !== 'Cliente') {
    const error = passwordError(data.password, !original || original.role !== data.role);
    if (error) errors.password = error;
  }
  if (original && (original.dni ?? '') !== data.dni) errors.dni = 'El DNI no se puede modificar.';
  if (original && !original.dni && data.role === 'Cliente')
    errors.role = 'Esta cuenta no tiene DNI. Selecciona un rol de personal.';
  return errors;
}
export function managedUserChanged(data: ManagedUserForm, original: User | null): boolean {
  if (!original) return true;
  return (
    data.firstName.trim() !== original.firstName ||
    data.lastName.trim() !== original.lastName ||
    data.email.trim().toLowerCase() !== original.email.toLowerCase() ||
    data.role !== original.role ||
    data.phone.trim() !== (original.phone ?? '') ||
    data.birthDate !== (original.birthDate ?? '') ||
    (data.role !== 'Cliente' && data.password.length > 0)
  );
}
