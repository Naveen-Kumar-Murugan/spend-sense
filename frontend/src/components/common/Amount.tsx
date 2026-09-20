import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/format';

interface AmountProps {
  value: number;
  className?: string;
  /** Spends are shown with a leading minus, like a statement. */
  signed?: boolean;
  decimals?: boolean;
}

export function Amount({ value, className, signed = false, decimals }: AmountProps) {
  return (
    <span className={cn('tnum font-semibold tracking-[-0.01em]', className)}>
      {signed && value > 0 ? '−' : ''}
      {formatCurrency(value, { decimals })}
    </span>
  );
}
