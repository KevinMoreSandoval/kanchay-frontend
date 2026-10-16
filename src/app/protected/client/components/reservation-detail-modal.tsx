import React from 'react';
import { X, Calendar, Clock, CreditCard, User, CheckCircle2, XCircle } from 'lucide-react';
import type { Reservation, ReservationStatus } from '@/types';
import { Button, Badge } from '@/components/ui';

interface ReservationDetailModalProps {
  reservation: Reservation;
  onClose: () => void;
}

const STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  EN_CURSO: 'En curso',
  FINALIZADA: 'Finalizada',
  NO_ASISTIO: 'No asistió',
  CANCELADA: 'Cancelada',
};

const STATUS_BADGE_CLASS: Record<ReservationStatus, string> = {
  PENDIENTE: 'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMADA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  EN_CURSO: 'bg-blue-50 text-blue-700 border-blue-200',
  FINALIZADA: 'bg-slate-50 text-slate-600 border-slate-200',
  NO_ASISTIO: 'bg-orange-50 text-orange-700 border-orange-200',
  CANCELADA: 'bg-rose-50 text-rose-700 border-rose-200',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDIENTE: 'Pago pendiente',
  PAGADO: 'Pagado',
  POR_REEMBOLSAR: 'Por reembolsar',
  REEMBOLSADO: 'Reembolsado',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  YAPE_PLIN: 'Yape / Plin',
  TARJETA: 'Tarjeta',
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia Bancaria',
};

export const ReservationDetailModal: React.FC<ReservationDetailModalProps> = ({
  reservation,
  onClose,
}) => {
  const paymentLabel =
    PAYMENT_METHOD_LABELS[reservation.paymentMethod ?? ''] ?? reservation.paymentMethod ?? '—';
  const paymentStatusLabel =
    PAYMENT_STATUS_LABELS[reservation.paymentStatus ?? ''] ?? reservation.paymentStatus ?? '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-background border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl transition-all animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground">Detalle de Reserva</h2>
            <p className="text-xs font-mono text-muted-foreground">#{reservation.id}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-full"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Estado y pago */}
          <div className="flex justify-between items-center bg-muted/30 p-3 rounded-xl border border-border">
            <div>
              <span className="text-[10px] text-muted-foreground block">Estado de la reserva</span>
              <Badge variant="outline" className={STATUS_BADGE_CLASS[reservation.estado]}>
                {STATUS_LABELS[reservation.estado]}
              </Badge>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block">Estado de pago</span>
              <span className="font-semibold text-foreground">{paymentStatusLabel}</span>
            </div>
          </div>

          {/* Cancha */}
          <div className="space-y-1">
            <span className="text-muted-foreground block text-[11px]">Cancha</span>
            <p className="text-sm font-bold text-foreground">{reservation.cancha}</p>
          </div>

          {/* Fecha y horario */}
          <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
            <div>
              <span className="text-muted-foreground block text-[11px]">Fecha</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-primary" aria-hidden="true" />{' '}
                {reservation.fecha}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Horario</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-primary" aria-hidden="true" />{' '}
                {reservation.horaInicio} – {reservation.horaFin}
              </span>
            </div>
          </div>

          {/* Método de pago */}
          <div className="border-t border-border pt-3">
            <span className="text-muted-foreground block text-[11px]">Método de Pago</span>
            <span className="font-semibold text-foreground flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-primary" aria-hidden="true" /> {paymentLabel}
            </span>
          </div>

          {/* Titular */}
          <div className="border-t border-border pt-3 space-y-1">
            <span className="text-muted-foreground block text-[11px]">Titular de la Reserva</span>
            <div className="flex items-center gap-2 text-foreground font-medium">
              <User className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
              <span>{reservation.cliente}</span>
            </div>
          </div>

          {/* Observaciones */}
          {reservation.observaciones && (
            <div className="border-t border-border pt-3">
              <span className="text-muted-foreground block text-[11px]">Observaciones</span>
              <p className="text-foreground">{reservation.observaciones}</p>
            </div>
          )}

          {/* Reprogramaciones */}
          {reservation.scheduleChanges && reservation.scheduleChanges.length > 0 && (
            <div className="border-t border-border pt-3">
              <span className="text-muted-foreground block text-[11px] mb-1.5">
                Reprogramaciones ({reservation.scheduleChanges.length})
              </span>
              <div className="space-y-2">
                {reservation.scheduleChanges.map((change) => (
                  <div
                    key={`${change.changedAt}-${change.previousDate}-${change.previousStartTime}-${change.newDate}-${change.newStartTime}`}
                    className="p-2.5 bg-muted/20 rounded-lg text-[11px] space-y-1"
                  >
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {change.previousDate} {change.previousStartTime}–{change.previousEndTime}
                      </span>
                      <span className="font-semibold">→</span>
                      <span>
                        {change.newDate} {change.newStartTime}–{change.newEndTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      {change.surchargePaymentStatus === 'PAGADO' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" aria-hidden="true" />
                      ) : (
                        <XCircle className="w-3 h-3 text-amber-500" aria-hidden="true" />
                      )}
                      Recargo S/ {change.surcharge.toFixed(2)} ·{' '}
                      {change.surchargePaymentStatus === 'PAGADO' ? 'Pagado' : 'Pendiente'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border pt-3 flex justify-between items-center text-sm font-bold">
            <span>Importe Total</span>
            <span className="text-lg text-primary">S/ {reservation.monto.toFixed(2)}</span>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-muted/20 text-right">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
