import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  UserRound,
  Mail,
  MapPin,
  FileText,
  Info,
  Check,
  Clock3,
  CreditCard,
  Search,
  UserRoundPlus,
} from 'lucide-react';
import { Button, FormField, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { useCreateReceptionReservation } from '../hooks/use-create-reception-reservation';

type Booking = Omit<ReturnType<typeof useCreateReceptionReservation>, 'dialogRef'>;
const selectClass =
  'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function ReservationSteps({ step }: { step: 1 | 2 | 3 }) {
  return (
    <ol
      aria-label="Progreso de la reserva"
      className="flex shrink-0 items-center justify-center gap-2 bg-muted/20 pb-4 pt-1"
    >
      {[
        { id: 1, label: 'Cliente' },
        { id: 2, label: 'Reserva' },
        { id: 3, label: 'Confirmaci\u00f3n' },
      ].map((item) => (
        <li key={item.id} aria-current={step === item.id ? 'step' : undefined}>
          <span
            aria-hidden="true"
            className={cn(
              'block h-2 rounded-full transition-all motion-reduce:transition-none',
              step === item.id
                ? 'w-6 bg-primary'
                : step > item.id
                  ? 'w-2 bg-primary/50'
                  : 'w-2 bg-muted-foreground/25'
            )}
          />
          <span className="sr-only">
            Paso {item.id} de 3: {item.label}
            {step === item.id ? ', actual' : step > item.id ? ', completado' : ', pendiente'}
          </span>
        </li>
      ))}
    </ol>
  );
}

function FormError({ error }: { error: string }) {
  return error ? (
    <p
      role="alert"
      className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
    >
      {error}
    </p>
  ) : null;
}

export function ReservationClientStep({ booking }: { booking: Booking }) {
  return (
    <form onSubmit={booking.continueWithClient} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
        <div>
          <h4 className="font-bold">¿Para quién es la reserva?</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Busca al cliente con los 8 dígitos de su DNI.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <FormField id="reservation-client-dni" label="DNI del cliente" required>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                autoFocus
                id="reservation-client-dni"
                required
                inputMode="numeric"
                pattern="[0-9]{8}"
                maxLength={8}
                placeholder="Ej. 12345678"
                aria-describedby="reservation-dni-help"
                className="font-mono tracking-wider"
                value={booking.dni}
                onChange={(event) => booking.updateDni(event.target.value)}
              />
              <Button type="button" variant="outline" onClick={booking.lookupClient}>
                <Search aria-hidden="true" className="h-4 w-4" />
                Buscar cliente
              </Button>
            </div>
          </FormField>
          <p id="reservation-dni-help" className="mt-2 text-xs text-muted-foreground">
            Si aún no tiene una cuenta, podrás registrarlo aquí.
          </p>
        </div>
        {booking.notFound && (
          <section aria-labelledby="new-client-heading" className="space-y-4">
            <div className="flex items-start gap-3">
              <UserRoundPlus aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h4 id="new-client-heading" className="text-sm font-bold">
                  Registrar nuevo cliente
                </h4>
                <p role="status" className="mt-1 text-xs text-muted-foreground">
                  No encontramos este DNI. Crea el usuario para continuar.
                </p>
              </div>
            </div>
            <Button type="button" variant="outline" onClick={booking.openClientModal}>
              <UserRoundPlus aria-hidden="true" className="h-4 w-4" />
              Crear usuario
            </Button>
          </section>
        )}
        <FormError error={booking.error} />
      </div>
      <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-muted/20 px-5 py-4 sm:flex-row sm:justify-between sm:px-8">
        <Button type="button" variant="outline" onClick={booking.close}>
          Cancelar
        </Button>
        <Button type="submit" disabled={booking.notFound}>
          {booking.client ? 'Continuar' : 'Verificar DNI'}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>
      <ReservationSteps step={booking.step} />
    </form>
  );
}

export function ReservationDetailsStep({ booking }: { booking: Booking }) {
  const { form, updateField } = booking;
  return (
    <form onSubmit={booking.reviewReservation} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
        <section aria-labelledby="reservation-schedule-heading" className="space-y-4">
          <h4
            id="reservation-schedule-heading"
            className="flex items-center gap-2 border-b border-border pb-2 text-sm font-bold"
          >
            <CalendarDays aria-hidden="true" className="h-4 w-4 text-primary" />
            Cancha y horario
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="new-court" label="Cancha" required>
              <select
                id="new-court"
                required
                className={selectClass}
                value={form.courtId}
                onChange={(event) => updateField('courtId', event.target.value)}
              >
                <option value="">Selecciona una cancha</option>
                {booking.availableCourts.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.general.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField id="new-date" label="Fecha" required>
              <Input
                id="new-date"
                type="date"
                required
                min={booking.today}
                value={form.fecha}
                onChange={(event) => updateField('fecha', event.target.value)}
              />
            </FormField>
            <FormField id="new-start" label="Hora de inicio" required>
              <Input
                id="new-start"
                type="time"
                required
                value={form.horaInicio}
                onChange={(event) => updateField('horaInicio', event.target.value)}
              />
            </FormField>
            <FormField id="new-end" label="Hora de fin" required>
              <Input
                id="new-end"
                type="time"
                required
                value={form.horaFin}
                onChange={(event) => updateField('horaFin', event.target.value)}
              />
            </FormField>
          </div>
          {form.courtId && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 aria-hidden="true" className="h-4 w-4 shrink-0" />
              {booking.daySchedule?.isOpen
                ? `Horario de atención: ${booking.daySchedule.opens}–${booking.daySchedule.closes}.`
                : 'La cancha no atiende en la fecha seleccionada.'}
            </p>
          )}
          {!booking.availableCourts.length && (
            <p role="status" className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              No hay canchas activas disponibles para reservar.
            </p>
          )}
        </section>
        <section aria-labelledby="reservation-payment-heading" className="space-y-4">
          <h4
            id="reservation-payment-heading"
            className="flex items-center gap-2 border-b border-border pb-2 text-sm font-bold"
          >
            <CreditCard aria-hidden="true" className="h-4 w-4 text-primary" />
            Pago y observaciones
          </h4>
          <FormField id="new-payment" label="Método de pago" required>
            <select
              id="new-payment"
              className={selectClass}
              value={form.paymentMethod}
              onChange={(event) =>
                updateField('paymentMethod', event.target.value as typeof form.paymentMethod)
              }
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="YAPE_PLIN">Yape / Plin</option>
            </select>
          </FormField>
          <FormField id="new-notes" label="Observaciones (opcional)">
            <Input
              id="new-notes"
              maxLength={500}
              placeholder="Añade alguna indicación para la reserva"
              value={form.observaciones}
              onChange={(event) => updateField('observaciones', event.target.value)}
            />
          </FormField>
        </section>
        <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">Total de la reserva</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Calculado según la tarifa y duración.
              </p>
            </div>
            <p aria-live="polite" className="text-2xl font-black tabular-nums text-primary">
              S/ {booking.amount.toFixed(2)}
            </p>
          </div>
          <p className="mt-4 flex items-start gap-2 border-t border-primary/10 pt-3 text-xs leading-relaxed text-muted-foreground">
            <Clock3 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            La reserva y el pago quedarán pendientes. Confirma la reserva dentro de 15 minutos para
            evitar su cancelación automática.
          </p>
        </div>
        <FormError error={booking.error} />
      </div>
      <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-muted/20 px-5 py-4 sm:flex-row sm:justify-between sm:px-8">
        <Button type="button" variant="outline" onClick={booking.back}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Anterior
        </Button>
        <Button type="submit" disabled={!booking.availableCourts.length}>
          Revisar reserva
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>
      <ReservationSteps step={booking.step} />
    </form>
  );
}

export function ReservationConfirmationStep({ booking }: { booking: Booking }) {
  const data = booking.reviewData;
  if (!data) return null;
  const paymentLabels = {
    EFECTIVO: 'Efectivo',
    TARJETA: 'Tarjeta',
    TRANSFERENCIA: 'Transferencia',
    YAPE_PLIN: 'Yape / Plin',
  };
  return (
    <form onSubmit={booking.submit} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
        <div className="space-y-1">
          <h4 className="text-lg font-bold tracking-tight">Todo listo para crear la reserva</h4>
          <p className="text-sm text-muted-foreground">Revisa este resumen antes de guardar.</p>
        </div>
        <section
          aria-labelledby="reservation-review-details"
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          <div className="flex items-start gap-3 border-b border-border bg-muted/30 p-4 sm:p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapPin aria-hidden="true" className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Cancha seleccionada</p>
              <h4
                id="reservation-review-details"
                className="mt-1 break-words text-lg font-bold leading-snug"
              >
                {data.cancha}
              </h4>
            </div>
          </div>
          <dl className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
            <div className="flex items-start gap-3">
              <CalendarDays aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <dt className="text-xs text-muted-foreground">Fecha de la reserva</dt>
                <dd className="mt-1 text-sm font-bold">
                  {data.fecha.split('-').reverse().join('/')}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock3 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <dt className="text-xs text-muted-foreground">Horario</dt>
                <dd className="mt-1 text-sm font-bold tabular-nums">
                  {data.horaInicio}
                  <span className="mx-2 font-normal text-muted-foreground">a</span>
                  {data.horaFin}
                </dd>
              </div>
            </div>
          </dl>
          <section
            aria-labelledby="reservation-review-client"
            className="mx-4 border-t border-border py-4 sm:mx-5 sm:py-5"
          >
            <h4
              id="reservation-review-client"
              className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Datos del cliente
            </h4>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <UserRound aria-hidden="true" className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="break-words text-sm font-bold">{data.cliente}</p>
                <p className="mt-1 text-xs text-muted-foreground">DNI {data.user?.dni}</p>
                <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Mail aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                  <span className="break-all">{data.user?.email}</span>
                </p>
              </div>
            </div>
          </section>
          {data.observaciones?.trim() && (
            <section
              aria-labelledby="reservation-review-notes"
              className="mx-4 border-t border-border py-4 sm:mx-5"
            >
              <h4
                id="reservation-review-notes"
                className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"
              >
                <FileText aria-hidden="true" className="h-3.5 w-3.5" />
                Observaciones
              </h4>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">
                {data.observaciones}
              </p>
            </section>
          )}
          <div className="border-t border-primary/15 bg-primary/5 p-4 sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Total de la reserva</p>
                <p className="mt-1 text-xs text-muted-foreground">Pago pendiente al crear</p>
              </div>
              <p className="text-3xl font-black tracking-tight tabular-nums text-primary">
                <span className="mr-1 text-lg font-semibold">S/</span>
                {data.monto.toFixed(2)}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-primary/10 pt-3 text-xs text-muted-foreground">
              <CreditCard aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span>
                Método de pago:{' '}
                <strong className="font-semibold text-foreground">
                  {data.paymentMethod ? paymentLabels[data.paymentMethod] : 'Sin seleccionar'}
                </strong>
              </span>
            </div>
          </div>
        </section>
        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
          <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold">Confirma la reserva dentro de 15 minutos</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Al guardar, la reserva quedará pendiente. Debes confirmarla dentro de ese plazo para
              evitar su cancelación automática.
            </p>
          </div>
        </div>
        <FormError error={booking.error} />
      </div>
      <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-muted/20 px-5 py-4 sm:flex-row sm:justify-between sm:px-8">
        <Button type="button" variant="outline" onClick={booking.back}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Anterior
        </Button>
        <Button type="submit">
          <Check aria-hidden="true" className="h-4 w-4" />
          Crear reserva
        </Button>
      </div>
      <ReservationSteps step={booking.step} />
    </form>
  );
}
