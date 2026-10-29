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
  useRouteLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import AppShell from "@/components/AppShell";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { fetchMeta } from "@/lib/data";

export async function loader() {
  const meta = await fetchMeta();
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
  return { updatedAt: (await fetchMeta()).generatedAt };
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
  {
    rel: "preload",
    href: "/fonts/roboto-latin-wght-normal.woff2",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
];

// Only used when an error is rendered; normal pages set their own title.
export const meta: Route.MetaFunction = ({ error }) => {
  if (!error) return [];
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return [
    {
      title: notFound
        ? "Page not found — unrom"
        : "Something went wrong — unrom",
    },
    { name: "robots", content: "noindex" },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script
          defer
          src="https://stats.unrom.com/script.js"
          data-website-id="d94ac089-b728-4feb-9833-bab08f629ad5"
          data-domains="unrom.com"
        />
      </head>
      <body className="min-h-svh bg-background text-foreground antialiased selection:bg-brand/30">
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

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const data = useRouteLoaderData<typeof loader>("root");
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  const title = notFound ? "Page not found" : "Something went wrong";
  const details = isRouteErrorResponse(error)
    ? notFound
      ? "That page doesn't exist. It may have moved, or the link may be wrong."
      : error.statusText || "An unexpected error occurred."
    : import.meta.env.DEV && error instanceof Error
      ? error.message
      : "An unexpected error occurred.";

  return (
    <AppShell
      updatedAt={data ? formatDate(data.updatedAt) : undefined}
      updatedAtIso={data?.updatedAt}
    >
      <div className="flex flex-col gap-4">
        <p className="font-mono text-sm text-muted-foreground">
          {isRouteErrorResponse(error) ? error.status : "Error"}
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="text-muted-foreground">{details}</p>
        <div className="flex flex-wrap gap-2">
          <Button nativeButton={false} render={<Link to="/" />}>
            Back home
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/devices" />}
          >
            Browse devices
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/roms" />}
          >
            Browse ROMs
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
