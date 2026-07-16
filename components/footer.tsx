import { HeartHandshake } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-background">
      {/* Background */}
      <img
        src="/footer-bg.png"
        alt=""
        className="pointer-events-none absolute bottom-0 left-0 w-[300px] opacity-15"
      />

      <div className="relative mx-auto flex max-w-[1400px] flex-col justify-between gap-12 px-6 py-12 lg:flex-row lg:items-center">
        {/* Brand */}
        <div className="max-w-md">
          <h3 className="font-mono text-sm font-bold uppercase tracking-[0.3em] text-foreground">
            Zyrix Studio
          </h3>

          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Designing modern digital experiences with clean grids, motion and
            precision. Every project is crafted with performance, simplicity,
            and attention to detail.
          </p>
        </div>

        {/* Support */}
        <a
          href="https://donofa.com/zyrix"
          target="_blank"
          rel="noopener noreferrer"
          className="
            group
            relative
            overflow-hidden
            rounded-3xl
            border
            border-border
            bg-background/70
            p-6
            shadow-sm
            backdrop-blur-xl
            transition-all
            duration-300
            hover:-translate-y-1
            hover:border-primary/30
            hover:bg-accent/30
            hover:shadow-xl
          "
        >
          <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          </div>

          <div className="relative flex items-center gap-5">
            <div
              className="
                flex h-16 w-16 items-center justify-center
                rounded-2xl
                border border-border
                bg-muted
                transition-colors
                group-hover:bg-background
              "
            >
              <img
                src="/favicon.svg"
                alt="Donofa"
                className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </div>

            <div>
              <p className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <HeartHandshake className="h-5 w-5 text-primary" />
                Support Zyrix
              </p>

              <p className="mt-1 max-w-xs text-sm leading-6 text-muted-foreground">
                Enjoying our work? Your support helps us build better tools,
                improve our services, and keep creating.
              </p>
            </div>
          </div>
        </a>
      </div>

      {/* Bottom */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            © 2026 Zyrix Studio
          </p>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <div className="h-4 w-px bg-border" />

            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Designed in the grid — Worldwide
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}