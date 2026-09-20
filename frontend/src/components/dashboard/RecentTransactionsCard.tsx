import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionRow } from '@/components/transactions/TransactionRow';
import { EmptyState } from '@/components/common/States';
import { Button } from '@/components/ui/button';
import type { Transaction } from '@/types';

export function RecentTransactionsCard({ transactions }: { transactions: Transaction[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Recent transactions</CardTitle>
        <Link to="/app/transactions" className="text-[13px] font-semibold text-primary hover:underline">
          View all
        </Link>
      </CardHeader>

      {transactions.length === 0 ? (
        <EmptyState
          title="No payments yet"
          description="Record your first payment and it will appear here instantly."
          action={
            <Button asChild size="sm">
              <Link to="/app/payment">Make a payment</Link>
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {transactions.map((transaction) => (
            <li key={transaction.transactionId}>
              <TransactionRow transaction={transaction} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
