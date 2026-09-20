import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Problem, Trust } from "@/components/landing/Story";
import { Solution } from "@/components/landing/Solution";
import { Features } from "@/components/landing/Features";
import { Showcase } from "@/components/landing/Showcase";
import { Ai } from "@/components/landing/Ai";
import { Analytics } from "@/components/landing/Analytics";
import { How, Security } from "@/components/landing/Trust";
import { Faq, FinalCta } from "@/components/landing/Closing";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Landing() {
  return (
    <div
      id="top"
      className="landing-scope min-h-screen overflow-x-hidden bg-void font-sans text-chalk antialiased"
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold"
      >
        Skip to content
      </a>
      <div
        aria-hidden
        className="grain pointer-events-none fixed inset-0 z-[4] opacity-[0.05]"
      />
      <Navbar />
      <main id="main">
        <Hero />
        <Trust />
        <Problem />
        <Solution />
        <Features />
        <Showcase />
        <Ai />
        <Analytics />
        <Security />
        <How />
        <Faq />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
