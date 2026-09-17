import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { navLinks, siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="relative border-t border-line bg-ink py-14">
      <Container>
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="font-serif text-2xl tracking-tight text-paper">
              KI<span className="text-signal">.</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-stone">
              {siteConfig.shortDescription}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-dark">
                Explore
              </p>
              <ul className="mt-4 space-y-3">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-paper/80 hover:text-signal"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href={siteConfig.seoUrl}
                    className="text-sm text-paper/80 hover:text-signal"
                  >
                    SEO ↗
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-dark">
                Contact
              </p>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    className="text-sm text-paper/80 hover:text-signal"
                  >
                    {siteConfig.contact.email}
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${siteConfig.contact.phone}`}
                    className="text-sm text-paper/80 hover:text-signal"
                  >
                    {siteConfig.contact.phone}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-dark">
                Social
              </p>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href={siteConfig.social.linkedin}
                    className="text-sm text-paper/80 hover:text-signal"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href={siteConfig.social.instagram}
                    className="text-sm text-paper/80 hover:text-signal"
                  >
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 text-xs text-stone-dark md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <p>Real Estate Opportunity Intelligence.</p>
        </div>
      </Container>
    </footer>
  );
}
