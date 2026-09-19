const date = new Date()
const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export const reservations = [
  { id: 1, cliente: 'María Torres', cancha: 'Cancha 1 · Fútbol 7', fecha: today, horaInicio: '09:00', horaFin: '10:00', estado: 'CONFIRMADA', monto: 90 },
  { id: 2, cliente: 'Carlos Mendoza', cancha: 'Cancha 2 · Fútbol 5', fecha: today, horaInicio: '11:00', horaFin: '12:00', estado: 'PENDIENTE', monto: 70 },
  { id: 3, cliente: 'Lucía Ramos', cancha: 'Cancha 1 · Fútbol 7', fecha: today, horaInicio: '13:00', horaFin: '14:00', estado: 'CONFIRMADA', monto: 90 },
  { id: 4, cliente: 'Jorge Salazar', cancha: 'Cancha 3 · Vóley', fecha: today, horaInicio: '07:00', horaFin: '08:00', estado: 'FINALIZADA', monto: 60 },
  { id: 5, cliente: 'Ana Paredes', cancha: 'Cancha 2 · Fútbol 5', fecha: today, horaInicio: '08:00', horaFin: '09:00', estado: 'EN_CURSO', monto: 70 },
  { id: 6, cliente: 'Diego Flores', cancha: 'Cancha 3 · Vóley', fecha: today, horaInicio: '06:00', horaFin: '07:00', estado: 'NO_ASISTIO', monto: 60 },
]
