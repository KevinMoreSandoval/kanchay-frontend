import { Button, Input, Label, Select } from '@/components/ui';
import { getReservationPermissions } from '@/services/reservation-service';
import { methodLabels, money } from '@/lib/reservation-labels';
import type { ReceptionManagement } from '@/app/protected/recepcionist/hooks/use-reception';
import type { PaymentMethod } from '@/types';

export function AccionesReserva({ management: m }: { management: ReceptionManagement }) {
  const row = m.selected;
  if (!row) return null;
  const p = getReservationPermissions(row, m.now);
  return (
    <section className="space-y-4 border-t border-border pt-4">
      <h3 className="font-bold">Acciones operativas</h3>
      <div className="flex flex-wrap gap-2">
        {p.confirm && (
          <Button disabled={m.busy} onClick={() => m.confirm(row.id)}>
            Confirmar reserva
          </Button>
        )}
        {p.attendance && (
          <Button disabled={m.busy} onClick={() => m.attendance(row.id)}>
            Registrar llegada
          </Button>
        )}
        {p.pay && (
          <Button variant="outline" onClick={() => m.beginOperation('pay')}>
            Registrar pago
          </Button>
        )}
        {p.reschedule && (
          <Button variant="outline" onClick={() => m.beginOperation('reschedule')}>
            Reprogramar
          </Button>
        )}
        {p.cancel && (
          <Button variant="destructive" onClick={() => m.beginOperation('cancel')}>
            Cancelar reserva
          </Button>
        )}
        {p.refund && (
          <Button variant="outline" disabled={m.busy} onClick={m.refund}>
            Registrar reembolso
          </Button>
        )}
      </div>
      {row.estado === 'CONFIRMADA' && !p.attendance && (
        <p className="text-sm text-muted-foreground">{p.attendanceReason}</p>
      )}
      {p.reschedule && !p.cancel && (
        <p className="text-sm text-muted-foreground">
          No se puede cancelar: faltan menos de 2 horas para el inicio.
        </p>
      )}
      {p.confirm && (
        <p className="text-sm text-muted-foreground">
          Confirma dentro de los primeros 15 minutos desde la creación.
        </p>
      )}
      {m.operation === 'cancel' && p.cancel && (
        <div className="space-y-3 rounded-lg border border-border p-4">
          <p>¿Confirmas la cancelación? Si el pago está registrado, quedará por reembolsar.</p>
          <Button variant="destructive" disabled={m.busy} onClick={m.cancel}>
            Confirmar cancelación
          </Button>
          <Button className="ml-2" variant="outline" onClick={() => m.setOperation(null)}>
            Volver
          </Button>
        </div>
      )}
      {m.operation === 'pay' && p.pay && (
        <form
          className="space-y-3 rounded-lg border border-border p-4"
          onSubmit={(e) => {
            e.preventDefault();
            m.pay();
          }}
        >
          <p>Pago base: {money(row.monto)}. Los recargos se cobran por separado.</p>
          <Label htmlFor="payment-method">Método del pago recibido</Label>
          <Select
            id="payment-method"
            value={m.paymentMethod}
            onChange={(e) => m.setPaymentMethod(e.target.value as PaymentMethod)}
          >
            {Object.entries(methodLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Button type="submit" disabled={m.busy}>
            Confirmar pago recibido
          </Button>
        </form>
      )}
      {m.operation === 'reschedule' && p.reschedule && (
        <form
          className="space-y-4 rounded-lg border border-border p-4"
          onSubmit={(e) => {
            e.preventDefault();
            m.reschedule();
          }}
        >
          <p className="text-sm">
            Cada cambio genera un recargo de {money(row.monto * 0.15)} (15% del monto base). El pago
            base se conserva.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="reschedule-date">Nueva fecha</Label>
              <Input
                id="reschedule-date"
                type="date"
                required
                value={m.schedule.date}
                onChange={(e) =>
                  m.setSchedule((previous) => ({ ...previous, date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reschedule-start">Inicio</Label>
              <Input
                id="reschedule-start"
                type="time"
                required
                value={m.schedule.startTime}
                onChange={(e) =>
                  m.setSchedule((previous) => ({ ...previous, startTime: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reschedule-end">Fin</Label>
              <Input
                id="reschedule-end"
                type="time"
                required
                value={m.schedule.endTime}
                onChange={(e) =>
                  m.setSchedule((previous) => ({ ...previous, endTime: e.target.value }))
                }
              />
            </div>
          </div>
          <Button type="submit" disabled={m.busy}>
            Guardar reprogramación
          </Button>
        </form>
      )}
    </section>
  );
}
