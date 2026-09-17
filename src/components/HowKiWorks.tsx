"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, revealItemVariants } from "@/components/ui/Reveal";

const steps = [
  {
    n: "01",
    title: "Discover",
    description: "Find the opportunity — in a property, or in a market you're not yet visible in.",
  },
  {
    n: "02",
    title: "Analyze",
    description: "Understand the numbers behind it, so every next move is made with real information.",
  },
  {
    n: "03",
    title: "Position",
    description: "Build the right strategy — a deal structure, or a visibility plan built to convert.",
  },
  {
    n: "04",
    title: "Execute",
    description: "Turn opportunity into outcome, with Ki managing the details from start to close.",
  },
];

export function HowKiWorks() {
  return (
    <section id="how-it-works" className="relative bg-ink-2 py-28 md:py-36">
      <Container>
        <SectionHeading
          eyebrow="How Ki Works"
          align="center"
          title="One System. Two Disciplines."
          description="Whether it's a property or a market position, Ki moves through the same disciplined process."
          className="mx-auto"
        />

        <RevealGroup
          stagger={0.12}
          className="mt-16 grid gap-0 divide-y divide-line md:grid-cols-4 md:divide-x md:divide-y-0"
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              variants={revealItemVariants}
              className="group relative px-2 py-10 text-center md:px-8"
            >
              <motion.div
                className="pointer-events-none absolute inset-x-6 top-6 h-24 rounded-full bg-signal/0 blur-2xl transition-colors duration-500 group-hover:bg-signal/10"
              />
              <span className="font-serif text-sm text-stone-dark">{step.n}</span>
              <h3 className="mt-4 font-serif text-2xl text-paper md:text-3xl">
                {step.title}
              </h3>
              <p className="pretty mx-auto mt-4 max-w-[220px] text-sm leading-relaxed text-stone">
                {step.description}
              </p>
              {i < steps.length - 1 && (
                <span className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 text-stone-dark md:block">
                  →
                </span>
              )}
            </motion.div>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
