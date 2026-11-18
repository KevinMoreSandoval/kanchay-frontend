import { useState, useMemo, useEffect } from 'react';
import { getTodayDateString } from '@/lib/date';
import { useCourts } from '@/hooks/use-courts';
import { validateSlotSelection } from '../validations';
import { useCourtSlots } from './use-court-slots';
import type { Court } from '@/types';
import type { TimeSlot } from '../../components/availability-time-slots';

export function useCourtsCatalog() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { courts, loading, error, refresh } = useCourts(true);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [reservingCourt, setReservingCourt] = useState<Court | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Estados para el flujo de reserva (AvailabilityStep)
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);

  const {
    slots,
    error: slotsError,
    loading: slotsLoading,
    retry: retrySlots,
  } = useCourtSlots(reservingCourt?.id, selectedDate);
  const availableSlots = slots;
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!reservingCourt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [reservingCourt]);
  const selectionError = validateSlotSelection(selectedDate, selectedSlots, slots, now);
  const canContinue = !slotsLoading && !slotsError && !selectionError;
  const totalAmount = useMemo(() => {
    return selectedSlots.reduce((acc, slot) => acc + slot.price, 0);
  }, [selectedSlots]);

  const handleToggleSlot = (slot: TimeSlot) => {
    if (!slot.available) return;
    setSelectedSlots((prev) => {
      const exists = prev.some((s) => s.id === slot.id);
      if (exists) {
        return prev.filter((s) => s.id !== slot.id);
      }
      return [...prev, slot];
    });
  };

  const handleDetails = (id: number) => {
    const court = courts.find((c) => c.id === id) || null;
    setSelectedCourt(court);
  };

  const handleReserve = (id: number) => {
    setNow(Date.now());
    retrySlots();
    const court = courts.find((c) => c.id === id) || null;
    setSelectedCourt(null);
    setReservingCourt(court);
    setSelectedSlots([]); // Limpia la selección previa
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setSelectedSlots([]);
  };

  const closeReservationFlow = () => {
    setReservingCourt(null);
    setSelectedSlots([]);
  };

  const filteredCourts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return courts;
    return courts.filter(
      (court) =>
        court.name.toLowerCase().includes(term) ||
        court.features.some((f) => f.toLowerCase().includes(term)) ||
        court.location.toLowerCase().includes(term)
    );
  }, [courts, searchTerm]);

  return {
    loading,
    error,
    refresh,
    searchTerm,
    setSearchTerm,
    filteredCourts,
    selectedCourt,
    setSelectedCourt,
    reservingCourt,
    setReservingCourt,
    selectedDate,
    setSelectedDate,
    handleDateChange,
    availableSlots,
    canContinue,
    selectionError,
    slotsError,
    slotsLoading,
    retrySlots,
    selectedSlots,
    totalAmount,
    handleToggleSlot,
    actionNotice,
    setActionNotice,
    handleDetails,
    handleReserve,
    closeReservationFlow,
  };
}
