import { Button, Input, Label, Modal, Select } from '@/components/ui';
import { methodLabels, money } from '@/lib/reservation-labels';
import type {
  CreationForm,
  ReceptionManagement,
} from '@/app/protected/recepcionist/hooks/use-reception';

export function FormCrearReserva({ management: m }: { management: ReceptionManagement }) {
  const update = (key: keyof CreationForm, value: string) =>
    m.setForm((previous) => ({ ...previous, [key]: value }));
  return (
    <Modal title="Crear reserva" onClose={m.closeCreation}>
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void m.submitCreation();
        }}
      >
        <fieldset disabled={m.busy} className="space-y-4">
          <legend className="mb-3 font-bold">Cliente</legend>
          <div className="space-y-2">
            <Label htmlFor="create-client">Cliente existente o nuevo</Label>
            <Select
              id="create-client"
              value={m.form.clientId}
              onChange={(e) => update('clientId', e.target.value)}
            >
              <option value="">Nuevo cliente</option>
              {m.allClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.firstName} {client.lastName} · {client.email}
                </option>
              ))}
            </Select>
          </div>
          {!m.form.clientId && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    { id: 'firstName', label: 'Nombres', type: 'text' },
                    { id: 'lastName', label: 'Apellidos', type: 'text' },
                    { id: 'email', label: 'Correo', type: 'email' },
                    { id: 'phone', label: 'Teléfono', type: 'tel' },
                    { id: 'dni', label: 'DNI (8 dígitos)', type: 'text' },
                  ] as const
                ).map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={`create-${field.id}`}>{field.label}</Label>
                    <Input
                      id={`create-${field.id}`}
                      type={field.type}
                      required
                      value={m.form[field.id]}
                      pattern={field.id === 'dni' ? '[0-9]{8}' : undefined}
                      maxLength={field.id === 'dni' ? 8 : undefined}
                      onChange={(e) => update(field.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Se registrará como cliente. Su contraseña inicial será su DNI según la configuración
                del servicio.
              </p>
            </>
          )}
        </fieldset>
        <fieldset disabled={m.busy} className="space-y-4">
          <legend className="mb-3 font-bold">Cancha y horario</legend>
          <div className="space-y-2">
            <Label htmlFor="create-court">Cancha disponible</Label>
            <Select
              id="create-court"
              required
              value={m.form.courtId}
              onChange={(e) => update('courtId', e.target.value)}
            >
              <option value="">Selecciona una cancha</option>
              {m.availableCourts.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.name} · {money(court.price)}/hora
                </option>
              ))}
            </Select>
            {!m.availableCourts.length && (
              <p className="text-sm text-muted-foreground">
                No hay canchas activas disponibles para reservar.
              </p>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="create-date">Fecha</Label>
              <Input
                id="create-date"
                type="date"
                required
                value={m.form.date}
                onChange={(e) => update('date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-start">Inicio</Label>
              <Input
                id="create-start"
                type="time"
                required
                value={m.form.startTime}
                onChange={(e) => update('startTime', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-end">Fin</Label>
              <Input
                id="create-end"
                type="time"
                required
                value={m.form.endTime}
                onChange={(e) => update('endTime', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-method">Método de pago</Label>
            <Select
              id="create-method"
              value={m.form.paymentMethod}
              onChange={(e) => update('paymentMethod', e.target.value)}
            >
              {Object.entries(methodLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-notes">Observaciones</Label>
            <Input
              id="create-notes"
              value={m.form.notes}
              onChange={(e) => update('notes', e.target.value)}
            />
          </div>
        </fieldset>
        <p className="rounded-lg bg-muted p-3 font-semibold" role="status">
          Monto base:{' '}
          {m.quote ? money(m.quote.amount) : 'Completa un horario disponible para calcularlo.'}
        </p>
        <p className="text-sm text-muted-foreground">
          Estado inicial: Pendiente. Pago: Pendiente. La reserva vence si no se confirma en 15
          minutos.
        </p>
        {m.quoteError && (
          <p role="alert" className="text-sm text-destructive">
            {m.quoteError}
          </p>
        )}
        {m.error && (
          <p role="alert" className="text-sm text-destructive">
            {m.error}
          </p>
        )}
        <Button type="submit" disabled={m.busy || !m.quote}>
          {m.busy ? 'Guardando…' : 'Crear reserva'}
        </Button>
      </form>
    </Modal>
  );
}
