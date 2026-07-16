import { MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-background/40 backdrop-blur">
      {/* Background */}
      <img
        src="/footer-bg.png"
        alt=""
        className="pointer-events-none absolute bottom-0 left-0 w-[300px] opacity-20"
      />

      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-2">
        {/* Brand */}
        <div>
          <h3 className="font-mono text-sm font-bold uppercase tracking-[0.3em] text-white">
            Zyrix Studio
          </h3>

          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Designing modern digital experiences with clean grids, motion, and
            precision.
          </p>
        </div>

        {/* Social */}
        <div className="flex flex-col items-start sm:items-end">
          <h4 className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Social
          </h4>

          <div className="mt-5 flex items-center gap-4">
            {/* Donofa */}
            <a
              href="https://donofa.com/zyrix/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Support via Donofa"
              className="
                group
                flex h-14 w-14 items-center justify-center
                rounded-2xl
                border border-white/10
                bg-white/[0.04]
                backdrop-blur-xl
                shadow-lg shadow-black/20
                transition-all duration-300
                hover:-translate-y-1
                hover:scale-105
                hover:border-violet-500/40
                hover:bg-violet-500/10
                hover:shadow-[0_0_30px_rgba(139,92,246,0.35)]
              "
            >
              <img
                src="/favicon.svg"
                alt="Donofa"
                className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </a>

            {/* Community */}
            <a
              href="#"
              aria-label="Community"
              className="
                group
                flex h-12 w-12 items-center justify-center
                rounded-2xl
                border border-white/10
                bg-white/[0.04]
                backdrop-blur-xl
                shadow-lg shadow-black/20
                transition-all duration-300
                hover:-translate-y-1
                hover:border-white/20
                hover:bg-white/[0.08]
              "
            >
              <MessageCircle
                size={20}
                className="transition-transform duration-300 group-hover:scale-110"
              />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="relative border-t border-border/60">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-6 py-5 text-center sm:flex-row sm:text-left">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            © 2026 Zyrix Studio
          </p>

          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Designed in the grid — Worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}