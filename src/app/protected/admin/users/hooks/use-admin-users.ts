import { notifyToast } from '@/services/toast-service';
import { useMemo, useState, useRef, type FormEvent } from 'react';
import { deleteManagedUser, saveManagedUser, setUserActive } from '@/services/users/user-service';
import { useUsers } from '@/hooks/use-users';
import type { ManagedUser } from '@/types/users';
import type { User, UserRole } from '@/types';
import { useFormValidation } from '@/hooks/use-form-validation';
import { validateManagedUser, managedUserChanged } from '../validations';

export interface ManagedUserForm {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  dni: string;
  birthDate: string;
  phone: string;
  password: string;
}

const EMPTY_FORM: ManagedUserForm = {
  firstName: '',
  lastName: '',
  email: '',
  role: 'Cliente',
  dni: '',
  birthDate: '',
  phone: '',
  password: '',
};

export function useAdminUsers(currentUserId?: string) {
  const { users, loading, error: loadError, refresh } = useUsers();
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'Todas'>('Todas');
  const [form, setForm] = useState<ManagedUserForm>(EMPTY_FORM);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const validation = useFormValidation(form, (data) => validateManagedUser(data, editingUser));
  const hasChanges = managedUserChanged(form, editingUser);
  const canSave = validation.isValid && hasChanges && !saving && !pendingUserId;

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === 'Todas' || user.role === roleFilter;
      const searchableValue =
        `${user.firstName} ${user.lastName} ${user.email} ${user.dni ?? ''}`.toLocaleLowerCase();
      return matchesRole && searchableValue.includes(normalizedSearch);
    });
  }, [roleFilter, search, users]);

  const openCreateForm = () => {
    if (busy.current) return;
    validation.reset();
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
    setDeleteConfirmationId(null);
    setStatus('');
    setError('');
  };

  const openEditForm = (user: User) => {
    if (busy.current) return;
    validation.reset();
    if (user.id.startsWith('fixed-') || user.id === currentUserId) return;
    setEditingUser(user);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      dni: user.dni ?? '',
      birthDate: user.birthDate ?? '',
      phone: user.phone ?? '',
      password: '',
    });
    setFormOpen(true);
    setDeleteConfirmationId(null);
    setStatus('');
    setError('');
  };

  const closeForm = () => {
    if (busy.current) return;
    resetForm();
  };

  const resetForm = () => {
    validation.reset();
    setFormOpen(false);
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setError('');
  };

  const updateForm = <K extends keyof ManagedUserForm>(key: K, value: ManagedUserForm[K]) => {
    if (busy.current) return;
    validation.touch(key);
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const saveUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy.current) return;
    setError('');
    setStatus('');

    validation.showAll();
    if (!validation.isValid) {
      setError(notifyToast('Revisa los campos marcados antes de guardar el usuario.', 'error'));
      return;
    }
    if (!hasChanges) return;
    busy.current = true;
    setSaving(true);
    try {
      await saveManagedUser({
        ...(editingUser ? { id: editingUser.id } : {}),
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.role,
        dni: form.dni,
        birthDate: form.birthDate,
        phone: form.phone,
        password: form.password || undefined,
      });
      setStatus(
        notifyToast(
          editingUser
            ? 'Los cambios del usuario se guardaron.'
            : 'El usuario se creó correctamente.',
          'success'
        )
      );
      resetForm();
    } catch (saveError) {
      setError(
        notifyToast(
          saveError instanceof Error ? saveError.message : 'No se pudo guardar el usuario.',
          'error'
        )
      );
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  const removeUser = async (id: string) => {
    if (busy.current) return;
    busy.current = true;
    setPendingUserId(id);
    try {
      await deleteManagedUser(id);
      setDeleteConfirmationId(null);
      setStatus(notifyToast('El usuario se eliminó correctamente.', 'success'));
      setError('');
    } catch (deleteError) {
      setError(
        notifyToast(
          deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar el usuario.',
          'error'
        )
      );
    } finally {
      busy.current = false;
      setPendingUserId(null);
    }
  };

  const toggleActive = async (user: ManagedUser) => {
    if (busy.current) return;
    busy.current = true;
    setPendingUserId(user.id);
    try {
      await setUserActive(user.id, !user.active);
      notifyToast(user.active ? 'El usuario se desactivó.' : 'El usuario se activó.', 'success');
    } catch (err) {
      notifyToast(err instanceof Error ? err.message : 'No se pudo cambiar el estado.', 'error');
    } finally {
      busy.current = false;
      setPendingUserId(null);
    }
  };

  return {
    users: filteredUsers,
    fieldErrors: validation.errors,
    touchField: validation.touch,
    canSave,
    hasChanges,
    loading,
    loadError,
    refresh,
    pendingUserId,
    toggleActive,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    form,
    updateForm,
    editingUser,
    formOpen,
    openCreateForm,
    openEditForm,
    closeForm,
    saveUser,
    deleteConfirmationId,
    setDeleteConfirmationId,
    removeUser,
    status,
    error,
    saving,
  };
}
