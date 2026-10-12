import { useState } from 'react';
import type { LoginCredentials } from '@/services/auth-service';
import type { AuthSession } from '@/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [errors, setErrors] = useState<LoginErrors>({});
  const [authError, setAuthError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [forgotNotification, setForgotNotification] = useState<string>('');

  const validate = (): boolean => {
    const nextErrors: LoginErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      nextErrors.email = 'Ingresa un correo electrónico válido.';
    }

    if (!formData.password) {
      nextErrors.password = 'La contraseña es obligatoria.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof LoginErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (authError) setAuthError('');
    if (forgotNotification) setForgotNotification('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setForgotNotification('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onLoginSuccess?.({
        email: formData.email.trim(),
        password: formData.password,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo iniciar sesión.';
      setAuthError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    authError,
    isSubmitting,
    forgotNotification,
    setForgotNotification,
    handleChange,
    handleSubmit,
  };
}
