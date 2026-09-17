"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useLeadForm } from "@/components/lead-form/context";

const steps = [
  {
    n: "01",
    title: "Identify Opportunity",
    description:
      "Ki sources properties others overlook — off-market, undervalued, or held by owners ready to move, before they ever reach a listing.",
  },
  {
    n: "02",
    title: "Evaluate Property",
    description:
      "Every property is assessed on real numbers: condition, market position, and true value — not a hopeful asking price.",
  },
  {
    n: "03",
    title: "Structure the Deal",
    description:
      "Ki builds a deal structure that works for the seller's timeline and the numbers underneath it, with no obligation to list.",
  },
  {
    n: "04",
    title: "Connect With the Right Buyer",
    description:
      "A network of investors and buyers ready to move quickly on the right opportunity — matched, not marketed.",
  },
  {
    n: "05",
    title: "Close",
    description:
      "A clean, efficient close, with the seller informed at every step and no surprises at the table.",
  },
];

export function RealEstate() {
  const { open } = useLeadForm();

  return (
    <section className="relative bg-ink-2 py-28 md:py-36">
      <Container>
        <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <SectionHeading
              eyebrow="Real Estate"
              title={
                <>
                  Some Properties Aren&apos;t Listed.
                  <br />
                  They&apos;re Discovered.
                </>
              }
              description="Ki operates like an acquisition firm, not a listing agent — finding value in properties before the broader market ever sees them."
            />
            <Reveal delay={0.2} className="mt-10 hidden lg:block">
              <MagneticButton onClick={() => open("sell")} variant="signal" trackId="have_a_property_re">
                Have a Property? Let&apos;s Talk.
              </MagneticButton>
            </Reveal>
          </div>

          <div className="relative">
            <div className="absolute left-[19px] top-3 bottom-3 w-px bg-line-strong md:left-[23px]" />
            <ol className="space-y-10">
              {steps.map((step, i) => (
                <Reveal key={step.n} delay={i * 0.07}>
                  <li className="relative flex gap-6 pl-12 md:gap-8 md:pl-16">
                    <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-line-strong bg-ink font-serif text-sm text-signal md:h-12 md:w-12">
                      {step.n}
                    </span>
                    <div>
                      <h3 className="font-serif text-xl text-paper md:text-2xl">
                        {step.title}
                      </h3>
                      <p className="pretty mt-2 max-w-md text-[15px] leading-relaxed text-stone">
                        {step.description}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>

          <Reveal className="lg:hidden">
            <MagneticButton onClick={() => open("sell")} variant="signal" trackId="have_a_property_re">
              Have a Property? Let&apos;s Talk.
            </MagneticButton>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
