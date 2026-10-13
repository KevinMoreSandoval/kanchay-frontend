import { useCallback, useEffect, useRef, useState } from 'react';
import { getCourts, getReservations, getTodayDateString } from '@/services/local-data-service';
import { getRegisteredUsers, saveManagedUser } from '@/services/auth-service';
import { getManagedCourts } from '@/services/court-draft-service';
import {
  cancelReservation,
  confirmReservation,
  createReservation,
  markReservationAttendance,
  quoteReservation,
  rescheduleReservation,
  updateReservationPaymentStatus,
  updateReservationSurchargePayment,
  type ReservationSchedule,
} from '@/services/reservation-service';
import type { PaymentMethod, Reservation } from '@/types';
import { reservationCode } from '@/lib/reservation-labels';

export type ReceptionSection = 'Dashboard' | 'Reservas' | 'Clientes';
export interface ReceptionFilters {
  search: string;
  from: string;
  to: string;
  status: string;
  payment: string;
  court: string;
}
const emptyFilters: ReceptionFilters = {
  search: '',
  from: '',
  to: '',
  status: '',
  payment: '',
  court: '',
};
export interface CreationForm extends ReservationSchedule {
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dni: string;
  courtId: string;
  paymentMethod: PaymentMethod;
  notes: string;
}
const initialCreation = (): CreationForm => ({
  clientId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dni: '',
  courtId: '',
  date: getTodayDateString(),
  startTime: '',
  endTime: '',
  paymentMethod: 'EFECTIVO',
  notes: '',
});

export function useReception() {
  const [section, setSection] = useState<ReceptionSection>('Dashboard');
  const [reservations, setReservations] = useState(getReservations);
  const [clients, setClients] = useState(() =>
    getRegisteredUsers().filter((user) => user.role === 'Cliente')
  );
  const [courts, setCourts] = useState(getCourts);
  const [managedCourts, setManagedCourts] = useState(getManagedCourts);
  const [now, setNow] = useState(Date.now);
  const [date, setDate] = useState(getTodayDateString);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(emptyFilters);
  const [clientSearch, setClientSearch] = useState('');
  const [clientId, setClientId] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [operation, setOperation] = useState<'cancel' | 'reschedule' | 'pay' | null>(null);
  const [schedule, setSchedule] = useState<ReservationSchedule>({
    date: '',
    startTime: '',
    endTime: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFECTIVO');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(initialCreation);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const refresh = useCallback(() => {
    try {
      setReservations(getReservations());
      setClients(getRegisteredUsers().filter((user) => user.role === 'Cliente'));
      setCourts(getCourts());
      setManagedCourts(getManagedCourts());
      setNow(Date.now());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron actualizar los datos.');
    }
  }, []);
  useEffect(() => {
    const timer = window.setInterval(refresh, 10_000);
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);
  const run = (action: () => Reservation[], message: string) => {
    if (lock.current) return false;
    lock.current = true;
    setBusy(true);
    setError('');
    setFeedback('');
    try {
      setReservations(action());
      setNow(Date.now());
      setFeedback(message);
      setOperation(null);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo completar la acción.');
      refresh();
      return false;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const openDetail = (id: number) => {
    setSelectedId(id);
    setOperation(null);
    setError('');
    setFeedback('');
  };
  const selected = reservations.find((item) => item.id === selectedId);
  const beginOperation = (value: 'cancel' | 'reschedule' | 'pay') => {
    if (!selected) return;
    setError('');
    setOperation(value);
    setPaymentMethod(selected.paymentMethod ?? 'EFECTIVO');
    setSchedule({
      date: selected.fecha,
      startTime: selected.horaInicio,
      endTime: selected.horaFin,
    });
  };
  const query = search.trim().toLocaleLowerCase('es');
  const dayRows = reservations.filter(
    (item) =>
      item.fecha === date &&
      `${item.cliente} ${item.cancha}`.toLocaleLowerCase('es').includes(query)
  );
  const upcoming = dayRows
    .filter((item) => ['PENDIENTE', 'CONFIRMADA'].includes(item.estado))
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  const attendanceRows = dayRows.filter((item) => item.estado === 'CONFIRMADA');
  const activityRows = dayRows.filter((item) => !['PENDIENTE', 'CONFIRMADA'].includes(item.estado));
  const kpis = [
    { id: 'total', label: 'Reservas del día', value: dayRows.length },
    {
      id: 'PENDIENTE',
      label: 'Pendientes',
      value: dayRows.filter((r) => r.estado === 'PENDIENTE').length,
    },
    { id: 'upcoming', label: 'Próximas', value: upcoming.length },
    ...[
      { id: 'EN_CURSO', label: 'En curso' },
      { id: 'FINALIZADA', label: 'Finalizadas' },
      { id: 'NO_ASISTIO', label: 'No asistieron' },
      { id: 'CANCELADA', label: 'Canceladas' },
    ].map((item) => ({ ...item, value: dayRows.filter((r) => r.estado === item.id).length })),
  ];
  const filtered = reservations
    .filter(
      (item) =>
        `${reservationCode(item.id)} ${item.cliente} ${item.cancha}`
          .toLocaleLowerCase('es')
          .includes(filters.search.trim().toLocaleLowerCase('es')) &&
        (!filters.from || item.fecha >= filters.from) &&
        (!filters.to || item.fecha <= filters.to) &&
        (!filters.status || item.estado === filters.status) &&
        (!filters.payment || (item.paymentStatus ?? 'PENDIENTE') === filters.payment) &&
        (!filters.court ||
          String(item.courtId) === filters.court ||
          (!item.courtId &&
            item.cancha === courts.find((court) => String(court.id) === filters.court)?.name))
    )
    .sort((a, b) => `${a.fecha} ${a.horaInicio}`.localeCompare(`${b.fecha} ${b.horaInicio}`));
  const filteredClients = clients.filter((user) =>
    `${user.firstName} ${user.lastName} ${user.phone ?? ''} ${user.email}`
      .toLocaleLowerCase('es')
      .includes(clientSearch.trim().toLocaleLowerCase('es'))
  );
  const selectedClient = clients.find((user) => user.id === clientId);
  const clientReservations = selectedClient
    ? reservations.filter((item) =>
        item.clienteId
          ? item.clienteId === selectedClient.id
          : item.cliente === `${selectedClient.firstName} ${selectedClient.lastName}`
      )
    : [];
  const availableCourts = courts.filter((court) =>
    managedCourts.some(
      (managed) =>
        Number(managed.id.split('-')[1]) === court.id && managed.location.status === 'activa'
    )
  );
  let quote: ReturnType<typeof quoteReservation> | undefined;
  let quoteError = '';
  if (creating && form.courtId && form.date && form.startTime && form.endTime) {
    try {
      quote = quoteReservation(Number(form.courtId), form, now, { courts, reservations });
    } catch (cause) {
      quoteError = cause instanceof Error ? cause.message : 'Horario no disponible.';
    }
  }
  const submitCreation = async () => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    setFeedback('');
    try {
      const price = quoteReservation(Number(form.courtId), form);
      let client = clients.find((user) => user.id === form.clientId);
      if (form.clientId && !client)
        throw new Error('El cliente seleccionado ya no está disponible.');
      if (!client) {
        const users = await saveManagedUser({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          dni: form.dni,
          role: 'Cliente',
        });
        setClients(users.filter((user) => user.role === 'Cliente'));
        client = users.find((user) => user.email === form.email.trim().toLowerCase());
        if (client) setForm((previous) => ({ ...previous, clientId: client!.id }));
      }
      if (!client) throw new Error('No se pudo guardar el cliente.');
      const updated = createReservation({
        clienteId: client.id,
        cliente: `${client.firstName} ${client.lastName}`,
        courtId: price.court.id,
        cancha: price.court.name,
        fecha: form.date,
        horaInicio: form.startTime,
        horaFin: form.endTime,
        monto: price.amount,
        paymentMethod: form.paymentMethod,
        observaciones: form.notes,
      });
      setReservations(updated);
      setCreating(false);
      setFeedback(
        'Reserva creada: pendiente de confirmación y de pago. Confírmala en los primeros 15 minutos.'
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo crear la reserva.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return {
    section,
    setSection,
    now,
    date,
    setDate,
    search,
    setSearch,
    dayRows,
    attendanceRows,
    activityRows,
    kpis,
    upcoming,
    filtered,
    filters,
    setFilters,
    clearFilters: () => setFilters(emptyFilters),
    courts,
    clients: filteredClients,
    clientSearch,
    setClientSearch,
    clientId,
    setClientId,
    selectedClient,
    clientReservations,
    selected,
    openDetail,
    closeDetail: () => {
      setSelectedId(null);
      setOperation(null);
    },
    operation,
    setOperation,
    beginOperation,
    schedule,
    setSchedule,
    paymentMethod,
    setPaymentMethod,
    busy,
    feedback,
    error,
    creating,
    form,
    setForm,
    quote,
    quoteError,
    availableCourts,
    allClients: clients,
    openCreation: () => {
      setForm(initialCreation());
      setCreating(true);
      setError('');
      setFeedback('');
    },
    closeCreation: () => {
      if (!lock.current) setCreating(false);
    },
    submitCreation,
    confirm: (id: number) => run(() => confirmReservation(id), 'Reserva confirmada.'),
    attendance: (id: number) =>
      run(() => markReservationAttendance(id), 'Llegada registrada. La reserva está en curso.'),
    cancel: () =>
      selected &&
      run(
        () => cancelReservation(selected.id),
        'Reserva cancelada. Si estaba pagada, queda por reembolsar.'
      ),
    reschedule: () =>
      selected &&
      run(
        () => rescheduleReservation(selected.id, schedule),
        'Reserva reprogramada. Recargo del 15% registrado por separado.'
      ),
    pay: () =>
      selected &&
      run(
        () => updateReservationPaymentStatus(selected.id, 'PAGADO', paymentMethod),
        'Pago base registrado.'
      ),
    refund: () =>
      selected &&
      run(
        () => updateReservationPaymentStatus(selected.id, 'REEMBOLSADO'),
        'Reembolso registrado.'
      ),
    paySurcharge: (index: number) =>
      selected &&
      run(() => updateReservationSurchargePayment(selected.id, index), 'Recargo pagado.'),
  };
}
export type ReceptionManagement = ReturnType<typeof useReception>;
