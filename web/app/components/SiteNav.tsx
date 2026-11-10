import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router";
import { fetchBrands, fetchRomSummaries } from "@/lib/data";
import { NAV_ITEMS, NAV_PRELOADS, type NavKind } from "@/lib/nav";
import { cn, formatNumber } from "@/lib/utils";
import type { BrandSummary, RomSummary } from "@/lib/types";

/**
 * One fixed panel under the nav, shared by every section. Hovering an item
 * swaps the panel content in place, so adding a section does not add another
 * floating surface.
 */
export default function SiteNav() {
  const [active, setActive] = useState<NavKind | null>(null);
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
  // next Tab walks the shortcuts instead of the other nav items.
  useEffect(() => {
    if (active && focusOnOpen.current) {
      focusOnOpen.current = false;
      panelRef.current?.focus();
    }
  }, [active]);

  const clearClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  };

  const open = (kind: NavKind) => {
    clearClose();
    setActive(kind);
  };

  const scheduleClose = () => {
    clearClose();
    closeTimer.current = window.setTimeout(() => setActive(null), 120);
  };

  return (
    <nav
      ref={navRef}
      aria-label="Main"
      data-nojs-hide
      className="relative ml-2 hidden items-center gap-1 md:flex"
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
          <div
            key={item.to}
            className="flex items-center"
            // Open on real pointer movement, not `mouseenter`: browsers re-fire
            // hover when layout or scroll changes under a stationary pointer,
            // which made the panel pop open after navigation.
            onPointerMove={() => {
              if (active === item.kind) return;
              open(item.kind);
              void NAV_PRELOADS[item.to]?.().catch(() => {});
            }}
          >
            <NavLink
              ref={(element) => {
                linkRefs.current[item.kind] = element;
              }}
              to={item.to}
              prefetch="viewport"
              aria-expanded={isOpen}
              aria-controls={isOpen ? `nav-panel-${item.kind}` : undefined}
              onClick={() => setActive(null)}
              onKeyDown={(event) => {
                if (event.key !== "ArrowDown") return;
                event.preventDefault();
                focusOnOpen.current = true;
                open(item.kind);
              }}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : isOpen
                      ? "text-foreground"
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
          id={`nav-panel-${active}`}
          tabIndex={-1}
          className="absolute top-full left-0 z-20 pt-2 outline-none"
          onMouseEnter={clearClose}
          onMouseLeave={scheduleClose}
        >
          <div className="w-[34rem] max-w-[calc(100vw-8rem)] rounded-2xl border border-border bg-card p-3 shadow-xl">
            {active === "devices" ? (
              <DevicesPanel onNavigate={() => setActive(null)} />
            ) : (
              <RomsPanel onNavigate={() => setActive(null)} />
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function PanelHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 pt-1 pb-2 text-xs font-semibold text-muted-foreground">
      {children}
    </p>
  );
}

function Row({
  to,
  onClick,
  children,
}: {
  to: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {children}
    </Link>
  );
}

function DevicesPanel({ onNavigate }: { onNavigate: () => void }) {
  const [brands, setBrands] = useState<BrandSummary[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchBrands()
      .then((data) => {
        if (cancelled) return;
        setBrands(
          [...data]
            .sort(
              (a, b) =>
                b.withRoms - a.withRoms ||
                b.deviceCount - a.deviceCount ||
                a.vendorName.localeCompare(b.vendorName),
            )
            .slice(0, 8),
        );
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <PanelHeader>Top brands by ROM coverage</PanelHeader>
      {brands ? (
        <ul className="grid grid-cols-2 gap-0.5">
          {brands.map((brand) => (
            <li key={brand.vendor}>
              <Row to={`/devices/${brand.vendor}`} onClick={onNavigate}>
                <span className="truncate font-medium">{brand.vendorName}</span>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                  {formatNumber(brand.withRoms)} with ROMs
                </span>
              </Row>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-2 py-6 text-sm text-muted-foreground">
          {failed ? "Shortcuts unavailable." : "Loading…"}
        </p>
      )}
      <div className="mt-2 flex gap-4 border-t border-border px-2 pt-2 text-xs font-semibold">
        <Link
          to="/devices"
          onClick={onNavigate}
          className="text-brand hover:underline"
        >
          All devices
        </Link>
        <Link
          to="/brands"
          onClick={onNavigate}
          className="text-brand hover:underline"
        >
          All brands
        </Link>
      </div>
    </div>
  );
}

function RomsPanel({ onNavigate }: { onNavigate: () => void }) {
  const [roms, setRoms] = useState<RomSummary[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchRomSummaries()
      .then((data) => {
        if (!cancelled) setRoms(data.slice(0, 8));
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <PanelHeader>Most supported ROMs</PanelHeader>
      {roms ? (
        <ul className="grid grid-cols-2 gap-0.5">
          {roms.map((rom) => (
            <li key={rom.id}>
              <Row to={`/roms/${rom.id}`} onClick={onNavigate}>
                <span className="truncate font-medium">{rom.name}</span>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                  {formatNumber(rom.deviceCount)}
                </span>
              </Row>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-2 py-6 text-sm text-muted-foreground">
          {failed ? "Shortcuts unavailable." : "Loading…"}
        </p>
      )}
      <div className="mt-2 flex gap-4 border-t border-border px-2 pt-2 text-xs font-semibold">
        <Link
          to="/roms"
          onClick={onNavigate}
          className="text-brand hover:underline"
        >
          All ROMs
        </Link>
        <Link
          to="/data"
          onClick={onNavigate}
          className="text-brand hover:underline"
        >
          Data API
        </Link>
      </div>
    </div>
  );
}
