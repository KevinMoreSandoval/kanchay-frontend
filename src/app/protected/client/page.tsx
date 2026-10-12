import { SearchX, Trophy } from 'lucide-react';
import { ClientNavbar } from './components/client-navbar';
import { ClientHero } from './components/client-hero';
import { CourtCard } from './components/court-card';
import { useCourtsCatalog } from './hooks/use-courts-catalog';
import type { User } from '@/types';

export interface ClientPageProps {
  user?: User | null;
  onLogout?: () => void;
}

export default function ClientPage({ user, onLogout }: ClientPageProps) {
  const {
    searchTerm,
    setSearchTerm,
    filteredCourts,
    actionNotice,
    setActionNotice,
    handleDetails,
    handleReserve,
  } = useCourtsCatalog();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ClientNavbar user={user} onLogout={onLogout} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        <ClientHero
          userName={user?.firstName}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {actionNotice && (
          <div
            role="status"
            className="p-4 rounded-xl border border-primary/20 bg-primary/10 text-primary text-sm font-semibold flex items-center justify-between animate-in fade-in"
          >
            <span>{actionNotice}</span>
            <button
              type="button"
              onClick={() => setActionNotice(null)}
              className="text-xs hover:underline cursor-pointer ml-4 font-bold"
            >
              Cerrar
            </button>
          </div>
        )}

        <section className="space-y-4" aria-labelledby="courts-heading">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="courts-heading" className="text-xl font-bold text-foreground">
                Nuestras canchas disponibles
              </h2>
              <p className="text-xs text-muted-foreground">
                Explora las canchas disponibles y encuentra tu próximo partido.
              </p>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {filteredCourts.length} {filteredCourts.length === 1 ? 'cancha' : 'canchas'}
            </span>
          </div>

          {filteredCourts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourts.map((court) => (
                <CourtCard
                  key={court.id}
                  court={court}
                  onDetails={handleDetails}
                  onReserve={handleReserve}
                />
              ))}
            </div>
          ) : (
            <div
              role="status"
              className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center sm:py-16"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                {searchTerm.trim() ? (
                  <SearchX aria-hidden="true" className="h-7 w-7" />
                ) : (
                  <Trophy aria-hidden="true" className="h-7 w-7" />
                )}
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {searchTerm.trim()
                  ? 'No encontramos canchas con esa búsqueda'
                  : 'Aún no hay canchas disponibles'}
              </h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {searchTerm.trim()
                  ? 'Prueba con otro nombre, deporte o sede.'
                  : 'Cuando se registren canchas disponibles, aparecerán aquí.'}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
