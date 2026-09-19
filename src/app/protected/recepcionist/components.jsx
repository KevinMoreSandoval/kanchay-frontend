import { Bell, CalendarDays, Clock3, Eye, LayoutDashboard, Search, Settings, Users, ClipboardList } from 'lucide-react'
import styles from './reception.module.css'

const menuItems = [
  { label: 'Dashboard', Icon: LayoutDashboard },
  { label: 'Reservas', Icon: CalendarDays },
  { label: 'Clientes', Icon: Users },
  { label: 'Configuración', Icon: Settings },
]

const statusLabels = {
  PENDIENTE: 'Pendiente', CONFIRMADA: 'Confirmada', EN_CURSO: 'En curso',
  FINALIZADA: 'Finalizada', NO_ASISTIO: 'No asistió',
}

export function Sidebar() {
  return <aside className={styles.sidebar}>
    <div className={styles.brand}>Cancha<span>Ya</span></div>
    <nav className={styles.navigation} aria-label="Menú principal">
      {menuItems.map(({ label, Icon }, index) => index === 0
        ? <a key={label} href="/recepcionista" className={styles.activeLink} aria-current="page"><Icon size={19} />{label}</a>
        : <span key={label} className={styles.menuPlaceholder}><Icon size={19} />{label}</span>)}
    </nav>
    <div className={styles.sidebarNote}><Clock3 size={19} /><span>Panel de recepción</span></div>
  </aside>
}

export function Topbar({ search, onSearchChange }) {
  return <header className={styles.topbar}>
    <div className={styles.searchBox}>
      <Search size={18} aria-hidden="true" />
      <label className={styles.srOnly} htmlFor="reception-search">Buscar reservas</label>
      <input id="reception-search" type="search" placeholder="Buscar cliente o cancha..." value={search} onChange={(event) => onSearchChange(event.target.value)} />
    </div>
    <div className={styles.topbarRight}>
      <span className={styles.notification} role="img" aria-label="Notificaciones"><Bell size={20} /></span>
      <div className={styles.profile}><span className={styles.avatar}>R</span><span><strong>Recepción</strong><small>RECEPCIONISTA</small></span></div>
    </div>
  </header>
}

export function KpiCard({ label, value, Icon, tone }) {
  return <article className={styles.kpiCard}>
    <div><p>{label}</p><strong>{value}</strong></div>
    <span className={`${styles.kpiIcon} ${styles[tone]}`}><Icon size={23} /></span>
  </article>
}

export function ReservationsTable({ rows, emptyTitle, emptyMessage }) {
  if (rows.length === 0) {
    return <div className={styles.emptyState}><ClipboardList size={37} strokeWidth={1.5} /><strong>{emptyTitle}</strong><p>{emptyMessage}</p></div>
  }

  return <div className={styles.tableScroll}><table className={styles.table}>
    <thead><tr><th>Cliente</th><th>Cancha</th><th>Horario</th><th>Estado</th><th>Monto</th><th><span className={styles.srOnly}>Acción</span></th></tr></thead>
    <tbody>{rows.map((row) => <tr key={row.id}>
      <td className={styles.customer}>{row.cliente}</td>
      <td>{row.cancha}</td>
      <td>{row.horaInicio} – {row.horaFin}</td>
      <td><span className={`${styles.status} ${styles[row.estado.toLowerCase()]}`}>{statusLabels[row.estado]}</span></td>
      <td className={styles.amount}>S/ {row.monto.toFixed(2)}</td>
      <td><span className={styles.viewIcon} role="img" aria-label={`Reserva de ${row.cliente}`}><Eye size={18} /></span></td>
    </tr>)}</tbody>
  </table></div>
}
