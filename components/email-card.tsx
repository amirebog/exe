"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { TurnstileWidget, type TurnstileRef } from "@/components/TurnstileWidget";

const roles = ["Founder", "Designer", "Developer", "Investor"];
const hasTurnstile = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

export function EmailCard() {
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [role, setRole] = useState("Designer");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [roleStats, setRoleStats] = useState<Record<string, number> | null>(
    null
  );
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const formStartTimeRef = useRef<number>(Date.now());
  const honeypotRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<TurnstileRef>(null);
  const isMountedRef = useRef(true);

  const validateEmailLocal = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const validateContact = (value: string): boolean => {
    return value.trim().length >= 3;
  };

  const submitForm = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!isMountedRef.current || isLoading) return;

      const trimmedEmail = email.trim();
      const trimmedContact = contact.trim();

      const honeypotValue = honeypotRef.current?.value || "";
      if (honeypotValue.length > 0) {
        setError("Spam detected. Please try again.");
        return;
      }

      const elapsedTime = (Date.now() - formStartTimeRef.current) / 1000;
      if (elapsedTime < 3) {
        setError("Please take a moment to fill the form.");
        return;
      }

      if (!trimmedEmail || !validateEmailLocal(trimmedEmail)) {
        setError("Please enter a valid email address");
        return;
      }
      if (!trimmedContact || !validateContact(trimmedContact)) {
        setError("Please enter a valid Telegram ID or phone (min 3 chars)");
        return;
      }

      if (hasTurnstile && !turnstileToken) {
        turnstileRef.current?.execute();
        setError("Please complete the captcha verification.");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: trimmedEmail,
            contact: trimmedContact,
            role,
            timestamp: formStartTimeRef.current,
            turnstileToken,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to submit");
        }

        if (isMountedRef.current) {
          setSubmitted(true);
          localStorage.removeItem("pendingEmail");
          localStorage.removeItem("pendingContact");
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(err instanceof Error ? err.message : "Unknown error");
          turnstileRef.current?.reset();
          setTurnstileToken(null);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [email, contact, role, isLoading, turnstileToken]
  );

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/stats?public=1");
        if (res.ok) {
          const data = await res.json();
          if (isMountedRef.current) {
            setTotalCount(data.totalEmails);
            setRoleStats(data.roleStats);
          }
        }
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    }
    loadStats();

    const savedEmail = localStorage.getItem("pendingEmail");
    const savedContact = localStorage.getItem("pendingContact");
    if (savedEmail && isMountedRef.current) setEmail(savedEmail);
    if (savedContact && isMountedRef.current) setContact(savedContact);

    formStartTimeRef.current = Date.now();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (email) localStorage.setItem("pendingEmail", email);
    else localStorage.removeItem("pendingEmail");
  }, [email]);

  useEffect(() => {
    if (contact) localStorage.setItem("pendingContact", contact);
    else localStorage.removeItem("pendingContact");
  }, [contact]);

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto w-full max-w-md"
    >
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-[0_30px_80px_-20px_rgba(15,23,42,0.15)] dark:shadow-[0_30px_80px_-20px_rgba(15,23,42,0.55)]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-card/60 via-card/80 to-card"
        />

        <div className="relative p-7 sm:p-9">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
            Early access
          </p>
          <h2 className="mt-3 font-heading text-3xl leading-tight tracking-tight text-balance">
            Get in touch
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Join the founding circle. Limited invitations to shape what
            we&apos;re building.
          </p>

          {totalCount !== null && totalCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground"
            >
              <span>✨ {totalCount} joined</span>
              {roleStats && Object.keys(roleStats).length > 0 && (
                <span>
                  {Object.entries(roleStats)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(" • ")}
                </span>
              )}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-7 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-5 py-4"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" strokeWidth={2} />
                </span>
                <p className="text-sm text-foreground">
                  You&apos;re on the list. We&apos;ll be in touch.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={submitForm}
                className="mt-7 flex flex-col gap-4"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
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
                    disabled={isLoading}
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary/60 focus:bg-background disabled:opacity-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact"
                    className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    Telegram ID / Phone
                  </label>
                  <input
                    id="contact"
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="@username or +1234567890"
                    disabled={isLoading}
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary/60 focus:bg-background disabled:opacity-50"
                  />
                </div>

                <div>
                  <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
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
                            : "border-border text-muted-foreground hover:border-foreground/40"
                        } ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
                        disabled={isLoading}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hidden" aria-hidden="true">
                  <label htmlFor="honeypot">Leave this empty</label>
                  <input
                    ref={honeypotRef}
                    id="honeypot"
                    type="text"
                    name="honeypot"
                    tabIndex={-1}
                    autoComplete="off"
                    className="pointer-events-none absolute opacity-0"
                  />
                </div>

                {hasTurnstile && (
                  <TurnstileWidget
                    ref={turnstileRef}
                    onVerify={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken(null)}
                    onError={() => {
                      setTurnstileToken(null);
                      setError("Captcha failed. Please try again.");
                    }}
                  />
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
                  >
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group mt-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Claim my invite
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        strokeWidth={1.75}
                      />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
