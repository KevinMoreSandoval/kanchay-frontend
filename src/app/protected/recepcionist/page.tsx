import { CalendarDays, LayoutDashboard, Search, Users } from 'lucide-react';
import { Sidebar, type SidebarItem } from '@/components/sidebar';
import { Input, Label } from '@/components/ui';
import { ReceptionTopbar } from './components/reception-topbar';
import { ReceptionKpis } from './components/reception-kpis';
import { ReservationsTable } from './components/reservations-table';
import { useReceptionDashboard } from './hooks/use-reception-dashboard';
import { useReceptionNavigation } from './hooks/use-reception-navigation';
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
  const { activeSection, activeHref, navigate } = useReceptionNavigation();
  const {
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
                <div className="w-full space-y-1 sm:w-80">
                  <Label htmlFor="reception-date">Fecha del dashboard</Label>
                  <Input
                    id="reception-date"
                    type="date"
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
          {activeSection === 'reservas' && (
            <section aria-labelledby="reservations-heading" className="space-y-2">
              <h2 id="reservations-heading" className="text-lg font-bold text-foreground">
                Reservas
              </h2>
              <p className="text-sm text-muted-foreground">
                Gestiona y consulta las reservas registradas.
              </p>
              <p className="text-sm text-muted-foreground">
                Esta sección se implementará en una próxima fase.
              </p>
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
