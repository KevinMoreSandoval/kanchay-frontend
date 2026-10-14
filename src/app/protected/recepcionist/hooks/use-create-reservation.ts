import { useRef, useState } from 'react';
import { getRegisteredUsers } from '@/services/auth-service';
import { getCourts, getTodayDateString } from '@/services/local-data-service';
import { getManagedCourts } from '@/services/court-draft-service';
import { createReservation, type CreateReservationData } from '@/services/reservation-service';
import type { PaymentMethod, Reservation } from '@/types';

export function useCreateReservation() {
  const [clients] = useState(() => getRegisteredUsers().filter((user) => user.role === 'Cliente'));
  const [selectedClientId, setSelectedClientId] = useState('');
  const [managedCourts] = useState(getManagedCourts);
  const [availableCourts] = useState(() => {
    return getCourts().filter(
      (court) =>
        managedCourts.find((managed) => Number(managed.id.split('-')[1]) === court.id)?.location
          .status === 'activa'
    );
  });
  const [selectedCourtId, setSelectedCourtId] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const submissionLocked = useRef(false);
  let hasOpenSchedule = false;
  let courtScheduleMessage = '';
  let courtHoursError = '';
  if (selectedCourtId && reservationDate) {
    const court = managedCourts.find(
      (item) => Number(item.id.split('-')[1]) === Number(selectedCourtId)
    );
    const day = new Intl.DateTimeFormat('es-PE', { weekday: 'long' }).format(
      new Date(`${reservationDate}T12:00:00`)
    );
    const schedule = court?.location.schedule?.find(
      (entry) => entry.day.toLocaleLowerCase('es') === day.toLocaleLowerCase('es')
    );
    if (!schedule) courtScheduleMessage = 'No hay horario de atención configurado para esta fecha.';
    else if (!schedule.isOpen) {
      courtScheduleMessage = 'Esta cancha no atiende en la fecha seleccionada.';
      if (startTime && endTime)
        courtHoursError = 'Selecciona una fecha en la que la cancha atienda.';
    } else {
      hasOpenSchedule = true;
      courtScheduleMessage = `Horario disponible: ${schedule.opens} - ${schedule.closes}`;
      if (startTime && endTime && (startTime < schedule.opens || endTime > schedule.closes))
        courtHoursError = `El horario seleccionado debe estar entre ${schedule.opens} y ${schedule.closes}.`;
    }
  }
  let timeRangeError = '';
  let durationMinutes = 0;
  if (startTime && endTime) {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    durationMinutes = endHours * 60 + endMinutes - (startHours * 60 + startMinutes);

    if (durationMinutes <= 0)
      timeRangeError = 'La hora de fin debe ser posterior a la hora de inicio.';
    else if (durationMinutes < 60)
      timeRangeError = 'La reserva debe tener una duración mínima de 1 hora.';
    else if (durationMinutes % 30 !== 0)
      timeRangeError = 'La duración debe avanzar en intervalos de 30 minutos.';
    else timeRangeError = courtHoursError;
  }
  const selectedCourt = availableCourts.find((court) => court.id === Number(selectedCourtId));
  const hourlyRate =
    selectedCourt && Number.isFinite(selectedCourt.price) && selectedCourt.price > 0
      ? selectedCourt.price
      : null;
  const hasValidDuration = durationMinutes >= 60 && durationMinutes % 30 === 0;
  const reservationAmount =
    hourlyRate !== null && hasValidDuration
      ? Math.round((durationMinutes / 60) * hourlyRate * 100) / 100
      : null;
  const durationLabel = hasValidDuration
    ? `${Math.floor(durationMinutes / 60)} h${durationMinutes % 60 ? ' 30 min' : ''}`
    : '';
  const selectedClient = clients.find((client) => client.id === selectedClientId);
  const canSubmit = Boolean(
    selectedClient &&
    selectedCourt &&
    reservationDate &&
    startTime &&
    endTime &&
    hasValidDuration &&
    hasOpenSchedule &&
    !timeRangeError &&
    paymentMethod &&
    reservationAmount !== null &&
    Number.isFinite(reservationAmount) &&
    reservationAmount > 0
  );

  function beginCreation(onOpen: () => void) {
    submissionLocked.current = false;
    setSubmissionError('');
    onOpen();
  }

  function submitReservation(
    onCreated: (reservations: Reservation[]) => void,
    onSuccess: () => void
  ) {
    if (
      submissionLocked.current ||
      !canSubmit ||
      !selectedClient ||
      !selectedCourt ||
      !paymentMethod ||
      reservationAmount === null
    )
      return;
    submissionLocked.current = true;
    setIsSubmitting(true);
    setSubmissionError('');
    const data: CreateReservationData = {
      courtId: selectedCourt.id,
      cliente: `${selectedClient.firstName} ${selectedClient.lastName}`.trim(),
      cancha: selectedCourt.name,
      fecha: reservationDate,
      horaInicio: startTime,
      horaFin: endTime,
      monto: reservationAmount,
      paymentMethod,
      observaciones: observations.trim() || undefined,
    };
    let reservations: Reservation[];
    try {
      reservations = createReservation(data);
    } catch (error) {
      submissionLocked.current = false;
      setSubmissionError(
        error instanceof Error
          ? error.message
          : 'No se pudo crear la reserva. Inténtalo nuevamente.'
      );
      setIsSubmitting(false);
      return;
    }
    setSelectedClientId('');
    setSelectedCourtId('');
    setReservationDate('');
    setStartTime('');
    setEndTime('');
    setPaymentMethod('');
    setObservations('');
    setIsSubmitting(false);
    onCreated(reservations);
    onSuccess();
  }

  return {
    canSubmit,
    isSubmitting,
    submissionError,
    submitReservation,
    beginCreation,
    hourlyRate,
    reservationAmount,
    durationLabel,
    clients,
    selectedClientId,
    setSelectedClientId,
    availableCourts,
    selectedCourtId,
    setSelectedCourtId,
    reservationDate,
    courtScheduleMessage,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    timeRangeError,
    paymentMethod,
    observations,
    setObservations,
    setPaymentMethod: (method: string) => setPaymentMethod(method as PaymentMethod | ''),
    minimumReservationDate: getTodayDateString(),
    setReservationDate: (date: string) => {
      if (!date || date >= getTodayDateString()) setReservationDate(date);
    },
  };
}
