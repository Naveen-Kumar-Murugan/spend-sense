import { Github, Linkedin, Twitter } from "lucide-react";
import { GradientDivider, LandingLogo } from "./primitives";

const COLS: Array<[string, Array<[string, string]>]> = [
  [
    "Product",
    [
      ["Features", "#features"],
      ["How it works", "#how"],
      ["Security", "#security"],
    ],
  ],
  [
    "Company",
    [
      ["About", "#trust"],
      ["Contact", "mailto:hello@spendsense.in"],
    ],
  ],
  [
    "Resources",
    [
      ["Documentation", "#product"],
      ["Blog", "#ai"],
      ["FAQ", "#faq"],
    ],
  ],
  [
    "Legal",
    [
      ["Privacy", "#security"],
      ["Terms", "#security"],
    ],
  ],
];

export function LandingFooter() {
  return (
    <footer className="relative px-5 pb-10 sm:px-8" aria-label="Footer">
      <div className="mx-auto w-full max-w-[1180px]">
        <GradientDivider className="opacity-70" />
        <div className="grid gap-10 py-12 md:grid-cols-[1.2fr_2fr]">
          <div>
            <LandingLogo />
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-slate-600">
              The intelligent companion that turns scattered spending into
              clarity, insight, and better decisions.
            </p>
            <div className="mt-5 flex gap-2">
              {[
                { icon: Twitter, label: "SpendSense on X" },
                { icon: Github, label: "SpendSense on GitHub" },
                { icon: Linkedin, label: "SpendSense on LinkedIn" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:border-violet-300 hover:text-slate-900"
                >
                  <s.icon className="h-4 w-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>
          <nav
            className="grid grid-cols-2 gap-8 sm:grid-cols-4"
            aria-label="Footer"
          >
            {COLS.map(([title, links]) => (
              <div key={title}>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  {title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {links.map(([label, href]) => (
                    <li key={label}>
                      <a
                        href={href}
                        className="text-[13.5px] font-semibold text-slate-600 transition-colors hover:text-slate-900"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-[12px] text-slate-500 sm:flex-row">
          <p>© 2026 SpendSense. All rights reserved.</p>
          <p>Numbers shown are illustrative product demo data.</p>
        </div>
      </div>
    </footer>
  );
}
