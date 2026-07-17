"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { EmailCard } from "@/components/email-card";
import { WorkSamples } from "@/components/work-samples";

export function Hero() {
  return (
    <section className="relative mx-auto max-w-[1400px] px-4 pt-40 sm:pt-44">
      <CornerCross className="left-2 top-28 sm:left-6" />
      <CornerCross className="right-2 top-28 sm:right-6" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="flex items-center justify-center gap-3"
      >
        <span className="h-px w-8 bg-border" />
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          Zyrix Studio — Est. 2026
        </span>
        <span className="h-px w-8 bg-border" />
      </motion.div>

      <div className="relative mt-10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0 hidden w-28 lg:block xl:w-40"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/placeholder.svg"
              alt=""
              width={240}
              height={240}
              className="h-auto w-full opacity-30 mix-blend-multiply dark:opacity-20"
              priority
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 hidden w-28 lg:block xl:w-40"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            <Image
              src="/placeholder.svg"
              alt=""
              width={240}
              height={240}
              className="h-auto w-full opacity-30 mix-blend-multiply dark:opacity-20"
              priority
            />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-heading text-[15vw] leading-[0.92] tracking-tight text-balance sm:text-7xl md:text-8xl lg:text-[7.5rem]"
        >
          Zyrix
          <br />
          Web App <span className="italic text-primary">Designer.</span>
        </motion.h1>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.45 }}
        className="mx-auto mt-8 max-w-xl text-center text-base leading-relaxed text-muted-foreground text-pretty"
      >
        React and React Native Designer with TypeScript and Framework Next.js
      </motion.p>

      <WorkSamples />

      <div className="mt-16 pb-32">
        <EmailCard />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 bottom-24 hidden items-center justify-between sm:flex"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">
          01 / Launch
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">
          ◇ Section A
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">
          1440 × Grid
        </span>
      </div>
    </section>
  );
}

function CornerCross({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute hidden text-muted-foreground/50 sm:block ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 0V18M0 9H18" stroke="currentColor" strokeWidth="1" />
      </svg>
    </span>
  );
}
