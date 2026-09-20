import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, ChevronDown, Sparkles } from "lucide-react";
import { EASE, Reveal, Section } from "./primitives";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/lib/utils";

const PERIODS = ["week", "month", "year"] as const;
type P = (typeof PERIODS)[number];
const DATA: Record<
  P,
  { bars: number[]; total: number; cats: Array<[string, number, number]> }
> = {
  week: {
    bars: [38, 52, 44, 63, 57, 74, 68],
    total: 6840,
    cats: [
      ["Food", 2140, 72],
      ["Travel", 1480, 48],
      ["Shopping", 1120, 36],
    ],
  },
  month: {
    bars: [42, 55, 48, 66, 58, 74, 69, 82, 76, 88, 84, 96],
    total: 28410,
    cats: [
      ["Food", 8240, 68],
      ["Travel", 5120, 42],
      ["Shopping", 4860, 40],
    ],
  },
  year: {
    bars: [30, 38, 34, 44, 50, 47, 55, 61, 58, 66, 74, 92],
    total: 318400,
    cats: [
      ["Bills", 96200, 76],
      ["Food", 74800, 59],
      ["Travel", 52400, 41],
    ],
  },
};

export function ShowcaseA() {
  const [period, setPeriod] = useState<P>("month");
  const d = DATA[period];
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Spent this {period}
          </p>
          <p className="tnum mt-1 text-4xl font-extrabold tracking-tight text-slate-900">
            {formatCurrency(d.total)}
          </p>
        </div>
        <div
          className="flex rounded-full border border-slate-200 bg-slate-100 p-1"
          role="tablist"
          aria-label="Range"
        >
          {PERIODS.map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={period === p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-full px-4 py-1.5 text-[12px] font-bold capitalize transition-all",
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
      <div className="mt-5 flex h-32 items-end gap-1.5" aria-hidden>
        {d.bars.map((v, i) => (
          <motion.div
            key={period + i}
            initial={{ height: 0 }}
            animate={{ height: `${v}%` }}
            transition={{ duration: 0.55, delay: i * 0.03, ease: EASE }}
            className={cn(
              "flex-1 rounded-t-md",
              i === d.bars.length - 1
                ? "bg-gradient-to-t from-[#6366F1] to-[#22D3EE]"
                : "bg-iris/30",
            )}
          />
        ))}
      </div>
      <div className="mt-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Top categories
        </p>
        <div className="mt-3 space-y-2.5">
          {d.cats.map(([n, a, pct]) => (
            <div
              key={n}
              className="group rounded-xl px-2 py-1.5 transition-colors hover:bg-slate-50"
            >
              <div className="flex justify-between text-[13px]">
                <span className="font-semibold text-slate-700">{n}</span>
                <span className="tnum font-bold text-slate-900">{a}</span>
              </div>
              <div
                className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200"
                aria-hidden
              >
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: EASE }}
                  className="h-full rounded-full bg-gradient-to-r from-[#6366F1] to-[#22D3EE]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Showcase() {
  const [open, setOpen] = useState(true);
  return (
    <Section
      id="product"
      eyebrow="Product tour"
      title={
        <>
          See your money{" "}
          <span className="bg-gradient-to-r from-[#A5B4FC] to-[#67E8F9] bg-clip-text text-transparent">
            differently.
          </span>
        </>
      }
      lead="A live-feeling dashboard mock. Switch ranges, hover categories, expand the insight."
    >
      <Reveal className="mt-12">
        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_80px_-32px_rgba(15,23,42,0.25)]">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(99,102,241,0.14),transparent)]"
            aria-hidden
          />
          <div
            className="flex items-center gap-1.5 border-b border-slate-200 px-5 py-3.5"
            aria-hidden
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
            <span className="ml-3 hidden rounded-md bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500 sm:block">
              app.spendsense.in/overview
            </span>
          </div>
          <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1fr_300px]">
            <ShowcaseA />
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-2 text-left"
                >
                  <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-violet-700">
                    <Bot className="h-4 w-4" aria-hidden /> AI insight
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-slate-500 transition-transform duration-300",
                      open && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-500",
                    open
                      ? "mt-2 grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <p className="overflow-hidden text-[13.5px] leading-relaxed text-slate-700">
                    Dining is up 18 pct vs August. Capping weekends at 740 a day
                    closes the gap.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Recent
                </p>
                <ul className="mt-3 space-y-2.5 text-[13px]">
                  <li className="flex justify-between">
                    <span className="font-semibold text-slate-700">Swiggy</span>
                    <span className="tnum font-bold text-slate-500">-428</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-semibold text-slate-700">Uber</span>
                    <span className="tnum font-bold text-slate-500">-213</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-semibold text-slate-700">Salary</span>
                    <span className="tnum font-bold text-emerald-600">
                      +85,000
                    </span>
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  <Sparkles className="h-3.5 w-3.5 text-sky-600" aria-hidden />{" "}
                  Upcoming
                </p>
                <p className="tnum mt-2 text-[13px] font-semibold text-slate-800">
                  Rent 12,000 · <span className="text-sky-600">in 3 days</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
