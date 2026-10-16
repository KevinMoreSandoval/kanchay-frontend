// src/app/protected/client/components/availability-step.tsx
import React, { useMemo, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  Check,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Court } from '@/types';
import { Button, Card, Badge } from '@/components/ui';

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  price: number;
  available: boolean;
}

interface AvailabilityStepProps {
  court: Court;
  selectedDate: string;
  onDateChange: (date: string) => void;
  availableSlots: TimeSlot[];
  selectedSlots: TimeSlot[];
  onToggleSlot: (slot: TimeSlot) => void;
  totalAmount: number;
  onBack: () => void;
  onNext: () => void;
}

export const AvailabilityStep: React.FC<AvailabilityStepProps> = ({
  court,
  selectedDate,
  onDateChange,
  availableSlots,
  selectedSlots,
  onToggleSlot,
  totalAmount,
  onBack,
  onNext,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dateButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const courtData = court as unknown as Record<string, unknown>;
  const courtName = String(courtData.name || '');
  const courtPrice = Number(courtData.price || courtData.pricePerHour || 80);
  const establishment = String(
    courtData.establishmentName || courtData.establishment || 'Sede San Miguel'
  );

  // Generar 14 días a partir de hoy
  const daysList = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
      const monthName = d.toLocaleDateString('es-ES', { month: 'short' });
      const dayNum = d.getDate();
      days.push({ iso, dayName, monthName, dayNum });
    }
    return days;
  }, []);

  // EFECTO CARRUSEL: Desplaza el contenedor de forma suave para que la tarjeta seleccionada quede en el medio exacto
  useEffect(() => {
    const activeEl = dateButtonRefs.current[selectedDate];
    const container = scrollContainerRef.current;

    if (activeEl && container) {
      const activeRect = activeEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Distancia actual desde el borde izquierdo del contenedor visible
      const relativeLeft = activeRect.left - containerRect.left;

      // Cálculo de desplazamiento necesario para alinear el centro de la tarjeta con el centro del contenedor
      const currentScroll = container.scrollLeft;
      const targetScroll =
        currentScroll + relativeLeft - containerRect.width / 2 + activeRect.width / 2;

      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  }, [selectedDate]);

  const scrollDays = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const groupedSlots = useMemo(() => {
    const morning = availableSlots.filter((s) => {
      const hour = parseInt(s.startTime.split(':')[0], 10);
      return hour >= 8 && hour < 12;
    });
    const afternoon = availableSlots.filter((s) => {
      const hour = parseInt(s.startTime.split(':')[0], 10);
      return hour >= 12 && hour < 18;
    });
    const evening = availableSlots.filter((s) => {
      const hour = parseInt(s.startTime.split(':')[0], 10);
      return hour >= 18;
    });

    return { morning, afternoon, evening };
  }, [availableSlots]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* CABECERA FIJA (Sticky Header) */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md p-4 md:p-5 rounded-3xl border border-blue-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            aria-label="Regresar al catálogo"
            className="rounded-2xl border-blue-200 bg-white hover:bg-blue-50 text-blue-600 shadow-sm shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 border-none font-bold text-[10px] uppercase tracking-wider"
              >
                Reserva en línea
              </Badge>
              <span className="text-xs text-muted-foreground">{establishment}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-0.5">{courtName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs bg-blue-50/80 px-3.5 py-2 rounded-2xl border border-blue-100 text-slate-700 font-medium">
          <CalendarIcon className="w-4 h-4 text-blue-600" aria-hidden="true" />
          <span>Selecciona fecha y horarios</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Selección de Fechas y Turnos */}
        <div className="lg:col-span-2 space-y-6">
          {/* SELECCIÓN DE FECHA - CARRUSEL DESLIZABLE CON FLECHAS */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Selecciona la fecha
              </span>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100 shadow-sm">
                {new Date()
                  .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
                  .toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 relative">
              {/* Flecha Izquierda */}
              <button
                type="button"
                onClick={() => scrollDays('left')}
                className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all cursor-pointer shrink-0 focus:outline-none z-10 bg-white/90 backdrop-blur-sm shadow-sm"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Contenedor Carrusel deslizable */}
              <div className="w-full overflow-hidden">
                <div
                  ref={scrollContainerRef}
                  className="flex gap-3 overflow-x-auto py-2.5 px-32 scrollbar-none scroll-smooth w-full items-center"
                >
                  {daysList.map((day) => {
                    const isSelected = selectedDate === day.iso;
                    return (
                      <button
                        key={day.iso}
                        ref={(el) => {
                          dateButtonRefs.current[day.iso] = el;
                        }}
                        type="button"
                        onClick={() => onDateChange(day.iso)}
                        className={`flex flex-col items-center justify-center min-w-[84px] h-[96px] py-3 px-2 rounded-2xl border transition-all duration-300 cursor-pointer shrink-0 ${
                          isSelected
                            ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xl scale-105 ring-2 ring-slate-900/10'
                            : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-800 shadow-sm'
                        }`}
                      >
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}
                        >
                          {day.dayName} {day.monthName}
                        </span>
                        <span className="text-2xl font-black my-2 tracking-tight">
                          {day.dayNum}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Flecha Derecha */}
              <button
                type="button"
                onClick={() => scrollDays('right')}
                className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all cursor-pointer shrink-0 focus:outline-none z-10 bg-white/90 backdrop-blur-sm shadow-sm"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Indicadores / Leyenda de Estados */}
          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="font-semibold text-slate-600">Disponibilidad de horarios:</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300"
                  aria-hidden="true"
                />{' '}
                Libre
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />{' '}
                Seleccionado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200" aria-hidden="true" />{' '}
                Ocupado
              </span>
            </div>
          </div>

          {/* Bloques de Horarios */}
          <div className="space-y-6">
            {groupedSlots.morning.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" /> Mañana •
                    08:00 - 12:00
                  </h2>
                  <span className="text-xs text-slate-400">Tarifa S/ {courtPrice}.00/h</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {groupedSlots.morning.map((slot) =>
                    renderSlotButton(slot, selectedSlots, onToggleSlot)
                  )}
                </div>
              </div>
            )}

            {groupedSlots.afternoon.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" /> Tarde • 12:00
                    - 18:00
                  </h2>
                  <span className="text-xs text-slate-400">Tarifa S/ {courtPrice}.00/h</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {groupedSlots.afternoon.map((slot) =>
                    renderSlotButton(slot, selectedSlots, onToggleSlot)
                  )}
                </div>
              </div>
            )}

            {groupedSlots.evening.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" /> Noche • 18:00
                    - 22:00
                  </h2>
                  <span className="text-xs text-slate-400">Tarifa S/ {courtPrice}.00/h</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {groupedSlots.evening.map((slot) =>
                    renderSlotButton(slot, selectedSlots, onToggleSlot)
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resumen Lateral */}
        <div>
          <Card className="p-5 border-blue-100 bg-white sticky top-36 space-y-5 shadow-sm rounded-3xl">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Resumen de tu reserva</span>
              <Badge
                variant="outline"
                className="text-[10px] border-blue-200 text-blue-700 bg-blue-50 font-bold"
              >
                {selectedSlots.length} {selectedSlots.length === 1 ? 'turno' : 'turnos'}
              </Badge>
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Cancha:</span>
                <span className="font-bold text-slate-800">{courtName}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Fecha seleccionada:</span>
                <span className="font-bold text-slate-800">{selectedDate}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <span className="text-xs font-medium text-slate-500 block mb-2">
                Horarios agregados:
              </span>
              {selectedSlots.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  Haz clic en los turnos disponibles para agregarlos.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedSlots.map((s) => (
                    <div
                      key={s.id}
                      className="flex justify-between items-center text-xs p-2.5 bg-blue-50 text-blue-900 rounded-xl border border-blue-100 font-medium"
                    >
                      <span>
                        {s.startTime} - {s.endTime}
                      </span>
                      <span className="font-bold text-blue-700">S/ {s.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-800">Total a pagar</span>
              <span className="text-2xl font-black text-blue-600">S/ {totalAmount.toFixed(2)}</span>
            </div>

            <Button
              disabled={selectedSlots.length === 0}
              onClick={onNext}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-2xl font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continuar a Confirmación</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

function renderSlotButton(
  slot: TimeSlot,
  selectedSlots: TimeSlot[],
  onToggleSlot: (slot: TimeSlot) => void
) {
  const isSelected = selectedSlots.some((s) => s.id === slot.id);

  if (!slot.available) {
    return (
      <div
        key={slot.id}
        className="p-3 rounded-2xl border border-slate-200 bg-slate-100/60 text-slate-400 text-xs flex justify-between items-center cursor-not-allowed select-none opacity-70"
      >
        <span>{slot.startTime}</span>
        <span className="text-[10px] uppercase font-bold text-slate-400">Ocupado</span>
      </div>
    );
  }

  return (
    <button
      key={slot.id}
      type="button"
      onClick={() => onToggleSlot(slot)}
      className={`p-3 rounded-2xl border text-xs font-semibold flex justify-between items-center transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]'
          : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-800 shadow-sm'
      }`}
    >
      <span className="flex items-center gap-1.5">
        {isSelected && <Check className="w-4 h-4 text-white" aria-hidden="true" />}
        {slot.startTime}
      </span>
      <span className={isSelected ? 'text-emerald-100 font-bold' : 'text-blue-600 font-medium'}>
        S/ {slot.price}
      </span>
    </button>
  );
}
