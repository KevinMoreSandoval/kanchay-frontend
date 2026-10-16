import { useState } from 'react';
import { registerUser, type RegisterUserData } from '@/services/auth-service';
import type { AuthSession } from '@/types';

const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export interface RegisterFormState extends RegisterUserData {
  confirmPassword: string;
  acceptTerms: boolean;
}

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

  const [errors, setErrors] = useState<RegisterErrors>({});
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [termsModalTitle, setTermsModalTitle] = useState<string | null>(null);

  const validate = (): boolean => {
    const nextErrors: RegisterErrors = {};

    if (!formData.firstName.trim()) {
      nextErrors.firstName = 'El nombre es obligatorio.';
    } else if (!NAME_REGEX.test(formData.firstName.trim())) {
      nextErrors.firstName = 'Solo se permiten letras.';
    }

    if (!formData.lastName.trim()) {
      nextErrors.lastName = 'El apellido es obligatorio.';
    } else if (!NAME_REGEX.test(formData.lastName.trim())) {
      nextErrors.lastName = 'Solo se permiten letras.';
    }

    if (!formData.dni.trim()) {
      nextErrors.dni = 'El DNI es obligatorio.';
    } else if (!/^\d{8}$/.test(formData.dni.trim())) {
      nextErrors.dni = 'El DNI debe tener 8 dígitos.';
    }

    if (!formData.birthDate) {
      nextErrors.birthDate = 'La fecha de nacimiento es obligatoria.';
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = 'El teléfono es obligatorio.';
    } else if (!/^\d{9}$/.test(formData.phone.trim())) {
      nextErrors.phone = 'Debe tener 9 dígitos.';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'El correo es obligatorio.';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      nextErrors.email = 'Ingresa un correo válido.';
    }

    if (!formData.password) {
      nextErrors.password = 'La contraseña es obligatoria.';
    } else if (!PASSWORD_REGEX.test(formData.password)) {
      nextErrors.password = 'Mínimo 8 caracteres, mayúscula, minúscula y número.';
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Confirma tu contraseña.';
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    if (!formData.acceptTerms) {
      nextErrors.acceptTerms = 'Debes aceptar los términos y condiciones.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name as keyof RegisterFormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) return;

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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo crear la cuenta.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    errorMessage,
    loading,
    termsModalTitle,
    setTermsModalTitle,
    handleChange,
    handleSubmit,
  };
}
