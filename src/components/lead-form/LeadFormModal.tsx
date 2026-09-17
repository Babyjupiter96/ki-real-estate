"use client";

import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLeadForm } from "./context";
import type { LeadFormData, LeadIntent } from "./types";
import { track, getSessionId } from "@/lib/tracking";

type StepId = "intent" | "property" | "business" | "message" | "contact" | "success";

const intentOptions: { id: LeadIntent; label: string; hint: string }[] = [
  { id: "sell", label: "Sell / Wholesale a Property", hint: "Real estate" },
  { id: "grow", label: "Grow My Business", hint: "SEO & visibility" },
  { id: "both", label: "Both", hint: "Property + growth" },
  { id: "other", label: "Something Else", hint: "Not sure yet" },
];

function getSteps(intent: LeadIntent | null): StepId[] {
  switch (intent) {
    case "sell":
      return ["intent", "property", "contact"];
    case "grow":
      return ["intent", "business", "contact"];
    case "both":
      return ["intent", "property", "business", "contact"];
    case "other":
      return ["intent", "message", "contact"];
    default:
      return ["intent"];
  }
}

const inputClasses =
  "w-full rounded-xl border border-line-strong bg-ink-2 px-4 py-3.5 text-[15px] text-paper placeholder:text-stone-dark outline-none transition-colors focus:border-signal";

const labelClasses = "mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone";

export function LeadFormModal() {
  const {
    isOpen,
    close,
    data,
    setData,
    stepIndex,
    setStepIndex,
    status,
    setStatus,
    reset,
  } = useLeadForm();

  const steps = useMemo(() => getSteps(data.intent), [data.intent]);
  const currentStep = status === "idle" && stepIndex >= steps.length ? "success" : steps[stepIndex];

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(reset, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  function update<K extends keyof LeadFormData>(key: K, value: LeadFormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function selectIntent(intent: LeadIntent) {
    update("intent", intent);
    setStepIndex(1);
    track("form_step", { step: "intent", intent });
  }

  function goNext() {
    track("form_step", { step: currentStep, intent: data.intent });
    setStepIndex((i) => Math.min(i + 1, steps.length));
  }

  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function handleSubmit() {
    setStatus("submitting");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, sessionId: getSessionId() }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setStatus("idle");
      setStepIndex(steps.length);
      track("form_submit", { intent: data.intent });
    } catch {
      setStatus("error");
    }
  }

  const progress = currentStep === "success" ? 1 : (stepIndex + 1) / steps.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center md:items-center md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Talk to Ki"
        >
          <motion.div
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            onClick={close}
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-line-strong bg-ink-2 md:max-h-[86vh] md:rounded-3xl"
          >
            {/* Progress bar */}
            <div className="h-[3px] w-full bg-ink-3">
              <motion.div
                className="h-full bg-signal"
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            <button
              onClick={close}
              aria-label="Close"
              className="absolute right-5 top-6 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-stone transition-colors hover:border-signal hover:text-signal"
            >
              ✕
            </button>

            <div className="flex-1 overflow-y-auto px-7 py-9 md:px-10 md:py-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep + String(stepIndex)}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {currentStep === "intent" && (
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-signal">
                        Start here
                      </p>
                      <h3 className="font-serif text-3xl leading-tight text-paper">
                        What brings you to Ki?
                      </h3>
                      <div className="mt-8 grid gap-3">
                        {intentOptions.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => selectIntent(opt.id)}
                            className="group flex items-center justify-between rounded-2xl border border-line-strong bg-ink px-5 py-4 text-left transition-all hover:border-signal hover:bg-ink-3"
                          >
                            <span>
                              <span className="block text-[15px] font-semibold text-paper">
                                {opt.label}
                              </span>
                              <span className="mt-0.5 block text-xs text-stone">{opt.hint}</span>
                            </span>
                            <span className="text-stone transition-transform group-hover:translate-x-1 group-hover:text-signal">
                              →
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStep === "property" && (
                    <StepShell
                      title="Tell us about the property."
                      onBack={goBack}
                      onNext={goNext}
                      canNext={data.propertyAddress.trim().length > 2}
                    >
                      <Field label="Property address">
                        <input
                          className={inputClasses}
                          value={data.propertyAddress}
                          onChange={(e) => update("propertyAddress", e.target.value)}
                          placeholder="123 Main St, City, State"
                        />
                      </Field>
                      <Field label="Property type">
                        <select
                          className={inputClasses}
                          value={data.propertyType}
                          onChange={(e) => update("propertyType", e.target.value)}
                        >
                          <option value="">Select one</option>
                          <option>Single-family</option>
                          <option>Multi-family</option>
                          <option>Land</option>
                          <option>Commercial</option>
                          <option>Other</option>
                        </select>
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Estimated value">
                          <input
                            className={inputClasses}
                            value={data.estimatedValue}
                            onChange={(e) => update("estimatedValue", e.target.value)}
                            placeholder="$"
                          />
                        </Field>
                        <Field label="Timeline">
                          <select
                            className={inputClasses}
                            value={data.timeline}
                            onChange={(e) => update("timeline", e.target.value)}
                          >
                            <option value="">Select</option>
                            <option>ASAP</option>
                            <option>1–3 months</option>
                            <option>3–6 months</option>
                            <option>Just exploring</option>
                          </select>
                        </Field>
                      </div>
                    </StepShell>
                  )}

                  {currentStep === "business" && (
                    <StepShell
                      title="Tell us about the business."
                      onBack={goBack}
                      onNext={goNext}
                      canNext={data.businessName.trim().length > 1}
                    >
                      <Field label="Business name">
                        <input
                          className={inputClasses}
                          value={data.businessName}
                          onChange={(e) => update("businessName", e.target.value)}
                          placeholder="Business name"
                        />
                      </Field>
                      <Field label="Website">
                        <input
                          className={inputClasses}
                          value={data.website}
                          onChange={(e) => update("website", e.target.value)}
                          placeholder="yourwebsite.com"
                        />
                      </Field>
                      <Field label="Industry">
                        <input
                          className={inputClasses}
                          value={data.industry}
                          onChange={(e) => update("industry", e.target.value)}
                          placeholder="e.g. Real estate, home services"
                        />
                      </Field>
                      <Field label="Current SEO situation">
                        <select
                          className={inputClasses}
                          value={data.seoSituation}
                          onChange={(e) => update("seoSituation", e.target.value)}
                        >
                          <option value="">Select</option>
                          <option>Nothing in place yet</option>
                          <option>Working with someone currently</option>
                          <option>Tried it before, didn&apos;t work</option>
                          <option>Not sure what we need</option>
                        </select>
                      </Field>
                      <Field label="Monthly marketing budget">
                        <select
                          className={inputClasses}
                          value={data.budget}
                          onChange={(e) => update("budget", e.target.value)}
                        >
                          <option value="">Select a range</option>
                          <option>Under $1,000</option>
                          <option>$1,000–$3,000</option>
                          <option>$3,000–$10,000</option>
                          <option>$10,000+</option>
                        </select>
                      </Field>
                    </StepShell>
                  )}

                  {currentStep === "message" && (
                    <StepShell
                      title="What do you need from Ki?"
                      onBack={goBack}
                      onNext={goNext}
                      canNext={data.message.trim().length > 3}
                    >
                      <Field label="Tell us a bit more">
                        <textarea
                          className={inputClasses}
                          rows={5}
                          value={data.message}
                          onChange={(e) => update("message", e.target.value)}
                          placeholder="What are you trying to figure out?"
                        />
                      </Field>
                    </StepShell>
                  )}

                  {currentStep === "contact" && (
                    <div>
                      <button
                        onClick={goBack}
                        className="mb-6 text-xs font-semibold uppercase tracking-[0.14em] text-stone hover:text-signal"
                      >
                        ← Back
                      </button>
                      <h3 className="font-serif text-3xl leading-tight text-paper">
                        Almost there.
                      </h3>
                      <p className="mt-2 text-sm text-stone">
                        A few details so Ki can reach you.
                      </p>
                      <div className="mt-7 grid gap-4">
                        <Field label="Full name">
                          <input
                            className={inputClasses}
                            value={data.name}
                            onChange={(e) => update("name", e.target.value)}
                            placeholder="Your name"
                          />
                        </Field>
                        <Field label="Email">
                          <input
                            type="email"
                            className={inputClasses}
                            value={data.email}
                            onChange={(e) => update("email", e.target.value)}
                            placeholder="you@email.com"
                          />
                        </Field>
                        {data.intent !== "grow" && (
                          <Field label="Phone">
                            <input
                              type="tel"
                              className={inputClasses}
                              value={data.phone}
                              onChange={(e) => update("phone", e.target.value)}
                              placeholder="(555) 000-0000"
                            />
                          </Field>
                        )}
                      </div>
                      {status === "error" && (
                        <p className="mt-4 text-sm text-red-400">
                          Something went wrong. Please try again.
                        </p>
                      )}
                      <button
                        onClick={handleSubmit}
                        disabled={
                          status === "submitting" ||
                          data.name.trim().length < 2 ||
                          !data.email.includes("@")
                        }
                        className="mt-8 w-full rounded-full bg-signal px-7 py-4 text-sm font-semibold tracking-wide text-ink transition-colors hover:bg-[#dcdcdc] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {status === "submitting" ? "Submitting…" : "Submit Opportunity"}
                      </button>
                    </div>
                  )}

                  {currentStep === "success" && (
                    <div className="py-6 text-center">
                      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-signal text-ink">
                        ✓
                      </div>
                      <h3 className="font-serif text-3xl text-paper">
                        Your opportunity is in.
                      </h3>
                      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-stone">
                        Ki has your details. Expect a reply from our team within one
                        business day to talk through next steps.
                      </p>
                      <button
                        onClick={close}
                        className="mt-8 rounded-full border border-line-strong px-7 py-3.5 text-sm font-semibold text-paper transition-colors hover:border-signal hover:text-signal"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={labelClasses}>{label}</span>
      {children}
    </label>
  );
}

function StepShell({
  title,
  children,
  onBack,
  onNext,
  canNext,
}: {
  title: string;
  children: React.ReactNode;
  onBack: () => void;
  onNext: () => void;
  canNext: boolean;
}) {
  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 text-xs font-semibold uppercase tracking-[0.14em] text-stone hover:text-signal"
      >
        ← Back
      </button>
      <h3 className="font-serif text-3xl leading-tight text-paper">{title}</h3>
      <div className="mt-7 grid gap-4">{children}</div>
      <button
        onClick={onNext}
        disabled={!canNext}
        className="mt-8 w-full rounded-full bg-signal px-7 py-4 text-sm font-semibold tracking-wide text-ink transition-colors hover:bg-[#dcdcdc] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue
      </button>
    </div>
  );
}
