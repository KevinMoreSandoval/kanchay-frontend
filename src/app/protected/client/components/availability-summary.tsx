import { useMemo } from 'react';
import { Calendar, ChevronRight, Clock, CreditCard, MapPin } from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';
import type { PaymentMethod } from '@/types';
import type { TimeSlot } from './availability-time-slots';

export interface AvailabilitySummaryProps {
  courtName: string;
  selectedDate: string;
  selectedSlots: TimeSlot[];
  totalAmount: number;
  onNext: () => void;
  buttonText?: string;
  selectedPaymentMethod?: PaymentMethod;
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  YAPE_PLIN: 'Yape / Plin',
  TARJETA: 'Tarjeta Débito / Crédito',
  EFECTIVO: 'Pago en Caja (Efectivo)',
  TRANSFERENCIA: 'Transferencia Bancaria',
};

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const formatted = date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return dateStr;
  }
}

export function AvailabilitySummary({
  courtName,
  selectedDate,
  selectedSlots,
  totalAmount,
  onNext,
  buttonText = 'Continuar a Confirmación',
  selectedPaymentMethod,
}: AvailabilitySummaryProps) {
  const sortedSlots = useMemo(() => {
    return [...selectedSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [selectedSlots]);

  const totalMinutes = sortedSlots.length * 60;

  return (
    <Card className="sticky top-28 space-y-5 rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm">
      {/* Encabezado del Resumen */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h2 className="text-sm font-bold text-foreground">Resumen de tu reserva</h2>
      </div>

      {/* Datos Clave */}
      <dl className="space-y-3 text-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <dt className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>Cancha:</span>
          </dt>
          <dd className="font-bold text-foreground truncate max-w-[180px] text-right">
            {courtName}
          </dd>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <dt className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>Fecha:</span>
          </dt>
          <dd className="font-bold text-foreground">{formatDisplayDate(selectedDate)}</dd>
        </div>
        {selectedPaymentMethod && (
          <div className="flex items-center justify-between text-muted-foreground">
            <dt className="flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span>Pago:</span>
            </dt>
            <dd className="font-bold text-primary">{PAYMENT_LABELS[selectedPaymentMethod]}</dd>
          </div>
        )}
      </dl>

      {/* Horarios seleccionados mostrados en Badges */}
      <div className="border-t border-border/60 pt-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">
            Horarios seleccionados:
          </span>
          {totalMinutes > 0 && (
            <span className="text-[11px] font-semibold text-primary">
              {totalMinutes} min totales
            </span>
          )}
        </div>

        {sortedSlots.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-4 text-center text-xs text-muted-foreground">
            Selecciona uno o más turnos en el panel de horarios.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
            {sortedSlots.map((slot) => (
              <Badge
                key={slot.id}
                variant="secondary"
                className="flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary shadow-2xs"
              >
                <Clock className="h-3 w-3 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  {slot.startTime} - {slot.endTime}
                </span>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Total a pagar */}
      <div className="flex items-center justify-between border-t border-border/60 pt-4">
        <div>
          <span className="block text-xs font-bold text-foreground">Total a pagar</span>
          <span className="text-[10px] text-muted-foreground">Pago seguro</span>
        </div>
        <span className="text-2xl font-black text-primary tracking-tight">
          S/ {totalAmount.toFixed(2)}
        </span>
      </div>

      {/* Botón de acción */}
      <Button
        type="button"
        disabled={selectedSlots.length === 0}
        onClick={onNext}
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>{buttonText}</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </Card>
  );
}
