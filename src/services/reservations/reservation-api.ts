import { apiRequest } from '../http-client';
import { getCurrentSession } from '../session-service';
import { toReservation } from './mappers';
import type { ReservationResponse } from './contracts';
import type { CreateReservationData, ReservationSchedule } from '../reservation-service';
import type { PaymentStatus } from '@/types';

export const RESERVATIONS_CHANGED_EVENT = 'kanchaya:reservations-changed';

function session() {
  const current = getCurrentSession();
  if (!current) throw new Error('Inicia sesión para consultar o gestionar tus reservas.');
  return current;
}

export async function listReservations() {
  const current = session();
  const path = current.user.role === 'Cliente' ? '/api/reservas/mias' : '/api/reservas';
  return (await apiRequest<ReservationResponse[]>(path, { token: current.token })).map(
    toReservation
  );
}

export async function getReservation(id: number) {
  return toReservation(
    await apiRequest<ReservationResponse>(`/api/reservas/${id}`, { token: session().token })
  );
}

async function mutate(path: string, method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', body?: unknown) {
  const data = await apiRequest<ReservationResponse | null>(path, {
    method,
    body,
    token: session().token,
  });
  if (!data && method !== 'DELETE')
    throw new Error('El servidor no confirmó los cambios de la reserva.');
  const saved = data ? toReservation(data) : undefined;
  window.dispatchEvent(new Event(RESERVATIONS_CHANGED_EVENT));
  return saved;
}

export async function createReservationRequest(data: CreateReservationData) {
  const saved = await mutate('/api/reservas', 'POST', {
    canchaId: data.courtId,
    clienteId: Number(data.userId),
    fecha: data.fecha,
    horaInicio: data.horaInicio,
    horaFin: data.horaFin,
    metodoPago: data.paymentMethod,
    observaciones: data.observaciones || null,
  });
  if (!saved) throw new Error('El servidor no confirmó la creación de la reserva.');
  return saved;
}

export const confirmReservation = (id: number) =>
  mutate(`/api/reservas/${id}/estado`, 'PATCH', { estado: 'confirmada' });
export const markReservationAttendance = (id: number) =>
  mutate(`/api/reservas/${id}/estado`, 'PATCH', { estado: 'en_curso' });
export const cancelReservation = (id: number) => mutate(`/api/reservas/${id}`, 'DELETE');
export const rescheduleReservation = (id: number, schedule: ReservationSchedule) =>
  mutate(`/api/reservas/${id}`, 'PUT', {
    fecha: schedule.date,
    horaInicio: schedule.startTime,
    horaFin: schedule.endTime,
  });
export const updateReservationPaymentStatus = (id: number, paymentStatus: PaymentStatus) =>
  mutate(`/api/reservas/${id}/pago`, 'PATCH', { paymentStatus });
export const updateReservationSurchargePayment = (id: number, index: number) =>
  mutate(`/api/reservas/${id}/recargos/${index}/pago`, 'PATCH');
