import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';

export interface ClientNavbarProps {
  user?: User | null;
  onLogout?: () => void;
}

export function ClientNavbar({ user, onLogout }: ClientNavbarProps) {
  const fullName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    : 'Usuario';
  const role = user?.role || 'Cliente';
  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U'
    : 'U';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/assets/img/logo-court.png"
            alt="CanchaYa"
            className="h-8 w-auto object-contain"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
              {initials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-semibold text-foreground leading-tight">
                {fullName}
              </span>
              <span className="text-xs text-muted-foreground">{role}</span>
            </div>
          </div>

          {onLogout && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
