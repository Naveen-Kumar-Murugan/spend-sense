import { Reveal, Section } from "./primitives";
import { HOW_STEPS, SECURITY_CHIPS, SECURITY_POINTS } from "./data";

export function Security() {
  return (
    <Section
      id="security"
      eyebrow="Security"
      title={
        <>
          Your financial data deserves{" "}
          <span className="bg-gradient-to-r from-[#5B6CF8] to-[#0EA5E9] bg-clip-text text-transparent">
            serious protection.
          </span>
        </>
      }
      lead="Read-only analysis and scoped access. Your data is never sold, never shared for ads."
    >
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECURITY_POINTS.slice(0, 3).map((c, i) => (
          <Reveal key={c.title} delay={i * 0.07}>
            <div className="h-full rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-br from-violet-100 to-sky-100">
                <c.icon className="h-5 w-5 text-sky-700" aria-hidden />
              </span>
              <p className="mt-4 text-[15px] font-bold text-slate-900">
                {c.title}
              </p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">
                {c.copy}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.1}>
        <ul
          className="mt-5 flex flex-wrap justify-center gap-2"
          aria-label="Security practices"
        >
          {SECURITY_CHIPS.map((c) => (
            <li
              key={c}
              className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-[12px] font-bold text-slate-600"
            >
              {c}
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}

export function How() {
  return (
    <Section
      id="how"
      eyebrow="How it works"
      title={
        <>
          Four steps to <span className="text-slate-500">money clarity.</span>
        </>
      }
      lead="From first import to confident decisions in one sitting."
    >
      <ol className="relative mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div
          aria-hidden
          className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent lg:block"
        />
        {HOW_STEPS.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.08}>
            <li className="relative h-full rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <span className="tnum flex h-9 w-9 items-center justify-center rounded-full border border-violet-200 bg-violet-100 text-[13px] font-extrabold text-slate-900">
                0{i + 1}
              </span>
              <p className="mt-4 flex items-center gap-2 text-[15px] font-bold text-slate-900">
                <s.icon className="h-4 w-4 text-sky-700" aria-hidden />{" "}
                {s.title}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
                {s.copy}
              </p>
            </li>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
