import { getTodayDateString } from './date';

export type FieldErrors<T> = Partial<Record<keyof T, string>>;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function passwordError(value: string, required = true): string | undefined {
  if (!value) return required ? 'La contraseña es obligatoria.' : undefined;
  if (!PASSWORD_PATTERN.test(value)) return 'Mínimo 8 caracteres, mayúscula, minúscula y número.';
  if (new TextEncoder().encode(value).length > 72)
    return 'La contraseña es demasiado larga. Usa una más corta.';
}

export interface IdentityFields {
  firstName: string;
  lastName: string;
  email: string;
  dni?: string;
  phone?: string;
  birthDate?: string;
}

export function validateIdentity<T extends IdentityFields>(
  data: T,
  options: {
    requireDni?: boolean;
    requirePhone?: boolean;
    requireBirthDate?: boolean;
  } = {}
): FieldErrors<T> {
  const errors: FieldErrors<IdentityFields> = {};
  for (const key of ['firstName', 'lastName'] as const) {
    if (!data[key].trim())
      errors[key] =
        key === 'firstName' ? 'El nombre es obligatorio.' : 'El apellido es obligatorio.';
    else if (!NAME_PATTERN.test(data[key].trim()))
      errors[key] = 'Solo se permiten letras y espacios.';
    else if (data[key].trim().length > 255) errors[key] = 'Máximo 255 caracteres.';
  }
  if (!EMAIL_PATTERN.test(data.email.trim()) || data.email.trim().length > 255)
    errors.email = 'Ingresa un correo electrónico válido.';
  if (options.requireDni || data.dni?.trim()) {
    if (!/^\d{8}$/.test(data.dni?.trim() ?? '')) errors.dni = 'El DNI debe tener 8 dígitos.';
  }
  if (options.requirePhone || data.phone?.trim()) {
    if (!/^\d{9}$/.test(data.phone?.trim() ?? ''))
      errors.phone = 'El teléfono debe tener 9 dígitos.';
  }
  if (options.requireBirthDate && !data.birthDate)
    errors.birthDate = 'La fecha de nacimiento es obligatoria.';
  else if (
    data.birthDate &&
    (!isValidDate(data.birthDate) || data.birthDate > getTodayDateString())
  )
    errors.birthDate = 'Ingresa una fecha de nacimiento válida que no sea futura.';
  return errors as FieldErrors<T>;
}

export interface ScheduleFields {
  date: string;
  startTime: string;
  endTime: string;
}
export function validateSchedule(
  data: ScheduleFields,
  now = Date.now()
): FieldErrors<ScheduleFields> {
  const errors: FieldErrors<ScheduleFields> = {};
  const time = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!isValidDate(data.date)) errors.date = 'Selecciona una fecha válida.';
  if (!time.test(data.startTime)) errors.startTime = 'Ingresa una hora de inicio válida.';
  if (!time.test(data.endTime)) errors.endTime = 'Ingresa una hora de fin válida.';
  else if (!errors.startTime && data.endTime <= data.startTime)
    errors.endTime = 'La hora de fin debe ser posterior al inicio.';
  if (
    !errors.date &&
    !errors.startTime &&
    Date.parse(`${data.date}T${data.startTime}:00-05:00`) <= now
  )
    errors.startTime = 'Elige una fecha y hora futura.';
  return errors;
}

export function scheduleChanged(data: ScheduleFields, original: ScheduleFields): boolean {
  return (
    data.date !== original.date ||
    data.startTime !== original.startTime ||
    data.endTime !== original.endTime
  );
}
