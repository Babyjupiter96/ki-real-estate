"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { faqs as allFaqs, type FaqCategory } from "@/lib/faqs";

function FaqSchema({ faqs }: { faqs: typeof allFaqs }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQ({
  categories,
  title = "Questions, Answered Directly.",
}: {
  categories?: FaqCategory[];
  title?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = categories
    ? allFaqs.filter((f) => categories.includes(f.category))
    : allFaqs;

  return (
    <section className="relative bg-ink-2 py-28 md:py-36">
      <FaqSchema faqs={faqs} />
      <Container>
        <SectionHeading eyebrow="FAQ" title={title} />

        <div className="mt-14 divide-y divide-line border-y border-line">
          {faqs.map((faq, i) => {
            const open = openIndex === i;
            return (
              <Reveal key={faq.question} delay={Math.min(i * 0.03, 0.3)}>
                <div>
                  <button
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="flex w-full items-start justify-between gap-6 py-6 text-left"
                    aria-expanded={open}
                  >
                    <span>
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-signal">
                        {faq.category}
                      </span>
                      <span className="block font-serif text-lg text-paper md:text-xl">
                        {faq.question}
                      </span>
                    </span>
                    <motion.span
                      animate={{ rotate: open ? 45 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line-strong text-stone"
                    >
                      +
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pretty max-w-2xl pb-6 text-[15px] leading-relaxed text-stone">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
