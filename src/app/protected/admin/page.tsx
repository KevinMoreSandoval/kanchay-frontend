import { notifyToast } from '@/services/toast-service';
import { CourtsList } from './courts/components/courts-list';
import { CourtFormActions } from './courts/components/court-form-actions';
import { useState } from 'react';
import { ArrowLeft, CalendarDays, LayoutDashboard, Trophy, Users } from 'lucide-react';
import { Sidebar, type SidebarItem } from '@/components/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { AdminHeader } from './components/admin-header';
import { AdminKpis } from './components/admin-kpis';
import { FormStepper } from '@/components';
import { RecentUsersCard } from './components/recent-users-card';
import { CourtsSummaryCard } from './components/courts-summary-card';
import { UsersManagement } from './users/components/users-management';
import { ReservationsManagement } from './components/reservations-management';
import { StepFeatures } from './courts/components/step-features';
import { StepGeneralInfo } from './courts/components/step-general-info';
import { StepLocation } from './courts/components/step-location';
import { useAdminDashboard } from './hooks/use-admin-dashboard';
import { useCourtForm } from './courts/hooks/use-court-form';
import { AMENITIES, SERVICES } from './courts/constants';
import { useDeleteCourt } from './courts/hooks/use-delete-court';
import type { Court, User } from '@/types';

export interface AdminPageProps {
  user?: User | null;
  onLogout?: () => void;
}

const adminItems: SidebarItem[] = [
  { label: 'Dashboard', Icon: LayoutDashboard, href: '/admin' },
  { label: 'Canchas', Icon: Trophy, href: '/admin/canchas' },
  { label: 'Usuarios', Icon: Users, href: '/admin/usuarios' },
  { label: 'Reservas', Icon: CalendarDays, href: '/admin/reservas' },
];

const courtSteps = [
  { label: 'General', description: 'Datos y fotos' },
  { label: 'Tarifas', description: 'Servicios y precios' },
  { label: 'Ubicación', description: 'Horarios y estado' },
];

function labelFromOptions(options: { id: string; label: string }[], selected: string[]): string {
  const labels = options
    .filter((option) => selected.includes(option.id))
    .map((option) => option.label);

  return labels.length ? labels.join(', ') : 'Sin selección';
}

export default function AdminPage({ user, onLogout }: AdminPageProps) {
  const { users, courts, metrics, refreshCourts, courtsLoading, courtsError } = useAdminDashboard();
  const courtForm = useCourtForm();
  const [activeView, setActiveView] = useState<'dashboard' | 'courts' | 'users' | 'reservations'>(
    'dashboard'
  );
  const [courtScreen, setCourtScreen] = useState<'list' | 'form'>('list');
  const [editingCourtName, setEditingCourtName] = useState('');
  const [, setManagementStatus] = useState('');
  const deletion = useDeleteCourt((name) =>
    setManagementStatus(notifyToast(`Se eliminó ${name}.`, 'success'))
  );

  const stepTitle = courtSteps[courtForm.step]?.label ?? courtSteps[0].label;

  const isLastStep = courtForm.step === courtSteps.length - 1;
  const activeHref =
    activeView === 'courts'
      ? '/admin/canchas'
      : activeView === 'users'
        ? '/admin/usuarios'
        : activeView === 'reservations'
          ? '/admin/reservas'
          : '/admin';

  const openNewCourtForm = () => {
    courtForm.resetForm();
    setEditingCourtName('');
    setManagementStatus('');
    setCourtScreen('form');
  };

  const openEditCourtForm = (court: Court) => {
    if (!court.management) return;
    courtForm.loadDraft(court.management);
    setEditingCourtName(court.name);
    setManagementStatus('');
    setCourtScreen('form');
  };

  const registerCourt = async () => {
    const wasEditing = courtForm.isEditing;
    if (await courtForm.register()) {
      setManagementStatus(
        notifyToast(
          editingCourtName
            ? `Se actualizó ${courtForm.general.name}.`
            : `Se registró ${courtForm.general.name}.`,
          'success'
        )
      );
      if (wasEditing) {
        setEditingCourtName(courtForm.general.name.trim());
      } else {
        setCourtScreen('list');
        setEditingCourtName('');
      }
    }
  };

  const handleNavigate = (href: string) => {
    setActiveView(
      href === '/admin/canchas'
        ? 'courts'
        : href === '/admin/usuarios'
          ? 'users'
          : href === '/admin/reservas'
            ? 'reservations'
            : 'dashboard'
    );
    if (href === '/admin/canchas') {
      setCourtScreen('list');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
      <Sidebar
        items={adminItems}
        activeHref={activeHref}
        onLogout={onLogout}
        onNavigate={handleNavigate}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          <div className="border-b border-border pb-4">
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {activeView === 'dashboard'
                ? 'Panel de Control General'
                : activeView === 'courts'
                  ? 'Gestión de Canchas'
                  : activeView === 'users'
                    ? 'Gestión de Usuarios'
                    : 'Gestión de Reservas'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeView === 'dashboard'
                ? 'Métricas consolidadas, clientes y gestión de infraestructura'
                : activeView === 'users'
                  ? ''
                  : ''}
            </p>
          </div>

          {activeView === 'dashboard' && (
            <>
              <AdminKpis metrics={metrics} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentUsersCard users={users} />
                <CourtsSummaryCard courts={courts} />
              </div>
            </>
          )}

          {activeView === 'users' && <UsersManagement currentUser={user} />}

          {activeView === 'reservations' && <ReservationsManagement />}

          {activeView === 'courts' && courtScreen === 'list' && (
            <CourtsList
              courts={courts}
              courtsLoading={courtsLoading}
              courtsError={courtsError}
              deletion={deletion}
              refreshCourts={refreshCourts}
              openNewCourtForm={openNewCourtForm}
              openEditCourtForm={openEditCourtForm}
            />
          )}

          {activeView === 'courts' && courtScreen === 'form' && (
            <Card id="canchas-form">
              <CardHeader className="gap-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="mb-2 h-8 px-0 text-muted-foreground hover:bg-transparent"
                      onClick={() => setCourtScreen('list')}
                      disabled={courtForm.isSubmitting}
                    >
                      <ArrowLeft aria-hidden="true" />
                      Volver a canchas
                    </Button>
                    <CardTitle>
                      {editingCourtName
                        ? `Editar ${editingCourtName}`
                        : 'Registrar cancha deportiva'}
                    </CardTitle>
                    <CardDescription>
                      Completa la información en 3 pasos. El avance se guarda como borrador local.
                    </CardDescription>
                  </div>
                  <Badge variant={courtForm.submitStatus === 'registered' ? 'success' : 'outline'}>
                    Paso {courtForm.step + 1} de {courtSteps.length}
                  </Badge>
                </div>

                <FormStepper steps={courtSteps} currentStep={courtForm.step} />
              </CardHeader>

              <CardContent className="space-y-6">
                <fieldset disabled={courtForm.isSubmitting} className="min-w-0 space-y-6">
                  <div className="rounded-lg border border-border bg-muted/30 p-4 sm:p-5">
                    <div className="mb-5 flex flex-col gap-1">
                      <p className="text-sm font-semibold text-primary">{stepTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {courtForm.step === 0 &&
                          'Define la identidad, deporte, superficie y fotografías de la cancha.'}
                        {courtForm.step === 1 &&
                          'Configura capacidad, dimensiones, servicios incluidos y tarifas.'}
                        {courtForm.step === 2 &&
                          'Agrega ubicación, horarios, estado inicial y revisa el resumen.'}
                      </p>
                    </div>

                    {courtForm.step === 0 && (
                      <StepGeneralInfo
                        data={courtForm.general}
                        errors={courtForm.generalErrors}
                        onChange={courtForm.setGeneral}
                      />
                    )}

                    {courtForm.step === 1 && (
                      <StepFeatures
                        data={courtForm.features}
                        errors={courtForm.featuresErrors}
                        onChange={courtForm.setFeatures}
                      />
                    )}

                    {courtForm.step === 2 && (
                      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] gap-6">
                        <StepLocation
                          data={courtForm.location}
                          errors={courtForm.locationErrors}
                          onChange={courtForm.setLocation}
                        />

                        <aside className="rounded-lg border border-border bg-background p-4 h-fit">
                          <h2 className="text-base font-bold text-foreground">Resumen</h2>
                          <dl className="mt-3 space-y-3 text-sm">
                            <div>
                              <dt className="font-semibold text-foreground">Cancha</dt>
                              <dd className="text-muted-foreground">
                                {courtForm.general.name || 'Sin nombre'} ·{' '}
                                {courtForm.general.sport || 'Sin deporte'}
                              </dd>
                            </div>
                            <div>
                              <dt className="font-semibold text-foreground">Características</dt>
                              <dd className="text-muted-foreground">
                                {courtForm.features.capacity || '0'} jugadores ·{' '}
                                {courtForm.features.coverType || 'Sin tipo'} ·{' '}
                                {courtForm.features.lighting || 'Sin iluminación'}
                              </dd>
                            </div>
                            <div>
                              <dt className="font-semibold text-foreground">Tarifa</dt>
                              <dd className="text-muted-foreground">
                                S/ {courtForm.features.pricePerHour || '0'} por hora
                                {courtForm.features.promotionalPrice
                                  ? ` · Promo S/ ${courtForm.features.promotionalPrice}`
                                  : ''}
                              </dd>
                            </div>
                            <div>
                              <dt className="font-semibold text-foreground">Servicios</dt>
                              <dd className="text-muted-foreground">
                                {labelFromOptions(SERVICES, courtForm.features.services)}
                              </dd>
                            </div>
                            <div>
                              <dt className="font-semibold text-foreground">Instalaciones</dt>
                              <dd className="text-muted-foreground">
                                {labelFromOptions(AMENITIES, courtForm.features.amenities)}
                              </dd>
                            </div>
                            <div>
                              <dt className="font-semibold text-foreground">Ubicación</dt>
                              <dd className="text-muted-foreground">
                                {courtForm.location.venue || 'Sin sede'} ·{' '}
                                {courtForm.location.address || 'Sin dirección'}
                              </dd>
                            </div>
                          </dl>
                        </aside>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div aria-live="polite" className="min-h-5 text-sm font-medium">
                      {!isLastStep && !courtForm.canAdvance && (
                        <span className="text-muted-foreground">
                          Completa correctamente los campos obligatorios para continuar.
                        </span>
                      )}
                    </div>

                    <CourtFormActions form={courtForm} onSave={() => void registerCourt()} />
                  </div>
                </fieldset>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
