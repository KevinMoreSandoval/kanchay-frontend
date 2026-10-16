import { CalendarDays, LayoutDashboard, Trophy, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface AdminMetrics {
  totalUsers: number;
  totalCourts: number;
  totalReservations: number;
  totalRevenue: number;
}

export interface AdminKpisProps {
  metrics: AdminMetrics;
}

export function AdminKpis({ metrics }: AdminKpisProps) {
  const cards = [
    {
      label: 'Clientes Registrados',
      value: metrics.totalUsers,
      Icon: Users,
      bg: 'bg-purple-50 border-purple-100',
      text: 'text-purple-600',
    },
    {
      label: 'Canchas Habilitadas',
      value: metrics.totalCourts,
      Icon: Trophy,
      bg: 'bg-emerald-50 border-emerald-100',
      text: 'text-emerald-600',
    },
    {
      label: 'Total Reservas',
      value: metrics.totalReservations,
      Icon: CalendarDays,
      bg: 'bg-blue-50 border-blue-100',
      text: 'text-blue-600',
    },
    {
      label: 'Ingresos Estimados',
      value: `S/ ${metrics.totalRevenue.toFixed(0)}`,
      Icon: LayoutDashboard,
      bg: 'bg-emerald-50 border-emerald-100',
      text: 'text-emerald-600',
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
