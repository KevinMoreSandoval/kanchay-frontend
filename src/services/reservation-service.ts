import type { Reservation, User } from '@/types';
import { getCurrentUser } from './session-service';
import { createReservationRequest } from './reservations/reservation-api';
export {
  confirmReservation,
  cancelReservation,
  markReservationAttendance,
  rescheduleReservation,
  updateReservationPaymentStatus,
  updateReservationSurchargePayment,
} from './reservations/reservation-api';

const PENDING_CONFIRMATION_WINDOW_MS = 15 * 60 * 1000;
const CANCELLATION_CUTOFF_MS = 2 * 60 * 60 * 1000;

export interface ReservationSchedule {
  date: string;
  startTime: string;
  endTime: string;
}
export type CreateReservationData = Omit<
  Reservation,
  | 'id'
  | 'estado'
  | 'createdAt'
  | 'paymentStatus'
  | 'scheduleChanges'
  | 'attendedAt'
  | 'canceledAt'
  | 'canCancel'
> & { courtId: number; userId: string };

function getReservationStart(reservation: Reservation): number {
  return new Date(reservation.fecha + 'T' + reservation.horaInicio + ':00-05:00').getTime();
}
function getReservationEnd(reservation: Reservation): number {
  return new Date(reservation.fecha + 'T' + reservation.horaFin + ':00-05:00').getTime();
}

// Validación del formulario; identidad, tarifa, cruces y transiciones se validan en el servidor.
export function validateReservationCreation(
  data: CreateReservationData
): CreateReservationData & { user: User } {
  const current = getCurrentUser();
  const user = current?.id === data.userId ? current : data.user;
  if (!user || user.role !== 'Cliente' || user.id !== data.userId)
    throw new Error('Selecciona un cliente registrado antes de crear la reserva.');
  if (!Number.isSafeInteger(data.courtId) || data.courtId <= 0)
    throw new Error('Selecciona una cancha disponible.');
  if (!data.fecha || !data.horaInicio || !data.horaFin || data.horaInicio >= data.horaFin)
    throw new Error('Ingresa una fecha y un rango de horas válido.');
  if (
    !data.paymentMethod ||
    !['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'YAPE_PLIN'].includes(data.paymentMethod)
  )
    throw new Error('Selecciona un método de pago.');
  return { ...data, user, cliente: (user.firstName + ' ' + user.lastName).trim() };
}

export async function createReservation(data: CreateReservationData) {
  return createReservationRequest(validateReservationCreation(data));
}

export function getReservationStartTimestamp(reservation: Reservation): number {
  return getReservationStart(reservation);
}

export function getReservationEndTimestamp(reservation: Reservation): number {
  return getReservationEnd(reservation);
}

export type ReservationActionType =
  'confirm' | 'attendance' | 'cancel' | 'reschedule' | 'pay' | 'refund' | 'surcharge';
export interface ReservationAction {
  id: string;
  type: ReservationActionType;
  label: string;
  surchargeIndex?: number;
}

export function getAvailableReservationActions(
  reservation: Reservation,
  now = Date.now()
): ReservationAction[] {
  const actions: ReservationAction[] = [];
  const active = ['PENDIENTE', 'CONFIRMADA'].includes(reservation.estado);
  const createdAt = reservation.createdAt ? new Date(reservation.createdAt).getTime() : NaN;
  const expired =
    reservation.estado === 'PENDIENTE' &&
    Number.isFinite(createdAt) &&
    now >= createdAt + PENDING_CONFIRMATION_WINDOW_MS;
  if (reservation.estado === 'PENDIENTE' && !expired)
    actions.push({ id: 'confirm', type: 'confirm', label: 'Registrar pago y confirmar' });
  if (
    reservation.estado === 'CONFIRMADA' &&
    now >= getReservationStart(reservation) - 15 * 60 * 1000 &&
    now < getReservationEnd(reservation)
  )
    actions.push({ id: 'attendance', type: 'attendance', label: 'Registrar asistencia' });
  if (active && !expired && now <= getReservationStart(reservation) - CANCELLATION_CUTOFF_MS)
    actions.push({ id: 'cancel', type: 'cancel', label: 'Cancelar reserva' });
  if (active && !expired)
    actions.push({ id: 'reschedule', type: 'reschedule', label: 'Reprogramar reserva' });
  // Compatibilidad con reservas confirmadas antes de unificar pago y confirmación.
  if (reservation.paymentStatus === 'PENDIENTE' && reservation.estado === 'CONFIRMADA')
    actions.push({ id: 'pay', type: 'pay', label: 'Registrar pago y confirmar' });
  if (reservation.paymentStatus === 'POR_REEMBOLSAR')
    actions.push({ id: 'refund', type: 'refund', label: 'Completar reembolso' });
  reservation.scheduleChanges?.forEach((change, index) => {
    if (change.surchargePaymentStatus === 'PENDIENTE')
      actions.push({
        id: `surcharge-${index}`,
        type: 'surcharge',
        label: `Cobrar recargo ${index + 1} · S/ ${change.surcharge.toFixed(2)}`,
        surchargeIndex: index,
      });
  });
  return actions;
}
