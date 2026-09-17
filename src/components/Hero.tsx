"use client";

import { motion } from "framer-motion";
import { OpportunityNetwork } from "@/components/hero/OpportunityNetwork";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Container } from "@/components/ui/Container";
import { useLeadForm } from "@/components/lead-form/context";

export function Hero() {
  const { open } = useLeadForm();

  return (
    <section
      id="top"
      className="relative flex min-h-[100dvh] items-center overflow-hidden bg-ink pt-28 pb-20"
    >
      <div className="grain absolute inset-0" />
      <OpportunityNetwork />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink to-transparent" />

      <Container className="relative z-10">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-stone"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            Real Estate Opportunity Intelligence
          </motion.p>

          <h1 className="balance font-serif text-[2.75rem] leading-[1.04] tracking-tight text-paper sm:text-6xl lg:text-[4.75rem]">
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              We Find the Opportunity.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="block text-stone"
            >
              You Capture the{" "}
              <span className="text-gradient-signal">Value.</span>
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="pretty mt-7 max-w-xl text-base leading-relaxed text-stone md:text-lg"
          >
            Ki identifies off-market and undervalued properties, evaluates them on
            real numbers, and structures deals that move fast — no listing required.
            Ki also runs a dedicated SEO practice for businesses that need to be found.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.52 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <MagneticButton onClick={() => open("sell")} variant="signal" trackId="have_a_property_hero">
              Have a Property? Let&apos;s Talk.
            </MagneticButton>
            <MagneticButton href="#how-it-works" variant="outline" trackId="see_how_we_work_hero">
              See How We Work
            </MagneticButton>
          </motion.div>
        </div>
      </Container>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-stone md:flex"
      >
        <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="h-8 w-px bg-line-strong"
        />
      </motion.div>
    </section>
  );
}
