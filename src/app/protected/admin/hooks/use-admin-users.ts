import { useMemo, useState, type FormEvent } from 'react';
import { deleteManagedUser, getManagedUsers, saveManagedUser } from '@/services/auth-service';
import type { User, UserRole } from '@/types';

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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

export function useAdminUsers(currentUserId?: string) {
  const [users, setUsers] = useState<User[]>(getManagedUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'Todas'>('Todas');
  const [form, setForm] = useState<ManagedUserForm>(EMPTY_FORM);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
    setDeleteConfirmationId(null);
    setStatus('');
    setError('');
  };

  const openEditForm = (user: User) => {
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
    setFormOpen(false);
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setError('');
  };

  const updateForm = <K extends keyof ManagedUserForm>(key: K, value: ManagedUserForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const saveUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setStatus('');

    if (!NAME_REGEX.test(form.firstName.trim()) || !NAME_REGEX.test(form.lastName.trim())) {
      setError('El nombre y el apellido solo pueden contener letras y espacios.');
      return;
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }
    if (form.dni.trim() && !/^\d{8}$/.test(form.dni.trim())) {
      setError('El DNI debe tener 8 dígitos.');
      return;
    }
    if (form.role === 'Cliente' && !form.dni.trim()) {
      setError('El DNI es obligatorio para crear una cuenta de cliente.');
      return;
    }
    if (form.phone.trim() && !/^\d{9}$/.test(form.phone.trim())) {
      setError('El teléfono debe tener 9 dígitos.');
      return;
    }

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
      setUsers(getManagedUsers());
      setStatus(
        editingUser ? 'Los cambios del usuario se guardaron.' : 'El usuario se creó correctamente.'
      );
      closeForm();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el usuario.');
    } finally {
      setSaving(false);
    }
  };

  const removeUser = (id: string) => {
    try {
      setUsers(deleteManagedUser(id));
      setDeleteConfirmationId(null);
      setStatus('El usuario se eliminó correctamente.');
      setError('');
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar el usuario.'
      );
    }
  };

  return {
    users: filteredUsers,
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
