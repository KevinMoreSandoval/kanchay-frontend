import { ClipboardList } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import type { Reservation, ReservationStatus } from '@/types';

export interface ReservationsTableProps {
  rows: Reservation[];
  emptyTitle: string;
  emptyMessage: string;
  caption?: string;
}

const statusConfig: Record<ReservationStatus, { label: string; variant: BadgeProps['variant'] }> = {
  PENDIENTE: { label: 'Pendiente', variant: 'warning' },
  CONFIRMADA: { label: 'Confirmada', variant: 'success' },
  EN_CURSO: { label: 'En curso', variant: 'info' },
  FINALIZADA: { label: 'Finalizada', variant: 'secondary' },
  NO_ASISTIO: { label: 'No asistió', variant: 'destructive' },
  CANCELADA: { label: 'Cancelada', variant: 'outline' },
};

export function ReservationsTable({
  rows,
  emptyTitle,
  emptyMessage,
  caption,
}: ReservationsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-border bg-muted/20">
        <ClipboardList
          className="h-10 w-10 text-muted-foreground/50 mb-3"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <h4 className="text-sm font-semibold text-foreground">{emptyTitle}</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <Table>
        {caption && <caption className="sr-only">{caption}</caption>}
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Cancha</TableHead>
            <TableHead>Horario</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const status = statusConfig[row.estado] || { label: row.estado, variant: 'secondary' };

            return (
              <TableRow key={row.id}>
                <TableCell className="font-semibold text-foreground">{row.cliente}</TableCell>
                <TableCell className="text-muted-foreground">{row.cancha}</TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">
                  {row.horaInicio} – {row.horaFin}
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell className="text-right font-semibold text-foreground">
                  S/ {row.monto.toFixed(2)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
