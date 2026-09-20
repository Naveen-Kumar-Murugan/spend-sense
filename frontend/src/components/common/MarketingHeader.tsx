import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { MARKETING_NAV } from '@/constants/navigation';

export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center gap-6 px-5 sm:px-8">
        <Logo />

        <nav aria-label="Marketing" className="ml-6 hidden items-center gap-7 md:flex">
          {MARKETING_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <Link
            to="/login"
            className="hidden text-[13px] font-semibold text-ink transition-colors hover:text-primary sm:block"
          >
            Sign in
          </Link>
          <Button asChild size="sm" className="bg-ink text-white shadow-none hover:bg-ink-soft">
            <Link to="/login">Go to app</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-lg p-2 text-ink-muted md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Marketing" className="border-t border-line bg-white px-5 py-3 md:hidden">
          <ul className="space-y-1">
            {MARKETING_NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-2.5 text-sm font-semibold text-ink-soft hover:bg-surface-sunken"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                to="/login"
                className="block rounded-lg px-2 py-2.5 text-sm font-semibold text-primary hover:bg-surface-sunken"
              >
                Sign in
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
