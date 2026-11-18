import { notifyToast, toast } from '@/services/toast-service';
// src/app/protected/client/page.tsx
import { useState, useRef } from 'react';
import { SearchX, Trophy } from 'lucide-react';
import { ClientNavbar } from './components/client-navbar';
import { ClientHero } from './components/client-hero';
import { CourtCard } from './courts/components/court-card';
import { CourtDetailsScreen } from './courts/components/court-details-screen';
import { AvailabilityStep } from './components/availability-step';
import { ConfirmationStep } from './components/confirmation-step';
import { ReservationSummaryStep } from './components/reservation-summary-step';
import { WhatsAppReservationButton } from './components/whatsapp-reservation-button';
import { MyReservationsList } from './reservations/components/my-reservations-list';
import { useCourtsCatalog } from './courts/hooks/use-courts-catalog';
import { createReservation } from '@/services/reservation-service';
import { useReservations } from '@/hooks/use-reservations';
import type { User, Reservation, PaymentMethod } from '@/types';

export interface ClientPageProps {
  user?: User | null;
  onLogout?: () => void;
}

export default function ClientPage({ user, onLogout }: ClientPageProps) {
  const [viewMode, setViewMode] = useState<'catalog' | 'my-reservations'>('catalog');
  const [reservationStep, setReservationStep] = useState<
    'availability' | 'confirmation' | 'summary'
  >('availability');
  const [completedReservation, setCompletedReservation] = useState<Reservation | null>(null);
  const [, setReservationError] = useState<string | null>(null);

  const {
    reservations: userReservations,
    loading: reservationsLoading,
    error: reservationsError,
    refresh: refreshReservations,
  } = useReservations();
  const [savingReservation, setSavingReservation] = useState(false);
  const busy = useRef(false);

  const {
    loading: courtsLoading,
    error: courtsError,
    refresh: refreshCourts,
    searchTerm,
    setSearchTerm,
    filteredCourts,
    selectedCourt,
    setSelectedCourt,
    reservingCourt,
    selectedDate,
    handleDateChange,
    availableSlots,
    canContinue,
    selectionError,
    slotsError,
    slotsLoading,
    retrySlots,
    selectedSlots,
    totalAmount,
    handleToggleSlot,
    handleDetails,
    handleReserve,
    closeReservationFlow,
  } = useCourtsCatalog();

  const handleOpenMyReservations = () => {
    void refreshReservations();
    setViewMode('my-reservations');
    closeReservationFlow();
    setReservationError(null);
  };

  const handleConfirmReservation = async (paymentMethod: PaymentMethod) => {
    if (!reservingCourt || selectedSlots.length === 0 || !user?.id || !canContinue || busy.current)
      return;

    setReservationError(null);

    // Calcular horaInicio y horaFin a partir de los slots seleccionados (ordenados)
    const sorted = [...selectedSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const horaInicio = sorted[0].startTime;
    const horaFin = sorted[sorted.length - 1].endTime;
    const monto = totalAmount;
    const cliente = `${user.firstName} ${user.lastName || ''}`.trim();

    busy.current = true;
    setSavingReservation(true);
    try {
      if (sorted.some((slot, index) => index > 0 && sorted[index - 1].endTime !== slot.startTime))
        throw new Error('Selecciona horarios consecutivos para crear una reserva.');
      const created = await createReservation({
        userId: user.id,
        courtId: reservingCourt.id,
        cancha: reservingCourt.name,
        cliente,
        fecha: selectedDate,
        horaInicio,
        horaFin,
        monto,
        paymentMethod,
        observaciones: undefined,
      });

      setCompletedReservation(created);
      setReservationStep('summary');
      toast.success(
        'Reserva creada correctamente. Recepción debe confirmarla dentro de los próximos 15 minutos.'
      );
    } catch (err) {
      setReservationError(
        notifyToast(err instanceof Error ? err.message : 'No se pudo crear la reserva.', 'error')
      );
    } finally {
      busy.current = false;
      setSavingReservation(false);
    }
  };

  if (viewMode === 'catalog' && selectedCourt && !reservingCourt) {
    return (
      <CourtDetailsScreen
        court={selectedCourt}
        onBack={() => setSelectedCourt(null)}
        onSelectAvailability={() => {
          handleReserve(selectedCourt.id);
          setReservationStep('availability');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ClientNavbar
        user={user}
        onLogout={onLogout}
        onViewMyReservations={handleOpenMyReservations}
        onGoHome={() => {
          setViewMode('catalog');
          setReservationStep('availability');
          closeReservationFlow();
          setReservationError(null);
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-28 sm:pt-8 sm:pb-32 space-y-8">
        {reservationsLoading && viewMode === 'my-reservations' && (
          <p role="status">Cargando reservas…</p>
        )}
        {reservationsError && viewMode === 'my-reservations' && (
          <button type="button" onClick={() => void refreshReservations()} className="underline">
            Reintentar carga de reservas
          </button>
        )}
        {viewMode === 'my-reservations' ? (
          (reservationsLoading || reservationsError) && userReservations.length === 0 ? null : (
            <MyReservationsList
              reservations={userReservations}
              onExploreCourts={() => setViewMode('catalog')}
            />
          )
        ) : (
          <>
            {!reservingCourt && (
              <ClientHero
                userName={user?.firstName}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            )}

            {courtsLoading && <p role="status">Cargando canchas...</p>}
            {courtsError && (
              <div>
                <button type="button" onClick={() => void refreshCourts()} className="underline">
                  Reintentar carga de canchas
                </button>
              </div>
            )}

            {/* Flujo de Reserva */}
            {slotsError && (
              <div>
                <button type="button" className="underline" onClick={retrySlots}>
                  Reintentar carga de horarios
                </button>
              </div>
            )}
            {reservingCourt ? (
              <div className="space-y-6">
                {reservationStep === 'availability' && (
                  <AvailabilityStep
                    isLoading={slotsLoading}
                    canContinue={canContinue}
                    validationMessage={selectionError}
                    court={reservingCourt}
                    selectedDate={selectedDate}
                    onDateChange={handleDateChange}
                    availableSlots={availableSlots}
                    selectedSlots={selectedSlots}
                    onToggleSlot={handleToggleSlot}
                    totalAmount={totalAmount}
                    onBack={closeReservationFlow}
                    onNext={() => {
                      if (canContinue) setReservationStep('confirmation');
                    }}
                  />
                )}

                {reservationStep === 'confirmation' && (
                  <ConfirmationStep
                    saving={savingReservation}
                    canConfirm={canContinue}
                    validationMessage={slotsLoading ? 'Validando disponibilidad…' : selectionError}
                    court={reservingCourt}
                    selectedDate={selectedDate}
                    selectedSlots={selectedSlots}
                    totalAmount={totalAmount}
                    onBack={() => setReservationStep('availability')}
                    onConfirm={handleConfirmReservation}
                  />
                )}

                {reservationStep === 'summary' && completedReservation && (
                  <ReservationSummaryStep
                    reservation={completedReservation}
                    selectedSlots={selectedSlots}
                    onGoHome={() => {
                      closeReservationFlow();
                      setReservationStep('availability');
                      setViewMode('catalog');
                    }}
                    onGoMyReservations={handleOpenMyReservations}
                  />
                )}
              </div>
            ) : (
              <section className="space-y-4" aria-labelledby="courts-heading">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 id="courts-heading" className="text-xl font-bold text-foreground">
                      Nuestras canchas disponibles
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Explora las canchas disponibles y encuentra tu próximo partido.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {filteredCourts.length} {filteredCourts.length === 1 ? 'cancha' : 'canchas'}
                  </span>
                </div>

                {filteredCourts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourts.map((court) => (
                      <CourtCard
                        key={court.id}
                        court={court}
                        onDetails={handleDetails}
                        onReserve={(id) => {
                          handleReserve(id);
                          setReservationStep('availability');
                        }}
                      />
                    ))}
                  </div>
                ) : !courtsLoading && !courtsError ? (
                  <div
                    role="status"
                    className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center sm:py-16"
                  >
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      {searchTerm.trim() ? (
                        <SearchX aria-hidden="true" className="h-7 w-7" />
                      ) : (
                        <Trophy aria-hidden="true" className="h-7 w-7" />
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      {searchTerm.trim()
                        ? 'No encontramos canchas con esa búsqueda'
                        : 'Aún no hay canchas disponibles'}
                    </h3>
                    <p className="mt-1 max-w-md text-sm text-muted-foreground">
                      {searchTerm.trim()
                        ? 'Prueba con otro nombre, deporte o sede.'
                        : 'Cuando se registren canchas disponibles, aparecerán aquí.'}
                    </p>
                  </div>
                ) : null}
              </section>
            )}
          </>
        )}
      </main>
      <WhatsAppReservationButton
        reservation={userReservations.find((reservation) => reservation.estado === 'PENDIENTE')}
      />
    </div>
  );
}
