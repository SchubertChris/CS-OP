import { useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from '@phosphor-icons/react'
import { useClickOutside } from '../../hooks/useClickOutside'
import { CandleScopeMarkImage } from '../Logo/CandleScopeMarkImage'
import styles from './Modal.module.scss'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  footer?: ReactNode
  closeOnOverlay?: boolean
  className?: string
  branded?: boolean
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  footer,
  closeOnOverlay = true,
  className,
  branded = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useClickOutside(dialogRef, onClose, { enabled: open && closeOnOverlay })

  // Body-Scroll sperren wenn Modal offen
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div
        ref={dialogRef}
        className={[styles.dialog, styles[size], className].filter(Boolean).join(' ')}
      >
        {branded && (
          <div className={styles.brandedHeader}>
            <CandleScopeMarkImage size={52} />
            <span className={styles.brandName}>CandleScope</span>
          </div>
        )}

        {title && (
          <div className={[styles.header, branded ? styles.headerBranded : ''].filter(Boolean).join(' ')}>
            <h2 className={styles.title}>{title}</h2>
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label="Schließen"
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        )}

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
