import { Menu } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigation } from "react-router";
import { NAV_ITEMS } from "@/lib/nav";
import CommandPalette from "@/components/CommandPalette";
import SiteNav from "@/components/SiteNav";
import { GitHubIcon } from "@/components/GitHubIcon";
import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TooltipProvider } from "@/components/ui/tooltip";

interface Props {
  updatedAt?: string;
  updatedAtIso?: string;
  children: ReactNode;
}

const GITHUB_URL = "https://github.com/petermichon/unrom";
const ODBL_URL = "https://opendatacommons.org/licenses/odbl/1-0/";

function MobileMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
            data-nojs-hide
          />
        }
      >
        <Menu />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Browse</DropdownMenuLabel>
          {NAV_ITEMS.filter((item) => item.kind !== "data").map((item) => (
            <DropdownMenuItem key={item.to} render={<Link to={item.to} />}>
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Data</DropdownMenuLabel>
          <DropdownMenuItem
            render={<Link to="/data" aria-label="Dataset overview" />}
          >
            Dataset overview
          </DropdownMenuItem>
          <DropdownMenuItem
            render={
              <a
                href="/api/export/json"
                download="unrom.json"
                aria-label="Download JSON export"
              />
            }
          >
            JSON export
          </DropdownMenuItem>
          <DropdownMenuItem
            render={
              <a
                href="/api/export/sqlite"
                download="unrom.sqlite"
                aria-label="Download SQLite database"
              />
            }
          >
            SQLite export
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub repository"
            />
          }
        >
          GitHub
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Appears only if the navigation takes longer than a frame or two. */
function DelayedBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  return visible ? (
    <span
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 z-10 h-0.5 bg-brand"
    />
  ) : null;
}

/**
 * A delayed progress bar: instant navigations show nothing at all. The key
 * remounts the timer for each navigation.
 */
function NavigationProgress() {
  const navigation = useNavigation();
  if (navigation.state === "idle") return null;
  return <DelayedBar key={navigation.location?.key ?? "pending"} />;
}

export default function AppShell({ updatedAt, updatedAtIso, children }: Props) {
  const navigation = useNavigation();
  const { pathname } = useLocation();
  return (
    <TooltipProvider>
      <div className="flex min-h-svh flex-col bg-background">
        <header
          data-nosnippet
          className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl backdrop-saturate-150"
        >
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 sm:px-6">
            <Link
              to="/"
              prefetch="viewport"
              className="flex items-center gap-2 rounded-full font-brand text-[1.3rem] font-extrabold tracking-[-0.03em] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="flex items-center gap-2">
                <span className="font-brand">unrom</span>
                <Badge className="border-0 bg-accent px-2 py-0 text-[11px] font-semibold text-accent-foreground">
                  beta
                </Badge>
              </span>
            </Link>

            {/* Remount per route so an open panel closes on navigation; the
                pointer can stay over the trigger while the page changes. */}
            <SiteNav key={pathname} />

            <div className="ml-auto flex items-center gap-2">
              <CommandPalette />
              <div className="hidden items-center gap-2 md:flex">
                <Button
                  variant="outline"
                  size="icon"
                  nativeButton={false}
                  aria-label="GitHub repository"
                  render={
                    <a
                      href={GITHUB_URL}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="GitHub repository"
                    />
                  }
                >
                  <GitHubIcon className="size-4" />
                </Button>
              </div>
              <ModeToggle />
              <MobileMenu />
            </div>
          </div>
          <nav
            aria-label="Sections"
            className="nojs-nav mx-auto hidden w-full max-w-6xl flex-wrap items-center gap-x-5 gap-y-1 border-t border-border px-4 py-2 text-sm font-semibold"
          >
            <a href="/devices" className="text-foreground/70">
              Devices
            </a>
            <a href="/roms" className="text-foreground/70">
              ROMs
            </a>
            <a href="/brands" className="text-foreground/70">
              Brands
            </a>
            <a href="/data" className="text-foreground/70">
              Data
            </a>
          </nav>
          <NavigationProgress />
        </header>

        <main
          id="content"
          tabIndex={-1}
          aria-busy={navigation.state !== "idle"}
          className="flex-1 px-4 py-10 sm:px-6"
        >
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>

        <footer className="border-t border-border px-4 py-6 text-xs text-muted-foreground sm:px-6">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
            <p>
              Last updated{" "}
              {updatedAtIso ? (
                <time dateTime={updatedAtIso}>{updatedAt ?? "unknown"}</time>
              ) : (
                (updatedAt ?? "unknown")
              )}
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <nav
                aria-label="Site"
                data-nosnippet
                className="flex flex-wrap items-center gap-4"
              >
                <Link
                  to="/devices"
                  prefetch="intent"
                  className="py-1 hover:text-foreground hover:underline"
                >
                  Devices
                </Link>
                <Link
                  to="/roms"
                  prefetch="intent"
                  className="py-1 hover:text-foreground hover:underline"
                >
                  ROMs
                </Link>
                <Link
                  to="/brands"
                  prefetch="intent"
                  className="py-1 hover:text-foreground hover:underline"
                >
                  Brands
                </Link>
              </nav>
              <nav
                aria-label="Data access"
                data-nosnippet
                className="flex flex-wrap items-center gap-4"
              >
                <Link
                  to="/data"
                  prefetch="intent"
                  className="py-1 hover:text-foreground hover:underline"
                >
                  Data
                </Link>
                <Link
                  to="/legal"
                  prefetch="intent"
                  className="py-1 hover:text-foreground hover:underline"
                >
                  Legal
                </Link>
                <a
                  href={ODBL_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="py-1 hover:text-foreground hover:underline"
                >
                  ODbL license
                </a>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
