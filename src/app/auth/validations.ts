import type { LoginCredentials, RegisterUserData } from '@/services/auth-contracts';
import { EMAIL_PATTERN, passwordError, validateIdentity, type FieldErrors } from '@/lib/validation';

export interface RegisterFormState extends RegisterUserData {
  confirmPassword: string;
  acceptTerms: boolean;
}
export function validateLoginForm(data: LoginCredentials): FieldErrors<LoginCredentials> {
  const errors: FieldErrors<LoginCredentials> = {};
  if (!EMAIL_PATTERN.test(data.email.trim()))
    errors.email = 'Ingresa un correo electrónico válido.';
  if (!data.password.trim()) errors.password = 'La contraseña es obligatoria.';
  return errors;
}
export function validateRegisterForm(data: RegisterFormState): FieldErrors<RegisterFormState> {
  const errors = validateIdentity(data, {
    requireDni: true,
    requirePhone: true,
    requireBirthDate: true,
  });
  const password = passwordError(data.password);
  if (password) errors.password = password;
  if (!data.confirmPassword || data.confirmPassword !== data.password)
    errors.confirmPassword = 'Las contraseñas deben coincidir.';
  if (!data.acceptTerms) errors.acceptTerms = 'Debes aceptar los términos y condiciones.';
  return errors;
}
