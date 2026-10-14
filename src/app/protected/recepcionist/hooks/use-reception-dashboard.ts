import { useState, useMemo, useEffect } from 'react';
import { getReservations, getTodayDateString } from '@/services/local-data-service';
import { getReservationStartTimestamp } from '@/services/reservation-service';
import type { Reservation } from '@/types';

export function useReceptionDashboard() {
  const [search, setSearch] = useState<string>('');
  const [reservations, setReservations] = useState<Reservation[]>(getReservations);

  const [selectedDate, setSelectedDate] = useState(getTodayDateString);
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const refreshReservations = () => {
      setReservations(getReservations());
      setNow(Date.now());
    };
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

  const dateReservations = useMemo(
    () => reservations.filter((item) => item.fecha === selectedDate),
    [reservations, selectedDate]
  );

  const query = search.trim().toLocaleLowerCase('es');

  const visibleReservations = useMemo(() => {
    if (!query) return dateReservations;
    return dateReservations.filter((item) =>
      `${item.cliente} ${item.cancha}`.toLocaleLowerCase('es').includes(query)
    );
  }, [dateReservations, query]);

  const upcomingReservations = useMemo(
    () =>
      dateReservations.filter(
        (item) =>
          ['CONFIRMADA', 'PENDIENTE'].includes(item.estado) &&
          getReservationStartTimestamp(item) > now
      ),
    [dateReservations, now]
  );

  const upcoming = useMemo(
    () =>
      upcomingReservations.filter((item) =>
        `${item.cliente} ${item.cancha}`.toLocaleLowerCase('es').includes(query)
      ),
    [upcomingReservations, query]
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
      total: dateReservations.length,
      pending: dateReservations.filter((item) => item.estado === 'PENDIENTE').length,
      upcoming: upcomingReservations.length,
      inProgress: dateReservations.filter((item) => item.estado === 'EN_CURSO').length,
      completed: dateReservations.filter((item) => item.estado === 'FINALIZADA').length,
      noShow: dateReservations.filter((item) => item.estado === 'NO_ASISTIO').length,
      canceled: dateReservations.filter((item) => item.estado === 'CANCELADA').length,
    }),
    [dateReservations, upcomingReservations]
  );

  return {
    search,
    setSearch,
    query,
    selectedDate,
    setSelectedDate: (date: string) => {
      if (date) setSelectedDate(date);
    },
    visibleReservations,
    dateReservations,
    upcoming,
    activity,
    counts,
  };
}
