"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { clsx } from "clsx";

const MotionNextLink = motion.create(Link);

type MagneticButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "signal" | "ghost" | "outline";
  className?: string;
  type?: "button" | "submit";
  trackId?: string;
};

export function MagneticButton({
  children,
  onClick,
  href,
  variant = "signal",
  className,
  type = "button",
  trackId,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPos({ x: x * 0.25, y: y * 0.35 });
  }

  function handleMouseLeave() {
    setPos({ x: 0, y: 0 });
  }

  const base =
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-colors duration-300";

  const variants = {
    signal: "bg-signal text-ink hover:bg-[#dcdcdc]",
    ghost: "text-paper hover:text-signal",
    outline:
      "border border-line-strong text-paper hover:border-signal hover:text-signal",
  };

  const isInternalRoute = href?.startsWith("/");

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 150, damping: 12, mass: 0.4 }}
      className="inline-block"
    >
      {isInternalRoute ? (
        <MotionNextLink
          href={href}
          onClick={onClick}
          data-track={trackId}
          className={clsx(base, variants[variant], className)}
          whileTap={{ scale: 0.96 }}
        >
          {children}
        </MotionNextLink>
      ) : href ? (
        <motion.a
          href={href}
          onClick={onClick}
          data-track={trackId}
          className={clsx(base, variants[variant], className)}
          whileTap={{ scale: 0.96 }}
        >
          {children}
        </motion.a>
      ) : (
        <motion.button
          type={type}
          onClick={onClick}
          data-track={trackId}
          className={clsx(base, variants[variant], className)}
          whileTap={{ scale: 0.96 }}
        >
          {children}
        </motion.button>
      )}
    </motion.div>
  );
}
