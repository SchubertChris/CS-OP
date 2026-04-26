import styles from './Toggle.module.scss'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  size?: 'sm' | 'md'
  variant?: 'default' | 'positive'
  id?: string
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  variant = 'default',
  id,
}: ToggleProps) {
  return (
    <label className={[styles.wrapper, disabled ? styles.disabled : ''].filter(Boolean).join(' ')}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        id={id}
        className={[
          styles.track,
          styles[size],
          styles[variant],
          checked ? styles.on : styles.off,
        ].join(' ')}
        onClick={() => !disabled && onChange(!checked)}
      >
        <span className={styles.thumb} />
      </button>

      {(label ?? description) && (
        <div className={styles.meta}>
          {label && <span className={styles.label}>{label}</span>}
          {description && <span className={styles.description}>{description}</span>}
        </div>
      )}
    </label>
  )
}
