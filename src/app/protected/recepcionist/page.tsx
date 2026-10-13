import { Button } from '@/components/ui';
import { NavegacionRecepcion } from '@/components/recepcion/NavegacionRecepcion';
import { DashboardRecepcion } from '@/components/recepcion/DashboardRecepcion';
import { FiltrosReservas } from '@/components/recepcion/FiltrosReservas';
import { ListaReservas } from '@/components/recepcion/ListaReservas';
import { ClientesBusqueda } from '@/components/recepcion/ClientesBusqueda';
import { DetalleReserva } from '@/components/recepcion/DetalleReserva';
import { FormCrearReserva } from '@/components/recepcion/FormCrearReserva';
import { useReception } from './hooks/use-reception';
import type { User } from '@/types';

export interface ReceptionDashboardProps {
  user?: User | null;
  onLogout?: () => void;
}
export default function ReceptionDashboard({ user, onLogout }: ReceptionDashboardProps) {
  const management = useReception();
  return (
    <div className="min-h-screen bg-background text-foreground md:flex">
      <NavegacionRecepcion
        section={management.section}
        onNavigate={management.setSection}
        onLogout={onLogout}
      />
      <main className="mx-auto w-full min-w-0 max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-sm text-muted-foreground">
              Recepción · {user?.firstName ?? 'Equipo'}
            </p>
            <h1 className="text-2xl font-black sm:text-3xl">
              {management.section === 'Dashboard' ? 'Panel de recepción' : management.section}
            </h1>
          </div>
          {management.section !== 'Clientes' && (
            <Button onClick={management.openCreation}>Crear reserva</Button>
          )}
        </header>
        {management.error && !management.selected && !management.creating && (
          <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-destructive">
            {management.error}
          </p>
        )}
        {management.feedback && !management.selected && (
          <p role="status" className="rounded-lg bg-primary/10 p-3 text-primary">
            {management.feedback}
          </p>
        )}
        {management.section === 'Dashboard' && <DashboardRecepcion management={management} />}
        {management.section === 'Reservas' && (
          <>
            <FiltrosReservas management={management} />
            <ListaReservas rows={management.filtered} onDetail={management.openDetail} />
          </>
        )}
        {management.section === 'Clientes' && <ClientesBusqueda management={management} />}
      </main>
      {management.selected && <DetalleReserva management={management} />}
      {management.creating && <FormCrearReserva management={management} />}
    </div>
  );
}
