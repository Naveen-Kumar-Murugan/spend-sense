import { ArrowUpRight, PieChart, Repeat2, Sparkles, type LucideIcon } from 'lucide-react';
import type { Insight, InsightType } from '@/types';
import { cn } from '@/lib/utils';

const TYPE_META: Record<InsightType, { icon: LucideIcon; tile: string; label: string }> = {
  CATEGORY: { icon: PieChart, tile: 'bg-primary-50 text-primary', label: 'Category' },
  TREND: { icon: ArrowUpRight, tile: 'bg-amber-50 text-amber-600', label: 'Trend' },
  RECURRING: { icon: Repeat2, tile: 'bg-violet-50 text-violet-600', label: 'Recurring' },
  SUMMARY: { icon: Sparkles, tile: 'bg-mint-soft text-mint-dark', label: 'Summary' },
};

interface InsightCardProps {
  insight: Insight;
  className?: string;
  compact?: boolean;
}

export function InsightCard({ insight, className, compact = false }: InsightCardProps) {
  const meta = TYPE_META[insight.type];
  const Icon = meta.icon;

  return (
    <article
      className={cn(
        'rounded-2xl border border-line bg-white p-4 transition-shadow hover:shadow-card sm:p-5',
        className,
      )}
    >
      <div className="flex items-start gap-3.5">
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', meta.tile)} aria-hidden>
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <p className="text-[14px] font-bold leading-snug text-ink">{insight.title}</p>
          <p className={cn('mt-1 text-[13px] leading-relaxed text-ink-muted', compact && 'line-clamp-3')}>
            {insight.detail}
          </p>
        </div>
      </div>
    </article>
  );
}
