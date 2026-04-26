import { useState } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { Eye, EyeSlash, X } from '@phosphor-icons/react'
import styles from './Input.module.scss'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  helper?: string
  error?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'flat'
  leading?: ReactNode
  trailing?: ReactNode
  clearable?: boolean
  onClear?: () => void
  wrapperClassName?: string
}

export function Input({
  label,
  helper,
  error,
  size = 'md',
  variant = 'default',
  leading,
  trailing,
  clearable,
  onClear,
  wrapperClassName,
  type = 'text',
  className,
  id,
  placeholder,
  ...props
}: InputProps) {
  const [showPw, setShowPw] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword && showPw ? 'text' : type
  const isFlat = variant === 'flat'

  const hasTrailing = trailing ?? isPassword ?? (clearable && props.value)

  // Für flat variant: placeholder-Text wird zum floating label.
  // Das input bekommt " " (Leerzeichen) damit :placeholder-shown als CSS-Hook funktioniert.
  const inputPlaceholder = isFlat ? ' ' : placeholder
  const floatingText = isFlat ? placeholder : undefined

  return (
    <div
      className={[
        styles.wrapper,
        isFlat ? styles.wrapperFlat : '',
        error ? styles.hasError : '',
        wrapperClassName,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Standard-Label — nur bei default variant über dem Feld */}
      {!isFlat && label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}

      <div className={[styles.field, styles[size], isFlat ? styles.floatingField : ''].join(' ')}>
        {leading && <span className={[styles.adorn, styles.adornLeft].join(' ')}>{leading}</span>}

        <input
          {...props}
          id={id}
          type={resolvedType}
          placeholder={inputPlaceholder}
          className={[
            styles.input,
            isFlat ? styles.inputFlat : '',
            leading ? styles.withLeft : '',
            hasTrailing ? styles.withRight : '',
            error ? styles.inputError : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        />

        {/* Floating placeholder-label — NACH input im DOM für :has()-Selector */}
        {isFlat && floatingText && (
          <label
            htmlFor={id}
            className={[
              styles.floatingLabel,
              leading ? styles.floatingLabelWithIcon : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {floatingText}
          </label>
        )}

        {hasTrailing && (
          <span className={[styles.adorn, styles.adornRight].join(' ')}>
            {clearable && props.value && (
              <button
                type="button"
                className={styles.iconBtn}
                onClick={onClear}
                tabIndex={-1}
                aria-label="Löschen"
              >
                <X size={12} weight="bold" />
              </button>
            )}
            {isPassword && (
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setShowPw((v) => !v)}
                tabIndex={-1}
                aria-label={showPw ? 'Verbergen' : 'Anzeigen'}
              >
                {showPw ? <EyeSlash size={14} /> : <Eye size={14} />}
              </button>
            )}
            {!isPassword && trailing}
          </span>
        )}
      </div>

      {(error ?? helper) && (
        <span className={[styles.hint, error ? styles.hintError : ''].filter(Boolean).join(' ')}>
          {error ?? helper}
        </span>
      )}
    </div>
  )
}
