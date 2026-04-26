import type { TextareaHTMLAttributes } from 'react'
import styles from './Textarea.module.scss'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helper?: string
  error?: string
  resize?: 'none' | 'vertical' | 'both'
  wrapperClassName?: string
}

export function Textarea({
  label,
  helper,
  error,
  resize = 'vertical',
  disabled,
  id,
  wrapperClassName,
  className,
  ...rest
}: TextareaProps) {
  return (
    <div className={[styles.wrapper, wrapperClassName].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}

      <textarea
        {...rest}
        id={id}
        disabled={disabled}
        className={[
          styles.textarea,
          styles[`resize-${resize}`],
          error ? styles.error : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      />

      {(error ?? helper) && (
        <span className={[styles.hint, error ? styles.hintError : ''].filter(Boolean).join(' ')}>
          {error ?? helper}
        </span>
      )}
    </div>
  )
}
