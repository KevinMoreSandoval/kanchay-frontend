import { useState, useMemo, useEffect } from 'react';
import { getCourts } from '@/services/local-data-service';
import type { Court } from '@/types';

export function useCourtsCatalog() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [courts, setCourts] = useState<Court[]>(getCourts);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    const refreshCourts = (event: StorageEvent) => {
      if (event.key === null || event.key === 'kanchaya.courts') {
        setCourts(getCourts());
      }
    };

    window.addEventListener('storage', refreshCourts);
    return () => window.removeEventListener('storage', refreshCourts);
  }, []);

  const handleDetails = (id: number) => {
    const court = courts.find((c) => c.id === id);
    setActionNotice(`Detalles de ${court?.name}: ${court?.features.join(', ')}.`);
  };

  const handleReserve = (id: number) => {
    const court = courts.find((c) => c.id === id);
    setActionNotice(`¡Reserva para "${court?.name}" seleccionada! Procediendo al calendario.`);
  };

  const filteredCourts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return courts;
    return courts.filter(
      (court) =>
        court.name.toLowerCase().includes(term) ||
        court.features.some((f) => f.toLowerCase().includes(term)) ||
        court.location.toLowerCase().includes(term)
    );
  }, [courts, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredCourts,
    actionNotice,
    setActionNotice,
    handleDetails,
    handleReserve,
  };
}
