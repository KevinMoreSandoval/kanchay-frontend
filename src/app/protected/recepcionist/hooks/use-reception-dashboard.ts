import { useState, useMemo, useEffect } from 'react';
import { getReservations, getTodayDateString } from '@/services/local-data-service';
import type { Reservation } from '@/types';

export function useReceptionDashboard() {
  const [search, setSearch] = useState<string>('');
  const [reservations, setReservations] = useState<Reservation[]>(getReservations);

  const localDate = useMemo(() => getTodayDateString(), []);

  useEffect(() => {
    const refreshReservations = () => setReservations(getReservations());
    const intervalId = window.setInterval(refreshReservations, 30_000);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === 'kanchaya.reservations') refreshReservations();
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const todayReservations = useMemo(
    () => reservations.filter((item) => item.fecha === localDate),
    [reservations, localDate]
  );

  const query = search.trim().toLocaleLowerCase('es');

  const visibleReservations = useMemo(() => {
    if (!query) return todayReservations;
    return todayReservations.filter((item) =>
      `${item.cliente} ${item.cancha}`.toLocaleLowerCase('es').includes(query)
    );
  }, [todayReservations, query]);

  const upcoming = useMemo(
    () => visibleReservations.filter((item) => ['CONFIRMADA', 'PENDIENTE'].includes(item.estado)),
    [visibleReservations]
  );

  const activity = useMemo(
    () =>
      visibleReservations.filter((item) =>
        ['EN_CURSO', 'FINALIZADA', 'NO_ASISTIO', 'CANCELADA'].includes(item.estado)
      ),
    [visibleReservations]
  );

  const counts = useMemo(
    () => ({
      total: todayReservations.length,
      inProgress: todayReservations.filter((item) => item.estado === 'EN_CURSO').length,
      completed: todayReservations.filter((item) => item.estado === 'FINALIZADA').length,
      noShow: todayReservations.filter((item) => item.estado === 'NO_ASISTIO').length,
    }),
    [todayReservations]
  );

  return {
    search,
    setSearch,
    query,
    localDate,
    visibleReservations,
    todayReservations,
    upcoming,
    activity,
    counts,
  };
}
