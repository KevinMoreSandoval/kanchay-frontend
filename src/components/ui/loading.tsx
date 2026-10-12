import { cn } from '@/lib/utils';

export interface LoadingProps {
  label?: string;
  className?: string;
}

export function Loading({ label = 'Cargando...', className }: LoadingProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn('inline-flex items-center gap-2', className)}
    >
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      />
      <span>{label}</span>
    </span>
  );
}
