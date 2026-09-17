"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { navLinks, siteConfig } from "@/lib/site";
import { useLeadForm } from "@/components/lead-form/context";
import { Container } from "@/components/ui/Container";

const MotionLink = motion.create(Link);

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { open } = useLeadForm();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      style={{ transform: "translateZ(0)" }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "nav-blur border-b border-line bg-ink/70" : "bg-transparent"
      }`}
    >
      <Container>
        <div className="flex h-[72px] items-center justify-between">
          <Link href="/" className="font-serif text-2xl tracking-tight text-paper">
            KI<span className="text-signal">.</span>
          </Link>

          <nav className="hidden items-center gap-9 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-stone transition-colors hover:text-paper"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={siteConfig.seoUrl}
              className="text-sm font-medium text-stone transition-colors hover:text-paper"
            >
              SEO ↗
            </a>
          </nav>

          <div className="hidden md:block">
            <button
              onClick={() => open()}
              data-track="talk_to_ki_nav"
              className="rounded-full bg-signal px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-[#dcdcdc]"
            >
              Talk to Ki
            </button>
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
              className="h-[1.5px] w-6 bg-paper"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="h-[1.5px] w-6 bg-paper"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
              className="h-[1.5px] w-6 bg-paper"
            />
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100dvh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden bg-ink md:hidden"
          >
            <Container className="flex h-full flex-col justify-between py-10">
              <nav className="mt-16 flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <MotionLink
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    className="border-b border-line py-5 font-serif text-3xl text-paper"
                  >
                    {link.label}
                  </MotionLink>
                ))}
                <motion.a
                  href={siteConfig.seoUrl}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + navLinks.length * 0.06 }}
                  className="border-b border-line py-5 font-serif text-3xl text-paper"
                >
                  SEO ↗
                </motion.a>
              </nav>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  open();
                }}
                data-track="talk_to_ki_mobile_menu"
                className="w-full rounded-full bg-signal px-7 py-4 text-sm font-semibold text-ink"
              >
                Talk to Ki
              </button>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
