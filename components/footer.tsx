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

          <div className="mt-4 flex items-center gap-5">
            {/* Donofa */}
            <a
              href="https://donofa.com/zyrix"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="حمایت مالی از طریق دونوفا"
              className="transition duration-300 hover:scale-110 hover:opacity-100"
            >
              <img
                src="/icons/favicon.svg"
                alt="Donofa"
                className="h-[18px] w-[18px] opacity-80"
              />
            </a>

            {/* Telegram / Discord */}
            <a
              href="amireb._.og"
              className="transition hover:text-white"
              aria-label="Community"
            >
              <MessageCircle size={18} />
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