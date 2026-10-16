import { useEffect, useRef, useState, type FormEvent } from 'react';
import { getManagedCourts } from '@/services/court-draft-service';
import { getTodayDateString } from '@/services/local-data-service';
import {
  createReservation,
  validateReservationCreation,
  type CreateReservationData,
} from '@/services/reservation-service';
import { getRegisteredUsers } from '@/services/auth-service';
import type { User, PaymentMethod } from '@/types';

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
  const [courts, setCourts] = useState(getManagedCourts);
  const [form, setForm] = useState(emptyForm);
  const [reviewData, setReviewData] = useState<CreateReservationData | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [dni, setDni] = useState('');
  const [client, setClient] = useState<User | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const court = courts.find((item) => item.id === form.courtId);
  const availableCourts = courts.filter((item) => item.location.status === 'activa');
  const rate = Number(court?.features.promotionalPrice || court?.features.pricePerHour || 0);
  const duration =
    (new Date(`${form.fecha}T${form.horaFin}:00`).getTime() -
      new Date(`${form.fecha}T${form.horaInicio}:00`).getTime()) /
    3_600_000;
  const amount =
    Number.isFinite(duration) && duration > 0 ? Math.round(rate * duration * 100) / 100 : 0;
  const daySchedule = court?.location.schedule?.find(
    (entry) =>
      entry.day ===
      ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][
        new Date(`${form.fecha}T12:00:00`).getDay()
      ]
  );

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

  function open() {
    setStep(1);
    setReviewData(null);
    setDni('');
    setClient(null);
    setNotFound(false);
    setClientModalOpen(false);
    setCourts(getManagedCourts());
    setForm(emptyForm());
    setError('');
    setNotice('');
    setIsOpen(true);
  }

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
    setError('');
  }

  function updateDni(value: string) {
    setDni(value);
    setClient(null);
    setNotFound(false);
    setError('');
  }

  function lookupClient() {
    setError('');
    if (!/^\d{8}$/.test(dni)) {
      setError('El DNI debe tener 8 dígitos.');
      return;
    }
    const found = getRegisteredUsers().find((user) => user.dni === dni);
    if (found && found.role !== 'Cliente') {
      setError('Este DNI pertenece a una cuenta de personal. Selecciona un cliente.');
      return;
    }
    setClient(found ?? null);
    setNotFound(!found);
    if (found) setStep(2);
  }

  function continueWithClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    lookupClient();
  }

  function reviewReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
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
        courtId: Number(currentCourt.id.split('-')[1]),
        cancha: currentCourt.general.name,
        monto: Math.round(currentRate * duration * 100) / 100,
      };
      const validated = validateReservationCreation(data);
      setReviewData({ ...data, cliente: validated.cliente, user: validated.user });
      setStep(3);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Revisa los datos de la reserva.');
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step !== 3 || !reviewData) return;
    try {
      createReservation(reviewData);
      onCreated();
      setIsOpen(false);
      setNotice(
        'Reserva creada en estado pendiente y con pago pendiente. Debe confirmarse dentro de los próximos 15 minutos. Si los filtros activos la excluyen, restablécelos para consultarla.'
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo crear la reserva.');
    }
  }

  return {
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
      setStep(step === 3 ? 2 : 1);
      setError('');
    },
    dialogRef,
    isOpen,
    open,
    close: () => {
      if (!clientModalOpen) setIsOpen(false);
    },
    form,
    updateField,
    submit,
    error,
    notice,
    availableCourts,
    amount,
    daySchedule,
    today: getTodayDateString(),
  };
}
