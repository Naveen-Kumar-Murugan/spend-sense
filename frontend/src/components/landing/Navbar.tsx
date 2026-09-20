import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE, LandingLogo } from "./primitives";

const LINKS = [
  { href: "#product", label: "Product" },
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#security", label: "Security" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={cn(
            "mx-auto flex h-16 max-w-[1180px] items-center gap-4 px-5 transition-all duration-500 sm:px-8",
            scrolled && "pt-3",
          )}
        >
          <div
            className={cn(
              "flex h-14 w-full items-center gap-4 rounded-2xl border px-4 transition-all duration-500",
              scrolled
                ? "border-slate-200/80 bg-white/80 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.25)] backdrop-blur-xl"
                : "border-transparent bg-transparent",
            )}
          >
            <LandingLogo />
            <nav
              aria-label="Primary"
              className="ml-4 hidden items-center gap-1 lg:flex"
            >
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-full px-3.5 py-2 text-[13.5px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2.5">
              <Link
                to="/login"
                className="hidden rounded-full px-3.5 py-2 text-[13.5px] font-semibold text-slate-600 transition-colors hover:text-slate-900 sm:block"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="group hidden h-10 items-center gap-2 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-5 text-[13.5px] font-bold text-white shadow-glow-sm transition-all duration-300 hover:shadow-glow-md hover:brightness-110 sm:inline-flex"
              >
                Get Started
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label={open ? "Close menu" : "Open menu"}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
              >
                {open ? (
                  <X className="h-5 w-5" aria-hidden />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-white/75 backdrop-blur-xl lg:hidden"
          >
            <motion.nav
              aria-label="Mobile"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="mx-5 mt-24 rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_18px_60px_-24px_rgba(15,23,42,0.28)]"
            >
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.05 + i * 0.05,
                    duration: 0.4,
                    ease: EASE,
                  }}
                  className="block rounded-2xl px-4 py-3.5 text-[15px] font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {l.label}
                </motion.a>
              ))}
              <div className="mt-2 grid gap-2 border-t border-slate-200 p-2 pt-4">
                <Link
                  to="/signup"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-sm font-bold text-white"
                >
                  Get Started <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 text-sm font-bold text-slate-700"
                >
                  Sign in
                </Link>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
