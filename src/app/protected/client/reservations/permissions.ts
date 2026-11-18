import type { Reservation } from '@/types';
import { getAvailableReservationActions } from '@/services/reservation-service';

export function canRequestCancellation(reservation: Reservation, now = Date.now()): boolean {
  return (
    reservation.canCancel === true &&
    getAvailableReservationActions(reservation, now).some((action) => action.type === 'cancel')
  );
}
