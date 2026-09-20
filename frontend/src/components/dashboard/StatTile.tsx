import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface StatTileProps {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  iconClassName?: string;
  progress?: number;
  progressClassName?: string;
}

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  iconClassName,
  progress,
  progressClassName,
}: StatTileProps) {
  return (
    <Card className="flex flex-col justify-between p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-semibold text-ink-muted">{label}</p>
        <span
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary',
            iconClassName,
          )}
          aria-hidden
        >
          <Icon className="h-4 w-4" strokeWidth={2.2} />
        </span>
      </div>

      <p className="tnum mt-4 text-[26px] font-extrabold tracking-[-0.03em] text-ink">{value}</p>

      {progress !== undefined && (
        <Progress value={progress} className="mt-3" indicatorClassName={progressClassName} label={label} />
      )}
      <p className="mt-2 text-xs text-ink-muted">{hint}</p>
    </Card>
  );
}
