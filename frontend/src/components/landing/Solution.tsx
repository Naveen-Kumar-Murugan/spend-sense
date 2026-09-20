import { Reveal, Section } from "./primitives";

export function Solution() {
  const steps: Array<[string, string]> = [
    ["Transactions", "Every payment, one stream"],
    ["AI analysis", "Patterns plus merchant intent"],
    ["Insights", "Plain-language answers"],
    ["Decisions", "Budgets you can keep"],
  ];
  return (
    <Section
      id="solution"
      eyebrow="Pipeline"
      title={
        <>
          From financial noise to{" "}
          <span className="bg-gradient-to-r from-[#5B6CF8] to-[#0EA5E9] bg-clip-text text-transparent">
            clear decisions.
          </span>
        </>
      }
      lead="A scattered month of spending resolves into answers you can act on."
    >
      <ol className="relative mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div
          aria-hidden
          className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent lg:block"
        />
        {steps.map(([t, s], i) => (
          <Reveal key={t} delay={i * 0.1}>
            <li className="group relative h-full rounded-3xl border border-slate-200 bg-slate-50 p-6 transition-colors duration-300 hover:border-violet-300 hover:bg-violet-50">
              <span className="tnum flex h-9 w-9 items-center justify-center rounded-full border border-violet-200 bg-violet-100 text-[13px] font-extrabold text-slate-900">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-4 text-[15px] font-bold text-slate-900">{t}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                {s}
              </p>
              {i < 3 && (
                <span
                  aria-hidden
                  className="absolute right-4 top-8 hidden text-slate-500 transition-transform duration-300 group-hover:translate-x-1 lg:block"
                >
                  →
                </span>
              )}
            </li>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
