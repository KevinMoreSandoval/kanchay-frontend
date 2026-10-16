import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { User } from '@/types';

export interface RecentUsersCardProps {
  users: User[];
}

export function RecentUsersCard({ users }: RecentUsersCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cuentas de Clientes Recientes</CardTitle>
        <CardDescription>Usuarios registrados localmente en CanchaYa</CardDescription>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users aria-hidden="true" className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">Aún no existen clientes</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Las cuentas registradas aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.slice(0, 5).map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border text-sm"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {u.firstName} {u.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
