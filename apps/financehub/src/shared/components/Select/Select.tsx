import type { SelectHTMLAttributes } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import styles from './Select.module.scss'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'size'> {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
  helper?: string
  size?: 'sm' | 'md' | 'lg'
  wrapperClassName?: string
}

export function Select({
  options,
  value,
  onChange,
  label,
  placeholder,
  error,
  helper,
  size = 'md',
  disabled,
  id,
  wrapperClassName,
  className,
  ...rest
}: SelectProps) {
  return (
    <div className={[styles.wrapper, wrapperClassName].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}

      <div className={[styles.field, styles[size]].join(' ')}>
        <select
          {...rest}
          id={id}
          className={[styles.select, error ? styles.error : '', className].filter(Boolean).join(' ')}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        <span className={styles.arrow} aria-hidden="true">
          <CaretDown size={14} weight="bold" />
        </span>
      </div>

      {(error ?? helper) && (
        <span className={[styles.hint, error ? styles.hintError : ''].filter(Boolean).join(' ')}>
          {error ?? helper}
        </span>
      )}
    </div>
  )
}
