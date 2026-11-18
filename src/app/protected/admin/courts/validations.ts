// Validaciones por step del formulario de creación de canchas

import type { StepGeneralData, StepFeaturesData, StepLocationData } from '@/types/courts';

export type StepErrors<T> = Partial<Record<keyof T, string>>;

// ─── Step 1 ───────────────────────────────────────────────────────────────────

export function validateStepGeneral(data: StepGeneralData): StepErrors<StepGeneralData> {
  const errors: StepErrors<StepGeneralData> = {};

  if (!data.name.trim()) errors.name = 'El nombre es requerido.';
  else if (data.name.trim().length > 255) errors.name = 'Máximo 255 caracteres.';

  if (!data.sport) errors.sport = 'Selecciona un deporte.';

  return errors;
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

export function validateStepFeatures(data: StepFeaturesData): StepErrors<StepFeaturesData> {
  const errors: StepErrors<StepFeaturesData> = {};

  const capacity = Number(data.capacity);
  if (data.capacity && (!Number.isSafeInteger(capacity) || capacity < 1))
    errors.capacity = 'Debe ser un entero positivo.';

  const price = Number(data.pricePerHour);
  if (!data.pricePerHour) errors.pricePerHour = 'El precio por hora es requerido.';
  else if (!Number.isFinite(price) || price <= 0) errors.pricePerHour = 'Debe ser mayor a 0.';

  if (data.promotionalPrice) {
    const promo = Number(data.promotionalPrice);
    if (!Number.isFinite(promo) || promo <= 0) errors.promotionalPrice = 'Debe ser mayor a 0.';
    else if (promo >= price) errors.promotionalPrice = 'Debe ser menor al precio regular.';
  }

  for (const dimension of ['width', 'length'] as const) {
    if (
      data[dimension] &&
      (!Number.isFinite(Number(data[dimension])) || Number(data[dimension]) <= 0)
    ) {
      errors[dimension] = 'Debe ser mayor a 0.';
    }
  }
  return errors;
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

export function validateStepLocation(data: StepLocationData): StepErrors<StepLocationData> {
  const errors: StepErrors<StepLocationData> = {};

  const time = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (data.horaInicio || data.horaFin) {
    if (!time.test(data.horaInicio)) errors.horaInicio = 'Ingresa una hora de inicio válida.';
    if (!time.test(data.horaFin)) errors.horaFin = 'Ingresa una hora de fin válida.';
    else if (data.horaInicio >= data.horaFin)
      errors.horaFin = 'La hora de fin debe ser posterior al inicio.';
  }

  return errors;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function hasErrors<T>(errors: StepErrors<T>): boolean {
  return Object.keys(errors).length > 0;
}
