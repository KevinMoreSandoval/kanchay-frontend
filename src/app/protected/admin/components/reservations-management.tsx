import {
  BarChart3,
  CalendarClock,
  CalendarDays,
  Check,
  CircleDollarSign,
  Clock3,
  Download,
  FileText,
  Search,
  X,
} from 'lucide-react';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PaymentMethod, PaymentStatus, Reservation, ReservationStatus } from '@/types';
import { useAdminReservations } from '../hooks/use-admin-reservations';

const STATUS_OPTIONS: {
  value: ReservationStatus;
  label: string;
  variant: BadgeProps['variant'];
}[] = [
  { value: 'PENDIENTE', label: 'Pendiente', variant: 'warning' },
  { value: 'CONFIRMADA', label: 'Confirmada', variant: 'success' },
  { value: 'EN_CURSO', label: 'En curso', variant: 'info' },
  { value: 'FINALIZADA', label: 'Finalizada', variant: 'secondary' },
  { value: 'NO_ASISTIO', label: 'No asistió', variant: 'destructive' },
  { value: 'CANCELADA', label: 'Cancelada', variant: 'outline' },
];

const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'PAGADO', label: 'Pagado' },
  { value: 'POR_REEMBOLSAR', label: 'Por reembolsar' },
  { value: 'REEMBOLSADO', label: 'Reembolsado' },
];

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
  TRANSFERENCIA: 'Transferencia',
  YAPE_PLIN: 'Yape / Plin',
};

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

function getStatus(status: ReservationStatus) {
  return STATUS_OPTIONS.find((option) => option.value === status) ?? STATUS_OPTIONS[0];
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const appearance: Record<PaymentStatus, { variant: BadgeProps['variant']; label: string }> = {
    PENDIENTE: { variant: 'warning', label: 'Pendiente' },
    PAGADO: { variant: 'success', label: 'Pagado' },
    POR_REEMBOLSAR: { variant: 'purple', label: 'Por reembolsar' },
    REEMBOLSADO: { variant: 'secondary', label: 'Reembolsado' },
  };
  const config = appearance[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function ReservationActions({
  reservation,
  management,
}: {
  reservation: Reservation;
  management: ReturnType<typeof useAdminReservations>;
}) {
  const paymentStatus = reservation.paymentStatus ?? 'PENDIENTE';
  const hasPaymentMethod = Boolean(reservation.paymentMethod);

  return (
    <div className="flex min-w-52 flex-wrap justify-end gap-1.5">
      {reservation.estado === 'PENDIENTE' && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => management.confirm(reservation.id)}
        >
          <Check aria-hidden="true" />
          Confirmar
        </Button>
      )}
      {management.canMarkAttendance(reservation) && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => management.markAttendance(reservation.id)}
        >
          <Check aria-hidden="true" />
          Marcar asistencia
        </Button>
      )}
      {['PENDIENTE', 'CONFIRMADA'].includes(reservation.estado) && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => management.openReschedule(reservation)}
        >
          <CalendarClock aria-hidden="true" />
          Reprogramar
        </Button>
      )}
      {management.canCancel(reservation) && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => management.setCancelConfirmationId(reservation.id)}
        >
          Cancelar
        </Button>
      )}
      {paymentStatus === 'PENDIENTE' && hasPaymentMethod && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => management.updatePayment(reservation.id, 'PAGADO')}
        >
          Registrar pago
        </Button>
      )}
      {paymentStatus === 'POR_REEMBOLSAR' && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => management.updatePayment(reservation.id, 'REEMBOLSADO')}
        >
          Marcar reembolsado
        </Button>
      )}
    </div>
  );
}

export function ReservationsManagement() {
  const management = useAdminReservations();
  const chartMax = Math.max(1, ...management.chartData.map((item) => item.count));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Reservas</CardTitle>
              <CardDescription>
                Administra estados, asistencia, pagos y cambios de horario.
              </CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={management.showPdfComingSoon}>
              <Download aria-hidden="true" />
              Exportar PDF
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Mostrando {management.reservations.length} de {management.totalReservations} reservas
            </p>
            {management.feedback && (
              <p role="status" className="text-sm font-medium text-primary">
                {management.feedback}
              </p>
            )}
            {management.error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {management.error}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <FormField id="admin-reservation-search" label="Buscar cliente o cancha">
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="admin-reservation-search"
                  type="search"
                  value={management.search}
                  onChange={(event) => management.setSearch(event.target.value)}
                  placeholder="Nombre del cliente o cancha"
                  className="pl-9"
                />
              </div>
            </FormField>
            <FormField id="admin-reservation-status" label="Estado de reserva">
              <select
                id="admin-reservation-status"
                value={management.statusFilter}
                onChange={(event) =>
                  management.setStatusFilter(event.target.value as ReservationStatus | 'TODOS')
                }
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="TODOS">Todos los estados</option>
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField id="admin-payment-method" label="Método de pago">
              <select
                id="admin-payment-method"
                value={management.paymentMethodFilter}
                onChange={(event) =>
                  management.setPaymentMethodFilter(event.target.value as PaymentMethod | 'TODOS')
                }
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="TODOS">Todos los métodos</option>
                {management.paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {PAYMENT_METHOD_LABELS[method]}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField id="admin-payment-status" label="Estado del pago">
              <select
                id="admin-payment-status"
                value={management.paymentStatusFilter}
                onChange={(event) =>
                  management.setPaymentStatusFilter(event.target.value as PaymentStatus | 'TODOS')
                }
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="TODOS">Todos los pagos</option>
                {PAYMENT_STATUS_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField id="admin-reservation-date-from" label="Desde">
              <Input
                id="admin-reservation-date-from"
                type="date"
                value={management.dateFrom}
                onChange={(event) => management.setDateFrom(event.target.value)}
              />
            </FormField>
            <FormField id="admin-reservation-date-to" label="Hasta">
              <Input
                id="admin-reservation-date-to"
                type="date"
                value={management.dateTo}
                onChange={(event) => management.setDateTo(event.target.value)}
              />
            </FormField>
          </div>

          {management.reservations.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center">
              <CalendarDays
                aria-hidden="true"
                className="mb-3 h-10 w-10 text-muted-foreground/60"
              />
              <h2 className="text-base font-semibold text-foreground">
                {management.totalReservations
                  ? 'No hay reservas con estos filtros'
                  : 'Aún no hay reservas'}
              </h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {management.totalReservations
                  ? 'Prueba cambiar los filtros para ver otros resultados.'
                  : 'Las reservas creadas por los flujos de cliente y recepción aparecerán aquí.'}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Cancha</TableHead>
                    <TableHead>Fecha y horario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {management.reservations.map((reservation) => {
                    const status = getStatus(reservation.estado);
                    const surchargeTotal = (reservation.scheduleChanges ?? []).reduce(
                      (total, change) => total + change.surcharge,
                      0
                    );
                    const cancelIsConfirming = management.cancelConfirmationId === reservation.id;

                    return (
                      <TableRow key={reservation.id}>
                        <TableCell className="min-w-40">
                          <p className="font-semibold text-foreground">{reservation.cliente}</p>
                          {reservation.observaciones && (
                            <p
                              className="max-w-52 truncate text-xs text-muted-foreground"
                              title={reservation.observaciones}
                            >
                              {reservation.observaciones}
                            </p>
                          )}
                          {(reservation.scheduleChanges?.length ?? 0) > 0 && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-xs font-semibold text-primary">
                                Historial ({reservation.scheduleChanges?.length})
                              </summary>
                              <div className="mt-2 space-y-2">
                                {reservation.scheduleChanges?.map((change, index) => (
                                  <div
                                    key={`${reservation.id}-${change.changedAt}-${change.newDate}-${change.newStartTime}`}
                                    className="space-y-1 rounded-lg border border-border bg-muted/20 p-2 text-xs"
                                  >
                                    <p className="text-muted-foreground">
                                      {formatDate(change.previousDate)} {change.previousStartTime}–
                                      {change.previousEndTime}
                                      {' → '}
                                      {formatDate(change.newDate)} {change.newStartTime}–
                                      {change.newEndTime}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span>Recargo S/ {change.surcharge.toFixed(2)}</span>
                                      <PaymentBadge
                                        status={
                                          change.surchargePaymentStatus === 'PAGADO'
                                            ? 'PAGADO'
                                            : 'PENDIENTE'
                                        }
                                      />
                                      {change.surchargePaymentStatus === 'PENDIENTE' && (
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            management.updateSurchargePayment(reservation.id, index)
                                          }
                                        >
                                          Marcar pagado
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                        </TableCell>
                        <TableCell className="min-w-32 text-muted-foreground">
                          {reservation.cancha}
                        </TableCell>
                        <TableCell className="min-w-36">
                          <p className="font-medium text-foreground">
                            {formatDate(reservation.fecha)}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {reservation.horaInicio}–{reservation.horaFin}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="min-w-36 space-y-1">
                          <PaymentBadge status={reservation.paymentStatus ?? 'PENDIENTE'} />
                          <p className="text-xs text-muted-foreground">
                            {reservation.paymentMethod
                              ? PAYMENT_METHOD_LABELS[reservation.paymentMethod]
                              : 'Método sin registrar'}
                          </p>
                        </TableCell>
                        <TableCell className="min-w-28 text-right">
                          <p className="font-semibold text-foreground">
                            S/ {reservation.monto.toFixed(2)}
                          </p>
                          {surchargeTotal > 0 && (
                            <p className="text-xs text-muted-foreground">
                              + S/ {surchargeTotal.toFixed(2)} recargos
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="min-w-64 text-right">
                          {cancelIsConfirming ? (
                            <div className="flex flex-col items-end gap-2">
                              <span className="text-xs text-muted-foreground">
                                ¿Confirmas cancelar esta reserva?
                              </span>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => management.setCancelConfirmationId(null)}
                                >
                                  Volver
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => management.cancel(reservation.id)}
                                >
                                  Confirmar cancelación
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <ReservationActions reservation={reservation} management={management} />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 aria-hidden="true" className="h-5 w-5 text-primary" />
            <CardTitle>Actividad de reservas</CardTitle>
          </div>
          <CardDescription>
            Reservas por día durante los últimos siete días, según los filtros actuales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {management.chartData.every((item) => item.count === 0) ? (
            <div className="flex items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-sm text-muted-foreground">
              <FileText aria-hidden="true" className="h-5 w-5" />
              No hay actividad en este período con los filtros seleccionados.
            </div>
          ) : (
            <div
              role="img"
              aria-label={`Gráfico de reservas de los últimos siete días. ${management.chartData.map((item) => `${item.label}: ${item.count}`).join(', ')}`}
              className="space-y-3"
            >
              <svg viewBox="0 0 700 190" className="h-52 w-full" preserveAspectRatio="none">
                <line x1="20" y1="160" x2="680" y2="160" className="stroke-border" />
                {management.chartData.map((item, index) => {
                  const height = item.count === 0 ? 0 : Math.max(8, (item.count / chartMax) * 132);
                  const x = 55 + index * 96;
                  return (
                    <g key={item.date}>
                      {item.count > 0 && (
                        <>
                          <rect
                            x={x}
                            y={160 - height}
                            width="48"
                            height={height}
                            rx="8"
                            className="fill-primary"
                          />
                          <text
                            x={x + 24}
                            y={150 - height}
                            textAnchor="middle"
                            className="fill-foreground text-[12px] font-semibold"
                          >
                            {item.count}
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
                {management.chartData.map((item) => (
                  <div key={item.date} className="truncate">
                    {item.label}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-sm bg-primary" aria-hidden="true" />
                Reservas
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {management.rescheduling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <Card
            role="dialog"
            aria-modal="true"
            aria-labelledby="reservation-reschedule-title"
            className="my-auto w-full max-w-xl"
          >
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div className="space-y-1.5">
                <CardTitle id="reservation-reschedule-title">Reprogramar reserva</CardTitle>
                <CardDescription>
                  La disponibilidad se verificará antes de guardar. Se agregará un recargo del 15%
                  del monto original.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Cerrar reprogramación"
                onClick={management.closeReschedule}
              >
                <X aria-hidden="true" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-muted/40 p-3 text-sm">
                <CircleDollarSign aria-hidden="true" className="h-4 w-4 text-primary" />
                <span>
                  Recargo estimado:{' '}
                  <strong>S/ {(management.rescheduling.monto * 0.15).toFixed(2)}</strong>
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField id="reschedule-date" label="Nueva fecha" required>
                  <Input
                    id="reschedule-date"
                    type="date"
                    value={management.scheduleForm.date}
                    onChange={(event) =>
                      management.setScheduleForm((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                    required
                  />
                </FormField>
                <FormField id="reschedule-start" label="Hora de inicio" required>
                  <Input
                    id="reschedule-start"
                    type="time"
                    value={management.scheduleForm.startTime}
                    onChange={(event) =>
                      management.setScheduleForm((current) => ({
                        ...current,
                        startTime: event.target.value,
                      }))
                    }
                    required
                  />
                </FormField>
                <FormField id="reschedule-end" label="Hora de fin" required>
                  <Input
                    id="reschedule-end"
                    type="time"
                    value={management.scheduleForm.endTime}
                    onChange={(event) =>
                      management.setScheduleForm((current) => ({
                        ...current,
                        endTime: event.target.value,
                      }))
                    }
                    required
                  />
                </FormField>
              </div>
              {management.error && (
                <p role="alert" className="mt-4 text-sm font-medium text-destructive">
                  {management.error}
                </p>
              )}
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={management.closeReschedule}>
                  Cerrar
                </Button>
                <Button type="button" onClick={management.saveReschedule}>
                  <Clock3 aria-hidden="true" />
                  Guardar cambio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
