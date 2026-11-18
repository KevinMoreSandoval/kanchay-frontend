import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

let server, api, clients, session, calls;
const originalFetch = globalThis.fetch;
const accessToken = `header.${Buffer.from(JSON.stringify({ exp: Date.now() / 1000 + 3600 })).toString('base64url')}.signature`;
const response = {
  id: 42,
  canchaId: 7,
  nombreCancha: 'Norte',
  fecha: '2027-01-05',
  horaInicio: '12:00:00',
  horaFin: '14:00:00',
  total: 160,
  estado: 'pendiente',
  metodoPago: 'Yape_Plin',
  clienteId: 2,
  clienteNombre: 'Ana Pérez',
  clienteDni: '12345678',
  clienteEmail: 'ana@example.com',
  clienteTelefono: '987654321',
  createdAt: '2027-01-04T10:00:00-05:00',
  paymentStatus: 'PENDIENTE',
  puedeCancelar: true,
  observaciones: 'Observación',
  scheduleChanges: [
    {
      changedAt: '2027-01-04T10:01:00-05:00',
      previousDate: '2027-01-05',
      previousStartTime: '12:00',
      previousEndTime: '14:00',
      newDate: '2027-01-06',
      newStartTime: '12:00',
      newEndTime: '14:00',
      surcharge: 24,
      surchargePaymentStatus: 'PENDIENTE',
    },
  ],
};
const user = {
  id: 2,
  nombre: 'Ana',
  apellido: 'Pérez',
  email: 'ana@example.com',
  dni: '12345678',
  telefono: '987654321',
  fechaNacimiento: '2000-05-12',
  rol: 'CLIENTE',
  activo: true,
};

before(async () => {
  globalThis.window = new EventTarget();
  globalThis.localStorage = {
    getItem: () => assert.fail('No debe leer localStorage'),
    setItem: () => assert.fail('No debe escribir localStorage'),
    removeItem: () => assert.fail('No debe usar localStorage'),
  };
  globalThis.sessionStorage = globalThis.localStorage;
  server = await createServer({
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: 'custom',
  });
  api = await server.ssrLoadModule('/src/services/reservations/reservation-api.ts');
  clients = await server.ssrLoadModule('/src/services/clients/client-service.ts');
  session = await server.ssrLoadModule('/src/services/session-service.ts');
});

beforeEach(() => {
  calls = [];
  session.setSession(accessToken, { id: '1', role: 'Administrador' });
  globalThis.fetch = async (url, options) => {
    calls.push({ url, ...options });
    if (url.includes('/api/clientes'))
      return Response.json(options.method === 'GET' && !url.includes('buscar') ? [user] : user);
    return options.method === 'DELETE'
      ? new Response(null, { status: 204 })
      : Response.json(
          options.method === 'GET' && !/\/reservas\/\d+$/.test(url) ? [response] : response
        );
  };
});

after(async () => {
  globalThis.fetch = originalFetch;
  delete globalThis.window;
  delete globalThis.localStorage;
  delete globalThis.sessionStorage;
  await server?.close();
});

test('clientes consultan solo sus reservas y el personal usa el listado protegido', async () => {
  session.setSession(accessToken, { id: '2', role: 'Cliente' });
  const [record] = await api.listReservations();
  assert.ok(calls[0].url.endsWith('/api/reservas/mias'));
  assert.equal(calls[0].headers.Authorization, `Bearer ${accessToken}`);
  assert.equal(record.id, 42);
  assert.equal(record.userId, '2');
  assert.equal(record.courtId, 7);
  assert.equal(record.horaInicio, '12:00');
  assert.equal(record.monto, 160);
  assert.equal(record.estado, 'PENDIENTE');
  assert.equal(record.canCancel, true);
  assert.equal(record.paymentMethod, 'YAPE_PLIN');
  assert.equal(record.observaciones, 'Observación');
  assert.equal(record.scheduleChanges[0].surcharge, 24);
  session.setSession(accessToken, { id: '1', role: 'Recepcionista' });
  await api.listReservations();
  assert.ok(calls[1].url.endsWith('/api/reservas'));
});

test('la creación envía campos de la UI y el servidor determina importe y estado', async () => {
  const saved = await api.createReservationRequest({
    courtId: 7,
    userId: '2',
    fecha: '2027-01-05',
    horaInicio: '12:00',
    horaFin: '14:00',
    paymentMethod: 'YAPE_PLIN',
    observaciones: 'Observación',
    monto: 1,
    estado: 'CONFIRMADA',
  });
  assert.equal(saved.id, 42);
  assert.equal(calls[0].method, 'POST');
  assert.deepEqual(JSON.parse(calls[0].body), {
    canchaId: 7,
    clienteId: 2,
    fecha: '2027-01-05',
    horaInicio: '12:00',
    horaFin: '14:00',
    metodoPago: 'YAPE_PLIN',
    observaciones: 'Observación',
  });
});

test('confirmación, asistencia, pagos, recargos y reprogramaciones esperan al API', async () => {
  await api.confirmReservation(42);
  await api.markReservationAttendance(42);
  await api.updateReservationPaymentStatus(42, 'PAGADO');
  await api.updateReservationPaymentStatus(42, 'REEMBOLSADO');
  await api.updateReservationSurchargePayment(42, 0);
  await api.rescheduleReservation(42, { date: '2027-01-06', startTime: '12:00', endTime: '14:00' });
  assert.deepEqual(JSON.parse(calls[0].body), { estado: 'confirmada' });
  assert.deepEqual(JSON.parse(calls[1].body), { estado: 'en_curso' });
  assert.ok(calls[2].url.endsWith('/42/pago'));
  assert.ok(calls[4].url.endsWith('/42/recargos/0/pago'));
  assert.equal(calls[5].method, 'PUT');
  assert.deepEqual(JSON.parse(calls[5].body), {
    fecha: '2027-01-06',
    horaInicio: '12:00',
    horaFin: '14:00',
  });
});

test('cancelar acepta 204 y un rechazo no publica éxito ni escribe datos locales', async () => {
  let changed = 0;
  const listener = () => changed++;
  globalThis.window.addEventListener(api.RESERVATIONS_CHANGED_EVENT, listener);
  try {
    await api.cancelReservation(42);
    assert.equal(changed, 1);
    assert.equal(calls[0].method, 'DELETE');
    globalThis.fetch = async () =>
      Response.json({ error: 'No se puede cancelar.' }, { status: 400 });
    await assert.rejects(api.cancelReservation(42), /No se puede cancelar/);
    assert.equal(changed, 1);
    globalThis.fetch = async () => Response.json(null);
    await assert.rejects(api.confirmReservation(42), /no confirmó/);
    assert.equal(changed, 1);
  } finally {
    globalThis.window.removeEventListener(api.RESERVATIONS_CHANGED_EVENT, listener);
  }
});

test('clientes de recepción se consultan y crean en el backend con su fecha de nacimiento', async () => {
  session.setSession(accessToken, { id: '1', role: 'Recepcionista' });
  const listed = await clients.listClients();
  assert.equal(listed[0].birthDate, '2000-05-12');
  assert.equal((await clients.lookupClient('12345678')).id, '2');
  const created = await clients.createClient({
    firstName: 'Ana',
    lastName: 'Pérez',
    dni: '12345678',
    email: 'ANA@example.com',
    birthDate: '2000-05-12',
    phone: '987654321',
  });
  assert.equal(created.id, '2');
  assert.equal(calls[2].method, 'POST');
  const body = JSON.parse(calls[2].body);
  assert.equal(body.rol, 'CLIENTE');
  assert.equal(body.fechaNacimiento, '2000-05-12');
  assert.equal('password' in body, false);
});

test('buscar un DNI inexistente devuelve null y fallos de red/permisos se conservan', async () => {
  globalThis.fetch = async () => new Response(null, { status: 404 });
  assert.equal(await clients.lookupClient('12345678'), null);
  globalThis.fetch = async () => Response.json({ error: 'No tienes permisos.' }, { status: 403 });
  await assert.rejects(api.listReservations(), /No tienes permisos/);
  globalThis.fetch = async () => {
    throw new TypeError('network');
  };
  await assert.rejects(api.listReservations(), /conectar con el servidor/);
  session.clearSession();
  calls = [];
  await assert.rejects(api.listReservations(), /Inicia sesión/);
  assert.equal(calls.length, 0);
});

test('ningún archivo de producción accede a almacenamiento persistente del navegador', async () => {
  async function inspect(folder) {
    for (const item of await readdir(folder, { withFileTypes: true })) {
      const path = `${folder}/${item.name}`;
      if (item.isDirectory()) await inspect(path);
      else if (/\.[jt]sx?$/.test(item.name)) {
        const source = await readFile(path, 'utf8');
        assert.doesNotMatch(source, /\b(?:localStorage|sessionStorage|indexedDB)\b/, path);
        assert.doesNotMatch(source, /storage-service|local-user-service|local-data-service/, path);
      }
    }
  }
  await inspect(fileURLToPath(new URL('../../src', import.meta.url)));
});
