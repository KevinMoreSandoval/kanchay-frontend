import type { Court } from '@/types';
import type { CourtCoverType, CourtFormDraft, CourtLighting, CourtSport } from '@/types/courts';
import type { CourtRequest, CourtResponse } from './contracts';
import { normalizeCourtDays } from '@/lib/court-days';

export function toCourtRequest(draft: CourtFormDraft): CourtRequest {
  const { general, features, location } = draft;
  return {
    nombre: general.name.trim(),
    descripcion: general.description.trim(),
    tipo: general.sport,
    precioPorHora: Number(features.pricePerHour),
    disponible: location.status === 'activa',
    imagenUrl: general.photos[0]?.src ?? null,
    capacidad: Number(features.capacity) || null,
    location: location.venue.trim(),
    lighting: features.lighting,
    covered: features.coverType,
    size:
      features.size ??
      (features.width && features.length ? `${features.width} x ${features.length}` : ''),
    bathrooms: features.bathrooms?.trim() || null,
    rules:
      features.rules === undefined
        ? null
        : features.rules
            .split('\n')
            .map((rule) => rule.trim())
            .filter(Boolean),
    state: location.status,
    horario:
      location.horaInicio && location.horaFin
        ? {
            horaInicio: location.horaInicio,
            horaFin: location.horaFin,
            diasDisponibles: normalizeCourtDays(location.diasDisponibles),
          }
        : null,
    details: {
      modality: general.modality,
      surface: general.surface,
      address: location.address.trim(),
      reference: location.reference.trim(),
      width: features.width ? Number(features.width) : null,
      length: features.length ? Number(features.length) : null,
      promotionalPrice: features.promotionalPrice ? Number(features.promotionalPrice) : null,
      images: general.photos.map((photo) => photo.src),
      services: features.services,
      amenities: features.amenities,
    },
  };
}

export function toCourtDraft(data: CourtResponse): CourtFormDraft {
  const details = data.details;
  const images = [
    ...new Set([data.imagenUrl, ...(details?.images ?? [])].filter((src): src is string => !!src)),
  ];
  return {
    id: `court-${data.id}`,
    backendId: data.id,
    savedAt: new Date().toISOString(),
    general: {
      name: data.nombre,
      sport: data.tipo as CourtSport,
      modality: details?.modality ?? '',
      surface: details?.surface ?? '',
      description: data.descripcion ?? '',
      photos: images.map((src, index) => ({ id: `photo-${data.id}-${index}`, src })),
    },
    features: {
      size: data.size ?? '',
      bathrooms: data.bathrooms ?? '',
      rules: data.rules?.join('\n') ?? '',
      capacity: data.capacidad == null ? '' : String(data.capacidad),
      width: details?.width == null ? '' : String(details.width),
      length: details?.length == null ? '' : String(details.length),
      coverType: (data.covered ?? '') as CourtCoverType,
      lighting: (data.lighting ?? '') as CourtLighting,
      services: details?.services ?? [],
      amenities: details?.amenities ?? [],
      pricePerHour: String(data.precioPorHora ?? 0),
      promotionalPrice: details?.promotionalPrice == null ? '' : String(details.promotionalPrice),
    },
    location: {
      diasDisponibles: normalizeCourtDays(data.horario?.diasDisponibles),
      venue: data.location ?? '',
      address: details?.address ?? '',
      reference: details?.reference ?? '',
      status: data.disponible ? 'activa' : data.state === 'borrador' ? 'borrador' : 'inactiva',
      horaInicio: data.horario?.horaInicio.slice(0, 5) ?? '',
      horaFin: data.horario?.horaFin.slice(0, 5) ?? '',
    },
  };
}

export function toCourt(data: CourtResponse): Court {
  const draft = toCourtDraft(data);
  return {
    id: data.id,
    name: data.nombre,
    location: data.location ?? '',
    description: data.descripcion ?? '',
    address: draft.location.address,
    reference: draft.location.reference,
    horario: data.horario ?? null,
    price: Number(draft.features.promotionalPrice || data.precioPorHora || 0),
    image: draft.general.photos[0]?.src,
    images: draft.general.photos.map((photo) => photo.src),
    available: data.disponible,
    management: draft,
    features: [
      data.tipo,
      data.capacidad ? `${data.capacidad} jugadores` : '',
      data.lighting,
      data.covered,
    ].filter(Boolean),
  };
}
