import { Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Court } from '@/types';

export interface CourtsSummaryCardProps {
  courts: Court[];
}

export function CourtsSummaryCard({ courts }: CourtsSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Canchas del Sistema</CardTitle>
        <CardDescription>Espacios deportivos configurados</CardDescription>
      </CardHeader>
      <CardContent>
        {courts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Trophy aria-hidden="true" className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">Aún no existen canchas</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Las canchas registradas aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {courts.map((court) => (
              <div
                key={court.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border text-sm"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={court.image}
                    alt={court.name}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{court.name}</p>
                    <p className="text-xs text-muted-foreground">{court.location}</p>
                  </div>
                </div>
                <span className="font-bold text-foreground">S/ {court.price}/h</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
