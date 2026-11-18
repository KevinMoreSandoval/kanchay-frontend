import * as React from 'react';
import { cva } from 'class-variance-authority';
import { CircleCheck, CircleAlert, Info, TriangleAlert, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToastNotification } from '@/types/toast';

const toastVariants = cva(
  'pointer-events-auto flex w-full items-start gap-3 rounded-xl border bg-background p-4 text-foreground shadow-lg motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2',
  {
    variants: {
      variant: {
        success: 'border-success/40 [&_[data-toast-icon]]:text-success',
        error: 'border-destructive/40 [&_[data-toast-icon]]:text-destructive',
        info: 'border-border [&_[data-toast-icon]]:text-primary',
        warning: 'border-warning/40 [&_[data-toast-icon]]:text-warning',
      },
    },
  }
);
const icons = { success: CircleCheck, error: CircleAlert, info: Info, warning: TriangleAlert };
const labels = { success: 'Éxito', error: 'Error', info: 'Información', warning: 'Advertencia' };

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  notification: ToastNotification;
  onDismiss: () => void;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ notification, onDismiss, className, ...props }, ref) => {
    const Icon = icons[notification.variant];
    return (
      <div
        ref={ref}
        role={notification.variant === 'error' ? 'alert' : 'status'}
        aria-atomic="true"
        {...props}
        className={cn(toastVariants({ variant: notification.variant }), className)}
      >
        <Icon data-toast-icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-bold">{notification.title || labels[notification.variant]}</p>
          <p className="break-words text-sm leading-relaxed">{notification.message}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar notificación"
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    );
  }
);
Toast.displayName = 'Toast';
