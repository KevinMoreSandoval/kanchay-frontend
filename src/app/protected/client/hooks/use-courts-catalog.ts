import { useState, useMemo, useEffect } from 'react';
import { getCourts } from '@/services/local-data-service';
import type { Court } from '@/types';
import type { TimeSlot } from '../components/availability-step';

export function useCourtsCatalog() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [courts, setCourts] = useState<Court[]>(getCourts);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [reservingCourt, setReservingCourt] = useState<Court | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Estados para el flujo de reserva (AvailabilityStep)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    const refreshCourts = (event: StorageEvent) => {
      if (event.key === null || event.key === 'kanchaya.courts') {
        setCourts(getCourts());
      }
    };

    window.addEventListener('storage', refreshCourts);
    return () => window.removeEventListener('storage', refreshCourts);
  }, []);

  // Generación de slots mock según la cancha y la fecha
  const availableSlots = useMemo<TimeSlot[]>(() => {
    if (!reservingCourt) return [];
    const basePrice = Number(reservingCourt.price || 80);
    const slots: TimeSlot[] = [];

    const hours = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
      '20:00',
      '21:00',
      '22:00',
    ];

    hours.forEach((h, idx) => {
      if (idx === hours.length - 1) return;
      const nextH = hours[idx + 1];
      slots.push({
        id: `${reservingCourt.id}-${selectedDate}-${h}`,
        startTime: h,
        endTime: nextH,
        price: basePrice,
        available: idx % 4 !== 0, // Simula algunos turnos ocupados
      });
    });

    return slots;
  }, [reservingCourt, selectedDate]);

  const totalAmount = useMemo(() => {
    return selectedSlots.reduce((acc, slot) => acc + slot.price, 0);
  }, [selectedSlots]);

  const handleToggleSlot = (slot: TimeSlot) => {
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
    const court = courts.find((c) => c.id === id) || null;
    setSelectedCourt(null); // Cierra el modal de detalles si estaba abierto
    setReservingCourt(court);
    setSelectedSlots([]); // Limpia la selección previa
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
    searchTerm,
    setSearchTerm,
    filteredCourts,
    selectedCourt,
    setSelectedCourt,
    reservingCourt,
    setReservingCourt,
    selectedDate,
    setSelectedDate,
    availableSlots,
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
