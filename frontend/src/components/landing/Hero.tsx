import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Play, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import {
  CtaLink,
  EASE,
  Eyebrow,
  fadeUpChild,
  staggerParent,
} from "./primitives";
import { Orb3D } from "./Orb3D";
import { formatCurrency } from "@/utils/format";

const FLOATERS = [
  { m: "Swiggy", a: 428, d: "+12%", cls: "left-[1%] top-[15%]", dl: "0s" },
  { m: "Uber trip", a: 213, d: "-8%", cls: "right-[2%] top-[11%]", dl: "1.2s" },
  {
    m: "Netflix",
    a: 649,
    d: "monthly",
    cls: "left-[5%] bottom-[17%]",
    dl: "0.6s",
  },
  {
    m: "Saved Sep",
    a: 5200,
    d: "+18%",
    cls: "right-[4%] bottom-[13%]",
    dl: "1.8s",
  },
];
export function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), {
    stiffness: 140,
    damping: 22,
  });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), {
    stiffness: 140,
    damping: 22,
  });

  return (
    <section
      ref={ref}
      aria-label="SpendSense introduction"
      onMouseMove={(e) => {
        if (reduced || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className="relative overflow-hidden pb-10 pt-32 sm:pt-36 md:pb-14 md:pt-44"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,black,transparent)]" />
        <div className="absolute left-1/2 top-[-320px] h-[620px] w-[880px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(99,102,241,0.30),rgba(139,92,246,0.10),transparent)] blur-3xl" />
      </div>
      <div className="relative mx-auto grid w-full max-w-[1180px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-4">
        <motion.div
          variants={staggerParent}
          initial="hidden"
          animate="show"
          className="max-w-2xl"
        >
          <motion.div variants={fadeUpChild}>
            <Eyebrow>
              <Sparkles className="h-3.5 w-3.5 text-aqua" aria-hidden />
              Introducing SpendSense AI
            </Eyebrow>
          </motion.div>
          <motion.h1
            variants={fadeUpChild}
            className="mt-6 text-balance text-[42px] font-extrabold leading-[1.02] tracking-[-0.04em] text-slate-900 sm:text-6xl md:text-[74px]"
          >
            Your money,
            <br />
            <span className="bg-gradient-to-r from-[#5B6CF8] via-[#8B5CF6] to-[#0EA5E9] bg-clip-text text-transparent">
              finally making sense.
            </span>
          </motion.h1>
          <motion.p
            variants={fadeUpChild}
            className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg"
          >
            SpendSense turns scattered payments into one clear picture — what
            you spent, why it changed, and what to do next. Smart
            categorization, payment awareness, and an AI that explains your
            money in plain language.
          </motion.p>
          <motion.div
            variants={fadeUpChild}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <CtaLink
              to="/signup"
              size="lg"
              ariaLabel="Get started with SpendSense"
            >
              Get Started
            </CtaLink>
            <CtaLink
              href="#product"
              variant="ghost"
              size="lg"
              ariaLabel="Explore SpendSense"
            >
              <span className="inline-flex items-center gap-2">
                <Play className="h-4 w-4 fill-current" aria-hidden /> Explore
                SpendSense
              </span>
            </CtaLink>
          </motion.div>
          <motion.p
            variants={fadeUpChild}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-slate-500"
          >
            <span>
              <strong className="text-slate-900">No card required</strong> to
              explore
            </span>
            <span>
              <strong className="text-slate-900">2 min</strong> to first insight
            </span>
            <span>
              <strong className="text-slate-900">Private</strong> by
              architecture
            </span>
          </motion.p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.25 }}
          className="relative mx-auto aspect-square w-full max-w-[520px]"
        >
          <motion.div
            style={{ rotateX: rx, rotateY: ry, transformPerspective: 1100 }}
            className="relative h-full w-full"
          >
            <Orb3D className="absolute inset-[6%]" />
            <div className="glass absolute left-1/2 top-1/2 w-[244px] -translate-x-1/2 -translate-y-1/2 rounded-3xl p-5 shadow-glow-md backdrop-blur-xl sm:w-[264px]">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Total balance
              </p>
              <p className="tnum mt-1 text-[30px] font-extrabold tracking-tight text-slate-900">
                {formatCurrency(84210)}
              </p>
              <div className="mt-3 flex items-center gap-2 text-[12px] font-bold">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
                  <TrendingUp className="h-3.5 w-3.5" aria-hidden /> +6.2%
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                  <TrendingDown className="h-3.5 w-3.5" aria-hidden /> Food -11%
                </span>
              </div>
              <div
                className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200"
                aria-hidden
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "68%" }}
                  transition={{ duration: 1.4, ease: EASE, delay: 0.9 }}
                  className="h-full rounded-full bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#22D3EE]"
                />
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                <span className="tnum font-bold text-slate-700">68%</span> of
                September plan · on track
              </p>
            </div>
            <div className="glass absolute left-1/2 top-[5%] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full py-2 pl-2.5 pr-4 text-[12px] font-semibold text-slate-700 backdrop-blur-xl">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#6366F1] to-[#22D3EE]">
                <Sparkles className="h-3.5 w-3.5 text-white" aria-hidden />
              </span>
              Dining up{" "}
              <span className="tnum font-bold text-slate-900">18%</span> ·
              weekend trend
            </div>
          </motion.div>
          {FLOATERS.map((f) => (
            <div
              key={f.m}
              aria-hidden
              style={{ animationDelay: f.dl }}
              className={
                "glass absolute hidden animate-float rounded-2xl px-3.5 py-2.5 backdrop-blur-lg md:block " +
                f.cls
              }
            >
              <p className="text-[11px] font-semibold text-slate-600">{f.m}</p>
              <p className="tnum text-[15px] font-extrabold text-slate-900">
                {formatCurrency(f.a)}{" "}
                <span className="ml-1 text-[11px] font-bold text-sky-600">
                  {f.d}
                </span>
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
