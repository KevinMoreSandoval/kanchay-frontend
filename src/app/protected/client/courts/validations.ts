import { validateSchedule } from '@/lib/validation';
import type { TimeSlot } from '../components/availability-time-slots';

export function validateSlotSelection(
  date: string,
  selected: TimeSlot[],
  available: TimeSlot[],
  now = Date.now()
): string | null {
  if (!selected.length) return 'Selecciona al menos un horario para continuar.';
  const sorted = [...selected].sort((a, b) => a.startTime.localeCompare(b.startTime));
  if (
    new Set(sorted.map((slot) => slot.id)).size !== sorted.length ||
    sorted.some((slot, index) => index > 0 && sorted[index - 1].endTime !== slot.startTime)
  )
    return 'Selecciona horarios consecutivos.';
  const errors = validateSchedule(
    { date, startTime: sorted[0].startTime, endTime: sorted[sorted.length - 1].endTime },
    now
  );
  if (Object.keys(errors).length)
    return Object.values(errors)[0] ?? 'Revisa la fecha y los horarios.';
  if (
    sorted.some(
      (slot) =>
        !Number.isFinite(slot.price) ||
        slot.price <= 0 ||
        !available.some(
          (current) => current.id === slot.id && current.available && current.price === slot.price
        )
    )
  )
    return 'Los horarios o tarifas cambiaron. Vuelve a seleccionar los horarios disponibles.';
  return null;
}
