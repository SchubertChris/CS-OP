import styles from './PageBackground.module.scss'

export function PageBackground() {
  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />
      <div className={styles.chartGrid} />
    </div>
  )
}
