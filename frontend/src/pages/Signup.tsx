import type * as React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, MailCheck } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { ApiError, toUserMessage } from '@/services/errors';
import { validateEmail, validatePassword } from '@/utils/validation';

/** Mirrors the Cognito user pool password policy exactly. */
const RULES = [
  { label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { label: 'One lowercase letter', test: (value: string) => /[a-z]/.test(value) },
  { label: 'One number', test: (value: string) => /[0-9]/.test(value) },
];

export default function Signup() {
  const { signUp, confirmSignUp, resendCode } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'details' | 'confirm'>('details');
  const [values, setValues] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  const set = (patch: Partial<typeof values>) => setValues((current) => ({ ...current, ...patch }));

  const handleDetails = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string | undefined> = {
      firstName: values.firstName.trim() ? undefined : 'Tell us your first name.',
      lastName: values.lastName.trim() ? undefined : 'Tell us your last name.',
      email: validateEmail(values.email),
      password: validatePassword(values.password, 'signup'),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    setFormError(null);
    try {
      const { needsConfirmation } = await signUp(values);
      if (needsConfirmation) {
        setStep('confirm');
      } else {
        navigate('/app', { replace: true });
      }
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === 'UsernameExistsException') {
        setFormError('An account already exists with that email. Sign in instead.');
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
      setCodeError('Enter the 6-digit code from your email.');
      return;
    }

    setSubmitting(true);
    setCodeError(null);
    try {
      await confirmSignUp(values.email, code, values.password);
      navigate('/app', { replace: true });
    } catch (cause) {
      setCodeError(toUserMessage(cause));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setCodeError(null);
    try {
      await resendCode(values.email);
      setResent(true);
    } catch (cause) {
      setCodeError(toUserMessage(cause));
    }
  };

  if (step === 'confirm') {
    return (
      <AuthLayout
        title="Confirm your email"
        subtitle={`We sent a 6-digit code to ${values.email}. Enter it to activate your account.`}
        footer={
          <button
            type="button"
            onClick={() => setStep('details')}
            className="font-semibold text-primary hover:underline"
          >
            Use a different email
          </button>
        }
      >
        <form onSubmit={handleConfirm} noValidate className="space-y-5">
          <div>
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="tnum text-center text-lg font-bold tracking-[0.4em]"
              aria-invalid={Boolean(codeError)}
            />
            {codeError && (
              <p role="alert" className="mt-1.5 text-[13px] text-danger">
                {codeError}
              </p>
            )}
          </div>

          <Button type="submit" size="lg" className="w-full" loading={submitting}>
            Confirm and continue
          </Button>

          <div className="flex items-center gap-2 text-[13px] text-ink-muted">
            {resent ? (
              <>
                <MailCheck className="h-4 w-4 text-mint-dark" aria-hidden />
                New code sent.
              </>
            ) : (
              <>
                No code yet?
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-semibold text-primary hover:underline"
                >
                  Send a new one
                </button>
              </>
            )}
          </div>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Two minutes to set up. No card, no commitment."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleDetails} noValidate className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              autoComplete="given-name"
              value={values.firstName}
              onChange={(event) => set({ firstName: event.target.value })}
              aria-invalid={Boolean(errors.firstName)}
            />
            {errors.firstName && (
              <p role="alert" className="mt-1.5 text-[13px] text-danger">
                {errors.firstName}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              autoComplete="family-name"
              value={values.lastName}
              onChange={(event) => set({ lastName: event.target.value })}
              aria-invalid={Boolean(errors.lastName)}
            />
            {errors.lastName && (
              <p role="alert" className="mt-1.5 text-[13px] text-danger">
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="signup-email">Email address</Label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => set({ email: event.target.value })}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && (
            <p role="alert" className="mt-1.5 text-[13px] text-danger">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(event) => set({ password: event.target.value })}
            aria-invalid={Boolean(errors.password)}
          />
          <ul className="mt-2.5 space-y-1.5">
            {RULES.map((rule) => {
              const met = rule.test(values.password);
              return (
                <li
                  key={rule.label}
                  className={`flex items-center gap-2 text-xs ${met ? 'text-mint-dark' : 'text-ink-faint'}`}
                >
                  <Check className="h-3.5 w-3.5" aria-hidden />
                  {rule.label}
                </li>
              );
            })}
          </ul>
        </div>

        {formError && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-[13px] text-danger">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
