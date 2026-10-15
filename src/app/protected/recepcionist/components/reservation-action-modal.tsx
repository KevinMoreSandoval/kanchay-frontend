import { createPortal } from 'react-dom';
import { CalendarClock, X } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormField,
  Input,
} from '@/components/ui';
import type { useReceptionReservationActions } from '../hooks/use-reception-reservation-actions';

type Actions = ReturnType<typeof useReceptionReservationActions>;
export function ReservationActionModal({ dialogRef, ...actions }: Actions) {
  const selected = actions.selection;
  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="reservation-action-title"
      aria-describedby="reservation-action-description"
      onCancel={(event) => {
        event.preventDefault();
        actions.close();
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-foreground backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <Card className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl shadow-2xl">
          <CardHeader className="shrink-0 flex-row items-start justify-between gap-4 border-b border-border bg-muted/20">
            <div className="space-y-2">
              <CardTitle id="reservation-action-title">
                {selected?.action.label ?? 'Gestionar reserva'}
              </CardTitle>
              <CardDescription id="reservation-action-description">
                Revisa los datos antes de aplicar la acción.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Cerrar acción de reserva"
              onClick={actions.close}
            >
              <X aria-hidden="true" />
            </Button>
          </CardHeader>
          {selected && (
            <CardContent className="flex min-h-0 flex-1 flex-col p-0">
              <form onSubmit={actions.submit} className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
                  <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-xs text-muted-foreground">
                      Reserva #{selected.reservation.id}
                    </p>
                    <p className="font-bold">{selected.reservation.cliente}</p>
                    <p className="text-sm">{selected.reservation.cancha}</p>
                    <p className="text-sm text-muted-foreground">
                      {selected.reservation.fecha.split('-').reverse().join('/')} ·{' '}
                      {selected.reservation.horaInicio}–{selected.reservation.horaFin}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        Base: S/ {selected.reservation.monto.toFixed(2)}
                      </Badge>
                      <Badge variant="secondary">
                        {
                          {
                            PENDIENTE: 'Pago pendiente',
                            PAGADO: 'Pagado',
                            POR_REEMBOLSAR: 'Por reembolsar',
                            REEMBOLSADO: 'Reembolsado',
                          }[selected.reservation.paymentStatus ?? 'PENDIENTE']
                        }
                      </Badge>
                    </div>
                  </div>
                  {selected.action.type === 'reschedule' && (
                    <>
                      <p className="flex items-start gap-2 rounded-lg bg-primary/5 p-3 text-sm">
                        <CalendarClock
                          aria-hidden="true"
                          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        />
                        <span>
                          Recargo del 15%:{' '}
                          <strong>
                            S/ {(Math.round(selected.reservation.monto * 15) / 100).toFixed(2)}
                          </strong>
                          . Se registra por separado, con cobro pendiente. El horario anterior se
                          conserva en el historial.
                        </span>
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          id="reception-reschedule-date"
                          label="Nueva fecha"
                          required
                          className="sm:col-span-2"
                        >
                          <Input
                            id="reception-reschedule-date"
                            type="date"
                            required
                            value={actions.schedule.date}
                            onChange={(event) =>
                              actions.setSchedule((value) => ({
                                ...value,
                                date: event.target.value,
                              }))
                            }
                          />
                        </FormField>
                        <FormField id="reception-reschedule-start" label="Hora de inicio" required>
                          <Input
                            id="reception-reschedule-start"
                            type="time"
                            required
                            value={actions.schedule.startTime}
                            onChange={(event) =>
                              actions.setSchedule((value) => ({
                                ...value,
                                startTime: event.target.value,
                              }))
                            }
                          />
                        </FormField>
                        <FormField id="reception-reschedule-end" label="Hora de fin" required>
                          <Input
                            id="reception-reschedule-end"
                            type="time"
                            required
                            value={actions.schedule.endTime}
                            onChange={(event) =>
                              actions.setSchedule((value) => ({
                                ...value,
                                endTime: event.target.value,
                              }))
                            }
                          />
                        </FormField>
                      </div>
                    </>
                  )}
                  {selected.action.type === 'cancel' && (
                    <p className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm">
                      La cancelación es definitiva.{' '}
                      {selected.reservation.paymentStatus === 'PAGADO'
                        ? 'El pago quedará por reembolsar; deberás completar el reembolso en una acción posterior.'
                        : 'La reserva dejará de ocupar el horario seleccionado.'}
                    </p>
                  )}
                  {selected.action.type === 'confirm' && (
                    <p className="text-sm text-muted-foreground">
                      La reserva pasará a confirmada. Esta acción debe realizarse dentro de los
                      primeros 15 minutos desde su creación.
                    </p>
                  )}
                  {selected.action.type === 'attendance' && (
                    <p className="text-sm text-muted-foreground">
                      Se registrará la asistencia del cliente y la reserva pasará a en curso.
                    </p>
                  )}
                  {selected.action.type === 'pay' && (
                    <p className="text-sm text-muted-foreground">
                      Registra el pago base de S/ {selected.reservation.monto.toFixed(2)} solo
                      después de recibirlo. Los recargos se cobran por separado.
                    </p>
                  )}
                  {selected.action.type === 'refund' && (
                    <p className="text-sm text-muted-foreground">
                      Marca el reembolso como completado solo después de devolver S/{' '}
                      {selected.reservation.monto.toFixed(2)} al cliente.
                    </p>
                  )}
                  {selected.action.type === 'surcharge' && (
                    <p className="text-sm text-muted-foreground">
                      Registra el cobro de este recargo solo después de recibirlo. El pago base no
                      se modificará.
                    </p>
                  )}
                  {actions.error && (
                    <p
                      role="alert"
                      className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
                    >
                      {actions.error}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-muted/20 px-6 py-4 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={actions.close}>
                    Volver
                  </Button>
                  <Button
                    type="submit"
                    variant={selected.action.type === 'cancel' ? 'destructive' : 'default'}
                  >
                    Aplicar acción
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>
      </div>
    </dialog>,
    document.body
  );
}
