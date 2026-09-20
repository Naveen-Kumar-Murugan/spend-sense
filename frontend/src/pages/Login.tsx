import type * as React from 'react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { ApiError, toUserMessage } from '@/services/errors';
import { isCognitoConfigured } from '@/services/config';
import { validateEmail, validatePassword } from '@/utils/validation';

interface LocationState {
  from?: string;
}

/** Cognito reports both of these when an account was never confirmed. */
const UNCONFIRMED = new Set(['CONFIRM_SIGN_UP', 'UserNotConfirmedException']);

export default function Login() {
  const { login, confirmSignUp, resendCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from ?? '/app';

  const demoMode = !isCognitoConfigured();
  const [email, setEmail] = useState(demoMode ? 'marcus.lee@example.com' : '');
  const [password, setPassword] = useState(demoMode ? 'spendsense' : '');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [code, setCode] = useState('');
  const [resent, setResent] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setSubmitting(true);
    setFormError(null);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (cause) {
      if (cause instanceof ApiError && UNCONFIRMED.has(cause.code)) {
        await resendCode(email).catch(() => undefined);
        setNeedsConfirmation(true);
        setResent(true);
      } else {
        setFormError(toUserMessage(cause));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.trim().length < 6) {
      setFormError('Enter the 6-digit code from your email.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await confirmSignUp(email, code, password);
      navigate(from, { replace: true });
    } catch (cause) {
      setFormError(toUserMessage(cause));
    } finally {
      setSubmitting(false);
    }
  };

  if (needsConfirmation) {
    return (
      <AuthLayout
        title="Confirm your email"
        subtitle={`This account was never verified. Enter the 6-digit code sent to ${email}.`}
        footer={
          <button
            type="button"
            onClick={() => setNeedsConfirmation(false)}
            className="font-semibold text-primary hover:underline"
          >
            Back to sign in
          </button>
        }
      >
        <form onSubmit={handleConfirm} noValidate className="space-y-5">
          <div>
            <Label htmlFor="login-code">Verification code</Label>
            <Input
              id="login-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="tnum text-center text-lg font-bold tracking-[0.4em]"
            />
          </div>

          {resent && (
            <p className="flex items-center gap-2 text-[13px] text-ink-muted">
              <MailCheck className="h-4 w-4 text-mint-dark" aria-hidden />
              A fresh code is on its way.
            </p>
          )}

          {formError && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-[13px] text-danger">
              {formError}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" loading={submitting}>
            Confirm and sign in
          </Button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to pick up where your money left off."
      footer={
        <>
          New to SpendSense?{' '}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && (
            <p role="alert" className="mt-1.5 text-[13px] text-danger">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="mb-1.5 text-[13px] font-semibold text-primary hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password && (
            <p role="alert" className="mt-1.5 text-[13px] text-danger">
              {errors.password}
            </p>
          )}
        </div>

        {formError && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-[13px] text-danger">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          Sign in
        </Button>

        {demoMode && (
          <p className="rounded-xl bg-surface-sunken px-4 py-3 text-xs leading-relaxed text-ink-muted">
            Demo mode is on — any email with a password of six or more characters signs you in. Set
            VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_USER_POOL_CLIENT_ID to use the real pool.
          </p>
        )}
      </form>
    </AuthLayout>
  );
}
