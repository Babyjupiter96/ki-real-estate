export const siteConfig = {
  name: "Ki",
  fullName: "Ki — Real Estate Opportunity Intelligence",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.trustki.com",
  seoUrl: process.env.NEXT_PUBLIC_SEO_URL ?? "https://www.trustkiseo.com",
  description:
    "Ki identifies off-market and undervalued properties, evaluates them on real numbers, and structures deals that move fast — no listing required. Ki also runs a dedicated SEO practice for businesses that need to be found.",
  shortDescription: "Real estate opportunity intelligence, under one system.",
  locale: "en_US",
  keywords: [
    "real estate wholesale",
    "sell my house fast",
    "property acquisition",
    "real estate investor",
    "off-market properties",
  ],
  contact: {
    email: "hello@trustki.com",
    phone: "+1 (000) 000-0000",
  },
  social: {
    instagram: "https://instagram.com/",
    linkedin: "https://linkedin.com/",
  },
} as const;

export const navLinks = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About", href: "/#about" },
] as const;
