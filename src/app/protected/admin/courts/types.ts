// Tipos exclusivos del flujo de creación/edición de canchas

export type CourtSport =
  'Fútbol 5' | 'Fútbol 7' | 'Fútbol 11' | 'Básquet' | 'Vóley' | 'Tenis' | 'Pádel' | 'Otro';

export type CourtModality = 'Mixto' | 'Masculino' | 'Femenino';
export type CourtSurface = 'Césped sintético' | 'Cemento' | 'Parquet' | 'Arcilla' | 'Arena';
export type CourtCoverType = 'Techada' | 'Abierta';
export type CourtLighting = 'LED' | 'Halógena' | 'Sin iluminación';
export type CourtDraftStatus = 'borrador' | 'activa' | 'inactiva';

export interface CourtPhoto {
  id: string;
  src: string;
}

export interface ScheduleEntry {
  id: string;
  day: string;
  opens: string;
  closes: string;
  isOpen: boolean;
}

// Step 1 – Información general
export interface StepGeneralData {
  name: string;
  sport: CourtSport | '';
  modality: CourtModality | '';
  surface: CourtSurface | '';
  description: string;
  photos: CourtPhoto[]; // data-URLs o paths con id estable
}

// Step 2 – Características y tarifas
export interface StepFeaturesData {
  capacity: string;
  width: string;
  length: string;
  coverType: CourtCoverType | '';
  lighting: CourtLighting | '';
  services: string[]; // IDs de los servicios seleccionados
  amenities: string[]; // IDs de las instalaciones seleccionadas
  pricePerHour: string;
  promotionalPrice: string;
}

// Step 3 – Ubicación y disponibilidad
export interface StepLocationData {
  venue: string;
  address: string;
  reference: string;
  schedule: ScheduleEntry[];
  status: CourtDraftStatus;
}

// Conjunto completo del borrador
export interface CourtFormDraft {
  id: string;
  general: StepGeneralData;
  features: StepFeaturesData;
  location: StepLocationData;
  savedAt: string;
}
