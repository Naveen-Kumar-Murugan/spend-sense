import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/common/Logo';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_46%]">
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Logo />
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">
          <h1 className="text-[30px] font-extrabold leading-tight tracking-[-0.03em] text-ink">{title}</h1>
          <p className="mt-2 text-sm text-ink-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-sm text-ink-muted">{footer}</div>}
        </div>
        <p className="text-xs text-ink-faint">
          © {new Date().getFullYear()} SpendSense Inc. ·{' '}
          <Link to="/" className="hover:text-ink-muted">
            Back to home
          </Link>
        </p>
      </div>

      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary-600 to-violet-700 lg:block">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" aria-hidden />
        <div className="absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-white/5" aria-hidden />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <p className="max-w-sm text-[26px] font-extrabold leading-snug tracking-[-0.02em]">
            Every rupee accounted for, every trend explained.
          </p>
          <div className="space-y-5">
            <div className="rounded-2xl bg-white/12 p-5 backdrop-blur">
              <p className="text-xs font-semibold text-white/70">Spent this month</p>
              <p className="tnum mt-1 text-3xl font-extrabold">₹52,480</p>
              <p className="mt-1 text-xs text-white/70">Food leads at ₹14,220 across 21 payments</p>
            </div>
            <p className="flex items-center gap-2 text-sm text-white/80">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Bank-grade encryption. Your data stays yours.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
