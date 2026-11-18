import { notifyToast } from '@/services/toast-service';
import { useCallback, useEffect, useRef, useState } from 'react';
import { COURTS_CHANGED_EVENT, listCourts } from '@/services/courts/court-service';
import type { Court } from '@/types';

export function useCourts(availableOnly = false) {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const request = useRef({ version: 0 });

  const load = useCallback(async () => {
    const current = ++request.current.version;
    try {
      const data = await listCourts(availableOnly);
      if (current === request.current.version) {
        setCourts(data);
        setError('');
      }
    } catch (err) {
      if (current === request.current.version)
        setError(
          notifyToast(
            err instanceof Error ? err.message : 'No se pudieron cargar las canchas.',
            'error'
          )
        );
    } finally {
      if (current === request.current.version) setLoading(false);
    }
  }, [availableOnly]);

  const refresh = useCallback(() => {
    setLoading(true);
    setError('');
    return load();
  }, [load]);

  useEffect(() => {
    const tracker = request.current;
    const current = ++tracker.version;
    void listCourts(availableOnly)
      .then((data) => {
        if (current === tracker.version) {
          setCourts(data);
          setError('');
        }
      })
      .catch((err: unknown) => {
        if (current === tracker.version)
          setError(
            notifyToast(
              err instanceof Error ? err.message : 'No se pudieron cargar las canchas.',
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
    window.addEventListener(COURTS_CHANGED_EVENT, update);
    window.addEventListener('focus', update);
    return () => {
      tracker.version++;
      window.removeEventListener(COURTS_CHANGED_EVENT, update);
      window.removeEventListener('focus', update);
    };
  }, [refresh, availableOnly]);

  return { courts, loading, error, refresh };
}
