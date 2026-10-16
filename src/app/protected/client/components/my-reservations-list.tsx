import React, { useState } from 'react';
import { Calendar, Clock, Eye, ArrowRight, Ticket } from 'lucide-react';
import type { Reservation, ReservationStatus } from '@/types';
import { Button, Card, Badge } from '@/components/ui';
import { ReservationDetailModal } from './reservation-detail-modal';

interface MyReservationsListProps {
  reservations: Reservation[];
  onExploreCourts: () => void;
}

const STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  EN_CURSO: 'En curso',
  FINALIZADA: 'Finalizada',
  NO_ASISTIO: 'No asistió',
  CANCELADA: 'Cancelada',
};

function getStatusBadgeClass(status: ReservationStatus): string {
  switch (status) {
    case 'PENDIENTE':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'CONFIRMADA':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'EN_CURSO':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'FINALIZADA':
      return 'bg-slate-50 text-slate-600 border-slate-200';
    case 'NO_ASISTIO':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'CANCELADA':
      return 'bg-rose-50 text-rose-700 border-rose-200';
  }
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
        {reservations.map((res) => (
          <Card
            key={res.id}
            className="p-5 border-border hover:border-primary/40 transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                    #{res.id}
                  </span>
                  <h3 className="text-base font-bold text-foreground">{res.cancha}</h3>
                </div>
                <Badge variant="outline" className={getStatusBadgeClass(res.estado)}>
                  {STATUS_LABELS[res.estado]}
                </Badge>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5 font-medium text-foreground">
                  <Calendar className="w-3.5 h-3.5 text-primary" aria-hidden="true" /> {res.fecha}
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" /> {res.horaInicio} –{' '}
                  {res.horaFin}
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground block">Importe</span>
                <span className="text-base font-extrabold text-primary">
                  S/ {res.monto.toFixed(2)}
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
        ))}
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
