import { ReservationActionModal } from './reservation-action-modal';
import { useReceptionReservationActions } from '../hooks/use-reception-reservation-actions';
import { CreateReservationPanel } from './create-reservation-panel';
import {
  Button,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui';
import { ReservationsTable } from './reservations-table';
import { reservationStatuses, useReceptionReservations } from '../hooks/use-reception-reservations';

export function ReceptionReservations() {
  const table = useReceptionReservations();
  const { dialogRef, ...actions } = useReceptionReservationActions(table.refreshReservations);
  const { filters, updateFilter } = table;

  return (
    <>
      <header className="space-y-1 border-b border-border pb-4">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Reservas</h1>
        <p className="text-sm text-muted-foreground">
          Consulta las reservas de hoy y las próximas, o filtra para revisar el historial.
        </p>
      </header>
      <section
        aria-label="Filtros de reservas"
        className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div className="space-y-2">
          <Label htmlFor="reservation-search">Buscar reserva</Label>
          <Input
            id="reservation-search"
            type="search"
            placeholder="Cliente, cancha o código"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reservation-period">Período</Label>
          <Select value={filters.period} onValueChange={(value) => updateFilter('period', value)}>
            <SelectTrigger id="reservation-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Hoy y próximas</SelectItem>
              <SelectItem value="today">Solo hoy</SelectItem>
              <SelectItem value="past">Anteriores a hoy</SelectItem>
              <SelectItem value="all">Todas las fechas</SelectItem>
              <SelectItem value="date">Fecha específica</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {filters.period === 'date' && (
          <div className="space-y-2">
            <Label htmlFor="reservation-date">Fecha de reserva</Label>
            <Input
              id="reservation-date"
              type="date"
              value={filters.date}
              onChange={(event) => updateFilter('date', event.target.value)}
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="reservation-status">Estado</Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => updateFilter('status', value === 'all' ? '' : value)}
          >
            <SelectTrigger id="reservation-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(reservationStatuses).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reservation-court">Cancha</Label>
          <Select
            value={filters.court ? `court:${filters.court}` : 'all'}
            onValueChange={(value) => updateFilter('court', value === 'all' ? '' : value.slice(6))}
          >
            <SelectTrigger id="reservation-court">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las canchas</SelectItem>
              {table.courts.map((court) => (
                <SelectItem key={court} value={`court:${court}`}>
                  {court}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button variant="outline" onClick={table.resetFilters}>
            Restablecer filtros
          </Button>
        </div>
      </section>
      <section aria-label="Resultados de reservas" className="space-y-4 pb-80">
        <CreateReservationPanel onCreated={table.refreshReservations} />
        <p role="status" className="text-sm text-muted-foreground">
          Mostrando {table.first}–{table.last} de {table.total} reservas. Página {table.currentPage}{' '}
          de {table.totalPages}.
        </p>
        {actions.feedback && (
          <p role="status" className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
            {actions.feedback}
          </p>
        )}
        {actions.error && !actions.selection && (
          <p role="alert" className="text-sm text-destructive">
            {actions.error}
          </p>
        )}
        <ReservationActionModal dialogRef={dialogRef} {...actions} />
        <ReservationsTable
          onAction={actions.open}
          now={actions.now}
          rows={table.rows}
          caption="Reservas ordenadas por fecha y hora de inicio"
          emptyTitle="Sin reservas"
          emptyMessage="No hay reservas que coincidan con los filtros seleccionados."
        />
        <nav
          aria-label="Paginación de reservas"
          className="flex flex-wrap items-center justify-end gap-4"
        >
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={table.currentPage === 1}
              onClick={table.previousPage}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              disabled={table.currentPage === table.totalPages}
              onClick={table.nextPage}
            >
              Siguiente
            </Button>
          </div>
        </nav>
      </section>
    </>
  );
}
