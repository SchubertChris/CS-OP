import type { CSSProperties } from 'react'
import styles from './Skeleton.module.scss'

interface SkeletonProps {
  variant?: 'rect' | 'text' | 'circle'
  width?: string | number
  height?: string | number
  lines?: number
  className?: string
}

export function Skeleton({
  variant = 'rect',
  width,
  height,
  lines = 1,
  className,
}: SkeletonProps) {
  const toSize = (v: string | number) => (typeof v === 'number' ? `${v}px` : v)

  if (variant === 'text' && lines > 1) {
    return (
      <div className={[styles.textGroup, className].filter(Boolean).join(' ')}>
        {Array.from({ length: lines }).map((_, i) => (
          <span
            key={i}
            className={[styles.skeleton, styles.text].join(' ')}
            style={{ width: i === lines - 1 ? '65%' : '100%' }}
            aria-hidden="true"
          />
        ))}
      </div>
    )
  }

  const style: CSSProperties = {
    ...(width ? { width: toSize(width) } : {}),
    ...(height ? { height: toSize(height) } : {}),
  }

  return (
    <span
      className={[styles.skeleton, styles[variant], className].filter(Boolean).join(' ')}
      style={style}
      aria-hidden="true"
    />
  )
}
