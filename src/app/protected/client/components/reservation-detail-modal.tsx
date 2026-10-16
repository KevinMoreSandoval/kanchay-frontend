import React from 'react';
import { X, Calendar, MapPin, CreditCard, User } from 'lucide-react';
import { Reservation } from '@/types';
import { Button, Badge } from '@/components/ui';

interface ReservationDetailModalProps {
  reservation: Reservation;
  onClose: () => void;
}

export const ReservationDetailModal: React.FC<ReservationDetailModalProps> = ({
  reservation,
  onClose,
}) => {
  const resData = reservation as unknown as Record<string, unknown>;
  const code = String(resData.code || resData.id || 'CY-RES01');
  const courtName = String(
    resData.courtName || (resData.court as Record<string, unknown>)?.name || 'Cancha Principal'
  );
  const establishmentName = String(resData.establishmentName || 'Sede San Miguel');
  const location = String(resData.location || 'Av. La Marina 2345');
  const status = String(resData.status || 'PENDIENTE');
  const paymentStatus = String(resData.paymentStatus || 'PENDIENTE');
  const paymentMethod = String(resData.paymentMethod || 'YAPE_PLIN');
  const reservationDate = String(resData.date || '');
  const totalAmount = Number(resData.totalAmount ?? resData.totalPrice ?? 0);
  const timeSlots = (resData.timeSlots as Array<Record<string, unknown>>) || [];

  const holderInfo = (resData.holderInfo as Record<string, string>) || {};
  const holderName = holderInfo.fullName || 'Cliente CanchaYa';
  const holderEmail = holderInfo.email || 'cliente@ejemplo.com';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-background border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl transition-all animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground">Detalle de Reserva</h2>
            <p className="text-xs font-mono text-muted-foreground">{code}</p>
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
          <div className="flex justify-between items-center bg-muted/30 p-3 rounded-xl border border-border">
            <div>
              <span className="text-[10px] text-muted-foreground block">Estado de la reserva</span>
              <span className="font-bold text-foreground">{status}</span>
            </div>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              {paymentStatus}
            </Badge>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground block text-[11px]">
              Cancha y Establecimiento
            </span>
            <p className="text-sm font-bold text-foreground">{courtName}</p>
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" aria-hidden="true" /> {establishmentName} - {location}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
            <div>
              <span className="text-muted-foreground block text-[11px]">Fecha</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-primary" aria-hidden="true" />{' '}
                {reservationDate}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Método de Pago</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-primary" aria-hidden="true" />{' '}
                {paymentMethod}
              </span>
            </div>
          </div>

          {/* Titular */}
          <div className="border-t border-border pt-3 space-y-1">
            <span className="text-muted-foreground block text-[11px]">Titular de la Reserva</span>
            <div className="flex items-center gap-2 text-foreground font-medium">
              <User className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
              <span>
                {holderName} ({holderEmail})
              </span>
            </div>
          </div>

          {/* Horarios */}
          <div className="border-t border-border pt-3">
            <span className="text-muted-foreground block text-[11px] mb-1.5">
              Horarios contratados
            </span>
            <div className="space-y-1">
              {timeSlots.map((slot, index) => {
                const startTime = String(slot.startTime || '');
                const endTime = String(slot.endTime || '');
                const price = Number(slot.price || 0);

                return (
                  <div
                    key={`${startTime}-${endTime}-${index}`}
                    className="flex justify-between p-2 bg-muted/20 rounded-lg"
                  >
                    <span>
                      {startTime} - {endTime}
                    </span>
                    <span className="font-bold">S/ {price.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border pt-3 flex justify-between items-center text-sm font-bold">
            <span>Importe Total</span>
            <span className="text-lg text-primary">S/ {totalAmount.toFixed(2)}</span>
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
