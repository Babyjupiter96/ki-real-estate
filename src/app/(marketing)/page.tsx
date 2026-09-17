import { Hero } from "@/components/Hero";
import { RealEstate } from "@/components/RealEstate";
import { HowKiWorks } from "@/components/HowKiWorks";
import { Results } from "@/components/Results";
import { About } from "@/components/About";
import { FAQ } from "@/components/FAQ";
import { VerticalCTA } from "@/components/VerticalCTA";
import { siteConfig } from "@/lib/site";

export default function Home() {
  return (
    <>
      <Hero />
      <RealEstate />
      <HowKiWorks />
      <Results />
      <About />
      <FAQ categories={["Real Estate"]} title="Real Estate — Frequently Asked." />
      <VerticalCTA
        eyebrow="Also Building Your Visibility?"
        title="Real Estate Finds Value. SEO Makes Sure You're Found."
        primaryLabel="Have a Property? Let's Talk."
        primaryIntent="sell"
        crossLinkLabel="Explore SEO"
        crossLinkHref={siteConfig.seoUrl}
        trackPrefix="real_estate_home_cta"
      />
    </>
  );
}
