import type { ReactNode } from 'react'
import { Info, CheckCircle, Warning, XCircle, X } from '@phosphor-icons/react'
import styles from './Alert.module.scss'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

const ICONS: Record<AlertVariant, ReactNode> = {
  info:    <Info size={16} weight="fill" />,
  success: <CheckCircle size={16} weight="fill" />,
  warning: <Warning size={16} weight="fill" />,
  error:   <XCircle size={16} weight="fill" />,
}

interface AlertProps {
  variant: AlertVariant
  title?: string
  children: ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  noIcon?: boolean
  className?: string
}

export function Alert({ variant, title, children, dismissible, onDismiss, noIcon, className }: AlertProps) {
  return (
    <div
      className={[styles.alert, styles[variant], className].filter(Boolean).join(' ')}
      role="alert"
    >
      {!noIcon && <span className={styles.icon}>{ICONS[variant]}</span>}

      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        <div className={styles.body}>{children}</div>
      </div>

      {dismissible && (
        <button
          type="button"
          className={styles.dismiss}
          onClick={onDismiss}
          aria-label="Schließen"
        >
          <X size={14} weight="bold" />
        </button>
      )}
    </div>
  )
}
