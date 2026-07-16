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

      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-6 py-12 md:grid-cols-3">
        {/* Brand */}
        <div>
          <h3 className="font-mono text-sm font-bold uppercase tracking-[0.3em] text-white">
            Zyrix Studio
          </h3>

          <p className="mt-3 max-w-sm text-xs leading-6 text-muted-foreground">
            Designing modern digital experiences with clean grids, motion, and
            precision.
          </p>
        </div>

        {/* Social */}
        <div className="flex flex-col">
          <h4 className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Social
          </h4>

          <div className="mt-5 flex items-center gap-4">
            <a
              href="#"
              className="
                group
                flex h-12 w-12 items-center justify-center
                rounded-2xl
                border border-white/10
                bg-white/[0.04]
                backdrop-blur-xl
                transition-all duration-300
                hover:-translate-y-1
                hover:border-white/20
                hover:bg-white/[0.08]
                hover:shadow-lg
              "
            >
              <MessageCircle
                size={20}
                className="transition-transform duration-300 group-hover:scale-110"
              />
            </a>
          </div>
        </div>

        {/* Support */}
        <div className="flex flex-col md:items-end">
          <h4 className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Support
          </h4>

          <a
            href="https://donofa.com/YOUR_USERNAME"
            target="_blank"
            rel="noopener noreferrer"
            className="
              group
              mt-5
              flex w-fit items-center gap-4
              rounded-2xl
              border border-violet-500/20
              bg-gradient-to-br
              from-violet-500/10
              to-fuchsia-500/5
              px-5
              py-4
              backdrop-blur-xl
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-violet-400/50
              hover:shadow-[0_0_35px_rgba(139,92,246,0.35)]
            "
          >
            <img
              src="/icons/donofa.svg"
              alt="Donofa"
              className="h-11 w-11 object-contain transition-transform duration-300 group-hover:scale-110"
            />

            <div>
              <p className="text-sm font-semibold text-white">
                Support Zyrix
              </p>

              <p className="text-xs text-muted-foreground transition-colors group-hover:text-violet-200">
                Help us build better products.
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-border/60">
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