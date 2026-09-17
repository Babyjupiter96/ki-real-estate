"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useLeadForm } from "@/components/lead-form/context";
import type { LeadIntent } from "@/components/lead-form/types";

export function VerticalCTA({
  eyebrow,
  title,
  primaryLabel,
  primaryIntent,
  crossLinkLabel,
  crossLinkHref,
  trackPrefix,
}: {
  eyebrow: string;
  title: React.ReactNode;
  primaryLabel: string;
  primaryIntent: LeadIntent;
  crossLinkLabel: string;
  crossLinkHref: string;
  trackPrefix: string;
}) {
  const { open } = useLeadForm();

  return (
    <section className="relative overflow-hidden bg-ink py-28 md:py-36">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal/10 blur-[120px]" />

      <Container className="relative z-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-signal"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-signal" />
          {eyebrow}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="balance mx-auto max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-paper sm:text-4xl lg:text-5xl"
        >
          {title}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <MagneticButton
            onClick={() => open(primaryIntent)}
            variant="signal"
            trackId={`${trackPrefix}_primary`}
          >
            {primaryLabel}
          </MagneticButton>
          <MagneticButton
            href={crossLinkHref}
            variant="outline"
            trackId={`${trackPrefix}_cross_link`}
          >
            {crossLinkLabel}
          </MagneticButton>
        </motion.div>
      </Container>
    </section>
  );
}
