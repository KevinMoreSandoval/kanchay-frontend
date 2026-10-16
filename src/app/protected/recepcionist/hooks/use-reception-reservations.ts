import { useEffect, useState } from 'react';
import { getReservations, getTodayDateString } from '@/services/local-data-service';
import type { ReservationStatus } from '@/types';

type Filters = {
  search: string;
  period: string;
  status: string;
  court: string;
  date: string;
};
const initialFilters: Filters = { search: '', period: 'upcoming', status: '', court: '', date: '' };

export const reservationStatuses: Record<ReservationStatus, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  EN_CURSO: 'En curso',
  FINALIZADA: 'Finalizada',
  NO_ASISTIO: 'No asistió',
  CANCELADA: 'Cancelada',
};

export function useReceptionReservations() {
  const [reservations, setReservations] = useState(getReservations);
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const refresh = () => setReservations(getReservations());
    const timer = window.setInterval(refresh, 30_000);
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === 'kanchaya.reservations') refresh();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const today = getTodayDateString();
  const query = filters.search.trim().toLocaleLowerCase('es');
  const courts = [...new Set(reservations.map((row) => row.cancha))].sort((a, b) =>
    a.localeCompare(b, 'es')
  );
  const filtered = reservations
    .filter((row) => {
      if (filters.period === 'upcoming' && row.fecha < today) return false;
      if (filters.period === 'today' && row.fecha !== today) return false;
      if (filters.period === 'past' && row.fecha >= today) return false;
      if (filters.period === 'date' && (!filters.date || row.fecha !== filters.date)) return false;
      if (filters.status && row.estado !== filters.status) return false;
      if (filters.court && row.cancha !== filters.court) return false;
      return (
        !query || `${row.id} ${row.cliente} ${row.cancha}`.toLocaleLowerCase('es').includes(query)
      );
    })
    .sort(
      (a, b) =>
        a.fecha.localeCompare(b.fecha) || a.horaInicio.localeCompare(b.horaInicio) || a.id - b.id
    );
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;

  function updateFilter(key: keyof Filters, value: string) {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setPage(1);
  }

  return {
    refreshReservations: () => setReservations(getReservations()),
    filters,
    updateFilter,
    courts,
    total,
    totalPages,
    currentPage,
    rows: filtered.slice(start, start + pageSize),
    first: total ? start + 1 : 0,
    last: Math.min(start + pageSize, total),
    previousPage: () => setPage(Math.max(1, currentPage - 1)),
    nextPage: () => setPage(Math.min(totalPages, currentPage + 1)),
    resetFilters: () => {
      setFilters(initialFilters);
      setPage(1);
    },
  };
}
