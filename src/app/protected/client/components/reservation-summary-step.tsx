import React from 'react';
import { CheckCircle2, Calendar, MapPin, CreditCard, ArrowRight, Home } from 'lucide-react';
import { Reservation } from '@/types';
import { Button, Card, Badge } from '@/components/ui';

interface ReservationSummaryStepProps {
  reservation: Reservation;
  onGoHome: () => void;
  onGoMyReservations: () => void;
}

export const ReservationSummaryStep: React.FC<ReservationSummaryStepProps> = ({
  reservation,
  onGoHome,
  onGoMyReservations,
}) => {
  // Conversión segura de tipos
  const resData = reservation as unknown as Record<string, unknown>;
  const code = String(resData.code || resData.id || 'CY-RES01');
  const courtName = String(
    resData.courtName || (resData.court as Record<string, unknown>)?.name || 'Cancha Principal'
  );
  const sportType = String(resData.sportType || resData.sport || 'Fútbol');
  const establishmentName = String(resData.establishmentName || 'Sede San Miguel');
  const location = String(resData.location || 'Av. La Marina 2345');
  const reservationDate = String(resData.date || '');
  const paymentMethod = String(resData.paymentMethod || '');
  const timeSlots = (resData.timeSlots as Array<Record<string, unknown>>) || [];
  const totalAmount = Number(resData.totalAmount ?? resData.totalPrice ?? 0);

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in">
      {/* Header Banner Exitoso */}
      <Card className="p-6 text-center space-y-3 bg-emerald-500/10 border-emerald-500/20">
        <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-black text-foreground">¡Reserva Registrada con Éxito!</h1>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Tu solicitud se procesó correctamente. Preséntate en el establecimiento 10 minutos antes
          de tu turno.
        </p>
        <div className="pt-2">
          <Badge className="bg-slate-900 text-white text-xs px-4 py-1.5 rounded-full font-mono">
            Código: {code}
          </Badge>
        </div>
      </Card>

      {/* Ficha Detallada */}
      <Card className="p-5 border-border space-y-5">
        <h2 className="text-sm font-bold text-foreground border-b border-border pb-3">
          Detalle de la Reserva
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground block text-[11px]">Cancha</span>
            <span className="font-bold text-foreground text-sm block">{courtName}</span>
            <span className="text-muted-foreground">{sportType}</span>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground block text-[11px]">
              Establecimiento y Ubicación
            </span>
            <span className="font-bold text-foreground block">{establishmentName}</span>
            <span className="text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" aria-hidden="true" /> {location}
            </span>
          </div>

          <div className="space-y-1 border-t border-border pt-3">
            <span className="text-muted-foreground block text-[11px]">Fecha reservada</span>
            <span className="font-bold text-foreground flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" aria-hidden="true" /> {reservationDate}
            </span>
          </div>

          <div className="space-y-1 border-t border-border pt-3">
            <span className="text-muted-foreground block text-[11px]">Método de Pago</span>
            <span className="font-bold text-foreground flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-primary" aria-hidden="true" /> {paymentMethod}
            </span>
          </div>
        </div>

        {/* Desglose de Horarios */}
        <div className="border-t border-border pt-3">
          <span className="text-xs font-semibold text-muted-foreground block mb-2">
            Horarios Reservados
          </span>
          <div className="space-y-1.5">
            {timeSlots.map((slot, index) => {
              const startTime = String(slot.startTime || '');
              const endTime = String(slot.endTime || '');
              const price = Number(slot.price || 0);

              return (
                <div
                  key={`${startTime}-${endTime}-${index}`}
                  className="flex justify-between text-xs p-2 bg-muted/30 rounded-lg"
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

        {/* Total */}
        <div className="border-t border-border pt-3 flex justify-between items-center">
          <span className="text-sm font-bold text-foreground">Importe Total</span>
          <span className="text-xl font-extrabold text-primary">S/ {totalAmount.toFixed(2)}</span>
        </div>
      </Card>

      {/* Botones de Navegación */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={onGoHome} className="flex-1 h-11 rounded-xl">
          <Home className="w-4 h-4 mr-2" aria-hidden="true" /> Volver al Inicio
        </Button>
        <Button
          onClick={onGoMyReservations}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-xl"
        >
          Ir a Mis Reservas <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
};
