import { useState, useMemo, useEffect } from 'react';
import { getCourts, getReservations, getTodayDateString } from '@/services/local-data-service';
import { getReservationStartTimestamp } from '@/services/reservation-service';
import type { PaymentMethod, PaymentStatus, Reservation, ReservationStatus } from '@/types';
import { reservationStatusConfig } from '../reservation-status';

const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDIENTE: 'Pendiente',
  PAGADO: 'Pagado',
  POR_REEMBOLSAR: 'Por reembolsar',
  REEMBOLSADO: 'Reembolsado',
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
  TRANSFERENCIA: 'Transferencia',
  YAPE_PLIN: 'Yape/Plin',
};

export function useReceptionDashboard() {
  const [search, setSearch] = useState<string>('');
  const [reservationSearch, setReservationSearch] = useState('');
  const [reservationDateFrom, setReservationDateFrom] = useState('');
  const [reservationDateTo, setReservationDateTo] = useState('');
  const [reservationStatus, setReservationStatus] = useState<ReservationStatus | ''>('');
  const [reservationPaymentStatus, setReservationPaymentStatus] = useState<PaymentStatus | ''>('');
  const [reservationPaymentMethod, setReservationPaymentMethod] = useState<PaymentMethod | ''>('');
  const [reservations, setReservations] = useState<Reservation[]>(getReservations);
  const [courts, setCourts] = useState(getCourts);
  const [reservationCourtId, setReservationCourtId] = useState('');

  const [selectedDate, setSelectedDate] = useState(getTodayDateString);
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const refreshReservations = () => {
      setReservations(getReservations());
      setCourts(getCourts());
      setNow(Date.now());
    };
    const intervalId = window.setInterval(refreshReservations, 30_000);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === 'kanchaya.reservations') refreshReservations();
      else if (event.key === 'kanchaya.courts') setCourts(getCourts());
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const dateReservations = useMemo(
    () => reservations.filter((item) => item.fecha === selectedDate),
    [reservations, selectedDate]
  );

  const query = search.trim().toLocaleLowerCase('es');
  const reservationQuery = reservationSearch.trim().toLocaleLowerCase('es');
  const reservationDateError =
    reservationDateFrom && reservationDateTo && reservationDateFrom > reservationDateTo
      ? 'Fecha desde debe ser anterior o igual a Fecha hasta.'
      : '';
  const selectedCourt = courts.find((court) => String(court.id) === reservationCourtId);
  const filteredReservations = useMemo(
    () =>
      reservations.filter(
        (item) =>
          !reservationDateError &&
          (!reservationDateFrom || item.fecha >= reservationDateFrom) &&
          (!reservationDateTo || item.fecha <= reservationDateTo) &&
          (!reservationStatus || item.estado === reservationStatus) &&
          (!reservationPaymentStatus ||
            (item.paymentStatus ?? 'PENDIENTE') === reservationPaymentStatus) &&
          (!reservationPaymentMethod || item.paymentMethod === reservationPaymentMethod) &&
          (!reservationCourtId ||
            (item.courtId !== undefined
              ? String(item.courtId) === reservationCourtId
              : item.cancha === selectedCourt?.name)) &&
          `${item.cliente} ${item.cancha} ${item.id}`
            .toLocaleLowerCase('es')
            .includes(reservationQuery)
      ),
    [
      reservations,
      reservationQuery,
      reservationDateFrom,
      reservationDateTo,
      reservationDateError,
      reservationStatus,
      reservationPaymentStatus,
      reservationPaymentMethod,
      reservationCourtId,
      selectedCourt,
    ]
  );

  const visibleReservations = useMemo(() => {
    if (!query) return dateReservations;
    return dateReservations.filter((item) =>
      `${item.cliente} ${item.cancha}`.toLocaleLowerCase('es').includes(query)
    );
  }, [dateReservations, query]);

  const upcomingReservations = useMemo(
    () =>
      dateReservations.filter(
        (item) =>
          ['CONFIRMADA', 'PENDIENTE'].includes(item.estado) &&
          getReservationStartTimestamp(item) > now
      ),
    [dateReservations, now]
  );

  const upcoming = useMemo(
    () =>
      upcomingReservations
        .filter((item) => `${item.cliente} ${item.cancha}`.toLocaleLowerCase('es').includes(query))
        .sort((a, b) => getReservationStartTimestamp(a) - getReservationStartTimestamp(b)),
    [upcomingReservations, query]
  );

  const activity = useMemo(
    () =>
      visibleReservations
        .filter((item) => ['EN_CURSO', 'FINALIZADA', 'NO_ASISTIO'].includes(item.estado))
        .sort((a, b) => getReservationStartTimestamp(a) - getReservationStartTimestamp(b)),
    [visibleReservations]
  );

  const counts = useMemo(
    () => ({
      total: dateReservations.length,
      pending: dateReservations.filter((item) => item.estado === 'PENDIENTE').length,
      upcoming: upcomingReservations.length,
      inProgress: dateReservations.filter((item) => item.estado === 'EN_CURSO').length,
      completed: dateReservations.filter((item) => item.estado === 'FINALIZADA').length,
      noShow: dateReservations.filter((item) => item.estado === 'NO_ASISTIO').length,
      canceled: dateReservations.filter((item) => item.estado === 'CANCELADA').length,
    }),
    [dateReservations, upcomingReservations]
  );

  return {
    applyCreatedReservations: setReservations,
    reservations,
    reservationSearch,
    setReservationSearch,
    reservationDateFrom,
    setReservationDateFrom,
    reservationDateTo,
    setReservationDateTo,
    reservationDateError,
    reservationStatus,
    setReservationStatus: (status: string) => {
      if (status === '' || Object.hasOwn(reservationStatusConfig, status)) {
        setReservationStatus(status as ReservationStatus | '');
      }
    },
    reservationStatusOptions: Object.entries(reservationStatusConfig),
    reservationPaymentStatus,
    setReservationPaymentStatus: (status: string) => {
      if (status === '' || Object.hasOwn(paymentStatusLabels, status)) {
        setReservationPaymentStatus(status as PaymentStatus | '');
      }
    },
    paymentStatusOptions: Object.entries(paymentStatusLabels),
    reservationPaymentMethod,
    setReservationPaymentMethod: (method: string) => {
      if (method === '' || Object.hasOwn(paymentMethodLabels, method)) {
        setReservationPaymentMethod(method as PaymentMethod | '');
      }
    },
    paymentMethodOptions: Object.entries(paymentMethodLabels),
    courts,
    reservationCourtId,
    setReservationCourtId,
    filteredReservations,
    clearReservationFilters: () => {
      setReservationSearch('');
      setReservationDateFrom('');
      setReservationDateTo('');
      setReservationStatus('');
      setReservationPaymentStatus('');
      setReservationPaymentMethod('');
      setReservationCourtId('');
    },
    hasReservationFilters: Boolean(
      reservationQuery ||
      reservationDateFrom ||
      reservationDateTo ||
      reservationStatus ||
      reservationPaymentStatus ||
      reservationPaymentMethod ||
      reservationCourtId
    ),
    search,
    setSearch,
    query,
    selectedDate,
    setSelectedDate: (date: string) => {
      if (date) setSelectedDate(date);
    },
    visibleReservations,
    dateReservations,
    upcoming,
    activity,
    counts,
  };
}
