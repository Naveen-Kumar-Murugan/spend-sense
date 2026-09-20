import type * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { confirmPasswordReset, requestPasswordReset } from '@/services/auth';
import { toUserMessage } from '@/services/errors';
import { validateEmail, validatePassword } from '@/utils/validation';

const RULES = [
  { label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { label: 'One lowercase letter', test: (value: string) => /[a-z]/.test(value) },
  { label: 'One number', test: (value: string) => /[0-9]/.test(value) },
];

export default function ForgotPassword() {
  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const handleRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailError = validateEmail(email);
    setError(emailError);
    if (emailError) return;

    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setStep('reset');
    } catch (cause) {
      setError(toUserMessage(cause));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const passwordError = validatePassword(password, 'signup');
    if (code.trim().length < 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    setError(passwordError);
    if (passwordError) return;

    setSubmitting(true);
    try {
      await confirmPasswordReset(email, code, password);
      setStep('done');
    } catch (cause) {
      setError(toUserMessage(cause));
    } finally {
      setSubmitting(false);
    }
  };

  const titles = {
    request: 'Reset your password',
    reset: 'Choose a new password',
    done: 'Password updated',
  } as const;

  const subtitles = {
    request: 'Enter the email on your account and we will send a reset code.',
    reset: `We sent a 6-digit code to ${email}. Enter it with your new password.`,
    done: 'You can sign in with your new password now.',
  } as const;

  return (
    <AuthLayout
      title={titles[step]}
      subtitle={subtitles[step]}
      footer={
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      {step === 'request' && (
        <form onSubmit={handleRequest} noValidate className="space-y-5">
          <div>
            <Label htmlFor="reset-email">Email address</Label>
            <Input
              id="reset-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(error)}
            />
            {error && (
              <p role="alert" className="mt-1.5 text-[13px] text-danger">
                {error}
              </p>
            )}
          </div>
          <Button type="submit" size="lg" className="w-full" loading={submitting}>
            Send reset code
          </Button>
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={handleReset} noValidate className="space-y-5">
          <div>
            <Label htmlFor="reset-code">Reset code</Label>
            <Input
              id="reset-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="tnum text-center text-lg font-bold tracking-[0.4em]"
            />
          </div>

          <div>
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <ul className="mt-2.5 space-y-1.5">
              {RULES.map((rule) => (
                <li
                  key={rule.label}
                  className={`flex items-center gap-2 text-xs ${
                    rule.test(password) ? 'text-mint-dark' : 'text-ink-faint'
                  }`}
                >
                  <Check className="h-3.5 w-3.5" aria-hidden />
                  {rule.label}
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-[13px] text-danger">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" loading={submitting}>
            Update password
          </Button>
        </form>
      )}

      {step === 'done' && (
        <Button asChild size="lg" className="w-full">
          <Link to="/login">Sign in</Link>
        </Button>
      )}
    </AuthLayout>
  );
}
