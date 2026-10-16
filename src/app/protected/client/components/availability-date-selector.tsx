import { useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface AvailabilityDateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

interface DayItem {
  iso: string;
  dayName: string;
  monthName: string;
  dayNum: number;
  isPast: boolean;
  isToday: boolean;
}

function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function AvailabilityDateSelector({
  selectedDate,
  onDateChange,
}: AvailabilityDateSelectorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dateButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isFirstRender = useRef(true);

  const todayIso = useMemo(() => getLocalDateString(new Date()), []);

  // Asegurar que por defecto la fecha seleccionada sea la actual o una fecha válida
  useEffect(() => {
    if (!selectedDate || selectedDate < todayIso) {
      onDateChange(todayIso);
    }
  }, [selectedDate, todayIso, onDateChange]);

  const daysList = useMemo<DayItem[]>(() => {
    const days: DayItem[] = [];
    const baseDate = new Date();
    // 4 días pasados para permitir que la fecha actual se posicione al medio del carrusel
    const PAST_DAYS = 4;
    // 14 días a futuro disponibles para reservar
    const FUTURE_DAYS = 14;

    for (let i = -PAST_DAYS; i <= FUTURE_DAYS; i++) {
      const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + i);
      const iso = getLocalDateString(date);
      const isPast = iso < todayIso;
      const isToday = iso === todayIso;

      const rawDayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
      const rawMonthName = date.toLocaleDateString('es-ES', { month: 'short' });

      days.push({
        iso,
        dayName: rawDayName.replace('.', '').toUpperCase(),
        monthName: rawMonthName.replace('.', '').toUpperCase(),
        dayNum: date.getDate(),
        isPast,
        isToday,
      });
    }
    return days;
  }, [todayIso]);

  // Centrado automático del carrusel en la fecha seleccionada (o fecha actual)
  useEffect(() => {
    const targetDate = selectedDate || todayIso;

    const centerTargetDate = (behavior: ScrollBehavior) => {
      const activeElement = dateButtonRefs.current[targetDate];
      const container = scrollContainerRef.current;

      if (activeElement && container) {
        const activeRect = activeElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const relativeLeft = activeRect.left - containerRect.left;
        const targetScroll =
          container.scrollLeft + relativeLeft - containerRect.width / 2 + activeRect.width / 2;

        container.scrollTo({
          left: Math.max(0, targetScroll),
          behavior,
        });
      }
    };

    if (isFirstRender.current) {
      const frameId = requestAnimationFrame(() => {
        centerTargetDate('instant');
        isFirstRender.current = false;
      });
      return () => cancelAnimationFrame(frameId);
    }

    centerTargetDate('smooth');
  }, [selectedDate, todayIso]);

  const currentIndex = useMemo(() => {
    const targetDate = selectedDate || todayIso;
    const idx = daysList.findIndex((d) => d.iso === targetDate);
    return idx >= 0 ? idx : daysList.findIndex((d) => d.iso === todayIso);
  }, [daysList, selectedDate, todayIso]);

  const canGoPrev = currentIndex > 0 && !daysList[currentIndex - 1].isPast;
  const canGoNext = currentIndex < daysList.length - 1;

  const handlePrev = () => {
    if (!canGoPrev) return;
    const prevDate = daysList[currentIndex - 1].iso;
    onDateChange(prevDate);
  };

  const handleNext = () => {
    if (!canGoNext) return;
    const nextDate = daysList[currentIndex + 1].iso;
    onDateChange(nextDate);
  };

  return (
    <section aria-label="Seleccionar fecha" className="space-y-3">
      {/* Encabezado limpio sin badge de mes */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Selecciona la fecha
        </h2>
      </div>

      {/* Carrusel interactivo */}
      <div className="relative flex items-center gap-1 sm:gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handlePrev}
          disabled={!canGoPrev}
          aria-disabled={!canGoPrev}
          className={cn(
            'h-9 w-9 shrink-0 rounded-full border-border bg-background text-foreground shadow-sm transition-colors z-20',
            canGoPrev
              ? 'cursor-pointer hover:bg-muted'
              : 'opacity-40 cursor-not-allowed hover:bg-background'
          )}
          aria-label="Seleccionar fecha anterior"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>

        <div className="relative w-full overflow-hidden">
          {/* Sombras degradadas sutiles en los bordes para estética de carrusel */}
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10"
            aria-hidden="true"
          />

          <div
            ref={scrollContainerRef}
            className="flex w-full items-center gap-3 overflow-x-auto scroll-smooth py-3 px-6 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {daysList.map((day) => {
              const isSelected = selectedDate === day.iso;
              const isPast = day.isPast;
              const isToday = day.isToday;

              if (isPast) {
                return (
                  <button
                    key={day.iso}
                    ref={(element) => {
                      dateButtonRefs.current[day.iso] = element;
                    }}
                    type="button"
                    disabled
                    aria-disabled="true"
                    aria-label={`${day.dayNum} de ${day.monthName} (Fecha pasada, no disponible)`}
                    className="flex h-[92px] min-w-[78px] shrink-0 flex-col items-center justify-center rounded-2xl border border-border/40 bg-muted/20 px-2 py-2.5 text-muted-foreground/40 opacity-40 cursor-not-allowed select-none snap-center"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                      {day.dayName}
                    </span>
                    <span className="my-1 text-2xl font-black tracking-tight text-muted-foreground/50">
                      {day.dayNum}
                    </span>
                    <span className="text-[9px] font-medium text-muted-foreground/40 capitalize">
                      {day.monthName}
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={day.iso}
                  ref={(element) => {
                    dateButtonRefs.current[day.iso] = element;
                  }}
                  type="button"
                  onClick={() => onDateChange(day.iso)}
                  aria-pressed={isSelected}
                  aria-label={`${isToday ? 'Hoy, ' : ''}${day.dayNum} de ${day.monthName}`}
                  className={cn(
                    'flex h-[94px] min-w-[80px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-2xl px-2 py-2.5 snap-center transition-all duration-200',
                    isSelected
                      ? 'scale-105 border-2 border-primary bg-primary text-white shadow-lg shadow-primary/25 ring-2 ring-primary/20 z-10'
                      : 'border border-border bg-card text-card-foreground shadow-xs hover:border-primary/50 hover:bg-primary/5'
                  )}
                >
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-wider',
                      isSelected
                        ? 'text-white/80'
                        : isToday
                          ? 'text-primary font-black'
                          : 'text-muted-foreground'
                    )}
                  >
                    {isToday ? 'Hoy' : day.dayName}
                  </span>
                  <span
                    className={cn(
                      'my-1 text-2xl font-black tracking-tight',
                      isSelected ? 'text-white' : 'text-foreground'
                    )}
                  >
                    {day.dayNum}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-semibold capitalize',
                      isSelected ? 'text-white/90' : 'text-muted-foreground'
                    )}
                  >
                    {day.monthName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={!canGoNext}
          aria-disabled={!canGoNext}
          className={cn(
            'h-9 w-9 shrink-0 rounded-full border-border bg-background text-foreground shadow-sm transition-colors z-20',
            canGoNext
              ? 'cursor-pointer hover:bg-muted'
              : 'opacity-40 cursor-not-allowed hover:bg-background'
          )}
          aria-label="Seleccionar fecha siguiente"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
