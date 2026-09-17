import type { Metadata, Viewport } from "next";
import { Manrope, Fraunces } from "next/font/google";
import { siteConfig } from "@/lib/site";
import { LeadFormProvider } from "@/components/lead-form/LeadFormProvider";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Real Estate Opportunity Intelligence`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: `${siteConfig.name} | Real Estate Opportunity Intelligence`,
    description: siteConfig.shortDescription,
    siteName: siteConfig.name,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ki — Real Estate Opportunity Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Real Estate Opportunity Intelligence`,
    description: siteConfig.shortDescription,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
};

function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: `${siteConfig.url}/favicon.ico`,
    email: siteConfig.contact.email,
    sameAs: [siteConfig.social.linkedin, siteConfig.social.instagram],
    knowsAbout: [
      "Real Estate Wholesale",
      "Real Estate Acquisition",
      "Property Evaluation",
      "Off-Market Properties",
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.shortDescription,
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phone,
    priceRange: "$$",
    areaServed: "US",
    serviceType: ["Real Estate Wholesale", "Property Acquisition", "Property Resale"],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${fraunces.variable}`}
    >
      <body className="bg-ink text-paper font-sans antialiased">
        <OrganizationSchema />
        <LocalBusinessSchema />
        <PageViewTracker />
        <LeadFormProvider>{children}</LeadFormProvider>
      </body>
    </html>
  );
}
