"use client";

import { useEffect } from "react";

export function VisitTracker() {
  useEffect(() => {
    const hasTracked = sessionStorage.getItem("visit_tracked");
    if (hasTracked) return;

    fetch("/api/track", { method: "POST" }).catch(console.error);
    sessionStorage.setItem("visit_tracked", "true");
  }, []);

  return null;
}