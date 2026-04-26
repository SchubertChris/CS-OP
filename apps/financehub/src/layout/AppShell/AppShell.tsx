import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Rail } from '../Rail/Rail'
import { ContextBar } from '../ContextBar/ContextBar'
import styles from './AppShell.module.scss'

interface AppShellProps {
  notificationCount?: number
  netWorth?: string
}

export function AppShell({ notificationCount = 0, netWorth }: AppShellProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={styles.shell}>
      <Rail onExpandedChange={setExpanded} />

      <ContextBar
        expanded={expanded}
        netWorth={netWorth}
        notificationCount={notificationCount}
      />

      <main className={`${styles.main} ${expanded ? styles.expanded : ''}`}>
        <div className={styles.inner}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
