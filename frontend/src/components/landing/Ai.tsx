import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { EASE, Reveal, Section } from "./primitives";

const ANSWER =
  "You spent 18 pct more than August, mostly dining and weekend fun. Food delivery tripled on Sat-Sun. Keep weekends under 740 a day and September lands back on plan.";

function useTypewriter(active: boolean, text: string) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setN(text.length);
      return;
    }
    setN(0);
    const id = setInterval(
      () => setN((c) => (c >= text.length ? c : c + 1)),
      18,
    );
    return () => clearInterval(id);
  }, [active, text, reduced]);
  return n;
}

export function Ai() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const n = useTypewriter(inView, ANSWER);
  const [q, setQ] = useState("Why did I spend more this month?");
  return (
    <Section
      id="ai"
      eyebrow="SpendSense AI"
      title={
        <>
          Ask your money{" "}
          <span className="bg-gradient-to-r from-[#A5B4FC] to-[#67E8F9] bg-clip-text text-transparent">
            anything.
          </span>
        </>
      }
      lead="Real questions, grounded answers — every number traces back to a transaction."
    >
      <Reveal className="mt-12">
        <div
          ref={ref}
          className="relative mx-auto grid max-w-4xl gap-3 lg:grid-cols-[1fr_220px]"
        >
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.22)]">
            <div className="flex items-center gap-2.5 border-b border-slate-200 px-5 py-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#6366F1] to-[#22D3EE]">
                <Sparkles className="h-4 w-4 text-white" aria-hidden />
              </span>
              <div>
                <p className="text-[13px] font-bold text-slate-900">
                  SpendSense AI
                </p>
                <p className="flex items-center gap-1.5 text-[11px] text-emerald-600">
                  <span
                    className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-500"
                    aria-hidden
                  />{" "}
                  Online · sees September
                </p>
              </div>
            </div>
            <div className="space-y-4 p-5 sm:p-6">
              <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-4 py-3 text-[13.5px] font-semibold text-white">
                {q}
              </div>
              <div className="w-fit max-w-[92%] rounded-2xl rounded-bl-md border border-slate-200 bg-slate-50 px-4 py-3 text-[13.5px] leading-relaxed text-slate-700">
                {ANSWER.slice(0, n)}
                {n < ANSWER.length && (
                  <span
                    className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-sky-600"
                    aria-hidden
                  />
                )}
              </div>
              <div
                className="flex flex-wrap gap-2"
                aria-label="Suggested questions"
              >
                {[
                  "Where can I cut back?",
                  "Am I saving enough?",
                  "What is due next week?",
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQ(s)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-[12px] font-semibold text-slate-600 transition-all hover:border-violet-300 hover:text-slate-900"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 p-1.5 pl-4">
                <span className="flex-1 truncate text-[13px] text-slate-500">
                  Ask about September spending…
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]">
                  <Send className="h-4 w-4 text-white" aria-hidden />
                </span>
              </div>
            </div>
          </div>
          <div className="hidden flex-col gap-3 lg:flex" aria-hidden>
            {[
              ["Dining", "+18 pct", "92%"],
              ["Weekend", "+31 pct", "64%"],
              ["Grocery", "-6 pct", "38%"],
            ].map(([t, d, w], i) => (
              <motion.div
                key={t}
                initial={{ opacity: 0, x: 16 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{
                  duration: 0.6,
                  ease: EASE,
                  delay: 0.5 + i * 0.15,
                }}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-[12px] font-bold text-slate-900">
                  {t} <span className="tnum ml-1 text-sky-700">{d}</span>
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: w } : {}}
                    transition={{
                      duration: 1,
                      delay: 0.7 + i * 0.15,
                      ease: EASE,
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-[#6366F1] to-[#22D3EE]"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
