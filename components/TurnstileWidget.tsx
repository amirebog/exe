"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

declare global {
  interface Window {
    turnstile: any;
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export interface TurnstileRef {
  execute: () => void;
  reset: () => void;
}

export const TurnstileWidget = forwardRef<TurnstileRef, TurnstileWidgetProps>(
  ({ onVerify, onError, onExpire }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    useImperativeHandle(ref, () => ({
      execute: () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.execute(widgetIdRef.current);
        }
      },
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    }));

    useEffect(() => {
      const loadScript = () => {
        if (document.querySelector('script[src*="turnstile"]')) {
          if (window.turnstile) {
            renderWidget();
          }
          return;
        }

        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        script.async = true;
        script.defer = true;

        script.onload = () => {
          if (window.turnstile) {
            renderWidget();
          }
        };

        script.onerror = () => {
          if (onError) onError();
        };

        document.head.appendChild(script);
      };

      const renderWidget = () => {
        if (!containerRef.current || !window.turnstile) return;

        if (widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch (e) {}
          widgetIdRef.current = null;
        }

        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
            callback: onVerify,
            "error-callback": () => {
              if (onError) onError();
            },
            "expired-callback": () => {
              if (onExpire) onExpire();
            },
            theme: "dark",
            size: "normal",
            execution: "execute",
          });
        } catch (error) {
          if (onError) onError();
        }
      };

      loadScript();

      return () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch (e) {}
          widgetIdRef.current = null;
        }
      };
    }, [onVerify, onError, onExpire]);

    return <div ref={containerRef} className="min-h-[65px]" />;
  }
);

TurnstileWidget.displayName = "TurnstileWidget";