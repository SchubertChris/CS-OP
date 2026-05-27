import { AmountDisplay } from './AmountDisplay';
import styles from './KpiCard.module.css';

interface KpiCardProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
  trend?: number;
  colored?: boolean;
  showSign?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function KpiCard({ label, value, icon, trend, colored = false, showSign = false, size = 'md' }: KpiCardProps) {
  return (
    <div className={[styles.card, styles[size]].join(' ')}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
      <AmountDisplay value={value} colored={colored} showSign={showSign} size={size === 'lg' ? 'xl' : size === 'md' ? 'lg' : 'md'} />
      {trend !== undefined && (
        <span className={[styles.trend, trend >= 0 ? styles.pos : styles.neg].join(' ')}>
          {trend >= 0 ? '+' : ''}{trend.toFixed(1)} %
        </span>
      )}
    </div>
  );
}
