import { cn } from '@/lib/utils';
import { CreateClientModal } from './create-client-modal';
import { createPortal } from 'react-dom';
import { CalendarPlus, CircleCheck, Plus, X } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { useCreateReceptionReservation } from '../hooks/use-create-reception-reservation';
import {
  ReservationConfirmationStep,
  ReservationClientStep,
  ReservationDetailsStep,
} from './reservation-form-steps';

export function CreateReservationPanel({ onCreated }: { onCreated: () => void }) {
  const { dialogRef, ...booking } = useCreateReceptionReservation(onCreated);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Listado de reservas</h2>
        <Button
          onClick={booking.open}
          aria-haspopup="dialog"
          aria-expanded={booking.isOpen}
          aria-controls="create-reservation-panel"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          Crear reserva
        </Button>
      </div>
      {booking.notice && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm"
        >
          <CircleCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          {booking.notice}
        </p>
      )}
      {booking.clientModalOpen && (
        <CreateClientModal
          initialDni={booking.dni}
          onClose={booking.closeClientModal}
          onCreated={booking.selectCreatedClient}
        />
      )}
      {createPortal(
        <dialog
          ref={dialogRef}
          id="create-reservation-panel"
          aria-labelledby="create-reservation-title"
          aria-describedby="create-reservation-description"
          onCancel={(event) => {
            event.preventDefault();
            booking.close();
          }}
          className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-foreground backdrop:bg-black/50 backdrop:backdrop-blur-sm"
        >
          <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
            <Card className="my-auto flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border-border/80 shadow-2xl">
              <CardHeader
                className={cn(
                  'shrink-0 flex-row items-start justify-between gap-3 px-5 sm:px-8',
                  booking.step === 1 ? 'py-5 sm:py-6' : 'justify-end pb-0 pt-3'
                )}
              >
                <div className={booking.step === 1 ? 'flex items-start gap-3 sm:gap-4' : 'sr-only'}>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                    <CalendarPlus aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5">
                    {/* <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Recepción · Paso {booking.step} de 2
                    </p> */}
                    <CardTitle id="create-reservation-title" className="text-xl font-black">
                      Nueva reserva
                    </CardTitle>
                    <CardDescription id="create-reservation-description">
                      {booking.step === 1
                        ? 'Identifica al cliente antes de elegir el horario.'
                        : booking.step === 2
                          ? 'Completa los detalles de la reserva del cliente.'
                          : 'Revisa los datos antes de crear la reserva.'}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Cerrar formulario"
                  disabled={booking.clientModalOpen}
                  onClick={booking.close}
                  className="-mr-2 -mt-2 shrink-0"
                >
                  <X aria-hidden="true" />
                </Button>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-1 flex-col p-0">
                {booking.step === 1 ? (
                  <ReservationClientStep booking={booking} />
                ) : booking.step === 2 ? (
                  <ReservationDetailsStep booking={booking} />
                ) : (
                  <ReservationConfirmationStep booking={booking} />
                )}
              </CardContent>
            </Card>
          </div>
        </dialog>,
        document.body
      )}
    </div>
  );
}
