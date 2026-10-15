import { useEffect, useRef, useState, type FormEvent } from 'react';
import { getReservations } from '@/services/local-data-service';
import {
  cancelReservation,
  confirmReservation,
  getAvailableReservationActions,
  markReservationAttendance,
  rescheduleReservation,
  updateReservationPaymentStatus,
  updateReservationSurchargePayment,
  type ReservationAction,
  type ReservationSchedule,
} from '@/services/reservation-service';
import type { Reservation } from '@/types';

export function useReceptionReservationActions(onChanged: () => void) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selection, setSelection] = useState<{
    reservation: Reservation;
    action: ReservationAction;
  } | null>(null);
  const [schedule, setSchedule] = useState<ReservationSchedule>({
    date: '',
    startTime: '',
    endTime: '',
  });
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const isOpen = selection !== null;
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [isOpen]);

  function open(reservation: Reservation, action: ReservationAction) {
    setFeedback('');
    setError('');
    const latest = getReservations().find((item) => item.id === reservation.id);
    if (!latest || !getAvailableReservationActions(latest).some((item) => item.id === action.id)) {
      setError('Esta acción ya no está disponible. Se actualizó el listado de reservas.');
      onChanged();
      return;
    }
    setSchedule({ date: latest.fecha, startTime: latest.horaInicio, endTime: latest.horaFin });
    setSelection({ reservation: latest, action });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selection) return;
    setError('');
    const { reservation, action } = selection;
    try {
      const latest = getReservations().find((item) => item.id === reservation.id);
      if (!latest || !getAvailableReservationActions(latest).some((item) => item.id === action.id))
        throw new Error('Esta acción ya no está disponible para la reserva.');
      switch (action.type) {
        case 'confirm':
          confirmReservation(reservation.id);
          break;
        case 'attendance':
          markReservationAttendance(reservation.id);
          break;
        case 'cancel':
          cancelReservation(reservation.id);
          break;
        case 'reschedule':
          rescheduleReservation(reservation.id, schedule);
          break;
        case 'pay':
          updateReservationPaymentStatus(reservation.id, 'PAGADO');
          break;
        case 'refund':
          updateReservationPaymentStatus(reservation.id, 'REEMBOLSADO');
          break;
        case 'surcharge':
          if (action.surchargeIndex === undefined) throw new Error('No se encontró el recargo.');
          updateReservationSurchargePayment(reservation.id, action.surchargeIndex);
          break;
      }
      setFeedback(`${action.label}: operación completada para la reserva #${reservation.id}.`);
      setSelection(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo completar la acción.');
    } finally {
      setNow(Date.now());
      onChanged();
    }
  }

  return {
    dialogRef,
    selection,
    schedule,
    setSchedule,
    open,
    submit,
    error,
    feedback,
    now,
    close: () => {
      setSelection(null);
      setError('');
    },
  };
}
