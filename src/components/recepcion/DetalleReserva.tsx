import { Badge, Button, Modal } from '@/components/ui';
import {
  dateLabel,
  methodLabels,
  money,
  paymentLabels,
  reservationCode,
  reservationLabels,
} from '@/lib/reservation-labels';
import type { ReceptionManagement } from '@/app/protected/recepcionist/hooks/use-reception';
import { AccionesReserva } from './AccionesReserva';

export function DetalleReserva({ management: m }: { management: ReceptionManagement }) {
  const row = m.selected;
  if (!row) return null;
  return (
    <Modal title={`Detalle ${reservationCode(row.id)}`} onClose={m.closeDetail}>
      <div className="space-y-5">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          {[
            ['Cliente', row.cliente],
            ['Cancha', row.cancha],
            ['Fecha', dateLabel(row.fecha)],
            ['Horario', `${row.horaInicio}–${row.horaFin}`],
            ['Estado', reservationLabels[row.estado]],
            ['Monto base', money(row.monto)],
            [
              'Método de pago',
              row.paymentMethod ? methodLabels[row.paymentMethod] : 'Sin método registrado',
            ],
            ['Estado de pago', paymentLabels[row.paymentStatus ?? 'PENDIENTE']],
            [
              'Creada',
              row.createdAt
                ? new Date(row.createdAt).toLocaleString('es-PE')
                : 'Sin fecha registrada',
            ],
            [
              'Llegada',
              row.attendedAt
                ? new Date(row.attendedAt).toLocaleString('es-PE')
                : 'Sin llegada registrada',
            ],
            [
              'Cancelada',
              row.canceledAt ? new Date(row.canceledAt).toLocaleString('es-PE') : 'No cancelada',
            ],
            ['Observaciones', row.observaciones || 'Sin observaciones'],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="mt-1 break-words font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <section className="space-y-3">
          <h3 className="font-bold">Historial de reprogramaciones</h3>
          {!row.scheduleChanges?.length && (
            <p className="text-sm text-muted-foreground">No hay reprogramaciones.</p>
          )}
          {row.scheduleChanges?.map((change, index) => (
            <div
              key={`${change.changedAt}-${change.previousDate}-${change.previousStartTime}-${change.newDate}-${change.newStartTime}`}
              className="space-y-2 rounded-lg border border-border p-3 text-sm"
            >
              <p>Cambio: {new Date(change.changedAt).toLocaleString('es-PE')}</p>
              <p>
                Anterior: {dateLabel(change.previousDate)} · {change.previousStartTime}–
                {change.previousEndTime}
              </p>
              <p>
                Nuevo: {dateLabel(change.newDate)} · {change.newStartTime}–{change.newEndTime}
              </p>
              <p>
                Recargo: {money(change.surcharge)}{' '}
                <Badge variant="outline">{paymentLabels[change.surchargePaymentStatus]}</Badge>
              </p>
              {m.section !== 'Clientes' &&
                change.surchargePaymentStatus === 'PENDIENTE' &&
                row.estado !== 'CANCELADA' && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={m.busy}
                    onClick={() => m.paySurcharge(index)}
                  >
                    Registrar pago de recargo
                  </Button>
                )}
            </div>
          ))}
        </section>
        {m.section !== 'Clientes' && <AccionesReserva management={m} />}
        {m.error && (
          <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {m.error}
          </p>
        )}
        {m.feedback && (
          <p role="status" className="rounded-lg bg-primary/10 p-3 text-sm text-primary">
            {m.feedback}
          </p>
        )}
      </div>
    </Modal>
  );
}
