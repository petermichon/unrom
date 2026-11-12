import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Link, NavLink } from "react-router";
import {
  fetchBrands,
  fetchDevicesPage,
  fetchRomSummaries,
  fetchSummary,
} from "@/lib/data";
import { deviceName } from "@/lib/devices";
import { NAV_ITEMS, NAV_PRELOADS, type NavKind } from "@/lib/nav";
import { cn, formatNumber } from "@/lib/utils";
import type {
  BrandSummary,
  BrowseDevice,
  RomSummary,
  Summary,
} from "@/lib/types";

interface MenuData {
  summary: Summary;
  brands: BrandSummary[];
  roms: RomSummary[];
  devices: BrowseDevice[];
}

const GITHUB_URL = "https://github.com/petermichon/unrom";

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
    Promise.all([
      fetchSummary(),
      fetchBrands(),
      fetchRomSummaries(),
      fetchDevicesPage({ sort: "roms", limit: 50, offset: 0 })
        .then((page) => {
          const seenGroups = new Set<string>();
          const seenNames = new Set<string>();
          return page.devices
            .filter((device) => {
              const group = (
                device.group.length ? device.group : [device.codename]
              )
                .slice()
                .sort()
                .join("/");
              const name = deviceName(device).toLowerCase();
              if (seenGroups.has(group) || seenNames.has(name)) return false;
              seenGroups.add(group);
              seenNames.add(name);
              return true;
            })
            .slice(0, 12);
        })
        .catch(() => [] as BrowseDevice[]),
    ])
      .then(([summary, brands, roms, devices]) => {
        if (!cancelled) setMenu({ summary, brands, roms, devices });
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
    if (active) open(next.kind);
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
          className="fixed inset-x-0 top-16 z-20 pt-2 outline-none"
          onMouseEnter={clearClose}
          onMouseLeave={scheduleClose}
        >
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <MegaPanel
              active={active}
              data={menu}
              failed={failed}
              onNavigate={() => setActive(null)}
            />
          </div>
        </div>
      )}
    </nav>
  );
}

interface PanelData {
  loading: boolean;
  failed: boolean;
  topDevices: BrowseDevice[] | null;
  topBrands: BrandSummary[] | null;
  topRoms: RomSummary[] | null;
}

/** Each trigger gets its own section, with the other directories one rail away. */
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
  const brands = data?.brands ?? null;
  const roms = data?.roms ?? null;
  const devices = data?.devices ?? null;

  const sortedBrands = brands
    ? [...brands].sort(
        (a, b) =>
          b.withRoms - a.withRoms ||
          b.deviceCount - a.deviceCount ||
          a.vendorName.localeCompare(b.vendorName),
      )
    : null;
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
    topDevices: devices?.length ? devices : (summary?.topDevices ?? null),
    topBrands: sortedBrands?.slice(0, 12) ?? null,
    topRoms: sortedRoms?.slice(0, 10) ?? null,
  };

  return (
    <div className="max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-xl sm:p-6">
      <div className="grid min-h-52 grid-cols-[minmax(0,1fr)_18rem] gap-10">
        {active === "devices" && (
          <DevicesPanel data={panel} onNavigate={onNavigate} />
        )}
        {active === "brands" && (
          <BrandsPanel data={panel} onNavigate={onNavigate} />
        )}
        {active === "roms" && (
          <RomsPanel data={panel} onNavigate={onNavigate} />
        )}
        {active === "data" && <DataPanel onNavigate={onNavigate} />}
      </div>
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
  const { topDevices, loading, failed } = data;

  return (
    <>
      <Column title="Top devices">
        <Shortcuts loading={loading} failed={failed}>
          <div className="grid grid-cols-2 gap-x-6">
            {topDevices?.slice(0, 12).map((device) => (
              <MenuRow
                key={`${device.vendor}/${device.codename}`}
                to={`/devices/${device.vendor}/${device.codename}`}
                onNavigate={onNavigate}
              >
                <span className="truncate font-medium">
                  {deviceName(device)}
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                  {formatNumber(device.roms.length)} ROMs
                </span>
              </MenuRow>
            ))}
          </div>
        </Shortcuts>
        <FootLink to="/devices" onNavigate={onNavigate}>
          All devices
        </FootLink>
      </Column>
      <Rail>
        <RailLink to="/devices?roms=1" onNavigate={onNavigate}>
          Devices with ROMs
        </RailLink>
        <RailLink to="/data" onNavigate={onNavigate}>
          Data & API
        </RailLink>
      </Rail>
    </>
  );
}

function BrandsPanel({
  data,
  onNavigate,
}: {
  data: PanelData;
  onNavigate: () => void;
}) {
  const { topBrands, loading, failed } = data;

  return (
    <>
      <Column title="Top brands by ROM coverage">
        <Shortcuts loading={loading} failed={failed}>
          <div className="grid grid-cols-2 gap-x-6">
            {topBrands?.map((brand) => (
              <MenuRow
                key={brand.vendor}
                to={`/devices/${brand.vendor}`}
                onNavigate={onNavigate}
              >
                <span className="truncate font-medium">{brand.vendorName}</span>
                <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                  {formatNumber(brand.withRoms)} with ROMs
                </span>
              </MenuRow>
            ))}
          </div>
        </Shortcuts>
        <FootLink to="/brands" onNavigate={onNavigate}>
          All brands
        </FootLink>
      </Column>
      <Rail>
        <RailLink to="/devices?roms=1" onNavigate={onNavigate}>
          Devices with ROMs
        </RailLink>
        <RailLink to="/data" onNavigate={onNavigate}>
          Data & API
        </RailLink>
      </Rail>
    </>
  );
}

function RomsPanel({
  data,
  onNavigate,
}: {
  data: PanelData;
  onNavigate: () => void;
}) {
  const { topRoms, loading, failed } = data;

  return (
    <>
      <Column title="Active ROMs by support">
        <Shortcuts loading={loading} failed={failed}>
          <div className="grid grid-cols-2 gap-x-6">
            {topRoms?.map((rom) => (
              <MenuRow
                key={rom.id}
                to={`/roms/${rom.id}`}
                onNavigate={onNavigate}
              >
                <span className="truncate font-medium">{rom.name}</span>
                <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                  {formatNumber(rom.deviceCount)} devices
                </span>
              </MenuRow>
            ))}
          </div>
        </Shortcuts>
        <FootLink to="/roms" onNavigate={onNavigate}>
          All ROMs
        </FootLink>
      </Column>
      <Rail>
        <RailLink to="/devices?roms=1" onNavigate={onNavigate}>
          Devices with ROMs
        </RailLink>
        <RailLink to="/data" onNavigate={onNavigate}>
          Data & API
        </RailLink>
      </Rail>
    </>
  );
}

function DataPanel({ onNavigate }: { onNavigate: () => void }) {
  return (
    <>
      <Column title="Open data">
        <div className="grid grid-cols-3 gap-x-8">
          <div className="flex min-w-0 flex-col gap-1">
            <Subhead>API</Subhead>
            <MenuRow to="/data" onNavigate={onNavigate}>
              <span className="font-medium">Data page</span>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                Overview
              </span>
            </MenuRow>
            <MenuAnchor href="/api" target="_blank" onNavigate={onNavigate}>
              <span className="font-medium">REST API</span>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                Endpoints
              </span>
            </MenuAnchor>
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <Subhead>Exports</Subhead>
            <MenuAnchor
              href="/api/export/json"
              download="unrom.json"
              onNavigate={onNavigate}
            >
              <span className="font-medium">JSON export</span>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                Full dataset
              </span>
            </MenuAnchor>
            <MenuAnchor
              href="/api/export/sqlite"
              download="unrom.sqlite"
              onNavigate={onNavigate}
            >
              <span className="font-medium">SQLite export</span>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                Database
              </span>
            </MenuAnchor>
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <Subhead>Project</Subhead>
            <MenuRow to="/legal" onNavigate={onNavigate}>
              <span className="font-medium">Legal</span>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                Licence
              </span>
            </MenuRow>
            <MenuAnchor
              href={GITHUB_URL}
              target="_blank"
              onNavigate={onNavigate}
            >
              <span className="font-medium">GitHub</span>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                Source
              </span>
            </MenuAnchor>
          </div>
        </div>
      </Column>
      <Rail>
        <RailLink to="/devices" onNavigate={onNavigate}>
          All devices
        </RailLink>
        <RailLink to="/brands" onNavigate={onNavigate}>
          All brands
        </RailLink>
        <RailLink to="/roms" onNavigate={onNavigate}>
          All ROMs
        </RailLink>
      </Rail>
    </>
  );
}

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="px-2 pb-1 text-xs font-semibold text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

function Subhead({ children }: { children: ReactNode }) {
  return (
    <p className="px-2 pb-1 text-xs font-semibold text-muted-foreground">
      {children}
    </p>
  );
}

function Rail({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 self-start rounded-xl bg-muted/50 p-4">
      <p className="text-xs font-semibold text-muted-foreground">More</p>
      {children}
    </div>
  );
}

function RailLink({
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
      className="inline-flex w-fit items-center gap-1 rounded text-sm font-semibold text-brand outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {children}
      <ArrowRight className="size-3.5" aria-hidden="true" />
    </Link>
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
      className="flex min-w-0 items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {children}
    </Link>
  );
}

function MenuAnchor({
  href,
  target,
  download,
  onNavigate,
  children,
}: {
  href: string;
  target?: string;
  download?: string;
  onNavigate: () => void;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target={target}
      rel={target === "_blank" ? "noreferrer" : undefined}
      download={download}
      onClick={onNavigate}
      className="flex min-w-0 items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {children}
    </a>
  );
}

function FootLink({
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
      className="mt-1 inline-flex w-fit items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-semibold text-brand outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {children}
      <ArrowRight className="size-3.5" aria-hidden="true" />
    </Link>
  );
}
