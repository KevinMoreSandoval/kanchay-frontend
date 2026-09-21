import { ClipboardList, Eye } from 'lucide-react'
import styles from './ReservationsTable.module.css'

const statusLabels = {
  PENDIENTE: 'Pendiente', CONFIRMADA: 'Confirmada', EN_CURSO: 'En curso',
  FINALIZADA: 'Finalizada', NO_ASISTIO: 'No asistió',
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
