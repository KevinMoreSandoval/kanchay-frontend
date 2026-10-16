// src/app/protected/client/page.tsx
import { useState, useCallback } from 'react';
import { SearchX, Trophy } from 'lucide-react';
import { ClientNavbar } from './components/client-navbar';
import { ClientHero } from './components/client-hero';
import { CourtCard } from './components/court-card';
import { CourtDetailsScreen } from './components/court-details-screen';
import { AvailabilityStep } from './components/availability-step';
import { ConfirmationStep } from './components/confirmation-step';
import { ReservationSummaryStep } from './components/reservation-summary-step';
import { MyReservationsList } from './components/my-reservations-list';
import { useCourtsCatalog } from './hooks/use-courts-catalog';
import { createReservation } from '@/services/reservation-service';
import { getReservations } from '@/services/local-data-service';
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
  const [reservationError, setReservationError] = useState<string | null>(null);

  /** Reservas del usuario actual */
  const getUserReservations = useCallback((): Reservation[] => {
    const all = getReservations();
    const userId = user?.id;
    if (!userId) return [];
    return all.filter((r) => r.userId === userId);
  }, [user]);

  const [userReservations, setUserReservations] = useState<Reservation[]>(getUserReservations);

  const {
    searchTerm,
    setSearchTerm,
    filteredCourts,
    selectedCourt,
    setSelectedCourt,
    reservingCourt,
    selectedDate,
    handleDateChange,
    availableSlots,
    selectedSlots,
    totalAmount,
    handleToggleSlot,
    actionNotice,
    setActionNotice,
    handleDetails,
    handleReserve,
    closeReservationFlow,
  } = useCourtsCatalog();

  const handleOpenMyReservations = () => {
    setUserReservations(getUserReservations());
    setViewMode('my-reservations');
    closeReservationFlow();
    setReservationError(null);
  };

  const handleConfirmReservation = (paymentMethod: PaymentMethod) => {
    if (!reservingCourt || selectedSlots.length === 0 || !user?.id) return;

    setReservationError(null);

    // Calcular horaInicio y horaFin a partir de los slots seleccionados (ordenados)
    const sorted = [...selectedSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const horaInicio = sorted[0].startTime;
    const horaFin = sorted[sorted.length - 1].endTime;
    const monto = totalAmount;
    const cliente = `${user.firstName} ${user.lastName || ''}`.trim();

    try {
      const allReservations = createReservation({
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

      // La reserva recién creada es la última en la lista
      const created = allReservations[allReservations.length - 1];
      setUserReservations(allReservations.filter((r) => r.userId === user.id));
      setCompletedReservation(created);
      setReservationStep('summary');
    } catch (err) {
      setReservationError(err instanceof Error ? err.message : 'No se pudo crear la reserva.');
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {viewMode === 'my-reservations' ? (
          <MyReservationsList
            reservations={userReservations}
            onExploreCourts={() => setViewMode('catalog')}
          />
        ) : (
          <>
            {!reservingCourt && (
              <ClientHero
                userName={user?.firstName}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            )}

            {actionNotice && (
              <div
                role="status"
                className="p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-sm font-semibold flex items-center justify-between animate-in fade-in"
              >
                <span>{actionNotice}</span>
                <button
                  type="button"
                  onClick={() => setActionNotice(null)}
                  className="text-xs hover:underline cursor-pointer ml-4 font-bold"
                >
                  Cerrar
                </button>
              </div>
            )}

            {reservationError && (
              <div
                role="alert"
                className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm font-semibold flex items-center justify-between animate-in fade-in"
              >
                <span>{reservationError}</span>
                <button
                  type="button"
                  onClick={() => setReservationError(null)}
                  className="text-xs hover:underline cursor-pointer ml-4 font-bold"
                >
                  Cerrar
                </button>
              </div>
            )}

            {/* Flujo de Reserva */}
            {reservingCourt ? (
              <div className="space-y-6">
                {reservationStep === 'availability' && (
                  <AvailabilityStep
                    court={reservingCourt}
                    selectedDate={selectedDate}
                    onDateChange={handleDateChange}
                    availableSlots={availableSlots}
                    selectedSlots={selectedSlots}
                    onToggleSlot={handleToggleSlot}
                    totalAmount={totalAmount}
                    onBack={closeReservationFlow}
                    onNext={() => setReservationStep('confirmation')}
                  />
                )}

                {reservationStep === 'confirmation' && (
                  <ConfirmationStep
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
                ) : (
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
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
