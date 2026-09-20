import type * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, RotateCcw, ShieldCheck, UserRound } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { toUserMessage } from '@/services/errors';
import { resetMockData } from '@/services/mock/store';
import { config } from '@/services/config';
import { UPI_ID_PATTERN } from '@/utils/validation';
import { cn } from '@/lib/utils';

type Section = 'profile' | 'preferences' | 'security';

const SECTIONS: Array<{ id: Section; label: string; icon: typeof UserRound }> = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'preferences', label: 'Preferences', icon: Bell },
  { id: 'security', label: 'Security', icon: ShieldCheck },
];

export default function Settings() {
  const { user, updateProfile, logout } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [section, setSection] = useState<Section>('profile');
  const [draft, setDraft] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    upiId: user?.upiId ?? '',
  });
  const [upiError, setUpiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    emailSummaries: true,
    spendAlerts: true,
    recurringReminders: false,
  });

  if (!user) return null;

  const dirty =
    draft.firstName !== user.firstName ||
    draft.lastName !== user.lastName ||
    draft.email !== user.email ||
    draft.upiId !== (user.upiId ?? '');

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedUpi = draft.upiId.trim();
    if (trimmedUpi && !UPI_ID_PATTERN.test(trimmedUpi)) {
      setUpiError('Enter a valid UPI ID, e.g. naveen@oksbi.');
      return;
    }
    setUpiError(null);
    setSaving(true);
    try {
      await updateProfile({ ...draft, upiId: trimmedUpi || undefined });
      notify('Profile updated.');
    } catch (cause) {
      notify(toUserMessage(cause), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" description="Manage your profile, alerts and session." />

      <div className="grid gap-5 lg:grid-cols-[232px_1fr] lg:items-start">
        <nav aria-label="Settings sections" className="lg:sticky lg:top-24">
          <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {SECTIONS.map((item) => (
              <li key={item.id} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  onClick={() => setSection(item.id)}
                  aria-current={section === item.id ? 'page' : undefined}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[14px] font-semibold transition-colors',
                    section === item.id
                      ? 'bg-white text-primary shadow-card'
                      : 'text-ink-muted hover:bg-white/60 hover:text-ink',
                  )}
                >
                  <item.icon className="h-[18px] w-[18px]" strokeWidth={2.2} aria-hidden />
                  {item.label}
                </button>
              </li>
            ))}
            <li className="shrink-0 lg:shrink lg:pt-2">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[14px] font-semibold text-danger transition-colors hover:bg-red-50"
              >
                <LogOut className="h-[18px] w-[18px]" strokeWidth={2.2} aria-hidden />
                Sign out
              </button>
            </li>
          </ul>
        </nav>

        <div className="space-y-5">
          {section === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Personal profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <UserAvatar user={user} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-[17px] font-extrabold tracking-[-0.02em] text-ink">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="truncate text-[13px] text-ink-muted">
                      {user.email}
                      {user.location ? ` · ${user.location}` : ''}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Badge tone="primary">{user.plan === 'PREMIUM' ? 'Premium' : 'Free'}</Badge>
                      {user.emailVerified && <Badge tone="mint">Verified</Badge>}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSave} className="mt-7 space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="first-name">First name</Label>
                      <Input
                        id="first-name"
                        value={draft.firstName}
                        onChange={(event) => setDraft({ ...draft, firstName: event.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="last-name">Last name</Label>
                      <Input
                        id="last-name"
                        value={draft.lastName}
                        onChange={(event) => setDraft({ ...draft, lastName: event.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="settings-email">Email address</Label>
                    <Input
                      id="settings-email"
                      type="email"
                      value={draft.email}
                      onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="settings-upi">Your UPI ID (optional)</Label>
                    <Input
                      id="settings-upi"
                      value={draft.upiId}
                      onChange={(event) => {
                        setUpiError(null);
                        setDraft({ ...draft, upiId: event.target.value });
                      }}
                      placeholder="naveen@oksbi"
                      autoCapitalize="none"
                      autoCorrect="off"
                      aria-invalid={Boolean(upiError)}
                    />
                    {upiError ? (
                      <p role="alert" className="mt-1.5 text-[13px] text-danger">
                        {upiError}
                      </p>
                    ) : (
                      <p className="mt-1.5 text-xs text-ink-faint">
                        Your own UPI VPA (like naveen@oksbi), saved with your profile. SpendSense
                        never asks for your UPI PIN.
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 border-t border-line pt-5">
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={!dirty || saving}
                      onClick={() =>
                        setDraft({
                          firstName: user.firstName,
                          lastName: user.lastName,
                          email: user.email,
                          upiId: user.upiId ?? '',
                        })
                      }
                    >
                      Discard changes
                    </Button>
                    <Button type="submit" loading={saving} disabled={!dirty}>
                      Save changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {section === 'preferences' && (
            <Card>
              <CardHeader>
                <CardTitle>App preferences</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-line">
                <PreferenceRow
                  id="email-summaries"
                  title="Weekly email summary"
                  description="A short recap of where your money went each week."
                  checked={preferences.emailSummaries}
                  onCheckedChange={(checked) =>
                    setPreferences((current) => ({ ...current, emailSummaries: checked }))
                  }
                />
                <PreferenceRow
                  id="spend-alerts"
                  title="Unusual spending alerts"
                  description="Tell me when a payment is far above my usual amount."
                  checked={preferences.spendAlerts}
                  onCheckedChange={(checked) =>
                    setPreferences((current) => ({ ...current, spendAlerts: checked }))
                  }
                />
                <PreferenceRow
                  id="recurring-reminders"
                  title="Subscription reminders"
                  description="Nudge me three days before a recurring charge renews."
                  checked={preferences.recurringReminders}
                  onCheckedChange={(checked) =>
                    setPreferences((current) => ({ ...current, recurringReminders: checked }))
                  }
                />
              </CardContent>
            </Card>
          )}

          {section === 'security' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[13px] leading-relaxed text-ink-muted">
                  <p>
                    Sign-in is handled by Amazon Cognito. Your password never reaches SpendSense servers,
                    and API requests carry a short-lived token rather than your credentials.
                  </p>
                  <p className="rounded-xl bg-surface-sunken px-4 py-3">
                    Current mode:{' '}
                    <span className="font-semibold text-ink">
                      {config.useMocks ? 'Local demo data' : `Live API · ${config.apiUrl}`}
                    </span>
                  </p>
                  <Button variant="secondary" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" aria-hidden />
                    Sign out of this device
                  </Button>
                </CardContent>
              </Card>

              {config.useMocks && (
                <Card>
                  <CardHeader>
                    <CardTitle>Demo data</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-[13px] text-ink-muted">
                    <p>
                      Payments you record are stored in this browser. Reset to return to the original six
                      months of sample history.
                    </p>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        resetMockData();
                        notify('Demo data reset.');
                        window.setTimeout(() => window.location.reload(), 600);
                      }}
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden />
                      Reset demo data
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PreferenceRow({
  id,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4 first:pt-0 last:pb-0">
      <div>
        <Label htmlFor={id} className="mb-0.5 text-[14px] font-bold text-ink">
          {title}
        </Label>
        <p className="text-[13px] text-ink-muted">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
