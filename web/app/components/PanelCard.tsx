import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

/**
 * A shortcut that deserves more than a row: an icon tile, a sentence of
 * context and the same hover language as the panels. Shared by the desktop
 * mega menu and the mobile sheet so the two cannot drift.
 */
export function PanelCard({
  to,
  title,
  subtitle,
  icon,
  onNavigate,
}: {
  to: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  onNavigate: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className="group mb-1.5 flex min-w-0 items-center gap-3 rounded-xl border border-border bg-muted/40 p-2.5 outline-none transition-colors hover:border-brand/40 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
        {icon}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold">{title}</span>
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </span>
      <ArrowRight
        className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}
