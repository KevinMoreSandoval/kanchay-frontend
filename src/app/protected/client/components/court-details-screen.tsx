import React from 'react';
import {
  ArrowLeft,
  Calendar,
  Car,
  CircleCheck,
  Coffee,
  Droplets,
  Info,
  Lightbulb,
  MapPin,
  ShieldCheck,
  Umbrella,
  Users,
  Trophy,
  X,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import type { Court, CourtScheduleEntry } from '@/types';
import { Badge, Button } from '@/components/ui';

const SCHEDULE_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const COURT_SPORTS = [
  'Fútbol 5',
  'Fútbol 7',
  'Fútbol 11',
  'Básquet',
  'Vóley',
  'Tenis',
  'Pádel',
  'Fútbol',
];

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getFeatureIcon(feature: string): LucideIcon {
  const value = normalizeText(feature);
  if (value.includes('estacionamiento')) return Car;
  if (value.includes('wifi')) return Wifi;
  if (value.includes('cafeteria')) return Coffee;
  if (value.includes('ducha') || value.includes('agua')) return Droplets;
  if (value.includes('jugador') || /^\d+$/.test(value.trim())) return Users;
  if (value.includes('led') || value.includes('iluminacion') || value.includes('luz')) {
    return Lightbulb;
  }
  if (value.includes('techada') || value.includes('cubierta')) return Umbrella;
  if (value.includes('seguridad')) return ShieldCheck;
  return CircleCheck;
}

function getCourtSport(court: Court, courtData: Record<string, unknown>): string {
  const explicitSport = courtData.sport || courtData.sportType;
  if (typeof explicitSport === 'string' && explicitSport.trim()) return explicitSport.trim();

  const sourceText = normalizeText([court.name, ...court.features].join(' '));
  return COURT_SPORTS.find((sport) => sourceText.includes(normalizeText(sport))) || 'Deporte';
}

interface ScheduleGroup {
  startDay: string;
  endDay: string;
  opens: string;
  closes: string;
  isOpen: boolean;
}

function getScheduleGroups(schedule: CourtScheduleEntry[] | undefined): ScheduleGroup[] {
  if (!schedule?.length) return [];

  const orderedEntries = SCHEDULE_DAYS.map((day) =>
    schedule.find((entry) => entry.day === day)
  ).filter((entry): entry is CourtScheduleEntry => Boolean(entry));

  return orderedEntries.reduce<ScheduleGroup[]>((groups, entry) => {
    const previous = groups[groups.length - 1];
    if (
      previous &&
      previous.isOpen === entry.isOpen &&
      previous.opens === entry.opens &&
      previous.closes === entry.closes
    ) {
      previous.endDay = entry.day;
      return groups;
    }

    groups.push({
      startDay: entry.day,
      endDay: entry.day,
      opens: entry.opens,
      closes: entry.closes,
      isOpen: entry.isOpen,
    });
    return groups;
  }, []);
}

interface CourtDetailsScreenProps {
  court: Court & {
    establishmentName?: string;
    location?: string;
  };
  onBack: () => void;
  onSelectAvailability: () => void;
}

export const CourtDetailsScreen: React.FC<CourtDetailsScreenProps> = ({
  court,
  onBack,
  onSelectAvailability,
}) => {
  const courtData = court as unknown as Record<string, unknown>;
  const courtName = String(courtData.name || '');
  const courtSport = getCourtSport(court, courtData);
  const courtPrice = Number(courtData.price || courtData.pricePerHour || 0);
  const courtImage = String(courtData.image || court.image || '');
  const courtDescription = String(court.description || courtData.description || '').trim();
  const scheduleGroups = getScheduleGroups(court.schedule);
  const establishment = String(
    courtData.establishmentName || courtData.establishment || court.location || 'Sede deportiva'
  );
  const courtLocation = String(court.address || courtData.address || courtData.fullAddress || '');
  const locationReference = String(
    court.reference || courtData.reference || courtData.locationReference || ''
  );
  const galleryImages = [
    ...new Set([...(court.images ?? []), courtImage].filter((image) => image.trim().length > 0)),
  ];
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  const touchStartX = React.useRef<number | null>(null);
  const currentImageIndex = galleryImages.length ? activeImageIndex % galleryImages.length : 0;
  const activeImage = galleryImages[currentImageIndex];

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartX.current = null;

    if (startX === null || endX === undefined || galleryImages.length < 2) return;

    const swipeDistance = endX - startX;
    if (Math.abs(swipeDistance) < 40) return;

    setActiveImageIndex(
      (currentImageIndex + (swipeDistance < 0 ? 1 : -1) + galleryImages.length) %
        galleryImages.length
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-2 sm:p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="court-details-title"
        className="h-[96dvh] w-full overflow-hidden rounded-2xl border border-border bg-background shadow-2xl sm:h-[94dvh] sm:max-w-6xl sm:rounded-3xl"
      >
        <main className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground">
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                aria-label="Volver al catálogo de canchas"
                className="shrink-0 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </Button>
              <h1
                id="court-details-title"
                className="min-w-0 truncate text-base font-bold text-foreground sm:text-lg"
              >
                {courtName}
              </h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              aria-label="Cerrar detalles de cancha"
              className="shrink-0 rounded-full"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Button>
          </header>

          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden">
            <section
              aria-label="Fotos de la cancha"
              className="relative flex flex-col lg:justify-center lg:p-5"
            >
              <div
                role="group"
                aria-roledescription="carrusel"
                aria-label={`Foto ${currentImageIndex + 1} de ${galleryImages.length}`}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative aspect-video w-full flex-none touch-pan-y select-none overflow-hidden lg:rounded-2xl"
              >
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={`${courtName}, foto ${currentImageIndex + 1}`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Trophy className="h-14 w-14" aria-hidden="true" />
                    <span className="text-sm font-medium">Sin foto disponible</span>
                  </div>
                )}
              </div>

              {galleryImages.length > 1 && (
                <nav
                  aria-label="Seleccionar foto del carrusel"
                  className="flex shrink-0 items-center justify-center gap-2 px-4 py-3 lg:px-0 lg:pb-0"
                >
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${court.id}-${image}`}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      aria-label={`Ir a la foto ${index + 1} de ${galleryImages.length}`}
                      aria-current={index === currentImageIndex ? 'true' : undefined}
                      className={`h-3 w-3 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'scale-110 bg-primary'
                          : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
                      }`}
                    />
                  ))}
                </nav>
              )}
            </section>

            <div className="min-h-0 space-y-6 p-5 sm:p-6 lg:overflow-y-auto lg:p-8">
              <section className="space-y-3">
                <h2 className="text-base font-bold text-foreground">Descripción</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {courtDescription || 'No hay una descripción disponible.'}
                </p>
              </section>

              <div className="grid grid-cols-2 items-start gap-4">
                <section className="space-y-3">
                  <h2 className="text-base font-bold text-foreground">Deporte</h2>
                  <Badge
                    variant="secondary"
                    className="inline-flex max-w-full items-center gap-1.5 bg-slate-100 font-medium text-slate-600"
                  >
                    <Trophy className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
                    <span className="truncate">{courtSport}</span>
                  </Badge>
                </section>

                <section className="space-y-3">
                  <h2 className="text-base font-bold text-foreground">Horario</h2>
                  {scheduleGroups.length > 0 ? (
                    <ul className="space-y-2">
                      {scheduleGroups.map((group) => (
                        <li
                          key={`${group.startDay}-${group.endDay}-${group.opens}-${group.closes}`}
                          className="flex flex-col gap-0.5 text-sm"
                        >
                          <span className="text-foreground">
                            {group.startDay === group.endDay
                              ? group.startDay
                              : `${group.startDay} - ${group.endDay}`}
                          </span>
                          <span className="whitespace-nowrap font-semibold text-foreground">
                            {group.isOpen ? `${group.opens} - ${group.closes} HRS` : 'Cerrado'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Horario no disponible.</p>
                  )}
                </section>
              </div>

              <section className="space-y-3">
                <div>
                  <h4 className="text-base font-bold text-foreground">Servicios e instalaciones</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Todo lo que esta cancha ofrece para tu partido.
                  </p>
                </div>
                {court.features.length > 0 ? (
                  <ul
                    aria-label="Servicios e instalaciones disponibles"
                    className="flex flex-wrap gap-2"
                  >
                    {court.features.map((feature) => (
                      <li key={`${court.id}-${feature}`}>
                        <Badge
                          variant="secondary"
                          className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-600"
                        >
                          {React.createElement(getFeatureIcon(feature), {
                            className: 'h-3.5 w-3.5 shrink-0 text-slate-500',
                            'aria-hidden': true,
                          })}
                          <span className="truncate">{feature}</span>
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                    Aún no se han registrado servicios para esta cancha.
                  </p>
                )}
              </section>

              <section className="space-y-3">
                <h4 className="text-base font-bold text-foreground">Ubicación</h4>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{establishment}</p>
                    {courtLocation && (
                      <p className="mt-0.5 text-sm text-muted-foreground">{courtLocation}</p>
                    )}
                  </div>
                </div>
                {locationReference && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 px-3.5 py-3 text-sm leading-5 text-slate-600">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                    <p>
                      <span className="font-semibold text-slate-900">Referencia: </span>
                      {locationReference}
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>

          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-4">
            <div className="min-w-0 rounded-xl bg-muted/40 px-3.5 py-2.5">
              <p className="text-xs font-medium text-muted-foreground">Desde</p>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <p className="text-xl font-bold leading-none tracking-tight text-primary sm:text-2xl">
                  S/ {courtPrice.toFixed(2)}
                </p>
                <span className="text-xs text-muted-foreground">/ hora</span>
              </div>
            </div>
            <Button onClick={onSelectAvailability} className="shrink-0 gap-2 rounded-xl px-5">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              Ver disponibilidad
            </Button>
          </footer>
        </main>
      </section>
    </div>
  );
};
