import type { PaymentStatus, ReservationScheduleChange } from '@/types';

export interface ReservationResponse {
  id: number;
  canchaId: number;
  nombreCancha: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  total: number;
  estado: string;
  metodoPago: string;
  clienteId: number;
  clienteNombre: string;
  clienteDni?: string;
  clienteTelefono?: string;
  clienteEmail?: string;
  createdAt: string;
  paymentStatus: PaymentStatus;
  puedeCancelar: boolean;
  observaciones?: string;
  attendedAt?: string;
  canceledAt?: string;
  scheduleChanges: ReservationScheduleChange[];
}
