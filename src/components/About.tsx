"use client";

import { Container } from "@/components/ui/Container";
import { Reveal, RevealGroup, revealItemVariants } from "@/components/ui/Reveal";
import { motion } from "framer-motion";

const pillars = [
  { title: "Intelligence", description: "Reading signals in property data and search behavior before they're obvious." },
  { title: "Strategy", description: "Every opportunity gets a plan built around its own numbers, not a template." },
  { title: "Speed", description: "Opportunity is time-sensitive. Ki moves at the pace the market actually sets." },
  { title: "Execution", description: "Ideas are cheap. Ki is built to close deals and compound rankings." },
];

export function About() {
  return (
    <section id="about" className="relative bg-ink py-28 md:py-36">
      <Container>
        <div className="grid gap-16 lg:grid-cols-[1fr_1fr]">
          <div>
            <Reveal>
              <span className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-signal">
                <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                About Ki
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="balance font-serif text-3xl leading-[1.2] text-paper md:text-4xl">
                Ki exists to identify opportunity before everyone else sees it —
                in a property, and in a market.
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="pretty mt-6 max-w-md text-[15px] leading-relaxed text-stone">
                Real estate and search visibility are usually treated as separate
                businesses. Ki treats them as the same discipline: finding
                where value is hiding, and moving on it with intelligence and
                speed before the rest of the market catches up.
              </p>
            </Reveal>
          </div>

          <RevealGroup className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {pillars.map((pillar) => (
              <motion.div key={pillar.title} variants={revealItemVariants}>
                <h3 className="font-serif text-xl text-paper">{pillar.title}</h3>
                <p className="pretty mt-2 text-sm leading-relaxed text-stone">
                  {pillar.description}
                </p>
              </motion.div>
            ))}
          </RevealGroup>
        </div>
      </Container>
    </section>
  );
}
