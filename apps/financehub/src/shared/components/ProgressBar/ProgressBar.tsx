import styles from './ProgressBar.module.scss'

interface ProgressBarProps {
  value: number
  max?: number
  variant?: 'default' | 'positive' | 'negative' | 'warning' | 'info'
  size?: 'sm' | 'md' | 'lg'
  label?: string
  showValue?: boolean
  indeterminate?: boolean
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  label,
  showValue = false,
  indeterminate = false,
  className,
}: ProgressBarProps) {
  const pct = indeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={[styles.wrapper, styles[size], className].filter(Boolean).join(' ')}>
      {(label || showValue) && (
        <div className={styles.meta}>
          {label && <span className={styles.label}>{label}</span>}
          {showValue && !indeterminate && (
            <span className={styles.value}>{Math.round(pct)}%</span>
          )}
        </div>
      )}
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={[
            styles.fill,
            styles[variant],
            indeterminate ? styles.indeterminate : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={indeterminate ? undefined : { width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
