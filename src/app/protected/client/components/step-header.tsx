import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface StepHeaderProps {
  /** Título principal que indica en qué sección se encuentra el usuario */
  title: string;
  /** Subtítulo contextual opcional (ej: nombre de la cancha o sede) */
  subtitle?: string;
  /** Callback para la acción de retroceder */
  onBack: () => void;
  /** Etiqueta accesible para el botón de retroceso */
  backLabel?: string;
  /** Clases adicionales de estilo */
  className?: string;
}

/**
 * Encabezado limpio y minimalista para los pasos del flujo de cliente.
 * Proporciona exclusivamente la opción de retroceder y la indicación de la sección actual.
 */
export const StepHeader: React.FC<StepHeaderProps> = ({
  title,
  subtitle,
  onBack,
  backLabel = 'Regresar al catálogo',
  className,
}) => {
  return (
    <header
      className={cn('flex items-center gap-3.5 py-2 pb-4 border-b border-border/70', className)}
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onBack}
        aria-label={backLabel}
        className="h-9 w-9 shrink-0 cursor-pointer rounded-xl border-border bg-background text-foreground transition-colors hover:bg-muted"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      </Button>
      <div className="min-w-0 flex-1">
        <h1 className="text-lg font-bold text-foreground sm:text-xl truncate">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
      </div>
    </header>
  );
};
