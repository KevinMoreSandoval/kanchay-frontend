import { Badge, Button, Card } from '@/components/ui';
import { getReservationPermissions } from '@/services/reservation-service';
import { dateLabel, reservationCode, reservationLabels } from '@/lib/reservation-labels';
import type { ReceptionManagement } from '@/app/protected/recepcionist/hooks/use-reception';

export function ControlAsistencia({ management: m }: { management: ReceptionManagement }) {
  const rows = m.attendanceRows;
  return (
    <section className="space-y-3" aria-labelledby="attendance-title">
      <h2 id="attendance-title" className="text-lg font-bold">
        Control de asistencia
      </h2>
      {!rows.length && (
        <Card className="p-6 text-muted-foreground">
          No hay reservas confirmadas para registrar llegada en esta fecha.
        </Card>
      )}
      <div className="grid gap-3 lg:grid-cols-2">
        {rows.map((row) => {
          const permissions = getReservationPermissions(row, m.now);
          return (
            <Card key={row.id} className="space-y-3 p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <strong>{reservationCode(row.id)}</strong>
                <Badge variant="outline">{reservationLabels[row.estado]}</Badge>
              </div>
              <p className="break-words">
                {row.cliente} · {row.cancha}
              </p>
              <p className="text-sm">
                {dateLabel(row.fecha)} · {row.horaInicio}–{row.horaFin}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={!permissions.attendance || m.busy}
                  onClick={() => m.attendance(row.id)}
                  aria-describedby={!permissions.attendance ? `attendance-${row.id}` : undefined}
                >
                  Registrar llegada
                </Button>
                <Button variant="outline" onClick={() => m.openDetail(row.id)}>
                  Ver detalle
                </Button>
              </div>
              {!permissions.attendance && (
                <p id={`attendance-${row.id}`} className="text-sm text-muted-foreground">
                  {permissions.attendanceReason}
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
