import { CalendarDays, LayoutDashboard, Search, Users } from 'lucide-react';
import { Sidebar, type SidebarItem } from '@/components/sidebar';
import { ReceptionTopbar } from './components/reception-topbar';
import { ReceptionKpis } from './components/reception-kpis';
import { ReservationsTable } from './components/reservations-table';
import { useReceptionDashboard } from './hooks/use-reception-dashboard';
import type { User } from '@/types';

export interface ReceptionDashboardProps {
  user?: User | null;
  onLogout?: () => void;
}

const receptionItems: SidebarItem[] = [
  { label: 'Dashboard', Icon: LayoutDashboard, href: '/recepcionista' },
  { label: 'Reservas', Icon: CalendarDays },
  { label: 'Clientes', Icon: Users },
];

export default function ReceptionDashboard({ user, onLogout }: ReceptionDashboardProps) {
  const {
    search,
    setSearch,
    query,
    localDate,
    visibleReservations,
    todayReservations,
    upcoming,
    activity,
    counts,
  } = useReceptionDashboard();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
      <Sidebar title="" items={receptionItems} activeHref="/recepcionista" onLogout={onLogout} />

      <div className="flex-1 flex flex-col min-w-0">
        <ReceptionTopbar user={user} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Panel de Recepción
              </h1>
              <p className="text-sm text-muted-foreground">
                Control y seguimiento de canchas en tiempo real
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <div className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1.5 rounded-lg border border-border w-fit">
                Fecha: {localDate}
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
                  placeholder="Buscar reservas del día..."
                  aria-label="Buscar reservas del día por cliente o cancha"
                  className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>

          <ReceptionKpis counts={counts} />

          <p className="text-xs font-semibold text-muted-foreground" aria-live="polite">
            {query
              ? `${visibleReservations.length} reservas coinciden con la búsqueda "${search}".`
              : `${todayReservations.length} reservas registradas para hoy.`}
          </p>

          <section className="space-y-3" aria-labelledby="upcoming-heading">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="upcoming-heading" className="text-lg font-bold text-foreground">
                  Próximas por atender
                </h2>
                <p className="text-xs text-muted-foreground">
                  Reservas confirmadas y pendientes para el día de hoy
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
                  ? 'No hay reservas pendientes que coincidan con la búsqueda.'
                  : 'No hay reservas pendientes por atender en este momento.'
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
              emptyTitle="Sin actividad todavía"
              emptyMessage={
                query
                  ? 'No hay registros de actividad que coincidan con la búsqueda.'
                  : 'La actividad del día aparecerá aquí conforme avancen los horarios.'
              }
            />
          </section>
        </main>
      </div>
    </div>
  );
}
