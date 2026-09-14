import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import AppShell from "@/components/AppShell";
import { ThemeProvider } from "@/components/theme-provider";
import { getAllRoms, getBrowseDevices } from "@/lib/api";

const devices = getBrowseDevices();
const roms = getAllRoms().map((rom) => ({ id: rom.id, name: rom.name }));

export const links: Route.LinksFunction = () => [
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-svh bg-background text-foreground antialiased selection:bg-brand/30">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      enableColorScheme={false}
      disableTransitionOnChange
    >
      <AppShell devices={devices} roms={roms} buildDate={__BUILD_DATE__}>
        <Outlet />
      </AppShell>
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        {message}
      </h1>
      <p className="mt-2 text-muted-foreground">{details}</p>
    </main>
  );
}
