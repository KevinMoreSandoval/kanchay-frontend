import { Bell, Search } from 'lucide-react'
import styles from './Topbar.module.css'

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

