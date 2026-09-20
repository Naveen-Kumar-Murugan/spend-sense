import type * as React from 'react';
import { useMemo, useState } from 'react';
import { IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CATEGORY_META, CATEGORY_ORDER, QUICK_MERCHANTS } from '@/constants/categories';
import { MAX_NOTE_LENGTH } from '@/constants';
import type { Category, PaymentMethod } from '@/types';
import { hasErrors, validatePaymentForm, type FieldErrors, type PaymentFormValues } from '@/utils/validation';
import { titleCase } from '@/utils/format';
import { cn } from '@/lib/utils';
import { PaymentMethodPicker } from './PaymentMethodPicker';

export interface PaymentSubmitValues {
  amount: number;
  merchant: string;
  category: Category;
  subcategory: string;
  paymentMethod: PaymentMethod;
  note?: string;
  mode: 'DEMO' | 'UPI';
}

interface Props {
  submitting: boolean;
  error?: string | null;
  onSubmit: (values: PaymentSubmitValues) => void;
}

const INITIAL: PaymentFormValues = {
  amount: '',
  merchant: '',
  category: '',
  subcategory: '',
  paymentMethod: 'UPI',
  note: '',
};

const QUICK_AMOUNTS = [199, 499, 1000, 2500];

export function PaymentForm({ submitting, error, onSubmit }: Props) {
  const [values, setValues] = useState<PaymentFormValues>(INITIAL);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<'DEMO' | 'UPI'>('DEMO');

  const errors: FieldErrors<PaymentFormValues> = useMemo(() => validatePaymentForm(values), [values]);
  const showError = (field: keyof PaymentFormValues): string | undefined =>
    touched[field] ? errors[field] : undefined;

  const set = (patch: Partial<PaymentFormValues>) => setValues((current) => ({ ...current, ...patch }));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ amount: true, merchant: true, category: true, subcategory: true, note: true });
    if (hasErrors(errors) || !values.category) return;

    onSubmit({
      amount: Number(values.amount),
      merchant: values.merchant.trim(),
      category: values.category,
      subcategory: values.subcategory || CATEGORY_META[values.category].subcategories[0],
      paymentMethod: values.paymentMethod,
      note: values.note.trim() || undefined,
      mode,
    });
  };

  const subcategories = values.category ? CATEGORY_META[values.category].subcategories : [];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-7">
      <fieldset disabled={submitting} className="space-y-7">
        <legend className="sr-only">Payment details</legend>

        <div>
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <IndianRupee
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint"
              aria-hidden
            />
            <input
              id="amount"
              inputMode="decimal"
              value={values.amount}
              onChange={(event) => set({ amount: event.target.value.replace(/[^\d.]/g, '') })}
              onBlur={() => setTouched((t) => ({ ...t, amount: true }))}
              placeholder="0"
              aria-invalid={Boolean(showError('amount'))}
              aria-describedby={showError('amount') ? 'amount-error' : undefined}
              className={cn(
                'tnum h-16 w-full rounded-2xl border border-line bg-surface-sunken pl-12 pr-4 text-3xl font-extrabold tracking-[-0.03em] text-ink',
                'placeholder:text-ink-faint focus:border-primary/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15',
                showError('amount') && 'border-danger/60 focus:ring-danger/20',
              )}
            />
          </div>
          {showError('amount') ? (
            <p id="amount-error" role="alert" className="mt-1.5 text-[13px] text-danger">
              {showError('amount')}
            </p>
          ) : (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => set({ amount: String(amount) })}
                  className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:border-primary/40 hover:text-primary"
                >
                  ₹{amount.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="merchant">Paying</Label>
          <Input
            id="merchant"
            value={values.merchant}
            onChange={(event) => set({ merchant: event.target.value })}
            onBlur={() => setTouched((t) => ({ ...t, merchant: true }))}
            placeholder="Swiggy, Uber, Airtel…"
            aria-invalid={Boolean(showError('merchant'))}
            autoComplete="off"
          />
          {showError('merchant') && (
            <p role="alert" className="mt-1.5 text-[13px] text-danger">
              {showError('merchant')}
            </p>
          )}
          <div className="mt-2.5 flex flex-wrap gap-2">
            {QUICK_MERCHANTS.map((item) => (
              <button
                key={item.merchant}
                type="button"
                onClick={() =>
                  set({ merchant: item.merchant, category: item.category, subcategory: item.subcategory })
                }
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                  values.merchant === item.merchant
                    ? 'border-primary bg-primary-50 text-primary-700'
                    : 'border-line text-ink-muted hover:border-primary/40 hover:text-primary',
                )}
              >
                {item.merchant}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              id="category"
              value={values.category}
              onChange={(event) => {
                const next = event.target.value as Category;
                set({ category: next, subcategory: next ? CATEGORY_META[next].subcategories[0] : '' });
              }}
              onBlur={() => setTouched((t) => ({ ...t, category: true }))}
              aria-invalid={Boolean(showError('category'))}
            >
              <option value="">Choose a category</option>
              {CATEGORY_ORDER.map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_META[category].label}
                </option>
              ))}
            </Select>
            {showError('category') && (
              <p role="alert" className="mt-1.5 text-[13px] text-danger">
                {showError('category')}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="subcategory">Sub-category</Label>
            <Select
              id="subcategory"
              value={values.subcategory}
              onChange={(event) => set({ subcategory: event.target.value })}
              disabled={!values.category}
            >
              {subcategories.length === 0 && <option value="">Pick a category first</option>}
              {subcategories.map((option) => (
                <option key={option} value={option}>
                  {titleCase(option)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <PaymentMethodPicker
          value={values.paymentMethod}
          onChange={(paymentMethod) => set({ paymentMethod })}
        />

        <div>
          <Label htmlFor="note">Note (optional)</Label>
          <Textarea
            id="note"
            value={values.note}
            maxLength={MAX_NOTE_LENGTH}
            onChange={(event) => set({ note: event.target.value })}
            placeholder="What was this for?"
          />
          <p className="mt-1.5 text-xs text-ink-faint">
            {values.note.length}/{MAX_NOTE_LENGTH}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-surface-sunken/70 p-4">
          <p className="text-[13px] font-bold text-ink">How should this be paid?</p>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {(['DEMO', 'UPI'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                aria-pressed={mode === option}
                className={cn(
                  'rounded-xl border bg-white px-3.5 py-3 text-left transition-colors',
                  mode === option ? 'border-primary ring-2 ring-primary/15' : 'border-line hover:border-primary/40',
                )}
              >
                <span className="block text-[13px] font-bold text-ink">
                  {option === 'DEMO' ? 'Record it here' : 'Open my UPI app'}
                </span>
                <span className="mt-0.5 block text-xs text-ink-muted">
                  {option === 'DEMO'
                    ? 'Logs the payment straight away'
                    : 'Creates a UPI link, stays pending until you confirm'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-[13px] text-danger">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" loading={submitting}>
        {submitting ? 'Processing…' : mode === 'UPI' ? 'Create UPI request' : 'Pay now'}
      </Button>
    </form>
  );
}
