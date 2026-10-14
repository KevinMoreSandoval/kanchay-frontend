import { CalendarDays, LayoutDashboard, Search, Users } from 'lucide-react';
import { Sidebar, type SidebarItem } from '@/components/sidebar';
import { Button, Input, Label } from '@/components/ui';
import { ReceptionTopbar } from './components/reception-topbar';
import { ReceptionKpis } from './components/reception-kpis';
import { ReservationsTable } from './components/reservations-table';
import { useReceptionDashboard } from './hooks/use-reception-dashboard';
import { useReceptionNavigation } from './hooks/use-reception-navigation';
import { useCreateReservation } from './hooks/use-create-reservation';
import type { User } from '@/types';

export interface ReceptionDashboardProps {
  user?: User | null;
  onLogout?: () => void;
}

const receptionItems: SidebarItem[] = [
  { label: 'Dashboard', Icon: LayoutDashboard, href: '/recepcionista' },
  { label: 'Reservas', Icon: CalendarDays, href: '/recepcionista/reservas' },
  { label: 'Clientes', Icon: Users, href: '/recepcionista/clientes' },
];

export default function ReceptionDashboard({ user, onLogout }: ReceptionDashboardProps) {
  const {
    clients,
    selectedClientId,
    setSelectedClientId,
    availableCourts,
    selectedCourtId,
    setSelectedCourtId,
    reservationDate,
    setReservationDate,
    minimumReservationDate,
    courtScheduleMessage,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    timeRangeError,
    paymentMethod,
    setPaymentMethod,
    observations,
    setObservations,
    hourlyRate,
    reservationAmount,
    durationLabel,
    canSubmit,
    isSubmitting,
    submissionError,
    submitReservation,
    beginCreation,
  } = useCreateReservation();
  const {
    activeSection,
    activeHref,
    navigate,
    isCreatingReservation,
    openNewReservation,
    backToReservations,
  } = useReceptionNavigation();
  const {
    applyCreatedReservations,
    reservationSearch,
    setReservationSearch,
    reservationDateFrom,
    setReservationDateFrom,
    reservationDateTo,
    setReservationDateTo,
    reservationDateError,
    reservationStatus,
    setReservationStatus,
    reservationStatusOptions,
    reservationPaymentStatus,
    setReservationPaymentStatus,
    paymentStatusOptions,
    reservationPaymentMethod,
    setReservationPaymentMethod,
    paymentMethodOptions,
    courts,
    reservationCourtId,
    setReservationCourtId,
    filteredReservations,
    hasReservationFilters,
    clearReservationFilters,
    search,
    setSearch,
    query,
    selectedDate,
    setSelectedDate,
    visibleReservations,
    dateReservations,
    upcoming,
    activity,
    counts,
  } = useReceptionDashboard();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
      <Sidebar
        title=""
        items={receptionItems}
        activeHref={activeHref}
        onNavigate={navigate}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <ReceptionTopbar user={user} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Panel de Recepción
              </h1>
              {activeSection === 'dashboard' && (
                <p className="text-sm text-muted-foreground">
                  Control y seguimiento de canchas en tiempo real
                </p>
              )}
            </div>
            {activeSection === 'dashboard' && (
              <div className="flex flex-col gap-2 sm:items-end">
                <div className="w-40 self-end">
                  <Label htmlFor="reception-date" className="sr-only">
                    Fecha del dashboard
                  </Label>
                  <Input
                    id="reception-date"
                    type="date"
                    className="h-8 bg-muted px-2 py-1 text-xs font-semibold"
                    required
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                  />
                </div>
                <div className="relative w-full sm:w-80">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por cliente o cancha..."
                    aria-label="Buscar reservas de la fecha seleccionada por cliente o cancha"
                    className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {activeSection === 'dashboard' && (
            <>
              <ReceptionKpis counts={counts} />

              <p className="text-xs font-semibold text-muted-foreground" aria-live="polite">
                {query
                  ? `${visibleReservations.length} reservas coinciden con la búsqueda "${search}".`
                  : `${dateReservations.length} reservas registradas para la fecha seleccionada.`}
              </p>

              <section className="space-y-3" aria-labelledby="upcoming-heading">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 id="upcoming-heading" className="text-lg font-bold text-foreground">
                      Próximas por atender
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Reservas confirmadas y pendientes con inicio futuro en la fecha seleccionada
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                    {upcoming.length}
                  </span>
                </div>
                <ReservationsTable
                  rows={upcoming}
                  caption="Próximas reservas por atender"
                  emptyTitle="Todo al día"
                  emptyMessage={
                    query
                      ? 'No hay próximas reservas que coincidan con la búsqueda en la fecha seleccionada.'
                      : 'No hay reservas con inicio futuro por atender en la fecha seleccionada.'
                  }
                />
              </section>
              <section className="space-y-3 pt-2" aria-labelledby="activity-heading">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 id="activity-heading" className="text-lg font-bold text-foreground">
                      Actividad del día
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Historial de reservas en curso, finalizadas y no asistidas
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-muted text-muted-foreground px-2.5 py-1 rounded-full border border-border">
                    {activity.length}
                  </span>
                </div>
                <ReservationsTable
                  rows={activity}
                  caption="Actividad de reservas del día"
                  emptyTitle="Sin actividad registrada"
                  emptyMessage={
                    query
                      ? 'No hay registros de actividad que coincidan con la búsqueda en la fecha seleccionada.'
                      : 'No hay actividad registrada para la fecha seleccionada.'
                  }
                />
              </section>
            </>
          )}
          {activeSection === 'reservas' && isCreatingReservation && (
            <section aria-labelledby="new-reservation-heading" className="space-y-4">
              <h2 id="new-reservation-heading" className="text-lg font-bold text-foreground">
                Nueva reserva
              </h2>
              <p className="text-sm text-muted-foreground">
                Selecciona un cliente registrado para iniciar la nueva reserva.
              </p>
              <div className="space-y-1">
                <Label htmlFor="new-reservation-client">Cliente existente</Label>
                <select
                  id="new-reservation-client"
                  value={selectedClientId}
                  onChange={(event) => setSelectedClientId(event.target.value)}
                  disabled={clients.length === 0}
                  aria-describedby={
                    clients.length === 0 ? 'new-reservation-client-empty' : undefined
                  }
                  className="h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="">Selecciona un cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName} · {client.email}
                    </option>
                  ))}
                </select>
                {clients.length === 0 && (
                  <p
                    id="new-reservation-client-empty"
                    role="status"
                    className="text-sm text-muted-foreground"
                  >
                    No hay clientes registrados disponibles para seleccionar.
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-reservation-court">Cancha</Label>
                <select
                  id="new-reservation-court"
                  value={selectedCourtId}
                  onChange={(event) => setSelectedCourtId(event.target.value)}
                  disabled={availableCourts.length === 0}
                  aria-describedby={
                    availableCourts.length === 0 ? 'new-reservation-court-empty' : undefined
                  }
                  className="h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="">Selecciona una cancha</option>
                  {availableCourts.map((court) => (
                    <option key={court.id} value={court.id}>
                      {court.name} · {court.location} · S/ {court.price.toFixed(2)}/hora
                    </option>
                  ))}
                </select>
                {availableCourts.length === 0 && (
                  <p
                    id="new-reservation-court-empty"
                    role="status"
                    className="text-sm text-muted-foreground"
                  >
                    No hay canchas activas disponibles para seleccionar.
                  </p>
                )}
              </div>
              <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0 space-y-1">
                  <Label htmlFor="new-reservation-date">Fecha de reserva</Label>
                  <Input
                    id="new-reservation-date"
                    type="date"
                    min={minimumReservationDate}
                    value={reservationDate}
                    onChange={(event) => setReservationDate(event.target.value)}
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <Label htmlFor="new-reservation-payment-method">Método de pago</Label>
                  <select
                    id="new-reservation-payment-method"
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    className="h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Selecciona un método de pago</option>
                    {paymentMethodOptions.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {courtScheduleMessage && (
                <p role="status" className="text-sm text-muted-foreground">
                  {courtScheduleMessage}
                </p>
              )}
              <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0 space-y-1">
                  <Label htmlFor="new-reservation-start">Hora de inicio</Label>
                  <Input
                    id="new-reservation-start"
                    type="time"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                    aria-invalid={Boolean(timeRangeError)}
                    aria-describedby={timeRangeError ? 'new-reservation-time-error' : undefined}
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <Label htmlFor="new-reservation-end">Hora de fin</Label>
                  <Input
                    id="new-reservation-end"
                    type="time"
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                    aria-invalid={Boolean(timeRangeError)}
                    aria-describedby={timeRangeError ? 'new-reservation-time-error' : undefined}
                  />
                </div>
              </div>
              {timeRangeError && (
                <p
                  id="new-reservation-time-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {timeRangeError}
                </p>
              )}
              <div className="space-y-1">
                <Label htmlFor="new-reservation-observations">
                  Observaciones <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <textarea
                  id="new-reservation-observations"
                  value={observations}
                  onChange={(event) => setObservations(event.target.value)}
                  rows={3}
                  placeholder="Escribe una nota breve relacionada con la reserva."
                  className="flex w-full min-w-0 resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                />
              </div>
              <div
                role="status"
                className="space-y-1 rounded-lg border border-border bg-muted/50 p-4 text-sm"
              >
                {hourlyRate !== null && <p>Tarifa por hora: S/ {hourlyRate.toFixed(2)}</p>}
                {reservationAmount !== null && (
                  <>
                    <p>Duración: {durationLabel}</p>
                    <p className="font-semibold text-foreground">
                      Total: S/ {reservationAmount.toFixed(2)}
                    </p>
                  </>
                )}
                {reservationAmount === null && (
                  <p className="text-muted-foreground">
                    Selecciona una cancha con tarifa válida y una duración válida para calcular el
                    total.
                  </p>
                )}
              </div>
              {submissionError && (
                <p role="alert" className="text-sm text-destructive">
                  {submissionError}
                </p>
              )}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  disabled={!canSubmit || isSubmitting}
                  onClick={() => submitReservation(applyCreatedReservations, backToReservations)}
                >
                  {isSubmitting ? 'Creando reserva...' : 'Crear reserva'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={backToReservations}
                >
                  Volver a reservas
                </Button>
              </div>
            </section>
          )}
          {activeSection === 'reservas' && !isCreatingReservation && (
            <section aria-labelledby="reservations-heading" className="space-y-4">
              <h2 id="reservations-heading" className="text-lg font-bold text-foreground">
                Reservas
              </h2>
              <p className="text-sm text-muted-foreground">
                Gestiona y consulta las reservas registradas.
              </p>
              <Button type="button" onClick={() => beginCreation(openNewReservation)}>
                Nueva reserva
              </Button>
              <div className="space-y-1">
                <Label htmlFor="reservation-search">
                  Buscar por cliente, cancha o ID de reserva
                </Label>
                <Input
                  id="reservation-search"
                  type="search"
                  value={reservationSearch}
                  onChange={(event) => setReservationSearch(event.target.value)}
                  placeholder="Nombre del cliente, cancha o ID"
                />
              </div>
              <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="min-w-0 space-y-1">
                  <Label htmlFor="reservation-date-from">Fecha desde</Label>
                  <Input
                    id="reservation-date-from"
                    type="date"
                    className="min-w-0 max-w-full"
                    value={reservationDateFrom}
                    onChange={(event) => setReservationDateFrom(event.target.value)}
                    aria-invalid={Boolean(reservationDateError)}
                    aria-describedby={reservationDateError ? 'reservation-date-error' : undefined}
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <Label htmlFor="reservation-date-to">Fecha hasta</Label>
                  <Input
                    id="reservation-date-to"
                    type="date"
                    className="min-w-0 max-w-full"
                    value={reservationDateTo}
                    onChange={(event) => setReservationDateTo(event.target.value)}
                    aria-invalid={Boolean(reservationDateError)}
                    aria-describedby={reservationDateError ? 'reservation-date-error' : undefined}
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <Label htmlFor="reservation-status">Estado de reserva</Label>
                  <select
                    id="reservation-status"
                    value={reservationStatus}
                    onChange={(event) => setReservationStatus(event.target.value)}
                    className="h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Todos los estados</option>
                    {reservationStatusOptions.map(([value, config]) => (
                      <option key={value} value={value}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-0 space-y-1">
                  <Label htmlFor="reservation-payment-status">Estado de pago</Label>
                  <select
                    id="reservation-payment-status"
                    value={reservationPaymentStatus}
                    onChange={(event) => setReservationPaymentStatus(event.target.value)}
                    className="h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Todos los pagos</option>
                    {paymentStatusOptions.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-0 space-y-1">
                  <Label htmlFor="reservation-payment-method">Método de pago</Label>
                  <select
                    id="reservation-payment-method"
                    value={reservationPaymentMethod}
                    onChange={(event) => setReservationPaymentMethod(event.target.value)}
                    className="h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Todos los métodos</option>
                    {paymentMethodOptions.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-0 space-y-1">
                  <Label htmlFor="reservation-court">Cancha</Label>
                  <select
                    id="reservation-court"
                    value={reservationCourtId}
                    onChange={(event) => setReservationCourtId(event.target.value)}
                    className="h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Todas las canchas</option>
                    {courts.map((court) => (
                      <option key={court.id} value={court.id}>
                        {court.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {reservationDateError && (
                <p id="reservation-date-error" role="alert" className="text-sm text-destructive">
                  {reservationDateError}
                </p>
              )}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!hasReservationFilters}
                  onClick={clearReservationFilters}
                >
                  Limpiar filtros
                </Button>
              </div>
              {!reservationDateError && (
                <>
                  <p className="text-sm text-muted-foreground" role="status">
                    {filteredReservations.length} reservas encontradas.
                  </p>
                  <ReservationsTable
                    rows={filteredReservations}
                    caption="Listado de reservas registradas"
                    emptyTitle={
                      hasReservationFilters ? 'Sin coincidencias' : 'Sin reservas registradas'
                    }
                    emptyMessage={
                      hasReservationFilters
                        ? 'No hay reservas que coincidan con los filtros aplicados.'
                        : 'Las reservas aparecerán aquí cuando se registren en el sistema.'
                    }
                  />
                </>
              )}
            </section>
          )}
          {activeSection === 'clientes' && (
            <section aria-labelledby="clients-heading" className="space-y-2">
              <h2 id="clients-heading" className="text-lg font-bold text-foreground">
                Clientes
              </h2>
              <p className="text-sm text-muted-foreground">
                Consulta los clientes registrados y sus reservas.
              </p>
              <p className="text-sm text-muted-foreground">
                Esta sección se implementará en una próxima fase.
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
