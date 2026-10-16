import { useState, useMemo, useEffect } from 'react';
import { getCourts, getReservations } from '@/services/local-data-service';
import { getManagedCourts } from '@/services/court-draft-service';
import type { Court, CourtScheduleEntry } from '@/types';
import type { TimeSlot } from '../components/availability-time-slots';

const WEEK_DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DEFAULT_OPENS = '08:00';
const DEFAULT_CLOSES = '22:00';
const SLOT_DURATION_MINUTES = 60;

function addManagedLocationDetails(courts: Court[]): Court[] {
  const managedCourts = getManagedCourts();

  return courts.map((court) => {
    const managedCourt = managedCourts.find(
      (managed) =>
        Number(managed.id.split('-')[1]) === court.id ||
        (managed.general.name.trim() === court.name &&
          managed.location.venue.trim() === court.location)
    );

    return managedCourt
      ? {
          ...court,
          description: court.description || managedCourt.general.description.trim(),
          address: court.address || managedCourt.location.address.trim(),
          reference: court.reference || managedCourt.location.reference.trim(),
          schedule: court.schedule ?? managedCourt.location.schedule,
        }
      : court;
  });
}

/** Genera todos los slots de 1 hora entre dos horarios "HH:MM" */
function generateSlots(
  courtId: number,
  date: string,
  opens: string,
  closes: string,
  basePrice: number
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const [openH, openM] = opens.split(':').map(Number);
  const [closeH, closeM] = closes.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  for (
    let start = openMinutes;
    start + SLOT_DURATION_MINUTES <= closeMinutes;
    start += SLOT_DURATION_MINUTES
  ) {
    const end = start + SLOT_DURATION_MINUTES;
    const startTime = `${String(Math.floor(start / 60)).padStart(2, '0')}:${String(start % 60).padStart(2, '0')}`;
    const endTime = `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
    slots.push({
      id: `${courtId}-${date}-${startTime}`,
      startTime,
      endTime,
      price: basePrice,
      available: true, // se marca como ocupado en el siguiente paso
    });
  }
  return slots;
}

/** Determina el horario de apertura/cierre de la cancha para una fecha dada */
function getDaySchedule(
  schedule: CourtScheduleEntry[] | undefined,
  date: string
): { opens: string; closes: string; isOpen: boolean } {
  if (!schedule || schedule.length === 0) {
    return { opens: DEFAULT_OPENS, closes: DEFAULT_CLOSES, isOpen: true };
  }
  const dayName = WEEK_DAYS[new Date(`${date}T12:00:00`).getDay()];
  const entry = schedule.find((s) => s.day === dayName);
  if (!entry || !entry.isOpen) {
    return { opens: DEFAULT_OPENS, closes: DEFAULT_CLOSES, isOpen: false };
  }
  return { opens: entry.opens, closes: entry.closes, isOpen: true };
}

function getTodayIso(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useCourtsCatalog() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [courts, setCourts] = useState<Court[]>(() => addManagedLocationDetails(getCourts()));
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [reservingCourt, setReservingCourt] = useState<Court | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Estados para el flujo de reserva (AvailabilityStep)
  const [selectedDate, setSelectedDate] = useState<string>(getTodayIso);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    const refreshCourts = (event: StorageEvent) => {
      if (
        event.key === null ||
        event.key === 'kanchaya.courts' ||
        event.key === 'kanchaya.managed-courts'
      ) {
        setCourts(addManagedLocationDetails(getCourts()));
      }
    };

    window.addEventListener('storage', refreshCourts);
    return () => window.removeEventListener('storage', refreshCourts);
  }, []);

  /**
   * Slots reales: se generan según el horario semanal de la cancha,
   * se descartan los intervalos que ya hayan pasado si es la fecha actual,
   * y se marcan como ocupados si ya existe una reserva activa solapante.
   */
  const availableSlots = useMemo<TimeSlot[]>(() => {
    if (!reservingCourt) return [];

    const todayStr = getTodayIso();
    // Si la fecha seleccionada es anterior a hoy, no se muestran intervalos
    if (selectedDate < todayStr) return [];

    const daySchedule = getDaySchedule(reservingCourt.schedule, selectedDate);
    if (!daySchedule.isOpen) return [];

    const basePrice = Number(reservingCourt.price || 80);
    const slots = generateSlots(
      reservingCourt.id,
      selectedDate,
      daySchedule.opens,
      daySchedule.closes,
      basePrice
    );

    // Si la fecha es hoy, filtrar intervalos cuya hora de inicio ya pasó
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    const futureSlots =
      selectedDate === todayStr ? slots.filter((slot) => slot.startTime > currentTimeStr) : slots;

    // Cruzar con reservas activas para marcar slots ocupados
    const activeReservations = getReservations().filter(
      (r) =>
        r.courtId === reservingCourt.id &&
        r.fecha === selectedDate &&
        ['PENDIENTE', 'CONFIRMADA', 'EN_CURSO'].includes(r.estado)
    );

    return futureSlots.map((slot) => {
      const isOccupied = activeReservations.some(
        (r) => slot.startTime < r.horaFin && slot.endTime > r.horaInicio
      );
      return isOccupied ? { ...slot, available: false } : slot;
    });
  }, [reservingCourt, selectedDate]);

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
