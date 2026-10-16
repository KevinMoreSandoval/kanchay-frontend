import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepperStep {
  label: string;
  description: string;
}

export interface FormStepperProps {
  steps: StepperStep[];
  currentStep: number;
}

export function FormStepper({ steps, currentStep }: FormStepperProps) {
  return (
    <nav aria-label="Progreso del formulario" className="w-full">
      <ol className="flex items-start gap-0">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <li
              key={step.label}
              aria-label={`${step.label}: ${step.description}`}
              className="flex-1 flex flex-col items-center relative"
            >
              {/* Línea de conexión izquierda */}
              {idx > 0 && (
                <div
                  aria-hidden="true"
                  className={cn(
                    'absolute top-4 right-1/2 h-0.5 w-full -translate-y-1/2 transition-colors duration-300',
                    isCompleted || isActive ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}

              {/* Círculo del paso */}
              <div
                className={cn(
                  'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 text-xs font-bold',
                  isCompleted
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isActive
                      ? 'border-primary bg-background text-primary ring-4 ring-primary/10'
                      : 'border-border bg-background text-muted-foreground'
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? (
                  <Check aria-hidden="true" className="h-4 w-4 stroke-[3]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Etiqueta */}
              <div className="mt-2 text-center px-1 hidden sm:block">
                <p
                  className={cn(
                    'text-xs font-semibold leading-tight',
                    isActive
                      ? 'text-primary'
                      : isCompleted
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
