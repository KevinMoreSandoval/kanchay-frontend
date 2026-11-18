import { notifyToast, toast } from '@/services/toast-service';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createClient } from '@/services/clients/client-service';
import type { User } from '@/types';
import { useFormValidation } from '@/hooks/use-form-validation';
import { validateIdentity } from '@/lib/validation';

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
  const busy = useRef(false);
  const validation = useFormValidation(form, (data) =>
    validateIdentity(data, { requireDni: true, requirePhone: true, requireBirthDate: true })
  );
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
    if (busy.current) return;
    validation.showAll();
    if (!validation.isValid) {
      toast.error('Revisa los campos marcados antes de crear el cliente.');
      return;
    }
    busy.current = true;
    setSaving(true);
    setError('');
    try {
      const user = await createClient(form);
      onCreated(user);
    } catch (cause) {
      setError(
        notifyToast(
          cause instanceof Error ? cause.message : 'No se pudo crear el usuario.',
          'error'
        )
      );
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }
  return {
    dialogRef,
    form,
    saving,
    error,
    errors: validation.errors,
    canSubmit: validation.isValid && !saving,
    touchField: validation.touch,
    submit,
    updateField: (key: keyof typeof form, value: string) => {
      if (busy.current) return;
      validation.touch(key);
      setForm((previous) => ({ ...previous, [key]: value }));
      setError('');
    },
  };
}
