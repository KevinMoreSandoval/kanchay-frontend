import { notifyToast } from '@/services/toast-service';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { getManagedCourts } from '@/services/courts/court-service';
import { useCourts } from '@/hooks/use-courts';
import { courtOpenOnDate } from '@/lib/court-days';
import { getTodayDateString } from '@/lib/date';
import {
  createReservation,
  validateReservationCreation,
  type CreateReservationData,
} from '@/services/reservation-service';
import { lookupClient as fetchClient } from '@/services/clients/client-service';
import type { User, PaymentMethod } from '@/types';
import { useFormValidation } from '@/hooks/use-form-validation';
import { validateReceptionBooking } from '../validations';

const emptyForm = () => ({
  cliente: '',
  courtId: '',
  fecha: getTodayDateString(),
  horaInicio: '',
  horaFin: '',
  paymentMethod: 'EFECTIVO' as PaymentMethod,
  observaciones: '',
});

export function useCreateReceptionReservation(onCreated: () => void) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const {
    courts: catalogCourts,
    error: courtsError,
    loading: courtsLoading,
    refresh: refreshCourts,
  } = useCourts(true);
  const courts = catalogCourts.flatMap((court) => (court.management ? [court.management] : []));
  const [form, setForm] = useState(emptyForm);
  const [reviewData, setReviewData] = useState<CreateReservationData | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [dni, setDni] = useState('');
  const [client, setClient] = useState<User | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [now, setNow] = useState(Date.now);
  const lookupVersion = useRef(0);
  const busy = useRef(false);
  const court = courts.find((item) => item.id === form.courtId);
  const validation = useFormValidation(form, (data) => validateReceptionBooking(data, court, now));
  const canLookup = /^\d{8}$/.test(dni) && !lookingUp && !saving;
  const canReview =
    validation.isValid && Boolean(client) && !saving && !courtsLoading && !courtsError;
  const canSubmit = canReview && step === 3 && reviewData !== null;
  const availableCourts = courts.filter((item) => item.location.status === 'activa');
  const rate = Number(court?.features.promotionalPrice || court?.features.pricePerHour || 0);
  const duration =
    (new Date(`${form.fecha}T${form.horaFin}:00`).getTime() -
      new Date(`${form.fecha}T${form.horaInicio}:00`).getTime()) /
    3_600_000;
  const amount =
    Number.isFinite(duration) && duration > 0 ? Math.round(rate * duration * 100) / 100 : 0;
  const daySchedule =
    court?.location.horaInicio && court.location.horaFin
      ? {
          isOpen: courtOpenOnDate(court.location.diasDisponibles, form.fecha),
          opens: court.location.horaInicio,
          closes: court.location.horaFin,
        }
      : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!isOpen) {
      dialog.close();
      return;
    }
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isOpen]);

  function open() {
    validation.reset();
    lookupVersion.current++;
    setLookingUp(false);
    setNow(Date.now());
    setStep(1);
    setReviewData(null);
    setDni('');
    setClient(null);
    setNotFound(false);
    setClientModalOpen(false);
    void refreshCourts();
    setForm(emptyForm());
    setError('');
    setNotice('');
    setIsOpen(true);
  }

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    if (busy.current) return;
    validation.touch(key);
    setForm((previous) => ({ ...previous, [key]: value }));
    setError('');
  }

  function updateDni(value: string) {
    lookupVersion.current++;
    setLookingUp(false);
    setDni(value);
    setClient(null);
    setNotFound(false);
    setError('');
  }

  async function lookupClient() {
    const currentLookup = ++lookupVersion.current;
    setError('');
    if (!/^\d{8}$/.test(dni)) {
      setError(notifyToast('El DNI debe tener 8 dígitos.', 'error'));
      return;
    }
    setLookingUp(true);
    setClient(null);
    let found;
    try {
      found = await fetchClient(dni);
      if (currentLookup !== lookupVersion.current) return;
    } catch (cause) {
      if (currentLookup === lookupVersion.current)
        setError(
          notifyToast(
            cause instanceof Error ? cause.message : 'No se pudo buscar el cliente.',
            'error'
          )
        );
      return;
    } finally {
      if (currentLookup === lookupVersion.current) setLookingUp(false);
    }
    if (found && (found.role !== 'Cliente' || !found.active)) {
      setError(
        notifyToast(
          'Selecciona un cliente activo. Este DNI no corresponde a una cuenta de cliente habilitada.',
          'error'
        )
      );
      return;
    }
    setClient(found ?? null);
    setNotFound(!found);
    if (found) setStep(2);
  }

  function continueWithClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!canLookup || notFound) return;
    if (client) setStep(2);
    else void lookupClient();
  }

  function reviewReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    validation.showAll();
    if (!canReview) return;
    try {
      if (!client) throw new Error('Verifica primero el DNI del cliente.');
      const currentCourt = getManagedCourts().find((item) => item.id === form.courtId);
      if (!currentCourt) throw new Error('Selecciona una cancha disponible.');
      const currentRate = Number(
        currentCourt.features.promotionalPrice || currentCourt.features.pricePerHour
      );
      const data: CreateReservationData = {
        ...form,
        userId: client.id,
        user: client,
        courtId: Number(currentCourt.id.split('-')[1]),
        cancha: currentCourt.general.name,
        monto: Math.round(currentRate * duration * 100) / 100,
      };
      const validated = validateReservationCreation(data);
      setReviewData({ ...data, cliente: validated.cliente, user: validated.user });
      setStep(3);
    } catch (cause) {
      setError(
        notifyToast(
          cause instanceof Error ? cause.message : 'Revisa los datos de la reserva.',
          'error'
        )
      );
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || !reviewData || busy.current) return;
    if (Object.keys(validateReceptionBooking(form, court)).length) {
      validation.showAll();
      setNow(Date.now());
      return;
    }
    busy.current = true;
    setSaving(true);
    try {
      await createReservation(reviewData);
      onCreated();
      setIsOpen(false);
      setNotice(
        notifyToast(
          'Reserva creada en estado pendiente y con pago pendiente. Debe confirmarse dentro de los próximos 15 minutos. Si los filtros activos la excluyen, restablécelos para consultarla.',
          'success'
        )
      );
    } catch (cause) {
      setError(
        notifyToast(
          cause instanceof Error ? cause.message : 'No se pudo crear la reserva.',
          'error'
        )
      );
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  return {
    saving,
    lookingUp,
    canLookup,
    canReview,
    canSubmit,
    fieldErrors: validation.errors,
    touchField: validation.touch,
    dniError: dni && !/^\d{8}$/.test(dni) ? 'El DNI debe tener 8 dígitos.' : undefined,
    step,
    reviewData,
    reviewReservation,
    dni,
    client,
    notFound,
    clientModalOpen,
    openClientModal: () => setClientModalOpen(true),
    closeClientModal: () => setClientModalOpen(false),
    selectCreatedClient: (user: User) => {
      setClient(user);
      setDni(user.dni ?? '');
      setNotFound(false);
      setError('');
      setClientModalOpen(false);
      setStep(2);
    },
    updateDni,
    lookupClient,
    continueWithClient,
    back: () => {
      if (busy.current) return;
      setStep(step === 3 ? 2 : 1);
      setError('');
    },
    dialogRef,
    isOpen,
    open,
    close: () => {
      if (!clientModalOpen && !busy.current) {
        lookupVersion.current++;
        setIsOpen(false);
      }
    },
    form,
    updateField,
    submit,
    error: error || courtsError,
    notice,
    availableCourts,
    amount,
    daySchedule,
    today: getTodayDateString(),
  };
}
