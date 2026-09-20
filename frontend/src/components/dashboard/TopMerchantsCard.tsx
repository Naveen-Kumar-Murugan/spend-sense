import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/common/States';
import type { MerchantSpend } from '@/types';
import { formatCurrency } from '@/utils/format';

export function TopMerchantsCard({ merchants }: { merchants: MerchantSpend[] }) {
  const max = merchants[0]?.amount ?? 1;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Top merchants</CardTitle>
          <CardDescription>Biggest recipients this month</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {merchants.length === 0 ? (
          <EmptyState title="No merchants yet" description="Payments you make will be ranked here." />
        ) : (
          <ul className="space-y-4">
            {merchants.map((merchant) => (
              <li key={merchant.merchant}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-[13px] font-bold text-ink">{merchant.merchant}</p>
                  <p className="tnum text-[13px] font-bold text-ink">
                    {formatCurrency(merchant.amount, { decimals: false })}
                  </p>
                </div>
                <Progress value={(merchant.amount / max) * 100} className="mt-2" label={merchant.merchant} />
                <p className="mt-1.5 text-xs text-ink-faint">{merchant.transactionCount} payments</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
