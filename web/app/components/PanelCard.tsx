import type { ReactNode } from "react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

/**
 * A shortcut that deserves more than a row: an icon tile, a sentence of
 * context and the same hover language as the panels. Shared by the desktop
 * mega menu and the mobile sheet so the two cannot drift. The icon and the
 * subtitle are optional, for lists whose items carry only a name.
 */
export function PanelCard({
  to,
  title,
  subtitle,
  icon,
  onNavigate,
  className,
}: {
  to: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onNavigate: () => void;
  className?: string;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={cn(
        "group flex min-w-0 items-center gap-3 rounded-xl p-2.5 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      {icon && (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold">{title}</span>
        {subtitle && (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        )}
      </span>
    </Link>
  );
}
