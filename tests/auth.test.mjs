import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { createServer } from 'vite';

let server;
let auth;
let session;
let calls;
const originalFetch = globalThis.fetch;
const values = new Map();
const token = (exp = Math.floor(Date.now() / 1000) + 3600) =>
  `header.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.signature`;
const profile = {
  id: 42,
  nombre: 'Ana',
  apellido: 'Pérez',
  email: 'ana@example.com',
  dni: '12345678',
  telefono: '987654321',
  rol: 'CLIENTE',
  activo: true,
};

before(async () => {
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  globalThis.window = new EventTarget();
  server = await createServer({
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: 'custom',
  });
  auth = await server.ssrLoadModule('/src/services/auth-service.ts');
  session = await server.ssrLoadModule('/src/services/session-service.ts');
});

beforeEach(() => {
  session.clearSession();
  values.clear();
  calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, ...options });
    return Response.json(calls.length === 1 ? { token: token(), rol: 'CLIENTE' } : profile);
  };
});

after(async () => {
  globalThis.fetch = originalFetch;
  delete globalThis.window;
  delete globalThis.localStorage;
  await server?.close();
});

test('login envía las credenciales y obtiene el ID y rol reales con Bearer', async () => {
  const result = await auth.loginUser({ email: ' ANA@example.com ', password: ' Secret123 ' });
  assert.equal(calls[0].url, 'http://localhost:8080/auth/login');
  assert.deepEqual(JSON.parse(calls[0].body), {
    email: 'ana@example.com',
    password: ' Secret123 ',
  });
  assert.equal(calls[1].headers.Authorization, `Bearer ${result.token}`);
  assert.equal(result.user.id, '42');
  assert.equal(result.user.role, 'Cliente');
  assert.equal(values.size, 0);
});

test('registro adapta los campos al DTO Java sin enviar confirmación ni términos', async () => {
  await auth.registerUser({
    firstName: ' Ana ',
    lastName: ' Pérez ',
    dni: '12345678',
    birthDate: '2000-01-02',
    phone: '987654321',
    email: ' ANA@example.com ',
    password: 'Secret123',
  });
  assert.equal(calls[0].url, 'http://localhost:8080/auth/register');
  assert.deepEqual(JSON.parse(calls[0].body), {
    nombre: 'Ana',
    apellido: 'Pérez',
    dni: '12345678',
    fechaNacimiento: '2000-01-02',
    telefono: '987654321',
    email: 'ana@example.com',
    password: 'Secret123',
  });
});

test('muestra errores de negocio del backend y nunca crea una sesión al fallar', async () => {
  globalThis.fetch = async () =>
    Response.json({ error: 'El email ya está registrado' }, { status: 400 });
  await assert.rejects(
    auth.loginUser({ email: 'ana@example.com', password: 'invalid' }),
    /El email ya está registrado/
  );
  assert.equal(session.getCurrentSession(), null);
});

test('un perfil rechazado impide completar el login', async () => {
  globalThis.fetch = async () => {
    calls.push(true);
    return calls.length === 1
      ? Response.json({ token: token(), rol: 'ADMIN' })
      : new Response(null, { status: 401 });
  };
  await assert.rejects(
    auth.loginUser({ email: 'ana@example.com', password: 'invalid' }),
    /sesión no es válida/
  );
  assert.equal(session.getCurrentSession(), null);
});

test('un fallo de conexión tiene un mensaje comprensible', async () => {
  globalThis.fetch = async () => {
    throw new TypeError('Failed to fetch');
  };
  await assert.rejects(
    auth.loginUser({ email: 'ana@example.com', password: 'invalid' }),
    /conectar con el servidor/
  );
});

test('sesión en memoria: ignora datos locales y descarta JWT inválidos o expirados', () => {
  const user = {
    id: '42',
    email: 'ana@example.com',
    firstName: 'Ana',
    lastName: 'Pérez',
    role: 'Cliente',
  };
  values.set('kanchaya.session', JSON.stringify({ token: 'local-token', user }));
  assert.equal(session.getCurrentSession(), null);
  session.setSession(token(), user);
  assert.deepEqual(session.getCurrentUser(), user);
  assert.equal(values.has('kanchaya.api-session'), false);
  session.setSession(token(1), user);
  assert.equal(session.getCurrentSession(), null);
  session.setSession('invalid', user);
  assert.equal(session.getCurrentSession(), null);
  session.clearSession();
  assert.equal(values.has('kanchaya.api-session'), false);
});

test('restaura la sesión desde el backend con cookie y consulta el perfil con Bearer', async () => {
  const result = await auth.restoreAuthenticatedSession();
  assert.equal(calls[0].url, 'http://localhost:8080/auth/session');
  assert.equal(calls[0].credentials, 'include');
  assert.equal(calls[1].credentials, 'omit');
  assert.equal(calls[1].headers.Authorization, `Bearer ${result.token}`);
  assert.equal(result.user.id, '42');
});

test('una cookie rechazada devuelve una sesión vacía y no inventa datos locales', async () => {
  globalThis.fetch = async () => new Response(null, { status: 401 });
  assert.equal(await auth.restoreAuthenticatedSession(), null);
});

test('logout pide al backend eliminar la cookie', async () => {
  await auth.endAuthenticatedSession();
  assert.equal(calls[0].url, 'http://localhost:8080/auth/logout');
  assert.equal(calls[0].method, 'POST');
  assert.equal(calls[0].credentials, 'include');
});
