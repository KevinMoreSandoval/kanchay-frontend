import React from 'react';
import type { Court } from '@/types';
import { AvailabilityDateSelector } from './availability-date-selector';
import { AvailabilitySummary } from './availability-summary';
import { AvailabilityTimeSlots, type TimeSlot } from './availability-time-slots';
import { StepHeader } from './step-header';

export type { TimeSlot } from './availability-time-slots';

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
  const courtName = court.name;
  const courtPrice = court.price;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Header a ancho completo de la sección */}
      <StepHeader
        title="Seleccionar disponibilidad"
        onBack={onBack}
        backLabel="Regresar al catálogo"
      />

      {/* Contenido centrado con ancho diferenciado y separación holgada */}
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
          <div className="space-y-8 lg:col-span-2">
            <AvailabilityDateSelector selectedDate={selectedDate} onDateChange={onDateChange} />
            <AvailabilityTimeSlots
              availableSlots={availableSlots}
              selectedSlots={selectedSlots}
              hourlyRate={courtPrice}
              onToggleSlot={onToggleSlot}
            />
          </div>

          <aside aria-label="Resumen de la reserva" className="lg:pl-2">
            <AvailabilitySummary
              courtName={courtName}
              selectedDate={selectedDate}
              selectedSlots={selectedSlots}
              totalAmount={totalAmount}
              onNext={onNext}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};
