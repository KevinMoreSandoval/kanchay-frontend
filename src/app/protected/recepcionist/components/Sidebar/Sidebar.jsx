import { CalendarDays, Clock3, LayoutDashboard, Settings, Users } from 'lucide-react'
import styles from './Sidebar.module.css'

const menuItems = [
  { label: 'Dashboard', Icon: LayoutDashboard },
  { label: 'Reservas', Icon: CalendarDays },
  { label: 'Clientes', Icon: Users },
  { label: 'Configuración', Icon: Settings },
]

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

