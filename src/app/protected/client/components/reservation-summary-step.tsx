import React from 'react';
import { ArrowRight, Home, Info } from 'lucide-react';
import type { Reservation } from '@/types';
import { Button, Card } from '@/components/ui';
import type { TimeSlot } from './availability-time-slots';

interface ReservationSummaryStepProps {
  reservation: Reservation;
  selectedSlots?: TimeSlot[];
  onGoHome: () => void;
  onGoMyReservations: () => void;
}

function RosetteCheckBadge({ className = 'h-28 w-28' }: { className?: string }) {
  const d = React.useMemo(() => {
    const total = 16;
    const rValley = 38;
    const rControl = 49;
    const points: string[] = [];

    const firstAngle = -Math.PI / total;
    const startX = 50 + rValley * Math.sin(firstAngle);
    const startY = 50 - rValley * Math.cos(firstAngle);
    points.push(`M ${startX.toFixed(2)} ${startY.toFixed(2)}`);

    for (let i = 0; i < total; i++) {
      const theta = (i * 2 * Math.PI) / total;
      const phi = ((i + 0.5) * 2 * Math.PI) / total;

      const cx = 50 + rControl * Math.sin(theta);
      const cy = 50 - rControl * Math.cos(theta);

      const vx = 50 + rValley * Math.sin(phi);
      const vy = 50 - rValley * Math.cos(phi);

      points.push(`Q ${cx.toFixed(2)} ${cy.toFixed(2)}, ${vx.toFixed(2)} ${vy.toFixed(2)}`);
    }

    return points.join(' ') + ' Z';
  }, []);

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path d={d} fill="#16A34A" />
      <path
        d="M32 50 L44 62 L68 38"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const formatted = date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return dateStr;
  }
}

export const ReservationSummaryStep: React.FC<ReservationSummaryStepProps> = ({
  reservation,
  onGoHome,
  onGoMyReservations,
}) => {
  const isConfirmed = reservation.estado === 'CONFIRMADA';

  return (
    <div className="flex min-h-[calc(100vh-14rem)] w-full flex-col items-center justify-center py-6 animate-in fade-in-0 duration-500">
      <Card className="flex w-full max-w-2xl flex-col items-center rounded-3xl border border-border/80 bg-card p-8 text-center shadow-xs sm:p-12">
        <div className="animate-in zoom-in-75 duration-500 ease-out">
          <RosetteCheckBadge className="h-24 w-24 sm:h-28 sm:w-28 drop-shadow-xs" />
        </div>

        <h1 className="mt-6 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          {isConfirmed ? '¡Reserva Confirmada!' : '¡Reserva Registrada!'}
        </h1>

        <p className="mt-2.5 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {isConfirmed ? (
            <>
              Tu turno para{' '}
              <strong className="font-bold text-foreground">{reservation.cancha}</strong> ha sido
              confirmado para el{' '}
              <strong className="font-bold text-foreground">
                {formatDisplayDate(reservation.fecha)}
              </strong>{' '}
              de{' '}
              <strong className="font-bold text-foreground">
                {reservation.horaInicio} a {reservation.horaFin}
              </strong>
              .
            </>
          ) : (
            <>
              Tu turno para{' '}
              <strong className="font-bold text-foreground">{reservation.cancha}</strong> ha sido
              registrado. Recuerda abonar en recepción dentro de los primeros 15 minutos.
            </>
          )}
        </p>

        <div className="mt-6 flex w-full max-w-md items-start gap-3 rounded-2xl border border-border/80 bg-muted/30 p-4 text-left text-xs sm:text-sm">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="leading-relaxed text-muted-foreground">
            <strong className="font-semibold text-foreground">Recomendación:</strong>{' '}
            {isConfirmed
              ? 'Tu reserva está confirmada. Te recomendamos presentarte en recepción 10 minutos antes de tu turno para ingresar a tiempo a la cancha.'
              : 'Cuentas con 15 minutos para validar y pagar tu turno en recepción. Te sugerimos llegar 10 minutos antes.'}
          </p>
        </div>

        <div className="mt-8 flex w-full max-w-md flex-col-reverse gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onGoHome}
            className="h-11 flex-1 cursor-pointer rounded-2xl border-border font-semibold text-foreground hover:bg-muted"
          >
            <Home className="mr-2 h-4 w-4" aria-hidden="true" />
            Volver al catálogo
          </Button>

          <Button
            type="button"
            onClick={onGoMyReservations}
            className="h-11 flex-1 cursor-pointer rounded-2xl bg-primary font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90"
          >
            <span>Ver mis reservas</span>
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
