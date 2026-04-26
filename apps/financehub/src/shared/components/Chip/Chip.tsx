import type { ReactNode } from 'react'
import { X } from '@phosphor-icons/react'
import styles from './Chip.module.scss'

type ChipVariant = 'default' | 'gold' | 'positive' | 'negative' | 'warning' | 'info'

interface ChipProps {
  label: string
  variant?: ChipVariant
  icon?: ReactNode
  onRemove?: () => void
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function Chip({
  label,
  variant = 'default',
  icon,
  onRemove,
  selected = false,
  onClick,
  disabled = false,
  className,
}: ChipProps) {
  const Tag = onClick ? 'button' : 'span'

  return (
    <Tag
      className={[
        styles.chip,
        styles[variant],
        selected ? styles.selected : '',
        disabled ? styles.disabled : '',
        onClick ? styles.clickable : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...(Tag === 'button' ? { type: 'button', onClick, disabled } : {})}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{label}</span>
      {onRemove && (
        <button
          type="button"
          className={styles.remove}
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          disabled={disabled}
          aria-label={`${label} entfernen`}
        >
          <X size={10} weight="bold" />
        </button>
      )}
    </Tag>
  )
}
