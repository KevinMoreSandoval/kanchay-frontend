import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  CalendarDays,
  CalendarClock,
  ClipboardList,
  UserRoundPlus,
  X,
} from 'lucide-react';
import {
  Button,
  Badge,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import type { BadgeProps } from '@/components/ui';
import type { ReservationStatus } from '@/types';
import { useReceptionClients } from '../hooks/use-reception-clients';
import { reservationStatuses } from '../hooks/use-reception-reservations';
import { CreateClientModal } from './create-client-modal';

const paymentStatuses = {
  PENDIENTE: 'Pendiente',
  PAGADO: 'Pagado',
  POR_REEMBOLSAR: 'Por reembolsar',
  REEMBOLSADO: 'Reembolsado',
};
const paymentMethods = {
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
  TRANSFERENCIA: 'Transferencia',
  YAPE_PLIN: 'Yape / Plin',
};

const statusVariants: Record<ReservationStatus, BadgeProps['variant']> = {
  PENDIENTE: 'warning',
  CONFIRMADA: 'success',
  EN_CURSO: 'info',
  FINALIZADA: 'secondary',
  CANCELADA: 'outline',
  NO_ASISTIO: 'destructive',
};

function formatDate(value: string) {
  return value.split('-').reverse().join('/');
}

function Pagination({
  label,
  currentPage,
  totalPages,
  total,
  onChange,
}: {
  label: string;
  currentPage: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
}) {
  return (
    <nav
      aria-label={`Paginación de ${label}`}
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <p role="status" className="text-sm text-muted-foreground">
        {total} {label}. Página {currentPage} de {totalPages}.
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => onChange(currentPage - 1)}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => onChange(currentPage + 1)}
        >
          Siguiente
        </Button>
      </div>
    </nav>
  );
}

export function ReceptionClients() {
  const { dialogRef, historyDialogRef, ...view } = useReceptionClients();
  const detail = view.detail;
  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Encuentra clientes y consulta su historial de reservas.
          </p>
        </div>
        <Button onClick={view.openCreateClient} aria-haspopup="dialog">
          <UserRoundPlus aria-hidden="true" className="size-4" />
          Crear cliente
        </Button>
      </header>
      {view.createClientOpen && (
        <CreateClientModal
          initialDni=""
          onClose={view.closeCreateClient}
          onCreated={view.onClientCreated}
        />
      )}
      {view.feedback && (
        <p role="status" className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
          {view.feedback}
        </p>
      )}
      <section aria-label="Consulta de clientes" className="space-y-4">
        <div className="space-y-2 rounded-xl border border-border bg-card p-4">
          <Label htmlFor="client-search">Buscar cliente</Label>
          <Input
            id="client-search"
            type="search"
            placeholder="Nombre, teléfono o correo"
            value={view.search}
            onChange={(event) => view.updateSearch(event.target.value)}
          />
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <caption className="sr-only">Clientes registrados en el almacenamiento local</caption>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Consulta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {view.clients.rows.map((client) => (
                <TableRow
                  key={client.id}
                  data-state={view.client?.id === client.id ? 'selected' : undefined}
                >
                  <TableCell className="font-semibold">
                    {client.firstName} {client.lastName}
                  </TableCell>
                  <TableCell>{client.phone || 'Sin teléfono registrado'}</TableCell>
                  <TableCell>{client.email || 'Sin correo registrado'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={`Ver reservas de ${client.firstName} ${client.lastName}`}
                      aria-haspopup="dialog"
                      onClick={() => view.selectClient(client.id)}
                    >
                      Ver reservas
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!view.clients.total && (
            <p role="status" className="p-6 text-center text-sm text-muted-foreground">
              {view.hasClients
                ? 'No se encontraron clientes. Prueba con otro nombre, teléfono o correo.'
                : 'Todavía no hay clientes registrados. Usa Crear cliente para registrar el primero.'}
            </p>
          )}
        </div>
        <Pagination label="clientes" {...view.clients} onChange={view.setPage} />
      </section>
      {createPortal(
        <dialog
          ref={historyDialogRef}
          aria-labelledby="client-history-title"
          aria-describedby="client-history-description"
          onCancel={(event) => {
            event.preventDefault();
            view.closeHistory();
          }}
          className="fixed inset-0 m-auto max-h-[92dvh] w-[calc(100%-2rem)] max-w-5xl overflow-hidden rounded-2xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
        >
          <div className="flex max-h-[92dvh] flex-col">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border bg-muted/30 p-5 sm:p-6">
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <CalendarDays aria-hidden="true" className="size-4" /> Historial del cliente
                </p>
                <h2 id="client-history-title" className="text-xl font-black sm:text-2xl">
                  {view.client
                    ? `Reservas de ${view.client.firstName} ${view.client.lastName}`
                    : 'Historial de reservas'}
                </h2>
                <p id="client-history-description" className="text-sm text-muted-foreground">
                  Ordenadas por fecha y hora de reserva, de la más reciente a la más antigua.
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={view.closeHistory}
                aria-label="Cerrar historial de reservas"
              >
                <X aria-hidden="true" className="size-4" />
              </Button>
            </div>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
              {!view.client ? (
                <p
                  role="status"
                  className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground"
                >
                  Selecciona un cliente para consultar sus reservas.
                </p>
              ) : (
                <>
                  <div className="overflow-hidden rounded-xl border border-border bg-card">
                    <Table>
                      <caption className="sr-only">Reservas del cliente seleccionado</caption>
                      <TableHeader className="bg-muted/40">
                        <TableRow>
                          <TableHead>Reserva</TableHead>
                          <TableHead>Cancha</TableHead>
                          <TableHead>Fecha y horario</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Monto base</TableHead>
                          <TableHead>Consulta</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {view.history.rows.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              #{row.id}
                            </TableCell>
                            <TableCell className="font-semibold">{row.cancha}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <p className="font-semibold">{formatDate(row.fecha)}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {row.horaInicio}–{row.horaFin}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={statusVariants[row.estado]}
                                className="whitespace-nowrap"
                              >
                                {reservationStatuses[row.estado]}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap font-bold tabular-nums">
                              S/ {row.monto.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                aria-label={`Ver detalle de reserva #${row.id}`}
                                aria-haspopup="dialog"
                                onClick={() => view.openDetail(row.id)}
                              >
                                Ver detalle
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {!view.history.total && (
                      <div
                        role="status"
                        className="flex flex-col items-center gap-2 px-6 py-12 text-center"
                      >
                        <ClipboardList
                          aria-hidden="true"
                          className="mb-1 size-9 text-muted-foreground/60"
                        />
                        <p className="font-bold">Sin reservas todavía</p>
                        <p className="max-w-sm text-sm text-muted-foreground">
                          Las reservas de este cliente aparecerán aquí cuando se registren.
                        </p>
                      </div>
                    )}
                  </div>
                  <Pagination
                    label="reservas"
                    {...view.history}
                    onChange={view.setReservationPage}
                  />
                </>
              )}
            </div>
            <div className="flex shrink-0 justify-end border-t border-border bg-muted/20 px-5 py-4 sm:px-6">
              <Button variant="outline" onClick={view.closeHistory}>
                Cerrar historial
              </Button>
            </div>
          </div>
        </dialog>,
        document.body
      )}
      {createPortal(
        <dialog
          ref={dialogRef}
          aria-labelledby="client-reservation-title"
          aria-describedby="client-reservation-description"
          onCancel={(event) => {
            event.preventDefault();
            view.closeDetail();
          }}
          className="fixed inset-0 m-auto max-h-[92dvh] w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-2xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
        >
          <div className="flex max-h-[92dvh] flex-col">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border bg-muted/30 p-5 sm:p-6">
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <ClipboardList aria-hidden="true" className="size-4" /> Información de la reserva
                </p>
                <h2 id="client-reservation-title" className="text-xl font-black sm:text-2xl">
                  Detalle de reserva {detail && `#${detail.id}`}
                </h2>
                <p
                  id="client-reservation-description"
                  className="mt-1 text-sm text-muted-foreground"
                >
                  Consulta el horario, los pagos y los cambios registrados.
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                aria-label="Cerrar detalle de reserva"
                onClick={view.closeDetail}
              >
                <X aria-hidden="true" className="size-4" />
              </Button>
            </div>
            {detail && (
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 text-sm sm:p-6">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">
                        Cancha reservada
                      </p>
                      <p className="mt-1 text-lg font-bold">{detail.cancha}</p>
                      <p className="mt-1 text-muted-foreground">{detail.cliente}</p>
                    </div>
                    <Badge variant={statusVariants[detail.estado]}>
                      {reservationStatuses[detail.estado]}
                    </Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-primary/10 pt-3 font-semibold">
                    <p className="flex items-center gap-2">
                      <CalendarDays aria-hidden="true" className="size-4 text-primary" />
                      {formatDate(detail.fecha)}
                    </p>
                    <p className="flex items-center gap-2">
                      <CalendarClock aria-hidden="true" className="size-4 text-primary" />
                      {detail.horaInicio}–{detail.horaFin}
                    </p>
                  </div>
                </div>
                <section
                  aria-labelledby="reservation-payment-title"
                  className="rounded-xl border border-border p-4"
                >
                  <h3 id="reservation-payment-title" className="mb-4 font-bold">
                    Pago de la reserva
                  </h3>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                      ['Monto base', `S/ ${detail.monto.toFixed(2)}`],
                      [
                        'Estado de pago',
                        detail.paymentStatus
                          ? paymentStatuses[detail.paymentStatus]
                          : 'Sin registrar',
                      ],
                      [
                        'Método de pago',
                        detail.paymentMethod
                          ? paymentMethods[detail.paymentMethod]
                          : 'Sin registrar',
                      ],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="mt-1 break-words font-semibold">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                    Los recargos por reprogramación se registran por separado del monto base.
                  </p>
                </section>
                <section
                  aria-labelledby="reservation-tracking-title"
                  className="space-y-3 rounded-xl border border-border p-4"
                >
                  <h3 id="reservation-tracking-title" className="font-bold">
                    Seguimiento
                  </h3>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">Creación</dt>
                      <dd className="mt-1 font-semibold">
                        {detail.createdAt
                          ? new Date(detail.createdAt).toLocaleString('es-PE')
                          : 'Sin registrar'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Asistencia</dt>
                      <dd className="mt-1 font-semibold">
                        {detail.attendedAt
                          ? new Date(detail.attendedAt).toLocaleString('es-PE')
                          : 'Sin registrar'}
                      </dd>
                    </div>
                  </dl>
                  <div className="border-t border-border pt-3">
                    <p className="text-muted-foreground">Observaciones</p>
                    <p className="mt-1 whitespace-pre-wrap break-words">
                      {detail.observaciones || 'Sin observaciones'}
                    </p>
                  </div>
                </section>
                <section aria-labelledby="reservation-changes-title" className="space-y-3">
                  <h3 id="reservation-changes-title" className="flex items-center gap-2 font-bold">
                    <CalendarClock aria-hidden="true" className="size-4 text-primary" />
                    Historial de reprogramaciones{' '}
                    <Badge variant="secondary">{detail.scheduleChanges?.length ?? 0}</Badge>
                  </h3>
                  {detail.scheduleChanges?.length ? (
                    <ol className="space-y-3">
                      {detail.scheduleChanges.map((change) => (
                        <li
                          key={`${change.changedAt}-${change.previousDate}-${change.previousStartTime}-${change.newDate}-${change.newStartTime}`}
                          className="space-y-3 rounded-xl border border-border bg-muted/20 p-4"
                        >
                          <p className="text-xs font-semibold text-muted-foreground">
                            {new Date(change.changedAt).toLocaleString('es-PE')}
                          </p>
                          <p className="text-muted-foreground">
                            Anterior: {formatDate(change.previousDate)} · {change.previousStartTime}
                            –{change.previousEndTime}
                          </p>
                          <p className="font-semibold">
                            Nuevo: {formatDate(change.newDate)} · {change.newStartTime}–
                            {change.newEndTime}
                          </p>
                          <p className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                            <span className="font-bold">
                              Recargo: S/ {change.surcharge.toFixed(2)}
                            </span>
                            <Badge
                              variant={
                                change.surchargePaymentStatus === 'PAGADO' ? 'success' : 'warning'
                              }
                            >
                              {paymentStatuses[change.surchargePaymentStatus]}
                            </Badge>
                          </p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="rounded-xl border border-dashed border-border p-4 text-muted-foreground">
                      La reserva conserva su horario original. No hay reprogramaciones registradas.
                    </p>
                  )}
                </section>
              </div>
            )}
            <div className="flex shrink-0 justify-end border-t border-border bg-muted/20 px-5 py-4 sm:px-6">
              <Button variant="outline" onClick={view.closeDetail}>
                <ArrowLeft aria-hidden="true" className="size-4" />
                Volver al historial
              </Button>
            </div>
          </div>
        </dialog>,
        document.body
      )}
    </>
  );
}
