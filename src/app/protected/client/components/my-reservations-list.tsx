import React, { useState } from 'react';
import { Calendar, MapPin, Eye, ArrowRight, Ticket } from 'lucide-react';
import { Reservation } from '@/types';
import { Button, Card, Badge } from '@/components/ui';
import { ReservationDetailModal } from './reservation-detail-modal';

interface MyReservationsListProps {
  reservations: Reservation[];
  onExploreCourts: () => void;
}

export const MyReservationsList: React.FC<MyReservationsListProps> = ({
  reservations,
  onExploreCourts,
}) => {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  if (reservations.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 border border-border rounded-2xl bg-card space-y-4">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
          <Ticket className="w-8 h-8" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Aún no tienes reservas</h2>
        <p className="text-xs text-muted-foreground">
          Explora las canchas disponibles y realiza tu primera reserva deportiva.
        </p>
        <Button
          onClick={onExploreCourts}
          className="bg-primary text-primary-foreground rounded-xl px-6 gap-2"
        >
          Explorar Canchas <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground">Mis Reservas</h1>
        <p className="text-xs text-muted-foreground">
          Consulta y gestiona el historial de tus canchas reservadas
        </p>
      </div>

      {/* Listado de Reservas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reservations.map((res) => {
          const resData = res as unknown as Record<string, unknown>;
          const code = String(resData.code || resData.id || 'CY-RES01');
          const courtName = String(
            resData.courtName ||
              (resData.court as Record<string, unknown>)?.name ||
              'Cancha Principal'
          );
          const establishmentName = String(resData.establishmentName || 'Sede San Miguel');
          const status = String(resData.status || 'PENDIENTE');
          const reservationDate = String(resData.date || '');
          const totalAmount = Number(resData.totalAmount ?? resData.totalPrice ?? 0);
          const timeSlots = (resData.timeSlots as Array<Record<string, unknown>>) || [];

          return (
            <Card
              key={res.id}
              className="p-5 border-border hover:border-primary/40 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                      {code}
                    </span>
                    <h3 className="text-base font-bold text-foreground">{courtName}</h3>
                  </div>
                  <Badge variant="outline" className={getStatusBadgeClass(status)}>
                    {status}
                  </Badge>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5 font-medium text-foreground">
                    <Calendar className="w-3.5 h-3.5 text-primary" aria-hidden="true" />{' '}
                    {reservationDate} ({timeSlots.length} turno/s)
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> {establishmentName}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Importe</span>
                  <span className="text-base font-extrabold text-primary">
                    S/ {totalAmount.toFixed(2)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedReservation(res)}
                  className="rounded-xl text-xs gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" aria-hidden="true" /> Ver detalle
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal de Detalle */}
      {selectedReservation && (
        <ReservationDetailModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </div>
  );
};

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'PENDIENTE':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'CONFIRMADA':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'CANCELADA':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}
