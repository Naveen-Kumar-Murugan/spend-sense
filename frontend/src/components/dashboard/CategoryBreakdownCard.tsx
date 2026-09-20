import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryDonutChart } from '@/components/charts/CategoryDonutChart';
import { EmptyState } from '@/components/common/States';
import { CATEGORY_META } from '@/constants/categories';
import type { CategorySpend } from '@/types';
import { formatCurrency } from '@/utils/format';

interface Props {
  data: CategorySpend[];
  total: number;
}

export function CategoryBreakdownCard({ data, total }: Props) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Spending by category</CardTitle>
          <CardDescription>Where this month went</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {data.length === 0 ? (
          <EmptyState
            title="Nothing recorded yet"
            description="Your first payment will show up here as a category slice."
          />
        ) : (
          <>
            <CategoryDonutChart data={data} total={total} />
            <ul className="mt-5 space-y-3">
              {data.slice(0, 4).map((item) => (
                <li key={item.category} className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: CATEGORY_META[item.category].hex }}
                    aria-hidden
                  />
                  <Link
                    to={`/app/transactions?category=${item.category}`}
                    className="flex-1 truncate text-[13px] font-semibold text-ink-soft hover:text-primary"
                  >
                    {CATEGORY_META[item.category].label}
                  </Link>
                  <span className="text-xs text-ink-faint">{item.percentage}%</span>
                  <span className="tnum w-24 text-right text-[13px] font-bold text-ink">
                    {formatCurrency(item.amount, { decimals: false })}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
