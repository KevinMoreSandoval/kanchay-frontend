import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from '@/services/toast-service';

/** Mantiene un snapshot del API en memoria; no escribe datos del negocio en el navegador. */
export function useRemoteCollection<T>(load: () => Promise<T[]>, event: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const request = useRef({ version: 0 });
  const fetchRows = useCallback(async () => {
    const tracker = request.current;
    const current = ++tracker.version;
    try {
      const data = await load();
      if (current !== tracker.version) return;
      setRows(data);
      setError('');
    } catch (cause) {
      if (current !== tracker.version) return;
      const message = cause instanceof Error ? cause.message : 'No se pudieron cargar los datos.';
      setError(message);
      toast.error(message);
    } finally {
      if (current === tracker.version) setLoading(false);
    }
  }, [load]);
  const refresh = useCallback(() => {
    return fetchRows();
  }, [fetchRows]);
  useEffect(() => {
    const tracker = request.current;
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return fetchRows();
    });
    const update = () => {
      void fetchRows();
    };
    const timer = window.setInterval(update, 30_000);
    window.addEventListener(event, update);
    window.addEventListener('focus', update);
    return () => {
      active = false;
      tracker.version++;
      window.clearInterval(timer);
      window.removeEventListener(event, update);
      window.removeEventListener('focus', update);
    };
  }, [fetchRows, event]);
  return { rows, loading, error, refresh };
}
