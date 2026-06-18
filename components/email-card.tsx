"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";

const roles = ["Founder", "Designer", "Developer", "Investor"];

export function EmailCard() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Designer");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit email");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto w-full max-w-md"
    >
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card text-card-foreground shadow-[0_30px_80px_-20px_rgba(15,23,42,0.55)]">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "url(/card-texture.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-card/60 via-card/80 to-card"
        />

        <div className="relative p-7 sm:p-9">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
            Early access
          </p>
          <h2 className="mt-3 font-heading text-3xl leading-tight tracking-tight text-balance">
            If you like, give me your email.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            Join the founding circle. Limited invitations to shape what
            we&apos;re building.
          </p>

          {submitted ? (
            <div className="mt-7 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-5 py-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-4 w-4" strokeWidth={2} />
              </span>
              <p className="text-sm text-white/80">
                You&apos;re on the list. We&apos;ll be in touch.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-white/40"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@studio.com"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-primary/60 focus:bg-white/10"
                  disabled={isLoading}
                />
              </div>

              <div>
                <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
                  I am a
                </span>
                <div className="flex flex-wrap gap-2">
                  {roles.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => !isLoading && setRole(r)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                        role === r
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-white/15 text-white/60 hover:border-white/40"
                      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={isLoading}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="group mt-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoading ? "Sending..." : "Claim my invite"}
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  strokeWidth={1.75}
                />
              </button>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}