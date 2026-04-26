import { createContext, useCallback, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, Info, Warning, XCircle, X } from '@phosphor-icons/react'
import styles from './Toast.module.scss'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type ToastVariant = 'info' | 'success' | 'warning' | 'error'

interface ToastData {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  duration: number
}

interface ToastContextValue {
  toast: (opts: Omit<ToastData, 'id' | 'duration'> & { duration?: number }) => void
  dismiss: (id: string) => void
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const ToastContext = createContext<ToastContextValue | null>(null)

const ICONS: Record<ToastVariant, ReactNode> = {
  info:    <Info size={16} weight="fill" />,
  success: <CheckCircle size={16} weight="fill" />,
  warning: <Warning size={16} weight="fill" />,
  error:   <XCircle size={16} weight="fill" />,
}

// ---------------------------------------------------------------------------
// Single Toast item
// ---------------------------------------------------------------------------
function ToastItem({ data, onDismiss }: { data: ToastData; onDismiss: (id: string) => void }) {
  return (
    <div className={[styles.toast, styles[data.variant]].join(' ')} role="alert">
      <span className={styles.toastIcon}>{ICONS[data.variant]}</span>
      <div className={styles.toastContent}>
        <p className={styles.toastTitle}>{data.title}</p>
        {data.description && <p className={styles.toastDesc}>{data.description}</p>}
      </div>
      <button
        type="button"
        className={styles.toastDismiss}
        onClick={() => onDismiss(data.id)}
        aria-label="Schließen"
      >
        <X size={13} weight="bold" />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) { clearTimeout(timer); timers.current.delete(id) }
  }, [])

  const toast = useCallback(
    (opts: Omit<ToastData, 'id' | 'duration'> & { duration?: number }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const duration = opts.duration ?? 4000
      const data: ToastData = { ...opts, id, duration }

      setToasts((prev) => [...prev.slice(-4), data]) // max 5 toasts

      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration)
        timers.current.set(id, timer)
      }
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {createPortal(
        <div className={styles.container} aria-live="polite" aria-atomic="false">
          {toasts.map((t) => (
            <ToastItem key={t.id} data={t} onDismiss={dismiss} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
