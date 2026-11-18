import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { createServer } from 'vite';

let server, service, session, calls;
const originalFetch = globalThis.fetch;
const values = new Map();
const response = {
  id: 42,
  nombre: 'Ana',
  apellido: 'Pérez',
  email: 'ana@example.com',
  dni: '12345678',
  telefono: '987654321',
  fechaNacimiento: '2000-05-12',
  rol: 'CLIENTE',
  activo: true,
};
const form = {
  firstName: ' Ana ',
  lastName: 'Pérez',
  email: 'ANA@example.com',
  role: 'Cliente',
  dni: '12345678',
  phone: '987654321',
  birthDate: '2000-05-12',
};
const accessToken = `header.${Buffer.from(JSON.stringify({ exp: Date.now() / 1000 + 3600 })).toString('base64url')}.signature`;

before(async () => {
  globalThis.localStorage = {
    getItem: () => assert.fail('El CRUD no debe leer localStorage.'),
    setItem: () => assert.fail('El CRUD no debe escribir localStorage.'),
    removeItem: () => assert.fail('El CRUD no debe depender de localStorage.'),
  };
  globalThis.window = new EventTarget();
  server = await createServer({
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: 'custom',
  });
  service = await server.ssrLoadModule('/src/services/users/user-service.ts');
  session = await server.ssrLoadModule('/src/services/session-service.ts');
});

beforeEach(() => {
  calls = [];
  values.clear();
  session.setSession(accessToken, { id: '1', role: 'Administrador' });
  globalThis.fetch = async (url, options) => {
    calls.push({ url, ...options });
    return options.method === 'DELETE'
      ? new Response(null, { status: 204 })
      : options.method === 'PATCH'
        ? new Response('Usuario actualizado')
        : Response.json(options.method === 'GET' ? [response] : response);
  };
});

after(async () => {
  globalThis.fetch = originalFetch;
  delete globalThis.localStorage;
  delete globalThis.window;
  await server?.close();
});

test('loads real users with the admin bearer and maps every form field', async () => {
  const users = await service.listUsers();
  assert.equal(calls[0].url.endsWith('/admin/usuarios'), true);
  assert.equal(calls[0].headers.Authorization, `Bearer ${accessToken}`);
  assert.deepEqual(users[0], {
    ...form,
    id: '42',
    firstName: 'Ana',
    email: 'ana@example.com',
    active: true,
  });
});

test('creation sends the UI fields, leaving the initial client password to the backend', async () => {
  await service.saveManagedUser(form);
  assert.equal(calls[0].method, 'POST');
  assert.deepEqual(JSON.parse(calls[0].body), {
    nombre: 'Ana',
    apellido: 'Pérez',
    email: 'ana@example.com',
    dni: '12345678',
    telefono: '987654321',
    fechaNacimiento: '2000-05-12',
    rol: 'CLIENTE',
  });
});

test('edits send PUT, birth date and no password or active flag when untouched', async () => {
  await service.saveManagedUser({ ...form, id: '42', password: '' });
  const request = JSON.parse(calls[0].body);
  assert.equal(calls[0].method, 'PUT');
  assert.ok(calls[0].url.endsWith('/admin/usuarios/42'));
  assert.equal(request.fechaNacimiento, '2000-05-12');
  assert.equal('password' in request, false);
  assert.equal('activo' in request, false);
});

test('staff credentials go only to the API, and optional unique fields become null', async () => {
  await service.saveManagedUser({
    ...form,
    role: 'Recepcionista',
    password: 'Reception123',
    dni: '',
    phone: '',
    birthDate: '',
  });
  const request = JSON.parse(calls[0].body);
  assert.equal(request.rol, 'RECEPCIONISTA');
  assert.equal(request.password, 'Reception123');
  assert.equal(request.dni, null);
  assert.equal(request.telefono, null);
  assert.equal(request.fechaNacimiento, null);
  assert.equal(
    [...values.values()].some((value) => value.includes('Reception123')),
    false
  );
  await service.saveManagedUser({ ...form, role: 'Administrador', password: 'Admin1234' });
  assert.equal(JSON.parse(calls[1].body).rol, 'ADMIN');
});

test('delete accepts 204 and publishes a change only on success', async () => {
  let changes = 0;
  const listener = () => changes++;
  globalThis.window.addEventListener(service.USERS_CHANGED_EVENT, listener);
  try {
    await service.deleteManagedUser('42');
    assert.equal(calls[0].method, 'DELETE');
    assert.equal(changes, 1);
    globalThis.fetch = async () =>
      Response.json({ error: 'El usuario tiene registros asociados.' }, { status: 409 });
    await assert.rejects(service.deleteManagedUser('42'), /registros asociados/);
    assert.equal(changes, 1);
  } finally {
    globalThis.window.removeEventListener(service.USERS_CHANGED_EVENT, listener);
  }
});

test('activate and deactivate use the existing backend actions', async () => {
  await service.setUserActive('42', false);
  await service.setUserActive('42', true);
  assert.ok(calls[0].url.endsWith('/admin/usuarios/42/desactivar'));
  assert.ok(calls[1].url.endsWith('/admin/usuarios/42/activar'));
  assert.equal(calls[0].method, 'PATCH');
});

test('self actions, invalid ids, non-admins and expired sessions do not send requests', async () => {
  await assert.rejects(service.deleteManagedUser('1'), /protegida/);
  await assert.rejects(service.saveManagedUser({ ...form, id: '1' }), /protegida/);
  await assert.rejects(service.deleteManagedUser('fixed-admin'), /identificador/);
  for (const role of ['Cliente', 'Recepcionista']) {
    session.setSession(accessToken, { id: '1', role });
    await assert.rejects(service.listUsers(), /administrador/);
  }
  session.clearSession();
  await assert.rejects(service.listUsers(), /Inicia sesión/);
  assert.equal(calls.length, 0);
});

test('server validation and permission errors are preserved without publishing success', async () => {
  for (const status of [400, 401, 403, 409]) {
    globalThis.fetch = async () =>
      Response.json({ error: `Error del servidor ${status}` }, { status });
    await assert.rejects(service.saveManagedUser(form), new RegExp(`Error del servidor ${status}`));
  }
});
