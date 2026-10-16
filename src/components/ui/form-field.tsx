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
}

export function FormField({ id, label, error, required, className, children }: FormFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {children}
      {error && (
        <span id={errorId} role="alert" className="text-xs text-destructive font-medium">
          {error}
        </span>
      )}
    </div>
  );
}
