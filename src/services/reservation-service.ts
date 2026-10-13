import { getManagedCourts } from './court-draft-service';
import {
  getCourts,
  getReservations,
  saveReservations,
  updateReservationPaymentStatus,
  updateReservationSurchargePayment,
} from './local-data-service';
import type { Court, Reservation, ReservationScheduleChange } from '@/types';

const PENDING_CONFIRMATION_WINDOW_MS = 15 * 60 * 1000;
const CANCELLATION_CUTOFF_MS = 2 * 60 * 60 * 1000;
const RESCHEDULE_SURCHARGE_RATE = 0.15;
const WEEK_DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export interface ReservationSchedule {
  date: string;
  startTime: string;
  endTime: string;
}

function getReservationStart(reservation: Reservation): number {
  return new Date(`${reservation.fecha}T${reservation.horaInicio}:00`).getTime();
}

function getReservationEnd(reservation: Reservation): number {
  return new Date(`${reservation.fecha}T${reservation.horaFin}:00`).getTime();
}

function parseSchedule(date: string, time: string): number {
  return new Date(`${date}T${time}:00`).getTime();
}

export function getReservationPermissions(reservation: Reservation, now = Date.now()) {
  const editable = ['PENDIENTE', 'CONFIRMADA'].includes(reservation.estado);
  const created = reservation.createdAt ? Date.parse(reservation.createdAt) : NaN;
  const attendanceOpens = getReservationStart(reservation) - 15 * 60 * 1000;
  const attendanceCloses = getReservationEnd(reservation);
  return {
    confirm:
      reservation.estado === 'PENDIENTE' &&
      (!Number.isFinite(created) || now <= created + PENDING_CONFIRMATION_WINDOW_MS),
    cancel: editable && now <= getReservationStart(reservation) - CANCELLATION_CUTOFF_MS,
    reschedule: editable,
    attendance:
      reservation.estado === 'CONFIRMADA' && now >= attendanceOpens && now < attendanceCloses,
    attendanceReason:
      now < attendanceOpens
        ? 'La llegada se habilita 15 minutos antes del inicio.'
        : now >= attendanceCloses
          ? 'El horario de la reserva ya terminó.'
          : '',
    pay:
      reservation.estado !== 'CANCELADA' &&
      (reservation.paymentStatus ?? 'PENDIENTE') === 'PENDIENTE',
    refund: reservation.paymentStatus === 'POR_REEMBOLSAR',
  };
}

export function quoteReservation(
  courtId: number,
  schedule: ReservationSchedule,
  now = Date.now(),
  snapshot?: { courts: Court[]; reservations: Reservation[] }
) {
  const court = (snapshot?.courts ?? getCourts()).find((item) => item.id === courtId);
  if (!court) throw new Error('Selecciona una cancha válida.');
  const reservation: Reservation = {
    id: -1,
    courtId,
    cancha: court.name,
    cliente: '',
    fecha: schedule.date,
    horaInicio: schedule.startTime,
    horaFin: schedule.endTime,
    estado: 'PENDIENTE',
    monto: 0,
  };
  assertScheduleAvailable(reservation, schedule, snapshot?.reservations ?? getReservations(), now);
  const duration =
    (parseSchedule(schedule.date, schedule.endTime) -
      parseSchedule(schedule.date, schedule.startTime)) /
    3_600_000;
  const amount = Math.round(court.price * duration * 100) / 100;
  if (!Number.isFinite(amount) || amount <= 0)
    throw new Error('La cancha no tiene una tarifa válida.');
  return { court, amount };
}

export function confirmReservation(id: number, now = Date.now()): Reservation[] {
  const reservations = getReservations();
  const reservation = reservations.find((item) => item.id === id);
  if (!reservation) throw new Error('No se encontró la reserva.');
  if (reservation.estado !== 'PENDIENTE') {
    throw new Error('Solo se pueden confirmar reservas pendientes.');
  }
  const createdAt = reservation.createdAt ? new Date(reservation.createdAt).getTime() : NaN;
  if (Number.isFinite(createdAt) && now > createdAt + PENDING_CONFIRMATION_WINDOW_MS) {
    throw new Error('El plazo de 15 minutos para confirmar esta reserva venció.');
  }

  return saveReservations(
    reservations.map((item) => (item.id === id ? { ...item, estado: 'CONFIRMADA' as const } : item))
  );
}

export function cancelReservation(id: number, now = Date.now()): Reservation[] {
  const reservations = getReservations();
  const reservation = reservations.find((item) => item.id === id);
  if (!reservation) throw new Error('No se encontró la reserva.');
  if (!['PENDIENTE', 'CONFIRMADA'].includes(reservation.estado)) {
    throw new Error('Solo se pueden cancelar reservas pendientes o confirmadas.');
  }
  if (now > getReservationStart(reservation) - CANCELLATION_CUTOFF_MS) {
    throw new Error('La cancelación solo está permitida hasta 2 horas antes del inicio.');
  }

  return saveReservations(
    reservations.map((item) =>
      item.id === id
        ? {
            ...item,
            estado: 'CANCELADA' as const,
            canceledAt: new Date(now).toISOString(),
            paymentStatus: item.paymentStatus === 'PAGADO' ? 'POR_REEMBOLSAR' : item.paymentStatus,
          }
        : item
    )
  );
}

export function markReservationAttendance(id: number, now = Date.now()): Reservation[] {
  const reservations = getReservations();
  const reservation = reservations.find((item) => item.id === id);
  if (!reservation) throw new Error('No se encontró la reserva.');
  if (reservation.estado !== 'CONFIRMADA') {
    throw new Error('La asistencia solo se puede registrar para una reserva confirmada.');
  }
  if (
    now < getReservationStart(reservation) - 15 * 60 * 1000 ||
    now > getReservationEnd(reservation)
  ) {
    throw new Error('La asistencia se puede marcar desde 15 minutos antes hasta la hora de fin.');
  }

  return saveReservations(
    reservations.map((item) =>
      item.id === id
        ? { ...item, estado: 'EN_CURSO' as const, attendedAt: new Date(now).toISOString() }
        : item
    )
  );
}

function findManagedCourt(reservation: Reservation) {
  const courts = getManagedCourts();
  if (reservation.courtId !== undefined) {
    return courts.find((court) => Number(court.id.split('-')[1]) === reservation.courtId);
  }
  return courts.find((court) => {
    return reservation.cancha === court.general.name;
  });
}

function assertScheduleAvailable(
  reservation: Reservation,
  schedule: ReservationSchedule,
  reservations: Reservation[],
  now = Date.now()
): void {
  const start = parseSchedule(schedule.date, schedule.startTime);
  const end = parseSchedule(schedule.date, schedule.endTime);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(schedule.date) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(schedule.startTime) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(schedule.endTime)
  ) {
    throw new Error('Ingresa una fecha y horas válidas.');
  }
  const parsedDate = new Date(`${schedule.date}T12:00:00`);
  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getDate() !== Number(schedule.date.slice(8))
  ) {
    throw new Error('La fecha seleccionada no existe.');
  }
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    throw new Error(
      'Ingresa una fecha y un horario válidos; el cierre debe ser posterior al inicio.'
    );
  }
  if (start <= now) {
    throw new Error('La nueva fecha y hora deben estar en el futuro.');
  }

  const court = findManagedCourt(reservation);
  if (!court) {
    throw new Error('No se pudo verificar la disponibilidad de esta cancha.');
  }
  if (court.location.status !== 'activa') {
    throw new Error('La cancha no está disponible para nuevas reservas.');
  }

  const day = WEEK_DAYS[new Date(`${schedule.date}T12:00:00`).getDay()];
  const daySchedule = court.location.schedule?.find((entry) => entry.day === day);
  if (
    !daySchedule?.isOpen ||
    schedule.startTime < daySchedule.opens ||
    schedule.endTime > daySchedule.closes
  ) {
    throw new Error('El nuevo horario está fuera del horario de atención de la cancha.');
  }

  const hasConflict = reservations.some((other) => {
    if (
      other.id === reservation.id ||
      other.fecha !== schedule.date ||
      !['PENDIENTE', 'CONFIRMADA', 'EN_CURSO'].includes(other.estado)
    ) {
      return false;
    }
    const sameCourt =
      reservation.courtId !== undefined && other.courtId !== undefined
        ? other.courtId === reservation.courtId
        : other.cancha === reservation.cancha;
    return sameCourt && schedule.startTime < other.horaFin && schedule.endTime > other.horaInicio;
  });
  if (hasConflict) throw new Error('La cancha ya tiene una reserva que se cruza con ese horario.');
}

export function rescheduleReservation(
  id: number,
  schedule: ReservationSchedule,
  now = Date.now()
): Reservation[] {
  const reservations = getReservations();
  const reservation = reservations.find((item) => item.id === id);
  if (!reservation) throw new Error('No se encontró la reserva.');
  if (!['PENDIENTE', 'CONFIRMADA'].includes(reservation.estado)) {
    throw new Error('Solo se pueden reprogramar reservas pendientes o confirmadas.');
  }
  if (
    reservation.fecha === schedule.date &&
    reservation.horaInicio === schedule.startTime &&
    reservation.horaFin === schedule.endTime
  ) {
    throw new Error('Elige una fecha u horario distinto al actual.');
  }

  assertScheduleAvailable(reservation, schedule, reservations, now);
  const change: ReservationScheduleChange = {
    changedAt: new Date(now).toISOString(),
    previousDate: reservation.fecha,
    previousStartTime: reservation.horaInicio,
    previousEndTime: reservation.horaFin,
    newDate: schedule.date,
    newStartTime: schedule.startTime,
    newEndTime: schedule.endTime,
    surcharge: Math.round(reservation.monto * RESCHEDULE_SURCHARGE_RATE * 100) / 100,
    surchargePaymentStatus: 'PENDIENTE',
  };

  return saveReservations(
    reservations.map((item) =>
      item.id === id
        ? {
            ...item,
            fecha: schedule.date,
            horaInicio: schedule.startTime,
            horaFin: schedule.endTime,
            scheduleChanges: [...(item.scheduleChanges ?? []), change],
          }
        : item
    )
  );
}

export type CreateReservationData = Omit<
  Reservation,
  'id' | 'estado' | 'createdAt' | 'paymentStatus' | 'scheduleChanges' | 'attendedAt' | 'canceledAt'
> & { courtId: number };

export function createReservation(data: CreateReservationData, now = Date.now()): Reservation[] {
  const reservations = getReservations();
  const quote = quoteReservation(
    data.courtId,
    { date: data.fecha, startTime: data.horaInicio, endTime: data.horaFin },
    now,
    { courts: getCourts(), reservations }
  );
  const reservation: Reservation = {
    ...data,
    cancha: quote.court.name,
    monto: quote.amount,
    id: reservations.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
    cliente: data.cliente.trim(),
    observaciones: data.observaciones?.trim() || undefined,
    estado: 'PENDIENTE',
    createdAt: new Date(now).toISOString(),
    paymentStatus: 'PENDIENTE',
    scheduleChanges: [],
  };

  if (!reservation.cliente || !reservation.cancha) {
    throw new Error('El cliente y la cancha son obligatorios.');
  }
  if (!Number.isFinite(reservation.monto) || reservation.monto <= 0) {
    throw new Error('El monto de la reserva debe ser mayor a cero.');
  }
  if (
    !reservation.paymentMethod ||
    !['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'YAPE_PLIN'].includes(reservation.paymentMethod)
  ) {
    throw new Error('Selecciona un método de pago.');
  }

  return saveReservations([...reservations, reservation]);
}

export { updateReservationPaymentStatus, updateReservationSurchargePayment };

export function getReservationStartTimestamp(reservation: Reservation): number {
  return getReservationStart(reservation);
}

export function getReservationEndTimestamp(reservation: Reservation): number {
  return getReservationEnd(reservation);
}
