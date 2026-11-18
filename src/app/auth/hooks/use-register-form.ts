import { notifyToast, toast } from '@/services/toast-service';
import { useState, useRef } from 'react';
import { registerUser } from '@/services/auth-service';
import type { AuthSession } from '@/types';

import { useFormValidation } from '@/hooks/use-form-validation';
import { validateRegisterForm, type RegisterFormState } from '../validations';
export type { RegisterFormState } from '../validations';
export type RegisterErrors = Partial<Record<keyof RegisterFormState, string>>;

export interface UseRegisterFormProps {
  onRegisterSuccess?: (session: AuthSession) => void;
}

export function useRegisterForm({ onRegisterSuccess }: UseRegisterFormProps) {
  const [formData, setFormData] = useState<RegisterFormState>({
    firstName: '',
    lastName: '',
    dni: '',
    birthDate: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const validation = useFormValidation(formData, validateRegisterForm);
  const busy = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [termsModalTitle, setTermsModalTitle] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    validation.touch(name as keyof RegisterFormState);
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy.current) return;
    setErrorMessage('');

    validation.showAll();
    if (!validation.isValid) {
      toast.error('Revisa los campos marcados para crear tu cuenta.');
      return;
    }

    busy.current = true;
    setLoading(true);
    try {
      const data = await registerUser({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dni: formData.dni.trim(),
        birthDate: formData.birthDate,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      onRegisterSuccess?.(data);
      toast.success('Cuenta creada correctamente.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo crear la cuenta.';
      setErrorMessage(notifyToast(message, 'error'));
    } finally {
      busy.current = false;
      setLoading(false);
    }
  };

  return {
    formData,
    errors: validation.errors,
    canSubmit: validation.isValid && !loading,
    handleBlur: (event: React.FocusEvent<HTMLInputElement>) =>
      validation.touch(event.target.name as keyof RegisterFormState),
    errorMessage,
    loading,
    termsModalTitle,
    setTermsModalTitle,
    handleChange,
    handleSubmit,
  };
}
