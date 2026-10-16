// Constantes de dominio para el formulario de creación de canchas

import type {
  CourtSport,
  CourtModality,
  CourtSurface,
  CourtCoverType,
  CourtLighting,
} from './types';

export const SPORTS: CourtSport[] = [
  'Fútbol 5',
  'Fútbol 7',
  'Fútbol 11',
  'Básquet',
  'Vóley',
  'Tenis',
  'Pádel',
  'Otro',
];

export const MODALITIES: CourtModality[] = ['Mixto', 'Masculino', 'Femenino'];

export const SURFACES: CourtSurface[] = [
  'Césped sintético',
  'Cemento',
  'Parquet',
  'Arcilla',
  'Arena',
];

export const COVER_TYPES: CourtCoverType[] = ['Techada', 'Abierta'];

export const LIGHTING_OPTIONS: CourtLighting[] = ['LED', 'Halógena', 'Sin iluminación'];

export interface SelectableOption {
  id: string;
  label: string;
}

export const SERVICES: SelectableOption[] = [
  { id: 'estacionamiento', label: 'Estacionamiento' },
  { id: 'vestidores', label: 'Vestidores' },
  { id: 'duchas', label: 'Duchas' },
  { id: 'cafeteria', label: 'Cafetería' },
  { id: 'wifi', label: 'Wi-Fi' },
  { id: 'primeros_auxilios', label: 'Primeros auxilios' },
  { id: 'seguridad', label: 'Seguridad 24h' },
  { id: 'arbitraje', label: 'Arbitraje' },
];

export const AMENITIES: SelectableOption[] = [
  { id: 'vestuario_visitante', label: 'Vestuario visitante' },
  { id: 'tribuna', label: 'Tribuna' },
  { id: 'sala_espera', label: 'Sala de espera' },
  { id: 'cancha_calentamiento', label: 'Cancha de calentamiento' },
  { id: 'proyector', label: 'Proyector / Pantalla' },
  { id: 'sonido', label: 'Sistema de sonido' },
];

export const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const DEFAULT_OPEN_TIME = '07:00';
export const DEFAULT_CLOSE_TIME = '22:00';
