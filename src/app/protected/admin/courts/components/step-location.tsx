// Step 3 – Ubicación y disponibilidad de la cancha

import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CourtAvailabilityDays } from './court-availability-days';
import { normalizeCourtDays } from '@/lib/court-days';

import type { StepLocationData, CourtDraftStatus } from '@/types/courts';
import type { StepErrors } from '../validations';

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

  return (
    <div className="space-y-6">
      {/* Sede */}
      <FormField id="court-venue" label="Sede" error={errors.venue}>
        <Input
          id="court-venue"
          value={data.venue}
          onChange={(e) => update({ venue: e.target.value })}
          placeholder="Ej. Sede Principal"
          error={!!errors.venue}
        />
      </FormField>

      {/* Dirección */}
      <FormField id="court-address" label="Dirección" error={errors.address}>
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

      <CourtAvailabilityDays
        disabled={!data.horaInicio || !data.horaFin}
        days={normalizeCourtDays(data.diasDisponibles)}
        onChange={(diasDisponibles) => update({ diasDisponibles })}
      />
      {(!data.horaInicio || !data.horaFin) && (
        <p className="text-sm text-muted-foreground">
          Configura la hora de inicio y fin para seleccionar los días.
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="court-start-time" label="Hora de inicio" error={errors.horaInicio}>
          <Input
            id="court-start-time"
            type="time"
            value={data.horaInicio}
            onChange={(event) => update({ horaInicio: event.target.value })}
          />
        </FormField>
        <FormField id="court-end-time" label="Hora de fin" error={errors.horaFin}>
          <Input
            id="court-end-time"
            type="time"
            value={data.horaFin}
            onChange={(event) => update({ horaFin: event.target.value })}
          />
        </FormField>
      </div>
      <p className="text-sm text-muted-foreground">
        El mismo horario se aplica a los días habilitados. Si desactivas todos, no se ofrecerán
        horarios.
      </p>
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
