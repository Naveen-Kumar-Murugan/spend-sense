import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { EmptyState } from '@/components/common/States';
import type { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';

export function UnusualSpendCard({ transactions }: { transactions: Transaction[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Unusual spending</CardTitle>
          <CardDescription>Payments well above your usual amount for that category</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <EmptyState
            icon={<AlertTriangle className="h-5 w-5" aria-hidden />}
            title="Nothing out of the ordinary"
            description="Every payment this month sits close to your usual range."
          />
        ) : (
          <ul className="space-y-2">
            {transactions.map((transaction) => (
              <li key={transaction.transactionId}>
                <Link
                  to={`/app/transactions/${transaction.transactionId}`}
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-surface-sunken"
                >
                  <CategoryIcon category={transaction.category} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-ink">{transaction.merchant}</p>
                    <p className="text-xs text-ink-muted">{formatDate(transaction.createdAt)}</p>
                  </div>
                  <p className="tnum text-[13px] font-bold text-ink">
                    {formatCurrency(transaction.amount, { decimals: false })}
                  </p>
                  <ChevronRight className="h-4 w-4 text-ink-faint" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
