import type { CourtFormDraft } from '@/types/courts';

// El borrador solo vive durante esta carga de la aplicación. La cancha se guarda por HTTP.
let currentDraft: CourtFormDraft | null = null;

// ─── Borrador (court en progreso) ────────────────────────────────────────────

export function getDraft(): CourtFormDraft | null {
  return currentDraft ? structuredClone(currentDraft) : null;
}

export function saveDraft(draft: CourtFormDraft): CourtFormDraft {
  currentDraft = structuredClone({ ...draft, savedAt: new Date().toISOString() });
  return structuredClone(currentDraft);
}

export function clearDraft(): void {
  currentDraft = null;
}
