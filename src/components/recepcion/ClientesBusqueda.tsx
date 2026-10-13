import { Button, Card, Input, Label } from '@/components/ui';
import type { ReceptionManagement } from '@/app/protected/recepcionist/hooks/use-reception';
import { ListaReservas } from './ListaReservas';

export function ClientesBusqueda({ management: m }: { management: ReceptionManagement }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="client-search">Buscar por nombre, teléfono o correo</Label>
        <Input
          id="client-search"
          type="search"
          value={m.clientSearch}
          onChange={(e) => m.setClientSearch(e.target.value)}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Consulta de clientes y reservas. {m.clients.length} resultados.
      </p>
      {!m.clients.length && (
        <Card className="p-6 text-muted-foreground">
          No hay clientes que coincidan con la búsqueda.
        </Card>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {m.clients.map((client) => (
          <Card key={client.id} className="space-y-2 p-4">
            <h2 className="break-words font-bold">
              {client.firstName} {client.lastName}
            </h2>
            <p className="break-all text-sm">{client.email}</p>
            <p className="text-sm text-muted-foreground">
              {client.phone || 'Sin teléfono registrado'}
            </p>
            <Button
              variant={m.clientId === client.id ? 'default' : 'outline'}
              aria-pressed={m.clientId === client.id}
              onClick={() => m.setClientId(client.id)}
            >
              Consultar reservas
            </Button>
          </Card>
        ))}
      </div>
      {m.selectedClient && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">
            Reservas de {m.selectedClient.firstName} {m.selectedClient.lastName}
          </h2>
          <ListaReservas
            rows={m.clientReservations}
            onDetail={m.openDetail}
            emptyMessage="Este cliente no tiene reservas registradas."
          />
        </section>
      )}
    </div>
  );
}
