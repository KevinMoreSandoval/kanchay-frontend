import styles from './KpiCard.module.css'

export function KpiCard({ label, value, Icon, tone }) {
  return <article className={styles.kpiCard}>
    <div><p>{label}</p><strong>{value}</strong></div>
    <span className={`${styles.kpiIcon} ${styles[tone]}`}><Icon size={23} /></span>
  </article>
}

