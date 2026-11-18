import { useState, useMemo } from 'react';
import { getTodayDateString } from '@/lib/date';
import { useReservations } from '@/hooks/use-reservations';

export function useReceptionDashboard() {
  const [activeSection, setActiveSection] = useState('/recepcionista');
  const [search, setSearch] = useState<string>('');
  const { reservations, loading, error, refresh } = useReservations();

  const localDate = getTodayDateString();

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
    loading,
    error,
    refresh,
    activeSection,
    setActiveSection,
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
