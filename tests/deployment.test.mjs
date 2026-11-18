import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let server, api;
const originalFetch = globalThis.fetch;

before(async () => {
  server = await createServer({
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: 'custom',
    define: { 'import.meta.env.PROD': 'true', 'import.meta.env.VITE_API_URL': 'undefined' },
  });
  api = await server.ssrLoadModule('/src/services/http-client.ts');
});
after(async () => {
  globalThis.fetch = originalFetch;
  await server?.close();
});

test('producción restaura la sesión por el proxy del mismo dominio con cookie', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/backend/auth/session');
    assert.equal(options.credentials, 'include');
    return Response.json({ token: 'session' });
  };
  assert.deepEqual(await api.apiRequest('/auth/session'), { token: 'session' });
});

test('el proxy conserva Bearer y multipart sin adjuntar cookies a operaciones de negocio', async () => {
  const body = new FormData();
  body.append('file', new Blob(['image'], { type: 'image/png' }), 'photo.png');
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/backend/canchas/imagenes');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.headers.Authorization, 'Bearer token');
    assert.equal(options.headers['Content-Type'], undefined);
    assert.equal(options.body, body);
    return Response.json({ url: 'https://example.com/photo.png' });
  };
  await api.apiRequest('/canchas/imagenes', { method: 'POST', token: 'token', body });
});
