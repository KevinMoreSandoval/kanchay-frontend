import { readStoredValue, writeStoredValue } from './storage-service';
import type { Court, Reservation, PaymentStatus } from '@/types';

const COURTS_KEY = 'kanchaya.courts';
const RESERVATIONS_KEY = 'kanchaya.reservations';

const LEGACY_DEFAULT_COURTS: Court[] = [
  {
    id: 1,
    name: 'Fútbol 5',
    location: 'Sede Principal',
    price: 30,
    features: ['Fútbol', '10', 'Iluminación LED'],
  },
  {
    id: 2,
    name: 'Fútbol 11',
    location: 'Sede Norte',
    price: 50,
    features: ['Fútbol 11', '12', 'Reflectores halógenos'],
  },
  {
    id: 3,
    name: 'Vóley',
    location: 'Sede Principal',
    price: 50,
    features: ['Vóley', '12', 'Iluminación LED'],
  },
];

const LEGACY_DEFAULT_RESERVATIONS = [
  {
    id: 1,
    cliente: 'María Torres',
    cancha: 'Cancha 1 · Fútbol 7',
    horaInicio: '09:00',
    horaFin: '10:00',
    estado: 'CONFIRMADA',
    monto: 90,
  },
  {
    id: 2,
    cliente: 'Carlos Mendoza',
    cancha: 'Cancha 2 · Fútbol 5',
    horaInicio: '11:00',
    horaFin: '12:00',
    estado: 'PENDIENTE',
    monto: 70,
  },
  {
    id: 3,
    cliente: 'Lucía Ramos',
    cancha: 'Cancha 1 · Fútbol 7',
    horaInicio: '13:00',
    horaFin: '14:00',
    estado: 'CONFIRMADA',
    monto: 90,
  },
  {
    id: 4,
    cliente: 'Jorge Salazar',
    cancha: 'Cancha 3 · Vóley',
    horaInicio: '07:00',
    horaFin: '08:00',
    estado: 'FINALIZADA',
    monto: 60,
  },
  {
    id: 5,
    cliente: 'Ana Paredes',
    cancha: 'Cancha 2 · Fútbol 5',
    horaInicio: '08:00',
    horaFin: '09:00',
    estado: 'EN_CURSO',
    monto: 70,
  },
  {
    id: 6,
    cliente: 'Diego Flores',
    cancha: 'Cancha 3 · Vóley',
    horaInicio: '06:00',
    horaFin: '07:00',
    estado: 'NO_ASISTIO',
    monto: 60,
  },
];

export function getTodayDateString(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getCollection<T>(key: string): T[] {
  const stored = readStoredValue<T[] | null>(key, null);
  if (Array.isArray(stored)) return stored;

  return writeStoredValue(key, []);
}

function saveCollection<T>(key: string, records: T[]): T[] {
  if (!Array.isArray(records)) {
    throw new TypeError('Los datos deben ser una lista.');
  }

  return writeStoredValue(key, records);
}

export function getCourts(): Court[] {
  const courts = getCollection<Court>(COURTS_KEY);
  const actualCourts = courts.filter(
    (court) =>
      !LEGACY_DEFAULT_COURTS.some(
        (legacyCourt) =>
          court.id === legacyCourt.id &&
          court.name === legacyCourt.name &&
          court.location === legacyCourt.location &&
          court.price === legacyCourt.price &&
          JSON.stringify(court.features) === JSON.stringify(legacyCourt.features)
      )
  );

  return actualCourts.length === courts.length ? courts : saveCourts(actualCourts);
}

export function saveCourts(courts: Court[]): Court[] {
  return saveCollection<Court>(COURTS_KEY, courts);
}

export function deleteCourt(id: number): Court[] {
  return saveCourts(getCourts().filter((court) => court.id !== id));
}

export function getReservations(): Reservation[] {
  const reservations = getCollection<Reservation>(RESERVATIONS_KEY);
  const actualReservations = reservations.filter(
    (reservation) =>
      !LEGACY_DEFAULT_RESERVATIONS.some(
        (legacyReservation) =>
          reservation.id === legacyReservation.id &&
          reservation.fecha === getTodayDateString() &&
          reservation.cliente === legacyReservation.cliente &&
          reservation.cancha === legacyReservation.cancha &&
          reservation.horaInicio === legacyReservation.horaInicio &&
          reservation.horaFin === legacyReservation.horaFin &&
          reservation.estado === legacyReservation.estado &&
          reservation.monto === legacyReservation.monto
      )
  );

  const migrated = actualReservations.map((reservation) => ({
    ...reservation,
    scheduleChanges: reservation.scheduleChanges ?? [],
  }));
  const now = Date.now();
  const transitioned = migrated.map((reservation) => {
    const startAt = new Date(`${reservation.fecha}T${reservation.horaInicio}:00`).getTime();
    const endAt = new Date(`${reservation.fecha}T${reservation.horaFin}:00`).getTime();
    const createdAt = reservation.createdAt ? new Date(reservation.createdAt).getTime() : NaN;

    if (
      reservation.estado === 'PENDIENTE' &&
      Number.isFinite(createdAt) &&
      now > createdAt + 15 * 60 * 1000
    ) {
      return {
        ...reservation,
        estado: 'CANCELADA' as const,
        canceledAt: new Date(now).toISOString(),
        paymentStatus:
          reservation.paymentStatus === 'PAGADO'
            ? ('POR_REEMBOLSAR' as const)
            : reservation.paymentStatus,
      };
    }

    if (
      ['CONFIRMADA', 'EN_CURSO'].includes(reservation.estado) &&
      Number.isFinite(endAt) &&
      now > endAt
    ) {
      return {
        ...reservation,
        estado: reservation.attendedAt ? ('FINALIZADA' as const) : ('NO_ASISTIO' as const),
      };
    }

    if (
      reservation.estado === 'CONFIRMADA' &&
      reservation.attendedAt &&
      Number.isFinite(startAt) &&
      now >= startAt - 15 * 60 * 1000
    ) {
      return { ...reservation, estado: 'EN_CURSO' as const };
    }

    return reservation;
  });

  const changed = JSON.stringify(transitioned) !== JSON.stringify(reservations);

  return changed ? saveReservations(transitioned) : transitioned;
}

export function saveReservations(reservations: Reservation[]): Reservation[] {
  return saveCollection<Reservation>(RESERVATIONS_KEY, reservations);
}

export function saveReservation(reservation: Reservation): Reservation[] {
  const reservations = getReservations();
  const updated = reservations.some((item) => item.id === reservation.id)
    ? reservations.map((item) => (item.id === reservation.id ? reservation : item))
    : [...reservations, reservation];

  return saveReservations(updated);
}

export function deleteReservation(id: number): Reservation[] {
  return saveReservations(getReservations().filter((reservation) => reservation.id !== id));
}

export function updateReservationPaymentStatus(
  id: number,
  paymentStatus: PaymentStatus
): Reservation[] {
  const reservations = getReservations();
  const reservation = reservations.find((item) => item.id === id);
  if (!reservation) throw new Error('No se encontró la reserva.');

  const isPaymentTransition =
    (reservation.paymentStatus === 'PENDIENTE' && paymentStatus === 'PAGADO') ||
    (reservation.paymentStatus === 'POR_REEMBOLSAR' && paymentStatus === 'REEMBOLSADO');
  if (!isPaymentTransition) {
    throw new Error('La transición de pago solicitada no está permitida.');
  }

  return saveReservations(
    reservations.map((item) => (item.id === id ? { ...item, paymentStatus } : item))
  );
}

export function updateReservationSurchargePayment(id: number, changeIndex: number): Reservation[] {
  const reservations = getReservations();
  const reservation = reservations.find((item) => item.id === id);
  const change = reservation?.scheduleChanges?.[changeIndex];
  if (!reservation || !change) throw new Error('No se encontró el recargo de la reserva.');
  if (change.surchargePaymentStatus !== 'PENDIENTE') {
    throw new Error('Este recargo ya fue pagado.');
  }

  return saveReservations(
    reservations.map((item) =>
      item.id === id
        ? {
            ...item,
            scheduleChanges: item.scheduleChanges?.map((entry, index) =>
              index === changeIndex
                ? { ...entry, surchargePaymentStatus: 'PAGADO' as const }
                : entry
            ),
          }
        : item
    )
  );
}
