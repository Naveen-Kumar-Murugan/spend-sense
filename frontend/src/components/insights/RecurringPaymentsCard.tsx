import { Repeat2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/States';
import type { RecurringPayment } from '@/types';
import { formatCurrency, formatDate, titleCase } from '@/utils/format';

interface Props {
  recurring: RecurringPayment[];
  estimatedMonthly: number;
}

export function RecurringPaymentsCard({ recurring, estimatedMonthly }: Props) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Recurring payments</CardTitle>
          <CardDescription>
            About {formatCurrency(estimatedMonthly, { decimals: false })} leaves your account every month
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {recurring.length === 0 ? (
          <EmptyState
            icon={<Repeat2 className="h-5 w-5" aria-hidden />}
            title="No repeating charges found"
            description="Once a merchant charges you on a steady cadence, it will be listed here."
          />
        ) : (
          <ul className="divide-y divide-line">
            {recurring.map((item) => (
              <li key={item.merchant} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold text-ink">{item.merchant}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {titleCase(item.frequency)} · {item.occurrences} charges · last on {formatDate(item.lastChargedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="tnum text-[14px] font-bold text-ink">
                    {formatCurrency(item.amount, { decimals: false })}
                  </p>
                  <Badge tone="neutral" className="mt-1">
                    {Math.round(item.confidence * 100)}% match
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
