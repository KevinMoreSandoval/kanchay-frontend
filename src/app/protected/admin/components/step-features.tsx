// Step 2 – Características y tarifas de la cancha

import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { COVER_TYPES, LIGHTING_OPTIONS, SERVICES, AMENITIES } from '../courts/constants';
import type { StepFeaturesData } from '../courts/types';
import type { StepErrors } from '../courts/validations';

export interface StepFeaturesProps {
  data: StepFeaturesData;
  errors: StepErrors<StepFeaturesData>;
  onChange: (data: StepFeaturesData) => void;
}

function RadioGroup<T extends string>({
  label,
  options,
  value,
  error,
  required,
  onChange,
}: {
  id: string;
  label: string;
  options: T[];
  value: T | '';
  error?: string;
  required?: boolean;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label required={required}>{label}</Label>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={opt === value}
            onClick={() => onChange(opt)}
            className={cn(
              'px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-150 cursor-pointer',
              opt === value
                ? 'border-primary bg-primary/10 text-primary font-semibold'
                : 'border-border bg-background text-foreground hover:border-primary/40 hover:bg-accent'
            )}
          >
            {opt}
          </button>
        ))}
      </div>
      {error && (
        <span role="alert" className="text-xs text-destructive font-medium">
          {error}
        </span>
      )}
    </div>
  );
}

function CheckboxGrid({
  label,
  options,
  selected,
  idPrefix,
  onChange,
}: {
  label: string;
  options: { id: string; label: string }[];
  selected: string[];
  idPrefix: string;
  onChange: (ids: string[]) => void;
}) {
  const toggle = (id: string, checked: boolean) => {
    onChange(checked ? [...selected, id] : selected.filter((s) => s !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map((opt) => (
          <label
            key={opt.id}
            htmlFor={`${idPrefix}-${opt.id}`}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 cursor-pointer hover:bg-accent transition-colors text-sm text-foreground select-none"
          >
            <Checkbox
              id={`${idPrefix}-${opt.id}`}
              checked={selected.includes(opt.id)}
              onCheckedChange={(checked) => toggle(opt.id, checked)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}

export function StepFeatures({ data, errors, onChange }: StepFeaturesProps) {
  const update = (partial: Partial<StepFeaturesData>) => onChange({ ...data, ...partial });

  return (
    <div className="space-y-6">
      {/* Dimensiones y capacidad */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField
          id="court-capacity"
          label="Capacidad (jugadores)"
          error={errors.capacity}
          required
        >
          <Input
            id="court-capacity"
            type="number"
            min={1}
            value={data.capacity}
            onChange={(e) => update({ capacity: e.target.value })}
            placeholder="Ej. 10"
            error={!!errors.capacity}
          />
        </FormField>

        <FormField id="court-width" label="Ancho (m)">
          <Input
            id="court-width"
            type="number"
            min={0}
            step={0.5}
            value={data.width}
            onChange={(e) => update({ width: e.target.value })}
            placeholder="Ej. 25"
          />
        </FormField>

        <FormField id="court-length" label="Largo (m)">
          <Input
            id="court-length"
            type="number"
            min={0}
            step={0.5}
            value={data.length}
            onChange={(e) => update({ length: e.target.value })}
            placeholder="Ej. 45"
          />
        </FormField>
      </div>

      {/* Tipo de cancha */}
      <RadioGroup
        id="court-cover-type"
        label="Tipo de cancha"
        options={COVER_TYPES}
        value={data.coverType}
        error={errors.coverType}
        required
        onChange={(v) => update({ coverType: v })}
      />

      {/* Iluminación */}
      <RadioGroup
        id="court-lighting"
        label="Iluminación"
        options={LIGHTING_OPTIONS}
        value={data.lighting}
        error={errors.lighting}
        required
        onChange={(v) => update({ lighting: v })}
      />

      {/* Servicios */}
      <CheckboxGrid
        label="Servicios disponibles"
        options={SERVICES}
        selected={data.services}
        idPrefix="svc"
        onChange={(ids) => update({ services: ids })}
      />

      {/* Instalaciones */}
      <CheckboxGrid
        label="Instalaciones adicionales"
        options={AMENITIES}
        selected={data.amenities}
        idPrefix="amen"
        onChange={(ids) => update({ amenities: ids })}
      />

      {/* Tarifas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          id="court-price"
          label="Precio por hora (S/)"
          error={errors.pricePerHour}
          required
        >
          <Input
            id="court-price"
            type="number"
            min={0}
            step={0.5}
            value={data.pricePerHour}
            onChange={(e) => update({ pricePerHour: e.target.value })}
            placeholder="Ej. 60.00"
            error={!!errors.pricePerHour}
          />
        </FormField>

        <FormField id="court-promo" label="Tarifa promocional (S/)" error={errors.promotionalPrice}>
          <Input
            id="court-promo"
            type="number"
            min={0}
            step={0.5}
            value={data.promotionalPrice}
            onChange={(e) => update({ promotionalPrice: e.target.value })}
            placeholder="Opcional"
            error={!!errors.promotionalPrice}
          />
        </FormField>
      </div>
    </div>
  );
}
