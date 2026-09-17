"use client";

import { useCallback, useMemo, useState } from "react";
import { emptyLeadForm, type LeadFormData, type LeadIntent } from "./types";
import { LeadFormContext } from "./context";
import { LeadFormModal } from "./LeadFormModal";
import { track } from "@/lib/tracking";

export function LeadFormProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<LeadFormData>(emptyLeadForm);
  const [stepIndex, setStepIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  const open = useCallback((intent?: LeadIntent) => {
    if (intent) {
      setData({ ...emptyLeadForm, intent });
      setStepIndex(1);
    } else {
      setData(emptyLeadForm);
      setStepIndex(0);
    }
    setStatus("idle");
    setIsOpen(true);
    track("form_start", { intent: intent ?? null });
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const reset = useCallback(() => {
    setData(emptyLeadForm);
    setStepIndex(0);
    setStatus("idle");
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      data,
      stepIndex,
      status,
      open,
      close,
      setData,
      setStepIndex,
      setStatus,
      reset,
    }),
    [isOpen, data, stepIndex, status, open, close, reset]
  );

  return (
    <LeadFormContext.Provider value={value}>
      {children}
      <LeadFormModal />
    </LeadFormContext.Provider>
  );
}
