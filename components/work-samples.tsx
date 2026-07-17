"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

interface PortfolioItem {
  id: string;
  title: string;
  link: string;
  imageUrl: string;
}

export function WorkSamples() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const res = await fetch("/api/portfolio");
        if (res.ok) {
          const data = await res.json();
          setItems(data.items ?? []);
        }
      } catch (error) {
        console.error("Failed to load portfolio:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();
  }, []);

  if (loading) {
    return (
      <section id="work" className="mx-auto mt-16 max-w-5xl px-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-[4/3] animate-pulse rounded-2xl border border-border bg-muted/40"
            />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section id="work" className="mx-auto mt-16 max-w-5xl px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mb-8 text-center"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          Selected work
        </p>
        <h2 className="mt-3 font-heading text-3xl tracking-tight sm:text-4xl">
          Portfolio
        </h2>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <motion.a
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.08 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                unoptimized
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>

            <div className="flex items-start justify-between gap-3 p-4">
              <p className="text-sm font-medium leading-snug text-card-foreground">
                {item.title}
              </p>
              <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
