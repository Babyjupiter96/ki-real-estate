export type LeadIntent = "sell" | "grow" | "both" | "other";

export type LeadFormData = {
  intent: LeadIntent | null;
  // Real estate
  propertyAddress: string;
  propertyType: string;
  estimatedValue: string;
  timeline: string;
  // SEO / growth
  businessName: string;
  website: string;
  industry: string;
  seoSituation: string;
  budget: string;
  // Other
  message: string;
  // Shared contact
  name: string;
  email: string;
  phone: string;
};

export const emptyLeadForm: LeadFormData = {
  intent: null,
  propertyAddress: "",
  propertyType: "",
  estimatedValue: "",
  timeline: "",
  businessName: "",
  website: "",
  industry: "",
  seoSituation: "",
  budget: "",
  message: "",
  name: "",
  email: "",
  phone: "",
};
