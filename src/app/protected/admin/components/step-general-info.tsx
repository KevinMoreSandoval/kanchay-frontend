// Step 1 – Información general de la cancha

import { useId, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loading } from '@/components/ui/loading';
import { cn } from '@/lib/utils';
import { SPORTS, MODALITIES, SURFACES } from '../courts/constants';
import type { StepGeneralData } from '../courts/types';
import type { StepErrors } from '../courts/validations';

export interface StepGeneralInfoProps {
  data: StepGeneralData;
  errors: StepErrors<StepGeneralData>;
  onChange: (data: StepGeneralData) => void;
}

function SelectGroup<T extends string>({
  id,
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
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            id={opt === value ? id : undefined}
            onClick={() => onChange(opt)}
            aria-pressed={opt === value}
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
        <span id={errorId} role="alert" className="text-xs text-destructive font-medium">
          {error}
        </span>
      )}
    </div>
  );
}

export function StepGeneralInfo({ data, errors, onChange }: StepGeneralInfoProps) {
  const photoInputId = useId();
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const update = (partial: Partial<StepGeneralData>) => onChange({ ...data, ...partial });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const readers = files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error(`No se pudo leer la imagen ${file.name}.`));
          reader.readAsDataURL(file);
        })
    );
    setIsLoadingPhotos(true);
    setPhotoError('');
    void Promise.all(readers)
      .then((urls) => {
        const photos = urls.map((src) => ({
          id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          src,
        }));
        update({ photos: [...data.photos, ...photos].slice(0, 6) });
      })
      .catch((error: unknown) => {
        setPhotoError(
          error instanceof Error ? error.message : 'No se pudieron cargar las imágenes.'
        );
      })
      .finally(() => setIsLoadingPhotos(false));
    e.target.value = '';
  };

  const removePhoto = (id: string) => {
    update({ photos: data.photos.filter((photo) => photo.id !== id) });
  };

  return (
    <div className="space-y-6">
      {/* Nombre */}
      <FormField id="court-name" label="Nombre de la cancha" error={errors.name} required>
        <Input
          id="court-name"
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Ej. Cancha Norte – Fútbol 5"
          error={!!errors.name}
          maxLength={80}
        />
      </FormField>

      {/* Deporte */}
      <SelectGroup
        id="court-sport"
        label="Deporte"
        options={SPORTS}
        value={data.sport}
        error={errors.sport}
        required
        onChange={(v) => update({ sport: v })}
      />

      {/* Modalidad */}
      <SelectGroup
        id="court-modality"
        label="Modalidad"
        options={MODALITIES}
        value={data.modality}
        error={errors.modality}
        required
        onChange={(v) => update({ modality: v })}
      />

      {/* Superficie */}
      <SelectGroup
        id="court-surface"
        label="Tipo de superficie"
        options={SURFACES}
        value={data.surface}
        error={errors.surface}
        required
        onChange={(v) => update({ surface: v })}
      />

      {/* Descripción */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="court-description">Descripción</Label>
        <textarea
          id="court-description"
          value={data.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Describe brevemente las condiciones y características de la cancha..."
          maxLength={500}
          rows={3}
          className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 resize-none"
        />
        <span className="text-xs text-muted-foreground text-right">
          {data.description.length}/500
        </span>
      </div>

      {/* Fotografías */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <Label>
            Fotografías <span className="text-muted-foreground font-normal">(máx. 6)</span>
          </Label>
          {isLoadingPhotos && (
            <Loading label="Cargando imágenes..." className="text-xs text-muted-foreground" />
          )}
        </div>
        {photoError && (
          <p role="alert" className="text-xs font-medium text-destructive">
            {photoError}
          </p>
        )}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {data.photos.map((photo, idx) => (
            <div
              key={photo.id}
              className="relative aspect-square rounded-lg overflow-hidden border border-border group"
            >
              <img src={photo.src} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                aria-label={`Eliminar foto ${idx + 1}`}
                className="absolute top-1 right-1 bg-foreground/70 hover:bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X aria-hidden="true" className="h-3 w-3" />
              </button>
            </div>
          ))}

          {data.photos.length < 6 && (
            <label
              htmlFor={photoInputId}
              className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent flex flex-col items-center justify-center cursor-pointer transition-colors gap-1 text-muted-foreground hover:text-primary"
            >
              <ImagePlus aria-hidden="true" className="h-5 w-5" />
              <span className="text-[10px] font-medium">Agregar</span>
              <input
                id={photoInputId}
                type="file"
                accept="image/*"
                multiple
                disabled={isLoadingPhotos}
                className="sr-only"
                onChange={handlePhotoChange}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
