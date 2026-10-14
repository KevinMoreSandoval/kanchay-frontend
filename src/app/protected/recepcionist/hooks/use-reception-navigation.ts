import { useState } from 'react';

export type ReceptionSection = 'dashboard' | 'reservas' | 'clientes';

const sectionHrefs: Record<ReceptionSection, string> = {
  dashboard: '/recepcionista',
  reservas: '/recepcionista/reservas',
  clientes: '/recepcionista/clientes',
};

export function useReceptionNavigation() {
  const [activeSection, setActiveSection] = useState<ReceptionSection>('dashboard');

  const navigate = (href: string) => {
    if (href === sectionHrefs.dashboard) setActiveSection('dashboard');
    else if (href === sectionHrefs.reservas) setActiveSection('reservas');
    else if (href === sectionHrefs.clientes) setActiveSection('clientes');
  };

  return { activeSection, activeHref: sectionHrefs[activeSection], navigate };
}
