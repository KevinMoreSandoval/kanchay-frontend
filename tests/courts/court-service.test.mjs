import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { createServer } from 'vite';

let server, service, session, mappers, calls;
const originalFetch = globalThis.fetch;
const values = new Map();
const response = {
  id: 42,
  nombre: 'Cancha Norte',
  descripcion: 'Descripción',
  tipo: 'Fútbol 5',
  precioPorHora: 80,
  disponible: true,
  imagenUrl: 'https://example.com/photo.jpg',
  capacidad: 10,
  location: 'Sede Norte',
  lighting: 'LED',
  covered: 'Abierta',
  size: '20 x 40',
  bathrooms: '2',
  rules: ['Sin mascotas'],
  state: 'activa',
  horario: {
    horaInicio: '08:00',
    horaFin: '22:00',
    diasDisponibles: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
  },
  details: {
    modality: 'Mixto',
    surface: 'Cemento',
    address: 'Av. Principal 123',
    reference: 'Puerta 2',
    width: 20,
    length: 40,
    promotionalPrice: 60,
    images: ['https://example.com/photo.jpg'],
    services: ['wifi'],
    amenities: ['parking'],
  },
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
  service = await server.ssrLoadModule('/src/services/courts/court-service.ts');
  session = await server.ssrLoadModule('/src/services/session-service.ts');
  mappers = await server.ssrLoadModule('/src/services/courts/mappers.ts');
});

beforeEach(() => {
  calls = [];
  values.clear();
  const token = `header.${Buffer.from(JSON.stringify({ exp: Date.now() / 1000 + 3600 })).toString('base64url')}.signature`;
  session.setSession(token, { id: '1', role: 'Administrador' });
  globalThis.fetch = async (url, options) => {
    calls.push({ url, ...options });
    return options.method === 'DELETE'
      ? new Response(null, { status: 204 })
      : Response.json(
          options.method === 'GET' && !/\/canchas\/\d+$/.test(url) ? [response] : response
        );
  };
});

after(async () => {
  globalThis.fetch = originalFetch;
  delete globalThis.localStorage;
  delete globalThis.window;
  await server?.close();
});

test('catálogo disponible se consulta al backend y adapta tarifa promocional y horarios', async () => {
  const courts = await service.listCourts(true);
  assert.equal(calls[0].url, 'http://localhost:8080/canchas/disponibles');
  assert.equal(courts[0].id, 42);
  assert.equal(courts[0].price, 60);
  assert.equal(courts[0].horario.horaInicio, '08:00');
  assert.equal(courts[0].address, 'Av. Principal 123');
});

test('crear usa POST con Bearer y conserva todos los datos del formulario', async () => {
  const draft = mappers.toCourtDraft(response);
  delete draft.backendId;
  const saved = await service.saveCourt(draft);
  assert.equal(calls[0].method, 'POST');
  assert.equal(calls[0].url, 'http://localhost:8080/canchas');
  assert.match(calls[0].headers.Authorization, /^Bearer /);
  assert.deepEqual(JSON.parse(calls[0].body).details, response.details);
  assert.equal(saved.backendId, 42);
});

test('editar usa PUT y el ID real sin crear otra cancha', async () => {
  await service.saveCourt(mappers.toCourtDraft(response));
  assert.equal(calls[0].method, 'PUT');
  assert.equal(calls[0].url, 'http://localhost:8080/canchas/42');
  assert.equal(calls.length, 2);
  assert.equal(calls[1].method, 'GET');
});

test('eliminar acepta 204 y retira la cancha de la caché', async () => {
  await service.listCourts();
  await service.deleteCourt(42);
  assert.equal(calls[1].method, 'DELETE');
  assert.equal(
    service.getManagedCourts().some((court) => court.backendId === 42),
    false
  );
});

test('si el servidor rechaza eliminar, conserva la cancha y muestra el error', async () => {
  await service.listCourts();
  globalThis.fetch = async () =>
    Response.json({ error: 'La cancha tiene reservas asociadas.' }, { status: 409 });
  await assert.rejects(service.deleteCourt(42), /reservas asociadas/);
  assert.equal(
    service.getManagedCourts().some((court) => court.backendId === 42),
    true
  );
});

test('sin sesión no envía escrituras al backend', async () => {
  session.clearSession();
  await assert.rejects(service.saveCourt(mappers.toCourtDraft(response)), /Inicia sesión/);
  assert.equal(calls.length, 0);
});

test('recepción y cliente no pueden gestionar canchas desde el servicio frontend', async () => {
  for (const role of ['Recepcionista', 'Cliente']) {
    const token = `header.${Buffer.from(JSON.stringify({ exp: Date.now() / 1000 + 3600 })).toString('base64url')}.signature`;
    session.setSession(token, { id: '2', role });
    await assert.rejects(
      service.saveCourt(mappers.toCourtDraft(response)),
      /Solo el administrador/
    );
    await assert.rejects(service.deleteCourt(42), /Solo el administrador/);
  }
  assert.equal(calls.length, 0);
});

test('un fallo de listado no presenta datos locales como respuesta del servidor', async () => {
  globalThis.fetch = async () => {
    throw new Error('offline');
  };
  await assert.rejects(service.listCourts(), /conectar con el servidor/);
});

test('las canchas antiguas sin detalles no inventan horarios', () => {
  const court = mappers.toCourt({ ...response, details: null, horario: null });
  assert.equal(court.horario, null);
  assert.equal(court.price, 80);
  assert.equal(court.management.backendId, 42);
});

test('un rechazo por permisos no se presenta como sesión inválida', async () => {
  globalThis.fetch = async () => new Response(null, { status: 403 });
  await assert.rejects(service.saveCourt(mappers.toCourtDraft(response)), /No tienes permisos/);
});

test('un token rechazado se presenta como sesión inválida y conserva el formulario', async () => {
  const draft = mappers.toCourtDraft(response);
  globalThis.fetch = async () => new Response(null, { status: 401 });
  await assert.rejects(service.saveCourt(draft), /sesión no es válida/);
  assert.equal(draft.general.name, response.nombre);
});

test('sube portada y galería como archivos y guarda únicamente sus URLs', async () => {
  const draft = mappers.toCourtDraft(response);
  delete draft.backendId;
  draft.general.photos = [
    { id: 'new-one', src: 'data:image/png;base64,iVBORw0KGgo=' },
    { id: 'new-two', src: 'data:image/png;base64,iVBORw0KGgo=' },
  ];
  const urls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, ...options });
    if (options.body instanceof FormData) {
      const imageUrl = `https://res.cloudinary.com/demo/image/upload/photo-${urls.length}.png`;
      urls.push(imageUrl);
      return Response.json({ url: imageUrl });
    }
    const payload = JSON.parse(options.body);
    return Response.json({ ...payload, id: 99 });
  };
  const saved = await service.saveCourt(draft);
  assert.equal(calls.length, 3);
  assert.equal(calls[0].url, 'http://localhost:8080/canchas/imagenes');
  assert.equal(calls[0].headers['Content-Type'], undefined);
  assert.match(calls[0].headers.Authorization, /^Bearer /);
  assert.equal(calls[0].body.get('file').type, 'image/png');
  assert.equal(calls[0].body.get('file').size, 8);
  const payload = JSON.parse(calls[2].body);
  assert.equal(payload.imagenUrl, urls[0]);
  assert.deepEqual(payload.details.images, urls);
  assert.equal(calls[2].body.includes('data:image'), false);
  assert.deepEqual(
    saved.general.photos.map((photo) => photo.src),
    urls
  );
});

test('si Cloudinary falla no crea la cancha ni pierde las fotos del formulario', async () => {
  const draft = mappers.toCourtDraft(response);
  delete draft.backendId;
  draft.general.photos = [{ id: 'failed-upload', src: 'data:image/png;base64,iVBORw0KGgo=' }];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, ...options });
    return Response.json({ error: 'No se pudo subir la imagen a Cloudinary.' }, { status: 502 });
  };
  await assert.rejects(service.saveCourt(draft), /Cloudinary/);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.endsWith('/imagenes'), true);
  assert.equal(draft.general.photos[0].src.startsWith('data:'), true);
  assert.equal(draft.backendId, undefined);
});

test('al reintentar no vuelve a subir las imágenes que ya llegaron a Cloudinary', async () => {
  const draft = mappers.toCourtDraft(response);
  draft.general.photos = [
    { id: 'retry-first', src: 'data:image/png;base64,iVBORw0KGgo=' },
    { id: 'retry-second', src: 'data:image/png;base64,iVBORw0KGgo=' },
  ];
  let uploads = 0;
  let persisted;
  globalThis.fetch = async (url, options) => {
    calls.push({ url, ...options });
    if (options.body instanceof FormData) {
      uploads++;
      return uploads === 2
        ? Response.json({ error: 'Subida fallida' }, { status: 502 })
        : Response.json({
            url: `https://res.cloudinary.com/demo/image/upload/retry-${uploads}.png`,
          });
    }
    if (options.method === 'GET') return Response.json(persisted);
    persisted = { ...JSON.parse(options.body), id: 42 };
    return Response.json(persisted);
  };
  await assert.rejects(service.saveCourt(draft), /Subida fallida/);
  const saved = await service.saveCourt(draft);
  assert.equal(uploads, 3);
  assert.deepEqual(
    saved.general.photos.map((photo) => photo.src),
    [
      'https://res.cloudinary.com/demo/image/upload/retry-1.png',
      'https://res.cloudinary.com/demo/image/upload/retry-3.png',
    ]
  );
  assert.equal(calls.filter((call) => call.method === 'PUT').length, 1);
});

test('editar nombre envía nombre y conserva los campos del modelo al releer', async () => {
  const draft = mappers.toCourtDraft(response);
  draft.general.name = 'Cancha Renombrada';
  let persisted = response;
  globalThis.fetch = async (url, options) => {
    calls.push({ url, ...options });
    if (options.method === 'PUT') persisted = { ...JSON.parse(options.body), id: 42 };
    return Response.json(persisted);
  };
  const saved = await service.saveCourt(draft);
  assert.equal(saved.general.name, 'Cancha Renombrada');
  const payload = JSON.parse(calls[0].body);
  assert.equal(payload.nombre, 'Cancha Renombrada');
  assert.equal(payload.bathrooms, '2');
  assert.deepEqual(payload.rules, ['Sin mascotas']);
  assert.deepEqual(payload.horario, response.horario);
  assert.equal('schedule' in payload.details, false);
});

test('no confirma el guardado si al releer el servidor conserva el nombre anterior', async () => {
  const draft = mappers.toCourtDraft(response);
  draft.general.name = 'Nombre pendiente';
  await assert.rejects(service.saveCourt(draft), /no confirmó el nombre/);
  assert.equal(draft.general.name, 'Nombre pendiente');
});

test('consulta intervalos JSON al backend para la cancha y fecha', async () => {
  const slots = [
    { id: '42-2026-12-01-08:00', startTime: '08:00', endTime: '09:00', price: 60, available: true },
  ];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, ...options });
    return Response.json(slots);
  };
  assert.deepEqual(await service.getCourtSlots(42, '2026-12-01'), slots);
  assert.equal(calls[0].url, 'http://localhost:8080/canchas/42/slots?date=2026-12-01');
});

test('los días elegidos se envían y se restauran al releer la cancha', async () => {
  const draft = mappers.toCourtDraft(response);
  draft.location.diasDisponibles = ['MONDAY', 'FRIDAY'];
  let persisted = response;
  globalThis.fetch = async (url, options) => {
    calls.push({ url, ...options });
    if (options.method === 'PUT') persisted = { ...JSON.parse(options.body), id: 42 };
    return Response.json(persisted);
  };
  const saved = await service.saveCourt(draft);
  assert.deepEqual(saved.location.diasDisponibles, ['MONDAY', 'FRIDAY']);
  assert.deepEqual(JSON.parse(calls[0].body).horario.diasDisponibles, ['MONDAY', 'FRIDAY']);
});

test('no confirma días seleccionados si un servidor anterior los ignora', async () => {
  const draft = mappers.toCourtDraft(response);
  draft.location.diasDisponibles = ['MONDAY'];
  await assert.rejects(service.saveCourt(draft), /no confirmó los días/);
  assert.deepEqual(draft.location.diasDisponibles, ['MONDAY']);
});
