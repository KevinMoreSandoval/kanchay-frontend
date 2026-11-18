import type { PaymentMethod, Reservation, ReservationStatus } from '@/types';
import type { ReservationResponse } from './contracts';

export function toReservation(data: ReservationResponse): Reservation {
  const method = data.metodoPago?.toUpperCase();
  return {
    id: data.id,
    courtId: data.canchaId,
    cancha: data.nombreCancha,
    userId: String(data.clienteId),
    cliente: data.clienteNombre,
    user: {
      id: String(data.clienteId),
      firstName: data.clienteNombre,
      lastName: '',
      email: data.clienteEmail ?? '',
      dni: data.clienteDni,
      phone: data.clienteTelefono,
      role: 'Cliente',
    },
    fecha: data.fecha,
    horaInicio: data.horaInicio.slice(0, 5),
    horaFin: data.horaFin.slice(0, 5),
    estado: data.estado.toUpperCase() as ReservationStatus,
    monto: Number(data.total),
    paymentMethod: (['YAPE', 'PLIN', 'YAPE_PLIN'].includes(method)
      ? 'YAPE_PLIN'
      : method) as PaymentMethod,
    createdAt: data.createdAt,
    paymentStatus: data.paymentStatus,
    observaciones: data.observaciones,
    attendedAt: data.attendedAt,
    canceledAt: data.canceledAt,
    scheduleChanges: data.scheduleChanges ?? [],
    canCancel: data.puedeCancelar === true,
  };
}
