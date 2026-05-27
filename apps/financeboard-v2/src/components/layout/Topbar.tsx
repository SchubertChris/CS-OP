import { Menu } from 'lucide-react';
import { useRouterState } from '@tanstack/react-router';
import styles from './Topbar.module.css';

const PAGE_TITLES: Record<string, string> = {
  '/':               'Dashboard',
  '/transaktionen':  'Transaktionen',
  '/jahresanalyse':  'Jahresanalyse',
  '/vertraege':      'Verträge',
  '/kreditoren':     'Kreditoren',
  '/sparziele':      'Sparziele',
  '/pivot':          'Pivot',
  '/visionboard':    'Vision Board',
  '/archiv':         'Archiv',
  '/einstellungen':  'Einstellungen',
  '/docs':           'Über die App',
};

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = PAGE_TITLES[pathname] ?? 'CandleScope';

  return (
    <header className={styles.topbar}>
      <button
        className={styles.menuBtn}
        onClick={onMenuClick}
        aria-label="Menü öffnen"
      >
        <Menu size={20} />
      </button>

      <h1 className={styles.title}>{title}</h1>

      <div className={styles.actions} />
    </header>
  );
}
