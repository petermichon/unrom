import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Database } from "lucide-react";
import { Link, NavLink } from "react-router";
import { NAV_ITEMS, NAV_PRELOADS, type NavKind } from "@/lib/nav";
import {
  BrandMenuCards,
  DeviceMenuCards,
  RomMenuCards,
} from "@/components/MenuCards";
import { cn } from "@/lib/utils";

/**
 * One header-width panel shared by every section. The trigger opens the whole
 * directory, so Brands and Data are one hover away instead of living in a
 * submenu; the list in each column is the shortcut, the footer link is the
 * full index.
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
  // next Tab walks the shortcuts instead of the other triggers.
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
              <MegaPanel active={active} onNavigate={() => setActive(null)} />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

/** Each trigger gets its own section, and the data one footer line away. */
function MegaPanel({
  active,
  onNavigate,
}: {
  active: NavKind;
  onNavigate: () => void;
}) {
  return (
    <div className="max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-xl sm:p-6">
      {active === "devices" && <DevicesPanel onNavigate={onNavigate} />}
      {active === "brands" && <BrandsPanel onNavigate={onNavigate} />}
      {active === "roms" && <RomsPanel onNavigate={onNavigate} />}
    </div>
  );
}

function DevicesPanel({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <DeviceMenuCards onNavigate={onNavigate} className="grid-cols-4" />

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

function BrandsPanel({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <BrandMenuCards onNavigate={onNavigate} className="grid-cols-4" />

      <PanelFooter>
        <FootLink to="/brands" onNavigate={onNavigate}>
          All brands
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

function RomsPanel({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <RomMenuCards onNavigate={onNavigate} className="grid-cols-3" />

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

function PanelFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-1 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-border pt-3">
      {children}
    </div>
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
        "inline-flex w-fit items-center gap-1 rounded text-sm font-semibold text-foreground outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      {icon}
      {children}
      <ArrowRight className="size-3.5" aria-hidden="true" />
    </Link>
  );
}
