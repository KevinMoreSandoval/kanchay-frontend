import { useId } from 'react';
import { Label, Switch } from '@/components/ui';
import { COURT_WEEK_DAYS } from '@/lib/court-days';
import type { CourtDay } from '@/types/courts';

interface CourtAvailabilityDaysProps {
  days: CourtDay[];
  onChange: (days: CourtDay[]) => void;
  disabled?: boolean;
}

export function CourtAvailabilityDays({ days, onChange, disabled }: CourtAvailabilityDaysProps) {
  const id = useId();
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-foreground">Días disponibles</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {COURT_WEEK_DAYS.map((day) => {
          const enabled = days.includes(day.value);
          return (
            <div
              key={day.value}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-3 py-2.5"
            >
              <Label htmlFor={`${id}-${day.value}`} className="cursor-pointer">
                {day.label}
              </Label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {enabled ? 'Disponible' : 'Cerrado'}
                </span>
                <Switch
                  id={`${id}-${day.value}`}
                  aria-label={`Disponibilidad: ${day.label}`}
                  checked={enabled}
                  disabled={disabled}
                  onChange={(event) => {
                    const next = event.target.checked
                      ? [...days, day.value]
                      : days.filter((value) => value !== day.value);
                    onChange(
                      COURT_WEEK_DAYS.filter((item) => next.includes(item.value)).map(
                        (item) => item.value
                      )
                    );
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
