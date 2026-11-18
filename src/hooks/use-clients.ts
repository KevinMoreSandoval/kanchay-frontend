import { useRemoteCollection } from './use-remote-collection';
import { listClients } from '@/services/clients/client-service';
import { USERS_CHANGED_EVENT } from '@/services/users/user-service';

export function useClients() {
  const { rows: clients, ...state } = useRemoteCollection(listClients, USERS_CHANGED_EVENT);
  return { clients, ...state };
}
