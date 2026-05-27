import { Link } from '@tanstack/react-router';
import { LayoutDashboard, ArrowLeftRight, BarChart2, Target, Settings } from 'lucide-react';
import styles from './BottomNav.module.css';

const items = [
  { to: '/',              icon: <LayoutDashboard size={22} />, label: 'Dashboard'     },
  { to: '/transaktionen', icon: <ArrowLeftRight size={22} />,  label: 'Transaktionen' },
  { to: '/jahresanalyse', icon: <BarChart2 size={22} />,       label: 'Analyse'       },
  { to: '/sparziele',     icon: <Target size={22} />,          label: 'Ziele'         },
  { to: '/einstellungen', icon: <Settings size={22} />,        label: 'Einstellungen' },
] as const;

export function BottomNav() {
  return (
    <nav className={styles.nav}>
      {items.map(({ to, icon, label }) => (
        <Link
          key={to}
          to={to}
          className={styles.item}
          activeProps={{ className: `${styles.item} ${styles.active}` }}
        >
          <span className={styles.icon}>{icon}</span>
          <span className={styles.label}>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
