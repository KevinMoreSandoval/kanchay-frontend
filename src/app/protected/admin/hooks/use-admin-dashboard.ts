import { useState, useMemo, useEffect } from 'react';
import { useUsers } from '@/hooks/use-users';
import { getAdminSummary, type AdminSummary } from '@/services/admin-dashboard-service';
import { toast } from '@/services/toast-service';
import { RESERVATIONS_CHANGED_EVENT } from '@/services/reservations/reservation-api';
import { useCourts } from '@/hooks/use-courts';

export function useAdminDashboard() {
  const { users, refresh: refreshUsers } = useUsers();
  const {
    courts,
    loading: courtsLoading,
    error: courtsError,
    refresh: refreshCourts,
  } = useCourts();
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  useEffect(() => {
    let active = true;
    let version = 0;
    const load = () => {
      const current = ++version;
      void getAdminSummary()
        .then((value) => {
          if (active && current === version) setSummary(value);
        })
        .catch((error: unknown) => {
          if (active && current === version)
            toast.error(error instanceof Error ? error.message : 'No se pudo cargar el resumen.');
        });
    };
    load();
    const timer = window.setInterval(load, 30_000);
    window.addEventListener(RESERVATIONS_CHANGED_EVENT, load);
    window.addEventListener('focus', load);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener(RESERVATIONS_CHANGED_EVENT, load);
      window.removeEventListener('focus', load);
    };
  }, []);

  const metrics = useMemo(() => {
    return {
      totalUsers: users.length,
      totalCourts: courts.length,
      totalReservations: summary?.totalReservas ?? 0,
      totalRevenue: summary?.ingresosEstimados ?? 0,
    };
  }, [users, courts, summary]);

  return {
    users,
    courts,
    courtsLoading,
    courtsError,
    metrics,
    refreshCourts,
    refreshUsers,
  };
}
