import { ArrowRight, Lock, Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigation } from "react-router";
import { MENU_ROMS, NAV_ITEMS } from "@/lib/nav";
import { fetchRomSummaries } from "@/lib/data";
import { PanelCard } from "@/components/PanelCard";
import { RomGlyph } from "@/components/RomMark";
import { ROM_LOGOS } from "@/components/RomPhone";
import CommandPalette, { SearchProvider } from "@/components/CommandPalette";
import SiteNav from "@/components/SiteNav";
import { GitHubIcon } from "@/components/GitHubIcon";
import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { RomSummary } from "@/lib/types";
import { useScrollFade } from "@/lib/use-scroll-fade";

interface Props {
  updatedAt?: string;
  updatedAtIso?: string;
  children: ReactNode;
}

const GITHUB_URL = "https://github.com/petermichon/unrom";
const ODBL_URL = "https://opendatacommons.org/licenses/odbl/1-0/";

function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [roms, setRoms] = useState<RomSummary[] | null>(null);
  const close = () => setOpen(false);
  const { ref: listRef, more: listHasMore } = useScrollFade<HTMLDivElement>();

  // Counts for the curated ROMs, fetched once per session like the mega panel.
  useEffect(() => {
    if (!open || roms) return;
    let cancelled = false;
    fetchRomSummaries()
      .then((list) => {
        if (!cancelled) setRoms(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, roms]);

  const romById = new Map((roms ?? []).map((rom) => [rom.id, rom]));
  const featured = romById.get(MENU_ROMS[0].id) ?? null;
  const featuredLogo = featured ? ROM_LOGOS[featured.id] : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
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
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="top-4 flex max-h-[calc(100dvh-2rem)] translate-y-0 flex-col gap-0 overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-xl ring-0"
      >
        <DialogTitle className="sr-only">Menu</DialogTitle>

        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <Link
            to="/"
            onClick={close}
            className="rounded-md font-brand text-lg leading-none font-extrabold tracking-[-0.03em] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            unrom
          </Link>
          <DialogClose
            render={
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2"
                aria-label="Close menu"
              />
            }
          >
            <X className="size-4" />
          </DialogClose>
        </div>

        <div
          ref={listRef}
          className={`no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-3 pb-4 ${
            listHasMore ? "fade-scroll" : ""
          }`}
        >
          <PanelCard
            to="/devices?relock=supported"
            title="Relock supported"
            subtitle="Devices with a documented relock path"
            icon={<Lock className="size-5" />}
            onNavigate={close}
          />

          <SheetSection label="Browse">
            {NAV_ITEMS.map((item) => (
              <SheetLink
                key={item.to}
                to={item.to}
                description={item.description}
                onClick={close}
              >
                {item.label}
              </SheetLink>
            ))}
          </SheetSection>

          <SheetSection label="Shortcuts">
            <SheetLink
              to="/devices?roms=1"
              description="Only devices that have build data"
              onClick={close}
            >
              Devices with ROMs
            </SheetLink>
          </SheetSection>

          <SheetSection label="ROMs">
            {featured && (
              <PanelCard
                to={`/roms/${featured.id}`}
                title={featured.name}
                subtitle={`${featured.deviceCount} devices`}
                icon={
                  featuredLogo && (
                    <RomGlyph
                      id={featured.id}
                      src={featuredLogo}
                      className="size-5"
                    />
                  )
                }
                onNavigate={close}
              />
            )}
            {MENU_ROMS.slice(1).map((rom) => (
              <SheetLink
                key={rom.id}
                to={`/roms/${rom.id}`}
                onClick={close}
                trailing={
                  romById.get(rom.id)
                    ? `${romById.get(rom.id)!.deviceCount} devices`
                    : undefined
                }
              >
                {rom.name}
              </SheetLink>
            ))}
            <Link
              to="/roms"
              onClick={close}
              className="mt-1 inline-flex w-fit items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-semibold text-brand outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              All ROMs
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </SheetSection>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Same row language as the mega panel, with a 44px touch target kept.
const SHEET_ROW =
  "flex min-h-11 items-center rounded-lg px-2 py-1.5 text-sm font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50";

function SheetSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="px-2 pb-1 text-xs font-semibold text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function SheetLink({
  to,
  description,
  trailing,
  onClick,
  children,
}: {
  to: string;
  description?: string;
  trailing?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Link to={to} onClick={onClick} className={SHEET_ROW}>
      <span className="flex min-w-0 flex-1 flex-col">
        <span>{children}</span>
        {description && (
          <span className="text-xs font-normal text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      {trailing && (
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {trailing}
        </span>
      )}
    </Link>
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
      <SearchProvider>
        <div className="flex min-h-svh flex-col bg-background">
          <header data-nosnippet className="sticky top-0 z-40 bg-background">
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 sm:px-6">
              <Link
                to="/"
                prefetch="viewport"
                className="flex items-center gap-2 rounded-full font-brand text-[1.3rem] font-extrabold tracking-[-0.03em] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="flex items-center gap-2">
                  <span className="font-brand">unrom</span>
                  <Badge className="border-0 bg-accent px-2 py-0 text-xs font-semibold text-accent-foreground">
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
                        rel="noopener"
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

          <footer className="border-t border-border px-4 py-6 text-sm text-muted-foreground sm:px-6">
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
                  aria-label="Project"
                  data-nosnippet
                  className="flex flex-wrap items-center gap-4"
                >
                  <Link
                    to="/data"
                    prefetch="intent"
                    className="inline-flex min-h-11 items-center hover:text-foreground hover:underline sm:min-h-0 sm:py-1"
                  >
                    Data
                  </Link>
                  <Link
                    to="/legal"
                    prefetch="intent"
                    className="inline-flex min-h-11 items-center hover:text-foreground hover:underline sm:min-h-0 sm:py-1"
                  >
                    Legal
                  </Link>
                  <a
                    href={ODBL_URL}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex min-h-11 items-center hover:text-foreground hover:underline sm:min-h-0 sm:py-1"
                  >
                    ODbL license
                  </a>
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex min-h-11 items-center hover:text-foreground hover:underline sm:min-h-0 sm:py-1"
                  >
                    GitHub
                  </a>
                </nav>
              </div>
            </div>
          </footer>
        </div>
      </SearchProvider>
    </TooltipProvider>
  );
}
