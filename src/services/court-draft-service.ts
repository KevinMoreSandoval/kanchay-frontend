// Servicio de persistencia para borradores y canchas creadas (court-draft-service.ts)

import { readStoredValue, writeStoredValue, removeStoredValue } from '@/services/storage-service';
import { deleteCourt, getCourts, saveCourts } from '@/services/local-data-service';
import type { Court } from '@/types';
import type { CourtFormDraft } from '@/app/protected/admin/courts/types';

const DRAFT_KEY = 'kanchaya.court.draft';
const MANAGED_COURTS_KEY = 'kanchaya.managed-courts';

// ─── Borrador (court en progreso) ────────────────────────────────────────────

export function getDraft(): CourtFormDraft | null {
  return readStoredValue<CourtFormDraft | null>(DRAFT_KEY, null);
}

export function saveDraft(draft: CourtFormDraft): CourtFormDraft {
  return writeStoredValue(DRAFT_KEY, { ...draft, savedAt: new Date().toISOString() });
}

export function clearDraft(): void {
  removeStoredValue(DRAFT_KEY);
}

// ─── Canchas administradas (registradas) ─────────────────────────────────────

export function getManagedCourts(): CourtFormDraft[] {
  return readStoredValue<CourtFormDraft[]>(MANAGED_COURTS_KEY, []);
}

export function saveManagedCourt(court: CourtFormDraft): CourtFormDraft[] {
  const existing = getManagedCourts();
  const idx = existing.findIndex((c) => c.id === court.id);
  const updated =
    idx >= 0 ? existing.map((c) => (c.id === court.id ? court : c)) : [...existing, court];
  writeStoredValue(MANAGED_COURTS_KEY, updated);
  upsertCatalogCourt(court);
  return updated;
}

export function deleteManagedCourt(id: string): CourtFormDraft[] {
  const updated = getManagedCourts().filter((court) => court.id !== id);
  writeStoredValue(MANAGED_COURTS_KEY, updated);

  const numericId = Number(id.split('-')[1]);
  if (Number.isInteger(numericId)) {
    deleteCourt(numericId);
  }

  return updated;
}

export function deleteManagedCourtByCatalogId(catalogId: number): CourtFormDraft[] {
  const updated = getManagedCourts().filter(
    (court) => Number(court.id.split('-')[1]) !== catalogId
  );
  writeStoredValue(MANAGED_COURTS_KEY, updated);
  deleteCourt(catalogId);
  return updated;
}

function upsertCatalogCourt(court: CourtFormDraft): void {
  const currentCourts = getCourts();
  const numericId = createNumericCourtId(court.id, currentCourts);
  const catalogCourt: Court = {
    id: numericId,
    name: court.general.name.trim(),
    location: court.location.venue.trim(),
    description: court.general.description.trim(),
    address: court.location.address.trim(),
    reference: court.location.reference.trim(),
    schedule: court.location.schedule.map(({ day, opens, closes, isOpen }) => ({
      day,
      opens,
      closes,
      isOpen,
    })),
    price: Number(court.features.promotionalPrice || court.features.pricePerHour),
    image: court.general.photos[0]?.src,
    images: court.general.photos.map((photo) => photo.src),
    features: [
      court.general.sport,
      `${court.features.capacity} jugadores`,
      court.features.lighting,
      court.features.coverType,
    ].filter(Boolean),
  };

  const updated = currentCourts.some((item) => item.id === numericId)
    ? currentCourts.map((item) => (item.id === numericId ? catalogCourt : item))
    : [...currentCourts, catalogCourt];

  saveCourts(updated);
}

function createNumericCourtId(id: string, courts: Court[]): number {
  const timestamp = Number(id.split('-')[1]);
  if (Number.isInteger(timestamp) && !courts.some((court) => court.id === timestamp)) {
    return timestamp;
  }

  return courts.reduce((maxId, court) => Math.max(maxId, court.id), 0) + 1;
}
