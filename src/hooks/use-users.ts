import { notifyToast } from '@/services/toast-service';
import { useCallback, useEffect, useRef, useState } from 'react';
import { USERS_CHANGED_EVENT, listUsers } from '@/services/users/user-service';
import type { ManagedUser } from '@/types/users';

export function useUsers() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const request = useRef({ version: 0 });

  const load = useCallback(async () => {
    const current = ++request.current.version;
    try {
      const data = await listUsers();
      if (current === request.current.version) {
        setUsers(data);
        setError('');
      }
    } catch (err) {
      if (current === request.current.version)
        setError(
          notifyToast(
            err instanceof Error ? err.message : 'No se pudieron cargar los usuarios.',
            'error'
          )
        );
    } finally {
      if (current === request.current.version) setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    setError('');
    return load();
  }, [load]);

  useEffect(() => {
    const tracker = request.current;
    const current = ++tracker.version;
    void listUsers()
      .then((data) => {
        if (current === tracker.version) {
          setUsers(data);
          setError('');
        }
      })
      .catch((err: unknown) => {
        if (current === tracker.version)
          setError(
            notifyToast(
              err instanceof Error ? err.message : 'No se pudieron cargar los usuarios.',
              'error'
            )
          );
      })
      .finally(() => {
        if (current === tracker.version) setLoading(false);
      });
    const update = () => {
      void refresh();
    };
    window.addEventListener(USERS_CHANGED_EVENT, update);
    window.addEventListener('focus', update);
    return () => {
      tracker.version++;
      window.removeEventListener(USERS_CHANGED_EVENT, update);
      window.removeEventListener('focus', update);
    };
  }, [refresh]);

  return { users, loading, error, refresh };
}
