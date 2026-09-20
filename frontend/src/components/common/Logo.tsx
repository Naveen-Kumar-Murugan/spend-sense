import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/constants';

interface LogoProps {
  to?: string;
  className?: string;
  /** Hides the wordmark — used in the collapsed sidebar. */
  markOnly?: boolean;
  tone?: 'light' | 'dark';
}

export function Logo({ to = '/', className, markOnly = false, tone = 'light' }: LogoProps) {
  return (
    <Link to={to} className={cn('group inline-flex items-center gap-2.5', className)} aria-label={APP_NAME}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-pop">
        <span className="relative block h-3.5 w-5 rounded-[4px] bg-white">
          <span className="absolute inset-x-0 top-0 h-1.5 rounded-t-[4px] bg-primary-200" />
        </span>
      </span>
      {!markOnly && (
        <span
          className={cn(
            'text-[19px] font-extrabold tracking-[-0.02em]',
            tone === 'dark' ? 'text-white' : 'text-ink',
          )}
        >
          {APP_NAME}
        </span>
      )}
    </Link>
  );
}
