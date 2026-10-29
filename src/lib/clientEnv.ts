"use client";

import { useMemo, useSyncExternalStore } from "react";

const motionQuery = "(prefers-reduced-motion: reduce)";

/** Live prefers-reduced-motion, false on the server. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(motionQuery);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(motionQuery).matches,
    () => false,
  );
}

/**
 * Current values of CSS custom properties, keyed by token. Snapshots are a
 * joined string so React sees a stable value between renders.
 */
export function useCssTokens<K extends string>(tokens: Record<K, string>): Record<K, string> | null {
  const keys = Object.keys(tokens) as K[];
  const joined = useSyncExternalStore(
    () => () => {},
    () => {
      const cs = getComputedStyle(document.documentElement);
      return keys.map((k) => cs.getPropertyValue(tokens[k]).trim()).join("|");
    },
    () => "",
  );
  return useMemo(() => {
    if (!joined) return null;
    const vals = joined.split("|");
    return Object.fromEntries(keys.map((k, i) => [k, vals[i] || "gray"])) as Record<K, string>;
  }, [joined]); // eslint-disable-line react-hooks/exhaustive-deps
}
