import { NavLink } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { APP_NAV } from '@/constants/navigation';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  /** Rendered inside the mobile drawer when true. */
  inDrawer?: boolean;
  onNavigate?: () => void;
}

export function AppSidebar({ inDrawer = false, onNavigate }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full w-full flex-col gap-8 border-r border-line bg-white px-4 py-5',
        !inDrawer && 'fixed inset-y-0 left-0 z-40 hidden w-[248px] lg:flex',
      )}
    >
      <div className="px-2">
        <Logo to="/app" />
      </div>

      <nav aria-label="Main" className="flex-1">
        <ul className="space-y-1">
          {APP_NAV.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-ink-muted hover:bg-surface-sunken hover:text-ink',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={cn('h-[18px] w-[18px]', isActive ? 'text-primary' : 'text-ink-faint')}
                      strokeWidth={2.2}
                      aria-hidden
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="rounded-2xl bg-gradient-to-br from-primary to-violet-500 p-4 text-white">
        <Sparkles className="h-5 w-5" aria-hidden />
        <p className="mt-3 text-[13px] font-bold leading-snug">Ask anything about your money</p>
        <p className="mt-1 text-xs leading-relaxed text-white/80">
          SpendSense reads your history and answers in plain language.
        </p>
        <Button asChild variant="secondary" size="sm" className="mt-3 w-full border-0 text-primary-700">
          <NavLink to="/app/ask" onClick={onNavigate}>
            Start a question
          </NavLink>
        </Button>
      </div>
    </aside>
  );
}
