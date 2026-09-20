import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Banknote,
  Building2,
  Droplet,
  Gem,
  Layers,
  Leaf,
  LineChart,
  Lock,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { MarketingHeader } from '@/components/common/MarketingHeader';
import { MarketingFooter } from '@/components/common/MarketingFooter';
import { Button } from '@/components/ui/button';

const FEATURES = [
  {
    icon: Layers,
    tile: 'bg-primary-50 text-primary',
    title: 'Every account, one view',
    body: 'Bank, card and UPI activity arrive in the same place, categorised the moment they land.',
  },
  {
    icon: LineChart,
    tile: 'bg-mint-soft text-mint-dark',
    title: 'Spending it can explain',
    body: 'SpendSense reads your history and tells you what moved — in a sentence, not a spreadsheet.',
  },
  {
    icon: Gem,
    tile: 'bg-amber-50 text-amber-500',
    title: 'Habits worth keeping',
    body: 'Recurring charges, creeping categories and one-off spikes surface before they become a pattern.',
  },
];

const TRUST_ICONS = [Building2, Leaf, Zap, Banknote, Droplet];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary-50/50 to-white">
          <div className="mx-auto grid w-full max-w-[1180px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-ink-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                THE FUTURE OF PRIVATE WEALTH
              </span>

              <h1 className="mt-6 text-[44px] font-extrabold leading-[1.04] tracking-[-0.045em] text-ink sm:text-[64px]">
                Precision
                <br />
                <em className="font-extrabold italic text-primary">Wealth</em>
                <br />
                Management.
              </h1>

              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-muted">
                SpendSense is a high-performance financial operating system for the modern achiever.
                Experience absolute clarity in every transaction.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-6">
                <Button asChild size="lg">
                  <Link to="/login">
                    Launch app
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>

                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2.5" aria-hidden>
                    {['from-amber-300 to-rose-300', 'from-sky-300 to-indigo-300', 'from-emerald-300 to-teal-300'].map(
                      (gradient) => (
                        <span
                          key={gradient}
                          className={`h-9 w-9 rounded-full bg-gradient-to-br ${gradient} ring-2 ring-white`}
                        />
                      ),
                    )}
                  </div>
                  <p className="text-xs font-semibold leading-tight text-ink-muted">
                    Trusted by <span className="text-primary">12k+</span>
                    <br />
                    entrepreneurs
                  </p>
                </div>
              </div>
            </div>

            <HeroPreview />
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-y border-line bg-white" id="platform">
          <div className="mx-auto w-full max-w-[1180px] px-5 py-10 text-center sm:px-8">
            <p className="text-[11px] font-bold tracking-[0.18em] text-ink-faint">
              TRUSTED BY FORWARD-THINKING TEAMS
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-12 text-ink-faint/70">
              {TRUST_ICONS.map((Icon, index) => (
                <Icon key={index} className="h-6 w-6" strokeWidth={1.6} aria-hidden />
              ))}
            </div>
          </div>
        </section>

        {/* Core ecosystem */}
        <section className="mx-auto w-full max-w-[1180px] px-5 py-20 sm:px-8 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
            <div>
              <p className="text-[11px] font-bold tracking-[0.18em] text-primary">CORE ECOSYSTEM</p>
              <h2 className="mt-4 text-[34px] font-extrabold leading-[1.1] tracking-[-0.035em] text-ink sm:text-[42px]">
                Engineered for absolute
                <br />
                <span className="text-primary">financial</span> command.
              </h2>
            </div>
            <p className="max-w-sm text-[15px] leading-relaxed text-ink-muted lg:pb-3">
              We stripped away the noise to build a tool that honours your time and your intelligence.
            </p>
          </div>

          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <article key={feature.title}>
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${feature.tile}`}
                  aria-hidden
                >
                  <feature.icon className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <h3 className="mt-5 text-[17px] font-extrabold tracking-[-0.02em] text-ink">
                  {feature.title}
                </h3>
                <p className="mt-2.5 text-[13px] leading-relaxed text-ink-muted">{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Philosophy */}
        <section id="vision" className="bg-surface-sunken">
          <div className="mx-auto grid w-full max-w-[1180px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-28">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-44 rounded-2xl bg-gradient-to-br from-slate-200 via-slate-100 to-white p-5 shadow-card">
                  <div className="h-full rounded-xl border border-white/80 bg-white/60 p-4">
                    <div className="h-2 w-16 rounded-full bg-slate-300" />
                    <div className="mt-3 h-2 w-24 rounded-full bg-slate-200" />
                    <div className="mt-6 flex items-end gap-2">
                      {[40, 62, 28, 74].map((height, index) => (
                        <div
                          key={index}
                          className="w-5 rounded-t-md bg-primary/70"
                          style={{ height: `${height}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-card">
                  <p className="text-2xl font-extrabold tracking-[-0.03em] text-primary">99.9%</p>
                  <p className="mt-1 text-[11px] font-bold tracking-[0.14em] text-ink-faint">
                    UPTIME RELIABILITY
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-10">
                <div className="rounded-2xl bg-white p-5 shadow-card">
                  <p className="text-2xl font-extrabold tracking-[-0.03em] text-mint-dark">24/7</p>
                  <p className="mt-1 text-[11px] font-bold tracking-[0.14em] text-ink-faint">
                    EXPERT SUPPORT
                  </p>
                </div>
                <div className="h-48 rounded-2xl bg-gradient-to-br from-primary-100 via-white to-amber-50 p-5 shadow-card">
                  <div className="flex h-full flex-col justify-between rounded-xl bg-white/70 p-4">
                    <div className="flex items-center gap-2">
                      <span className="h-7 w-7 rounded-lg bg-primary/15" />
                      <div className="h-2 w-20 rounded-full bg-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-full rounded-full bg-slate-200" />
                      <div className="h-2 w-4/5 rounded-full bg-slate-200" />
                      <div className="h-2 w-2/3 rounded-full bg-primary/30" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold tracking-[0.18em] text-primary">OUR PHILOSOPHY</p>
              <h2 className="mt-4 text-[34px] font-extrabold leading-[1.1] tracking-[-0.035em] text-ink sm:text-[40px]">
                Built by savers, for <em className="italic text-primary">achievers</em>.
              </h2>
              <p className="mt-6 text-[15px] leading-relaxed text-ink-muted">
                SpendSense started from a simple principle: financial freedom should not be a puzzle. When
                you understand your data, you own your future.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
                Our engineers and financial advisors spent two years building an engine that does not just
                track numbers — it interprets them, so you can move from surviving to thriving.
              </p>

              <div className="mt-8 flex flex-wrap gap-3" id="security">
                <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-[13px] font-semibold text-ink-soft">
                  <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                  Bank-grade security
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-[13px] font-semibold text-ink-soft">
                  <Lock className="h-4 w-4 text-primary" aria-hidden />
                  Privacy first
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="bg-gradient-to-b from-white to-primary-50/60">
          <div className="mx-auto w-full max-w-[720px] px-5 py-24 text-center sm:px-8">
            <h2 className="text-[34px] font-extrabold leading-[1.1] tracking-[-0.035em] text-ink sm:text-[42px]">
              Ready to redefine your relationship with <span className="text-primary">money</span>?
            </h2>
            <p className="mt-4 text-[15px] text-ink-muted">
              Join thousands of professionals managing their money with clarity.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-5">
              <Button asChild size="lg">
                <Link to="/signup">Get started — it's free</Link>
              </Button>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
              >
                Existing user? Sign in
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

/** Abstract product preview shown beside the hero copy. */
function HeroPreview() {
  return (
    <div className="relative">
      <div className="aspect-[4/3] w-full rounded-2xl bg-[#6EB0C2] p-6 sm:p-8">
        <div className="flex h-full flex-col justify-between rounded-xl bg-white/15 p-5 backdrop-blur-sm">
          <div>
            <p className="text-[11px] font-bold tracking-[0.16em] text-white/80">SPENT THIS MONTH</p>
            <p className="tnum mt-2 text-4xl font-extrabold tracking-[-0.03em] text-white">₹52,480</p>
            <p className="mt-2 text-xs text-white/85">Food leads at ₹14,220 across 21 payments</p>
          </div>

          <div className="flex items-end gap-2.5" aria-hidden>
            {[38, 56, 44, 72, 50, 88].map((height, index) => (
              <div
                key={index}
                className={`flex-1 rounded-t-lg ${index === 5 ? 'bg-white' : 'bg-white/45'}`}
                style={{ height: `${height}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 -left-4 w-56 rounded-2xl border border-line bg-white p-4 shadow-lift sm:-left-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint-soft text-mint-dark">
            <Leaf className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-ink">Netflix</p>
            <p className="text-[11px] text-ink-faint">Renews on the 3rd</p>
          </div>
        </div>
        <p className="tnum mt-3 text-[15px] font-extrabold text-ink">₹649.00</p>
      </div>

      <div className="absolute -right-2 top-6 hidden w-44 rounded-2xl border border-line bg-white p-3.5 shadow-lift sm:block">
        <p className="text-[11px] font-semibold text-ink-faint">Travel this month</p>
        <p className="tnum mt-1 text-[15px] font-extrabold text-ink">₹6,120</p>
        <p className="mt-1 text-[11px] font-semibold text-mint-dark">12% below your average</p>
      </div>
    </div>
  );
}
