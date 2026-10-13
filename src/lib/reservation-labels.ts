import type { PaymentMethod, PaymentStatus, ReservationStatus } from '@/types';

export const reservationLabels: Record<ReservationStatus, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  EN_CURSO: 'En curso',
  FINALIZADA: 'Finalizada',
  NO_ASISTIO: 'No asistió',
  CANCELADA: 'Cancelada',
};
export const paymentLabels: Record<PaymentStatus, string> = {
  PENDIENTE: 'Pendiente',
  PAGADO: 'Pagado',
  POR_REEMBOLSAR: 'Por reembolsar',
  REEMBOLSADO: 'Reembolsado',
};
export const methodLabels: Record<PaymentMethod, string> = {
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
  TRANSFERENCIA: 'Transferencia',
  YAPE_PLIN: 'Yape / Plin',
};
export const money = (amount: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
export const reservationCode = (id: number) => `RES-${String(id).padStart(6, '0')}`;
export const dateLabel = (date: string) =>
  new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(`${date}T12:00:00`));
