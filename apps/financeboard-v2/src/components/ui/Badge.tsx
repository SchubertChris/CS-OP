import styles from './Badge.module.css';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  variant?: 'filled' | 'outline' | 'dot';
}

export function Badge({ children, color, variant = 'filled' }: BadgeProps) {
  const style = color
    ? ({
        '--badge-color': color,
        '--badge-bg':    `${color}22`,
        '--badge-border': `${color}55`,
      } as React.CSSProperties)
    : undefined;

  return (
    <span className={[styles.badge, styles[variant]].join(' ')} style={style}>
      {variant === 'dot' && <span className={styles.dot} />}
      {children}
    </span>
  );
}
