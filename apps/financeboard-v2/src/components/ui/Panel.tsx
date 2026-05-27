import styles from './Panel.module.css';

interface PanelProps {
  children: React.ReactNode;
  className?: string | undefined;
  variant?: 'default' | 'raised' | 'inset';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Panel({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
}: PanelProps) {
  return (
    <div
      className={[
        styles.panel,
        styles[variant],
        styles[`pad-${padding}`],
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
