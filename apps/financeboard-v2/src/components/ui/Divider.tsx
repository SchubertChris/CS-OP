interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className = '' }: DividerProps) {
  if (label) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sp-3)',
          margin: 'var(--sp-2) 0',
        }}
      >
        <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)', margin: 0 }} />
        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
          {label}
        </span>
        <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)', margin: 0 }} />
      </div>
    );
  }

  return (
    <hr
      className={className}
      style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 'var(--sp-2) 0' }}
    />
  );
}
