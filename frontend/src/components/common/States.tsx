import type { ReactNode } from 'react';
import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-sunken text-ink-faint">
        {icon ?? <Inbox className="h-5 w-5" aria-hidden />}
      </span>
      <p className="text-[15px] font-bold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}
    >
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-danger">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </span>
      <p className="text-[15px] font-bold text-ink">That did not load</p>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" aria-hidden />
          Try again
        </Button>
      )}
    </div>
  );
}

export function CardSkeleton({ className, lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={cn('card-surface p-5 sm:p-6', className)}>
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-4 h-8 w-40" />
      <div className="mt-5 space-y-2.5">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton key={index} className="h-3 w-full" />
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-line">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 px-5 py-4 sm:px-6">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
