import { useSyncExternalStore } from "react";

/**
 * Subscribes to a media query. The server snapshot defaults to false, so a
 * component must stay correct without it; use this for behaviour (timers,
 * observers), not for layout.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
