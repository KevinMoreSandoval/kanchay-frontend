import { notifyToast, toast } from '@/services/toast-service';
import { useState, useRef } from 'react';
import type { LoginCredentials } from '@/services/auth-service';
import type { AuthSession } from '@/types';

import { useFormValidation } from '@/hooks/use-form-validation';
import { validateLoginForm } from '../validations';

export interface LoginErrors {
  email?: string;
  password?: string;
}

export interface UseLoginFormProps {
  onLoginSuccess?: (credentials: LoginCredentials) => Promise<AuthSession>;
}

export function useLoginForm({ onLoginSuccess }: UseLoginFormProps) {
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const validation = useFormValidation(formData, validateLoginForm);
  const busy = useRef(false);
  const [authError, setAuthError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [forgotNotification, setForgotNotification] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    validation.touch(name as keyof LoginCredentials);
    if (authError) setAuthError('');
    if (forgotNotification) setForgotNotification('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy.current) return;
    setAuthError('');
    setForgotNotification('');

    validation.showAll();
    if (!validation.isValid || !onLoginSuccess) {
      toast.error('Revisa tu correo y contraseña para continuar.');
      return;
    }

    busy.current = true;
    setIsSubmitting(true);
    try {
      await onLoginSuccess?.({
        email: formData.email.trim(),
        password: formData.password,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo iniciar sesión.';
      setAuthError(notifyToast(message, 'error'));
    } finally {
      busy.current = false;
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors: validation.errors,
    canSubmit: validation.isValid && !isSubmitting && Boolean(onLoginSuccess),
    handleBlur: (event: React.FocusEvent<HTMLInputElement>) =>
      validation.touch(event.target.name as keyof LoginCredentials),
    authError,
    isSubmitting,
    forgotNotification,
    setForgotNotification,
    handleChange,
    handleSubmit,
  };
}
