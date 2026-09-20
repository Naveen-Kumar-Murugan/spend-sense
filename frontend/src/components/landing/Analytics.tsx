import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal, Section } from "./primitives";
import { ANALYTICS_MONTHS } from "./data";
import { areaPath, smoothPath } from "./chartUtils";
import { cn } from "@/lib/utils";

const W = 560;
const H = 220;

const TABS = [
  { id: "income", label: "Income", color: "#34D399" },
  { id: "expenses", label: "Expenses", color: "#818CF8" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export function Analytics() {
  const [tab, setTab] = useState<Tab>("expenses");
  const [hover, setHover] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const series = ANALYTICS_MONTHS.map((m) =>
    tab === "expenses" ? m.expense / 1000 : m.income / 1000,
  );
  const min = 60;
  const max = 110;
  const line = smoothPath(series, W, H, { pad: 14, min, max });
  const area = areaPath(series, W, H, { pad: 14, min, max });
  const color = tab === "expenses" ? "#818CF8" : "#34D399";
  return (
    <Section
      id="analytics"
      eyebrow="Flows"
      title={
        <>
          Income in. Spending out.{" "}
          <span className="text-slate-500">Finally comparable.</span>
        </>
      }
      lead="Hover any month to inspect it. Both series share one scale."
    >
      <Reveal className="mt-12">
        <div
          className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.22)] sm:p-8"
          onMouseLeave={() => setHover(null)}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              className="flex rounded-full border border-slate-200 bg-slate-100 p-1"
              role="tablist"
              aria-label="Series"
            >
              {TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-1.5 text-[12px] font-bold transition-all",
                    tab === t.id
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: t.color }}
                    aria-hidden
                  />{" "}
                  {t.label}
                </button>
              ))}
            </div>
            <p className="tnum text-[13px] text-slate-500">
              Sep{" "}
              <strong className="text-slate-900">
                {tab === "expenses" ? "82.4" : "102.6"}k
              </strong>
            </p>
          </div>
          <div className="relative mt-6">
            <svg
              viewBox={"0 0 " + W + " " + H}
              className="h-52 w-full sm:h-60"
              role="img"
              aria-label={tab + " trend April to September"}
            >
              <defs>
                <linearGradient id="an-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="0.32" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((f) => (
                <line
                  key={f}
                  x1="14"
                  x2={W - 14}
                  y1={H * f}
                  y2={H * f}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="3 5"
                />
              ))}
              <path d={area} fill="url(#an-fill)" />
              <motion.path
                d={line}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={reduced ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.1 }}
              />
              {series.map((_v: number, i: number) => {
                const x = 14 + (i * (W - 28)) / (series.length - 1);
                return (
                  <rect
                    key={i}
                    x={x - W / 12}
                    y={0}
                    width={W / 6}
                    height={H}
                    fill="transparent"
                    onMouseEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    tabIndex={0}
                    role="img"
                    aria-label={MONTHS[i] + ": " + series[i] + " thousand"}
                  />
                );
              })}
              {hover !== null && (
                <g>
                  <line
                    x1={14 + (hover * (W - 28)) / (series.length - 1)}
                    x2={14 + (hover * (W - 28)) / (series.length - 1)}
                    y1={10}
                    y2={H - 18}
                    stroke="rgba(255,255,255,0.25)"
                  />
                  <circle
                    cx={14 + (hover * (W - 28)) / (series.length - 1)}
                    cy={
                      14 + (1 - (series[hover] - min) / (max - min)) * (H - 28)
                    }
                    r={5}
                    fill="#0A0D17"
                    stroke={color}
                    strokeWidth={2.5}
                  />
                </g>
              )}
            </svg>
            {hover !== null && (
              <div
                className="glass pointer-events-none absolute top-0 rounded-2xl px-3.5 py-2 backdrop-blur-xl"
                style={{
                  left:
                    "min(max(" +
                    (hover / (series.length - 1)) * 100 +
                    "%, 12%), 76%)",
                }}
              >
                <p className="text-[11px] font-bold text-slate-500">
                  {MONTHS[hover]}
                </p>
                <p className="tnum text-[15px] font-extrabold text-slate-900">
                  {series[hover]}k
                </p>
              </div>
            )}
          </div>
          <div
            className="mt-2 grid grid-cols-6 text-center text-[11px] font-bold text-slate-500"
            aria-hidden
          >
            {MONTHS.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
