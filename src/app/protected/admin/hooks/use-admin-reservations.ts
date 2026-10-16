import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  cancelReservation,
  confirmReservation,
  getReservationEndTimestamp,
  getReservationStartTimestamp,
  markReservationAttendance,
  rescheduleReservation,
  updateReservationPaymentStatus,
  updateReservationSurchargePayment,
  type ReservationSchedule,
} from '@/services/reservation-service';
import { getReservations } from '@/services/local-data-service';
import type { PaymentMethod, PaymentStatus, Reservation, ReservationStatus } from '@/types';

export type ReservationStatusFilter = ReservationStatus | 'TODOS';
export type PaymentStatusFilter = PaymentStatus | 'TODOS';
export type PaymentMethodFilter = PaymentMethod | 'TODOS';

const PAYMENT_METHODS: PaymentMethod[] = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'YAPE_PLIN'];

function canCancel(reservation: Reservation, now: number) {
  return (
    ['PENDIENTE', 'CONFIRMADA'].includes(reservation.estado) &&
    now <= getReservationStartTimestamp(reservation) - 2 * 60 * 60 * 1000
  );
}

function canMarkAttendance(reservation: Reservation, now: number) {
  return (
    reservation.estado === 'CONFIRMADA' &&
    now >= getReservationStartTimestamp(reservation) - 15 * 60 * 1000 &&
    now <= getReservationEndTimestamp(reservation)
  );
}

export function useAdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>(getReservations);
  const [now, setNow] = useState(Date.now);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatusFilter>('TODOS');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatusFilter>('TODOS');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethodFilter>('TODOS');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [cancelConfirmationId, setCancelConfirmationId] = useState<number | null>(null);
  const [rescheduling, setRescheduling] = useState<Reservation | null>(null);
  const [scheduleForm, setScheduleForm] = useState<ReservationSchedule>({
    date: '',
    startTime: '',
    endTime: '',
  });

  const refreshReservations = useCallback(() => {
    setReservations(getReservations());
    setNow(Date.now());
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(refreshReservations, 30_000);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === 'kanchaya.reservations') refreshReservations();
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('storage', handleStorage);
    };
  }, [refreshReservations]);

  const filteredReservations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es');
    return reservations.filter((reservation) => {
      const textMatches =
        !query ||
        `${reservation.cliente} ${reservation.cancha}`.toLocaleLowerCase('es').includes(query);
      const dateMatches =
        (!dateFrom || reservation.fecha >= dateFrom) && (!dateTo || reservation.fecha <= dateTo);
      const statusMatches = statusFilter === 'TODOS' || reservation.estado === statusFilter;
      const paymentStatusMatches =
        paymentStatusFilter === 'TODOS' ||
        (reservation.paymentStatus ?? 'PENDIENTE') === paymentStatusFilter;
      const paymentMethodMatches =
        paymentMethodFilter === 'TODOS' || reservation.paymentMethod === paymentMethodFilter;
      return (
        textMatches && dateMatches && statusMatches && paymentStatusMatches && paymentMethodMatches
      );
    });
  }, [
    dateFrom,
    dateTo,
    paymentMethodFilter,
    paymentStatusFilter,
    reservations,
    search,
    statusFilter,
  ]);

  const chartData = useMemo(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return {
        date: dateKey,
        label: new Intl.DateTimeFormat('es', { weekday: 'short', day: 'numeric' }).format(date),
        count: filteredReservations.filter((reservation) => reservation.fecha === dateKey).length,
      };
    });
  }, [filteredReservations]);

  const runAction = useCallback((action: () => Reservation[], successMessage: string) => {
    setError('');
    try {
      setReservations(action());
      setNow(Date.now());
      setFeedback(successMessage);
      return true;
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : 'No se pudo completar la acción.'
      );
      return false;
    }
  }, []);

  const confirm = (id: number) =>
    runAction(() => confirmReservation(id), 'La reserva fue confirmada.');

  const cancel = (id: number) => {
    const success = runAction(() => cancelReservation(id), 'La reserva fue cancelada.');
    if (success) setCancelConfirmationId(null);
  };

  const markAttendance = (id: number) =>
    runAction(
      () => markReservationAttendance(id),
      'Asistencia registrada. La reserva está en curso.'
    );

  const updatePayment = (id: number, paymentStatus: PaymentStatus) =>
    runAction(
      () => updateReservationPaymentStatus(id, paymentStatus),
      paymentStatus === 'PAGADO' ? 'Pago registrado.' : 'Reembolso registrado.'
    );

  const updateSurchargePayment = (id: number, index: number) =>
    runAction(
      () => updateReservationSurchargePayment(id, index),
      'El recargo se marcó como pagado.'
    );

  const openReschedule = (reservation: Reservation) => {
    setRescheduling(reservation);
    setScheduleForm({
      date: reservation.fecha,
      startTime: reservation.horaInicio,
      endTime: reservation.horaFin,
    });
    setError('');
  };

  const closeReschedule = () => {
    setRescheduling(null);
    setError('');
  };

  const saveReschedule = () => {
    if (!rescheduling) return;
    const success = runAction(
      () => rescheduleReservation(rescheduling.id, scheduleForm),
      'Se actualizó la fecha y horario. Se registró un recargo del 15% del monto original.'
    );
    if (success) closeReschedule();
  };

  const showPdfComingSoon = () => {
    setError('');
    setFeedback('La exportación de reservas a PDF estará disponible próximamente.');
  };

  return {
    reservations: filteredReservations,
    totalReservations: reservations.length,
    search,
    setSearch,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    statusFilter,
    setStatusFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    paymentMethodFilter,
    setPaymentMethodFilter,
    paymentMethods: PAYMENT_METHODS,
    chartData,
    now,
    canCancel: (reservation: Reservation) => canCancel(reservation, now),
    canMarkAttendance: (reservation: Reservation) => canMarkAttendance(reservation, now),
    confirm,
    cancel,
    markAttendance,
    updatePayment,
    updateSurchargePayment,
    cancelConfirmationId,
    setCancelConfirmationId,
    rescheduling,
    scheduleForm,
    setScheduleForm,
    openReschedule,
    closeReschedule,
    saveReschedule,
    feedback,
    error,
    showPdfComingSoon,
  };
}
