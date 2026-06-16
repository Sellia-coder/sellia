"use client";

import { useEffect, useRef } from "react";
import {
  VISIT_SESSION_STORAGE_KEY,
  generateVisitSessionId,
} from "@/lib/shop-visits";

interface Props {
  shopSlug: string;
}

function getOrCreateSessionId(): string {
  try {
    const existing = localStorage.getItem(VISIT_SESSION_STORAGE_KEY);
    if (existing && existing.length >= 8) return existing;
    const id = generateVisitSessionId();
    localStorage.setItem(VISIT_SESSION_STORAGE_KEY, id);
    return id;
  } catch {
    return generateVisitSessionId();
  }
}

export default function ShopVisitTracker({ shopSlug }: Props) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (sentRef.current || !shopSlug) return;

    const track = () => {
      if (sentRef.current) return;
      sentRef.current = true;

      const sessionId = getOrCreateSessionId();
      const path =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/";

      fetch("/api/track/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopSlug, sessionId, path }),
        keepalive: true,
      }).catch(() => {
        /* fire-and-forget — ne bloque pas la boutique */
      });
    };

    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(track, { timeout: 3000 });
      return () => cancelIdleCallback(id);
    }

    const t = window.setTimeout(track, 800);
    return () => clearTimeout(t);
  }, [shopSlug]);

  return null;
}
