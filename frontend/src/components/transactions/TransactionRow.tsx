import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { Amount } from '@/components/common/Amount';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CATEGORY_META } from '@/constants/categories';
import type { Transaction } from '@/types';
import { formatRelativeDay, titleCase } from '@/utils/format';

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  return (
    <Link
      to={`/app/transactions/${transaction.transactionId}`}
      className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-surface-sunken sm:px-6"
    >
      <CategoryIcon category={transaction.category} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-bold text-ink">{transaction.merchant}</p>
        <p className="mt-0.5 truncate text-xs text-ink-muted">
          {CATEGORY_META[transaction.category].label} · {formatRelativeDay(transaction.createdAt)}
        </p>
      </div>
      <div className="text-right">
        <Amount value={transaction.amount} signed className="text-[14px] text-ink" />
        <p className="mt-0.5 text-[11px] text-ink-faint">
          {transaction.status === 'SUCCESS'
            ? titleCase(transaction.paymentMethod)
            : transaction.status === 'PENDING'
              ? 'Pending'
              : 'Failed'}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden />
    </Link>
  );
}

export function TransactionCard({ transaction }: { transaction: Transaction }) {
  return (
    <Link
      to={`/app/transactions/${transaction.transactionId}`}
      className="flex items-start gap-3.5 rounded-2xl border border-line bg-white p-4 transition-shadow active:shadow-card"
    >
      <CategoryIcon category={transaction.category} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="truncate text-[14px] font-bold text-ink">{transaction.merchant}</p>
          <Amount value={transaction.amount} signed className="text-[14px] text-ink" />
        </div>
        <p className="mt-1 text-xs text-ink-muted">
          {CATEGORY_META[transaction.category].label} · {formatRelativeDay(transaction.createdAt)}
        </p>
        <div className="mt-2.5 flex items-center gap-2">
          <StatusBadge status={transaction.status} />
          <span className="text-[11px] font-semibold text-ink-faint">
            {titleCase(transaction.paymentMethod)}
          </span>
        </div>
      </div>
    </Link>
  );
}
