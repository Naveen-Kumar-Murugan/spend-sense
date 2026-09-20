import { Link } from 'react-router-dom';

export function MarketingFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-3 px-5 py-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>© {new Date().getFullYear()} SpendSense Inc. All rights reserved.</p>
        <nav aria-label="Legal" className="flex gap-6">
          <Link to="/" className="transition-colors hover:text-ink-muted">
            Privacy policy
          </Link>
          <Link to="/" className="transition-colors hover:text-ink-muted">
            Terms of service
          </Link>
          <Link to="/" className="transition-colors hover:text-ink-muted">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
