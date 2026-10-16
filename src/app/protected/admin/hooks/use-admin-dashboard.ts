import { useCallback, useState, useMemo } from 'react';
import { getManagedUsers } from '@/services/auth-service';
import { getCourts, getReservations } from '@/services/local-data-service';
import type { User, Court, Reservation } from '@/types';

export function useAdminDashboard() {
  const [users, setUsers] = useState<User[]>(getManagedUsers);
  const [courts, setCourts] = useState<Court[]>(getCourts);
  const [reservations] = useState<Reservation[]>(getReservations);

  const refreshCourts = useCallback(() => {
    setCourts(getCourts());
  }, []);

  const refreshUsers = useCallback(() => {
    setUsers(getManagedUsers());
  }, []);

  const metrics = useMemo(() => {
    const totalRevenue = reservations.reduce((acc, curr) => acc + (curr.monto || 0), 0);
    return {
      totalUsers: users.length,
      totalCourts: courts.length,
      totalReservations: reservations.length,
      totalRevenue,
    };
  }, [users, courts, reservations]);

  return {
    users,
    courts,
    reservations,
    metrics,
    refreshCourts,
    refreshUsers,
  };
}
