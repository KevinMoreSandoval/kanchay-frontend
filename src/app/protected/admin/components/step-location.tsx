// Step 3 – Ubicación y disponibilidad de la cancha

import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { WEEK_DAYS } from '../courts/constants';
import type { StepLocationData, CourtDraftStatus } from '../courts/types';
import type { StepErrors } from '../courts/validations';

export interface StepLocationProps {
  data: StepLocationData;
  errors: StepErrors<StepLocationData>;
  onChange: (data: StepLocationData) => void;
}

const STATUS_OPTIONS: { value: CourtDraftStatus; label: string; color: string }[] = [
  {
    value: 'activa',
    label: 'Disponible',
    color: 'text-emerald-600 border-emerald-400 bg-emerald-50',
  },
  {
    value: 'inactiva',
    label: 'No disponible',
    color: 'text-amber-600 border-amber-400 bg-amber-50',
  },
  {
    value: 'borrador',
    label: 'Mantenimiento',
    color: 'text-violet-700 border-violet-400 bg-violet-50',
  },
];

export function StepLocation({ data, errors, onChange }: StepLocationProps) {
  const update = (partial: Partial<StepLocationData>) => onChange({ ...data, ...partial });

  const updateScheduleEntry = (
    day: string,
    partial: Partial<StepLocationData['schedule'][number]>
  ) => {
    update({
      schedule: data.schedule.map((entry) =>
        entry.day === day ? { ...entry, ...partial } : entry
      ),
    });
  };

  return (
    <div className="space-y-6">
      {/* Sede */}
      <FormField id="court-venue" label="Sede" error={errors.venue} required>
        <Input
          id="court-venue"
          value={data.venue}
          onChange={(e) => update({ venue: e.target.value })}
          placeholder="Ej. Sede Principal"
          error={!!errors.venue}
        />
      </FormField>

      {/* Dirección */}
      <FormField id="court-address" label="Dirección" error={errors.address} required>
        <Input
          id="court-address"
          value={data.address}
          onChange={(e) => update({ address: e.target.value })}
          placeholder="Ej. Av. Los Olivos 234, Lima"
          error={!!errors.address}
        />
      </FormField>

      {/* Referencia */}
      <FormField id="court-reference" label="Referencia">
        <Input
          id="court-reference"
          value={data.reference}
          onChange={(e) => update({ reference: e.target.value })}
          placeholder="Ej. A 2 cuadras del parque principal"
        />
      </FormField>

      {/* Horarios */}
      <div className="flex flex-col gap-3">
        <Label>
          Días y horarios de atención <span className="ml-1 text-destructive">*</span>
        </Label>

        {errors.schedule && (
          <span role="alert" className="text-xs text-destructive font-medium">
            {errors.schedule as string}
          </span>
        )}

        <div className="space-y-2">
          {WEEK_DAYS.map((day) => {
            const entry = data.schedule.find((schedule) => schedule.day === day);
            if (!entry) return null;

            return (
              <div
                key={day}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 sm:grid-cols-[minmax(100px,1fr)_minmax(180px,1fr)_minmax(180px,1fr)_auto]"
              >
                <span className="text-sm font-semibold text-foreground">{day}</span>

                <div className="order-3 flex items-center gap-2 sm:order-none">
                  <span className="text-xs font-medium text-muted-foreground">Abre</span>
                  <Input
                    type="time"
                    value={entry.opens}
                    onChange={(e) => updateScheduleEntry(day, { opens: e.target.value })}
                    aria-label={`Hora de apertura ${day}`}
                    disabled={!entry.isOpen}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="order-4 flex items-center gap-2 sm:order-none">
                  <span className="text-xs font-medium text-muted-foreground">Cierra</span>
                  <Input
                    type="time"
                    value={entry.closes}
                    onChange={(e) => updateScheduleEntry(day, { closes: e.target.value })}
                    aria-label={`Hora de cierre ${day}`}
                    disabled={!entry.isOpen}
                    className="h-9 text-sm"
                  />
                </div>

                <label className="order-2 flex items-center justify-end gap-2 sm:order-none">
                  <span className="text-xs font-medium text-muted-foreground">
                    {entry.isOpen ? 'Atiende' : 'Cerrado'}
                  </span>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={entry.isOpen}
                    onChange={(event) => updateScheduleEntry(day, { isOpen: event.target.checked })}
                    aria-label={`${day}: ${entry.isOpen ? 'atiende' : 'no atiende'}`}
                    className={cn(
                      'relative h-5 w-9 appearance-none rounded-full bg-muted transition-colors before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-background before:shadow-sm before:transition-transform checked:bg-primary checked:before:translate-x-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                    )}
                  />
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estado inicial */}
      <div className="flex flex-col gap-1.5">
        <Label>Estado inicial de la cancha</Label>
        <div className="flex gap-2" role="radiogroup" aria-label="Estado inicial">
          {STATUS_OPTIONS.map(({ value, label, color }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={data.status === value}
              onClick={() => update({ status: value })}
              className={cn(
                'px-4 py-1.5 rounded-full border text-sm font-semibold transition-all duration-150 cursor-pointer',
                data.status === value
                  ? color
                  : 'border-border bg-background text-muted-foreground hover:bg-accent'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
