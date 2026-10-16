import { Search, Trophy } from 'lucide-react';

export interface ClientHeroProps {
  userName?: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function ClientHero({
  userName = 'Deportista',
  searchTerm,
  onSearchChange,
}: ClientHeroProps) {
  return (
    <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 sm:p-10 border border-primary/10 space-y-4">
      <div className="max-w-2xl space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">
          <Trophy className="h-3.5 w-3.5" aria-hidden="true" /> CanchaYa Deportes
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          Hola, {userName} <span aria-hidden="true">👋</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Encuentra tu cancha ideal, revisa horarios disponibles y asegura tu partido en segundos.
        </p>
      </div>

      <div className="relative max-w-md pt-2">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
        <label htmlFor="search-court" className="sr-only">
          Buscar por tipo de cancha, deporte o sede
        </label>
        <input
          id="search-court"
          type="search"
          placeholder="Buscar por fútbol, vóley o sede..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
        />
      </div>
    </section>
  );
}
