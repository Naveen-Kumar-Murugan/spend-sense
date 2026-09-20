import { Link, useNavigate } from 'react-router-dom';
import { MoreVertical, Pencil, Receipt } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { Amount } from '@/components/common/Amount';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CATEGORY_META } from '@/constants/categories';
import type { Transaction } from '@/types';
import { formatDate, titleCase } from '@/utils/format';

interface Props {
  transactions: Transaction[];
  onEditCategory: (transaction: Transaction) => void;
}

export function TransactionTable({ transactions, onEditCategory }: Props) {
  const navigate = useNavigate();

  return (
    <table className="w-full border-collapse">
      <caption className="sr-only">Your transactions</caption>
      <thead>
        <tr className="border-y border-line bg-surface-sunken/60 text-left">
          {['Date', 'Merchant', 'Category', 'Method', 'Status', 'Amount'].map((heading) => (
            <th
              key={heading}
              scope="col"
              className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-ink-faint last:text-right"
            >
              {heading}
            </th>
          ))}
          <th scope="col" className="w-12 px-2">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {transactions.map((transaction) => (
          <tr
            key={transaction.transactionId}
            className="cursor-pointer transition-colors hover:bg-surface-sunken/60"
            onClick={() => navigate(`/app/transactions/${transaction.transactionId}`)}
          >
            <td className="whitespace-nowrap px-5 py-4 text-[13px] text-ink-muted">
              {formatDate(transaction.createdAt)}
            </td>
            <td className="px-5 py-4">
              <div className="flex items-center gap-3">
                <CategoryIcon category={transaction.category} size="sm" />
                <div className="min-w-0">
                  <Link
                    to={`/app/transactions/${transaction.transactionId}`}
                    className="block truncate text-[14px] font-bold text-ink hover:text-primary"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {transaction.merchant}
                  </Link>
                  {transaction.note && (
                    <p className="truncate text-xs text-ink-faint">{transaction.note}</p>
                  )}
                </div>
              </div>
            </td>
            <td className="px-5 py-4">
              <Badge className={CATEGORY_META[transaction.category].pill}>
                {CATEGORY_META[transaction.category].label}
              </Badge>
            </td>
            <td className="whitespace-nowrap px-5 py-4 text-[13px] text-ink-muted">
              {titleCase(transaction.paymentMethod)}
            </td>
            <td className="px-5 py-4">
              <StatusBadge status={transaction.status} />
            </td>
            <td className="whitespace-nowrap px-5 py-4 text-right">
              <Amount value={transaction.amount} signed className="text-[14px] text-ink" />
            </td>
            <td className="px-2 py-4 text-right" onClick={(event) => event.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="rounded-lg p-1.5 text-ink-faint transition-colors hover:bg-surface-sunken hover:text-ink"
                  aria-label={`Actions for ${transaction.merchant}`}
                >
                  <MoreVertical className="h-4 w-4" aria-hidden />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => navigate(`/app/transactions/${transaction.transactionId}`)}>
                    <Receipt className="h-4 w-4" aria-hidden />
                    View details
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onEditCategory(transaction)}>
                    <Pencil className="h-4 w-4" aria-hidden />
                    Change category
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
