import { useEffect, useRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Check, Minus } from '@phosphor-icons/react'
import styles from './Checkbox.module.scss'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'checked'> {
  checked: boolean
  onChange: (checked: boolean) => void
  indeterminate?: boolean
  label?: string
  description?: string
}

export function Checkbox({
  checked,
  onChange,
  indeterminate = false,
  label,
  description,
  disabled,
  id,
  className,
  ...rest
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <label className={[styles.wrapper, disabled ? styles.disabled : '', className].filter(Boolean).join(' ')}>
      <span className={styles.ctrl}>
        <input
          ref={inputRef}
          type="checkbox"
          className={styles.input}
          checked={checked}
          disabled={disabled}
          id={id}
          onChange={(e) => onChange(e.target.checked)}
          {...rest}
        />
        <span className={[styles.box, indeterminate ? styles.partial : ''].filter(Boolean).join(' ')}>
          {indeterminate
            ? <Minus size={10} weight="bold" className={styles.mark} />
            : <Check size={10} weight="bold" className={styles.mark} />}
        </span>
      </span>

      {(label ?? description) && (
        <span className={styles.meta}>
          {label && <span className={styles.label}>{label}</span>}
          {description && <span className={styles.desc}>{description}</span>}
        </span>
      )}
    </label>
  )
}
