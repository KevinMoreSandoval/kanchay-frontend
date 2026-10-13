export type UserRole = 'Cliente' | 'Recepcionista' | 'Administrador';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  dni?: string;
  birthDate?: string;
  phone?: string;
}

export interface UserWithCredentials extends User {
  passwordHash?: string;
  passwordSalt?: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface Court {
  id: number;
  name: string;
  location: string;
  price: number;
  image?: string;
  features: string[];
}

export type ReservationStatus =
  'CONFIRMADA' | 'PENDIENTE' | 'EN_CURSO' | 'FINALIZADA' | 'NO_ASISTIO' | 'CANCELADA';

export type PaymentMethod = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'YAPE_PLIN';
export type PaymentStatus = 'PENDIENTE' | 'PAGADO' | 'POR_REEMBOLSAR' | 'REEMBOLSADO';

export interface ReservationScheduleChange {
  changedAt: string;
  previousDate: string;
  previousStartTime: string;
  previousEndTime: string;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  surcharge: number;
  surchargePaymentStatus: 'PENDIENTE' | 'PAGADO';
}

export interface Reservation {
  id: number;
  clienteId?: string;
  courtId?: number;
  cliente: string;
  cancha: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: ReservationStatus;
  monto: number;
  createdAt?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  observaciones?: string;
  attendedAt?: string;
  canceledAt?: string;
  scheduleChanges?: ReservationScheduleChange[];
}
