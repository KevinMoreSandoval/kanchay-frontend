import {
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  CircleX,
  Clock3,
  Hourglass,
  XCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface ReceptionKpiCounts {
  total: number;
  pending: number;
  upcoming: number;
  inProgress: number;
  completed: number;
  noShow: number;
  canceled: number;
}

export interface ReceptionKpisProps {
  counts: ReceptionKpiCounts;
}

export function ReceptionKpis({ counts }: ReceptionKpisProps) {
  const cards = [
    {
      label: 'Reservas del día',
      value: counts.total,
      Icon: CalendarDays,
    },
    {
      label: 'Pendientes de confirmación',
      value: counts.pending,
      Icon: Hourglass,
    },
    {
      label: 'Próximas',
      value: counts.upcoming,
      Icon: CalendarClock,
    },
    {
      label: 'En curso',
      value: counts.inProgress,
      Icon: Clock3,
    },
    {
      label: 'Finalizadas',
      value: counts.completed,
      Icon: CheckCircle2,
    },
    {
      label: 'No asistieron',
      value: counts.noShow,
      Icon: CircleX,
    },
    {
      label: 'Canceladas',
      value: counts.canceled,
      Icon: XCircle,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, Icon }) => (
        <Card key={label} className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {label}
              </p>
              <span className="text-2xl font-black text-foreground tracking-tight block">
                {value}
              </span>
            </div>
            <div className="p-3 rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
