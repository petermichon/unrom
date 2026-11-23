import type { ShouldRevalidateFunction } from "react-router";

/**
 * A query-string-only change on the same page leaves a loader's payload as it
 * was: table state (sort, hidden columns) lives in the URL and is applied by
 * the component. Routes whose loader does read the query string, such as the
 * device directory, keep React Router's default.
 */
export const keepLoaderDataOnSearchChange: ShouldRevalidateFunction = ({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}) =>
  currentUrl.pathname === nextUrl.pathname &&
  currentUrl.search !== nextUrl.search
    ? false
    : defaultShouldRevalidate;
