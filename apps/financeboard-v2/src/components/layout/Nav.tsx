import { Link } from '@tanstack/react-router';
import styles from './Nav.module.css';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  compact?: boolean;
}

export function NavItem({ to, icon, label, compact }: NavItemProps) {
  return (
    <Link
      to={to}
      className={styles.item}
      activeProps={{ className: `${styles.item} ${styles.active}` }}
    >
      <span className={styles.icon}>{icon}</span>
      {!compact && <span className={styles.label}>{label}</span>}
    </Link>
  );
}

interface NavDividerProps {
  label?: string;
  compact?: boolean;
}

export function NavDivider({ label, compact }: NavDividerProps) {
  return (
    <div className={styles.divider}>
      {!compact && label && <span className={styles.dividerLabel}>{label}</span>}
      <hr className={styles.dividerLine} />
    </div>
  );
}
