import type { StepGeneralData, StepFeaturesData, StepLocationData } from '@/types/courts';
import { toCourtRequest } from '@/services/courts/mappers';

/** Compara los valores persistidos; ignora IDs visuales, fechas y orden de selecciones. */
export function courtFormSignature(
  general: StepGeneralData,
  features: StepFeaturesData,
  location: StepLocationData
): string {
  const payload = toCourtRequest({ id: '', savedAt: '', general, features, location });
  if (payload.details) {
    payload.details = {
      ...payload.details,
      services: [...payload.details.services].sort(),
      amenities: [...payload.details.amenities].sort(),
    };
  }
  return JSON.stringify(payload);
}
