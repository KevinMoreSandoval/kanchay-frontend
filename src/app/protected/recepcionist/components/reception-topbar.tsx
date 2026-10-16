import { CalendarDays } from 'lucide-react';
import type { User } from '@/types';

export interface ReceptionTopbarProps {
  user?: User | null;
}

export function ReceptionTopbar({ user }: ReceptionTopbarProps) {
  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-2 text-primary font-bold">
        <CalendarDays className="h-5 w-5" aria-hidden="true" />
        <span>Módulo de Recepción</span>
      </div>
      <div className="text-xs text-muted-foreground">
        Sesión: <strong>{user?.email || 'Recepción'}</strong>
      </div>
    </header>
  );
}
