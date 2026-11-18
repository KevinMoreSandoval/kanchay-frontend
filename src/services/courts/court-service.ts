import { apiRequest } from '../http-client';
import { getCurrentSession } from '../session-service';
import type { CourtFormDraft } from '@/types/courts';
import type { CourtResponse } from './contracts';
import { toCourt, toCourtRequest, toCourtDraft } from './mappers';
import { resolveCourtPhotos } from './court-image-service';
import type { CourtTimeSlot } from '@/types/courts';
import { normalizeCourtDays } from '@/lib/court-days';

export const COURTS_CHANGED_EVENT = 'kanchaya:courts-changed';
const cache = new Map<number, CourtFormDraft>();

function token(): string {
  const session = getCurrentSession();
  if (!session) throw new Error('Inicia sesión para gestionar las canchas.');
  if (session.user.role !== 'Administrador') {
    throw new Error('Solo el administrador puede gestionar las canchas.');
  }
  return session.token;
}

export function getManagedCourts(): CourtFormDraft[] {
  return [...cache.values()];
}

export async function listCourts(availableOnly = false) {
  const data = await apiRequest<CourtResponse[]>(
    availableOnly ? '/canchas/disponibles' : '/canchas'
  );
  if (!availableOnly) cache.clear();
  data.forEach((court) => cache.set(court.id, toCourtDraft(court)));
  return data.map(toCourt);
}

export async function saveCourt(draft: CourtFormDraft): Promise<CourtFormDraft> {
  const accessToken = token();
  const photos = await resolveCourtPhotos(draft.general.photos, accessToken);
  const prepared = { ...draft, general: { ...draft.general, photos } };
  const data = await apiRequest<CourtResponse>(
    draft.backendId ? `/canchas/${draft.backendId}` : '/canchas',
    {
      method: draft.backendId ? 'PUT' : 'POST',
      token: accessToken,
      body: toCourtRequest(prepared),
    }
  );
  const persisted = draft.backendId
    ? await apiRequest<CourtResponse>(`/canchas/${draft.backendId}`, { token: accessToken })
    : data;
  if (persisted.nombre !== prepared.general.name.trim()) {
    throw new Error(
      'El servidor no confirmó el nombre guardado. Los cambios del formulario se conservaron.'
    );
  }
  if (
    prepared.location.horaInicio &&
    prepared.location.horaFin &&
    JSON.stringify(normalizeCourtDays(persisted.horario?.diasDisponibles)) !==
      JSON.stringify(normalizeCourtDays(prepared.location.diasDisponibles))
  ) {
    throw new Error(
      'El servidor no confirmó los días disponibles. Los cambios del formulario se conservaron.'
    );
  }
  const saved = toCourtDraft(persisted);
  cache.set(persisted.id, saved);
  window.dispatchEvent(new Event(COURTS_CHANGED_EVENT));
  return saved;
}

export async function deleteCourt(id: number): Promise<void> {
  await apiRequest<void>(`/canchas/${id}`, { method: 'DELETE', token: token() });
  cache.delete(id);
  window.dispatchEvent(new Event(COURTS_CHANGED_EVENT));
}

export function getCourtSlots(id: number, date: string): Promise<CourtTimeSlot[]> {
  return apiRequest<CourtTimeSlot[]>(`/canchas/${id}/slots?date=${encodeURIComponent(date)}`);
}
