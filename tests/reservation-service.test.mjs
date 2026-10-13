import test from 'node:test';
import console from 'node:console';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createContext, runInContext } from 'node:vm';
import ts from 'typescript';

function environment() {
  let now = new Date('2030-01-07T08:00:00').getTime();
  const values = new Map();
  class Clock extends Date {
    constructor(...args) {
      super(...(args.length ? args : [now]));
    }
    static now() {
      return now;
    }
  }
  const context = createContext({
    Date: Clock,
    console,
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
  });
  const cache = new Map();
  function load(filename) {
    const path = resolve(filename);
    if (cache.has(path)) return cache.get(path).exports;
    const module = { exports: {} };
    cache.set(path, module);
    const source = ts.transpileModule(readFileSync(path, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const requireLocal = (id) =>
      load(`${id.startsWith('@/') ? resolve('src', id.slice(2)) : resolve(dirname(path), id)}.ts`);
    runInContext(`(function(require, module, exports) { ${source}\n})`, context)(
      requireLocal,
      module,
      module.exports
    );
    return module.exports;
  }
  const data = load('src/services/local-data-service.ts');
  const courts = load('src/services/court-draft-service.ts');
  const service = load('src/services/reservation-service.ts');
  courts.saveManagedCourt({
    id: 'court-100',
    general: { name: 'Cancha de prueba aislada', sport: 'Fútbol 5', photos: [] },
    features: { pricePerHour: '80', promotionalPrice: '', capacity: '10' },
    location: {
      status: 'activa',
      venue: 'Prueba',
      schedule: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(
        (day) => ({ id: day, day, isOpen: true, opens: '09:00', closes: '22:00' })
      ),
    },
  });
  const create = (overrides = {}) =>
    service.createReservation({
      clienteId: 'client-test',
      cliente: 'Cliente de prueba',
      courtId: 100,
      cancha: 'Ignorado',
      fecha: '2030-01-07',
      horaInicio: '12:00',
      horaFin: '13:30',
      monto: 1,
      paymentMethod: 'EFECTIVO',
      ...overrides,
    })[0];
  return {
    data,
    service,
    create,
    setTime: (time) => {
      now = new Date(time).getTime();
    },
    values,
  };
}

test('creación calcula tarifa, establece el contrato y rechaza duplicados', () => {
  const e = environment();
  const row = e.create();
  assert.equal(row.monto, 120);
  assert.equal(row.estado, 'PENDIENTE');
  assert.equal(row.paymentStatus, 'PENDIENTE');
  assert.ok(row.createdAt);
  assert.equal(row.clienteId, 'client-test');
  assert.throws(() => e.create(), /cruza/);
  assert.equal(e.data.getReservations().length, 1);
});

test('disponibilidad rechaza pasado, horas inválidas y horario fuera de atención', () => {
  const e = environment();
  assert.throws(() => e.create({ horaInicio: '07:00', horaFin: '08:00' }), /futuro/);
  assert.throws(() => e.create({ horaInicio: '08:30', horaFin: '10:00' }), /atención/);
  assert.throws(() => e.create({ horaInicio: '12:70' }), /válidas/);
  assert.throws(() => e.create({ fecha: '2030-02-30' }), /no existe/);
  assert.throws(() => e.create({ paymentMethod: 'INVALIDO' }), /pago/);
});

test('confirmación vence después de 15 minutos y cambia automáticamente a cancelada', () => {
  const e = environment();
  const row = e.create();
  e.setTime('2030-01-07T08:15:00');
  assert.equal(e.service.confirmReservation(row.id)[0].estado, 'CONFIRMADA');
  const expired = environment();
  expired.create();
  expired.setTime('2030-01-07T08:15:01');
  assert.equal(expired.data.getReservations()[0].estado, 'CANCELADA');
  assert.throws(() => expired.service.confirmReservation(1), /pendientes/);
});

test('asistencia solo desde 15 minutos antes y finaliza exactamente a la hora de fin', () => {
  const e = environment();
  e.create();
  e.service.confirmReservation(1);
  e.setTime('2030-01-07T11:44:59');
  assert.throws(() => e.service.markReservationAttendance(1), /15 minutos/);
  assert.equal(e.service.getReservationPermissions(e.data.getReservations()[0]).attendance, false);
  e.setTime('2030-01-07T11:45:00');
  assert.equal(e.service.markReservationAttendance(1)[0].estado, 'EN_CURSO');
  e.setTime('2030-01-07T13:30:00');
  assert.equal(e.data.getReservations()[0].estado, 'FINALIZADA');
  const absent = environment();
  absent.create();
  absent.service.confirmReservation(1);
  absent.setTime('2030-01-07T13:30:00');
  assert.equal(absent.data.getReservations()[0].estado, 'NO_ASISTIO');
  assert.throws(() => absent.service.markReservationAttendance(1), /confirmada/);
});

test('cancelación respeta 2 horas, conserva método y requiere reembolso posterior', () => {
  const e = environment();
  e.create();
  e.service.confirmReservation(1);
  e.service.updateReservationPaymentStatus(1, 'PAGADO', 'YAPE_PLIN');
  e.setTime('2030-01-07T10:00:00');
  const row = e.service.cancelReservation(1)[0];
  assert.equal(row.paymentStatus, 'POR_REEMBOLSAR');
  assert.equal(row.paymentMethod, 'YAPE_PLIN');
  assert.equal(
    e.service.updateReservationPaymentStatus(1, 'REEMBOLSADO')[0].paymentStatus,
    'REEMBOLSADO'
  );
  assert.throws(() => e.service.updateReservationPaymentStatus(1, 'PAGADO'), /permitida/);
  const late = environment();
  late.create();
  late.service.confirmReservation(1);
  late.setTime('2030-01-07T10:00:01');
  assert.throws(() => late.service.cancelReservation(1), /2 horas/);
});

test('reprogramaciones conservan historial y cobran cada recargo sin alterar pago base', () => {
  const e = environment();
  e.create();
  e.service.confirmReservation(1);
  e.service.updateReservationPaymentStatus(1, 'PAGADO');
  e.service.rescheduleReservation(1, { date: '2030-01-08', startTime: '12:00', endTime: '13:30' });
  const row = e.service.rescheduleReservation(1, {
    date: '2030-01-09',
    startTime: '13:00',
    endTime: '14:30',
  })[0];
  assert.equal(row.paymentStatus, 'PAGADO');
  assert.equal(row.monto, 120);
  assert.equal(row.scheduleChanges.length, 2);
  assert.equal(row.scheduleChanges[0].previousDate, '2030-01-07');
  assert.equal(row.scheduleChanges[1].surcharge, 18);
  const paid = e.service.updateReservationSurchargePayment(1, 0)[0];
  assert.equal(paid.scheduleChanges[0].surchargePaymentStatus, 'PAGADO');
  assert.equal(paid.scheduleChanges[1].surchargePaymentStatus, 'PENDIENTE');
  assert.throws(() => e.service.updateReservationSurchargePayment(1, 0), /pagado/);
});

test('reprogramación valida superposición y no permite cambios terminales', () => {
  const e = environment();
  e.create();
  e.service.confirmReservation(1);
  e.create({ horaInicio: '14:00', horaFin: '15:00' });
  assert.throws(
    () =>
      e.service.rescheduleReservation(1, {
        date: '2030-01-07',
        startTime: '14:30',
        endTime: '15:30',
      }),
    /cruza/
  );
  assert.throws(
    () =>
      e.service.rescheduleReservation(1, {
        date: '2030-01-07',
        startTime: '21:00',
        endTime: '23:00',
      }),
    /atención/
  );
  e.service.cancelReservation(1);
  assert.throws(
    () =>
      e.service.rescheduleReservation(1, {
        date: '2030-01-08',
        startTime: '12:00',
        endTime: '13:00',
      }),
    /pendientes o confirmadas/
  );
});
