// src/app/protected/client/components/court-details-modal.tsx
import React from 'react';
import {
  X,
  Calendar,
  MapPin,
  Sparkles,
  Sun,
  ShieldCheck,
  Maximize2,
  ExternalLink,
  CheckCircle2,
  Trophy,
} from 'lucide-react';
import { Court } from '@/types';
import { Button, Badge, Card } from '@/components/ui';

interface CourtDetailsModalProps {
  court: Court & {
    establishmentName?: string;
    location?: string;
  };
  onClose: () => void;
  onSelectAvailability: () => void;
}

export const CourtDetailsModal: React.FC<CourtDetailsModalProps> = ({
  court,
  onClose,
  onSelectAvailability,
}) => {
  const courtData = court as unknown as Record<string, unknown>;
  const courtName = String(courtData.name || '');
  const courtSport = String(courtData.sport || courtData.sportType || 'Fútbol');
  const courtPrice = Number(courtData.price || courtData.pricePerHour || 80);
  const courtImage = String(courtData.image || court.image || '');
  const establishment = String(
    courtData.establishmentName || courtData.establishment || 'Sede San Miguel'
  );
  const courtLocation = String(courtData.location || 'Av. La Marina 2345, Lima');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-blue-100 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl transition-all animate-in zoom-in-95">
        {/* Header con colores de CanchaYa */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50/60 to-white">
          <div className="flex items-center gap-3.5">
            <div
              className="p-3 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20"
              aria-hidden="true"
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">{courtName}</h2>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 font-semibold text-[10px]"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"
                    aria-hidden="true"
                  />
                  Disponible
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {courtSport} • Césped Sintético Monofilamento
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="p-5 md:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Imagen de la Cancha / Banner Principal */}
          <div className="relative rounded-2xl overflow-hidden shadow-md group">
            {courtImage ? (
              <div className="relative h-56 md:h-64 w-full bg-slate-100">
                <img
                  src={courtImage}
                  alt={courtName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-between p-5 text-white">
                  <div className="flex justify-between items-start">
                    <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 font-bold text-[11px] px-3 py-1">
                      Calidad FIFA Quality Pro
                    </Badge>
                    <span className="text-xs font-bold bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-blue-100 border border-white/10">
                      {establishment}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-extrabold text-white drop-shadow-sm">
                      {courtName}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs mt-2">
                      <span className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-xl flex items-center gap-1.5 text-blue-100 border border-white/10">
                        <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> Techada integral
                      </span>
                      <span className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-xl flex items-center gap-1.5 text-blue-100 border border-white/10">
                        <Sun className="w-3.5 h-3.5" aria-hidden="true" /> Iluminación LED HD
                      </span>
                      <span className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-xl flex items-center gap-1.5 text-blue-100 border border-white/10">
                        <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" /> 30m × 20m
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <Badge className="bg-white/15 backdrop-blur-md text-white border-white/20 font-bold text-[11px] px-3 py-1">
                    Calidad Certificada FIFA
                  </Badge>
                  <span className="text-xs font-semibold bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-blue-100">
                    {establishment}
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3">
                  Césped Sintético con Caucho Amortiguante
                </h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-blue-50">
                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> Techada
                  </span>
                  <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-blue-50">
                    <Sun className="w-3.5 h-3.5" aria-hidden="true" /> LED HD
                  </span>
                  <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-blue-50">
                    <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" /> 30m × 20m
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Tarjetas de Métricas Resumen */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-3.5 bg-blue-50/50 border-blue-100 rounded-2xl shadow-none">
              <span className="text-[11px] text-slate-500 font-medium block">Precio por hora</span>
              <span className="text-lg font-black text-blue-600">S/ {courtPrice.toFixed(2)}</span>
            </Card>
            <Card className="p-3.5 bg-slate-50 border-slate-100 rounded-2xl shadow-none">
              <span className="text-[11px] text-slate-500 font-medium block">Capacidad</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5 block">10 Jugadores</span>
              <span className="text-[10px] text-slate-400">fútbol 5 vs 5</span>
            </Card>
            <Card className="p-3.5 bg-slate-50 border-slate-100 rounded-2xl shadow-none">
              <span className="text-[11px] text-slate-500 font-medium block">Deporte</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5 block">{courtSport}</span>
              <span className="text-[10px] text-slate-400">formato libre</span>
            </Card>
            <Card className="p-3.5 bg-slate-50 border-slate-100 rounded-2xl shadow-none">
              <span className="text-[11px] text-slate-500 font-medium block">Estado</span>
              <span className="text-xs font-bold text-blue-600 flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" aria-hidden="true" /> Abierta
                hoy
              </span>
            </Card>
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Descripción de la cancha
            </h4>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              Espacio deportivo equipado con césped sintético de alta densidad y tecnología de
              absorción de impacto. Cuenta con cerco perimétrico de malla olímpica, iluminación LED
              HD ideal para partidos nocturnos y bancas techadas para suplentes.
            </p>
          </div>

          {/* Servicios e Instalaciones */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Servicios e Instalaciones
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                'Iluminación LED Nocturna',
                'Cancha Techada',
                'Vestuarios con Duchas & Lockers',
                'Gradas para espectadores',
                'Cámaras de seguridad HD',
                'Estacionamiento privado gratuito',
              ].map((service) => (
                <div
                  key={service}
                  className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-slate-700 font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
                  <span>{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ubicación y Acceso
            </h4>
            <div className="p-3.5 bg-blue-50/40 rounded-2xl border border-blue-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="p-2.5 bg-blue-600/10 text-blue-600 rounded-xl shrink-0"
                  aria-hidden="true"
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{courtLocation}</p>
                  <p className="text-[11px] text-slate-500">
                    Acceso principal • Estacionamiento vigilado
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1 h-8 rounded-xl border-blue-200 text-blue-700 bg-white hover:bg-blue-50 cursor-pointer"
              >
                Abrir Mapa <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-2xl border-slate-200 text-slate-600 hover:bg-white cursor-pointer"
          >
            <X className="w-4 h-4 mr-1.5" aria-hidden="true" /> Cerrar
          </Button>
          <Button
            onClick={onSelectAvailability}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl gap-2 font-bold shadow-md shadow-blue-600/20 px-5 cursor-pointer"
          >
            <Calendar className="w-4 h-4" aria-hidden="true" /> Ver disponibilidad
          </Button>
        </div>
      </div>
    </div>
  );
};
