import type { Reservation } from '@/types';

export const ESTABLISHMENT_CONTACT = {
  phone: '917397169',
  internationalPhone: '51917397169',
} as const;

export function getPaymentWhatsAppUrl(reservation?: Reservation): string {
  const message = reservation
    ? `Hola, quiero coordinar el pago de mi reserva #${reservation.id}.\nCancha: ${reservation.cancha}\nFecha: ${reservation.fecha}\nHorario: ${reservation.horaInicio} a ${reservation.horaFin}\nCliente: ${reservation.cliente}\nPor favor, indíquenme cómo realizar el pago para que recepción pueda confirmar mi reserva.`
    : 'Hola, quiero coordinar el pago y confirmar mi reserva. ¿Me pueden ayudar?';
  return `https://wa.me/${ESTABLISHMENT_CONTACT.internationalPhone}?text=${encodeURIComponent(message)}`;
}
