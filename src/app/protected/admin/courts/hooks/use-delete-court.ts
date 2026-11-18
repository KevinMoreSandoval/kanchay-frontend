import { notifyToast } from '@/services/toast-service';
import { useState } from 'react';
import { deleteCourt } from '@/services/courts/court-service';
import type { Court } from '@/types';

export function useDeleteCourt(onDeleted: (name: string) => void) {
  const [pending, setPending] = useState<Court | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function confirm() {
    if (!pending || busy) return;
    setBusy(true);
    setError('');
    try {
      await deleteCourt(pending.id);
      onDeleted(pending.name);
      setPending(null);
    } catch (err) {
      setError(
        notifyToast(err instanceof Error ? err.message : 'No se pudo eliminar la cancha.', 'error')
      );
    } finally {
      setBusy(false);
    }
  }

  return {
    pending,
    busy,
    error,
    confirm,
    request: (court: Court) => {
      setError('');
      setPending(court);
    },
    cancel: () => {
      if (!busy) {
        setPending(null);
        setError('');
      }
    },
  };
}
