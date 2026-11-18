import { notifyToast } from '@/services/toast-service';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  cancelReservation,
  getAvailableReservationActions,
  confirmReservation,
  getReservationEndTimestamp,
  getReservationStartTimestamp,
  markReservationAttendance,
  rescheduleReservation,
  updateReservationPaymentStatus,
  updateReservationSurchargePayment,
  type ReservationSchedule,
  type ReservationActionType,
} from '@/services/reservation-service';
import { useReservations } from '@/hooks/use-reservations';
import { useFormValidation } from '@/hooks/use-form-validation';
import { validateSchedule, scheduleChanged } from '@/lib/validation';
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
  const {
    reservations,
    loading,
    error: loadError,
    refresh: refreshReservations,
  } = useReservations();
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
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

  const scheduleValidation = useFormValidation(scheduleForm, (data) => validateSchedule(data, now));
  const hasScheduleChanges = rescheduling
    ? scheduleChanged(scheduleForm, {
        date: rescheduling.fecha,
        startTime: rescheduling.horaInicio,
        endTime: rescheduling.horaFin,
      })
    : false;
  const canSaveReschedule =
    !pending &&
    scheduleValidation.isValid &&
    hasScheduleChanges &&
    Boolean(
      rescheduling &&
      getAvailableReservationActions(rescheduling, now).some(
        (action) => action.type === 'reschedule'
      )
    );

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

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

  const runAction = useCallback(async (action: () => Promise<unknown>, successMessage: string) => {
    if (busy.current) return false;
    busy.current = true;
    setPending(true);
    setError('');
    try {
      await action();
      setNow(Date.now());
      setFeedback(notifyToast(successMessage, 'success'));
      return true;
    } catch (actionError) {
      setError(
        notifyToast(
          actionError instanceof Error ? actionError.message : 'No se pudo completar la acción.',
          'error'
        )
      );
      return false;
    } finally {
      busy.current = false;
      setPending(false);
    }
  }, []);

  const confirm = (id: number) =>
    runAction(() => confirmReservation(id), 'Pago registrado y reserva confirmada.');

  const cancel = async (id: number) => {
    const success = await runAction(() => cancelReservation(id), 'La reserva fue cancelada.');
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
      paymentStatus === 'PAGADO' ? 'Pago registrado y reserva confirmada.' : 'Reembolso registrado.'
    );

  const updateSurchargePayment = (id: number, index: number) =>
    runAction(
      () => updateReservationSurchargePayment(id, index),
      'El recargo se marcó como pagado.'
    );

  const openReschedule = (reservation: Reservation) => {
    if (busy.current) return;
    setNow(Date.now());
    scheduleValidation.reset();
    setRescheduling(reservation);
    setScheduleForm({
      date: reservation.fecha,
      startTime: reservation.horaInicio,
      endTime: reservation.horaFin,
    });
    setError('');
  };

  const closeReschedule = () => {
    if (busy.current) return;
    setRescheduling(null);
    setError('');
  };

  const saveReschedule = async () => {
    scheduleValidation.showAll();
    if (!rescheduling || !canSaveReschedule) return;
    if (Object.keys(validateSchedule(scheduleForm)).length) {
      setNow(Date.now());
      return;
    }
    const success = await runAction(
      () => rescheduleReservation(rescheduling.id, scheduleForm),
      'Se actualizó la fecha y horario. Se registró un recargo del 15% del monto original.'
    );
    if (success) closeReschedule();
  };

  const showPdfComingSoon = () => {
    setError('');
    setFeedback(
      notifyToast('La exportación de reservas a PDF estará disponible próximamente.', 'info')
    );
  };

  return {
    loading,
    loadError,
    refreshReservations,
    pending,
    canPerform: (reservation: Reservation, action: ReservationActionType) =>
      getAvailableReservationActions(reservation, now).some((item) => item.type === action),
    canSaveReschedule,
    hasScheduleChanges,
    scheduleErrors: scheduleValidation.errors,
    touchSchedule: scheduleValidation.touch,
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
