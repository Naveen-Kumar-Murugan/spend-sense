import { Badge } from '@/components/ui/badge';
import type { TransactionStatus } from '@/types';

const TONE = {
  SUCCESS: { tone: 'mint' as const, label: 'Paid', dot: 'bg-mint' },
  PENDING: { tone: 'warn' as const, label: 'Pending', dot: 'bg-warn' },
  FAILED: { tone: 'danger' as const, label: 'Failed', dot: 'bg-danger' },
};

export function StatusBadge({ status }: { status: TransactionStatus }) {
  const meta = TONE[status];
  return (
    <Badge tone={meta.tone}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
      {meta.label}
    </Badge>
  );
}
