// src/app/protected/client/page.tsx
import { useState } from 'react';
import { SearchX, Trophy } from 'lucide-react';
import { ClientNavbar } from './components/client-navbar';
import { ClientHero } from './components/client-hero';
import { CourtCard } from './components/court-card';
import { CourtDetailsModal } from './components/court-details-modal';
import { AvailabilityStep } from './components/availability-step';
import { ConfirmationStep } from './components/confirmation-step';
import { ReservationSummaryStep } from './components/reservation-summary-step';
import { MyReservationsList } from './components/my-reservations-list';
import { useCourtsCatalog } from './hooks/use-courts-catalog';
import { getReservations, saveReservation } from '@/services/local-data-service';
import type { User, Reservation } from '@/types';

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
  const [userReservations, setUserReservations] = useState<Reservation[]>(getReservations);

  const {
    searchTerm,
    setSearchTerm,
    filteredCourts,
    selectedCourt,
    setSelectedCourt,
    reservingCourt,
    selectedDate,
    setSelectedDate,
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
    setUserReservations(getReservations());
    setViewMode('my-reservations');
    closeReservationFlow();
  };

  const handleConfirmReservation = (paymentMethod: string) => {
    if (!reservingCourt || selectedSlots.length === 0) return;

    // Objeto de reserva con aserción segura para evitar incompatibilidades de tipo
    const newReservation = {
      id: Date.now(),
      code: `CY-${Math.floor(10000 + Math.random() * 90000)}`,
      courtId: reservingCourt.id,
      courtName: reservingCourt.name,
      establishmentName: 'Sede San Miguel',
      location: reservingCourt.location || 'Av. La Marina 2345, San Miguel',
      sportType: reservingCourt.features?.[0] || 'Fútbol',
      date: selectedDate,
      timeSlots: selectedSlots.map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        price: slot.price,
      })),
      totalAmount,
      totalPrice: totalAmount,
      status: 'CONFIRMADA',
      paymentStatus: 'PAGADO',
      paymentMethod,
      createdAt: new Date().toISOString(),
      holderInfo: {
        fullName: user?.firstName
          ? `${user.firstName} ${user.lastName || ''}`.trim()
          : 'Anthony Landa',
        email: user?.email || 'anthony@canchaya.com',
      },
    } as unknown as Reservation;

    // Guardar en el almacenamiento de localStorage
    saveReservation(newReservation);

    // Actualizar estados
    setUserReservations(getReservations());
    setCompletedReservation(newReservation);
    setReservationStep('summary');
  };

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

            {/* Flujo de Reserva */}
            {reservingCourt ? (
              <div className="space-y-6">
                {reservationStep === 'availability' && (
                  <AvailabilityStep
                    court={reservingCourt}
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
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
                    currentUser={user}
                    onBack={() => setReservationStep('availability')}
                    onConfirm={handleConfirmReservation}
                  />
                )}

                {reservationStep === 'summary' && completedReservation && (
                  <ReservationSummaryStep
                    reservation={completedReservation}
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

      {/* Modal de Detalles */}
      {selectedCourt && (
        <CourtDetailsModal
          court={selectedCourt}
          onClose={() => setSelectedCourt(null)}
          onSelectAvailability={() => {
            handleReserve(selectedCourt.id);
            setReservationStep('availability');
          }}
        />
      )}
    </div>
  );
}
