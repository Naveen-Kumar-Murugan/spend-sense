import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Receipt } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { TransactionFilters, type TransactionFilterValues } from '@/components/transactions/TransactionFilters';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { TransactionCard } from '@/components/transactions/TransactionRow';
import { CategoryEditor } from '@/components/transactions/CategoryEditor';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/common/States';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useToast } from '@/hooks/useToast';
import { getTransactions, updateTransactionCategory } from '@/services/api';
import { toUserMessage } from '@/services/errors';
import type { Category, Transaction } from '@/types';
import { monthKey } from '@/utils/format';

function recentMonths(count = 6): string[] {
  const now = new Date();
  return Array.from({ length: count }, (_, index) =>
    monthKey(new Date(now.getFullYear(), now.getMonth() - index, 1)),
  );
}

export default function Transactions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { notify } = useToast();

  const [filters, setFilters] = useState<TransactionFilterValues>({
    search: searchParams.get('search') ?? '',
    category: (searchParams.get('category') as Category | null) ?? '',
    month: searchParams.get('month') ?? '',
  });
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(filters.search, 300);
  const months = useMemo(() => recentMonths(), []);

  const { data, loading, error, refresh, setData } = useAsyncData<Transaction[]>(
    () =>
      getTransactions({
        search: debouncedSearch || undefined,
        category: filters.category || undefined,
        month: filters.month || undefined,
        limit: 200,
      }),
    [debouncedSearch, filters.category, filters.month],
  );

  const transactions = data ?? [];

  const applyFilters = (patch: Partial<TransactionFilterValues>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    const params = new URLSearchParams();
    if (next.search) params.set('search', next.search);
    if (next.category) params.set('category', next.category);
    if (next.month) params.set('month', next.month);
    setSearchParams(params, { replace: true });
  };

  const handleSaveCategory = async (category: Category, subcategory: string) => {
    if (!editing) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateTransactionCategory(editing.transactionId, category, subcategory);
      setData(
        transactions.map((item) => (item.transactionId === updated.transactionId ? updated : item)),
      );
      setEditing(null);
      notify(`${updated.merchant} is now filed under ${category.toLowerCase()}.`);
    } catch (cause) {
      setSaveError(toUserMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Transactions"
        description="Search, filter and re-categorise everything you have spent."
        actions={
          <Button asChild>
            <Link to="/app/payment">
              <Plus className="h-4 w-4" aria-hidden />
              Add payment
            </Link>
          </Button>
        }
      />

      <TransactionFilters
        values={filters}
        months={months}
        onChange={applyFilters}
        onReset={() => applyFilters({ search: '', category: '', month: '' })}
        resultCount={transactions.length}
      />

      <Card className="overflow-hidden">
        {loading && <ListSkeleton rows={6} />}

        {!loading && error && <ErrorState message={error} onRetry={refresh} />}

        {!loading && !error && transactions.length === 0 && (
          <EmptyState
            icon={<Receipt className="h-5 w-5" aria-hidden />}
            title="No transactions found"
            description="Try a different search, or clear your filters to see everything."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => applyFilters({ search: '', category: '', month: '' })}
              >
                Clear filters
              </Button>
            }
          />
        )}

        {!loading && !error && transactions.length > 0 && (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <TransactionTable transactions={transactions} onEditCategory={setEditing} />
            </div>
            <ul className="space-y-3 p-3 lg:hidden">
              {transactions.map((transaction) => (
                <li key={transaction.transactionId}>
                  <TransactionCard transaction={transaction} />
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <Sheet open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent side="right" className="p-6">
          <SheetTitle className="text-lg font-extrabold tracking-[-0.02em] text-ink">
            Change category
          </SheetTitle>
          {editing && (
            <>
              <p className="mb-6 mt-1 text-sm text-ink-muted">
                {editing.merchant} · filing this correctly sharpens your insights.
              </p>
              <CategoryEditor
                transaction={editing}
                saving={saving}
                error={saveError}
                onSave={handleSaveCategory}
                onCancel={() => setEditing(null)}
              />
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
