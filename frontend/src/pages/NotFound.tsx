import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary">
        <Compass className="h-6 w-6" aria-hidden />
      </span>
      <h1 className="mt-6 text-2xl font-extrabold tracking-[-0.02em] text-ink">
        This page does not exist
      </h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        The link may be out of date. Your dashboard is one click away.
      </p>
      <div className="mt-7 flex gap-3">
        <Button asChild>
          <Link to="/app">Go to dashboard</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
