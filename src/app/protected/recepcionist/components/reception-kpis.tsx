import { CalendarDays, CheckCircle2, CircleX, Clock3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface ReceptionKpiCounts {
  total: number;
  inProgress: number;
  completed: number;
  noShow: number;
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
      bg: 'bg-emerald-50 border-emerald-100',
      text: 'text-emerald-600',
    },
    {
      label: 'En curso',
      value: counts.inProgress,
      Icon: Clock3,
      bg: 'bg-purple-50 border-purple-100',
      text: 'text-purple-600',
    },
    {
      label: 'Finalizadas',
      value: counts.completed,
      Icon: CheckCircle2,
      bg: 'bg-blue-50 border-blue-100',
      text: 'text-blue-600',
    },
    {
      label: 'No asistieron',
      value: counts.noShow,
      Icon: CircleX,
      bg: 'bg-rose-50 border-rose-100',
      text: 'text-rose-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, Icon, bg, text }) => (
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
            <div className={`p-3 rounded-xl border ${bg} ${text}`}>
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
