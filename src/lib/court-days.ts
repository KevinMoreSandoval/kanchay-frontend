import type { CourtDay } from '@/types/courts';

export const COURT_WEEK_DAYS: { value: CourtDay; label: string }[] = [
  { value: 'MONDAY', label: 'Lunes' },
  { value: 'TUESDAY', label: 'Martes' },
  { value: 'WEDNESDAY', label: 'Miércoles' },
  { value: 'THURSDAY', label: 'Jueves' },
  { value: 'FRIDAY', label: 'Viernes' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' },
];

export function normalizeCourtDays(days?: CourtDay[] | null): CourtDay[] {
  return COURT_WEEK_DAYS.filter((day) => days == null || days.includes(day.value)).map(
    (day) => day.value
  );
}

export function courtOpenOnDate(days: CourtDay[] | undefined, date: string): boolean {
  const index = new Date(`${date}T12:00:00`).getDay();
  const day = COURT_WEEK_DAYS[(index + 6) % 7]?.value;
  return !!day && normalizeCourtDays(days).includes(day);
}

export function courtDaysLabel(days?: CourtDay[]): string {
  const selected = normalizeCourtDays(days);
  if (selected.length === 7) return 'Todos los días';
  return (
    COURT_WEEK_DAYS.filter((day) => selected.includes(day.value))
      .map((day) => day.label)
      .join(', ') || 'Sin días habilitados'
  );
}
