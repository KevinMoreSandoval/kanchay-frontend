import { useState } from 'react';
import type { FieldErrors } from '@/lib/validation';

export function useFormValidation<T extends object>(
  values: T,
  validate: (values: T) => FieldErrors<T>
) {
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const allErrors = validate(values);
  const errors: FieldErrors<T> = {};
  for (const key of Object.keys(allErrors) as (keyof T)[]) {
    if (touched[key] || (typeof values[key] === 'string' && values[key] !== ''))
      errors[key] = allErrors[key];
  }
  return {
    errors,
    allErrors,
    isValid: Object.keys(allErrors).length === 0,
    touch: (key: keyof T) => setTouched((current) => ({ ...current, [key]: true })),
    showAll: () =>
      setTouched(
        Object.fromEntries(Object.keys(values).map((key) => [key, true])) as Partial<
          Record<keyof T, boolean>
        >
      ),
    reset: () => setTouched({}),
  };
}
