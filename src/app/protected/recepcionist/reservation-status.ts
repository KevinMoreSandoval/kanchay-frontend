import type { BadgeProps } from '@/components/ui/badge';
import type { ReservationStatus } from '@/types';

export const reservationStatusConfig: Record<
  ReservationStatus,
  { label: string; variant: BadgeProps['variant'] }
> = {
  PENDIENTE: { label: 'Pendiente', variant: 'warning' },
  CONFIRMADA: { label: 'Confirmada', variant: 'success' },
  EN_CURSO: { label: 'En curso', variant: 'info' },
  FINALIZADA: { label: 'Finalizada', variant: 'secondary' },
  NO_ASISTIO: { label: 'No asistió', variant: 'destructive' },
  CANCELADA: { label: 'Cancelada', variant: 'outline' },
};
