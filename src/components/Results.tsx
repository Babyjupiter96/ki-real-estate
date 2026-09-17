"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, revealItemVariants } from "@/components/ui/Reveal";
import { motion } from "framer-motion";

// Placeholder proof metrics. Replace `value` with verified figures as they
// become available — this component is intentionally built to hold real
// numbers without any other changes needed.
const metrics: { label: string; value: string }[] = [
  { label: "Properties Evaluated", value: "—" },
  { label: "Opportunities Identified", value: "—" },
  { label: "Deals Closed", value: "—" },
  { label: "Leads Generated", value: "—" },
];

export function Results() {
  return (
    <section className="relative bg-ink py-28 md:py-36">
      <Container>
        <SectionHeading
          eyebrow="Track Record"
          align="center"
          title="Ki Is Building in the Open."
          description="Ki is a young company by design — every deal and every ranking is earned in real time. Verified figures will appear here as they're published."
          className="mx-auto"
        />

        <RevealGroup className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
          {metrics.map((metric) => (
            <motion.div
              key={metric.label}
              variants={revealItemVariants}
              className="rounded-2xl border border-dashed border-line-strong bg-ink-2 px-5 py-8 text-center"
            >
              <div className="font-serif text-4xl text-stone-dark md:text-5xl">
                {metric.value}
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.1em] text-stone">
                {metric.label}
              </p>
            </motion.div>
          ))}
        </RevealGroup>

        <p className="mt-8 text-center text-xs text-stone-dark">
          Figures are published only once verified. Ask Ki directly for current
          numbers on live opportunities.
        </p>
      </Container>
    </section>
  );
}
