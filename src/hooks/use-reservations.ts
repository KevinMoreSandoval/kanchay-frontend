import { useRemoteCollection } from './use-remote-collection';
import {
  listReservations,
  RESERVATIONS_CHANGED_EVENT,
} from '@/services/reservations/reservation-api';

export function useReservations() {
  const { rows: reservations, ...state } = useRemoteCollection(
    listReservations,
    RESERVATIONS_CHANGED_EVENT
  );
  return { reservations, ...state };
}
