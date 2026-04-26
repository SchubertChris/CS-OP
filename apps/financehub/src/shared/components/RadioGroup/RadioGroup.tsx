import styles from './RadioGroup.module.scss'

interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface RadioGroupProps {
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  name: string
  label?: string
  orientation?: 'vertical' | 'horizontal'
}

export function RadioGroup({ options, value, onChange, name, label, orientation = 'vertical' }: RadioGroupProps) {
  return (
    <fieldset className={styles.fieldset}>
      {label && <legend className={styles.legend}>{label}</legend>}
      <div className={[styles.group, styles[orientation]].join(' ')}>
        {options.map((opt) => (
          <label
            key={opt.value}
            className={[styles.option, opt.disabled ? styles.disabled : ''].filter(Boolean).join(' ')}
          >
            <span className={styles.ctrl}>
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={opt.value === value}
                disabled={opt.disabled}
                onChange={() => onChange(opt.value)}
                className={styles.input}
              />
              <span className={styles.dot} />
            </span>
            <span className={styles.meta}>
              <span className={styles.label}>{opt.label}</span>
              {opt.description && <span className={styles.desc}>{opt.description}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
