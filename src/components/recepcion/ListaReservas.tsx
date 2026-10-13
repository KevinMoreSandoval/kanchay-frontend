import {
  Badge,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import type { Reservation } from '@/types';
import {
  dateLabel,
  money,
  paymentLabels,
  reservationCode,
  reservationLabels,
} from '@/lib/reservation-labels';

export function ListaReservas({
  rows,
  onDetail,
  emptyMessage = 'No hay reservas que coincidan con los filtros.',
}: {
  rows: Reservation[];
  onDetail: (id: number) => void;
  emptyMessage?: string;
}) {
  if (!rows.length)
    return <Card className="p-6 text-center text-muted-foreground">{emptyMessage}</Card>;
  return (
    <>
      <div className="space-y-3 xl:hidden">
        {rows.map((row) => (
          <Card key={row.id} className="space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong>{reservationCode(row.id)}</strong>
              <Badge variant="outline">{reservationLabels[row.estado]}</Badge>
            </div>
            <p className="break-words font-semibold">{row.cliente}</p>
            <p className="break-words text-sm">{row.cancha}</p>
            <p className="text-sm">
              {dateLabel(row.fecha)} · {row.horaInicio}–{row.horaFin}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm">
                Pago: {paymentLabels[row.paymentStatus ?? 'PENDIENTE']} · {money(row.monto)}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDetail(row.id)}
                aria-label={`Ver detalle de ${reservationCode(row.id)}`}
              >
                Ver detalle
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <div className="hidden xl:block">
        <Table>
          <caption className="sr-only">Reservas y acciones operativas</caption>
          <TableHeader>
            <TableRow>
              {[
                'Código',
                'Cliente / cancha',
                'Fecha / horario',
                'Estado',
                'Pago',
                'Monto',
                'Acciones',
              ].map((label) => (
                <TableHead key={label}>{label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{reservationCode(row.id)}</TableCell>
                <TableCell className="max-w-64 whitespace-normal break-words">
                  <strong>{row.cliente}</strong>
                  <p className="text-muted-foreground">{row.cancha}</p>
                </TableCell>
                <TableCell>
                  {dateLabel(row.fecha)}
                  <p>
                    {row.horaInicio}–{row.horaFin}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{reservationLabels[row.estado]}</Badge>
                </TableCell>
                <TableCell>{paymentLabels[row.paymentStatus ?? 'PENDIENTE']}</TableCell>
                <TableCell>{money(row.monto)}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDetail(row.id)}
                    aria-label={`Ver detalle de ${reservationCode(row.id)}`}
                  >
                    Ver detalle
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
