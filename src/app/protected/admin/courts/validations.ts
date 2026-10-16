// Validaciones por step del formulario de creación de canchas

import type { StepGeneralData, StepFeaturesData, StepLocationData } from './types';

export type StepErrors<T> = Partial<Record<keyof T, string>>;

// ─── Step 1 ───────────────────────────────────────────────────────────────────

export function validateStepGeneral(data: StepGeneralData): StepErrors<StepGeneralData> {
  const errors: StepErrors<StepGeneralData> = {};

  if (!data.name.trim()) errors.name = 'El nombre es requerido.';
  else if (data.name.trim().length < 3) errors.name = 'Mínimo 3 caracteres.';

  if (!data.sport) errors.sport = 'Selecciona un deporte.';
  if (!data.modality) errors.modality = 'Selecciona una modalidad.';
  if (!data.surface) errors.surface = 'Selecciona un tipo de superficie.';

  return errors;
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

export function validateStepFeatures(data: StepFeaturesData): StepErrors<StepFeaturesData> {
  const errors: StepErrors<StepFeaturesData> = {};

  const capacity = Number(data.capacity);
  if (!data.capacity) errors.capacity = 'La capacidad es requerida.';
  else if (isNaN(capacity) || capacity < 1) errors.capacity = 'Debe ser un número positivo.';

  if (!data.coverType) errors.coverType = 'Selecciona el tipo de cancha.';
  if (!data.lighting) errors.lighting = 'Selecciona el tipo de iluminación.';

  const price = Number(data.pricePerHour);
  if (!data.pricePerHour) errors.pricePerHour = 'El precio por hora es requerido.';
  else if (isNaN(price) || price <= 0) errors.pricePerHour = 'Debe ser mayor a 0.';

  if (data.promotionalPrice) {
    const promo = Number(data.promotionalPrice);
    if (isNaN(promo) || promo <= 0) errors.promotionalPrice = 'Debe ser mayor a 0.';
    else if (promo >= price) errors.promotionalPrice = 'Debe ser menor al precio regular.';
  }

  return errors;
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

export function validateStepLocation(data: StepLocationData): StepErrors<StepLocationData> {
  const errors: StepErrors<StepLocationData> = {};

  if (!data.venue.trim()) errors.venue = 'La sede es requerida.';
  if (!data.address.trim()) errors.address = 'La dirección es requerida.';

  const activeDays = data.schedule.filter((schedule) => schedule.isOpen);
  if (activeDays.length === 0) errors.schedule = 'Agrega al menos un día de atención.';
  if (
    activeDays.some(
      (schedule) => !schedule.opens || !schedule.closes || schedule.opens >= schedule.closes
    )
  ) {
    errors.schedule = 'En los días de atención, el cierre debe ser posterior a la apertura.';
  }

  return errors;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function hasErrors<T>(errors: StepErrors<T>): boolean {
  return Object.keys(errors).length > 0;
}
