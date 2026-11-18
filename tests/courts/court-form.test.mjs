import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { createServer } from 'vite';

let server, signature, Actions, validations, Days, dayHelpers;
const general = {
  name: 'Cancha Norte',
  sport: 'Fútbol 5',
  modality: 'Mixto',
  surface: 'Cemento',
  description: 'Cancha disponible',
  photos: [{ id: 'photo1', src: 'https://example.com/photo.jpg' }],
};
const features = {
  capacity: '10',
  width: '20',
  length: '40',
  coverType: 'Abierta',
  lighting: 'LED',
  services: ['wifi', 'parking'],
  amenities: [],
  pricePerHour: '80',
  promotionalPrice: '',
};
const location = {
  venue: 'Sede Norte',
  address: 'Av. Principal 123',
  reference: '',
  status: 'activa',
  horaInicio: '08:00',
  horaFin: '22:00',
};

before(async () => {
  server = await createServer({
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: 'custom',
  });
  signature = (await server.ssrLoadModule('/src/app/protected/admin/courts/form-state.ts'))
    .courtFormSignature;
  validations = await server.ssrLoadModule('/src/app/protected/admin/courts/validations.ts');
  Days = (
    await server.ssrLoadModule(
      '/src/app/protected/admin/courts/components/court-availability-days.tsx'
    )
  ).CourtAvailabilityDays;
  dayHelpers = await server.ssrLoadModule('/src/lib/court-days.ts');
  Actions = (
    await server.ssrLoadModule('/src/app/protected/admin/courts/components/court-form-actions.tsx')
  ).CourtFormActions;
});
after(async () => {
  await server?.close();
});

test('detecta cambios de cualquier paso y reconoce cuando se revierten', () => {
  const original = signature(general, features, location);
  assert.notEqual(signature({ ...general, name: 'Nuevo nombre' }, features, location), original);
  assert.notEqual(signature(general, { ...features, pricePerHour: '90' }, location), original);
  assert.notEqual(signature(general, features, { ...location, status: 'inactiva' }), original);
  assert.equal(signature({ ...general, name: 'Cancha Norte' }, features, location), original);
});

test('ignora IDs visuales y el orden de selecciones, pero detecta fotos y horarios', () => {
  const original = signature(general, features, location);
  assert.equal(
    signature(
      { ...general, photos: general.photos.map((photo) => ({ ...photo, id: 'other' })) },
      { ...features, services: ['parking', 'wifi'] },
      location
    ),
    original
  );
  assert.notEqual(signature({ ...general, photos: [] }, features, location), original);
  assert.notEqual(
    signature(general, features, {
      ...location,
      horaFin: '20:00',
    }),
    original
  );
});

function markup(overrides = {}) {
  return renderToStaticMarkup(
    createElement(Actions, {
      form: {
        step: 0,
        canSave: true,
        isEditing: true,
        hasChanges: false,
        canAdvance: true,
        isSubmitting: false,
        saveAsDraft() {},
        goBack() {},
        goNext() {},
        ...overrides,
      },
      onSave() {},
    })
  );
}

test('editar muestra Siguiente y Guardar cambios desde el primer paso', () => {
  const html = markup({ hasChanges: true });
  assert.match(html, />Siguiente<\/button>/);
  assert.match(html, /<button(?![^>]* disabled=)[^>]*>Guardar cambios<\/button>/);
});

test('Guardar cambios está deshabilitado sin cambios o mientras se guarda', () => {
  assert.match(markup(), /<button[^>]*disabled=""[^>]*>Guardar cambios<\/button>/);
  assert.match(
    markup({ hasChanges: true, isSubmitting: true }),
    /<button[^>]*disabled=""[^>]*>Subiendo imágenes y guardando\.\.\.<\/button>/
  );
});

test('al crear una cancha se mantiene el registro en el último paso', () => {
  assert.doesNotMatch(markup({ isEditing: false }), />Registrar cancha<\/button>/);
  assert.match(markup({ isEditing: false, step: 2 }), />Registrar cancha<\/button>/);
  assert.doesNotMatch(markup({ step: 2 }), />Siguiente<\/button>/);
});

test('Guardar y Registrar cancha se deshabilitan si cualquier paso contiene datos inválidos', () => {
  assert.match(
    markup({ hasChanges: true, canSave: false }),
    /<button[^>]*disabled=""[^>]*>Guardar cambios<\/button>/
  );
  assert.match(
    markup({ isEditing: false, step: 2, canSave: false }),
    /<button[^>]*disabled=""[^>]*>Registrar cancha<\/button>/
  );
  assert.match(
    markup({ hasChanges: true, canAdvance: false }),
    /<button[^>]*disabled=""[^>]*>Siguiente<\/button>/
  );
});

test('muestra siete switches etiquetados con los días seleccionados', () => {
  const html = renderToStaticMarkup(
    createElement(Days, { days: ['MONDAY', 'FRIDAY'], onChange() {} })
  );
  assert.equal((html.match(/role="switch"/g) ?? []).length, 7);
  assert.equal((html.match(/ checked=""/g) ?? []).length, 2);
  assert.match(html, /aria-label="Disponibilidad: Lunes"/);
  assert.match(html, /aria-label="Disponibilidad: Domingo"/);
});

test('seleccionar días activa cambios y revertirlos recupera el estado original', () => {
  const all = dayHelpers.normalizeCourtDays();
  const original = signature(general, features, { ...location, diasDisponibles: all });
  assert.notEqual(
    signature(general, features, { ...location, diasDisponibles: ['MONDAY'] }),
    original
  );
  assert.notEqual(signature(general, features, { ...location, diasDisponibles: [] }), original);
  assert.equal(
    signature(general, features, { ...location, diasDisponibles: [...all].reverse() }),
    original
  );
  assert.equal(dayHelpers.courtOpenOnDate(['MONDAY'], '2026-12-01'), false);
  assert.equal(dayHelpers.courtOpenOnDate(['TUESDAY'], '2026-12-01'), true);
});

test('editar el nombre no exige campos opcionales ausentes en canchas antiguas', () => {
  assert.deepEqual(
    validations.validateStepGeneral({
      ...general,
      name: 'Nombre nuevo',
      modality: '',
      surface: '',
    }),
    {}
  );
  assert.deepEqual(
    validations.validateStepFeatures({ ...features, capacity: '', coverType: '', lighting: '' }),
    {}
  );
  assert.deepEqual(
    validations.validateStepLocation({
      ...location,
      venue: '',
      address: '',
      horaInicio: '',
      horaFin: '',
    }),
    {}
  );
  assert.ok(validations.validateStepLocation({ ...location, horaFin: '07:00' }).horaFin);
});
