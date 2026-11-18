import { getTodayDateString } from '@/lib/date';
import { useEffect, useRef } from 'react';
import { KeyRound, ShieldCheck, UserRound, UserRoundPlus, X } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Loading,
} from '@/components/ui';
import type { UserRole } from '@/types';
import type { useAdminUsers } from '../hooks/use-admin-users';

const USER_ROLES: UserRole[] = ['Cliente', 'Recepcionista', 'Administrador'];

export function UserFormDialog({ management }: { management: ReturnType<typeof useAdminUsers> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  const isCreatingClient = !management.editingUser && management.form.role === 'Cliente';
  const passwordRequired =
    management.form.role !== 'Cliente' &&
    (!management.editingUser || management.editingUser.role !== management.form.role);
  return (
    <dialog
      ref={dialog}
      aria-labelledby="managed-user-modal-title"
      aria-describedby="managed-user-modal-description"
      onCancel={(event) => {
        event.preventDefault();
        management.closeForm();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-3xl overflow-visible border-0 bg-transparent p-0 backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <Card className="my-auto flex max-h-[min(90vh,52rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border-border/80 shadow-2xl">
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
            disabled={management.saving}
            onClick={management.closeForm}
            className="-mr-2 -mt-2 shrink-0"
          >
            <X aria-hidden="true" />
          </Button>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-hidden px-6 py-5 sm:px-8">
          <form onSubmit={management.saveUser} className="flex h-full min-h-0 flex-col">
            <fieldset
              disabled={management.saving}
              className="min-h-0 flex-1 space-y-6 overflow-y-auto pb-2 pr-1"
            >
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
                  <FormField
                    id="managed-user-first-name"
                    error={management.fieldErrors.firstName}
                    onBlur={() => management.touchField('firstName')}
                    label="Nombre"
                    required
                  >
                    <Input
                      id="managed-user-first-name"
                      value={management.form.firstName}
                      onChange={(event) => management.updateForm('firstName', event.target.value)}
                      autoComplete="given-name"
                      required
                    />
                  </FormField>
                  <FormField
                    id="managed-user-last-name"
                    error={management.fieldErrors.lastName}
                    onBlur={() => management.touchField('lastName')}
                    label="Apellido"
                    required
                  >
                    <Input
                      id="managed-user-last-name"
                      value={management.form.lastName}
                      onChange={(event) => management.updateForm('lastName', event.target.value)}
                      autoComplete="family-name"
                      required
                    />
                  </FormField>
                  <FormField
                    id="managed-user-dni"
                    error={management.fieldErrors.dni}
                    onBlur={() => management.touchField('dni')}
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
                  <FormField
                    id="managed-user-phone"
                    error={management.fieldErrors.phone}
                    onBlur={() => management.touchField('phone')}
                    label="Teléfono"
                  >
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
                  <FormField
                    id="managed-user-birth-date"
                    error={management.fieldErrors.birthDate}
                    onBlur={() => management.touchField('birthDate')}
                    label="Fecha de nacimiento"
                  >
                    <Input
                      id="managed-user-birth-date"
                      type="date"
                      max={getTodayDateString()}
                      value={management.form.birthDate}
                      onChange={(event) => management.updateForm('birthDate', event.target.value)}
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
                  <FormField
                    id="managed-user-email"
                    error={management.fieldErrors.email}
                    onBlur={() => management.touchField('email')}
                    label="Correo electrónico"
                    required
                  >
                    <Input
                      id="managed-user-email"
                      type="email"
                      value={management.form.email}
                      onChange={(event) => management.updateForm('email', event.target.value)}
                      autoComplete="email"
                      required
                    />
                  </FormField>
                  <FormField
                    id="managed-user-role"
                    error={management.fieldErrors.role}
                    onBlur={() => management.touchField('role')}
                    label="Rol"
                    required
                  >
                    <select
                      id="managed-user-role"
                      value={management.form.role}
                      onChange={(event) =>
                        management.updateForm('role', event.target.value as UserRole)
                      }
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {USER_ROLES.map((role) => (
                        <option
                          key={role}
                          value={role}
                          disabled={
                            role === 'Cliente' &&
                            Boolean(management.editingUser && !management.editingUser.dni)
                          }
                        >
                          {role}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  {management.form.role !== 'Cliente' && (
                    <FormField
                      id="managed-user-password"
                      error={management.fieldErrors.password}
                      onBlur={() => management.touchField('password')}
                      label={passwordRequired ? 'Contraseña inicial' : 'Nueva contraseña'}
                      required={passwordRequired}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="managed-user-password"
                        type="password"
                        value={management.form.password}
                        onChange={(event) => management.updateForm('password', event.target.value)}
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
            </fieldset>

            <div className="mt-4 flex shrink-0 flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={management.closeForm}
                disabled={management.saving}
                className="sm:min-w-28"
              >
                Cerrar
              </Button>
              <Button type="submit" disabled={!management.canSave} className="sm:min-w-36">
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
    </dialog>
  );
}
