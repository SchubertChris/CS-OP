import { useState, useRef } from 'react'
import type { ReactNode } from 'react'
import { useClickOutside } from '../../hooks/useClickOutside'
import styles from './Dropdown.module.scss'

export interface DropdownItem {
  id: string
  label: string
  icon?: ReactNode
  variant?: 'default' | 'danger'
  disabled?: boolean
  separator?: boolean
}

interface DropdownProps {
  trigger: ReactNode
  items: DropdownItem[]
  onSelect: (id: string) => void
  placement?: 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start'
  className?: string
}

export function Dropdown({
  trigger,
  items,
  onSelect,
  placement = 'bottom-end',
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useClickOutside(ref, () => setOpen(false), { enabled: open })

  const handleSelect = (id: string) => {
    onSelect(id)
    setOpen(false)
  }

  return (
    <div ref={ref} className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      <div onClick={() => setOpen((v) => !v)} className={styles.trigger}>
        {trigger}
      </div>

      {open && (
        <div
          className={[styles.menu, styles[placement.replace('-', '_')]].join(' ')}
          role="menu"
        >
          {items.map((item) =>
            item.separator ? (
              <div key={item.id} className={styles.separator} role="separator" />
            ) : (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={[
                  styles.item,
                  item.variant === 'danger' ? styles.danger : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleSelect(item.id)}
              >
                {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}
