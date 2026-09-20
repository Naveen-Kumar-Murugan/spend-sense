import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type HTMLMotionProps,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants";

/* Shared expo-out easing. Kept as an explicit tuple for framer-motion types. */
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } },
};

export const fadeUpChild = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

/* ------------------------------------------------------------------------ */
/* Reveal — the standard scroll-triggered entrance used across the page.    */
/* ------------------------------------------------------------------------ */
interface RevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
  /** Blur → sharp. Only use on a few hero-level elements (filter animation). */
  blur?: boolean;
  y?: number;
}

export function Reveal({
  delay = 0,
  blur = false,
  y = 26,
  className,
  children,
  ...rest
}: RevealProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={
        reduced
          ? { opacity: 1 }
          : { opacity: 0, y, filter: blur ? "blur(10px)" : "blur(0px)" }
      }
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-72px" }}
      transition={{ duration: 0.85, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------------ */
/* Section — consistent rhythm, eyebrow, headline and lead copy.            */
/* ------------------------------------------------------------------------ */
interface SectionProps {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  children: ReactNode;
  className?: string;
  align?: "center" | "left";
}

export function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
  className,
  align = "center",
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-24 px-5 py-20 sm:px-8 md:py-28",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[1180px]">
        <Reveal
          className={cn(
            "max-w-3xl",
            align === "center" && "mx-auto text-center",
          )}
        >
          {eyebrow ? (
            <Eyebrow
              className={align === "center" ? "justify-center" : undefined}
            >
              {eyebrow}
            </Eyebrow>
          ) : null}
          <h2 className="mt-5 text-balance text-3xl font-extrabold leading-[1.1] tracking-[-0.03em] text-slate-900 sm:text-4xl md:text-[44px]">
            {title}
          </h2>
          {lead ? (
            <p
              className={cn(
                "mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-slate-600 md:text-base",
                align === "center" && "mx-auto",
              )}
            >
              {lead}
            </p>
          ) : null}
        </Reveal>
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */
/* Eyebrow label with the glowing brand dot.                                */
/* ------------------------------------------------------------------------ */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-iris",
        className,
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-iris shadow-glow-sm"
        aria-hidden
      />
      {children}
    </p>
  );
}

/* Serif italic accent word with the brand gradient. */
export function Serif({ children }: { children: ReactNode }) {
  return (
    <em className="font-serif bg-gradient-to-r from-iris via-orchid to-aqua bg-clip-text font-normal italic text-transparent">
      {children}
    </em>
  );
}

/* ------------------------------------------------------------------------ */
/* Magnetic — cursor-magnetic hover for primary CTAs (fine pointers only).  */
/* ------------------------------------------------------------------------ */
export function Magnetic({
  children,
  strength = 0.25,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const x = useSpring(useMotionValue(0), {
    stiffness: 170,
    damping: 14,
    mass: 0.22,
  });
  const y = useSpring(useMotionValue(0), {
    stiffness: 170,
    damping: 14,
    mass: 0.22,
  });

  useEffect(() => {
    if (reduced) return;
    const mq = window.matchMedia("(pointer: fine)");
    setEnabled(mq.matches);
    const onChange = (event: MediaQueryListEvent) => setEnabled(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [reduced]);

  function onMove(event: MouseEvent<HTMLDivElement>) {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------------ */
/* SpotlightCard — glass card whose inner glow follows the cursor.          */
/* ------------------------------------------------------------------------ */
export function SpotlightCard({
  children,
  className,
  glow = "rgba(99, 102, 241, 0.10)",
}: {
  children: ReactNode;
  className?: string;
  glow?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(event: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={cn(
        "group relative overflow-hidden rounded-2xl glass transition-[border-color,background-color] duration-300 hover:border-white/[0.16] hover:bg-white/[0.05]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(520px circle at var(--mx, 50%) var(--my, 50%), ${glow}, transparent 65%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* CountUp — in-view triggered animated number with en-IN formatting.       */
/* ------------------------------------------------------------------------ */
interface CountUpProps {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function CountUp({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1600,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setValue(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(to * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, to, duration]);

  const formatted = value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={cn("tnum", className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------------ */
/* CtaLink — the two landing button styles (gradient pill / glass pill).    */
/* ------------------------------------------------------------------------ */
interface CtaLinkProps {
  to?: string;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "primary" | "ghost";
  size?: "md" | "lg";
  className?: string;
  ariaLabel?: string;
}

export function CtaLink({
  to,
  href,
  onClick,
  children,
  variant = "primary",
  size = "md",
  className,
  ariaLabel,
}: CtaLinkProps) {
  const classes = cn(
    "group inline-flex items-center justify-center gap-2 rounded-full text-sm font-bold transition-all duration-300 active:scale-[0.97]",
    size === "md" ? "h-11 px-5" : "h-[52px] px-7 text-[15px]",
    variant === "primary"
      ? "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-glow-md hover:shadow-glow-lg hover:brightness-110"
      : "glass text-slate-700 hover:border-slate-200 hover:bg-slate-50",
    className,
  );

  const content = (
    <>
      <span>{children}</span>
      <ArrowRight
        className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
        aria-hidden
      />
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className={classes}
        aria-label={ariaLabel}
      >
        {content}
      </Link>
    );
  }
  return (
    <a
      href={href ?? "#"}
      onClick={onClick}
      className={classes}
      aria-label={ariaLabel}
    >
      {content}
    </a>
  );
}

/* ------------------------------------------------------------------------ */
/* LandingLogo — gradient mark (card + pulse) and wordmark.                 */
/* ------------------------------------------------------------------------ */
export function LandingLogo({ className }: { className?: string }) {
  function handleClick() {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }

  return (
    <Link
      to="/"
      onClick={handleClick}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label={`${APP_NAME} — home`}
    >
      {/* <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#818CF8] via-[#6366F1] to-[#8B5CF6] shadow-glow-sm transition-transform duration-300 group-hover:scale-105">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="h-[18px] w-[18px]"
          aria-hidden
        >
          <rect
            x="3"
            y="4"
            width="14"
            height="12"
            rx="3"
            fill="white"
            fillOpacity="0.96"
          />
          <path
            d="M4.5 12.6 7 9.4l2.1 3 2.4-4.2 1.9 3H15.5"
            stroke="#4F46E5"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span> */}
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-pop">
        <span className="relative block h-3.5 w-5 rounded-[4px] bg-white">
          <span className="absolute inset-x-0 top-0 h-1.5 rounded-t-[4px] bg-primary-200"></span>
        </span>
      </span>
      <span className="text-[17px] font-extrabold tracking-[-0.02em] text-slate-900">
        {APP_NAME}
      </span>
    </Link>
  );
}

/* Hairline divider with a slow travelling gradient. */
export function GradientDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "h-px w-full animate-divider-flow bg-[linear-gradient(to_right,transparent,rgba(129,140,248,0.55),rgba(34,211,238,0.4),transparent)] bg-[length:200%_100%]",
        className,
      )}
    />
  );
}
