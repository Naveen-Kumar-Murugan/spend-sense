import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Sparkles, TrendingUp } from "lucide-react";
import { Reveal, Section } from "./primitives";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/lib/utils";

const PERIODS = ["30D", "90D", "12M"] as const;
type Period = (typeof PERIODS)[number];
const FLOW: Record<Period, number[]> = {
  "30D": [42, 55, 48, 66, 58, 74, 69, 82, 76, 88, 84, 96],
  "90D": [36, 44, 52, 48, 58, 54, 63, 60, 70, 66, 78, 90],
  "12M": [28, 34, 31, 40, 46, 44, 52, 58, 55, 64, 72, 92],
};

function MiniFlow({ values }: { values: number[] }) {
  const max = Math.max(...values);
  return (
    <div className="flex h-20 items-end gap-1.5" aria-hidden>
      {values.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          whileInView={{ height: `${(v / max) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: i * 0.04 }}
          className={cn(
            "flex-1 rounded-t-md",
            i === values.length - 1
              ? "bg-gradient-to-t from-[#6366F1] to-[#22D3EE]"
              : "bg-white/[0.10]",
          )}
        />
      ))}
    </div>
  );
}

export function Features() {
  const [period, setPeriod] = useState<Period>("30D");
  return (
    <Section
      id="features"
      eyebrow="Features"
      title={
        <>
          Everything your money{" "}
          <span className="text-slate-500">was trying to tell you.</span>
        </>
      }
      lead="Six capabilities, one calm surface. Each card below is live."
    >
      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <div className="h-full rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.22)] sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
                  <TrendingUp className="h-4 w-4 text-sky-600" aria-hidden />{" "}
                  Spending patterns
                </p>
                <p className="mt-1 text-[13px] text-slate-600">
                  September vs August, every category.
                </p>
              </div>
              <div
                className="flex rounded-full border border-slate-200 bg-slate-100 p-1"
                role="tablist"
                aria-label="Time range"
              >
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    role="tab"
                    aria-selected={period === p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "tnum rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all",
                      period === p
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:text-slate-900",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <MiniFlow key={period} values={FLOW[period]} />
            </div>
            <div className="mt-4 flex items-center justify-between text-[12px]">
              <span className="text-slate-500">
                Total{" "}
                <strong className="tnum text-slate-900">
                  {formatCurrency(28410)}
                </strong>
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-bold text-emerald-700">
                +6.2 pct vs Aug
              </span>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <p className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
              <Sparkles className="h-4 w-4 text-violet-600" aria-hidden /> AI
              analysis
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
              Dining up 18 pct — three late-night weekend orders explain most of
              it.
            </p>
            <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-4 text-[13px] leading-relaxed text-slate-700">
              Weekend food delivery tripled. A <strong>740 daily cap</strong>{" "}
              keeps September on track.
            </div>
            <p className="mt-auto pt-5 text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Explained, not charted
            </p>
          </div>
        </Reveal>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {[
          ["Smart categorization", "98.2 pct auto-sorted into 8 categories."],
          ["Payment intelligence", "Rent, bills and renewals surfaced early."],
          ["Budgets that breathe", "Gentle nudges, never shame."],
        ].map(([t, s], i) => (
          <Reveal key={t} delay={i * 0.06}>
            <div className="h-full rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <p className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
                <CalendarClock className="h-4 w-4 text-sky-600" aria-hidden />{" "}
                {t}
              </p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-slate-600">
                {s}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
