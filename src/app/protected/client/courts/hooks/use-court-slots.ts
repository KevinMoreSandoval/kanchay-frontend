import { useCallback, useEffect, useState } from 'react';
import { getCourtSlots } from '@/services/courts/court-service';
import { notifyToast } from '@/services/toast-service';
import type { CourtTimeSlot } from '@/types/courts';
import { RESERVATIONS_CHANGED_EVENT } from '@/services/reservations/reservation-api';

export function useCourtSlots(courtId: number | undefined, date: string) {
  const [version, setVersion] = useState(0);
  const key = `${courtId}:${date}:${version}`;
  const [result, setResult] = useState<{
    key: string;
    slots: CourtTimeSlot[];
    error: string;
  } | null>(null);
  useEffect(() => {
    if (!courtId) return;
    let active = true;
    void getCourtSlots(courtId, date)
      .then((slots) => {
        if (active) setResult({ key, slots, error: '' });
      })
      .catch((err: unknown) => {
        if (active)
          setResult({
            key,
            slots: [],
            error: notifyToast(
              err instanceof Error ? err.message : 'No se pudieron cargar los horarios.',
              'error'
            ),
          });
      });
    return () => {
      active = false;
    };
  }, [courtId, date, key]);
  const retry = useCallback(() => setVersion((value) => value + 1), []);
  useEffect(() => {
    window.addEventListener(RESERVATIONS_CHANGED_EVENT, retry);
    window.addEventListener('focus', retry);
    return () => {
      window.removeEventListener(RESERVATIONS_CHANGED_EVENT, retry);
      window.removeEventListener('focus', retry);
    };
  }, [retry]);
  const current = result?.key === key;
  return {
    slots: current ? result.slots : [],
    error: current ? result.error : '',
    loading: !!courtId && !current,
    retry,
  };
}
