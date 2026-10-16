import { useEffect, useRef, useState, type FormEvent } from 'react';
import { saveManagedUser } from '@/services/auth-service';
import type { User } from '@/types';

export function useCreateClientModal(initialDni: string, onCreated: (user: User) => void) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState({
    dni: initialDni,
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const nextErrors: typeof errors = {};
    const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!form.firstName.trim()) nextErrors.firstName = 'El nombre es obligatorio.';
    else if (!namePattern.test(form.firstName.trim()))
      nextErrors.firstName = 'Solo se permiten letras.';
    if (!form.lastName.trim()) nextErrors.lastName = 'El apellido es obligatorio.';
    else if (!namePattern.test(form.lastName.trim()))
      nextErrors.lastName = 'Solo se permiten letras.';
    if (!/^\d{8}$/.test(form.dni.trim())) nextErrors.dni = 'El DNI debe tener 8 dígitos.';
    if (!form.birthDate) nextErrors.birthDate = 'La fecha de nacimiento es obligatoria.';
    if (!/^\d{9}$/.test(form.phone.trim())) nextErrors.phone = 'El teléfono debe tener 9 dígitos.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      nextErrors.email = 'Ingresa un correo válido.';
    setErrors(nextErrors);
    setError('');
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    setError('');
    try {
      const users = await saveManagedUser({ ...form, role: 'Cliente' });
      const user = users.find((item) => item.dni === form.dni.trim() && item.role === 'Cliente');
      if (!user) throw new Error('No se pudo verificar el usuario creado.');
      onCreated(user);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo crear el usuario.');
    } finally {
      setSaving(false);
    }
  }
  return {
    dialogRef,
    form,
    saving,
    error,
    errors,
    submit,
    updateField: (key: keyof typeof form, value: string) => {
      setForm((previous) => ({ ...previous, [key]: value }));
      setError('');
      setErrors((previous) => ({ ...previous, [key]: undefined }));
    },
  };
}
