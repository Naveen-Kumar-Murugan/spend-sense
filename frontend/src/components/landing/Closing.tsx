import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Reveal, Section } from "./primitives";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Is SpendSense a bank or wallet?",
    a: "No. SpendSense is an analytics layer over your spending. It explains payments, tracks recurring charges, and helps you plan. It never moves or holds your money.",
  },
  {
    q: "Do I need to connect my bank?",
    a: "No. Start with manual entries or imports. Connections are optional and only reduce typing — never required to get value.",
  },
  {
    q: "How does the AI explain my spending?",
    a: "Transactions are grouped by merchant, category, and timing, then summarized in plain language: what changed, what drove it, and what to consider next.",
  },
  {
    q: "Is my financial data private?",
    a: "Yes. Data is encrypted in transit and at rest, access is scoped to the minimum, and nothing is sold or shared for ads. Export or delete everything anytime.",
  },
  {
    q: "Who is SpendSense for?",
    a: "Anyone who pays digitally and wants clarity — salaried professionals, freelancers, students, and families managing shared budgets.",
  },
];

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <Section id="faq" eyebrow="FAQ" title="Questions, answered.">
      <div className="mx-auto mt-10 max-w-3xl divide-y divide-slate-200 rounded-[28px] border border-slate-200 bg-slate-50 px-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.18)]">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span
                  className={cn(
                    "text-[15px] font-bold transition-colors",
                    isOpen ? "text-slate-900" : "text-slate-700",
                  )}
                >
                  {f.q}
                </span>
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                    isOpen
                      ? "rotate-45 border-violet-200 bg-violet-100 text-violet-700"
                      : "border-slate-200 text-slate-500",
                  )}
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </span>
              </button>
              <div
                className={cn(
                  "grid transition-all duration-500",
                  isOpen
                    ? "grid-rows-[1fr] pb-5 opacity-100"
                    : "grid-rows-[0fr] opacity-0",
                )}
              >
                <p className="overflow-hidden text-[14px] leading-relaxed text-slate-600">
                  {f.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

export function FinalCta() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <section
      aria-label="Get started"
      className="relative px-5 pb-24 pt-6 sm:px-8"
    >
      <div className="relative mx-auto w-full max-w-[1180px] overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-b from-white to-slate-100 px-6 py-16 text-center shadow-[0_28px_80px_-32px_rgba(15,23,42,0.25)] sm:px-12 md:py-24">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_60%_70%_at_50%_50%,black,transparent)]" />
          <div className="absolute left-1/2 top-1/2 h-[480px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(99,102,241,0.18),rgba(34,211,238,0.08),transparent)] blur-3xl" />
        </div>
        <Reveal className="relative">
          <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-sky-700">
            Begin today
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-balance text-4xl font-extrabold tracking-[-0.03em] text-slate-900 sm:text-5xl md:text-6xl">
            Take control of your spending.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-slate-600 md:text-base">
            Turn your financial activity into clarity, insight, and better
            decisions.
          </p>
          {done ? (
            <p
              role="status"
              className="mx-auto mt-8 flex w-max max-w-full items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-5 py-3 text-sm font-bold text-emerald-700"
            >
              <Check className="h-4 w-4" aria-hidden /> You are on the list —
              check your inbox.
            </p>
          ) : (
            <form
              className="mx-auto mt-8 flex max-w-md flex-col gap-2.5 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) setDone(true);
              }}
            >
              <label htmlFor="cta-email" className="sr-only">
                Email address
              </label>
              <input
                id="cta-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-[52px] flex-1 rounded-full border border-slate-200 bg-white px-5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none"
              />
              <button
                type="submit"
                className="h-[52px] shrink-0 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-7 text-sm font-bold text-white shadow-glow-md transition-all duration-300 hover:shadow-glow-lg hover:brightness-110 active:scale-[0.98]"
              >
                Get Started
              </button>
            </form>
          )}
          <p className="mt-4 text-[12px] text-slate-500">
            Free to explore · No card required · 2 minutes to first insight
          </p>
        </Reveal>
      </div>
    </section>
  );
}
