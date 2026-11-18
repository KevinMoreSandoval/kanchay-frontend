import * as React from 'react';
import { Label } from './label';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
}

export function FormField({
  id,
  label,
  error,
  required,
  className,
  children,
  onBlur,
}: FormFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className={cn('flex flex-col gap-1.5', className)} onBlur={onBlur}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {React.Children.map(children, (child) => {
        if (
          !React.isValidElement<React.HTMLAttributes<HTMLElement>>(child) ||
          child.props.id !== id
        )
          return child;
        const describedBy = [
          ...new Set(
            `${child.props['aria-describedby'] ?? ''} ${error ? errorId : ''}`
              .split(/\s+/)
              .filter(Boolean)
          ),
        ].join(' ');
        return React.cloneElement(child, {
          'aria-invalid': error ? true : child.props['aria-invalid'],
          'aria-describedby': describedBy || undefined,
        });
      })}
      {error && (
        <span id={errorId} role="alert" className="text-xs text-destructive font-medium">
          {error}
        </span>
      )}
    </div>
  );
}
