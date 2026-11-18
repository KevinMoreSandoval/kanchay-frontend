import { notifyToast } from '@/services/toast-service';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { getReservation } from '@/services/reservations/reservation-api';
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
import { useFormValidation } from '@/hooks/use-form-validation';
import { validateSchedule, scheduleChanged } from '@/lib/validation';

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
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const openVersion = useRef(0);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const scheduleValidation = useFormValidation(schedule, (data) => validateSchedule(data, now));
  const hasScheduleChanges = selection
    ? scheduleChanged(schedule, {
        date: selection.reservation.fecha,
        startTime: selection.reservation.horaInicio,
        endTime: selection.reservation.horaFin,
      })
    : false;
  const actionAvailable = selection
    ? getAvailableReservationActions(selection.reservation, now).some(
        (action) => action.id === selection.action.id
      )
    : false;
  const canSubmit =
    !saving &&
    actionAvailable &&
    (selection?.action.type !== 'reschedule' || (scheduleValidation.isValid && hasScheduleChanges));
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

  async function open(reservation: Reservation, action: ReservationAction) {
    if (busy.current) return;
    scheduleValidation.reset();
    const version = ++openVersion.current;
    try {
      setFeedback('');
      setError('');
      const latest = await getReservation(reservation.id);
      if (version !== openVersion.current) return;
      if (
        !latest ||
        !getAvailableReservationActions(latest).some((item) => item.id === action.id)
      ) {
        setError(
          notifyToast(
            'Esta acción ya no está disponible. Se actualizó el listado de reservas.',
            'error'
          )
        );
        onChanged();
        return;
      }
      setSchedule({ date: latest.fecha, startTime: latest.horaInicio, endTime: latest.horaFin });
      setSelection({ reservation: latest, action });
    } catch (cause) {
      notifyToast(
        cause instanceof Error ? cause.message : 'No se pudo consultar la reserva.',
        'error'
      );
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selection || busy.current) return;
    scheduleValidation.showAll();
    if (!canSubmit) return;
    if (selection.action.type === 'reschedule' && Object.keys(validateSchedule(schedule)).length) {
      setNow(Date.now());
      return;
    }
    busy.current = true;
    setSaving(true);
    setError('');
    const { reservation, action } = selection;
    try {
      const latest = await getReservation(reservation.id);
      if (!latest || !getAvailableReservationActions(latest).some((item) => item.id === action.id))
        throw new Error('Esta acción ya no está disponible para la reserva.');
      switch (action.type) {
        case 'confirm':
          await confirmReservation(reservation.id);
          break;
        case 'attendance':
          await markReservationAttendance(reservation.id);
          break;
        case 'cancel':
          await cancelReservation(reservation.id);
          break;
        case 'reschedule':
          await rescheduleReservation(reservation.id, schedule);
          break;
        case 'pay':
          await updateReservationPaymentStatus(reservation.id, 'PAGADO');
          break;
        case 'refund':
          await updateReservationPaymentStatus(reservation.id, 'REEMBOLSADO');
          break;
        case 'surcharge':
          if (action.surchargeIndex === undefined) throw new Error('No se encontró el recargo.');
          await updateReservationSurchargePayment(reservation.id, action.surchargeIndex);
          break;
      }
      setFeedback(
        notifyToast(
          `${action.label}: operación completada para la reserva #${reservation.id}.`,
          'success'
        )
      );
      setSelection(null);
    } catch (cause) {
      setError(
        notifyToast(
          cause instanceof Error ? cause.message : 'No se pudo completar la acción.',
          'error'
        )
      );
    } finally {
      busy.current = false;
      setSaving(false);
      setNow(Date.now());
      onChanged();
    }
  }

  return {
    saving,
    canSubmit,
    hasScheduleChanges,
    scheduleErrors: scheduleValidation.errors,
    touchSchedule: scheduleValidation.touch,
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
      if (busy.current) return;
      openVersion.current++;
      setSelection(null);
      setError('');
    },
  };
}
