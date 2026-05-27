import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={[styles.btn, styles[variant], styles[size], className].join(' ')}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden />
      ) : (
        icon && <span className={styles.icon}>{icon}</span>
      )}
      {children && <span>{children}</span>}
    </button>
  );
}
