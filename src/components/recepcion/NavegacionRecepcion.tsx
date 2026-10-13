import { CalendarDays, LayoutDashboard, Users } from 'lucide-react';
import { Button } from '@/components/ui';
import type {
  ReceptionManagement,
  ReceptionSection,
} from '@/app/protected/recepcionist/hooks/use-reception';

const items = [
  { id: 'Dashboard', Icon: LayoutDashboard },
  { id: 'Reservas', Icon: CalendarDays },
  { id: 'Clientes', Icon: Users },
] as const;
export function NavegacionRecepcion({
  section,
  onNavigate,
  onLogout,
}: {
  section: ReceptionSection;
  onNavigate: ReceptionManagement['setSection'];
  onLogout?: () => void;
}) {
  return (
    <aside className="border-b border-border bg-card p-4 md:sticky md:top-0 md:h-screen md:w-56 md:shrink-0 md:border-r">
      <img
        src="/assets/img/logo-court.png"
        alt="CanchaYa"
        className="mb-5 h-10 w-36 object-contain"
      />
      <nav aria-label="Recepción" className="grid grid-cols-3 gap-2 md:grid-cols-1">
        {items.map(({ id, Icon }) => (
          <Button
            key={id}
            variant={section === id ? 'default' : 'ghost'}
            aria-current={section === id ? 'page' : undefined}
            className="px-2 md:justify-start"
            onClick={() => onNavigate(id)}
          >
            <Icon aria-hidden="true" className="hidden h-4 w-4 sm:block" />
            {id}
          </Button>
        ))}
      </nav>
      {onLogout && (
        <Button className="mt-5 w-full" variant="outline" onClick={onLogout}>
          Cerrar sesión
        </Button>
      )}
    </aside>
  );
}
