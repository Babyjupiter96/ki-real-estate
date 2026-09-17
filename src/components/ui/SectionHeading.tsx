import { clsx } from "clsx";
import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  light = false,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <Reveal>
          <span
            className={clsx(
              "mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]",
              light ? "text-ink-3/60" : "text-signal"
            )}
          >
            <span
              className={clsx(
                "h-1.5 w-1.5 rounded-full",
                light ? "bg-ink" : "bg-signal"
              )}
            />
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.08}>
        <h2
          className={clsx(
            "balance font-serif text-4xl leading-[1.08] tracking-tight md:text-5xl lg:text-[3.4rem]",
            light ? "text-ink" : "text-paper"
          )}
        >
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.16}>
          <p
            className={clsx(
              "pretty mt-5 text-base leading-relaxed md:text-lg",
              light ? "text-ink-3/70" : "text-stone"
            )}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
