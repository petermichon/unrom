import { cn } from "@/lib/utils";
import type { RomStatus } from "@/lib/types";

const STATUS_LABELS: Record<RomStatus, string> = {
  active: "Active",
  discontinued: "Discontinued",
  unknown: "Unknown",
};

/**
 * Whether a project still ships builds, as a compact pill. The `panel` tone
 * sits on the ROM hero, where the palette's accent and muted tokens are taken
 * by the panel itself.
 */
export function StatusPill({
  status,
  tone = "default",
}: {
  status: RomStatus;
  tone?: "default" | "panel";
}) {
  return (
    <span
      className={cn(
        "w-fit shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tone === "panel"
          ? status === "active"
            ? "bg-panel-foreground/15 text-panel-foreground"
            : "bg-panel-foreground/10 text-panel-foreground/70"
          : status === "active"
            ? "bg-accent text-accent-foreground"
            : "bg-muted text-muted-foreground",
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
