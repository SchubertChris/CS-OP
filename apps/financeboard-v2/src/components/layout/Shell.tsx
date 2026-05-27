import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BottomNav } from './BottomNav';
import styles from './Shell.module.css';

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const [compact, setCompact] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.shell} data-compact={compact}>
      <div className={styles.bg} />

      <Sidebar
        compact={compact}
        onToggleCompact={() => setCompact(c => !c)}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={styles.content}>
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className={styles.main}>
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
