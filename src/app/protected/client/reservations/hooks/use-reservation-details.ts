import { useEffect, useRef, useState } from 'react';
import type { Reservation } from '@/types';
import { cancelReservation } from '@/services/reservations/reservation-api';
import { toast } from '@/services/toast-service';
import { canRequestCancellation } from '../permissions';

export function useReservationDetails(reservations: Reservation[]) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [pending, setPending] = useState(false);
  const [now, setNow] = useState(Date.now);
  const busy = useRef(false);
  const reservation = reservations.find((item) => item.id === selectedId);
  const isOpen = reservation !== undefined;
  const canCancel = reservation ? canRequestCancellation(reservation, now) : false;

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [selectedId, isOpen]);

  const close = () => {
    if (busy.current) return;
    setSelectedId(null);
    setConfirmingCancel(false);
  };

  const confirmCancellation = async () => {
    if (busy.current || !confirmingCancel || !reservation) return;
    if (!canRequestCancellation(reservation)) {
      setNow(Date.now());
      toast.error('Esta reserva ya no está disponible para cancelación.');
      return;
    }
    busy.current = true;
    setPending(true);
    try {
      await cancelReservation(reservation.id);
      setSelectedId(null);
      setConfirmingCancel(false);
      toast.success('La reserva se canceló correctamente.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo cancelar la reserva.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  return {
    reservation,
    canCancel,
    confirmingCancel: confirmingCancel && (canCancel || pending),
    pending,
    close,
    confirmCancellation,
    open: (id: number) => {
      if (busy.current) return;
      setSelectedId(id);
      setNow(Date.now());
      setConfirmingCancel(false);
    },
    requestCancellation: () => {
      if (canCancel && !busy.current) setConfirmingCancel(true);
    },
    keepReservation: () => {
      if (!busy.current) setConfirmingCancel(false);
    },
  };
}
