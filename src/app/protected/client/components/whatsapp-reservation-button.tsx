import { getPaymentWhatsAppUrl } from '../contact';
import type { Reservation } from '@/types';

interface WhatsAppReservationButtonProps {
  reservation?: Reservation;
}

export function WhatsAppReservationButton({ reservation }: WhatsAppReservationButtonProps) {
  return (
    <a
      href={getPaymentWhatsAppUrl(reservation)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Confirma tu reserva por WhatsApp con el establecimiento (abre en una pestaña nueva)"
      className="group fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-40 flex items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:right-6"
    >
      <span
        aria-hidden="true"
        className="relative flex h-11 min-w-40 items-center justify-center rounded-full bg-card px-5 text-sm font-semibold text-foreground shadow-lg ring-1 ring-border/30 after:absolute after:-right-1 after:top-4 after:size-3 after:rotate-45 after:bg-card sm:h-12 sm:min-w-48 sm:text-base"
      >
        <span className="group-hover:hidden group-focus-visible:hidden">Confirma tu reserva</span>
        <span className="hidden group-hover:inline group-focus-visible:inline">Haz clic</span>
      </span>
      <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-whatsapp text-primary-foreground shadow-lg transition-transform motion-safe:group-hover:scale-105 motion-safe:group-focus-visible:scale-105 sm:size-16">
        <svg
          viewBox="0 0 32 32"
          fill="currentColor"
          className="size-9 sm:size-10"
          aria-hidden="true"
        >
          <path d="M16.04 3A12.88 12.88 0 0 0 4.9 22.34L3 29l6.83-1.79A12.96 12.96 0 0 0 16.04 29C23.19 29 29 23.17 29 16S23.19 3 16.04 3Zm0 23.79a10.7 10.7 0 0 1-5.46-1.49l-.39-.23-4.05 1.06 1.08-3.95-.25-.41A10.76 10.76 0 1 1 16.04 26.79Zm5.91-8.06c-.32-.16-1.91-.95-2.21-1.05-.3-.11-.51-.16-.73.16-.22.32-.84 1.05-1.03 1.27-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.59-1.6-.96-.86-1.6-1.92-1.79-2.24-.19-.32-.02-.5.14-.66.14-.14.32-.38.48-.56.16-.19.22-.32.32-.54.11-.21.06-.4-.02-.56-.08-.16-.73-1.76-1-2.41-.26-.63-.53-.54-.73-.55h-.62c-.22 0-.57.08-.86.4-.3.33-1.14 1.11-1.14 2.71s1.16 3.14 1.32 3.36c.16.21 2.28 3.48 5.52 4.88.77.33 1.37.53 1.84.68.77.25 1.47.22 2.03.13.62-.09 1.91-.78 2.18-1.54.27-.75.27-1.4.19-1.54-.08-.13-.3-.21-.62-.37Z" />
        </svg>
      </span>
    </a>
  );
}
