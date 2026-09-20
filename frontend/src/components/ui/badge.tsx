import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none',
  {
    variants: {
      tone: {
        neutral: 'bg-surface-sunken text-ink-muted',
        primary: 'bg-primary-50 text-primary-700',
        mint: 'bg-mint-soft text-mint-dark',
        warn: 'bg-amber-50 text-amber-700',
        danger: 'bg-red-50 text-danger',
        outline: 'border border-line text-ink-muted',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
