import { useState } from 'react'
import { CalendarDays, CheckCircle2, CircleX, Clock3 } from 'lucide-react'
import { reservations } from './reservations'
import { KpiCard } from './components/KpiCard/KpiCard'
import { ReservationsTable } from './components/ReservationsTable/ReservationsTable'
import { Sidebar } from './components/Sidebar/Sidebar'
import { Topbar } from './components/Topbar/Topbar'
import styles from './page.module.css'

const today = new Date()
const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

export default function ReceptionDashboard() {
  const [search, setSearch] = useState('')
  const todayReservations = reservations.filter((item) => item.fecha === localDate)
  const query = search.trim().toLocaleLowerCase('es')
  const visibleReservations = todayReservations.filter((item) => `${item.cliente} ${item.cancha}`.toLocaleLowerCase('es').includes(query))
  const upcoming = visibleReservations.filter((item) => ['CONFIRMADA', 'PENDIENTE'].includes(item.estado))
  const activity = visibleReservations.filter((item) => ['EN_CURSO', 'FINALIZADA', 'NO_ASISTIO'].includes(item.estado))
  const kpis = [
    { label: 'Reservas del día', value: todayReservations.length, Icon: CalendarDays, tone: 'green' },
    { label: 'En curso', value: todayReservations.filter((item) => item.estado === 'EN_CURSO').length, Icon: Clock3, tone: 'purple' },
    { label: 'Finalizadas', value: todayReservations.filter((item) => item.estado === 'FINALIZADA').length, Icon: CheckCircle2, tone: 'blue' },
    { label: 'No asistieron', value: todayReservations.filter((item) => item.estado === 'NO_ASISTIO').length, Icon: CircleX, tone: 'red' },
  ]

  return <div className={styles.layout}>
    <Sidebar />
    <div className={styles.mainArea}>
      <Topbar search={search} onSearchChange={setSearch} />
      <main className={styles.content}>
        <div className={styles.pageHeading}><div><span className={styles.eyebrow}>PANEL DE RECEPCIÓN</span><h1>Dashboard</h1><p>Resumen de reservas y actividad de hoy</p></div><span className={styles.date}>{new Intl.DateTimeFormat('es-PE', { dateStyle: 'long' }).format(today)}</span></div>
        <div className={styles.kpiGrid}>{kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}</div>
        <section className={styles.section} aria-labelledby="upcoming-heading">
          <div className={styles.sectionHeading}><div><h2 id="upcoming-heading">Próximas por atender</h2><p>Reservas confirmadas y pendientes de hoy</p></div><span className={styles.count}>{upcoming.length}</span></div>
          <ReservationsTable rows={upcoming} emptyTitle="Todo al día" emptyMessage={query ? 'No hay reservas que coincidan con la búsqueda.' : 'No hay reservas pendientes por atender.'} />
        </section>
        <section className={styles.section} aria-labelledby="activity-heading">
          <div className={styles.sectionHeading}><div><h2 id="activity-heading">Actividad del día</h2><p>Reservas en curso, finalizadas y no asistidas</p></div><span className={styles.count}>{activity.length}</span></div>
          <ReservationsTable rows={activity} emptyTitle="Sin actividad todavía" emptyMessage={query ? 'No hay reservas que coincidan con la búsqueda.' : 'La actividad del día aparecerá aquí.'} />
        </section>
      </main>
    </div>
  </div>
}
