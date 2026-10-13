import { Card, Input, Label } from '@/components/ui';
import type { ReceptionManagement } from '@/app/protected/recepcionist/hooks/use-reception';
import { ListaReservas } from './ListaReservas';
import { ControlAsistencia } from './ControlAsistencia';

export function DashboardRecepcion({ management: m }: { management: ReceptionManagement }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dashboard-date">Fecha del dashboard</Label>
          <Input
            id="dashboard-date"
            type="date"
            value={m.date}
            onChange={(e) => m.setDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dashboard-search">Buscar por cliente o cancha</Label>
          <Input
            id="dashboard-search"
            type="search"
            value={m.search}
            onChange={(e) => m.setSearch(e.target.value)}
            placeholder="Nombre del cliente o cancha"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {m.kpis.map((item) => (
          <Card key={item.id} className="p-4">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-3xl font-black text-primary">{item.value}</p>
          </Card>
        ))}
      </div>
      <section className="space-y-3" aria-labelledby="upcoming-title">
        <h2 id="upcoming-title" className="text-lg font-bold">
          Próximas por atender
        </h2>
        <ListaReservas
          rows={m.upcoming}
          onDetail={m.openDetail}
          emptyMessage="No hay reservas pendientes o confirmadas que coincidan con la fecha y búsqueda."
        />
      </section>
      <ControlAsistencia management={m} />
      <section className="space-y-3" aria-labelledby="activity-title">
        <h2 id="activity-title" className="text-lg font-bold">
          Actividad del día
        </h2>
        <ListaReservas
          rows={m.activityRows}
          onDetail={m.openDetail}
          emptyMessage="No hay actividad para esta fecha y búsqueda."
        />
      </section>
    </div>
  );
}
