import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let server, contact, Card, Summary, WhatsAppButton;
const originalFetch = globalThis.fetch;
const reservation = {
  id: 42,
  cancha: 'Cancha Norte & Sur',
  cliente: 'Ana Pérez',
  fecha: '2027-01-05',
  horaInicio: '12:00',
  horaFin: '13:00',
  estado: 'PENDIENTE',
  monto: 80,
};

before(async () => {
  server = await createServer({
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: 'custom',
  });
  contact = await server.ssrLoadModule('/src/app/protected/client/contact.ts');
  Card = (
    await server.ssrLoadModule(
      '/src/app/protected/client/components/reservation-payment-contact.tsx'
    )
  ).ReservationPaymentContact;
  Summary = (
    await server.ssrLoadModule('/src/app/protected/client/components/reservation-summary-step.tsx')
  ).ReservationSummaryStep;
  WhatsAppButton = (
    await server.ssrLoadModule(
      '/src/app/protected/client/components/whatsapp-reservation-button.tsx'
    )
  ).WhatsAppReservationButton;
  globalThis.fetch = () => assert.fail('El contacto fijo no debe consultar el backend');
});
after(async () => {
  globalThis.fetch = originalFetch;
  await server?.close();
});

test('el contacto fijo del frontend incluye datos de la reserva en WhatsApp', () => {
  const url = new URL(contact.getPaymentWhatsAppUrl(reservation));
  assert.equal(url.origin + url.pathname, 'https://wa.me/51917397169');
  assert.match(url.searchParams.get('text'), /reserva #42/);
  assert.match(url.searchParams.get('text'), /Cancha Norte & Sur/);
  const html = renderToStaticMarkup(createElement(Card, { reservation }));
  assert.match(html, /tel:\+51917397169/);
  assert.match(html, />917397169</);
  assert.match(html, /seguirá pendiente/);
});

test('la sección de pago aparece inmediatamente solo en la reserva pendiente', () => {
  const props = { reservation, onGoHome() {}, onGoMyReservations() {} };
  const pending = renderToStaticMarkup(createElement(Summary, props));
  assert.match(pending, /Coordinación del pago con recepción/);
  assert.match(pending, /917397169/);
  assert.doesNotMatch(pending, /Cargando teléfono/);
  const confirmed = renderToStaticMarkup(
    createElement(Summary, { ...props, reservation: { ...reservation, estado: 'CONFIRMADA' } })
  );
  assert.doesNotMatch(confirmed, /Coordinación del pago con recepción/);
});

test('el botón flotante abre el número fijo y cambia el mensaje con hover o foco', () => {
  const html = renderToStaticMarkup(createElement(WhatsAppButton));
  assert.match(html, /https:\/\/wa.me\/51917397169/);
  assert.match(html, /Confirma tu reserva/);
  assert.match(html, /Haz clic/);
  assert.match(html, /group-hover:hidden group-focus-visible:hidden/);
  assert.match(html, /group-hover:inline group-focus-visible:inline/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
  const message = new URL(contact.getPaymentWhatsAppUrl()).searchParams.get('text');
  assert.match(message, /coordinar el pago y confirmar mi reserva/);
  assert.doesNotMatch(message, /undefined/);
});
