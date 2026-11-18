import { MessageCircle, Phone } from 'lucide-react';
import { buttonVariants } from '@/components/ui';
import type { Reservation } from '@/types';
import { ESTABLISHMENT_CONTACT, getPaymentWhatsAppUrl } from '../contact';

export function ReservationPaymentContact({ reservation }: { reservation: Reservation }) {
  return (
    <section
      aria-label="Coordinación del pago con recepción"
      className="mt-6 w-full max-w-md rounded-2xl border border-primary/20 bg-primary/5 p-5 text-left"
    >
      <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
        <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
        Coordina tu pago con recepción
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Comunícate dentro de los 15 minutos posteriores al registro para coordinar el pago.
        Recepción verificará el pago y confirmará tu reserva.
      </p>
      <a
        href={`tel:+${ESTABLISHMENT_CONTACT.internationalPhone}`}
        className="mt-4 inline-block rounded-sm text-xl font-bold tracking-wide text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
      >
        {ESTABLISHMENT_CONTACT.phone}
      </a>
      <a
        href={getPaymentWhatsAppUrl(reservation)}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({
          variant: 'outline',
          className: 'mt-3 w-full border-primary/30 text-primary',
        })}
      >
        <MessageCircle aria-hidden="true" />
        Coordinar por WhatsApp
      </a>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Envía tu comprobante e indica la reserva #{reservation.id}. Tu reserva seguirá pendiente
        hasta que recepción la confirme.
      </p>
    </section>
  );
}
