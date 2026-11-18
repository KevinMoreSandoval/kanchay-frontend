import { notifyToast } from '@/services/toast-service';
import { useEffect, useRef, useState } from 'react';
import { useClients } from '@/hooks/use-clients';
import { useReservations } from '@/hooks/use-reservations';
import type { User } from '@/types';

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es');
}

function paginate<T>(items: T[], page: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / 10));
  const currentPage = Math.min(page, totalPages);
  return {
    rows: items.slice((currentPage - 1) * 10, currentPage * 10),
    total: items.length,
    currentPage,
    totalPages,
  };
}

export function useReceptionClients() {
  const {
    clients,
    loading: clientsLoading,
    error: clientsError,
    refresh: refreshClients,
  } = useClients();
  const {
    reservations,
    loading: reservationsLoading,
    error: reservationsError,
    refresh: refreshReservations,
  } = useReservations();
  const [search, setSearch] = useState('');
  const [createClientOpen, setCreateClientOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [page, setPage] = useState(1);
  const [reservationPage, setReservationPage] = useState(1);
  const [clientId, setClientId] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const historyDialogRef = useRef<HTMLDialogElement>(null);

  const client = clients.find((item) => item.id === clientId);
  const history = client
    ? reservations
        .filter((item) => (item.userId ?? item.user?.id) === client.id)
        .sort(
          (a, b) =>
            b.fecha.localeCompare(a.fecha) ||
            b.horaInicio.localeCompare(a.horaInicio) ||
            b.id - a.id
        )
    : [];
  const detail = history.find((item) => item.id === reservationId);
  const isHistoryOpen = client !== undefined;
  useEffect(() => {
    const dialog = historyDialogRef.current;
    if (!dialog || !isHistoryOpen) return;
    const previousFocus = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [isHistoryOpen]);
  const isOpen = detail !== undefined;
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return;
    const previousFocus = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [isOpen]);

  const query = normalize(search.trim());
  const filtered = clients
    .filter((item) =>
      normalize(
        `${item.firstName} ${item.lastName} ${item.phone ?? ''} ${item.email ?? ''}`
      ).includes(query)
    )
    .sort(
      (a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, 'es') ||
        a.id.localeCompare(b.id)
    );

  return {
    loading: clientsLoading || reservationsLoading,
    loadError: clientsError || reservationsError,
    retry: () => {
      void refreshClients();
      void refreshReservations();
    },
    search,
    client,
    detail,
    dialogRef,
    historyDialogRef,
    createClientOpen,
    feedback,
    openCreateClient: () => {
      setFeedback('');
      setCreateClientOpen(true);
    },
    closeCreateClient: () => setCreateClientOpen(false),
    onClientCreated: (user: User) => {
      void refreshClients();
      setSearch(user.email);
      setPage(1);
      setCreateClientOpen(false);
      setFeedback(
        notifyToast(`Cliente ${user.firstName} ${user.lastName} creado correctamente.`, 'success')
      );
    },
    hasClients: clients.length > 0,
    clients: paginate(filtered, page),
    history: paginate(history, reservationPage),
    setPage,
    setReservationPage,
    updateSearch: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    selectClient: (id: string) => {
      void refreshReservations();
      setClientId(id);
      setReservationPage(1);
      setReservationId(null);
    },
    openDetail: (id: number) => {
      void refreshReservations();
      setReservationId(id);
    },
    closeDetail: () => setReservationId(null),
    closeHistory: () => {
      setReservationId(null);
      setClientId(null);
    },
  };
}
