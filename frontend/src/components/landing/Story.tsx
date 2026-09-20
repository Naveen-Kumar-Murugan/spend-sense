import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { CountUp, EASE, Reveal, Section } from "./primitives";
import { TRUST_STATS } from "./data";

export function Trust() {
  return (
    <section
      id="trust"
      aria-label="Why SpendSense"
      className="relative px-5 sm:px-8"
    >
      <div className="mx-auto w-full max-w-[1180px] border-y border-slate-200 py-10">
        <Reveal>
          <p className="text-center text-[12px] font-bold uppercase tracking-[0.24em] text-slate-500">
            Built for people who want more control over their money
          </p>
        </Reveal>
        <dl className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-6 lg:grid-cols-4">
          {TRUST_STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="text-center">
              <dd className="tnum bg-gradient-to-b from-slate-900 to-[#6366F1] bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
                <CountUp
                  to={s.value}
                  decimals={s.decimals ?? 0}
                  prefix={s.prefix ?? ""}
                  suffix={s.suffix ?? ""}
                />
              </dd>
              <dt className="mt-2 text-[13px] font-bold text-slate-700">
                {s.label}
              </dt>
              <p className="text-[12px] text-slate-500">{s.hint}</p>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Problem() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const reduced = useReducedMotion();
  const noise = [
    "Swiggy 428 yesterday",
    "Uber 213 yesterday",
    "Netflix 649 auto-debit",
    "Amazon 1849 two days ago",
    "Airtel 399 bill paid",
    "Zomato 356 weekend",
  ];
  const clear: Array<[string, string, string]> = [
    [
      "Food delivery 1271 total",
      "32 percent of September, weekend-heavy",
      "68%",
    ],
    ["Recurring 1167 per month", "4 subscriptions, 2 unused found", "41%"],
    ["Safe to spend 740 a day", "after bills plus savings goal", "100%"],
  ];
  return (
    <Section
      id="problem"
      eyebrow="The problem"
      title={
        <>
          Your money should not be{" "}
          <span className="text-slate-500">this hard</span> to understand.
        </>
      }
      lead="Statements show what left. They never explain why it matters, what is recurring, or what is safe to spend next."
    >
      <div
        ref={ref}
        className="relative mt-12 overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.22)] sm:p-10"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.10),transparent)]"
          aria-hidden
        />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto_1fr]">
          <div aria-hidden className="space-y-2.5">
            {noise.map((t, i) => (
              <motion.div
                key={t}
                initial={reduced ? { opacity: 1 } : { opacity: 0, x: -24 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.09 }}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px]"
              >
                <span className="font-semibold text-slate-600">{t}</span>
                <span className="tnum text-slate-500">? ? ?</span>
              </motion.div>
            ))}
            <p className="pt-1 text-center text-[12px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Raw noise
            </p>
          </div>
          <div
            aria-hidden
            className="relative mx-auto hidden h-56 w-px bg-gradient-to-b from-transparent via-violet-300 to-transparent lg:block"
          >
            <motion.span
              initial={false}
              animate={inView && !reduced ? { top: ["6%", "88%", "6%"] } : {}}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-sky-500 shadow-[0_0_16px_rgba(59,130,246,0.45)]"
            />
          </div>
          <div className="space-y-3">
            {clear.map(([title, sub, w], i) => (
              <motion.div
                key={title}
                initial={reduced ? { opacity: 1 } : { opacity: 0, x: 24 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{
                  duration: 0.6,
                  ease: EASE,
                  delay: 0.35 + i * 0.14,
                }}
                className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-sky-50 p-4"
              >
                <p className="flex items-center gap-2 text-[14px] font-bold text-slate-900">
                  <Check className="h-4 w-4 text-emerald-600" aria-hidden />{" "}
                  {title}
                </p>
                <p className="mt-1 text-[12.5px] text-slate-600">{sub}</p>
                <div
                  className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200"
                  aria-hidden
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: w } : {}}
                    transition={{
                      duration: 1.1,
                      ease: EASE,
                      delay: 0.6 + i * 0.16,
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-[#6366F1] to-[#22D3EE]"
                  />
                </div>
              </motion.div>
            ))}
            <p className="pt-1 text-center text-[12px] font-bold uppercase tracking-[0.2em] text-sky-700">
              Clear picture
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
