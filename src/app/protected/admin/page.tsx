import { useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  LayoutDashboard,
  Pencil,
  Plus,
  Trash2,
  Trophy,
  Users,
} from 'lucide-react';
import { Sidebar, type SidebarItem } from '@/components/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AdminHeader } from './components/admin-header';
import { AdminKpis } from './components/admin-kpis';
import { CourtStepper } from './components/court-stepper';
import { RecentUsersCard } from './components/recent-users-card';
import { CourtsSummaryCard } from './components/courts-summary-card';
import { UsersManagement } from './components/users-management';
import { ReservationsManagement } from './components/reservations-management';
import { StepFeatures } from './components/step-features';
import { StepGeneralInfo } from './components/step-general-info';
import { StepLocation } from './components/step-location';
import { useAdminDashboard } from './hooks/use-admin-dashboard';
import { useCourtForm } from './hooks/use-court-form';
import {
  AMENITIES,
  DEFAULT_CLOSE_TIME,
  DEFAULT_OPEN_TIME,
  SERVICES,
  WEEK_DAYS,
} from './courts/constants';
import { deleteManagedCourtByCatalogId, getManagedCourts } from '@/services/court-draft-service';
import type { Court, User } from '@/types';
import type { CourtFormDraft } from './courts/types';

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

function scheduleDefaults() {
  return WEEK_DAYS.map((day) => ({
    id: `schedule-${day.toLowerCase()}`,
    day,
    opens: DEFAULT_OPEN_TIME,
    closes: DEFAULT_CLOSE_TIME,
    isOpen: true,
  }));
}

function draftFromCourt(court: Court): CourtFormDraft {
  const managedCourt = getManagedCourts().find(
    (item) => Number(item.id.split('-')[1]) === court.id
  );

  if (managedCourt) return managedCourt;

  return {
    id: `court-${court.id}-catalog`,
    general: {
      name: court.name,
      sport: 'Otro',
      modality: 'Mixto',
      surface: 'Césped sintético',
      description: '',
      photos: court.image ? [{ id: `photo-${court.id}`, src: court.image }] : [],
    },
    features: {
      capacity:
        court.features.find((feature) => feature.includes('jugadores'))?.split(' ')[0] ?? '',
      width: '',
      length: '',
      coverType: 'Abierta',
      lighting: 'LED',
      services: [],
      amenities: [],
      pricePerHour: String(court.price),
      promotionalPrice: '',
    },
    location: {
      venue: court.location,
      address: court.location,
      reference: '',
      schedule: scheduleDefaults(),
      status: 'activa',
    },
    savedAt: new Date().toISOString(),
  };
}

export default function AdminPage({ user, onLogout }: AdminPageProps) {
  const { users, courts, metrics, refreshCourts } = useAdminDashboard();
  const courtForm = useCourtForm();
  const [activeView, setActiveView] = useState<'dashboard' | 'courts' | 'users' | 'reservations'>(
    'dashboard'
  );
  const [courtScreen, setCourtScreen] = useState<'list' | 'form'>('list');
  const [editingCourtName, setEditingCourtName] = useState('');
  const [managementStatus, setManagementStatus] = useState('');

  const stepTitle = courtSteps[courtForm.step]?.label ?? courtSteps[0].label;
  const canGoBack = courtForm.step > 0;
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
    courtForm.loadDraft(draftFromCourt(court));
    setEditingCourtName(court.name);
    setManagementStatus('');
    setCourtScreen('form');
  };

  const deleteCourt = (court: Court) => {
    deleteManagedCourtByCatalogId(court.id);
    refreshCourts();
    setManagementStatus(`Se eliminó ${court.name}.`);
  };

  const registerCourt = () => {
    if (courtForm.register()) {
      refreshCourts();
      setManagementStatus(
        editingCourtName
          ? `Se actualizó ${courtForm.general.name}.`
          : `Se registró ${courtForm.general.name}.`
      );
      setCourtScreen('list');
      setEditingCourtName('');
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
            <Card id="canchas">
              <CardHeader className="gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>Canchas existentes</CardTitle>
                    <CardDescription>
                      Revisa deporte, sede, tarifa y características principales.
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={openNewCourtForm}>
                    <Plus aria-hidden="true" />
                    Nueva cancha
                  </Button>
                </div>
                {managementStatus && (
                  <p role="status" className="text-sm font-medium text-primary">
                    {managementStatus}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {courts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 py-12 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Trophy aria-hidden="true" className="h-6 w-6" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">Aún no existen canchas</h2>
                    <p className="mt-1 max-w-md text-sm text-muted-foreground">
                      Crea tu primera cancha deportiva para empezar a gestionar tarifas,
                      características y disponibilidad.
                    </p>
                    <Button type="button" onClick={openNewCourtForm} className="mt-5">
                      <Plus aria-hidden="true" />
                      Crear cancha
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cancha</TableHead>
                        <TableHead>Sede</TableHead>
                        <TableHead>Características</TableHead>
                        <TableHead>Tarifa</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courts.map((court) => (
                        <TableRow key={court.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {court.image ? (
                                <img
                                  src={court.image}
                                  alt={court.name}
                                  className="h-11 w-11 rounded-md object-cover"
                                />
                              ) : (
                                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                  <Trophy aria-hidden="true" className="h-5 w-5" />
                                </span>
                              )}
                              <div>
                                <p className="font-semibold text-foreground">{court.name}</p>
                                <p className="text-xs text-muted-foreground">ID {court.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{court.location}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1.5">
                              {court.features.map((feature) => (
                                <Badge key={`${court.id}-${feature}`} variant="outline">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="font-bold">S/ {court.price}/h</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`Editar ${court.name}`}
                                onClick={() => openEditCourtForm(court)}
                              >
                                <Pencil aria-hidden="true" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`Eliminar ${court.name}`}
                                onClick={() => deleteCourt(court)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 aria-hidden="true" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
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

                <CourtStepper steps={courtSteps} currentStep={courtForm.step} />
              </CardHeader>

              <CardContent className="space-y-6">
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
                    {courtForm.submitStatus === 'draft-saved' && (
                      <span className="text-primary">Borrador guardado correctamente.</span>
                    )}
                    {courtForm.submitStatus === 'registered' && (
                      <span className="text-emerald-700">Cancha registrada correctamente.</span>
                    )}
                    {courtForm.submitStatus === 'error' && (
                      <span role="alert" className="text-destructive">
                        Revisa los campos marcados antes de registrar.
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="button" variant="outline" onClick={courtForm.saveAsDraft}>
                      Guardar borrador
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={courtForm.goBack}
                      disabled={!canGoBack}
                    >
                      Anterior
                    </Button>
                    {isLastStep ? (
                      <Button type="button" onClick={registerCourt}>
                        {editingCourtName ? 'Guardar cambios' : 'Registrar cancha'}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={courtForm.goNext}
                        disabled={!courtForm.canAdvance}
                      >
                        Siguiente
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
