import { Button } from '@/components/ui';
import type { UseCourtFormReturn } from '../hooks/use-court-form';

interface CourtFormActionsProps {
  form: UseCourtFormReturn;
  onSave: () => void;
}

export function CourtFormActions({ form, onSave }: CourtFormActionsProps) {
  const lastStep = form.step === 2;
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button
        type="button"
        variant="outline"
        onClick={form.saveAsDraft}
        disabled={form.isSubmitting || !form.hasChanges}
      >
        Guardar borrador
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={form.goBack}
        disabled={form.step === 0 || form.isSubmitting}
      >
        Anterior
      </Button>
      {!lastStep && (
        <Button
          type="button"
          variant={form.isEditing ? 'secondary' : 'default'}
          onClick={form.goNext}
          disabled={!form.canAdvance || form.isSubmitting}
        >
          Siguiente
        </Button>
      )}
      {(form.isEditing || lastStep) && (
        <Button
          type="button"
          onClick={onSave}
          disabled={!form.canSave || form.isSubmitting || (form.isEditing && !form.hasChanges)}
        >
          {form.isSubmitting
            ? 'Subiendo imágenes y guardando...'
            : form.isEditing
              ? 'Guardar cambios'
              : 'Registrar cancha'}
        </Button>
      )}
    </div>
  );
}
