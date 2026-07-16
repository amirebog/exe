import { HeartHandshake } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-background/40 backdrop-blur">
      {/* Background */}
      <img
        src="/footer-bg.png"
        alt=""
        className="pointer-events-none absolute bottom-0 left-0 w-[300px] opacity-20"
      />

      <div className="relative mx-auto flex max-w-[1400px] flex-col justify-between gap-12 px-6 py-12 lg:flex-row lg:items-center">
        {/* Brand */}
        <div className="max-w-md">
          <h3 className="font-mono text-sm font-bold uppercase tracking-[0.3em] text-white">
            Zyrix Studio
          </h3>

          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Designing modern digital experiences with clean grids, motion and
            precision. Every project is crafted with performance, simplicity,
            and attention to detail.
          </p>
        </div>

        {/* Support Card */}
        <a
          href="https://donofa.com/zyrix"
          target="_blank"
          rel="noopener noreferrer"
          className="
            group
            relative
            overflow-hidden
            rounded-3xl
            border border-violet-500/20
            bg-gradient-to-br
            from-white/5
            via-violet-500/5
            to-fuchsia-500/10
            p-6
            backdrop-blur-xl
            transition-all
            duration-500
            hover:-translate-y-1
            hover:border-violet-400/40
            hover:shadow-[0_0_40px_rgba(139,92,246,0.25)]
          "
        >
          {/* Glow */}
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl transition-all duration-500 group-hover:bg-violet-500/30" />

          <div className="relative flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <img
                src="/favicon.svg"
                alt="Donofa"
                className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </div>

            <div>
              <p className="flex items-center gap-2 text-lg font-semibold text-white">
                <HeartHandshake className="h-5 w-5 text-violet-400" />
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
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-6 py-5 text-center sm:flex-row">
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