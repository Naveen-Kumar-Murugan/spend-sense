import { PAYMENT_METHODS, PAYMENT_METHOD_ORDER } from '@/constants/categories';
import type { PaymentMethod } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export function PaymentMethodPicker({ value, onChange }: Props) {
  return (
    <fieldset>
      <legend className="mb-1.5 block text-[13px] font-semibold text-ink-soft">Payment method</legend>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {PAYMENT_METHOD_ORDER.map((method) => {
          const meta = PAYMENT_METHODS[method];
          const selected = value === method;
          return (
            <button
              key={method}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(method)}
              className={cn(
                'flex flex-col items-start gap-2 rounded-xl border px-3.5 py-3 text-left transition-colors',
                selected
                  ? 'border-primary bg-primary-50/60 ring-2 ring-primary/15'
                  : 'border-line bg-white hover:border-primary/40',
              )}
            >
              <meta.icon
                className={cn('h-[18px] w-[18px]', selected ? 'text-primary' : 'text-ink-faint')}
                strokeWidth={2.2}
                aria-hidden
              />
              <span className="text-[13px] font-bold text-ink">{meta.label}</span>
              <span className="text-[11px] leading-tight text-ink-muted">{meta.hint}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
