import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let server, common, auth, users, booking, slots, FormField, Input, Login, Register;
const identity = {
  firstName: 'Ana',
  lastName: 'Pérez',
  email: 'ana@example.com',
  dni: '12345678',
  phone: '987654321',
  birthDate: '2000-05-12',
};
const registration = {
  ...identity,
  password: 'Secret123',
  confirmPassword: 'Secret123',
  acceptTerms: true,
};
const managed = { ...identity, role: 'Cliente', password: '' };
const original = { ...identity, id: '2', role: 'Cliente' };
const schedule = { date: '2027-01-05', startTime: '12:00', endTime: '14:00' };
const now = Date.parse('2027-01-04T10:00:00-05:00');

before(async () => {
  server = await createServer({
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: 'custom',
  });
  common = await server.ssrLoadModule('/src/lib/validation.ts');
  auth = await server.ssrLoadModule('/src/app/auth/validations.ts');
  users = await server.ssrLoadModule('/src/app/protected/admin/users/validations.ts');
  booking = await server.ssrLoadModule('/src/app/protected/recepcionist/validations.ts');
  slots = await server.ssrLoadModule('/src/app/protected/client/courts/validations.ts');
  FormField = (await server.ssrLoadModule('/src/components/ui/form-field.tsx')).FormField;
  Input = (await server.ssrLoadModule('/src/components/ui/input.tsx')).Input;
  Login = (await server.ssrLoadModule('/src/app/auth/login/page.tsx')).default;
  Register = (await server.ssrLoadModule('/src/app/auth/register/page.tsx')).default;
});
after(async () => {
  await server?.close();
});

test('identidad: rechaza datos incompletos, DNI/teléfono inválidos y cumpleaños futuros o inexistentes', () => {
  assert.deepEqual(
    common.validateIdentity(identity, {
      requireDni: true,
      requirePhone: true,
      requireBirthDate: true,
    }),
    {}
  );
  const errors = common.validateIdentity(
    {
      firstName: '123',
      lastName: ' ',
      email: 'correo',
      dni: '123',
      phone: 'abcdefghi',
      birthDate: '2999-01-01',
    },
    { requireDni: true, requirePhone: true, requireBirthDate: true }
  );
  for (const field of ['firstName', 'lastName', 'email', 'dni', 'phone', 'birthDate'])
    assert.ok(errors[field]);
  assert.ok(common.validateIdentity({ ...identity, birthDate: '2001-02-29' }).birthDate);
  assert.equal(common.isValidDate('2000-02-29'), true);
  assert.equal(common.isValidDate('2027-02-30'), false);
});

test('login acepta contraseñas existentes sin imponer la política de altas y rechaza credenciales vacías', () => {
  assert.deepEqual(auth.validateLoginForm({ email: identity.email, password: '12345678' }), {});
  assert.ok(auth.validateLoginForm({ email: 'inválido', password: ' ' }).email);
  assert.ok(auth.validateLoginForm({ email: identity.email, password: '' }).password);
});

test('registro exige contraseña segura, confirmación y aceptación de términos', () => {
  assert.deepEqual(auth.validateRegisterForm(registration), {});
  const errors = auth.validateRegisterForm({
    ...registration,
    password: 'abc',
    confirmPassword: 'xyz',
    acceptTerms: false,
  });
  for (const field of ['password', 'confirmPassword', 'acceptTerms']) assert.ok(errors[field]);
  assert.ok(common.passwordError('Ab1' + 'é'.repeat(36)));
  assert.equal(common.passwordError(''), 'La contraseña es obligatoria.');
  assert.equal(common.passwordError('', false), undefined);
});

test('usuarios: detecta cambios reales, permite conservar la contraseña y exige credenciales al cambiar a personal', () => {
  assert.deepEqual(users.validateManagedUser(managed, original), {});
  assert.equal(users.managedUserChanged(managed, original), false);
  assert.equal(
    users.managedUserChanged(
      { ...managed, firstName: ' Ana ', email: 'ANA@example.com' },
      original
    ),
    false
  );
  assert.equal(users.managedUserChanged({ ...managed, phone: '987654322' }, original), true);
  assert.ok(users.validateManagedUser({ ...managed, role: 'Administrador' }, original).password);
  const staff = { ...original, role: 'Administrador' };
  assert.deepEqual(users.validateManagedUser({ ...managed, role: 'Administrador' }, staff), {});
  assert.ok(users.validateManagedUser({ ...managed, dni: '87654321' }, original).dni);
});

test('horarios: rechaza fechas pasadas, rangos invertidos y horarios vacíos, y distingue cambios', () => {
  assert.deepEqual(common.validateSchedule(schedule, now), {});
  assert.ok(common.validateSchedule({ ...schedule, startTime: '15:00' }, now).endTime);
  assert.ok(common.validateSchedule({ ...schedule, date: '2026-01-01' }, now).startTime);
  assert.ok(common.validateSchedule({ ...schedule, startTime: '' }, now).startTime);
  assert.ok(common.validateSchedule({ ...schedule, date: '2027-02-30' }, now).date);
  assert.equal(common.scheduleChanged(schedule, { ...schedule }), false);
  assert.equal(common.scheduleChanged({ ...schedule, endTime: '15:00' }, schedule), true);
});

test('recepción: bloquea días cerrados y horas fuera del rango de la cancha', () => {
  const court = {
    location: {
      status: 'activa',
      horaInicio: '08:00',
      horaFin: '22:00',
      diasDisponibles: ['TUESDAY'],
    },
    features: { pricePerHour: '80' },
  };
  const form = {
    cliente: '',
    courtId: 'court-7',
    fecha: schedule.date,
    horaInicio: schedule.startTime,
    horaFin: schedule.endTime,
    paymentMethod: 'EFECTIVO',
    observaciones: '',
  };
  assert.deepEqual(booking.validateReceptionBooking(form, court, now), {});
  assert.ok(booking.validateReceptionBooking({ ...form, fecha: '2027-01-06' }, court, now).fecha);
  assert.ok(booking.validateReceptionBooking({ ...form, horaFin: '23:00' }, court, now).horaFin);
  assert.ok(booking.validateReceptionBooking(form, undefined, now).courtId);
  assert.ok(
    booking.validateReceptionBooking({ ...form, paymentMethod: 'OTRO' }, court, now).paymentMethod
  );
});

test('cliente: bloquea selección vacía, intervalos no consecutivos y disponibilidad o tarifa desactualizada', () => {
  const a = { id: 'a', startTime: '12:00', endTime: '13:00', price: 80, available: true };
  const b = { id: 'b', startTime: '13:00', endTime: '14:00', price: 80, available: true };
  assert.equal(slots.validateSlotSelection(schedule.date, [b, a], [a, b], now), null);
  assert.ok(slots.validateSlotSelection(schedule.date, [], [a], now));
  assert.ok(
    slots.validateSlotSelection(
      schedule.date,
      [a, { ...b, startTime: '14:00', endTime: '15:00' }],
      [a, b],
      now
    )
  );
  assert.ok(slots.validateSlotSelection(schedule.date, [a], [{ ...a, available: false }], now));
  assert.ok(slots.validateSlotSelection(schedule.date, [a], [{ ...a, price: 90 }], now));
});

test('los errores están enlazados al campo y no duplican las descripciones accesibles', () => {
  const html = renderToStaticMarkup(
    createElement(
      FormField,
      { id: 'email', label: 'Correo', error: 'Correo inválido.' },
      createElement(Input, { id: 'email', 'aria-describedby': 'help email-error' })
    )
  );
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-describedby="help email-error"/);
  assert.match(html, /id="email-error" role="alert"/);
  assert.match(html, /border-destructive/);
});

test('login y registro comienzan con los botones de envío deshabilitados', () => {
  for (const Component of [Login, Register]) {
    const html = renderToStaticMarkup(
      createElement(Component, { onLoginSuccess: async () => ({}) })
    );
    const submit = [...html.matchAll(/<button\b[^>]*>/g)].find((match) =>
      match[0].includes('type="submit"')
    );
    assert.ok(submit);
    assert.match(submit[0], /disabled/);
  }
});
