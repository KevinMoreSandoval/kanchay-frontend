import type { CourtHorario } from '@/types/courts';
import type { CourtModality, CourtSurface } from '@/types/courts';

export interface CourtDetails {
  modality: CourtModality | '';
  surface: CourtSurface | '';
  address: string;
  reference: string;
  width: number | null;
  length: number | null;
  promotionalPrice: number | null;
  images: string[];
  services: string[];
  amenities: string[];
}

export interface CourtRequest {
  nombre: string;
  descripcion: string;
  tipo: string;
  precioPorHora: number;
  disponible: boolean;
  imagenUrl: string | null;
  capacidad: number | null;
  location: string;
  lighting: string;
  covered: string;
  size: string;
  bathrooms: string | null;
  rules: string[] | null;
  state: string;
  details: CourtDetails | null;
  horario: CourtHorario | null;
}

export interface CourtResponse extends CourtRequest {
  id: number;
}
