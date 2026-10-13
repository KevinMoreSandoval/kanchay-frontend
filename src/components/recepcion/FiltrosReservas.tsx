import { Button, Input, Label, Select } from '@/components/ui';
import { paymentLabels, reservationLabels } from '@/lib/reservation-labels';
import type {
  ReceptionManagement,
  ReceptionFilters,
} from '@/app/protected/recepcionist/hooks/use-reception';

export function FiltrosReservas({ management: m }: { management: ReceptionManagement }) {
  const update = (key: keyof ReceptionFilters, value: string) =>
    m.setFilters((previous) => ({ ...previous, [key]: value }));
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="filter-search">Buscar</Label>
          <Input
            id="filter-search"
            type="search"
            placeholder="Código, cliente o cancha"
            value={m.filters.search}
            onChange={(e) => update('search', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-from">Desde</Label>
          <Input
            id="filter-from"
            type="date"
            value={m.filters.from}
            onChange={(e) => update('from', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-to">Hasta</Label>
          <Input
            id="filter-to"
            type="date"
            min={m.filters.from}
            value={m.filters.to}
            onChange={(e) => update('to', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-status">Estado</Label>
          <Select
            id="filter-status"
            value={m.filters.status}
            onChange={(e) => update('status', e.target.value)}
          >
            <option value="">Todos los estados</option>
            {Object.entries(reservationLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-payment">Pago</Label>
          <Select
            id="filter-payment"
            value={m.filters.payment}
            onChange={(e) => update('payment', e.target.value)}
          >
            <option value="">Todos los pagos</option>
            {Object.entries(paymentLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-court">Cancha</Label>
          <Select
            id="filter-court"
            value={m.filters.court}
            onChange={(e) => update('court', e.target.value)}
          >
            <option value="">Todas las canchas</option>
            {m.courts.map((court) => (
              <option key={court.id} value={court.id}>
                {court.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
      {m.filters.from && m.filters.to && m.filters.from > m.filters.to && (
        <p role="alert" className="text-sm text-destructive">
          La fecha hasta debe ser posterior o igual a desde.
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-muted-foreground">
          {m.filtered.length} resultados
        </p>
        <Button variant="outline" onClick={m.clearFilters}>
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
}
