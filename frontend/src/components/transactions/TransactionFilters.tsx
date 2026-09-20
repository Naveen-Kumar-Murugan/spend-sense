import { Filter, Search, X } from 'lucide-react';
import { Input, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CATEGORY_META, CATEGORY_ORDER } from '@/constants/categories';
import type { Category } from '@/types';
import { formatMonthKey } from '@/utils/format';

export interface TransactionFilterValues {
  search: string;
  category: Category | '';
  month: string;
}

interface Props {
  values: TransactionFilterValues;
  months: string[];
  onChange: (patch: Partial<TransactionFilterValues>) => void;
  onReset: () => void;
  resultCount: number;
}

export function TransactionFilters({ values, months, onChange, onReset, resultCount }: Props) {
  const isFiltered = Boolean(values.search || values.category || values.month);

  return (
    <div className="rounded-2xl border border-line bg-white p-3 shadow-card sm:p-4">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden />
          <Input
            type="search"
            value={values.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Search by merchant or note…"
            className="rounded-full pl-10"
            aria-label="Search transactions"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5 lg:flex lg:w-auto">
          <Select
            value={values.category}
            onChange={(event) => onChange({ category: event.target.value as Category | '' })}
            aria-label="Filter by category"
            className="lg:w-[170px]"
          >
            <option value="">All categories</option>
            {CATEGORY_ORDER.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_META[category].label}
              </option>
            ))}
          </Select>

          <Select
            value={values.month}
            onChange={(event) => onChange({ month: event.target.value })}
            aria-label="Filter by month"
            className="lg:w-[170px]"
          >
            <option value="">All time</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {formatMonthKey(month)}
              </option>
            ))}
          </Select>
        </div>

        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={onReset} className="lg:ml-1">
            <X className="h-4 w-4" aria-hidden />
            Clear
          </Button>
        )}
      </div>

      <p className="mt-3 flex items-center gap-1.5 px-1 text-xs text-ink-faint">
        <Filter className="h-3.5 w-3.5" aria-hidden />
        {resultCount} {resultCount === 1 ? 'transaction' : 'transactions'}
        {isFiltered ? ' match your filters' : ' in your history'}
      </p>
    </div>
  );
}
