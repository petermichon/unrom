import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  data,
  useLoaderData,
  useRevalidator,
  useRouteLoaderData,
} from "react-router";

import { useEffect, useRef, useSyncExternalStore } from "react";

import type { Route } from "./+types/root";
import "./app.css";
import AppShell from "@/components/AppShell";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { fetchMeta, syncContentHash } from "@/lib/data";

export async function loader() {
  const meta = await fetchMeta();
  syncContentHash(meta.contentHash);
  const generatedAt = new Date(meta.generatedAt);
  return data(
    {
      updatedAt: meta.generatedAt,
      contentHash: meta.contentHash,
    },
    {
      headers: {
        // HTML changes only when the baked dataset changes.
        "cache-control": "public, max-age=0, must-revalidate",
        "last-modified": Number.isNaN(generatedAt.getTime())
          ? new Date().toUTCString()
          : generatedAt.toUTCString(),
        etag: `"${meta.contentHash}"`,
      },
    },
  );
}

export async function clientLoader() {
  const meta = await fetchMeta();
  syncContentHash(meta.contentHash);
  return { updatedAt: meta.generatedAt };
}

// Propagate the loader's validators to every document response.
export const headers: Route.HeadersFunction = ({ loaderHeaders }) =>
  loaderHeaders;

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "unknown";
  // Fixed locale + UTC so the server and client render identically.
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

export const links: Route.LinksFunction = () => [
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  // The preload only pays off in a built app, where it is consumed once. In
  // dev Vite injects the stylesheet as modules and the font face is fetched
  // before the preload can be reused, so Chrome warns that it went unused.
  ...(import.meta.env.DEV
    ? []
    : [
        {
          rel: "preload" as const,
          href: "/fonts/manrope-latin-wght-normal.woff2",
          as: "font" as const,
          type: "font/woff2",
          crossOrigin: "anonymous" as const,
        },
      ]),
];

// Only used when an error is rendered; normal pages set their own title.
export const meta: Route.MetaFunction = ({ error }) => {
  if (!error) return [];
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return [
    {
      title: notFound
        ? "Page not found | unrom"
        : "Something went wrong | unrom",
    },
    { name: "robots", content: "noindex" },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          // `interactive-widget` makes Chromium shrink the layout viewport for
          // the keyboard instead of overlaying it, so `dvh` and fixed sheets
          // stay above it. Safari ignores it and still overlays.
          content="width=device-width, initial-scale=1, interactive-widget=resizes-content"
        />
        <Meta />
        <script
          // Apply the stored theme before first paint so a dark preference does
          // not flash light. Without scripts the page stays on the light theme
          // instead of being forced dark.
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||((!t||t==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();',
          }}
        />
        <Links />
        <script
          defer
          src="https://stats.unrom.com/script.js"
          data-website-id="d94ac089-b728-4feb-9833-bab08f629ad5"
          data-domains="unrom.com"
        />
        {/* Tables ship every row but hide the ones past the first page. Without
            scripts nothing can page, so show them all and drop the controls
            that would do nothing. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              "<style>tr[hidden]{display:table-row}[data-requires-js]{display:none}.nojs-nav{display:flex!important}[data-nojs-hide]{display:none!important}</style>",
          }}
        />
      </head>
      <body className="min-h-svh bg-background text-foreground antialiased selection:bg-brand/25">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:ring-2 focus:ring-ring"
        >
          Skip to content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          enableColorScheme={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { updatedAt } = useLoaderData<typeof loader>();
  return (
    <AppShell updatedAt={formatDate(updatedAt)} updatedAtIso={updatedAt}>
      <Outlet />
    </AppShell>
  );
}

const ISSUES_URL = "https://github.com/petermichon/unrom/issues";

/** Live online status; the server has no opinion and assumes online. */
function useOnline(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("online", onChange);
      window.addEventListener("offline", onChange);
      return () => {
        window.removeEventListener("online", onChange);
        window.removeEventListener("offline", onChange);
      };
    },
    () => navigator.onLine,
    () => true,
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const data = useRouteLoaderData<typeof loader>("root");
  const revalidator = useRevalidator();
  const online = useOnline();
  const heading = useRef<HTMLHeadingElement>(null);
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const status = isRouteErrorResponse(error) ? error.status : null;

  // A client navigation to an error page leaves focus on <body>; move it to
  // the heading so the message is announced.
  useEffect(() => {
    heading.current?.focus();
  }, []);

  const title = notFound
    ? "Page not found"
    : online
      ? "We couldn't load this page"
      : "You appear to be offline";

  const description = notFound
    ? "That page doesn't exist. It may have moved, or the link may be wrong."
    : online
      ? "The server didn't respond as expected. This is usually temporary — try again in a moment."
      : "Check your connection, then try again.";

  const technical =
    import.meta.env.DEV && error instanceof Error ? error.message : null;

  return (
    <AppShell
      updatedAt={data ? formatDate(data.updatedAt) : undefined}
      updatedAtIso={data?.updatedAt}
    >
      <div className="flex min-h-[55svh] flex-col justify-center gap-4">
        {status !== null && status >= 500 && (
          <p className="font-mono text-xs text-muted-foreground">
            Error {status}
          </p>
        )}
        <div
          role={notFound ? undefined : "alert"}
          className="flex flex-col gap-2"
        >
          <h1
            ref={heading}
            tabIndex={-1}
            className="font-heading text-3xl font-extrabold tracking-[-0.02em] outline-none"
          >
            {title}
          </h1>
          <p className="max-w-[52ch] text-muted-foreground">{description}</p>
        </div>
        {technical && (
          <p className="font-mono text-xs text-muted-foreground">{technical}</p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {!notFound && (
            <Button
              data-nojs-hide
              onClick={() => revalidator.revalidate()}
              disabled={revalidator.state !== "idle"}
            >
              {revalidator.state === "idle" ? "Try again" : "Retrying…"}
            </Button>
          )}
          <Button
            variant={notFound ? "default" : "outline"}
            nativeButton={false}
            render={<Link to="/" />}
          >
            Back home
          </Button>
          {notFound && (
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/devices" />}
            >
              Browse devices
            </Button>
          )}
        </div>
        {!notFound && (
          <p className="text-sm text-muted-foreground">
            Still not working?{" "}
            <a
              href={ISSUES_URL}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-brand hover:underline"
            >
              Report the problem
            </a>
            .
          </p>
        )}
      </div>
    </AppShell>
  );
}
