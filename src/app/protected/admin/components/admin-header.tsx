import { ShieldCheck } from 'lucide-react';
import type { User } from '@/types';

export interface AdminHeaderProps {
  user?: User | null;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-2 text-primary font-bold">
        <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        <span>Módulo de Administración</span>
      </div>
      <div className="text-xs text-muted-foreground">
        Sesión: <strong>{user?.email || 'admin@kancha.com'}</strong>
      </div>
    </header>
  );
}
