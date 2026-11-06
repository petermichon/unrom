import { Asterisk, Menu } from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router";
import CommandPalette from "@/components/CommandPalette";
import { ExportMenu } from "@/components/ExportMenu";
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
import { fetchDevices, fetchRoms } from "@/lib/data";
import { cn } from "@/lib/utils";

interface Props {
  updatedAt?: string;
  updatedAtIso?: string;
  children: ReactNode;
}

const NAV_ITEMS = [
  { to: "/devices", label: "Devices", preload: fetchDevices },
  { to: "/roms", label: "ROMs", preload: fetchRoms },
  { to: "/brands", label: "Brands", preload: fetchDevices },
];

type NavItem = (typeof NAV_ITEMS)[number];

const GITHUB_URL = "https://github.com/petermichon/unrom";
const ODBL_URL = "https://opendatacommons.org/licenses/odbl/1-0/";

function TopNavLink({ item }: { item: NavItem }) {
  // Start the clientLoader's fetch before the click so navigation does not
  // wait on the network.
  const preload = () => {
    void item.preload();
  };

  return (
    <NavLink
      to={item.to}
      prefetch="viewport"
      onMouseEnter={preload}
      onFocus={preload}
      onTouchStart={preload}
      className={({ isActive }) =>
        cn(
          "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          isActive
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        )
      }
    >
      {item.label}
    </NavLink>
  );
}

function MobileMenu() {
  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) {
          void fetchDevices();
          void fetchRoms();
        }
      }}
    >
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
          />
        }
      >
        <Menu />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Data</DropdownMenuLabel>
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
          <DropdownMenuItem render={<a href="/api" aria-label="API index" />}>
            API
          </DropdownMenuItem>
          <DropdownMenuItem
            render={
              <a href="/api/openapi.json" aria-label="OpenAPI specification" />
            }
          >
            OpenAPI
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
        <DropdownMenuItem
          render={
            <a
              href={ODBL_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="ODbL license"
            />
          }
        >
          ODbL license
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AppShell({ updatedAt, updatedAtIso, children }: Props) {
  return (
    <TooltipProvider>
      <div className="flex min-h-svh flex-col bg-background">
        <header
          data-nosnippet
          className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur"
        >
          <div className="mx-auto flex h-14 w-full max-w-4xl items-center gap-2 px-4 sm:px-6">
            <Link
              to="/"
              prefetch="viewport"
              aria-label="unrom home"
              className="flex items-center gap-2 rounded-lg font-heading font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span
                className="grid size-6 shrink-0 place-items-center rounded-md bg-brand text-brand-foreground"
                aria-hidden="true"
              >
                <Asterisk className="size-4" />
              </span>
              <span className="hidden items-center gap-2 sm:flex">
                unrom
                <Badge
                  variant="outline"
                  className="px-1.5 py-0 text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
                >
                  beta
                </Badge>
              </span>
            </Link>

            <nav
              aria-label="Main"
              className="ml-2 hidden items-center gap-1 md:flex"
            >
              {NAV_ITEMS.map((item) => (
                <TopNavLink key={item.to} item={item} />
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <CommandPalette />
              <div className="hidden items-center gap-2 md:flex">
                <ExportMenu />
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

          <nav aria-label="Sections" className="md:hidden">
            <div className="mx-auto flex w-full max-w-4xl items-center gap-1 px-4 pb-2 sm:px-6">
              {NAV_ITEMS.map((item) => (
                <TopNavLink key={item.to} item={item} />
              ))}
            </div>
          </nav>
        </header>

        <main id="content" tabIndex={-1} className="flex-1 px-4 py-10 sm:px-6">
          <div className="mx-auto w-full max-w-4xl">{children}</div>
        </main>

        <footer className="border-t border-border/60 px-4 py-6 text-xs text-muted-foreground sm:px-6">
          <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-3">
            <p>
              Last updated{" "}
              {updatedAtIso ? (
                <time dateTime={updatedAtIso}>{updatedAt ?? "—"}</time>
              ) : (
                (updatedAt ?? "—")
              )}
            </p>
            <nav
              aria-label="Data access"
              data-nosnippet
              className="flex flex-wrap items-center gap-4"
            >
              <a href="/api" className="hover:text-foreground hover:underline">
                API
              </a>
              <a
                href="/api/openapi.json"
                className="hover:text-foreground hover:underline"
              >
                OpenAPI
              </a>
              <a
                href={ODBL_URL}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground hover:underline"
              >
                ODbL license
              </a>
            </nav>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
