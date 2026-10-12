import {
  KeyRound,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UserRoundPlus,
  Users,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Loading } from '@/components/ui/loading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { User, UserRole } from '@/types';
import { useAdminUsers } from '../hooks/use-admin-users';

const USER_ROLES: UserRole[] = ['Cliente', 'Recepcionista', 'Administrador'];

export interface UsersManagementProps {
  currentUser?: User | null;
}

export function UsersManagement({ currentUser }: UsersManagementProps) {
  const management = useAdminUsers(currentUser?.id);
  const isCreatingClient = !management.editingUser && management.form.role === 'Cliente';
  const passwordRequired =
    management.form.role !== 'Cliente' &&
    (!management.editingUser || management.editingUser.role !== management.form.role);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <FormField id="users-search" label="Buscar usuario">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="users-search"
              type="search"
              value={management.search}
              onChange={(event) => management.setSearch(event.target.value)}
              placeholder="Nombre, correo o DNI"
              className="pl-9"
            />
          </div>
        </FormField>
        <FormField id="users-role-filter" label="Filtrar por rol">
          <select
            id="users-role-filter"
            value={management.roleFilter}
            onChange={(event) => management.setRoleFilter(event.target.value as UserRole | 'Todas')}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="Todas">Todos los roles</option>
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Usuarios registrados</CardTitle>
              <CardDescription>
                Consulta y administra las cuentas de clientes y personal.
              </CardDescription>
            </div>
            <Button type="button" onClick={management.openCreateForm}>
              <Plus aria-hidden="true" />
              Nuevo usuario
            </Button>
          </div>
          {management.status && (
            <p role="status" className="text-sm font-medium text-primary">
              {management.status}
            </p>
          )}
          {management.error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {management.error}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {management.users.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users aria-hidden="true" className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-foreground">
                {management.search || management.roleFilter !== 'Todas'
                  ? 'No hay usuarios que coincidan'
                  : 'Aún no hay usuarios'}
              </h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Ajusta la búsqueda o el filtro para encontrar una cuenta.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {management.users.map((managedUser) => {
                  const isSystemUser = managedUser.id.startsWith('fixed-');
                  const isCurrentUser = managedUser.id === currentUser?.id;
                  const confirmingDelete = management.deleteConfirmationId === managedUser.id;

                  return (
                    <TableRow key={managedUser.id}>
                      <TableCell>
                        <p className="font-semibold text-foreground">
                          {managedUser.firstName} {managedUser.lastName}
                        </p>
                        {(isSystemUser || isCurrentUser) && (
                          <p className="text-xs text-muted-foreground">
                            {isSystemUser ? 'Cuenta fija del sistema' : 'Tu cuenta'}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <p>{managedUser.email}</p>
                        {managedUser.phone && (
                          <p className="text-xs text-muted-foreground">{managedUser.phone}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{managedUser.role}</Badge>
                      </TableCell>
                      <TableCell>{managedUser.dni || '—'}</TableCell>
                      <TableCell>
                        {isSystemUser || isCurrentUser ? (
                          <p className="text-right text-xs text-muted-foreground">Protegida</p>
                        ) : confirmingDelete ? (
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs text-muted-foreground">
                              ¿Eliminar usuario?
                            </span>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => management.setDeleteConfirmationId(null)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => management.removeUser(managedUser.id)}
                              >
                                Confirmar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Editar a ${managedUser.firstName} ${managedUser.lastName}`}
                              onClick={() => management.openEditForm(managedUser)}
                            >
                              <Pencil aria-hidden="true" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Eliminar a ${managedUser.firstName} ${managedUser.lastName}`}
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => management.setDeleteConfirmationId(managedUser.id)}
                            >
                              <Trash2 aria-hidden="true" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {management.formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <Card
            role="dialog"
            aria-modal="true"
            aria-labelledby="managed-user-modal-title"
            aria-describedby="managed-user-modal-description"
            className="my-auto flex max-h-[min(90vh,52rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border-border/80 shadow-2xl"
          >
            <CardHeader className="shrink-0 flex-row items-start justify-between gap-4 border-b border-border bg-muted/20 px-6 py-5 sm:px-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                  {management.editingUser ? (
                    <UserRound aria-hidden="true" className="h-6 w-6" />
                  ) : (
                    <UserRoundPlus aria-hidden="true" className="h-6 w-6" />
                  )}
                </div>
                <div className="space-y-1.5 pt-0.5">
                  <CardTitle id="managed-user-modal-title" className="text-lg">
                    {management.editingUser ? 'Editar usuario' : 'Crear usuario'}
                  </CardTitle>
                  <CardDescription id="managed-user-modal-description">
                    {management.editingUser
                      ? 'Actualiza los datos de la cuenta. El DNI no se puede modificar.'
                      : 'Registra una cuenta nueva y asigna sus datos de acceso.'}
                  </CardDescription>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Cerrar formulario"
                onClick={management.closeForm}
                className="-mr-2 -mt-2 shrink-0"
              >
                <X aria-hidden="true" />
              </Button>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 overflow-hidden px-6 py-5 sm:px-8">
              <form onSubmit={management.saveUser} className="flex h-full min-h-0 flex-col">
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pb-2 pr-1">
                  <section aria-labelledby="managed-user-personal-heading" className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-border pb-2">
                      <UserRound aria-hidden="true" className="h-4 w-4 text-primary" />
                      <h4
                        id="managed-user-personal-heading"
                        className="text-sm font-semibold text-foreground"
                      >
                        Información personal
                      </h4>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField id="managed-user-first-name" label="Nombre" required>
                        <Input
                          id="managed-user-first-name"
                          value={management.form.firstName}
                          onChange={(event) =>
                            management.updateForm('firstName', event.target.value)
                          }
                          autoComplete="given-name"
                          required
                        />
                      </FormField>
                      <FormField id="managed-user-last-name" label="Apellido" required>
                        <Input
                          id="managed-user-last-name"
                          value={management.form.lastName}
                          onChange={(event) =>
                            management.updateForm('lastName', event.target.value)
                          }
                          autoComplete="family-name"
                          required
                        />
                      </FormField>
                      <FormField
                        id="managed-user-dni"
                        label="DNI"
                        required={management.form.role === 'Cliente'}
                      >
                        <Input
                          id="managed-user-dni"
                          value={management.form.dni}
                          onChange={(event) => management.updateForm('dni', event.target.value)}
                          disabled={Boolean(management.editingUser)}
                          inputMode="numeric"
                          maxLength={8}
                          autoComplete="off"
                          required={management.form.role === 'Cliente'}
                          placeholder="8 dígitos"
                        />
                      </FormField>
                      <FormField id="managed-user-phone" label="Teléfono">
                        <Input
                          id="managed-user-phone"
                          type="tel"
                          value={management.form.phone}
                          onChange={(event) => management.updateForm('phone', event.target.value)}
                          inputMode="numeric"
                          maxLength={9}
                          autoComplete="tel"
                          placeholder="9 dígitos"
                        />
                      </FormField>
                      <FormField id="managed-user-birth-date" label="Fecha de nacimiento">
                        <Input
                          id="managed-user-birth-date"
                          type="date"
                          value={management.form.birthDate}
                          onChange={(event) =>
                            management.updateForm('birthDate', event.target.value)
                          }
                          autoComplete="bday"
                        />
                      </FormField>
                    </div>
                  </section>

                  <section aria-labelledby="managed-user-access-heading" className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-border pb-2">
                      <ShieldCheck aria-hidden="true" className="h-4 w-4 text-primary" />
                      <h4
                        id="managed-user-access-heading"
                        className="text-sm font-semibold text-foreground"
                      >
                        Cuenta y acceso
                      </h4>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField id="managed-user-email" label="Correo electrónico" required>
                        <Input
                          id="managed-user-email"
                          type="email"
                          value={management.form.email}
                          onChange={(event) => management.updateForm('email', event.target.value)}
                          autoComplete="email"
                          required
                        />
                      </FormField>
                      <FormField id="managed-user-role" label="Rol" required>
                        <select
                          id="managed-user-role"
                          value={management.form.role}
                          onChange={(event) =>
                            management.updateForm('role', event.target.value as UserRole)
                          }
                          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {USER_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </FormField>
                      {management.form.role !== 'Cliente' && (
                        <FormField
                          id="managed-user-password"
                          label={passwordRequired ? 'Contraseña inicial' : 'Nueva contraseña'}
                          required={passwordRequired}
                          className="sm:col-span-2"
                        >
                          <Input
                            id="managed-user-password"
                            type="password"
                            value={management.form.password}
                            onChange={(event) =>
                              management.updateForm('password', event.target.value)
                            }
                            autoComplete="new-password"
                            required={passwordRequired}
                            minLength={8}
                            aria-describedby="managed-user-password-help"
                          />
                          <span
                            id="managed-user-password-help"
                            className="text-xs text-muted-foreground"
                          >
                            Mínimo 8 caracteres, con mayúscula, minúscula y número.
                            {!passwordRequired && ' Déjala vacía para conservar la actual.'}
                          </span>
                        </FormField>
                      )}
                    </div>
                  </section>

                  {isCreatingClient && (
                    <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <KeyRound aria-hidden="true" className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Acceso inicial</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          La contraseña inicial de clientes será su DNI.
                        </p>
                      </div>
                    </div>
                  )}
                  {management.error && (
                    <p
                      role="alert"
                      className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm font-medium text-destructive"
                    >
                      {management.error}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex shrink-0 flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={management.closeForm}
                    className="sm:min-w-28"
                  >
                    Cerrar
                  </Button>
                  <Button type="submit" disabled={management.saving} className="sm:min-w-36">
                    {management.saving ? (
                      <Loading label="Guardando…" />
                    ) : management.editingUser ? (
                      'Guardar cambios'
                    ) : (
                      'Crear usuario'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
