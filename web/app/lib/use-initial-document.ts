import { useLocation } from "react-router";

/**
 * True for the document's first location (SSR and hydration), false after a
 * client-side navigation. Tables use it to render every row into the initial
 * HTML for crawlers and no-JS readers without paying that cost on every
 * in-app navigation.
 */
export function useInitialDocument(): boolean {
  return useLocation().key === "default";
}
