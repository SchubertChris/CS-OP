import type { ReactNode, ButtonHTMLAttributes } from 'react'
import { ArrowClockwise } from '@phosphor-icons/react'
import styles from './Button.module.scss'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children?: ReactNode
  variant?: Variant
  size?: Size
  loading?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
  iconOnly?: boolean
  /** Rendert als <a> wenn gesetzt */
  href?: string
  external?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  iconOnly = false,
  href,
  external = false,
  className = '',
  onClick,
  ...rest
}: ButtonProps) {
  const cls = [
    styles.btn,
    styles[variant],
    styles[size],
    loading ? styles.loading : '',
    disabled ? styles.disabled : '',
    iconOnly ? styles.iconOnly : '',
    className,
  ].filter(Boolean).join(' ')

  const content = (
    <span className={styles.inner}>
      {loading
        ? <ArrowClockwise size={14} weight="bold" className={styles.spinner} />
        : iconLeft}
      {children}
      {!loading && iconRight}
    </span>
  )

  if (href) {
    return (
      <a
        href={href}
        className={cls}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      className={cls}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {content}
    </button>
  )
}
