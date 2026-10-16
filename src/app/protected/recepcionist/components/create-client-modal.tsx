import { createPortal } from 'react-dom';
import { Info, UserRoundPlus, X } from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  FormField,
  Input,
  Loading,
} from '@/components/ui';
import type { User } from '@/types';
import { useCreateClientModal } from '../hooks/use-create-client-modal';

export interface CreateClientModalProps {
  initialDni: string;
  onClose: () => void;
  onCreated: (user: User) => void;
}

export function CreateClientModal({ initialDni, onClose, onCreated }: CreateClientModalProps) {
  const { dialogRef, ...client } = useCreateClientModal(initialDni, onCreated);
  const close = () => {
    if (!client.saving) onClose();
  };
  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="create-client-title"
      aria-describedby="create-client-description"
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        close();
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-foreground backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
        <Card className="my-auto flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border-border/80 shadow-2xl">
          <CardHeader className="shrink-0 flex-row items-start justify-between gap-4 border-b border-border bg-muted/20 px-5 py-5 sm:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UserRoundPlus aria-hidden="true" className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <CardTitle id="create-client-title">Crear cliente</CardTitle>
                <CardDescription id="create-client-description">
                  Registra los datos de la cuenta del cliente.
                </CardDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Cerrar creación de usuario"
              disabled={client.saving}
              onClick={close}
            >
              <X aria-hidden="true" />
            </Button>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col p-0">
            <form
              onSubmit={client.submit}
              noValidate
              aria-busy={client.saving}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-8">
                <fieldset disabled={client.saving} className="grid gap-4 sm:grid-cols-2">
                  <legend className="sr-only">Datos del cliente</legend>
                  {[
                    {
                      key: 'firstName',
                      label: 'Nombre',
                      placeholder: 'Juan',
                      autoComplete: 'given-name',
                      maxLength: 100,
                    },
                    {
                      key: 'lastName',
                      label: 'Apellido',
                      placeholder: 'Pérez',
                      autoComplete: 'family-name',
                      maxLength: 100,
                    },
                    {
                      key: 'dni',
                      label: 'DNI',
                      placeholder: '8 dígitos',
                      autoComplete: 'off',
                      maxLength: 8,
                    },
                    {
                      key: 'birthDate',
                      label: 'Fecha de nacimiento',
                      type: 'date',
                      autoComplete: 'bday',
                    },
                    {
                      key: 'phone',
                      label: 'Teléfono',
                      type: 'tel',
                      placeholder: '999 999 999',
                      autoComplete: 'tel',
                      maxLength: 9,
                    },
                    {
                      key: 'email',
                      label: 'Correo electrónico',
                      type: 'email',
                      placeholder: 'correo@ejemplo.com',
                      autoComplete: 'email',
                    },
                  ].map((field) => {
                    const key = field.key as keyof typeof client.form;
                    const id = `create-client-${key}`;
                    return (
                      <FormField
                        key={key}
                        id={id}
                        label={field.label}
                        error={client.errors[key]}
                        required
                      >
                        <Input
                          id={id}
                          name={key}
                          type={field.type ?? 'text'}
                          required
                          autoFocus={key === 'firstName'}
                          inputMode={key === 'dni' || key === 'phone' ? 'numeric' : undefined}
                          autoComplete={field.autoComplete}
                          placeholder={field.placeholder}
                          maxLength={field.maxLength}
                          value={client.form[key]}
                          error={!!client.errors[key]}
                          aria-describedby={client.errors[key] ? `${id}-error` : undefined}
                          onChange={(event) => client.updateField(key, event.target.value)}
                        />
                      </FormField>
                    );
                  })}
                </fieldset>
                <div className="flex gap-2 rounded-xl bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
                  <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    La contraseña inicial será el número de DNI del cliente. Su cambio de contraseña
                    lo realizará posteriormente el propio cliente.
                  </p>
                </div>
                {client.error && (
                  <p
                    role="alert"
                    className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
                  >
                    {client.error}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-muted/20 px-5 py-4 sm:flex-row sm:justify-end sm:px-8">
                <Button type="button" variant="outline" disabled={client.saving} onClick={close}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={client.saving}>
                  {client.saving ? <Loading label="Creando cliente..." /> : 'Crear cliente'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </dialog>,
    document.body
  );
}
