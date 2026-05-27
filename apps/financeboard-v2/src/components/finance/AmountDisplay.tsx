import { fm } from '../../lib/format';

interface AmountDisplayProps {
  value: number;
  showSign?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  colored?: boolean;
  className?: string;
}

export function AmountDisplay({
  value,
  showSign = false,
  size = 'md',
  colored = false,
  className = '',
}: AmountDisplayProps) {
  const sizeMap = { sm: '0.875rem', md: '1rem', lg: '1.25rem', xl: '1.75rem' };
  const color = colored
    ? value >= 0 ? 'var(--positive)' : 'var(--negative)'
    : undefined;

  return (
    <span
      className={className}
      style={{
        fontFamily: 'var(--mono)',
        fontWeight: 600,
        fontSize: sizeMap[size],
        color,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {fm(value, showSign)}
    </span>
  );
}
