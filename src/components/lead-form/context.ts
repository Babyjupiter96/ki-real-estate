"use client";

import { createContext, useContext } from "react";
import type { LeadFormData, LeadIntent } from "./types";

export type LeadFormContextValue = {
  isOpen: boolean;
  data: LeadFormData;
  stepIndex: number;
  status: "idle" | "submitting" | "error";
  open: (intent?: LeadIntent) => void;
  close: () => void;
  setData: React.Dispatch<React.SetStateAction<LeadFormData>>;
  setStepIndex: React.Dispatch<React.SetStateAction<number>>;
  setStatus: React.Dispatch<React.SetStateAction<"idle" | "submitting" | "error">>;
  reset: () => void;
};

export const LeadFormContext = createContext<LeadFormContextValue | null>(null);

export function useLeadForm() {
  const ctx = useContext(LeadFormContext);
  if (!ctx) {
    throw new Error("useLeadForm must be used within a LeadFormProvider");
  }
  return ctx;
}
