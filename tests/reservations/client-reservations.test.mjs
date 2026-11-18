import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let server, permissions, Modal, List, actions;
const reservation = {
  id: 42,
  userId: '2',
  courtId: 7,
  cliente: 'Ana Pérez',
  cancha: 'Cancha Norte',
  fecha: '2027-01-05',
  horaInicio: '12:00',
  horaFin: '14:00',
  estado: 'CONFIRMADA',
  monto: 160,
  createdAt: '2027-01-04T09:50:00-05:00',
  canCancel: true,
  paymentStatus: 'PAGADO',
  paymentMethod: 'EFECTIVO',
  scheduleChanges: [],
};
const now = Date.parse('2027-01-04T10:00:00-05:00');

before(async () => {
  server = await createServer({
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: 'custom',
  });
  permissions = await server.ssrLoadModule('/src/app/protected/client/reservations/permissions.ts');
  actions = (await server.ssrLoadModule('/src/services/reservation-service.ts'))
    .getAvailableReservationActions;
  Modal = (
    await server.ssrLoadModule(
      '/src/app/protected/client/reservations/components/reservation-detail-modal.tsx'
    )
  ).ReservationDetailModal;
  List = (
    await server.ssrLoadModule(
      '/src/app/protected/client/reservations/components/my-reservations-list.tsx'
    )
  ).MyReservationsList;
});
after(async () => {
  await server?.close();
});

test('una pendiente tiene una única acción conjunta para pago y confirmación', () => {
  const pending = { ...reservation, estado: 'PENDIENTE', paymentStatus: 'PENDIENTE' };
  const available = actions(pending, now);
  assert.equal(available.filter((action) => ['confirm', 'pay'].includes(action.type)).length, 1);
  assert.equal(
    available.find((action) => action.type === 'confirm').label,
    'Registrar pago y confirmar'
  );
  assert.equal(
    actions(pending, now + 5 * 60_000).some((action) => ['confirm', 'pay'].includes(action.type)),
    false
  );
});

test('pagar no se ofrece en estados terminales ni después de la asistencia', () => {
  for (const estado of ['CANCELADA', 'FINALIZADA', 'NO_ASISTIO', 'EN_CURSO']) {
    assert.equal(
      actions({ ...reservation, estado, paymentStatus: 'PENDIENTE' }, now).some((action) =>
        ['confirm', 'pay'].includes(action.type)
      ),
      false
    );
  }
  assert.equal(
    actions(reservation, now).some((action) => ['confirm', 'pay'].includes(action.type)),
    false
  );
  assert.equal(
    actions({ ...reservation, paymentStatus: 'PENDIENTE' }, now).find(
      (action) => action.type === 'pay'
    ).label,
    'Registrar pago y confirmar'
  );
});

test('la cancelación del cliente requiere el permiso del API y un estado vigente', () => {
  assert.equal(permissions.canRequestCancellation(reservation, now), true);
  assert.equal(
    permissions.canRequestCancellation({ ...reservation, canCancel: false }, now),
    false
  );
  assert.equal(
    permissions.canRequestCancellation({ ...reservation, canCancel: undefined }, now),
    false
  );
  for (const estado of ['CANCELADA', 'FINALIZADA', 'EN_CURSO', 'NO_ASISTIO']) {
    assert.equal(permissions.canRequestCancellation({ ...reservation, estado }, now), false);
  }
});

test('respeta el límite de dos horas en Lima y el vencimiento exacto de una pendiente', () => {
  const cutoff = Date.parse('2027-01-05T10:00:00-05:00');
  assert.equal(permissions.canRequestCancellation(reservation, cutoff), true);
  assert.equal(permissions.canRequestCancellation(reservation, cutoff + 1), false);
  const pending = { ...reservation, estado: 'PENDIENTE', createdAt: '2027-01-04T09:45:00-05:00' };
  assert.equal(permissions.canRequestCancellation(pending, now - 1), true);
  assert.equal(permissions.canRequestCancellation(pending, now), false);
});

function markup(overrides = {}) {
  return renderToStaticMarkup(
    createElement(Modal, {
      reservation,
      canCancel: true,
      confirmingCancel: false,
      pending: false,
      onClose() {},
      onRequestCancellation() {},
      onKeepReservation() {},
      async onConfirmCancellation() {},
      ...overrides,
    })
  );
}

test('el detalle utiliza un diálogo nativo etiquetado y refleja el estado recibido', () => {
  const html = markup({
    reservation: { ...reservation, estado: 'CANCELADA', paymentStatus: 'POR_REEMBOLSAR' },
    canCancel: false,
  });
  assert.match(html, /<dialog/);
  assert.match(html, /aria-labelledby="client-reservation-title"/);
  assert.match(html, />Cancelada</);
  assert.match(html, />Por reembolsar</);
  assert.doesNotMatch(html, />Cancelar reserva</);
  assert.match(html, /Importe base/);
});

test('cancelar exige confirmación y bloquea las acciones mientras responde el servidor', () => {
  const initial = markup();
  assert.match(initial, />Cancelar reserva</);
  assert.doesNotMatch(initial, /Confirmar cancelación/);
  const pending = markup({ confirmingCancel: true, pending: true });
  assert.match(pending, /Conservar reserva/);
  assert.match(pending, /quedará por reembolsar/);
  assert.match(pending, /Cancelando…/);
  assert.match(pending, /aria-busy="true"/);
  for (const button of pending.matchAll(/<button\b[^>]*>/g)) assert.match(button[0], /disabled/);
});

test('el estado vacío de Mis reservas mantiene un título principal', () => {
  const html = renderToStaticMarkup(
    createElement(List, { reservations: [], onExploreCourts() {} })
  );
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
  assert.match(html, /Aún no tienes reservas/);
});
