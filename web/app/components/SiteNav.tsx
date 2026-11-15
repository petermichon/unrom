import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Clock,
  Database,
  LayoutGrid,
  Lock,
  Shield,
} from "lucide-react";
import { Link, NavLink } from "react-router";
import { fetchRomSummaries, fetchSummary } from "@/lib/data";
import {
  MENU_BRANDS,
  MENU_ROMS,
  NAV_ITEMS,
  NAV_PRELOADS,
  type NavKind,
} from "@/lib/nav";
import { PanelCard } from "@/components/PanelCard";
import { RomGlyph } from "@/components/RomMark";
import { ROM_BOLD_MARKS, ROM_LOGOS } from "@/components/RomPhone";
import { cn, formatNumber } from "@/lib/utils";
import type { RomSummary, Summary } from "@/lib/types";

interface MenuData {
  summary: Summary;
  roms: RomSummary[];
}

/**
 * One header-width panel shared by every section. The trigger opens the whole
 * directory, so Brands and Data are one hover away instead of living in a
 * submenu; the list in each column is the shortcut, the footer link is the
 * full index.
 */
export default function SiteNav() {
  const [active, setActive] = useState<NavKind | null>(null);
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [failed, setFailed] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Partial<Record<NavKind, HTMLAnchorElement | null>>>(
    {},
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const focusOnOpen = useRef(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setActive(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const target = linkRefs.current[active];
        setActive(null);
        target?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [active]);

  useEffect(
    () => () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    },
    [],
  );

  // Keyboard users open the panel with ArrowDown; move focus into it so the
  // next Tab walks the shortcuts instead of the other triggers.
  useEffect(() => {
    if (active && focusOnOpen.current) {
      focusOnOpen.current = false;
      panelRef.current?.focus();
    }
  }, [active]);

  // Load the shortcuts on the first open. The panel stays mounted while open,
  // so moving between triggers does not refetch.
  useEffect(() => {
    if (!active || menu || failed) return;
    let cancelled = false;
    Promise.all([fetchSummary(), fetchRomSummaries()])
      .then(([summary, roms]) => {
        if (!cancelled) setMenu({ summary, roms });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [active, menu, failed]);

  const clearClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  };

  const open = (kind: NavKind) => {
    clearClose();
    setActive(kind);
  };

  const scheduleClose = () => {
    clearClose();
    closeTimer.current = window.setTimeout(() => setActive(null), 180);
  };

  const move = (kind: NavKind, direction: 1 | -1) => {
    const index = NAV_ITEMS.findIndex((item) => item.kind === kind);
    const next =
      NAV_ITEMS[(index + direction + NAV_ITEMS.length) % NAV_ITEMS.length];
    linkRefs.current[next.kind]?.focus();
    if (!active) return;
    open(next.kind);
  };

  return (
    <nav
      ref={navRef}
      aria-label="Main"
      data-nojs-hide
      className="relative ml-2 hidden items-center gap-1 lg:flex"
      onMouseEnter={clearClose}
      onMouseLeave={scheduleClose}
      onBlur={(event) => {
        if (!navRef.current?.contains(event.relatedTarget as Node)) {
          setActive(null);
        }
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isOpen = active === item.kind;
        return (
          <div key={item.to} className="flex items-center">
            <NavLink
              ref={(element) => {
                linkRefs.current[item.kind] = element;
              }}
              to={item.to}
              prefetch="viewport"
              aria-expanded={isOpen}
              aria-controls={isOpen ? "mega-menu" : undefined}
              onClick={() => setActive(null)}
              // Open on real pointer movement, not `mouseenter`: browsers re-fire
              // hover when layout or scroll changes under a stationary pointer,
              // which made the panel pop open after navigation.
              onPointerMove={() => {
                if (active === item.kind) return;
                open(item.kind);
                void NAV_PRELOADS[item.to]?.().catch(() => {});
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  focusOnOpen.current = true;
                  open(item.kind);
                } else if (event.key === "ArrowRight") {
                  event.preventDefault();
                  move(item.kind, 1);
                } else if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  move(item.kind, -1);
                }
              }}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : isOpen
                      ? "bg-muted text-foreground"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground",
                )
              }
            >
              {item.label}
            </NavLink>
          </div>
        );
      })}

      {active && (
        <div
          ref={panelRef}
          id="mega-menu"
          tabIndex={-1}
          className="pointer-events-none fixed inset-x-0 top-16 z-20 outline-none"
        >
          {/* The wrapper spans the viewport for layout but must not be a hit
              target: as a descendant of the nav it would otherwise keep the
              pointer "inside" the nav, so the menu could not close when the
              pointer moved to either side of the panel. Only the panel's own
              width is interactive, and its top padding stays inside the
              trigger-to-panel bridge. */}
          <div className="pointer-events-none mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div
              className="pointer-events-auto pt-2"
              onMouseEnter={clearClose}
              onMouseLeave={scheduleClose}
            >
              <MegaPanel
                active={active}
                data={menu}
                failed={failed}
                onNavigate={() => setActive(null)}
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

interface PanelData {
  loading: boolean;
  failed: boolean;
  deviceCount: number | null;
  cardBrands: readonly { id: string; name: string }[];
  cardRoms: RomSummary[];
}

// Every curated ROM is a card, in the curated order, so the menu is a way in,
// not a leaderboard.
const MENU_ROM_IDS: string[] = MENU_ROMS.map((rom) => rom.id);

/** Each trigger gets its own section, and the data one footer line away. */
function MegaPanel({
  active,
  data,
  failed,
  onNavigate,
}: {
  active: NavKind;
  data: MenuData | null;
  failed: boolean;
  onNavigate: () => void;
}) {
  const summary = data?.summary ?? null;
  const roms = data?.roms ?? null;

  const sortedRoms = roms
    ? roms
        .filter((rom) => rom.status !== "discontinued")
        .sort(
          (a, b) =>
            b.deviceCount - a.deviceCount || a.name.localeCompare(b.name),
        )
    : null;

  const panel: PanelData = {
    loading: !data && !failed,
    failed,
    deviceCount: summary?.deviceCount ?? null,
    cardBrands: MENU_BRANDS,
    cardRoms: MENU_ROM_IDS.map((id) =>
      sortedRoms?.find((rom) => rom.id === id),
    ).filter((rom): rom is RomSummary => rom !== undefined),
  };

  return (
    <div className="max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-xl sm:p-6">
      {active === "devices" && (
        <DevicesPanel data={panel} onNavigate={onNavigate} />
      )}
      {active === "brands" && (
        <BrandsPanel data={panel} onNavigate={onNavigate} />
      )}
      {active === "roms" && <RomsPanel data={panel} onNavigate={onNavigate} />}
    </div>
  );
}

function DevicesPanel({
  data,
  onNavigate,
}: {
  data: PanelData;
  onNavigate: () => void;
}) {
  const { deviceCount, loading, failed } = data;

  return (
    <div className="flex flex-col gap-3">
      <Shortcuts loading={loading} failed={failed}>
        <div className="grid grid-cols-2 gap-1.5 xl:grid-cols-4">
          <PanelCard
            to="/devices?hardened=1"
            title="Hardened"
            subtitle="Patches, relock and mitigations"
            icon={<Shield className="size-5" />}
            onNavigate={onNavigate}
          />
          <PanelCard
            to="/devices?relock=supported"
            title="Relock supported"
            subtitle="Devices with a documented relock path"
            icon={<Lock className="size-5" />}
            onNavigate={onNavigate}
          />
          <PanelCard
            to="/devices?updated=90"
            title="Recently updated"
            subtitle="Newest build in the last 90 days"
            icon={<Clock className="size-5" />}
            onNavigate={onNavigate}
          />
          <PanelCard
            to="/devices"
            title="All devices"
            subtitle={
              deviceCount === null
                ? "Search by name or codename"
                : `${formatNumber(deviceCount)} devices, searchable`
            }
            icon={<LayoutGrid className="size-5" />}
            onNavigate={onNavigate}
          />
        </div>
      </Shortcuts>

      <PanelFooter>
        <FootLink to="/devices?roms=1" onNavigate={onNavigate}>
          Devices with ROMs
        </FootLink>
        <FootLink
          to="/data"
          onNavigate={onNavigate}
          className="ml-auto"
          icon={<Database className="size-3.5" aria-hidden="true" />}
        >
          Data & API
        </FootLink>
      </PanelFooter>
    </div>
  );
}

function BrandsPanel({
  data,
  onNavigate,
}: {
  data: PanelData;
  onNavigate: () => void;
}) {
  const { cardBrands } = data;

  return (
    <div className="flex flex-col gap-3">
      {/* The list is curated, not read from the data, so it is right before
          the request returns and stays right if it fails. */}
      <div className="grid grid-cols-3 gap-x-4">
        {cardBrands.map((brand) => (
          <MenuRow
            key={brand.id}
            to={`/devices/${brand.id}`}
            onNavigate={onNavigate}
          >
            <span className="truncate font-medium">{brand.name}</span>
          </MenuRow>
        ))}
        <FootLink to="/brands" onNavigate={onNavigate} className="self-center">
          All brands
        </FootLink>
      </div>

      <PanelFooter>
        <FootLink
          to="/data"
          onNavigate={onNavigate}
          className="ml-auto"
          icon={<Database className="size-3.5" aria-hidden="true" />}
        >
          Data & API
        </FootLink>
      </PanelFooter>
    </div>
  );
}

function RomsPanel({
  data,
  onNavigate,
}: {
  data: PanelData;
  onNavigate: () => void;
}) {
  const { cardRoms, loading, failed } = data;

  return (
    <div className="flex flex-col gap-3">
      <Shortcuts loading={loading} failed={failed}>
        <div className="grid grid-cols-3 gap-1.5">
          {cardRoms.map((rom) => (
            <RomCard key={rom.id} rom={rom} onNavigate={onNavigate} />
          ))}
          <PanelCard
            to="/roms"
            title="All ROMs"
            subtitle="Full catalogue"
            icon={<LayoutGrid className="size-5" />}
            onNavigate={onNavigate}
          />
        </div>
      </Shortcuts>

      <PanelFooter>
        <FootLink
          to="/data"
          onNavigate={onNavigate}
          className="ml-auto"
          icon={<Database className="size-3.5" aria-hidden="true" />}
        >
          Data & API
        </FootLink>
      </PanelFooter>
    </div>
  );
}

function RomCard({
  rom,
  onNavigate,
}: {
  rom: RomSummary;
  onNavigate: () => void;
}) {
  const logo = ROM_BOLD_MARKS[rom.id] ?? ROM_LOGOS[rom.id];

  return (
    <PanelCard
      to={`/roms/${rom.id}`}
      title={rom.name}
      subtitle={
        MENU_ROMS.find((entry) => entry.id === rom.id)?.description ?? ""
      }
      icon={
        logo ? (
          <RomGlyph
            id={rom.id}
            src={logo}
            className={
              rom.id === "lineageos"
                ? "h-3 w-7"
                : rom.id === "grapheneos"
                  ? "size-6"
                  : "size-5"
            }
          />
        ) : (
          <span className="text-sm font-bold">{rom.name.charAt(0)}</span>
        )
      }
      onNavigate={onNavigate}
    />
  );
}

function PanelFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-1 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-border pt-3">
      {children}
    </div>
  );
}

function Shortcuts({
  loading,
  failed,
  children,
}: {
  loading: boolean;
  failed: boolean;
  children: ReactNode;
}) {
  if (failed) {
    return (
      <p className="px-2 py-1 text-xs text-muted-foreground">
        Shortcuts unavailable.
      </p>
    );
  }
  if (loading) {
    return <p className="px-2 py-1 text-xs text-muted-foreground">Loading…</p>;
  }
  return <div className="flex flex-col">{children}</div>;
}

function MenuRow({
  to,
  onNavigate,
  children,
}: {
  to: string;
  onNavigate: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className="inline-flex w-fit max-w-full items-center gap-3 rounded-lg px-2 py-1.5 text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {children}
    </Link>
  );
}

function FootLink({
  to,
  onNavigate,
  className,
  icon,
  children,
}: {
  to: string;
  onNavigate: () => void;
  className?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded text-sm font-semibold text-brand outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      {icon}
      {children}
      <ArrowRight className="size-3.5" aria-hidden="true" />
    </Link>
  );
}
