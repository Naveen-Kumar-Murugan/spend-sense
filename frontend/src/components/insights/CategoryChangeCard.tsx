import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { EmptyState } from '@/components/common/States';
import { CATEGORY_META } from '@/constants/categories';
import type { Category } from '@/types';
import { formatCurrency, formatSignedPercent } from '@/utils/format';
import { cn } from '@/lib/utils';

export interface CategoryChange {
  category: Category;
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
}

export function CategoryChangeCard({ changes }: { changes: CategoryChange[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Category changes</CardTitle>
          <CardDescription>This month compared with last month</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {changes.length === 0 ? (
          <EmptyState
            title="Nothing to compare yet"
            description="Once you have two months of history, changes appear here."
          />
        ) : (
          <ul className="space-y-3">
            {changes.map((item) => {
              const flat = Math.abs(item.changePercentage) < 1;
              const Icon = flat ? Minus : item.change > 0 ? ArrowUpRight : ArrowDownRight;
              return (
                <li
                  key={item.category}
                  className="flex items-center gap-3 rounded-xl bg-surface-sunken/70 px-3.5 py-3"
                >
                  <CategoryIcon category={item.category} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-ink">
                      {CATEGORY_META[item.category].label}
                    </p>
                    <p className="tnum mt-0.5 text-xs text-ink-muted">
                      {formatCurrency(item.previous, { decimals: false })} →{' '}
                      {formatCurrency(item.current, { decimals: false })}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold',
                      flat
                        ? 'bg-slate-100 text-ink-muted'
                        : item.change > 0
                          ? 'bg-red-50 text-danger'
                          : 'bg-mint-soft text-mint-dark',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    <span className="tnum">{flat ? 'Flat' : formatSignedPercent(item.changePercentage)}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
