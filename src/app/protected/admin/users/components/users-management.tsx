import { Pencil, Power, Plus, Search, Trash2, Users } from 'lucide-react';
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
import { UserFormDialog } from './user-form-dialog';

const USER_ROLES: UserRole[] = ['Cliente', 'Recepcionista', 'Administrador'];

export interface UsersManagementProps {
  currentUser?: User | null;
}

export function UsersManagement({ currentUser }: UsersManagementProps) {
  const management = useAdminUsers(currentUser?.id);

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
        </CardHeader>
        <CardContent>
          {management.loading ? (
            <Loading label="Cargando usuarios…" />
          ) : management.loadError ? (
            <Button type="button" variant="outline" onClick={() => void management.refresh()}>
              Reintentar cargar usuarios
            </Button>
          ) : management.users.length === 0 ? (
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
                        <p className="mt-1 text-xs text-muted-foreground">
                          {managedUser.active ? 'Activo' : 'Inactivo'}
                        </p>
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
                                disabled={Boolean(management.pendingUserId)}
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
                              disabled={Boolean(management.pendingUserId)}
                            >
                              <Pencil aria-hidden="true" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`${managedUser.active ? 'Desactivar' : 'Activar'} a ${managedUser.firstName} ${managedUser.lastName}`}
                              title={managedUser.active ? 'Desactivar usuario' : 'Activar usuario'}
                              disabled={Boolean(management.pendingUserId)}
                              onClick={() => void management.toggleActive(managedUser)}
                            >
                              <Power aria-hidden="true" />
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

      {management.formOpen && <UserFormDialog management={management} />}
    </div>
  );
}
