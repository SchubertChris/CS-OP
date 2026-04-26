import type { ReactNode } from 'react'
import { X } from '@phosphor-icons/react'
import { useClickOutside } from '../../hooks/useClickOutside'
import { useRef } from 'react'
import styles from './Aside.module.scss'

interface AsideProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  side?: 'right' | 'left'
  width?: string
  overlay?: boolean
  className?: string
}

export function Aside({
  open,
  onClose,
  title,
  children,
  side = 'right',
  width,
  overlay = true,
  className,
}: AsideProps) {
  const ref = useRef<HTMLElement>(null)
  useClickOutside(ref, onClose, { enabled: open && overlay })

  return (
    <>
      {overlay && (
        <div
          className={[styles.overlay, open ? styles.overlayVisible : ''].filter(Boolean).join(' ')}
          aria-hidden="true"
        />
      )}

      <aside
        ref={ref}
        className={[
          styles.aside,
          styles[side],
          open ? styles.open : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={width ? { '--aside-w': width } as React.CSSProperties : undefined}
        aria-hidden={!open}
      >
        {title && (
          <div className={styles.header}>
            <span className={styles.headerTitle}>{title}</span>
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label="Panel schließen"
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        )}
        <div className={styles.body}>{children}</div>
      </aside>
    </>
  )
}
