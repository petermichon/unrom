import { useState } from "react";
import { useLocation } from "react-router";

/**
 * True on the server and during the first hydration, false after a client-side
 * navigation. React Router's location key is not `default` in the browser, so
 * remember the first key seen instead of comparing against a literal.
 */
export function useInitialDocument(): boolean {
  const key = useLocation().key;
  const [initialKey] = useState(key);
  return key === initialKey;
}
