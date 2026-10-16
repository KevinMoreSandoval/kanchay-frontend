import { useMemo, useState } from 'react';
import { Ban, CalendarX2, Check, Clock, Moon, Sun, Sunrise, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  price: number;
  available: boolean;
}

export type SlotPeriod = 'all' | 'morning' | 'afternoon' | 'evening';

interface AvailabilityTimeSlotsProps {
  availableSlots: TimeSlot[];
  selectedSlots: TimeSlot[];
  hourlyRate?: number;
  onToggleSlot: (slot: TimeSlot) => void;
}

interface TimeSlotGroupProps {
  title: string;
  hours: string;
  Icon: LucideIcon;
  slots: TimeSlot[];
  selectedSlots: TimeSlot[];
  onToggleSlot: (slot: TimeSlot) => void;
}

function TimeSlotGroup({
  title,
  hours,
  Icon,
  slots,
  selectedSlots,
  onToggleSlot,
}: TimeSlotGroupProps) {
  if (slots.length === 0) return null;

  return (
    <section className="space-y-3" aria-label={`Horarios turno ${title}`}>
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>{title}</span>
          <span className="text-[11px] font-normal text-muted-foreground/70 lowercase">
            • {hours}
          </span>
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {slots.map((slot) => (
          <TimeSlotButton
            key={slot.id}
            slot={slot}
            isSelected={selectedSlots.some((selectedSlot) => selectedSlot.id === slot.id)}
            onToggleSlot={onToggleSlot}
          />
        ))}
      </div>
    </section>
  );
}

interface TimeSlotButtonProps {
  slot: TimeSlot;
  isSelected: boolean;
  onToggleSlot: (slot: TimeSlot) => void;
}

function TimeSlotButton({ slot, isSelected, onToggleSlot }: TimeSlotButtonProps) {
  if (!slot.available) {
    return (
      <div
        aria-disabled="true"
        className="flex cursor-not-allowed select-none items-center justify-between rounded-2xl border border-border/40 bg-muted/20 p-3 text-left opacity-50"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground/50">
            <Ban className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground/70 sm:text-sm">
            {slot.startTime} - {slot.endTime}
          </span>
        </div>
        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
          Ocupado
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onToggleSlot(slot)}
      aria-pressed={isSelected}
      className={cn(
        'group flex cursor-pointer items-center justify-between rounded-2xl p-3 transition-all duration-200 select-none text-left',
        isSelected
          ? 'border-2 border-primary bg-primary/8 text-foreground shadow-xs ring-1 ring-primary/20'
          : 'border border-border bg-card text-card-foreground shadow-2xs hover:border-primary/40 hover:bg-primary/5 hover:shadow-xs'
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-200',
            isSelected
              ? 'bg-primary text-white shadow-xs scale-105'
              : 'bg-primary/10 text-primary group-hover:bg-primary/15'
          )}
        >
          {isSelected ? (
            <Check className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
          ) : (
            <Clock className="h-4 w-4" aria-hidden="true" />
          )}
        </div>
        <span className="text-xs font-bold tracking-tight sm:text-sm text-foreground">
          {slot.startTime} - {slot.endTime}
        </span>
      </div>
      {isSelected && (
        <span className="h-2 w-2 rounded-full bg-primary shrink-0" aria-hidden="true" />
      )}
    </button>
  );
}

export function AvailabilityTimeSlots({
  availableSlots,
  selectedSlots,
  onToggleSlot,
}: AvailabilityTimeSlotsProps) {
  const [activeFilter, setActiveFilter] = useState<SlotPeriod>('all');

  const groupedSlots = useMemo(() => {
    const getHour = (slot: TimeSlot) => parseInt(slot.startTime.split(':')[0], 10);

    return {
      morning: availableSlots.filter((slot) => getHour(slot) >= 8 && getHour(slot) < 12),
      afternoon: availableSlots.filter((slot) => getHour(slot) >= 12 && getHour(slot) < 18),
      evening: availableSlots.filter((slot) => getHour(slot) >= 18),
    };
  }, [availableSlots]);

  const filterOptions: {
    id: SlotPeriod;
    label: string;
    hours: string;
    Icon: LucideIcon;
  }[] = [
    {
      id: 'all',
      label: 'Todos',
      hours: '08:00 - 22:00',
      Icon: Clock,
    },
    {
      id: 'morning',
      label: 'Mañana',
      hours: '08:00 - 12:00',
      Icon: Sunrise,
    },
    {
      id: 'afternoon',
      label: 'Tarde',
      hours: '12:00 - 18:00',
      Icon: Sun,
    },
    {
      id: 'evening',
      label: 'Noche',
      hours: '18:00 - 22:00',
      Icon: Moon,
    },
  ];

  const shouldShowMorning = activeFilter === 'all' || activeFilter === 'morning';
  const shouldShowAfternoon = activeFilter === 'all' || activeFilter === 'afternoon';
  const shouldShowEvening = activeFilter === 'all' || activeFilter === 'evening';

  return (
    <div className="space-y-6">
      {/* Badges de filtrado por turno */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Filtrar por horario:
        </span>
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filtrar turnos del día"
        >
          {filterOptions.map((opt) => {
            const isActive = activeFilter === opt.id;
            const Icon = opt.Icon;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setActiveFilter(isActive && opt.id !== 'all' ? 'all' : opt.id)}
                aria-pressed={isActive}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all duration-200 select-none',
                  isActive
                    ? 'scale-[1.02] border-primary bg-primary text-white shadow-md shadow-primary/25 ring-2 ring-primary/20'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-muted/50 hover:text-foreground shadow-2xs'
                )}
              >
                <Icon
                  className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-primary')}
                  aria-hidden="true"
                />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de grupos de horarios según el filtro activo o estado vacío si no hay intervalos */}
      {availableSlots.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/20 p-8 sm:p-10 text-center space-y-3 animate-in fade-in duration-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground shadow-2xs">
            <CalendarX2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <p className="font-bold text-foreground text-sm sm:text-base">
              No hay horarios disponibles para esta fecha
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Los intervalos de hoy ya pasaron o la cancha no cuenta con turnos disponibles en esta
              fecha. Por favor, selecciona una fecha posterior en el calendario.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {shouldShowMorning && (
            <TimeSlotGroup
              title="Mañana"
              hours="08:00 - 12:00"
              Icon={Sunrise}
              slots={groupedSlots.morning}
              selectedSlots={selectedSlots}
              onToggleSlot={onToggleSlot}
            />
          )}
          {shouldShowAfternoon && (
            <TimeSlotGroup
              title="Tarde"
              hours="12:00 - 18:00"
              Icon={Sun}
              slots={groupedSlots.afternoon}
              selectedSlots={selectedSlots}
              onToggleSlot={onToggleSlot}
            />
          )}
          {shouldShowEvening && (
            <TimeSlotGroup
              title="Noche"
              hours="18:00 - 22:00"
              Icon={Moon}
              slots={groupedSlots.evening}
              selectedSlots={selectedSlots}
              onToggleSlot={onToggleSlot}
            />
          )}

          {/* Estado vacío si no hay slots en el turno filtrado */}
          {activeFilter !== 'all' &&
            ((activeFilter === 'morning' && groupedSlots.morning.length === 0) ||
              (activeFilter === 'afternoon' && groupedSlots.afternoon.length === 0) ||
              (activeFilter === 'evening' && groupedSlots.evening.length === 0)) && (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground space-y-3">
                <p className="font-semibold text-foreground">
                  No hay horarios disponibles en este turno para la fecha seleccionada.
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Prueba cambiando de fecha o revisa los demás turnos disponibles.
                </p>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveFilter('all')}
                    className="cursor-pointer rounded-xl"
                  >
                    Ver todos los turnos
                  </Button>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
