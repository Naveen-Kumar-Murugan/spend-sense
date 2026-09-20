import type * as React from 'react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Pencil } from 'lucide-react';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CardSkeleton, ErrorState } from '@/components/common/States';
import { CategoryEditor } from '@/components/transactions/CategoryEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useToast } from '@/hooks/useToast';
import { getTransaction, updateTransaction } from '@/services/api';
import { toUserMessage } from '@/services/errors';
import { CATEGORY_META } from '@/constants/categories';
import { MAX_NOTE_LENGTH } from '@/constants';
import type { Category, Transaction } from '@/types';
import { formatCurrency, formatDateTime, titleCase } from '@/utils/format';

export default function TransactionDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notify } = useToast();

  const { data, loading, error, refresh, setData } = useAsyncData<Transaction>(
    () => getTransaction(id),
    [id],
  );

  const [editingCategory, setEditingCategory] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const noteValue = note ?? data?.note ?? '';
  const noteChanged = data ? noteValue !== (data.note ?? '') : false;

  const saveCategory = async (category: Category, subcategory: string) => {
    if (!data) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateTransaction(data.transactionId, { category, subcategory });
      setData(updated);
      setEditingCategory(false);
      notify(`Filed under ${CATEGORY_META[updated.category].label.toLowerCase()}.`);
    } catch (cause) {
      setSaveError(toUserMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  const saveNote = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const updated = await updateTransaction(data.transactionId, { note: noteValue });
      setData(updated);
      setNote(null);
      notify('Note saved.');
    } catch (cause) {
      notify(toUserMessage(cause), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back
      </button>

      {loading && <CardSkeleton lines={6} />}

      {!loading && error && (
        <Card>
          <ErrorState message={error} onRetry={refresh} />
          <div className="flex justify-center pb-6">
            <Button asChild variant="secondary" size="sm">
              <Link to="/app/transactions">All transactions</Link>
            </Button>
          </div>
        </Card>
      )}

      {data && (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <Card>
            <CardContent className="pt-6 sm:pt-7">
              <div className="flex items-start gap-4">
                <CategoryIcon category={data.category} size="lg" />
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-xl font-extrabold tracking-[-0.02em] text-ink">
                    {data.merchant}
                  </h1>
                  <p className="mt-1 text-[13px] text-ink-muted">{formatDateTime(data.createdAt)}</p>
                </div>
                <StatusBadge status={data.status} />
              </div>

              <p className="tnum mt-6 text-[38px] font-extrabold tracking-[-0.035em] text-ink">
                {formatCurrency(data.amount, { decimals: true })}
              </p>

              <dl className="mt-6 divide-y divide-line border-t border-line">
                <DetailRow label="Category" value={`${CATEGORY_META[data.category].label} · ${titleCase(data.subcategory)}`} />
                <DetailRow label="Payment method" value={titleCase(data.paymentMethod)} />
                <DetailRow label="Currency" value={data.currency} />
                <DetailRow label="Last updated" value={formatDateTime(data.updatedAt)} />
                <DetailRow
                  label="Reference"
                  value={
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(data.transactionId);
                        notify('Reference copied.');
                      }}
                      className="tnum inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-primary"
                    >
                      {data.transactionId}
                      <Copy className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  }
                />
              </dl>

              <div className="mt-6">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  value={noteValue}
                  maxLength={MAX_NOTE_LENGTH}
                  placeholder="Add a note so future-you remembers what this was."
                  onChange={(event) => setNote(event.target.value)}
                />
                {noteChanged && (
                  <div className="mt-3 flex gap-2.5">
                    <Button size="sm" loading={saving} onClick={saveNote}>
                      Save note
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setNote(null)} disabled={saving}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
              {!editingCategory && (
                <Button variant="ghost" size="sm" onClick={() => setEditingCategory(true)}>
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {editingCategory ? (
                <CategoryEditor
                  transaction={data}
                  saving={saving}
                  error={saveError}
                  onSave={saveCategory}
                  onCancel={() => setEditingCategory(false)}
                />
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-surface-sunken/70 p-4">
                  <CategoryIcon category={data.category} />
                  <div>
                    <p className="text-[14px] font-bold text-ink">
                      {CATEGORY_META[data.category].label}
                    </p>
                    <p className="text-xs text-ink-muted">{titleCase(data.subcategory)}</p>
                  </div>
                </div>
              )}

              <Button asChild variant="secondary" className="mt-5 w-full">
                <Link to={`/app/transactions?search=${encodeURIComponent(data.merchant)}`}>
                  All payments to {data.merchant}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <dt className="text-[13px] text-ink-muted">{label}</dt>
      <dd className="text-right text-[13px] font-semibold text-ink">{value}</dd>
    </div>
  );
}
