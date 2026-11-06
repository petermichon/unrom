import { data } from "react-router";

/**
 * Catch-all for unmatched URLs. Matching a real route (rather than letting the
 * router fail to match) keeps the dev server's critical CSS extraction working
 * on 404s: without it the document is served without styles until hydration
 * and flashes unstyled.
 */
export function loader() {
  throw data(null, { status: 404, statusText: "Not Found" });
}

export default function NotFound() {
  return null;
}
