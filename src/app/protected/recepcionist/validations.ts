import type { PaymentMethod } from '@/types';
import type { CourtFormDraft } from '@/types/courts';
import { validateSchedule, type FieldErrors } from '@/lib/validation';
import { courtOpenOnDate } from '@/lib/court-days';

export interface ReceptionBookingForm {
  cliente: string;
  courtId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  paymentMethod: PaymentMethod;
  observaciones: string;
}
export function validateReceptionBooking(
  data: ReceptionBookingForm,
  court?: CourtFormDraft,
  now = Date.now()
): FieldErrors<ReceptionBookingForm> {
  const schedule = validateSchedule(
    { date: data.fecha, startTime: data.horaInicio, endTime: data.horaFin },
    now
  );
  const errors: FieldErrors<ReceptionBookingForm> = {};
  if (schedule.date) errors.fecha = schedule.date;
  if (schedule.startTime) errors.horaInicio = schedule.startTime;
  if (schedule.endTime) errors.horaFin = schedule.endTime;
  if (!court || court.location.status !== 'activa')
    errors.courtId = 'Selecciona una cancha disponible.';
  else {
    const rate = Number(court.features.promotionalPrice || court.features.pricePerHour);
    if (!Number.isFinite(rate) || rate <= 0)
      errors.courtId = 'La cancha no tiene una tarifa válida.';
    if (!schedule.date && !courtOpenOnDate(court.location.diasDisponibles, data.fecha))
      errors.fecha = 'La cancha no atiende este día.';
    if (
      !schedule.startTime &&
      (!court.location.horaInicio || data.horaInicio < court.location.horaInicio)
    )
      errors.horaInicio = 'La hora está fuera del horario de atención.';
    if (!schedule.endTime && (!court.location.horaFin || data.horaFin > court.location.horaFin))
      errors.horaFin = 'La hora está fuera del horario de atención.';
  }
  if (!['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'YAPE_PLIN'].includes(data.paymentMethod))
    errors.paymentMethod = 'Selecciona un método de pago.';
  if (data.observaciones.length > 500) errors.observaciones = 'Máximo 500 caracteres.';
  return errors;
}
