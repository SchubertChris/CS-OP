import { ArrowUp, ArrowDown } from '@phosphor-icons/react'
import styles from './Stat.module.scss'

interface StatProps {
  label: string
  value: string
  trend?: number
  trendLabel?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Stat({ label, value, trend, trendLabel, size = 'md', className }: StatProps) {
  const isUp = trend !== undefined && trend > 0
  const isDown = trend !== undefined && trend < 0

  return (
    <div className={[styles.stat, styles[size], className].filter(Boolean).join(' ')}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      {trend !== undefined && (
        <span className={[styles.trend, isUp ? styles.up : isDown ? styles.down : styles.flat].join(' ')}>
          {isUp   && <ArrowUp   size={11} weight="bold" />}
          {isDown && <ArrowDown size={11} weight="bold" />}
          <span>{Math.abs(trend).toFixed(1)}%</span>
          {trendLabel && <span className={styles.trendLabel}>{trendLabel}</span>}
        </span>
      )}
    </div>
  )
}
