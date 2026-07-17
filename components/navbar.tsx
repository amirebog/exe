"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const links = [{ label: "Work", href: "#work" }];

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <nav className="glass-nav flex w-full max-w-3xl items-center justify-between gap-4 rounded-full border border-border px-3 py-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <Link
          href="/"
          className="flex items-center gap-2 pl-2"
          aria-label="Zyrix home"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground">
            <span className="h-2 w-2 rounded-full bg-background" />
          </span>
          <span className="font-heading text-lg tracking-tight">Zyrix</span>
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {links.map(({ label, href }) => (
            <li key={label}>
              <Link
                href={href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="#work"
            className="flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-sm text-background transition-opacity hover:opacity-90"
          >
            View work
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
