import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let server, service, Toast;
before(async () => {
  server = await createServer({
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: 'custom',
  });
  service = await server.ssrLoadModule('/src/services/toast-service.ts');
  Toast = (await server.ssrLoadModule('/src/components/ui/toast.tsx')).Toast;
});
after(async () => {
  service?.toast.clear();
  await server?.close();
});

test('publica variantes y mantiene estable el snapshot hasta que cambia la cola', () => {
  const store = service.createToastStore();
  const before = store.getSnapshot();
  assert.equal(store.success('  '), '');
  assert.equal(store.getSnapshot(), before);
  const id = store.success('Cancha guardada', { duration: 0 });
  assert.equal(store.getSnapshot()[0].id, id);
  assert.equal(store.getSnapshot()[0].variant, 'success');
  assert.equal(store.getSnapshot(), store.getSnapshot());
  assert.notEqual(store.getSnapshot(), before);
  store.clear();
});

test('cierra automáticamente, admite cierre manual y duración persistente', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
  const store = service.createToastStore();
  t.after(() => store.clear());
  store.info('Información', { duration: 1000 });
  t.mock.timers.tick(999);
  assert.equal(store.getSnapshot().length, 1);
  t.mock.timers.tick(1);
  assert.equal(store.getSnapshot().length, 0);
  const id = store.error('Error importante', { duration: 0 });
  t.mock.timers.tick(20_000);
  assert.equal(store.getSnapshot().length, 1);
  store.dismiss(id);
  assert.equal(store.getSnapshot().length, 0);
});

test('pausa el cierre al pasar el puntero o enfocar y espera a liberar ambos', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
  const store = service.createToastStore();
  t.after(() => store.clear());
  const id = store.warning('Revisa el horario', { duration: 1000 });
  t.mock.timers.tick(300);
  store.pause(id, 'pointer');
  store.pause(id, 'focus');
  t.mock.timers.tick(5000);
  store.resume(id, 'pointer');
  t.mock.timers.tick(5000);
  assert.equal(store.getSnapshot().length, 1);
  store.resume(id, 'focus');
  t.mock.timers.tick(699);
  assert.equal(store.getSnapshot().length, 1);
  t.mock.timers.tick(1);
  assert.equal(store.getSnapshot().length, 0);
});

test('un mensaje repetido actualiza su duración sin duplicarse', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
  const store = service.createToastStore();
  t.after(() => store.clear());
  const id = store.error('No tienes permisos', { duration: 1000 });
  t.mock.timers.tick(800);
  assert.equal(store.error('No tienes permisos', { duration: 1000 }), id);
  assert.equal(store.getSnapshot().length, 1);
  t.mock.timers.tick(999);
  assert.equal(store.getSnapshot().length, 1);
  t.mock.timers.tick(1);
  assert.equal(store.getSnapshot().length, 0);
});

test('limita a cuatro notificaciones y permite cancelar la suscripción', () => {
  const store = service.createToastStore();
  let calls = 0;
  const unsubscribe = store.subscribe(() => calls++);
  for (let index = 1; index <= 5; index++) store.info(`Mensaje ${index}`, { duration: 0 });
  assert.deepEqual(
    store.getSnapshot().map((item) => item.message),
    ['Mensaje 2', 'Mensaje 3', 'Mensaje 4', 'Mensaje 5']
  );
  assert.ok(calls >= 5);
  unsubscribe();
  const before = calls;
  store.clear();
  assert.equal(calls, before);
});

test('notifyToast conserva el estado original y no notifica al limpiar un mensaje', () => {
  service.toast.clear();
  assert.equal(service.notifyToast('Error de guardado', 'error'), 'Error de guardado');
  assert.equal(service.toast.getSnapshot().length, 1);
  assert.equal(service.notifyToast('', 'error'), '');
  assert.equal(service.notifyToast(null, 'info'), null);
  assert.equal(service.toast.getSnapshot().length, 1);
  service.toast.clear();
});

test('el componente anuncia errores y ofrece un botón accesible para cerrar', () => {
  const html = renderToStaticMarkup(
    createElement(Toast, {
      notification: { id: 'test', message: 'No se pudo guardar', variant: 'error', duration: 0 },
      onDismiss() {},
    })
  );
  assert.match(html, /role="alert"/);
  assert.match(html, /aria-atomic="true"/);
  assert.match(html, /aria-label="Cerrar notificación"/);
  assert.match(html, /No se pudo guardar/);
  assert.match(html, /aria-hidden="true"/);
});
