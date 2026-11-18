import { Pencil, Plus, Trash2, Trophy } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Court } from '@/types';
import type { useDeleteCourt } from '../hooks/use-delete-court';

interface CourtsListProps {
  courts: Court[];
  courtsLoading: boolean;
  courtsError: string;
  deletion: ReturnType<typeof useDeleteCourt>;
  refreshCourts: () => Promise<void>;
  openNewCourtForm: () => void;
  openEditCourtForm: (court: Court) => void;
}

export function CourtsList({
  courts,
  courtsLoading,
  courtsError,
  deletion,
  refreshCourts,
  openNewCourtForm,
  openEditCourtForm,
}: CourtsListProps) {
  return (
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
      </CardHeader>
      <CardContent>
        {courtsLoading && <p role="status">Cargando canchas...</p>}
        {courtsError && (
          <div>
            <Button variant="outline" onClick={() => void refreshCourts()}>
              Reintentar carga de canchas
            </Button>
          </div>
        )}
        {deletion.pending && (
          <div role="alert" className="mb-4 rounded-lg border border-border p-4 space-y-3">
            <p>¿Eliminar {deletion.pending.name}? Esta acción no se puede deshacer.</p>

            <div className="flex gap-2">
              <Button
                variant="destructive"
                disabled={deletion.busy}
                onClick={() => void deletion.confirm()}
              >
                {deletion.busy ? 'Eliminando...' : 'Confirmar eliminación'}
              </Button>
              <Button variant="outline" disabled={deletion.busy} onClick={deletion.cancel}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
        {!courtsLoading && !courtsError && courts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Trophy aria-hidden="true" className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Aún no existen canchas</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Crea tu primera cancha deportiva para empezar a gestionar tarifas, características y
              disponibilidad.
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
                        <Badge variant={court.available ? 'success' : 'outline'}>
                          {court.available ? 'Activa' : 'Inactiva'}
                        </Badge>
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
                        onClick={() => deletion.request(court)}
                        disabled={deletion.busy}
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
  );
}
